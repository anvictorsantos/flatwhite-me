'use client'

import { MapCanvas } from '@/components/MapCanvas'
import { useStore } from '@/components/StoreProvider'
import type { CafeSummary } from '@/lib/types'

export function MapPreview({
  cafes,
  onVisibleChange,
  heightClass,
  locateTarget = null,
  focusSlug,
  onSelect,
  onHover,
}: {
  cafes: readonly CafeSummary[]
  onVisibleChange?: (slugs: string[]) => void
  heightClass?: string
  locateTarget?: { lon: number; lat: number } | null
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
      locateTarget={locateTarget}
      heightClass={heightClass}
    />
  )
}
