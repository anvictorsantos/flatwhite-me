import { describe, expect, it } from 'vitest'
import { ratingSchema, suggestionSchema } from '@/lib/validation'

const today = new Date().toISOString().slice(0, 10)

const validRating = {
  cafeSlug: 'lume-coffee',
  taste: 4,
  milkTexture: 5,
  temperature: 4,
  value: 3,
  priceCents: 300,
  milkType: 'whole',
  size: 'regular',
  visitedOn: today,
}

describe('ratingSchema', () => {
  it('accepts a complete scorecard', () => {
    expect(ratingSchema.safeParse(validRating).success).toBe(true)
  })

  it('rejects a score outside 1–5', () => {
    expect(ratingSchema.safeParse({ ...validRating, taste: 6 }).success).toBe(false)
    expect(ratingSchema.safeParse({ ...validRating, taste: 0 }).success).toBe(false)
  })

  it('rejects a fractional score', () => {
    expect(ratingSchema.safeParse({ ...validRating, taste: 4.5 }).success).toBe(false)
  })

  it('rejects a date that does not exist in the calendar', () => {
    expect(ratingSchema.safeParse({ ...validRating, visitedOn: '2026-02-31' }).success).toBe(false)
  })

  it('rejects a future visit date', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    expect(ratingSchema.safeParse({ ...validRating, visitedOn: tomorrow }).success).toBe(false)
  })

  it('rejects a note over 280 characters', () => {
    expect(ratingSchema.safeParse({ ...validRating, note: 'a'.repeat(281) }).success).toBe(false)
  })

  it('rejects an unknown milk type', () => {
    expect(ratingSchema.safeParse({ ...validRating, milkType: 'soy' }).success).toBe(false)
  })
})

describe('suggestionSchema', () => {
  it('accepts a name and address', () => {
    expect(
      suggestionSchema.safeParse({ name: 'Café Novo', addressLine: 'Rua do Ouro 1' }).success,
    ).toBe(true)
  })

  it('rejects a suggestion without an address', () => {
    expect(suggestionSchema.safeParse({ name: 'Café Novo' }).success).toBe(false)
  })

  it('rejects a one-character name', () => {
    expect(suggestionSchema.safeParse({ name: 'A', addressLine: 'Rua do Ouro 1' }).success).toBe(
      false,
    )
  })

  it('rejects coordinates outside the world', () => {
    const base = { name: 'Café', addressLine: 'Rua do Ouro 1' }
    expect(suggestionSchema.safeParse({ ...base, latitude: 91 }).success).toBe(false)
    expect(suggestionSchema.safeParse({ ...base, longitude: -181 }).success).toBe(false)
  })
})
