import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  lede?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, lede, actions }: PageHeaderProps) {
  return (
    <header className="grid gap-3">
      {eyebrow ? <p className="text-sm font-medium text-text-muted">{eyebrow}</p> : null}
      <h1 className="display">{title}</h1>
      {lede ? <div className="lede">{lede}</div> : null}
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
