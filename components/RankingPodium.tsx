import Link from 'next/link'
import { fmtScore } from '@/lib/format'
import type { CafeSummary } from '@/lib/types'

export function RankingPodium({ cafes }: { cafes: readonly CafeSummary[] }) {
  const [first, second, third] = cafes
  if (!first || !second || !third) return null

  const places = [
    { cafe: second, rank: 2, offset: 'mb-6' },
    { cafe: first, rank: 1, offset: '' },
    { cafe: third, rank: 3, offset: 'mb-10' },
  ]

  return (
    <div className="grid max-w-lg grid-cols-3 items-end gap-2">
      {places.map(({ cafe, rank, offset }) => (
        <Link
          key={cafe.slug}
          href={`/cafe/${cafe.slug}`}
          className={`grid gap-1 rounded-card border p-3 no-underline ${offset} ${
            rank === 1 ? 'border-accent bg-badge' : 'border-border bg-surface'
          }`}
        >
          <span className="text-xs text-text-muted tabular-nums">{rank}.º</span>
          <span className="text-xs leading-tight font-semibold">{cafe.name}</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {fmtScore(cafe.score)}
            <span className="text-xs font-medium text-text-muted"> /5</span>
          </span>
          <span className="text-xs text-text-muted">{cafe.ratings} aval.</span>
        </Link>
      ))}
    </div>
  )
}
