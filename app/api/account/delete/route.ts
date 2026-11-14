import { destroySession, getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publicOrigin } from '@/lib/site'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  await prisma.$transaction([
    prisma.ratingRevision.deleteMany({ where: { rating: { userId: user.id } } }),
    prisma.wantToTry.deleteMany({ where: { userId: user.id } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.rating.updateMany({ where: { userId: user.id }, data: { userId: null, note: null } }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        googleSub: null,
        email: null,
        displayName: null,
        nickname: null,
        avatarUrl: null,
        deletedAt: new Date(),
      },
    }),
  ])

  await destroySession()

  const isForm = !request.headers.get('content-type')?.includes('application/json')
  return isForm
    ? Response.redirect(new URL('/', publicOrigin(request)), 303)
    : Response.json({ status: 'deleted' })
}
