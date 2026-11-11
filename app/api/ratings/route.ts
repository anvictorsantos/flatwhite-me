import { getSessionUser } from '@/lib/auth'
import { refreshCafeScores } from '@/lib/cafes-db'
import { prisma } from '@/lib/db'
import { ratingSchema } from '@/lib/validation'

const DAY_MS = 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const body: unknown = await request.json().catch(() => null)
  const parsed = ratingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'invalid', issues: parsed.error.issues }, { status: 400 })
  }
  const data = parsed.data

  const cafe = await prisma.cafe.findUnique({
    where: { slug: data.cafeSlug },
    select: { id: true, status: true },
  })
  if (!cafe || cafe.status !== 'active') {
    return Response.json({ error: 'cafe_not_found' }, { status: 404 })
  }

  const existing = await prisma.rating.findFirst({
    where: { userId: user.id, cafeId: cafe.id },
    select: {
      id: true,
      taste: true,
      milkTexture: true,
      temperature: true,
      value: true,
      priceCents: true,
      milkType: true,
      size: true,
      visitedOn: true,
      note: true,
      createdAt: true,
    },
  })

  const noteLocked =
    existing !== null &&
    existing.note !== null &&
    Date.now() - existing.createdAt.getTime() > 30 * DAY_MS
  if (noteLocked && (data.note ?? null) !== existing.note) {
    return Response.json({ error: 'note_locked' }, { status: 409 })
  }

  if (!existing) {
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)
    const today = await prisma.rating.count({
      where: { userId: user.id, createdAt: { gte: startOfDay } },
    })
    if (today >= 20) return Response.json({ error: 'daily_cap' }, { status: 429 })
  }

  const values = {
    taste: data.taste,
    milkTexture: data.milkTexture,
    temperature: data.temperature,
    value: data.value,
    priceCents: data.priceCents,
    milkType: data.milkType,
    size: data.size,
    visitedOn: new Date(data.visitedOn + 'T00:00:00Z'),
    note: data.note ?? null,
  }

  const ratingId = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.ratingRevision.create({
        data: {
          ratingId: existing.id,
          snapshot: {
            taste: existing.taste,
            milkTexture: existing.milkTexture,
            temperature: existing.temperature,
            value: existing.value,
            priceCents: existing.priceCents,
            milkType: existing.milkType,
            size: existing.size,
            visitedOn: existing.visitedOn.toISOString().slice(0, 10),
            note: existing.note,
          },
        },
      })
      await tx.rating.update({ where: { id: existing.id }, data: values })
      return existing.id
    }
    const created = await tx.rating.create({
      data: { ...values, cafeId: cafe.id, userId: user.id },
      select: { id: true },
    })
    return created.id
  })

  await refreshCafeScores()

  return Response.json({ ratingId })
}
