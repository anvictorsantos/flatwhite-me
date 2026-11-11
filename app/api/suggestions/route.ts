import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { geocodeAddress } from '@/lib/geocode'
import { suggestionSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const body: unknown = await request.json().catch(() => null)
  const parsed = suggestionSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'invalid', issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data
  const coordinates =
    typeof data.latitude === 'number' && typeof data.longitude === 'number'
      ? { latitude: data.latitude, longitude: data.longitude }
      : await geocodeAddress(data.addressLine)
  if (!coordinates) {
    return Response.json({ error: 'address_not_found' }, { status: 400 })
  }

  const suggestion = await prisma.cafeSuggestion.create({
    data: {
      userId: user.id,
      name: data.name,
      addressLine: data.addressLine,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      note: data.note ?? null,
    },
    select: { id: true, status: true },
  })
  return Response.json(suggestion, { status: 201 })
}
