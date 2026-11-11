'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { RatingDialog } from '@/components/RatingDialog'
import { ScoreBadge } from '@/components/ScoreBadge'
import { useStore } from '@/components/StoreProvider'
import { fmtDate, fmtPrice } from '@/lib/format'
import type { CafeSummary } from '@/lib/types'

export function CafeCard({
  cafe,
  action = 'rate',
  featured = false,
}: {
  cafe: CafeSummary
  action?: 'rate' | 'remove'
  featured?: boolean
}) {
  const router = useRouter()
  const { isSaved, toggleSaved } = useStore()
  const [ratingOpen, setRatingOpen] = useState(false)
  const saved = isSaved(cafe.slug)

  return (
    <article className="card grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <h3 className="text-base leading-tight font-semibold tracking-tight">
            <Link
              href={`/cafe/${cafe.slug}`}
              className="no-underline hover:underline"
            >
              {cafe.name}
            </Link>
          </h3>
          <p className="text-sm text-text-muted">
            {cafe.area ?? 'Lisboa'}
            {cafe.specialty ? ' · especialidade' : ''}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Remover ${cafe.name} dos guardados` : `Guardar ${cafe.name}`}
          onClick={() => void toggleSaved(cafe.slug)}
          className={
            saved
              ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-input bg-accent text-accent-contrast'
              : 'inline-flex size-11 shrink-0 items-center justify-center rounded-input bg-surface-muted text-text-muted hover:bg-border'
          }
        >
          <Icon name="heart" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ScoreBadge score={cafe.score} />
        <span className="text-sm text-text-muted">
          {cafe.ratings === 0
            ? 'Ainda sem avaliações'
            : `${cafe.ratings} avaliações${cafe.lastVisit ? ` · última ${fmtDate(cafe.lastVisit)}` : ''}`}
        </span>
      </div>

      {cafe.price !== null ? (
        <p className="text-sm text-text-muted">
          Preço médio <span className="font-semibold text-text">{fmtPrice(cafe.price)}</span>
        </p>
      ) : null}

      {action === 'remove' ? (
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={async () => {
            await toggleSaved(cafe.slug)
            router.refresh()
          }}
        >
          Remover dos guardados
        </button>
      ) : (
        <>
          <div className={featured ? 'flex gap-2' : 'grid'}>
            <button
              type="button"
              className={featured ? 'btn btn-primary flex-1' : 'btn btn-secondary btn-block'}
              onClick={() => setRatingOpen(true)}
            >
              Avaliar este café
            </button>
            {featured ? (
              <Link
                href={`/cafe/${cafe.slug}`}
                className="btn btn-secondary"
              >
                Ver café
              </Link>
            ) : null}
          </div>

          <RatingDialog
            cafe={{ slug: cafe.slug, name: cafe.name, price: cafe.price }}
            open={ratingOpen}
            onClose={() => setRatingOpen(false)}
          />
        </>
      )}
    </article>
  )
}
