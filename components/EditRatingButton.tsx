'use client'

import { useState } from 'react'
import { RatingDialog } from '@/components/RatingDialog'
import type { CafeRef } from '@/lib/types'

export function EditRatingButton({ cafe }: { cafe: CafeRef }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(true)}
      >
        Editar avaliação
      </button>
      <RatingDialog
        cafe={cafe}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
