import { describe, expect, it } from 'vitest'
import { safeNextPath } from '@/lib/next-path'

describe('safeNextPath', () => {
  it('keeps a same-site path with query and hash', () => {
    expect(safeNextPath('/cafe/lume?from=map#notas')).toBe('/cafe/lume?from=map#notas')
  })

  it('falls back to the home page for empty values', () => {
    expect(safeNextPath(null)).toBe('/')
    expect(safeNextPath('')).toBe('/')
  })

  it('rejects absolute URLs and other schemes', () => {
    expect(safeNextPath('https://evil.example')).toBe('/')
    expect(safeNextPath('javascript:alert(1)')).toBe('/')
  })

  it('rejects protocol-relative URLs', () => {
    expect(safeNextPath('//evil.example')).toBe('/')
  })

  it('rejects backslash tricks', () => {
    expect(safeNextPath('/\\evil.example')).toBe('/')
  })

  it('rejects control characters the URL parser would strip', () => {
    expect(safeNextPath('/\t/evil.example')).toBe('/')
    expect(safeNextPath('/\n/evil.example')).toBe('/')
  })
})
