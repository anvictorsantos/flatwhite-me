'use client'

import { MapCanvas } from '@/components/MapCanvas'
import { useStore } from '@/components/StoreProvider'
import type { CafeSummary } from '@/lib/types'

export function MapPreview({
  cafes,
  onVisibleChange,
  heightClass,
  locateNonce = 0,
  focusSlug,
  onSelect,
  onHover,
}: {
  cafes: readonly CafeSummary[]
  onVisibleChange?: (slugs: string[]) => void
  heightClass?: string
  locateNonce?: number
  focusSlug?: string | null
  onSelect?: (slug: string) => void
  onHover?: (slug: string | null) => void
}) {
  const { saved } = useStore()

  return (
    <MapCanvas
      cafes={cafes}
      savedSlugs={saved}
      focusSlug={focusSlug}
      onSelect={onSelect ?? (() => undefined)}
      onHover={onHover}
      onVisibleChange={onVisibleChange ?? (() => undefined)}
      locateNonce={locateNonce}
      onLocateError={() => undefined}
      heightClass={heightClass}
    />
  )
}
