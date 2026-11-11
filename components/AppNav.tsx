'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/Icon'
import type { SessionUser } from '@/lib/auth'

const items: ReadonlyArray<{ href: string; label: string; icon: IconName }> = [
  { href: '/', label: 'Explorar', icon: 'search' },
  { href: '/lista', label: 'Lista', icon: 'heart' },
  { href: '/conquistas', label: 'Conquistas', icon: 'star' },
  { href: '/sobre', label: 'Sobre', icon: 'info' },
]

const desktopItems: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Explorar' },
  { href: '/lista', label: 'Lista' },
  { href: '/conquistas', label: 'Conquistas' },
  { href: '/top', label: 'Top 10' },
  { href: '/sobre', label: 'Sobre' },
]

export function AppNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()
  const active = (href: string) =>
    href === '/'
      ? pathname === '/' ||
        pathname.startsWith('/mapa') ||
        pathname.startsWith('/cafe') ||
        pathname.startsWith('/best-flat-white-lisbon')
      : pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-30 hidden border-b border-border bg-bg lg:block">
        <div className="mx-auto flex h-16 w-full max-w-app items-center gap-8 px-6">
          <Link
            href="/"
            aria-label="Flat White Me"
            className="flex shrink-0 items-center gap-2 no-underline"
          >
            <Image
              src="/brand/app_icon_terracotta.png"
              alt=""
              width={330}
              height={320}
              priority
              className="size-9"
            />
            <span className="text-base font-semibold tracking-tight">Flat White Me</span>
          </Link>

          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-6"
          >
            {desktopItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? 'page' : undefined}
                className="text-sm font-medium text-text-muted no-underline hover:text-text aria-[current=page]:font-semibold aria-[current=page]:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-text-muted">
              Lisboa
            </span>
            {user ? (
              <span className="text-sm font-medium">
                {user.nickname ?? user.displayName ?? 'Sessão iniciada'}
              </span>
            ) : (
              <Link
                href="/entrar"
                className="text-sm font-medium text-accent-text no-underline hover:underline"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-surface px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active(item.href) ? 'page' : undefined}
            className="tabbar-link"
          >
            <Icon
              name={item.icon}
              size={24}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
