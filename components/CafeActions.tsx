'use client'

import Link from 'next/link'
import { useState } from 'react'
import { RatingDialog } from '@/components/RatingDialog'
import { useStore } from '@/components/StoreProvider'
import type { CafeRef } from '@/lib/types'

export function CafeActions({ cafe }: { cafe: CafeRef }) {
  const [open, setOpen] = useState(false)
  const { signedIn } = useStore()

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={() => setOpen(true)}
      >
        Avaliar este café
      </button>
      {signedIn ? (
        <Link
          href="/lista"
          className="btn btn-secondary btn-block"
        >
          Ver a minha lista
        </Link>
      ) : (
        <Link
          href="/entrar"
          className="btn btn-secondary btn-block"
        >
          Quero experimentar
        </Link>
      )}
      {signedIn ? null : (
        <p className="meta">Entra com Google para guardar e avaliar. A tua lista é privada.</p>
      )}
      <RatingDialog
        cafe={cafe}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}
