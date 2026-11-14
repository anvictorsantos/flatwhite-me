import { afterEach, describe, expect, it, vi } from 'vitest'
import { geocodeAddress, reverseGeocode } from '@/lib/geocode'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('geocodeAddress', () => {
  it('returns the first match as numbers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([{ lat: '38.7080', lon: '-9.1400' }]))),
    )
    expect(await geocodeAddress('Rua do Ouro 1, Lisboa')).toEqual({
      latitude: 38.708,
      longitude: -9.14,
    })
  })

  it('returns null when there is no match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('[]')),
    )
    expect(await geocodeAddress('Rua Inexistente 999')).toBeNull()
  })

  it('returns null when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 500 })),
    )
    expect(await geocodeAddress('Rua do Ouro 1, Lisboa')).toBeNull()
  })
})

describe('reserveNominatimSlot', () => {
  it('spaces requests one second apart', async () => {
    vi.resetModules()
    const { reserveNominatimSlot } = await import('@/lib/geocode')
    expect(reserveNominatimSlot(1000)).toBe(1000)
    expect(reserveNominatimSlot(1000)).toBe(2000)
    expect(reserveNominatimSlot(1500)).toBe(3000)
  })

  it('drops callers that would wait too long', async () => {
    vi.resetModules()
    const { reserveNominatimSlot } = await import('@/lib/geocode')
    expect(reserveNominatimSlot(0)).toBe(0)
    expect(reserveNominatimSlot(0)).toBe(1000)
    expect(reserveNominatimSlot(0)).toBe(2000)
    expect(reserveNominatimSlot(0)).toBe(3000)
    expect(reserveNominatimSlot(0)).toBeNull()
  })
})

describe('reverseGeocode', () => {
  it('returns the display name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ display_name: 'Rua do Ouro 1, Lisboa, Portugal' })),
      ),
    )
    expect(await reverseGeocode(38.708, -9.14)).toBe('Rua do Ouro 1, Lisboa, Portugal')
  })

  it('returns null when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 500 })),
    )
    expect(await reverseGeocode(38.708, -9.14)).toBeNull()
  })
})
