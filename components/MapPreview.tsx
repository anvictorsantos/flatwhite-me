'use client'

import { MapCanvas } from '@/components/MapCanvas'
import { useStore } from '@/components/StoreProvider'
import type { CafeSummary } from '@/lib/types'

export function MapPreview({
  cafes,
  onVisibleChange,
  heightClass,
}: {
  cafes: readonly CafeSummary[]
  onVisibleChange?: (slugs: string[]) => void
  heightClass?: string
}) {
  const { saved } = useStore()

  return (
    <MapCanvas
      cafes={cafes}
      savedSlugs={saved}
      onSelect={() => undefined}
      onVisibleChange={onVisibleChange ?? (() => undefined)}
      locateNonce={0}
      onLocateError={() => undefined}
      heightClass={heightClass}
    />
  )
}
