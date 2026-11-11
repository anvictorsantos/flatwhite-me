import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const boundaries = JSON.parse(readFileSync(join(root, 'data/freguesias-lisboa.json'), 'utf8'))

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/ /g, '-')

const polygons = boundaries.features.map((feature) => ({
  slug: slugify(feature.properties.Freguesia),
  rings: feature.geometry.coordinates,
}))

function insideRing(longitude, latitude, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi
    ) {
      inside = !inside
    }
  }
  return inside
}

function locate(latitude, longitude) {
  for (const polygon of polygons) {
    const [outer, ...holes] = polygon.rings
    if (!insideRing(longitude, latitude, outer)) continue
    if (holes.some((hole) => insideRing(longitude, latitude, hole))) continue
    return polygon.slug
  }
  return null
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const { rows } = await client.query('SELECT id, name, latitude, longitude, freguesia FROM "Cafe"')
let updated = 0
const unmatched = []

for (const row of rows) {
  const freguesia = locate(row.latitude, row.longitude)
  if (freguesia === null) unmatched.push(`${row.name} (${row.latitude}, ${row.longitude})`)
  if (freguesia === row.freguesia) continue
  await client.query('UPDATE "Cafe" SET freguesia = $1 WHERE id = $2', [freguesia, row.id])
  updated += 1
}

console.log(`cafés: ${rows.length}, updated: ${updated}, outside Lisboa: ${unmatched.length}`)
if (unmatched.length > 0) console.log(unmatched.slice(0, 20).join('\n'))

await client.end()
