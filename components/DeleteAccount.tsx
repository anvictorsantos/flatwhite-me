'use client'

import { useState } from 'react'

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        className="btn btn-secondary w-fit"
        onClick={() => setConfirming(true)}
      >
        Eliminar a minha conta
      </button>
    )
  }

  return (
    <form
      action="/api/account/delete"
      method="post"
      className="card-flat grid gap-3"
    >
      <p className="font-semibold text-danger">
        A conta, as notas e a lista são eliminadas. As avaliações ficam anónimas. Não pode ser
        desfeito.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="btn btn-primary"
        >
          Sim, eliminar
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
