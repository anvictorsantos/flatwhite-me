import { CafeSource, CafeStatus, SuggestionStatus } from '@/generated/prisma/enums'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publicOrigin } from '@/lib/site'
import { freguesiaForPoint } from '@/lib/freguesias'
import { geocodeAddress } from '@/lib/geocode'
import { readPayload } from '@/lib/http'
import { normalizeName, nextSlug, slugify } from '@/lib/slugs'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const data = await readPayload(request)
  const action = data.action
  const suggestion = await prisma.cafeSuggestion.findUnique({ where: { id } })
  if (!suggestion || suggestion.status !== SuggestionStatus.pending) {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }

  const redirect = request.headers.get('content-type')?.includes('application/json')
    ? null
    : new URL('/admin', publicOrigin(request))

  if (action === 'reject') {
    await prisma.cafeSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.rejected, reviewedAt: new Date(), reviewedBy: user.id },
    })
    return redirect ? Response.redirect(redirect, 303) : Response.json({ status: 'rejected' })
  }

  if (action === 'merge') {
    const matchedCafeId = data.matchedCafeId
    const match = matchedCafeId
      ? await prisma.cafe.findUnique({ where: { id: matchedCafeId }, select: { id: true } })
      : null
    if (!match) return Response.json({ error: 'matched_cafe_required' }, { status: 400 })
    await prisma.cafeSuggestion.update({
      where: { id },
      data: {
        status: SuggestionStatus.merged,
        matchedCafeId: match.id,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    })
    return redirect ? Response.redirect(redirect, 303) : Response.json({ status: 'merged' })
  }

  if (action === 'approve') {
    let latitude = suggestion.latitude
    let longitude = suggestion.longitude
    if ((latitude === null || longitude === null) && suggestion.addressLine) {
      const found = await geocodeAddress(suggestion.addressLine)
      if (found) {
        latitude = found.latitude
        longitude = found.longitude
      }
    }
    if (latitude === null || longitude === null) {
      return Response.json({ error: 'coordinates_required' }, { status: 400 })
    }
    const taken = new Set(
      (await prisma.cafe.findMany({ select: { slug: true } })).map((cafe) => cafe.slug),
    )
    const slug = nextSlug(slugify(suggestion.name), taken)
    const created = await prisma.$transaction(async (tx) => {
      const cafe = await tx.cafe.create({
        data: {
          source: CafeSource.user,
          slug,
          name: suggestion.name,
          normalizedName: normalizeName(suggestion.name),
          addressLine: suggestion.addressLine,
          freguesia: freguesiaForPoint(latitude, longitude),
          latitude,
          longitude,
          status: CafeStatus.active,
        },
        select: { id: true, slug: true },
      })
      await tx.cafeSuggestion.update({
        where: { id },
        data: {
          status: SuggestionStatus.approved,
          latitude,
          longitude,
          reviewedAt: new Date(),
          reviewedBy: user.id,
          matchedCafeId: cafe.id,
        },
      })
      await tx.adminAction.create({
        data: {
          actorUserId: user.id,
          action: 'suggestion.approve',
          targetType: 'suggestion',
          targetId: id,
        },
      })
      return cafe
    })
    return redirect
      ? Response.redirect(redirect, 303)
      : Response.json({ status: 'approved', slug: created.slug })
  }

  return Response.json({ error: 'unknown_action' }, { status: 400 })
}
