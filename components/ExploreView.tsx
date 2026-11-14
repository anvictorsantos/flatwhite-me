'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CafeCard } from '@/components/CafeCard'
import { FiltersSheet } from '@/components/FiltersSheet'
import { Icon } from '@/components/Icon'
import { MapPreview } from '@/components/MapPreview'
import { RankedTable } from '@/components/RankedTable'
import {
  activeFilterCount,
  defaultFilters,
  filterCafes,
  filtersActive,
  resultsHeading,
  type Filters,
} from '@/lib/filters'
import type { CafeSummary } from '@/lib/types'

const UNRATED_LIMIT = 24

export function ExploreView({ cafes }: { cafes: readonly CafeSummary[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleSlugs, setVisibleSlugs] = useState<string[] | null>(null)
  const [locateNonce, setLocateNonce] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [focusSlug, setFocusSlug] = useState<string | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const locateMe = () => setLocateNonce((value) => value + 1)

  const focusCafe = (slug: string) => {
    setActiveSlug(slug)
    setFocusSlug(slug)
  }

  const query = filters.query.trim().toLowerCase()
  const matches = useMemo(
    () =>
      cafes.filter(
        (cafe) =>
          !query ||
          cafe.name.toLowerCase().includes(query) ||
          (cafe.area ?? '').toLowerCase().includes(query),
      ),
    [cafes, query],
  )

  const controlFilters: Filters = { ...filters, query: '' }
  const rated = filterCafes(matches, controlFilters)
  const ranked = rated.filter((cafe) => cafe.ratings >= 3)
  const few = rated.filter((cafe) => cafe.ratings > 0 && cafe.ratings < 3)
  const hasControls = activeFilterCount(filters) > 0
  const unrated = hasControls ? [] : matches.filter((cafe) => cafe.ratings === 0)
  const viewport = visibleSlugs ? new Set(visibleSlugs) : null
  const inView = (list: CafeSummary[]) =>
    viewport ? list.filter((cafe) => viewport.has(cafe.slug)) : list
  const rankedInView = inView(ranked)
  const fewInView = inView(few)
  const unratedInView = inView(unrated)
  const mapCafes = [...rated, ...unrated]
  const unratedShown = unratedInView.slice(0, UNRATED_LIMIT)
  const count = activeFilterCount(filters)
  const heading = resultsHeading(filters, rankedInView.length + fewInView.length, cafes.length)
  const total = rankedInView.length + fewInView.length + unratedInView.length
  const onlyUnrated = rankedInView.length + fewInView.length === 0

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div className="gap-8 grid lg:gap-11 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="content-start gap-4 grid">
          <div className="gap-3 grid">
            <h1 className="display">O teu próximo flat white.</h1>
            <p className="lede">
              Lisboa, ordenada por quem prova. Sem lugares pagos. Sem notas editoriais.
            </p>
          </div>

          <div className="relative">
            <span className="top-1/2 left-3.5 absolute text-text-muted -translate-y-1/2 pointer-events-none">
              <Icon name="search" />
            </span>
            <input
              type="search"
              aria-label="Pesquisar café ou bairro"
              placeholder="Pesquisar café ou bairro"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              className="pl-11 input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={count > 0 ? 'chip chip-active' : 'chip'}
              onClick={() => setFiltersOpen(true)}
            >
              Filtros{count > 0 ? ` · ${count}` : ''}
            </button>
            <button
              type="button"
              className="chip"
              onClick={locateMe}
            >
              Perto de mim
            </button>
            <button
              type="button"
              aria-pressed={filters.specialty === 'specialty'}
              className={filters.specialty === 'specialty' ? 'chip chip-active' : 'chip'}
              onClick={() =>
                setFilters({
                  ...filters,
                  specialty: filters.specialty === 'specialty' ? 'all' : 'specialty',
                })
              }
            >
              Especialidade
            </button>
            {filters.query || hasControls ? (
              <button
                type="button"
                className="chip"
                onClick={() => setFilters(defaultFilters)}
              >
                Limpar
              </button>
            ) : null}
          </div>

          {isMobile ? (
            <div className="max-w-[1200px]">
              <MapPreview
                cafes={mapCafes}
                heightClass="h-[350px]"
                onVisibleChange={setVisibleSlugs}
                locateNonce={locateNonce}
                focusSlug={focusSlug}
                onSelect={setActiveSlug}
                onHover={setActiveSlug}
              />
            </div>
          ) : null}

          <section
            className="gap-3 grid"
            aria-labelledby="results-title"
          >
            <div className="lg:hidden gap-1 grid">
              <h2
                id="results-title"
                className="section-title"
              >
                {heading.title}
              </h2>
              <p className="meta">
                {filtersActive(filters)
                  ? heading.meta
                  : `${rankedInView.length} no ranking · ${fewInView.length} com poucas avaliações · ${cafes.length} no diretório`}
              </p>
            </div>

            {total === 0 ? (
              <div className="justify-items-start gap-3 grid card-flat">
                <p>
                  {viewport
                    ? 'Nenhum café nesta zona do mapa. Arrasta o mapa ou limpa os filtros.'
                    : 'Nenhum café corresponde a estes filtros.'}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Limpar filtros
                </button>
                <Link
                  href="/sugerir"
                  className="btn btn-secondary"
                >
                  Sugerir café
                </Link>
              </div>
            ) : null}

            {rankedInView.length > 0 || fewInView.length > 0 ? (
              <>
                <div className="hidden lg:block">
                  <div className="pr-1 max-h-[625px] overflow-y-auto">
                    <RankedTable
                      cafes={[...rankedInView, ...fewInView]}
                      activeSlug={activeSlug}
                      onFocusCafe={focusCafe}
                    />
                  </div>
                  <p className="mt-3 meta">
                    Entram cafés com 3 ou mais avaliações nos últimos 365 dias.
                  </p>
                </div>
                <div className="lg:hidden gap-3 grid md:grid-cols-2">
                  {[...rankedInView, ...fewInView].map((cafe) => (
                    <CafeCard
                      key={cafe.slug}
                      cafe={cafe}
                      selected={activeSlug === cafe.slug}
                      onHover={() => focusCafe(cafe.slug)}
                      onSelect={() => focusCafe(cafe.slug)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {unratedInView.length > 0 ? (
              <div className="gap-3 grid pt-2">
                <h3 className="section-title">Ainda sem avaliações</h3>
                <p className="meta">
                  {unratedInView.length} {unratedInView.length === 1 ? 'café' : 'cafés'} no
                  diretório.
                  {unratedInView.length > unratedShown.length
                    ? ` Mostramos os primeiros ${unratedShown.length}.`
                    : ''}
                </p>
                {onlyUnrated ? (
                  <div className="hidden lg:block">
                    <div className="pr-1 max-h-[625px] overflow-y-auto">
                      <RankedTable
                        cafes={unratedShown}
                        activeSlug={activeSlug}
                        onFocusCafe={focusCafe}
                      />
                    </div>
                  </div>
                ) : null}
                <div className="lg:hidden gap-3 grid md:grid-cols-2">
                  {unratedShown.map((cafe) => (
                    <CafeCard
                      key={cafe.slug}
                      cafe={cafe}
                      selected={activeSlug === cafe.slug}
                      onHover={() => focusCafe(cafe.slug)}
                      onSelect={() => focusCafe(cafe.slug)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="top-24 sticky gap-3 grid">
            <div className="relative">
              {isMobile ? null : (
                <MapPreview
                  cafes={mapCafes}
                  heightClass="h-[860px]"
                  onVisibleChange={setVisibleSlugs}
                  locateNonce={locateNonce}
                  focusSlug={focusSlug}
                  onSelect={setActiveSlug}
                  onHover={setActiveSlug}
                />
              )}
              <span className="bottom-2 left-2 absolute bg-surface px-2 py-1 border border-border rounded-lg font-medium text-xs pointer-events-none">
                {visibleSlugs?.length ?? mapCafes.length} cafés no mapa
              </span>
            </div>
            {ranked[0] ? (
              <CafeCard
                cafe={rankedInView[0] ?? ranked[0]}
                featured
              />
            ) : null}
            {unrated.length > 0 ? (
              <div className="card-flat">
                <p className="font-semibold">Ainda sem avaliações</p>
                <p className="mt-1 meta">
                  {unrated.length} {unrated.length === 1 ? 'café' : 'cafés'} no diretório. A
                  primeira avaliação põe um café no mapa.
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <FiltersSheet
        key={filtersOpen ? 'open' : 'closed'}
        open={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next)
          setFiltersOpen(false)
        }}
      />
    </main>
  )
}
