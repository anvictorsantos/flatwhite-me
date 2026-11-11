import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

const bodySchema = z.object({ slug: z.string().trim().min(1) })

async function target(request: Request) {
  const user = await getSessionUser()
  if (!user) return { error: Response.json({ error: 'unauthenticated' }, { status: 401 }) }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return { error: Response.json({ error: 'invalid' }, { status: 400 }) }

  const cafe = await prisma.cafe.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  })
  if (!cafe) return { error: Response.json({ error: 'cafe_not_found' }, { status: 404 }) }

  return { user, cafeId: cafe.id }
}

export async function POST(request: Request) {
  const result = await target(request)
  if ('error' in result) return result.error
  await prisma.wantToTry.upsert({
    where: { userId_cafeId: { userId: result.user.id, cafeId: result.cafeId } },
    create: { userId: result.user.id, cafeId: result.cafeId },
    update: {},
  })
  return Response.json({ saved: true })
}

export async function DELETE(request: Request) {
  const result = await target(request)
  if ('error' in result) return result.error
  await prisma.wantToTry.deleteMany({
    where: { userId: result.user.id, cafeId: result.cafeId },
  })
  return Response.json({ saved: false })
}
