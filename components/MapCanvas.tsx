'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map, Marker } from 'maplibre-gl'
import type { CafeSummary } from '@/lib/types'
import { fmtScore } from '@/lib/format'

const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty'

type MapCanvasProps = {
  cafes: readonly CafeSummary[]
  savedSlugs: readonly string[]
  selectedSlug?: string | undefined
  onSelect: (slug: string) => void
  onVisibleChange: (slugs: string[]) => void
  locateNonce: number
  onLocateError: (message: string) => void
  fill?: boolean
  heightClass?: string | undefined
}

const PINS = {
  ranked: { src: '/pins/map_pin_rating.png', height: 49 },
  few: { src: '/pins/map_pin_few_ratings.png', height: 33 },
  unrated: { src: '/pins/map_pin_unrated.png', height: 15 },
  selected: { src: '/pins/map_pin_cup.png', height: 55 },
} as const

function markerElement(cafe: CafeSummary, saved: boolean, selected: boolean): HTMLButtonElement {
  const element = document.createElement('button')
  element.type = 'button'
  const kind = cafe.ratings >= 3 ? 'ranked' : cafe.ratings > 0 ? 'few' : 'unrated'
  element.className = [
    'map-pin',
    saved ? 'map-pin--saved' : '',
    selected ? 'map-pin--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
  element.setAttribute(
    'aria-label',
    `${cafe.name}${cafe.ratings > 0 ? `, ${fmtScore(cafe.score)}` : ', sem nota'}${
      saved ? ', guardado' : ''
    }`,
  )

  if (kind === 'ranked') {
    const score = document.createElement('span')
    score.className = 'map-pin-score'
    score.textContent = fmtScore(cafe.score)
    element.append(score)
  }

  const pin = document.createElement('img')
  const config = selected ? PINS.selected : PINS[kind]
  pin.src = config.src
  pin.style.height = `${config.height}px`
  pin.alt = ''
  element.append(pin)

  return element
}

export function MapCanvas({
  cafes,
  savedSlugs,
  selectedSlug,
  onSelect,
  onVisibleChange,
  locateNonce,
  onLocateError,
  fill = false,
  heightClass = 'h-[420px] w-full sm:h-[520px]',
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])
  const cafesRef = useRef(cafes)
  const onSelectRef = useRef(onSelect)
  const onVisibleRef = useRef(onVisibleChange)
  const onLocateErrorRef = useRef(onLocateError)
  const reportRef = useRef<() => void>(() => undefined)
  const lastReportRef = useRef<string[] | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    cafesRef.current = cafes
    onSelectRef.current = onSelect
    onVisibleRef.current = onVisibleChange
    onLocateErrorRef.current = onLocateError
  }, [cafes, onSelect, onVisibleChange, onLocateError])

  useEffect(() => {
    let map: Map | null = null
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
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    let cancelled = false

    void (async () => {
      const maplibregl = await import('maplibre-gl')
      if (cancelled) return
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = cafes.map((cafe) => {
        const element = markerElement(
          cafe,
          savedSlugs.includes(cafe.slug),
          cafe.slug === selectedSlug,
        )
        element.addEventListener('click', () => onSelectRef.current(cafe.slug))
        return new maplibregl.Marker({ element, anchor: 'bottom' })
          .setLngLat([cafe.longitude, cafe.latitude])
          .addTo(map)
      })
      reportRef.current()
    })()

    return () => {
      cancelled = true
    }
  }, [cafes, savedSlugs, selectedSlug, ready])

  useEffect(() => {
    if (locateNonce === 0) return
    const map = mapRef.current
    if (!map) return
    if (!navigator.geolocation) {
      onLocateErrorRef.current('Este dispositivo não permite localização.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15,
        })
      },
      () => onLocateErrorRef.current('Sem permissão de localização. O mapa fica em Lisboa.'),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [locateNonce])

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
