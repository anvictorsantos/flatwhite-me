import { AppBar } from '@/components/AppBar'
import { ExploreView } from '@/components/ExploreView'
import { listCafeSummaries } from '@/lib/cafes-db'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ freguesia?: string }>
}) {
  const { freguesia } = await searchParams
  const cafes = await listCafeSummaries()
  const shown = freguesia ? cafes.filter((cafe) => cafe.freguesia === freguesia) : cafes

  return (
    <>
      <AppBar action="city" />
      <ExploreView cafes={shown} />
    </>
  )
}
