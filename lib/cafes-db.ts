import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { normalizeName } from '@/lib/slugs'
import type { CafeSummary, Dims } from '@/lib/types'

export type { CafeSummary }

type BaseRow = {
  slug: string
  name: string
  area: string | null
  freguesia: string | null
  specialty: boolean
  score: number | null
  ratings: number
  lastVisit: Date | null
  price: number | null
  latitude: number
  longitude: number
}

type DimsRow = {
  taste: number | null
  texture: number | null
  temperature: number | null
  value: number | null
  milk: string | null
  size: string | null
}

const baseQuery = Prisma.sql`
  SELECT
    c.slug,
    c.name,
    c."neighborhood" AS area,
    c.freguesia,
    c.specialty,
    s.score::float8 AS score,
    COALESCE(s.sample_size, 0)::int AS ratings,
    s.last_visited_on AS "lastVisit",
    (
      SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY r."priceCents")
      FROM "Rating" r
      WHERE r."cafeId" = c.id
        AND r.status = 'visible'
        AND r."visitedOn" >= current_date - interval '365 days'
    )::int AS price,
    c.latitude::float8 AS latitude,
    c.longitude::float8 AS longitude
  FROM "Cafe" c
  LEFT JOIN cafe_scores s ON s.cafe_id = c.id
  WHERE c.status = 'active'
`

function toSummary(row: BaseRow, dims: Dims | null = null): CafeSummary {
  return {
    slug: row.slug,
    name: row.name,
    area: row.area,
    freguesia: row.freguesia,
    specialty: row.specialty,
    score: row.score,
    ratings: row.ratings,
    lastVisit: row.lastVisit ? row.lastVisit.toISOString().slice(0, 10) : null,
    price: row.price,
    latitude: row.latitude,
    longitude: row.longitude,
    dims,
    milkType: null,
    size: null,
  }
}

export async function listCafeSummaries(): Promise<CafeSummary[]> {
  const rows = await prisma.$queryRaw<BaseRow[]>`
    ${baseQuery}
    ORDER BY s.score DESC NULLS LAST, s.sample_size DESC NULLS LAST, (c.source = 'user') DESC, c.name ASC
  `
  return rows.map((row) => toSummary(row))
}

export async function searchCafeSummaries(query: string, limit = 20): Promise<CafeSummary[]> {
  const normalized = normalizeName(query)
  if (!normalized) return []
  const rows = await prisma.$queryRaw<BaseRow[]>`
    ${baseQuery}
    AND c."normalizedName" ILIKE ${'%' + normalized + '%'}
    ORDER BY s.score DESC NULLS LAST, c.name ASC
    LIMIT ${limit}
  `
  return rows.map((row) => toSummary(row))
}

export async function getCafeSummaries(slugs: readonly string[]): Promise<CafeSummary[]> {
  if (slugs.length === 0) return []
  const rows = await prisma.$queryRaw<BaseRow[]>`
    ${baseQuery}
    AND c.slug = ANY(${[...slugs]}::text[])
    ORDER BY s.score DESC NULLS LAST, c.name ASC
  `
  return rows.map((row) => toSummary(row))
}

export async function getCafeSummary(slug: string): Promise<CafeSummary | null> {
  const rows = await prisma.$queryRaw<BaseRow[]>`
    ${baseQuery}
    AND c.slug = ${slug}
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null

  const dimsRows = await prisma.$queryRaw<DimsRow[]>`
    SELECT
      avg(r."taste")::float8 AS taste,
      avg(r."milkTexture")::float8 AS texture,
      avg(r."temperature")::float8 AS temperature,
      avg(r."value")::float8 AS value,
      mode() WITHIN GROUP (ORDER BY r."milkType")::text AS milk,
      mode() WITHIN GROUP (ORDER BY r."size")::text AS size
    FROM "Rating" r
    JOIN "Cafe" c ON c.id = r."cafeId"
    WHERE c.slug = ${slug}
      AND r.status = 'visible'
      AND r."visitedOn" >= current_date - interval '365 days'
  `
  const dimsRow = dimsRows[0]
  const dims: Dims | null =
    dimsRow &&
    dimsRow.taste !== null &&
    dimsRow.texture !== null &&
    dimsRow.temperature !== null &&
    dimsRow.value !== null
      ? {
          sabor: dimsRow.taste,
          textura: dimsRow.texture,
          temperatura: dimsRow.temperature,
          valor: dimsRow.value,
        }
      : null

  return {
    ...toSummary(row, dims),
    milkType: (dimsRow?.milk as CafeSummary['milkType']) ?? null,
    size: (dimsRow?.size as CafeSummary['size']) ?? null,
  }
}

export async function refreshCafeScores(): Promise<void> {
  await prisma.$executeRawUnsafe('REFRESH MATERIALIZED VIEW CONCURRENTLY cafe_scores')
}
