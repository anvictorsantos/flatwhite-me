export function normalizeName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function slugify(value: string): string {
  return normalizeName(value).replace(/ /g, '-')
}

export function metresApart(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const meanLat = (((a.latitude + b.latitude) / 2) * Math.PI) / 180
  const dx = (a.longitude - b.longitude) * Math.cos(meanLat) * 111_320
  const dy = (a.latitude - b.latitude) * 110_574
  return Math.hypot(dx, dy)
}

export function nextSlug(base: string, taken: ReadonlySet<string>): string {
  const root = base || 'cafe'
  if (!taken.has(root)) return root
  let suffix = 2
  while (taken.has(`${root}-${suffix}`)) suffix += 1
  return `${root}-${suffix}`
}
