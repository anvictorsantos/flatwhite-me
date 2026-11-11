#!/usr/bin/env node
import { spawn } from 'node:child_process'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

const port = 3101
const base = process.env.BASE_URL ?? `http://localhost:${port}`
const routes = ['/', '/cafe/starbucks-2', '/best-flat-white-lisbon']

async function reachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
    return response.ok
  } catch {
    return false
  }
}

let server = null
if (!(await reachable(base))) {
  server = spawn('npm', ['run', 'start', '--', '-p', String(port)], {
    stdio: 'ignore',
    detached: false,
  })
  let ready = false
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (await reachable(base)) {
      ready = true
      break
    }
  }
  if (!ready) {
    server.kill()
    throw new Error('Server did not start on port ' + port)
  }
}

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
})
let failures = 0

try {
  for (const route of routes) {
    const result = await lighthouse(base + route, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
    })
    if (!result) throw new Error('Lighthouse returned no result for ' + route)
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, category]) => [
        key,
        Math.round((category.score ?? 0) * 100),
      ]),
    )
    console.log(
      `${route}  perf ${scores.performance}  a11y ${scores.accessibility}  best ${scores['best-practices']}  seo ${scores.seo}`,
    )
    if ((scores.accessibility ?? 0) < 95 || (scores.seo ?? 0) < 95) failures += 1
  }
} finally {
  await chrome.kill()
  if (server) server.kill()
}

if (failures > 0) {
  console.error(`${failures} route(s) below 95 accessibility or SEO`)
  process.exit(1)
}
console.log('Lighthouse accessibility and SEO >= 95 on all routes')
