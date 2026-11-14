import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { NicknameForm } from '@/components/NicknameForm'
import { getSessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PAGES = [
  { href: '/como-funciona', title: 'Como funciona', note: 'A fórmula e os pesos' },
  { href: '/privacidade', title: 'Privacidade', note: 'O que fica público e privado' },
  { href: '/top', title: 'Top 10 de Lisboa', note: 'O ranking da cidade' },
  { href: '/contacto', title: 'Contacto', note: 'Fala connosco' },
  { href: '/sugerir', title: 'Sugerir café', note: 'Falta um café no diretório' },
] as const

const WEIGHTS = [
  { label: 'Sabor', value: 40, className: 'bg-accent' },
  { label: 'Textura do leite', value: 30, className: 'bg-text-muted/40' },
  { label: 'Temperatura', value: 10, className: 'bg-text-muted/25' },
  { label: 'Qualidade-preço', value: 20, className: 'bg-text-muted/15' },
] as const

export default async function SobrePage() {
  const user = await getSessionUser()

  return (
    <>
      <AppBar
        title="Sobre"
        backHref="/"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-app gap-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
            <div className="grid gap-5">
              <h1 className="display max-w-2xl">Uma boa chávena. Uma nota honesta.</h1>
              <p className="lede max-w-xl">
                O ranking é feito por quem prova. Nenhum café paga para aparecer e nenhuma nota
                editorial altera o resultado.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="btn btn-primary"
                >
                  Explorar cafés
                </Link>
                <Link
                  href="/como-funciona"
                  className="btn btn-secondary"
                >
                  Como funciona
                </Link>
              </div>

              <section
                className="mt-3 grid gap-3 border-t border-border pt-6"
                aria-labelledby="formula-title"
              >
                <h2
                  id="formula-title"
                  className="section-title"
                >
                  A nota
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-text-muted">
                  Cada visita é avaliada em quatro dimensões. A nota do café é a média ponderada das
                  visitas dos últimos 365 dias, com o peso a reduzir para metade a cada 182,5 dias.
                </p>

                <div
                  className="mt-2 flex h-3 overflow-hidden rounded-full"
                  role="img"
                  aria-label="Sabor 40%, textura do leite 30%, temperatura 10%, qualidade-preço 20%"
                >
                  {WEIGHTS.map((weight) => (
                    <span
                      key={weight.label}
                      className={weight.className}
                      style={{ width: `${weight.value}%` }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  {WEIGHTS.map((weight) => (
                    <div key={weight.label}>
                      <p className="text-xs text-text-muted">{weight.label}</p>
                      <p className="text-lg font-semibold tabular-nums">{weight.value}%</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/como-funciona"
                  className="btn btn-secondary mt-2 w-fit"
                >
                  Ler a explicação completa
                </Link>
              </section>
            </div>

            <div className="grid content-start gap-8">
              <nav
                aria-label="Sobre"
                className="grid content-start"
              >
                <h2 className="pb-2 text-xs font-medium text-text-muted">Nesta secção</h2>
                {PAGES.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="grid gap-0.5 border-t border-border py-3 no-underline hover:text-accent-text"
                  >
                    <span className="text-sm font-semibold">{page.title}</span>
                    <span className="text-xs text-text-muted">{page.note}</span>
                  </Link>
                ))}
                {user ? null : (
                  <Link
                    href="/entrar"
                    className="grid gap-0.5 border-t border-border py-3 no-underline hover:text-accent-text"
                  >
                    <span className="text-sm font-semibold">Entrar</span>
                    <span className="text-xs text-text-muted">A tua lista e as tuas provas</span>
                  </Link>
                )}
              </nav>

              <div className="grid gap-2 border-t border-border pt-5">
                <p className="max-w-sm text-2xl leading-tight font-semibold">
                  Nenhum café paga para aparecer.
                </p>
                <p className="max-w-sm text-sm leading-relaxed text-text-muted">
                  A amostra fica sempre à vista. Um café entra no ranking quando tem 3 ou mais
                  avaliações nos últimos 365 dias.
                </p>
              </div>
            </div>
          </div>

          {user ? (
            <section className="max-w-md border-t border-border pt-6">
              <h2 className="section-title">Conta</h2>
              <p className="meta">
                A alcunha aparece nas tuas notas públicas. Podes mudá-la a qualquer momento.
              </p>
              <div className="mt-3">
                <NicknameForm current={user.nickname ?? user.displayName ?? ''} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <form
                  action="/auth/signout"
                  method="post"
                >
                  <button
                    type="submit"
                    className="btn btn-secondary"
                  >
                    Terminar sessão
                  </button>
                </form>
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="btn btn-secondary"
                  >
                    Moderação
                  </Link>
                ) : null}
              </div>
            </section>
          ) : null}

          <div className="border-t border-border pt-6">
            <p className="meta max-w-xl">
              Dados do diretório: Overture Maps. Mapa: OpenFreeMap e OpenStreetMap.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
