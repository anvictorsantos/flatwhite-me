import boundaries from '@/data/freguesias-lisboa.json'
import { slugify } from '@/lib/slugs'

export type Freguesia = { slug: string; name: string }

type Ring = ReadonlyArray<readonly [number, number]>

type Geometry =
  { type: 'Polygon'; coordinates: Ring[] } | { type: 'MultiPolygon'; coordinates: Ring[][] }

type BoundaryCollection = {
  features: Array<{
    properties: { Freguesia: string }
    geometry: Geometry
  }>
}

const features = (boundaries as unknown as BoundaryCollection).features

export const FREGUESIAS: readonly Freguesia[] = features
  .map((feature) => ({
    slug: slugify(feature.properties.Freguesia),
    name: feature.properties.Freguesia,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt'))

function insideRing(longitude: number, latitude: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as readonly [number, number]
    const [xj, yj] = ring[j] as readonly [number, number]
    if (
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi
    ) {
      inside = !inside
    }
  }
  return inside
}

function insidePolygon(longitude: number, latitude: number, rings: Ring[]): boolean {
  const [outer, ...holes] = rings
  if (!outer || !insideRing(longitude, latitude, outer)) return false
  return !holes.some((hole) => insideRing(longitude, latitude, hole))
}

function polygonsOf(geometry: Geometry): Ring[][] {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
}

export function freguesiaForPoint(latitude: number, longitude: number): string | null {
  for (const feature of features) {
    if (polygonsOf(feature.geometry).some((rings) => insidePolygon(longitude, latitude, rings))) {
      return slugify(feature.properties.Freguesia)
    }
  }
  return null
}

const MAP_WIDTH = 700
const MAP_HEIGHT = 520
const MAP_PAD = 8

type Point = readonly [number, number]

export type FreguesiaShape = {
  slug: string
  name: string
  d: string
  cx: number
  cy: number
  x: number
  y: number
  width: number
  height: number
}

function segmentDistance(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const lengthSquared = dx * dx + dy * dy
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared),
        )
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy))
}

function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 4) return points
  let max = 0
  let index = 0
  const first = points[0] as Point
  const last = points[points.length - 1] as Point
  for (let i = 1; i < points.length - 1; i++) {
    const distance = segmentDistance(points[i] as Point, first, last)
    if (distance > max) {
      max = distance
      index = i
    }
  }
  if (max <= epsilon) return [first, last]
  const left = simplify(points.slice(0, index + 1), epsilon)
  const right = simplify(points.slice(index), epsilon)
  return [...left.slice(0, -1), ...right]
}

function ringCentroid(points: Point[]): Point {
  let area = 0
  let x = 0
  let y = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i] as Point
    const b = points[(i + 1) % points.length] as Point
    const cross = a[0] * b[1] - b[0] * a[1]
    area += cross
    x += (a[0] + b[0]) * cross
    y += (a[1] + b[1]) * cross
  }
  area /= 2
  if (Math.abs(area) < 0.001) {
    const xs = points.map((point) => point[0])
    const ys = points.map((point) => point[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
  }
  return [x / (6 * area), y / (6 * area)]
}

function buildShapes(): FreguesiaShape[] {
  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const feature of features) {
    for (const rings of polygonsOf(feature.geometry)) {
      for (const ring of rings) {
        for (const [lon, lat] of ring) {
          minLon = Math.min(minLon, lon)
          maxLon = Math.max(maxLon, lon)
          minLat = Math.min(minLat, lat)
          maxLat = Math.max(maxLat, lat)
        }
      }
    }
  }

  const project = ([lon, lat]: readonly [number, number]): Point => [
    MAP_PAD + ((lon - minLon) / (maxLon - minLon)) * (MAP_WIDTH - MAP_PAD * 2),
    MAP_PAD + ((maxLat - lat) / (maxLat - minLat)) * (MAP_HEIGHT - MAP_PAD * 2),
  ]

  const shapes = features.map((feature) => {
    const allRings = polygonsOf(feature.geometry)
    let d = ''
    let x = Infinity
    let y = Infinity
    let right = -Infinity
    let bottom = -Infinity
    let centroid: Point = [MAP_WIDTH / 2, MAP_HEIGHT / 2]

    allRings.forEach((rings, polygonIndex) => {
      rings.forEach((ring, ringIndex) => {
        const points = simplify(
          ring.map((coordinate) => project(coordinate)),
          0.9,
        )
        if (points.length < 3) return
        d += `M${points.map((point) => `${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join('L')}Z`
        for (const [px, py] of points) {
          x = Math.min(x, px)
          y = Math.min(y, py)
          right = Math.max(right, px)
          bottom = Math.max(bottom, py)
        }
        if (polygonIndex === 0 && ringIndex === 0) centroid = ringCentroid(points)
      })
    })

    return {
      slug: slugify(feature.properties.Freguesia),
      name: feature.properties.Freguesia,
      d,
      cx: centroid[0],
      cy: centroid[1],
      x,
      y,
      width: right - x,
      height: bottom - y,
    }
  })

  return shapes.sort((a, b) => a.name.localeCompare(b.name, 'pt'))
}

export const FREGUESIA_MAP = { width: MAP_WIDTH, height: MAP_HEIGHT } as const
export const FREGUESIA_SHAPES: readonly FreguesiaShape[] = buildShapes()
