import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { ConquestMap } from '@/components/ConquestMap'
import { getSessionUser } from '@/lib/auth'
import { listConquests } from '@/lib/conquests'
import { FREGUESIA_SHAPES } from '@/lib/freguesias'

export const dynamic = 'force-dynamic'

export default async function ConquistasPage() {
  const user = await getSessionUser()
  const conquests = user ? await listConquests(user.id) : []
  const conquered = conquests.filter((conquest) => conquest.conquered).length
  const visited = conquests.reduce((sum, conquest) => sum + conquest.visited, 0)

  return (
    <>
      <AppBar
        title="Conquistas"
        backHref="/"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-app gap-6">
          <div className="grid gap-2">
            <h1 className="display">Conquista a tua freguesia.</h1>
            <p className="lede">
              Avalia todos os cafés de uma freguesia para a conquistares. Lisboa tem 24.
            </p>
          </div>

          {user ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <ConquestMap
                shapes={FREGUESIA_SHAPES}
                conquests={conquests}
              />

              <section
                className="grid gap-3"
                aria-labelledby="freguesias-title"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2
                    id="freguesias-title"
                    className="section-title"
                  >
                    Freguesias
                  </h2>
                  <span className="text-sm text-text-muted tabular-nums">
                    {conquered} de {conquests.length} · {visited} cafés
                  </span>
                </div>

                <ul className="grid gap-0.5 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
                  {conquests.map((conquest) => {
                    const percent =
                      conquest.total > 0
                        ? Math.min(100, Math.round((conquest.visited / conquest.total) * 100))
                        : 0
                    return (
                      <li key={conquest.slug}>
                        <Link
                          href={`/?freguesia=${conquest.slug}`}
                          className="grid gap-1.5 rounded-input px-2 py-2 no-underline hover:bg-surface-muted"
                        >
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-medium">{conquest.name}</span>
                            <span className="text-xs text-text-muted tabular-nums">
                              {conquest.total === 0
                                ? 'Sem cafés'
                                : `${conquest.visited}/${conquest.total}`}
                            </span>
                          </span>
                          <span className="bar-track block">
                            <span
                              className="bar-fill block"
                              style={{ width: `${percent}%` }}
                            />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <ConquestMap
                shapes={FREGUESIA_SHAPES}
                conquests={[]}
              />
              <div className="card-flat grid gap-3">
                <p className="font-semibold">Entra para seguir as tuas conquistas.</p>
                <p className="meta">
                  Cada avaliação conta para a freguesia onde o café está. Nada é publicado por
                  conquistares uma freguesia.
                </p>
                <Link
                  href="/entrar?next=/conquistas"
                  className="btn btn-primary w-fit"
                >
                  Entrar com Google
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
