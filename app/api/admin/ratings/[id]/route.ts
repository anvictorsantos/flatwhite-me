import { RatingStatus } from '@/generated/prisma/enums'
import { getSessionUser } from '@/lib/auth'
import { refreshCafeScores } from '@/lib/cafes-db'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const rating = await prisma.rating.findUnique({ where: { id }, select: { id: true } })
  if (!rating) return Response.json({ error: 'not_found' }, { status: 404 })

  await prisma.$transaction([
    prisma.rating.update({ where: { id }, data: { status: RatingStatus.hidden } }),
    prisma.ratingReport.updateMany({
      where: { ratingId: id, status: 'open' },
      data: { status: 'actioned', resolvedAt: new Date() },
    }),
    prisma.adminAction.create({
      data: {
        actorUserId: user.id,
        action: 'rating.hide',
        targetType: 'rating',
        targetId: id,
      },
    }),
  ])

  await refreshCafeScores()

  const isForm = !request.headers.get('content-type')?.includes('application/json')
  return isForm
    ? Response.redirect(new URL('/admin', request.url), 303)
    : Response.json({ status: 'hidden' })
}
