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
  const [mapOnScreen, setMapOnScreen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapShown, setMapShown] = useState(false)

  useEffect(() => {
    if (!mapOpen) return
    const id = requestAnimationFrame(() => setMapShown(true))
    return () => cancelAnimationFrame(id)
  }, [mapOpen])

  const toggleMap = () => {
    if (mapOpen) {
      setMapShown(false)
      setMapOpen(false)
      return
    }
    setMapOpen(true)
  }

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)')
    const update = () => setMapOnScreen(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

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
  const viewport = mapOnScreen && visibleSlugs ? new Set(visibleSlugs) : null
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
    <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div
        className={
          mapOpen
            ? 'grid gap-8'
            : 'grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-11'
        }
      >
        <div className="grid content-start gap-4">
          <div className="grid gap-3">
            <h1 className="display">O teu próximo flat white.</h1>
            <p className="lede">
              Lisboa, ordenada por quem prova. Sem lugares pagos. Sem notas editoriais.
            </p>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted">
              <Icon name="search" />
            </span>
            <input
              type="search"
              aria-label="Pesquisar café ou bairro"
              placeholder="Pesquisar café ou bairro"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              className="input pl-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <Link
              href="/"
              className="btn btn-primary"
            >
              <Icon name="list" />
              Lista
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleMap}
            >
              <Icon name="map" />
              Mapa
            </button>
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
              onClick={toggleMap}
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

          {mapOpen ? (
            <div
              className={`max-w-[1200px] transition-opacity duration-200 ${
                mapShown ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <MapPreview
                cafes={mapCafes}
                heightClass="h-[350px]"
                onVisibleChange={setVisibleSlugs}
              />
            </div>
          ) : null}

          <section
            className="grid gap-3"
            aria-labelledby="results-title"
          >
            {mapOpen ? null : (
              <div className="grid gap-1 lg:hidden">
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
            )}

            {!mapOpen && total === 0 ? (
              <div className="card-flat grid justify-items-start gap-3">
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

            {!mapOpen && (rankedInView.length > 0 || fewInView.length > 0) ? (
              <>
                <div className="hidden lg:block">
                  <div className="max-h-[625px] overflow-y-auto pr-1">
                    <RankedTable cafes={[...rankedInView, ...fewInView]} />
                  </div>
                  <p className="meta mt-3">
                    Entram cafés com 3 ou mais avaliações nos últimos 365 dias.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:hidden">
                  {[...rankedInView, ...fewInView].map((cafe) => (
                    <CafeCard
                      key={cafe.slug}
                      cafe={cafe}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {unratedInView.length > 0 ? (
              <div className="grid gap-3 pt-2">
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
                    <div className="max-h-[625px] overflow-y-auto pr-1">
                      <RankedTable cafes={unratedShown} />
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2 lg:hidden">
                  {unratedShown.map((cafe) => (
                    <CafeCard
                      key={cafe.slug}
                      cafe={cafe}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {mapOpen ? null : (
          <aside className="hidden lg:block">
            <div className="sticky top-24 grid gap-3">
              <div className="relative">
                <MapPreview
                  cafes={mapCafes}
                  heightClass="h-[236px]"
                  onVisibleChange={setVisibleSlugs}
                />
                <span className="pointer-events-none absolute bottom-2 left-2 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium">
                  {mapCafes.length} cafés no mapa
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
                  <p className="meta mt-1">
                    {unrated.length} {unrated.length === 1 ? 'café' : 'cafés'} no diretório. A
                    primeira avaliação põe um café no mapa.
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        )}
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
