'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NicknameForm({ current }: { current: string }) {
  const router = useRouter()
  const [value, setValue] = useState(current)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function save() {
    if (busy) return
    setBusy(true)
    setMessage(null)
    const response = await fetch('/api/account/nickname', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nickname: value }),
    }).catch(() => null)
    setBusy(false)
    if (response?.status === 409) {
      setMessage('Essa alcunha já está em uso. Escolhe outra.')
      return
    }
    if (!response || !response.ok) {
      setMessage('Não foi possível guardar a alcunha.')
      return
    }
    setMessage('Alcunha guardada.')
    router.refresh()
  }

  return (
    <div className="grid gap-2">
      <label className="field">
        <span>Alcunha pública</span>
        <input
          className="input"
          value={value}
          maxLength={30}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy || value.trim().length < 2}
          onClick={() => void save()}
        >
          Guardar alcunha
        </button>
        {message ? <p className="meta">{message}</p> : null}
      </div>
    </div>
  )
}
