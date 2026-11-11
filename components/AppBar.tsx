import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/Icon'

type AppBarProps = {
  title?: string
  backHref?: string
  action?: 'search' | 'city' | 'none'
}

export function AppBar({ title, backHref, action = 'none' }: AppBarProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 border-b border-border bg-bg px-4 py-2 lg:hidden">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Voltar"
          className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-muted"
        >
          <Icon
            name="back"
            size={24}
          />
        </Link>
      ) : (
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 no-underline"
        >
          <Image
            src="/brand/app_icon_terracotta.png"
            alt=""
            width={330}
            height={320}
            priority
            className="size-10"
          />
          <span className="text-lg font-bold tracking-tight">Flat White Me</span>
        </Link>
      )}

      {title ? (
        <span className="flex-1 text-center font-semibold">{title}</span>
      ) : (
        <span className="flex-1" />
      )}

      {action === 'city' ? (
        <span className="shrink-0 rounded-full bg-surface-muted px-3.5 py-1.5 text-sm font-medium text-text-muted">
          Lisboa
        </span>
      ) : action === 'search' ? (
        <Link
          href="/"
          aria-label="Pesquisar"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted"
        >
          <Icon
            name="search"
            size={22}
          />
        </Link>
      ) : (
        <span
          className="size-11 shrink-0"
          aria-hidden="true"
        />
      )}
    </header>
  )
}
