import { prisma } from '@/lib/db'
import { metresApart, normalizeName } from '@/lib/slugs'

export type DuplicateCandidate = {
  id: string
  slug: string
  name: string
  area: string | null
  distanceMetres: number | null
}

export async function findDuplicateCandidates(
  name: string,
  latitude: number | null,
  longitude: number | null,
): Promise<DuplicateCandidate[]> {
  const normalized = normalizeName(name)
  if (!normalized) return []

  const cafes = await prisma.cafe.findMany({
    where: { normalizedName: { contains: normalized } },
    select: {
      id: true,
      slug: true,
      name: true,
      neighborhood: true,
      latitude: true,
      longitude: true,
    },
    take: 20,
  })

  return cafes
    .map((cafe) => ({
      id: cafe.id,
      slug: cafe.slug,
      name: cafe.name,
      area: cafe.neighborhood,
      distanceMetres:
        latitude !== null && longitude !== null
          ? Math.round(metresApart({ latitude, longitude }, cafe))
          : null,
    }))
    .filter((candidate) => candidate.distanceMetres === null || candidate.distanceMetres < 100)
    .sort((a, b) => (a.distanceMetres ?? 0) - (b.distanceMetres ?? 0))
}
