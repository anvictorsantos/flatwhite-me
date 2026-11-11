import { test, expect } from '@playwright/test'

test('Google accepts the configured redirect URI', async ({ page }) => {
  test.skip(process.env.E2E_GOOGLE !== '1', 'Set E2E_GOOGLE=1 to call Google')

  await page.goto('/auth/google')
  await page.waitForURL(/accounts\.google\.com/, { timeout: 30_000 })
  const text = await page.locator('body').innerText()
  expect(text).not.toMatch(/redirect_uri_mismatch|Error 400/i)
  expect(text).toContain('FlatWhiteMe')
})
