'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet } from '@/components/Sheet'
import { useStore } from '@/components/StoreProvider'

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Ofensiva' },
  { value: 'wrong_place', label: 'Lugar errado' },
  { value: 'other', label: 'Outro' },
] as const

export function ReportNote({ ratingId }: { ratingId: string }) {
  const router = useRouter()
  const { signedIn } = useStore()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('spam')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit() {
    if (busy) return
    if (!signedIn) {
      router.push('/auth/google?next=' + encodeURIComponent(window.location.pathname))
      return
    }
    setBusy(true)
    setError(null)
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ratingId, reason }),
    }).catch(() => null)
    setBusy(false)
    if (!response || !response.ok) {
      setError('Não foi possível enviar a denúncia. Tenta outra vez.')
      return
    }
    setDone(true)
  }

  return (
    <>
      <button
        type="button"
        className="text-sm text-text-muted underline"
        onClick={() => {
          setDone(false)
          setOpen(true)
        }}
      >
        Denunciar
      </button>

      <Sheet
        open={open}
        title="Denunciar nota"
        onClose={() => setOpen(false)}
        footer={
          done ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setOpen(false)}
            >
              Concluir
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={busy}
              onClick={() => void submit()}
            >
              {busy ? 'A enviar…' : 'Enviar denúncia'}
            </button>
          )
        }
      >
        {done ? (
          <div className="grid gap-3">
            <h3 className="display-sm">Denúncia enviada.</h3>
            <p className="lede">Obrigada por ajudares a manter as notas relevantes.</p>
            <div className="card-flat">
              A nota não é ocultada automaticamente. A decisão cabe à moderação.
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="display-sm">Porque estás a denunciar?</h3>
            {error ? (
              <p
                className="card-flat text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className="grid gap-2">
              {REASONS.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-11 items-center gap-3"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}
