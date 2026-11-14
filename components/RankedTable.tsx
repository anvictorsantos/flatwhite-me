'use client'

import Link from 'next/link'
import { fmtScore } from '@/lib/format'
import type { CafeSummary } from '@/lib/types'

export function RankedTable({
  cafes,
  start = 1,
  activeSlug,
  onFocusCafe,
}: {
  cafes: readonly CafeSummary[]
  start?: number
  activeSlug?: string | null
  onFocusCafe?: (slug: string) => void
}) {
  return (
    <ol className="grid border-t border-text">
      {cafes.map((cafe, index) => (
        <li
          key={cafe.slug}
          data-cafe-slug={cafe.slug}
        >
          <Link
            href={`/cafe/${cafe.slug}`}
            onMouseEnter={() => onFocusCafe?.(cafe.slug)}
            onClick={() => onFocusCafe?.(cafe.slug)}
            className={`grid grid-cols-[2.5rem_minmax(0,1fr)_3.5rem_4rem] items-baseline gap-3 border-b border-border px-2 py-2.5 no-underline hover:bg-surface-muted ${
              activeSlug === cafe.slug ? 'bg-surface-muted ring-1 ring-accent ring-inset' : ''
            }`}
          >
            <span className="text-xs text-text-muted tabular-nums">
              {String(start + index).padStart(2, '0')}
            </span>
            <span className="min-w-0">
              <span className="block text-sm leading-tight font-medium">{cafe.name}</span>
              <span className="mt-0.5 block text-xs text-text-muted">{cafe.area ?? 'Lisboa'}</span>
            </span>
            <span className="text-right text-lg font-semibold tabular-nums">
              {fmtScore(cafe.score)}
            </span>
            <span className="text-right text-xs text-text-muted tabular-nums">
              {cafe.ratings} aval.
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
