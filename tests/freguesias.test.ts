import { describe, expect, it } from 'vitest'
import { FREGUESIA_MAP, FREGUESIA_SHAPES, FREGUESIAS, freguesiaForPoint } from '@/lib/freguesias'

describe('FREGUESIAS', () => {
  it('lists the 24 freguesias of Lisboa with unique slugs', () => {
    expect(FREGUESIAS).toHaveLength(24)
    expect(new Set(FREGUESIAS.map((freguesia) => freguesia.slug)).size).toBe(24)
    expect(FREGUESIAS.map((freguesia) => freguesia.name)).toContain('Misericórdia')
  })
})

describe('FREGUESIA_SHAPES', () => {
  it('builds a valid map shape for every freguesia', () => {
    expect(FREGUESIA_SHAPES).toHaveLength(24)
    const slugs = new Set(FREGUESIA_SHAPES.map((shape) => shape.slug))
    for (const freguesia of FREGUESIAS) {
      expect(slugs.has(freguesia.slug)).toBe(true)
    }
    for (const shape of FREGUESIA_SHAPES) {
      expect(shape.d.startsWith('M')).toBe(true)
      expect(shape.width).toBeGreaterThan(0)
      expect(shape.height).toBeGreaterThan(0)
      expect(shape.cx).toBeGreaterThanOrEqual(0)
      expect(shape.cx).toBeLessThanOrEqual(FREGUESIA_MAP.width)
      expect(shape.cy).toBeGreaterThanOrEqual(0)
      expect(shape.cy).toBeLessThanOrEqual(FREGUESIA_MAP.height)
    }
  })
})

describe('freguesiaForPoint', () => {
  it('resolves a café in Benfica', () => {
    expect(freguesiaForPoint(38.75196, -9.20587)).toBe('benfica')
  })

  it('strips diacritics from the slug', () => {
    expect(freguesiaForPoint(38.74475, -9.17986)).toBe('sao-domingos-de-benfica')
  })

  it('returns null outside the municipality', () => {
    expect(freguesiaForPoint(38.777, -9.2196)).toBeNull()
  })
})
