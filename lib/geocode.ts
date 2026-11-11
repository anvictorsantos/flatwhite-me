import { siteUrl } from '@/lib/site'

export type Coordinates = { latitude: number; longitude: number }

// shortcut: Nominatim allows ~1 req/s, upgrade to a paid geocoder if suggestions grow.
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'pt')
  url.searchParams.set('q', address)

  // Nominatim usage policy requires an identifying User-Agent.
  const response = await fetch(url, {
    headers: { 'user-agent': `${siteUrl} (sugestões de cafés)` },
    signal: AbortSignal.timeout(5000),
  }).catch(() => null)
  if (!response?.ok) return null

  const results: unknown = await response.json().catch(() => null)
  const first = Array.isArray(results) ? (results[0] as { lat?: unknown; lon?: unknown }) : null
  const latitude = Number(first?.lat)
  const longitude = Number(first?.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return { latitude, longitude }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('accept-language', 'pt')

  const response = await fetch(url, {
    headers: { 'user-agent': `${siteUrl} (sugestões de cafés)` },
    signal: AbortSignal.timeout(5000),
  }).catch(() => null)
  if (!response?.ok) return null

  const result: unknown = await response.json().catch(() => null)
  const address = (result as { display_name?: unknown } | null)?.display_name
  return typeof address === 'string' && address.length > 0 ? address : null
}
