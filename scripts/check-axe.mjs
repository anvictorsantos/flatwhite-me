#!/usr/bin/env node
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.BASE_URL ?? 'http://localhost:3000'
const routes = ['/', '/mapa', '/cafe/starbucks-2', '/sobre', '/best-flat-white-lisbon']
const widths = [390, 1280]

const browser = await chromium.launch()
let failures = 0

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 844 } })
  const page = await context.newPage()
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 20000 })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    for (const violation of serious) {
      failures += 1
      console.error(`${width}px ${route}: ${violation.id} — ${violation.help}`)
      for (const node of violation.nodes.slice(0, 3)) {
        console.error(`  ${node.target.join(' ')}`)
      }
    }
  }
  await context.close()
}

await browser.close()

if (failures > 0) {
  console.error(`${failures} serious accessibility failure(s)`)
  process.exit(1)
}
console.log(`No serious axe violations across ${routes.length} routes at ${widths.join(', ')} px`)
