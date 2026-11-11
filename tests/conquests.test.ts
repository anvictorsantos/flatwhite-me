import { describe, expect, it } from 'vitest'

process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/flatwhite'
const { mergeConquests } = await import('@/lib/conquests')

describe('mergeConquests', () => {
  it('always returns the 24 freguesias', () => {
    const conquests = mergeConquests([])
    expect(conquests).toHaveLength(24)
    expect(conquests.every((conquest) => conquest.total === 0)).toBe(true)
    expect(conquests.every((conquest) => !conquest.conquered)).toBe(true)
  })

  it('marks a freguesia conquered only when every café is visited', () => {
    const conquests = mergeConquests([
      { freguesia: 'benfica', total: 3, visited: 2 },
      { freguesia: 'ajuda', total: 2, visited: 2 },
    ])
    const benfica = conquests.find((conquest) => conquest.slug === 'benfica')
    const ajuda = conquests.find((conquest) => conquest.slug === 'ajuda')
    expect(benfica).toMatchObject({ total: 3, visited: 2, conquered: false })
    expect(ajuda).toMatchObject({ total: 2, visited: 2, conquered: true })
  })

  it('ignores rows for unknown freguesias', () => {
    const conquests = mergeConquests([{ freguesia: 'almada', total: 5, visited: 5 }])
    expect(conquests).toHaveLength(24)
    expect(conquests.some((conquest) => conquest.slug === 'almada')).toBe(false)
  })
})
