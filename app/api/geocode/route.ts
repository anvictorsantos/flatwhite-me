import { getSessionUser } from '@/lib/auth'
import { geocodeAddress, reverseGeocode } from '@/lib/geocode'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const params = new URL(request.url).searchParams
  const latitude = Number(params.get('lat'))
  const longitude = Number(params.get('lon'))

  if (params.has('lat') && params.has('lon')) {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return Response.json({ error: 'invalid' }, { status: 400 })
    }
    const address = await reverseGeocode(latitude, longitude)
    if (!address) return Response.json({ error: 'not_found' }, { status: 404 })
    return Response.json({ address })
  }

  const address = params.get('address')?.trim() ?? ''
  if (address.length < 3) return Response.json({ error: 'invalid' }, { status: 400 })

  const coordinates = await geocodeAddress(address)
  if (!coordinates) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json(coordinates)
}
