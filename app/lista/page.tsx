import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { EditRatingButton } from '@/components/EditRatingButton'
import { Icon } from '@/components/Icon'
import { SavedCafeItem } from '@/components/SavedCafeItem'
import { getSessionUser } from '@/lib/auth'
import { getCafeSummaries } from '@/lib/cafes-db'
import { prisma } from '@/lib/db'
import { fmtDate, fmtScore } from '@/lib/format'

const DAY_MS = 24 * 60 * 60 * 1000

// Same weights as the public ranking: taste 40, texture 30, temperature 10, value 20.
function weightedScore(rating: {
  taste: number
  milkTexture: number
  temperature: number
  value: number
}): number {
  const score =
    rating.taste * 0.4 + rating.milkTexture * 0.3 + rating.temperature * 0.1 + rating.value * 0.2
  return Math.round(score * 10) / 10
}

export const dynamic = 'force-dynamic'

export default async function ListaPage() {
  const user = await getSessionUser()

  const [savedSlugs, ratings] = user
    ? await Promise.all([
        prisma.wantToTry
          .findMany({ where: { userId: user.id }, select: { cafe: { select: { slug: true } } } })
          .then((rows) => rows.map((row) => row.cafe.slug)),
        prisma.rating.findMany({
          where: { userId: user.id, status: 'visible' },
          orderBy: { visitedOn: 'desc' },
          include: { cafe: { select: { slug: true, name: true } } },
        }),
      ])
    : [[], []]
  const savedCafes = await getCafeSummaries(savedSlugs)

  return (
    <>
      <AppBar
        title="A minha lista"
        backHref="/"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-app gap-8">
          <div className="grid gap-2">
            <h1 className="display">A minha lista.</h1>
            <p className="lede">
              {user
                ? `${savedCafes.length} ${savedCafes.length === 1 ? 'guardado' : 'guardados'} · ${ratings.length} ${ratings.length === 1 ? 'avaliação' : 'avaliações'}. Só tu vês esta página.`
                : 'Guarda cafés para a próxima visita e regista o que já provaste.'}
            </p>
          </div>

          {user ? (
            <>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                <section
                  className="grid gap-3"
                  aria-labelledby="saved-title"
                >
                  <div className="flex items-baseline justify-between gap-3 border-t border-text pt-3">
                    <h2
                      id="saved-title"
                      className="section-title"
                    >
                      Guardados
                    </h2>
                    <span className="text-xs text-text-muted tabular-nums">
                      {savedCafes.length}
                    </span>
                  </div>

                  {savedCafes.length === 0 ? (
                    <div className="grid justify-items-start gap-3 py-2">
                      <p className="text-sm text-text-muted">Ainda não guardaste cafés.</p>
                      <Link
                        href="/"
                        className="btn btn-secondary"
                      >
                        Explorar cafés
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {savedCafes.map((cafe) => (
                        <SavedCafeItem
                          key={cafe.slug}
                          cafe={cafe}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section
                  className="grid gap-3"
                  aria-labelledby="ratings-title"
                >
                  <div className="flex items-baseline justify-between gap-3 border-t border-text pt-3">
                    <h2
                      id="ratings-title"
                      className="section-title"
                    >
                      Avaliações
                    </h2>
                    <span className="text-xs text-text-muted tabular-nums">{ratings.length}</span>
                  </div>

                  {ratings.length === 0 ? (
                    <div className="grid justify-items-start gap-3 py-2">
                      <p className="text-sm text-text-muted">Ainda não avaliaste nenhum café.</p>
                      <Link
                        href="/"
                        className="btn btn-secondary"
                      >
                        Avaliar um café
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {ratings.map((rating) => {
                        const locked =
                          rating.note !== null &&
                          // eslint-disable-next-line react-hooks/purity -- server-rendered page
                          Date.now() - rating.createdAt.getTime() > 30 * DAY_MS
                        return (
                          <article
                            key={rating.id}
                            className="card grid gap-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="grid min-w-0 gap-0.5">
                                <h3 className="text-base leading-tight font-semibold tracking-tight">
                                  <Link
                                    href={`/cafe/${rating.cafe.slug}`}
                                    className="no-underline hover:underline"
                                  >
                                    {rating.cafe.name}
                                  </Link>
                                </h3>
                                <p className="text-xs text-text-muted">
                                  Visita · {fmtDate(rating.visitedOn.toISOString().slice(0, 10))}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl leading-none font-semibold tabular-nums">
                                  {fmtScore(weightedScore(rating))}
                                </p>
                                <p className="mt-1 text-xs text-text-muted">de 5</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              <span className="flex justify-between gap-2">
                                <span className="text-text-muted">Sabor</span>
                                <b className="tabular-nums">{rating.taste}</b>
                              </span>
                              <span className="flex justify-between gap-2">
                                <span className="text-text-muted">Leite</span>
                                <b className="tabular-nums">{rating.milkTexture}</b>
                              </span>
                              <span className="flex justify-between gap-2">
                                <span className="text-text-muted">Temperatura</span>
                                <b className="tabular-nums">{rating.temperature}</b>
                              </span>
                              <span className="flex justify-between gap-2">
                                <span className="text-text-muted">Valor</span>
                                <b className="tabular-nums">{rating.value}</b>
                              </span>
                            </div>

                            {rating.note ? (
                              <p className="text-sm leading-relaxed">“{rating.note}”</p>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                              <p className="text-xs text-text-muted">
                                {locked
                                  ? 'Nota bloqueada.'
                                  : `Editável até ${fmtDate(
                                      new Date(rating.createdAt.getTime() + 30 * DAY_MS)
                                        .toISOString()
                                        .slice(0, 10),
                                    )}.`}
                              </p>
                              <EditRatingButton
                                cafe={{
                                  slug: rating.cafe.slug,
                                  name: rating.cafe.name,
                                  price: rating.priceCents,
                                }}
                              />
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>
            </>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
              <div className="card-flat grid max-w-md gap-3">
                <p className="font-semibold">Entra para guardar cafés e registar provas.</p>
                <p className="meta">
                  A tua lista e as tuas notas ficam privadas. Cada avaliação conta para a freguesia
                  onde o café está.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/entrar?next=/lista"
                    className="btn btn-primary"
                  >
                    Entrar com Google
                  </Link>
                  <Link
                    href="/"
                    className="btn btn-secondary"
                  >
                    Explorar cafés
                  </Link>
                </div>
              </div>

              <ul className="grid content-start border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:pl-10">
                <li className="flex gap-3 border-b border-border py-4">
                  <span className="mt-0.5 text-text-muted">
                    <Icon name="heart" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Guarda cafés</span>
                    <span className="mt-0.5 block text-sm text-text-muted">
                      Marca os que queres provar e tens a lista à mão.
                    </span>
                  </span>
                </li>
                <li className="flex gap-3 border-b border-border py-4">
                  <span className="mt-0.5 text-text-muted">
                    <Icon name="coffee" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Regista provas</span>
                    <span className="mt-0.5 block text-sm text-text-muted">
                      Cada visita fica com nota, data e uma nota escrita.
                    </span>
                  </span>
                </li>
                <li className="flex gap-3 border-b border-border py-4">
                  <span className="mt-0.5 text-text-muted">
                    <Icon name="star" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Conquista freguesias</span>
                    <span className="mt-0.5 block text-sm text-text-muted">
                      Avalia todos os cafés de uma freguesia e vê o mapa encher.
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
