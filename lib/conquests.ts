import { prisma } from '@/lib/db'
import { FREGUESIAS } from '@/lib/freguesias'

export type Conquest = {
  slug: string
  name: string
  total: number
  visited: number
  conquered: boolean
}

type Row = { freguesia: string; total: number; visited: number }

export function mergeConquests(rows: readonly Row[]): Conquest[] {
  const byFreguesia = new Map(rows.map((row) => [row.freguesia, row]))
  return FREGUESIAS.map(({ slug, name }) => {
    const row = byFreguesia.get(slug)
    const total = row?.total ?? 0
    const visited = row?.visited ?? 0
    return { slug, name, total, visited, conquered: total > 0 && visited >= total }
  })
}

export async function listConquests(userId: string): Promise<Conquest[]> {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT c.freguesia,
           count(DISTINCT c.id)::int AS total,
           count(DISTINCT c.id) FILTER (
             WHERE r."userId" = ${userId}::uuid AND r.status = 'visible'
           )::int AS visited
    FROM "Cafe" c
    LEFT JOIN "Rating" r ON r."cafeId" = c.id
    WHERE c.status = 'active' AND c.freguesia IS NOT NULL
    GROUP BY c.freguesia
  `
  return mergeConquests(rows)
}
