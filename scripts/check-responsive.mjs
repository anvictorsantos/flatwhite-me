#!/usr/bin/env node
import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const routes = [
  '/',
  '/mapa',
  '/cafe/starbucks-2',
  '/lista',
  '/sugerir',
  '/sobre',
  '/como-funciona',
  '/privacidade',
  '/contacto',
  '/admin',
  '/top',
  '/entrar',
  '/best-flat-white-lisbon',
]
const widths = [320, 390, 768, 1024, 1280]

const browser = await chromium.launch()
let failures = 0

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 800 } })
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 20000 })
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    if (scrollWidth > innerWidth) {
      failures += 1
      console.error(`${width}px ${route}: horizontal scroll ${scrollWidth} > ${innerWidth}`)
    }
  }
  await page.close()
}

await browser.close()

if (failures > 0) {
  console.error(`${failures} overflow failure(s)`)
  process.exit(1)
}
console.log(`No horizontal overflow across ${routes.length} routes at ${widths.join(', ')} px`)
