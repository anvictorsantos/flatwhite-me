import { searchCafeSummaries } from '@/lib/cafes-db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') ?? ''
  const cafes = await searchCafeSummaries(query, 8)
  return Response.json(cafes.map((cafe) => ({ slug: cafe.slug, name: cafe.name, area: cafe.area })))
}
