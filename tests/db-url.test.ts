import { describe, expect, it } from 'vitest'
import { normalizeSslMode } from '@/lib/db-url'

describe('normalizeSslMode', () => {
  it('rewrites the deprecated aliases to verify-full', () => {
    for (const mode of ['prefer', 'require', 'verify-ca']) {
      expect(normalizeSslMode(`postgresql://u:p@h/db?sslmode=${mode}`)).toBe(
        'postgresql://u:p@h/db?sslmode=verify-full',
      )
    }
  })

  it('keeps other query parameters intact', () => {
    expect(normalizeSslMode('postgresql://u:p@h/db?sslmode=require&channel_binding=require')).toBe(
      'postgresql://u:p@h/db?sslmode=verify-full&channel_binding=require',
    )
  })

  it('leaves explicit and absent sslmode untouched', () => {
    expect(normalizeSslMode('postgresql://u:p@h/db?sslmode=verify-full')).toBe(
      'postgresql://u:p@h/db?sslmode=verify-full',
    )
    expect(normalizeSslMode('postgresql://u:p@localhost:5432/db')).toBe(
      'postgresql://u:p@localhost:5432/db',
    )
  })
})
