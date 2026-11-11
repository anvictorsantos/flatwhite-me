'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationPicker } from '@/components/LocationPicker'

type Result = { slug: string; name: string; area: string | null }

export function SuggestForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [searched, setSearched] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const geocodeSeq = useRef(0)

  async function fillCoordinates() {
    const addressLine = address.trim()
    if (addressLine.length < 3) return
    const seq = ++geocodeSeq.current
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(addressLine)}`).catch(
      () => null,
    )
    if (!response?.ok || seq !== geocodeSeq.current) return
    const found: { latitude: number; longitude: number } = await response.json()
    setLatitude(String(found.latitude))
    setLongitude(String(found.longitude))
  }

  async function reverseFromPin(nextLatitude: number, nextLongitude: number) {
    setLatitude(String(nextLatitude))
    setLongitude(String(nextLongitude))
    const seq = ++geocodeSeq.current
    const response = await fetch(`/api/geocode?lat=${nextLatitude}&lon=${nextLongitude}`).catch(
      () => null,
    )
    if (!response?.ok || seq !== geocodeSeq.current) return
    const found: { address?: string } | null = await response.json().catch(() => null)
    if (found?.address) setAddress(found.address)
  }

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      void fetch(`/api/cafes?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : []))
        .then((data: Result[]) => {
          setResults(data)
          setSearched(true)
        })
        .catch(() => undefined)
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  async function submit() {
    if (busy || name.trim().length < 2) return
    setBusy(true)
    setError(null)
    const body = {
      name: name.trim(),
      addressLine: address.trim(),
      ...(latitude ? { latitude: Number(latitude) } : {}),
      ...(longitude ? { longitude: Number(longitude) } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    }
    const response = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null)
    setBusy(false)

    if (!response) {
      setError('Não foi possível enviar. Tenta outra vez.')
      return
    }
    if (response.status === 401) {
      router.push('/auth/google?next=/sugerir')
      return
    }
    if (!response.ok) {
      const result: { error?: string } | null = await response.json().catch(() => null)
      setError(
        result?.error === 'address_not_found'
          ? 'Não encontrámos essa morada. Tenta incluir a rua e o número.'
          : 'Verifica os campos e tenta outra vez.',
      )
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="card grid gap-3">
        <h2 className="display-sm">Obrigada pela sugestão.</h2>
        <p>
          O café fica pendente até um administrador o rever. Nada aparece no mapa antes da
          aprovação.
        </p>
        <Link
          href="/"
          className="btn btn-primary w-fit"
        >
          Voltar a explorar
        </Link>
      </div>
    )
  }

  const latValue = latitude.trim() === '' ? null : Number(latitude)
  const lonValue = longitude.trim() === '' ? null : Number(longitude)
  const pickedLatitude = latValue !== null && Number.isFinite(latValue) ? latValue : null
  const pickedLongitude = lonValue !== null && Number.isFinite(lonValue) ? lonValue : null

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <label className="field">
          <span>Procurar cafés existentes</span>
          <input
            className="input"
            type="search"
            value={query}
            placeholder="Nome do café ou bairro"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {query.trim().length >= 2 && results.length > 0 ? (
          <ul className="grid gap-1">
            {results.map((result) => (
              <li key={result.slug}>
                <Link
                  href={`/cafe/${result.slug}`}
                  className="flex min-h-11 items-center justify-between gap-2 no-underline hover:underline"
                >
                  <span>{result.name}</span>
                  <span className="meta">{result.area ?? 'Lisboa'}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {query.trim().length >= 2 && searched && results.length === 0 ? (
          <p className="card-flat text-sm">Não encontrámos este café. Podes sugerir abaixo.</p>
        ) : null}
      </section>

      <section
        className="grid gap-3"
        aria-labelledby="suggest-form-title"
      >
        <h2
          id="suggest-form-title"
          className="section-title"
        >
          Sugerir um café em falta
        </h2>

        {error ? (
          <p
            className="card-flat text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3">
            <label className="field">
              <span>Nome do café</span>
              <input
                className="input"
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Morada</span>
              <input
                className="input"
                value={address}
                maxLength={200}
                onChange={(event) => setAddress(event.target.value)}
                onBlur={() => void fillCoordinates()}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="field">
                <span>Latitude (opcional)</span>
                <input
                  className="input"
                  inputMode="decimal"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Longitude (opcional)</span>
                <input
                  className="input"
                  inputMode="decimal"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span>Nota (opcional)</span>
              <textarea
                className="input min-h-24"
                maxLength={280}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <span className="meta">{note.length}/280</span>
            </label>

            <button
              type="button"
              className="btn btn-primary w-fit"
              disabled={busy || name.trim().length < 2 || address.trim().length < 3}
              onClick={() => void submit()}
            >
              {busy ? 'A enviar…' : 'Enviar sugestão'}
            </button>
          </div>

          <div className="grid content-start gap-2">
            <LocationPicker
              latitude={pickedLatitude}
              longitude={pickedLongitude}
              onPick={(nextLatitude, nextLongitude) =>
                void reverseFromPin(nextLatitude, nextLongitude)
              }
            />
            <p className="meta">
              Arrasta o pino ou clica no mapa para ajustar a localização. A morada atualiza sozinha.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
