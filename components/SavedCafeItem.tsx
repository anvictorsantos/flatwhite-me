'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { ScoreBadge } from '@/components/ScoreBadge'
import { useStore } from '@/components/StoreProvider'
import type { CafeSummary } from '@/lib/types'

export function SavedCafeItem({ cafe }: { cafe: CafeSummary }) {
  const router = useRouter()
  const { toggleSaved } = useStore()
  const [busy, setBusy] = useState(false)

  return (
    <article className="card flex items-start justify-between gap-3 p-3">
      <Link
        href={`/cafe/${cafe.slug}`}
        className="grid min-w-0 gap-1.5 no-underline"
      >
        <span className="text-sm leading-tight font-semibold">{cafe.name}</span>
        <span className="text-xs text-text-muted">
          {cafe.area ?? 'Lisboa'}
          {cafe.specialty ? ' · especialidade' : ''}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <ScoreBadge score={cafe.score} />
          <span className="text-xs text-text-muted tabular-nums">
            {cafe.ratings === 0 ? 'Ainda sem avaliações' : `${cafe.ratings} avaliações`}
          </span>
        </span>
      </Link>
      <button
        type="button"
        aria-label={`Remover ${cafe.name} dos guardados`}
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          await toggleSaved(cafe.slug)
          router.refresh()
        }}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-transform duration-150 active:scale-95 disabled:opacity-50"
      >
        <Icon
          name="heart"
          size={18}
        />
      </button>
    </article>
  )
}
