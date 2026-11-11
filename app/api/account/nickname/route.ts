import { Prisma } from '@/generated/prisma/client'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { nicknameSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

  const parsed = nicknameSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'invalid' }, { status: 400 })

  const nickname = parsed.data.nickname
  const taken = await prisma.user.findFirst({
    where: {
      nickname: { equals: nickname, mode: 'insensitive' },
      id: { not: user.id },
    },
    select: { id: true },
  })
  if (taken) return Response.json({ error: 'nickname_taken' }, { status: 409 })

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { nickname },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return Response.json({ error: 'nickname_taken' }, { status: 409 })
    }
    throw error
  }
  return Response.json({ nickname })
}
