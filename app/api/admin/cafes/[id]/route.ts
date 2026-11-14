import { CafeStatus } from '@/generated/prisma/enums'
import { getSessionUser } from '@/lib/auth'
import { refreshCafeScores } from '@/lib/cafes-db'
import { prisma } from '@/lib/db'
import { readPayload } from '@/lib/http'
import { publicOrigin } from '@/lib/site'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const cafe = await prisma.cafe.findUnique({
    where: { id },
    select: { id: true, status: true, specialty: true },
  })
  if (!cafe) return Response.json({ error: 'not_found' }, { status: 404 })

  const data = await readPayload(request)
  const action = data.action
  const isForm = !request.headers.get('content-type')?.includes('application/json')

  let update: { status?: CafeStatus; specialty?: boolean } | null = null
  if (action === 'close') update = { status: CafeStatus.closed }
  if (action === 'reopen') update = { status: CafeStatus.active }
  if (action === 'specialty-on') update = { specialty: true }
  if (action === 'specialty-off') update = { specialty: false }
  if (!update) return Response.json({ error: 'unknown_action' }, { status: 400 })

  await prisma.$transaction([
    prisma.cafe.update({ where: { id }, data: update }),
    prisma.adminAction.create({
      data: {
        actorUserId: user.id,
        action: `cafe.${action}`,
        targetType: 'cafe',
        targetId: id,
      },
    }),
  ])

  if (update.status) await refreshCafeScores()

  return isForm
    ? Response.redirect(new URL('/admin', publicOrigin(request)), 303)
    : Response.json({ status: update.status ?? cafe.status })
}
