'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '@/components/Icon'

type SheetProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Sheet({ open, title, onClose, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[92dvh] w-full max-w-none rounded-t-sheet border-0 bg-surface p-0 backdrop:bg-text/40 sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-sheet"
    >
      <div className="flex max-h-[92dvh] flex-col">
        <div
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border"
          aria-hidden="true"
        />
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
          <span
            className="size-11"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <Icon
              name="close"
              size={22}
            />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="border-t border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  )
}
