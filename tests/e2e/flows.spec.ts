import { test, expect, type BrowserContext } from '@playwright/test'
import type { Client } from 'pg'
import { cleanup, connect, makeUser, seedUser, type TestUser } from './helpers'

test.describe.configure({ mode: 'serial' })

const baseURL = process.env.BASE_URL ?? 'http://localhost:3100'
const cafeSlug = 'starbucks-2'

let db: Client
let user: TestUser
let admin: TestUser
let deleting: TestUser
let suggestionName = ''
const createdCafeIds: string[] = []

async function contextWith(browser: import('@playwright/test').Browser, who: TestUser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await context.addCookies([{ name: 'fw_session', value: who.token, url: baseURL }])
  return context
}

async function fillRating(context: BrowserContext) {
  const page = await context.newPage()
  await page.goto(`/cafe/${cafeSlug}`)
  await page.getByRole('button', { name: 'Avaliar este café' }).click()
  const fieldsets = page.locator('fieldset')
  for (let index = 0; index < 4; index += 1) {
    await fieldsets.nth(index).getByRole('button', { name: '4', exact: true }).click()
  }
  return page
}

test.beforeAll(async () => {
  db = await connect()
  user = makeUser('user')
  admin = makeUser('admin')
  deleting = makeUser('user')
  await seedUser(db, user, 'user', 'E2E User')
  await seedUser(db, admin, 'admin', 'E2E Admin')
  await seedUser(db, deleting, 'user', 'E2E Delete')
})

test.afterAll(async () => {
  await cleanup(db, [user.id, admin.id, deleting.id], createdCafeIds)
  await db.end()
})

test('signed-out rating opens the sign-in gate', async ({ page }) => {
  await page.goto(`/cafe/${cafeSlug}`)
  await page.getByRole('button', { name: 'Avaliar este café' }).click()
  await expect(page.getByText('Entra para guardar e avaliar.')).toBeVisible()
})

test('signed-in user saves a rating and sees the confirmation', async ({ browser }) => {
  const context = await contextWith(browser, user)
  const page = await fillRating(context)
  await page.getByRole('button', { name: 'Guardar avaliação' }).click()
  await expect(page.getByText('Avaliação guardada')).toBeVisible()
  await page.getByRole('button', { name: 'Concluir' }).click()

  const rows = await db.query('select count(*)::int as n from "Rating" where "userId"=$1', [
    user.id,
  ])
  expect(rows.rows[0].n).toBe(1)
  await context.close()
})

test('saved café appears on the list and can be removed', async ({ browser }) => {
  const context = await contextWith(browser, user)
  const page = await context.newPage()
  await page.goto('/')
  const heart = page.getByRole('button', { name: /^Guardar / }).first()
  const name = (await heart.getAttribute('aria-label'))?.replace(/^Guardar /, '') ?? ''
  await heart.click()
  await expect(page.getByRole('button', { name: `Remover ${name} dos guardados` })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.goto('/lista')
  await expect(page.getByRole('button', { name: 'Remover dos guardados' })).toBeVisible()
  await page.getByRole('button', { name: 'Remover dos guardados' }).click()
  await expect(page.getByText('Ainda não guardaste cafés.')).toBeVisible()
  expect(name.length).toBeGreaterThan(0)
  await context.close()
})

test('suggestion form creates a pending suggestion', async ({ browser }) => {
  const context = await contextWith(browser, user)
  const page = await context.newPage()
  suggestionName = `Café E2E ${Date.now()}`
  await page.goto('/sugerir')
  await page.getByLabel('Nome do café').fill(suggestionName)
  await page.getByLabel('Morada (opcional)').fill('Rua E2E 1')
  await page.getByLabel('Latitude (opcional)').fill('38.72')
  await page.getByLabel('Longitude (opcional)').fill('-9.14')
  await page.getByRole('button', { name: 'Enviar sugestão' }).click()
  await expect(page.getByText('Obrigada pela sugestão.')).toBeVisible()

  const rows = await db.query('select status from "CafeSuggestion" where "userId"=$1', [user.id])
  expect(rows.rows[0]?.status).toBe('pending')
  await context.close()
})

test('admin approves the pending suggestion', async ({ browser }) => {
  const context = await contextWith(browser, admin)
  const page = await context.newPage()
  await page.goto('/admin')
  await expect(page.getByText('Rever antes de publicar.')).toBeVisible()
  const card = page.locator('article', { hasText: suggestionName })
  await card.getByRole('button', { name: 'Aprovar sugestão' }).click()
  await expect(page.getByText(suggestionName)).toHaveCount(0)

  const created = await db.query('select id from "Cafe" where name=$1', [suggestionName])
  expect(created.rowCount).toBe(1)
  if (created.rows[0]) createdCafeIds.push(created.rows[0].id)
  await context.close()
})

test('admin closes and reopens a café', async ({ browser }) => {
  const created = await db.query('select slug from "Cafe" where name=$1', [suggestionName])
  const slug = created.rows[0]?.slug
  expect(slug).toBeTruthy()

  const context = await contextWith(browser, admin)
  const page = await context.newPage()
  await page.goto(`/admin?cafe=${encodeURIComponent(suggestionName)}`)
  await page
    .locator('article', { hasText: suggestionName })
    .getByRole('button', { name: 'Fechar' })
    .click()
  await expect(page.getByText('Rever antes de publicar.')).toBeVisible()
  const closed = await page.request.get(`/cafe/${slug}`)
  expect(closed.status()).toBe(404)

  await page.goto(`/admin?cafe=${encodeURIComponent(suggestionName)}`)
  await page
    .locator('article', { hasText: suggestionName })
    .getByRole('button', { name: 'Reabrir' })
    .click()
  await expect(page.getByText('Rever antes de publicar.')).toBeVisible()
  const open = await page.request.get(`/cafe/${slug}`)
  expect(open.status()).toBe(200)
  await context.close()
})

test('account deletion removes the profile and keeps the user out', async ({ browser }) => {
  const context = await contextWith(browser, deleting)
  const page = await context.newPage()
  await page.goto('/privacidade')
  await page.getByRole('button', { name: 'Eliminar a minha conta' }).click()
  await page.getByRole('button', { name: 'Sim, eliminar' }).click()
  await page.waitForURL(`${baseURL}/`)

  const row = await db.query('select "deletedAt" is not null as deleted from "User" where id=$1', [
    deleting.id,
  ])
  expect(row.rows[0]?.deleted).toBe(true)
  await context.close()
})
