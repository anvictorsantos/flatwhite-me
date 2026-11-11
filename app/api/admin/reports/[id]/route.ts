import { ReportStatus } from '@/generated/prisma/enums'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

async function action(request: Request): Promise<string> {
  const type = request.headers.get('content-type') ?? ''
  if (type.includes('application/json')) {
    const body: unknown = await request.json().catch(() => ({}))
    return body && typeof body === 'object' ? String((body as Record<string, unknown>).action) : ''
  }
  const form = await request.formData()
  return String(form.get('action') ?? '')
}

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const report = await prisma.ratingReport.findUnique({ where: { id }, select: { id: true } })
  if (!report) return Response.json({ error: 'not_found' }, { status: 404 })

  const next = await action(request)
  if (next !== 'dismiss' && next !== 'action') {
    return Response.json({ error: 'unknown_action' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.ratingReport.update({
      where: { id },
      data: {
        status: next === 'dismiss' ? ReportStatus.dismissed : ReportStatus.actioned,
        resolvedAt: new Date(),
      },
    }),
    prisma.adminAction.create({
      data: {
        actorUserId: user.id,
        action: `report.${next}`,
        targetType: 'report',
        targetId: id,
      },
    }),
  ])

  const isForm = !request.headers.get('content-type')?.includes('application/json')
  return isForm
    ? Response.redirect(new URL('/admin', request.url), 303)
    : Response.json({ status: next })
}
