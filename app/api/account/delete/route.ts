import { destroySession, getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  await prisma.$transaction([
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
    ? Response.redirect(new URL('/', request.url), 303)
    : Response.json({ status: 'deleted' })
}
