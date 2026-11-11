'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet } from '@/components/Sheet'
import { useStore } from '@/components/StoreProvider'
import type { CafeRef } from '@/lib/types'
import { fmtDate, todayIso } from '@/lib/format'

const DIMENSIONS = [
  { key: 'sabor', label: 'Sabor' },
  { key: 'textura', label: 'Textura do leite' },
  { key: 'temperatura', label: 'Temperatura' },
  { key: 'valor', label: 'Qualidade-preço' },
] as const

type DimKey = (typeof DIMENSIONS)[number]['key']
type Scores = Record<DimKey, number | null>

const EMPTY: Scores = { sabor: null, textura: null, temperatura: null, valor: null }

const MILKS = [
  { value: 'whole', label: 'Inteiro' },
  { value: 'oat', label: 'Aveia' },
  { value: 'lactose_free', label: 'Sem lactose' },
  { value: 'other', label: 'Outro' },
]

const SIZES = [
  { value: 'regular', label: 'Normal' },
  { value: 'large', label: 'Grande' },
]

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={option.value === value ? 'chip chip-active' : 'chip'}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function RatingDialog({
  cafe,
  open,
  onClose,
}: {
  cafe: CafeRef
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { signedIn, refresh, ratingFor } = useStore()
  const existing = ratingFor(cafe.slug)
  const existingRef = useRef(existing)

  useEffect(() => {
    existingRef.current = existing
  }, [existing])

  const [scores, setScores] = useState<Scores>(EMPTY)
  const [price, setPrice] = useState(((cafe.price ?? 300) / 100).toFixed(2))
  const [milk, setMilk] = useState('whole')
  const [size, setSize] = useState('regular')
  const [visit, setVisit] = useState(todayIso())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    const current = existingRef.current
    setScores(
      current
        ? {
            sabor: current.dims.sabor,
            textura: current.dims.textura,
            temperatura: current.dims.temperatura,
            valor: current.dims.valor,
          }
        : EMPTY,
    )
    setPrice(((current?.price ?? cafe.price ?? 300) / 100).toFixed(2))
    setMilk(current?.milkType ?? 'whole')
    setSize(current?.size ?? 'regular')
    setVisit(current?.visit ?? todayIso())
    setNote(current?.note ?? '')
    setError(null)
    setDone(false)
  }, [open, cafe.slug, cafe.price])

  const complete = DIMENSIONS.every((dimension) => scores[dimension.key] !== null)
  const locked = existing?.locked === true

  async function submit() {
    if (!complete || busy) return

    const cents = Math.round(Number(price.replace(',', '.')) * 100)
    if (!Number.isFinite(cents) || cents < 0 || cents > 2000) {
      setError('Indica um preço entre 0 € e 20 €.')
      return
    }

    setBusy(true)
    setError(null)
    const response = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cafeSlug: cafe.slug,
        taste: scores.sabor,
        milkTexture: scores.textura,
        temperature: scores.temperatura,
        value: scores.valor,
        priceCents: cents,
        milkType: milk,
        size,
        visitedOn: visit,
        note: note.trim() || undefined,
      }),
    }).catch(() => null)
    setBusy(false)

    if (!response) {
      setError('Não foi possível guardar. Tenta outra vez.')
      return
    }
    if (response.status === 401) {
      router.push(`/auth/google?next=${encodeURIComponent(`/cafe/${cafe.slug}`)}`)
      return
    }
    if (response.status === 409) {
      setError('A nota está bloqueada 30 dias depois da primeira visita.')
      return
    }
    if (response.status === 429) {
      setError('Atingiste o limite de 20 avaliações por dia.')
      return
    }
    if (!response.ok) {
      setError('Verifica os valores e tenta outra vez.')
      return
    }

    await refresh()
    setDone(true)
  }

  function closeAfterSave() {
    onClose()
    router.refresh()
  }

  if (!signedIn) {
    return (
      <Sheet
        open={open}
        title="Entrar"
        onClose={onClose}
      >
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold tracking-tight">Entra para guardar e avaliar.</h3>
          <p className="lede">Podes explorar os cafés e ler as notas sem conta.</p>
          <a
            href={`/auth/google?next=${encodeURIComponent(`/cafe/${cafe.slug}`)}`}
            className="btn btn-primary btn-block"
          >
            Continuar com Google
          </a>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={onClose}
          >
            Continuar sem conta
          </button>
        </div>
      </Sheet>
    )
  }

  if (done) {
    return (
      <Sheet
        open={open}
        title="Avaliação guardada"
        onClose={closeAfterSave}
        footer={
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={closeAfterSave}
          >
            Concluir
          </button>
        }
      >
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold tracking-tight">Obrigada pela visita.</h3>
          <p className="lede">
            {cafe.name} · {fmtDate(visit)}
          </p>
          <div className="card-flat grid gap-1 text-sm">
            <p>
              Sabor {scores.sabor} · Textura {scores.textura} · Temperatura {scores.temperatura} ·
              Valor {scores.valor}
            </p>
            <p>{note.trim() ? `“${note.trim()}”` : 'Sem nota pública.'}</p>
          </div>
          <p className="meta">
            A avaliação é pública com o teu nome. A nota pode ser editada mais tarde.
          </p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      open={open}
      title="Avaliar visita"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!complete || busy}
          onClick={() => void submit()}
        >
          {busy ? 'A guardar…' : 'Guardar avaliação'}
        </button>
      }
    >
      <div className="grid gap-5">
        <div className="grid gap-1">
          <h3 className="text-xl font-semibold tracking-tight">{cafe.name}</h3>
          <p className="lede">{existing ? 'Atualiza a tua avaliação.' : 'Como estava o café?'}</p>
          <p className="meta">1 = fraco · 5 = excelente</p>
        </div>

        {error ? (
          <p
            className="card-flat text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {DIMENSIONS.map((dimension) => (
          <fieldset
            key={dimension.key}
            className="grid gap-2"
          >
            <legend className="text-sm font-medium">{dimension.label}</legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = scores[dimension.key] === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setScores((current) => ({ ...current, [dimension.key]: value }))}
                    className={
                      selected
                        ? 'inline-flex size-11 items-center justify-center rounded-full border border-accent bg-accent font-semibold text-accent-contrast'
                        : 'inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface font-semibold'
                    }
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <label className="field">
          <span>Preço pago</span>
          <input
            className="input"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <Segmented
          label="Tipo de leite"
          value={milk}
          options={MILKS}
          onChange={setMilk}
        />

        <Segmented
          label="Tamanho"
          value={size}
          options={SIZES}
          onChange={setSize}
        />

        <label className="field">
          <span>Data da visita</span>
          <input
            className="input"
            type="date"
            max={todayIso()}
            value={visit}
            onChange={(event) => setVisit(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Nota (opcional)</span>
          <textarea
            className="input min-h-24"
            maxLength={280}
            value={note}
            disabled={locked}
            onChange={(event) => setNote(event.target.value)}
          />
          <span className="meta">{locked ? 'A nota está bloqueada.' : `${note.length}/280`}</span>
        </label>
      </div>
    </Sheet>
  )
}
