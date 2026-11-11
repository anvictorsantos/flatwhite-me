import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { reportSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const parsed = reportSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'invalid' }, { status: 400 })

  const rating = await prisma.rating.findUnique({
    where: { id: parsed.data.ratingId },
    select: { id: true, status: true },
  })
  if (!rating || rating.status !== 'visible') {
    return Response.json({ error: 'rating_not_found' }, { status: 404 })
  }

  await prisma.ratingReport.upsert({
    where: {
      ratingId_reporterUserId: {
        ratingId: rating.id,
        reporterUserId: user.id,
      },
    },
    create: {
      ratingId: rating.id,
      reporterUserId: user.id,
      reason: parsed.data.reason,
    },
    update: { reason: parsed.data.reason },
  })
  return Response.json({ status: 'open' }, { status: 201 })
}
