'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { CafeSummary } from '@/lib/types'
import { fmtScore } from '@/lib/format'

const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty'

type MapCanvasProps = {
  cafes: readonly CafeSummary[]
  savedSlugs: readonly string[]
  selectedSlug?: string | undefined
  focusSlug?: string | null | undefined
  onSelect: (slug: string) => void
  onHover?: ((slug: string | null) => void) | undefined
  onVisibleChange: (slugs: string[]) => void
  locateTarget: { lon: number; lat: number } | null
  fill?: boolean
  heightClass?: string | undefined
}

const PINS = {
  ranked: { src: '/pins/map_pin_rating.png', height: 49 },
  few: { src: '/pins/map_pin_few_ratings.png', height: 33 },
  unrated: { src: '/pins/map_pin_unrated.png', height: 15 },
  selected: { src: '/pins/map_pin_cup.png', height: 55 },
} as const

type MarkerEntry = { marker: Marker; element: HTMLButtonElement }

function pinKind(cafe: CafeSummary) {
  return cafe.ratings >= 3 ? 'ranked' : cafe.ratings > 0 ? 'few' : 'unrated'
}

function applyPinState(
  element: HTMLButtonElement,
  cafe: CafeSummary,
  saved: boolean,
  selected: boolean,
) {
  const config = selected ? PINS.selected : PINS[pinKind(cafe)]
  element.classList.toggle('map-pin--saved', saved)
  element.classList.toggle('map-pin--selected', selected)
  element.setAttribute(
    'aria-label',
    `${cafe.name}${cafe.ratings > 0 ? `, ${fmtScore(cafe.score)}` : ', sem nota'}${
      saved ? ', guardado' : ''
    }`,
  )
  const pin = element.querySelector('img')
  if (!pin) return
  if (pin.getAttribute('src') !== config.src) pin.src = config.src
  pin.style.height = `${config.height}px`
}

function markerElement(cafe: CafeSummary, saved: boolean, selected: boolean): HTMLButtonElement {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = 'map-pin'

  if (pinKind(cafe) === 'ranked') {
    const score = document.createElement('span')
    score.className = 'map-pin-score'
    score.textContent = fmtScore(cafe.score)
    element.append(score)
  }

  const pin = document.createElement('img')
  pin.alt = ''
  element.append(pin)
  applyPinState(element, cafe, saved, selected)

  return element
}

export function MapCanvas({
  cafes,
  savedSlugs,
  selectedSlug,
  focusSlug,
  onSelect,
  onHover,
  onVisibleChange,
  locateTarget,
  fill = false,
  heightClass = 'h-[420px] w-full sm:h-[520px]',
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map())
  const renderedKeyRef = useRef('')
  const cafesRef = useRef(cafes)
  const savedSlugsRef = useRef(savedSlugs)
  const selectedSlugRef = useRef(selectedSlug)
  const onSelectRef = useRef(onSelect)
  const onHoverRef = useRef(onHover)
  const onVisibleRef = useRef(onVisibleChange)
  const reportRef = useRef<() => void>(() => undefined)
  const lastReportRef = useRef<string[] | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    cafesRef.current = cafes
    savedSlugsRef.current = savedSlugs
    selectedSlugRef.current = selectedSlug
    onSelectRef.current = onSelect
    onHoverRef.current = onHover
    onVisibleRef.current = onVisibleChange
    markersRef.current.forEach(({ element }, slug) => {
      const cafe = cafes.find((item) => item.slug === slug)
      if (cafe) applyPinState(element, cafe, savedSlugs.includes(slug), slug === selectedSlug)
    })
  }, [cafes, savedSlugs, selectedSlug, onSelect, onHover, onVisibleChange])

  useEffect(() => {
    const markers = markersRef.current
    let map: MapLibreMap | null = null
    let cancelled = false

    void (async () => {
      try {
        const maplibregl = await import('maplibre-gl')
        maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')
        if (cancelled || !containerRef.current) return

        const instance = new maplibregl.Map({
          container: containerRef.current,
          style: STYLE_URL,
          center: [-9.1425, 38.7223],
          zoom: 12.4,
          attributionControl: false,
        })
        map = instance
        // Liberty sprite lacks a few POI icons; registering blanks avoids console errors.
        instance.setMissingStyleImageResolver((id) => {
          instance.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) })
        })
        instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
        mapRef.current = instance

        const report = () => {
          const bounds = instance.getBounds()
          const visible = cafesRef.current
            .filter((cafe) => bounds.contains([cafe.longitude, cafe.latitude]))
            .map((cafe) => cafe.slug)
          const last = lastReportRef.current
          if (
            last &&
            last.length === visible.length &&
            last.every((slug, index) => slug === visible[index])
          ) {
            return
          }
          lastReportRef.current = visible
          onVisibleRef.current(visible)
        }
        reportRef.current = report

        instance.on('load', () => {
          if (cafesRef.current.length > 1) {
            const bounds = new maplibregl.LngLatBounds()
            for (const cafe of cafesRef.current) {
              bounds.extend([cafe.longitude, cafe.latitude])
            }
            instance.fitBounds(bounds, { padding: 24, duration: 0, maxZoom: 13.5 })
          }
          setReady(true)
          report()
        })
        instance.on('moveend', report)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      markers.forEach(({ marker }) => marker.remove())
      markers.clear()
      map?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const list = cafesRef.current
    const key = list.map((cafe) => `${cafe.slug}:${cafe.latitude}:${cafe.longitude}`).join('|')
    // Rebuilding markers drops hover state mid-interaction, so only rebuild when the cafes really change.
    if (key === renderedKeyRef.current && markersRef.current.size > 0) return
    renderedKeyRef.current = key
    let cancelled = false

    void (async () => {
      const maplibregl = await import('maplibre-gl')
      if (cancelled) return
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current.clear()
      for (const cafe of list) {
        const element = markerElement(
          cafe,
          savedSlugsRef.current.includes(cafe.slug),
          cafe.slug === selectedSlugRef.current,
        )
        element.addEventListener('click', () => onSelectRef.current(cafe.slug))
        element.addEventListener('mouseenter', () => onHoverRef.current?.(cafe.slug))
        element.addEventListener('mouseleave', () => onHoverRef.current?.(null))
        const marker = new maplibregl.Marker({ element, anchor: 'bottom' })
          .setLngLat([cafe.longitude, cafe.latitude])
          .addTo(map)
        markersRef.current.set(cafe.slug, { marker, element })
      }
      reportRef.current()
    })()

    return () => {
      cancelled = true
    }
  }, [cafes, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !focusSlug) return
    const cafe = cafesRef.current.find((item) => item.slug === focusSlug)
    if (!cafe) return
    map.easeTo({ center: [cafe.longitude, cafe.latitude], duration: 600 })
  }, [focusSlug, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !locateTarget) return
    map.flyTo({ center: [locateTarget.lon, locateTarget.lat], zoom: 15 })
  }, [locateTarget, ready])

  return (
    <div
      className={
        fill
          ? 'relative h-full overflow-hidden'
          : 'relative overflow-hidden rounded-card border border-border'
      }
    >
      <div
        ref={containerRef}
        className={fill ? 'h-full w-full' : heightClass}
      />
      {failed ? (
        <p className="absolute inset-0 grid place-items-center bg-surface-muted p-6 text-center text-sm text-text-muted">
          O mapa não carregou neste dispositivo. Usa a lista ao lado.
        </p>
      ) : null}
    </div>
  )
}
