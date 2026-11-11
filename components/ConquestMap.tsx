'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@/components/Icon'
import type { Conquest } from '@/lib/conquests'
import type { FreguesiaShape } from '@/lib/freguesias'

const WIDTH = 700
const HEIGHT = 520

export function ConquestMap({
  shapes,
  conquests,
}: {
  shapes: readonly FreguesiaShape[]
  conquests: readonly Conquest[]
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const bySlug = new Map(conquests.map((conquest) => [conquest.slug, conquest]))
  const active = activeSlug ? bySlug.get(activeSlug) : undefined
  const completed = shapes.filter((shape) => bySlug.get(shape.slug)?.conquered)
  const visited = conquests.reduce((sum, conquest) => sum + conquest.visited, 0)

  return (
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-card border border-border bg-surface-muted">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="group"
          aria-label="Mapa de conquistas por freguesia"
          className="block h-auto w-full"
        >
          <defs>
            {shapes.map((shape) => (
              <clipPath
                key={shape.slug}
                id={`freguesia-${shape.slug}`}
              >
                <path
                  d={shape.d}
                  clipRule="evenodd"
                />
              </clipPath>
            ))}
          </defs>

          {shapes.map((shape) => {
            const conquest = bySlug.get(shape.slug)
            const total = conquest?.total ?? 0
            const count = conquest?.visited ?? 0
            const percent = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0
            const level = shape.y + shape.height * (1 - percent / 100)
            const isActive = shape.slug === activeSlug

            return (
              <g
                key={shape.slug}
                role="button"
                tabIndex={0}
                aria-label={`${shape.name}: ${total === 0 ? 'sem cafés' : `${count} de ${total} cafés`}`}
                aria-pressed={isActive}
                onClick={() => setActiveSlug(shape.slug)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setActiveSlug(shape.slug)
                  }
                }}
                onMouseEnter={() => setActiveSlug(shape.slug)}
                onMouseLeave={() => setActiveSlug(null)}
                onFocus={() => setActiveSlug(shape.slug)}
                onBlur={() => setActiveSlug(null)}
                className="cursor-pointer focus:outline-none"
              >
                <path
                  d={shape.d}
                  fill="var(--color-surface)"
                  fillRule="evenodd"
                />
                {percent > 0 ? (
                  <g clipPath={`url(#freguesia-${shape.slug})`}>
                    <rect
                      x={shape.x}
                      y={level}
                      width={shape.width}
                      height={shape.y + shape.height - level}
                      fill="var(--color-accent)"
                    />
                    {percent < 100 ? (
                      <rect
                        x={shape.x}
                        y={level}
                        width={shape.width}
                        height={1.5}
                        fill="var(--color-badge)"
                        opacity={0.75}
                      />
                    ) : null}
                  </g>
                ) : null}
                <path
                  d={shape.d}
                  fill="none"
                  fillRule="evenodd"
                  stroke={isActive ? 'var(--color-text)' : 'var(--color-border)'}
                  strokeWidth={isActive ? 2.5 : 1}
                  strokeLinejoin="round"
                />
              </g>
            )
          })}
        </svg>

        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {completed.map((shape) => (
            <span
              key={shape.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-bg"
              style={{ left: `${(shape.cx / WIDTH) * 100}%`, top: `${(shape.cy / HEIGHT) * 100}%` }}
            >
              <Icon
                name="coffee"
                size={20}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3">
        {active ? (
          <>
            <div className="grid gap-0.5">
              <p className="font-semibold">{active.name}</p>
              <p className="text-sm text-text-muted">
                {active.total === 0
                  ? 'Sem cafés no diretório'
                  : `${active.visited} de ${active.total} cafés`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {active.conquered ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text">
                  <Icon
                    name="coffee"
                    size={16}
                  />
                  Conquistada
                </span>
              ) : (
                <span className="text-2xl font-semibold tabular-nums">
                  {active.total === 0
                    ? '—'
                    : `${Math.round((active.visited / active.total) * 100)}%`}
                </span>
              )}
              <Link
                href={`/?freguesia=${active.slug}`}
                className="btn btn-secondary"
              >
                Ver cafés
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-text">
              {completed.length} de {shapes.length}
            </span>{' '}
            freguesias conquistadas · {visited} cafés avaliados
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] border border-border bg-surface" />
          Por começar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-accent" />A caminho
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded-[3px] bg-accent text-bg">
            <Icon
              name="coffee"
              size={11}
            />
          </span>
          Conquistada
        </span>
        <span className="text-text-muted">Toca numa freguesia para ver o progresso</span>
      </div>
    </div>
  )
}
