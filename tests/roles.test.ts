import { describe, expect, it } from 'vitest'
import { effectiveRole } from '@/lib/roles'

describe('effectiveRole', () => {
  it('keeps a non-admin as a user', () => {
    expect(effectiveRole('user', 'a@example.com', ['a@example.com'])).toBe('user')
  })

  it('keeps an admin whose address is listed, case-insensitively', () => {
    expect(effectiveRole('admin', 'Owner@Example.com', ['owner@example.com'])).toBe('admin')
  })

  it('downgrades an admin whose address was removed', () => {
    expect(effectiveRole('admin', 'old@example.com', ['owner@example.com'])).toBe('user')
    expect(effectiveRole('admin', null, ['owner@example.com'])).toBe('user')
  })

  it('keeps stored roles when ADMIN_EMAILS is empty', () => {
    expect(effectiveRole('admin', 'seeded@example.invalid', [])).toBe('admin')
  })
})
