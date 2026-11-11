import { getSessionUser } from '@/lib/auth'
import { getCafeSummaries } from '@/lib/cafes-db'
import { prisma } from '@/lib/db'
import type { SavedCafe, StoredRating } from '@/lib/types'

export const dynamic = 'force-dynamic'

const DAY_MS = 24 * 60 * 60 * 1000

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return Response.json({ signedIn: false, saved: [], savedCafes: [], ratings: [] })
  }

  const [wantToTry, ratings] = await Promise.all([
    prisma.wantToTry.findMany({
      where: { userId: user.id },
      select: { cafe: { select: { slug: true } } },
    }),
    prisma.rating.findMany({
      where: { userId: user.id, status: 'visible' },
      orderBy: { visitedOn: 'desc' },
      include: { cafe: { select: { slug: true, name: true } } },
    }),
  ])

  const savedSlugs = wantToTry.map((entry) => entry.cafe.slug)
  const savedCafes: SavedCafe[] = (await getCafeSummaries(savedSlugs)).map((cafe) => ({
    slug: cafe.slug,
    name: cafe.name,
    area: cafe.area,
    score: cafe.score,
    ratings: cafe.ratings,
    lastVisit: cafe.lastVisit,
    price: cafe.price,
  }))

  const payload: StoredRating[] = ratings.map((rating) => ({
    id: rating.id,
    slug: rating.cafe.slug,
    name: rating.cafe.name,
    visit: rating.visitedOn.toISOString().slice(0, 10),
    dims: {
      sabor: rating.taste,
      textura: rating.milkTexture,
      temperatura: rating.temperature,
      valor: rating.value,
    },
    price: rating.priceCents,
    note: rating.note ?? '',
    milkType: rating.milkType,
    size: rating.size,
    locked: rating.note !== null && Date.now() - rating.createdAt.getTime() > 30 * DAY_MS,
  }))

  return Response.json({ signedIn: true, saved: savedSlugs, savedCafes, ratings: payload })
}
