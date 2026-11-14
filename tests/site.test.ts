import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('siteUrl', () => {
  it('falls back when NEXT_PUBLIC_SITE_URL is blank', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '  ')
    const { siteUrl } = await import('@/lib/site')
    expect(siteUrl).toBe('https://flatwhite.me')
    expect(() => new URL(siteUrl)).not.toThrow()
  })

  it('falls back when NEXT_PUBLIC_SITE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined)
    const { siteUrl } = await import('@/lib/site')
    expect(siteUrl).toBe('https://flatwhite.me')
  })

  it('uses the configured value', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.example.com')
    const { siteUrl } = await import('@/lib/site')
    expect(siteUrl).toBe('https://staging.example.com')
  })
})
