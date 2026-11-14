import { siteUrl } from '@/lib/site'

export type Coordinates = { latitude: number; longitude: number }

const MIN_INTERVAL_MS = 1000
const MAX_WAIT_MS = 3000
let nextSlot = 0

// Nominatim bans clients that exceed ~1 request/second, so outbound calls are
// serialised server-wide instead of trusting per-request pacing.
export function reserveNominatimSlot(now: number): number | null {
  const slot = Math.max(now, nextSlot)
  if (slot - now > MAX_WAIT_MS) return null
  nextSlot = slot + MIN_INTERVAL_MS
  return slot
}

async function acquireNominatimSlot(): Promise<boolean> {
  const slot = reserveNominatimSlot(Date.now())
  if (slot === null) return false
  const wait = slot - Date.now()
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  return true
}

// shortcut: Nominatim allows ~1 req/s, upgrade to a paid geocoder if suggestions grow.
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!(await acquireNominatimSlot())) return null

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
  if (!(await acquireNominatimSlot())) return null

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
