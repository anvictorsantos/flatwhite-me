'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map, Marker } from 'maplibre-gl'

const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty'
const LISBON: [number, number] = [-9.1425, 38.7223]

type LocationPickerProps = {
  latitude: number | null
  longitude: number | null
  onPick?: (latitude: number, longitude: number) => void
  heightClass?: string
}

export function LocationPicker({
  latitude,
  longitude,
  onPick,
  heightClass = 'h-[360px]',
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const onPickRef = useRef(onPick)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

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
          center: LISBON,
          zoom: 12.4,
          attributionControl: false,
        })
        map = instance
        mapRef.current = instance
        instance.on('load', () => setReady(true))
        instance.on('click', (event) => {
          onPickRef.current?.(event.lngLat.lat, event.lngLat.lng)
        })
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      markerRef.current?.remove()
      markerRef.current = null
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

      if (latitude === null || longitude === null) {
        markerRef.current?.remove()
        markerRef.current = null
        return
      }

      if (!markerRef.current) {
        const element = document.createElement('div')
        element.className = onPickRef.current
          ? 'map-pin map-pin--selected cursor-grab'
          : 'map-pin map-pin--selected'
        const pin = document.createElement('img')
        pin.src = '/pins/map_pin_cup.png'
        pin.style.height = '48px'
        pin.alt = ''
        element.append(pin)

        const marker = new maplibregl.Marker({
          element,
          anchor: 'bottom',
          draggable: Boolean(onPickRef.current),
        })
          .setLngLat([longitude, latitude])
          .addTo(map)
        marker.on('dragend', () => {
          const position = marker.getLngLat()
          onPickRef.current?.(position.lat, position.lng)
        })
        markerRef.current = marker
      } else {
        markerRef.current.setLngLat([longitude, latitude])
      }

      const center = map.getCenter()
      if (Math.abs(center.lat - latitude) > 0.0005 || Math.abs(center.lng - longitude) > 0.0005) {
        map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 15) })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [latitude, longitude, ready])

  return (
    <div className="relative overflow-hidden rounded-card border border-border">
      <div
        ref={containerRef}
        className={`${heightClass} w-full`}
      />
      {failed ? (
        <p className="absolute inset-0 grid place-items-center bg-surface-muted p-6 text-center text-sm text-text-muted">
          O mapa não carregou. Podes preencher a latitude e a longitude à mão.
        </p>
      ) : null}
      <p className="border-t border-border bg-surface px-3 py-2 text-xs text-text-muted">
        © OpenFreeMap · © OpenMapTiles · Data from OpenStreetMap
      </p>
    </div>
  )
}
