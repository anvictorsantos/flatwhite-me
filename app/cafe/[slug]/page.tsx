import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import { AppBar } from '@/components/AppBar'
import { CafeActions } from '@/components/CafeActions'
import { ReportNote } from '@/components/ReportNote'
import { ScoreBadge } from '@/components/ScoreBadge'
import { fmtDate, fmtPrice, fmtScore } from '@/lib/format'
import { statusLabel } from '@/lib/status'
import { getCafeSummary } from '@/lib/cafes-db'
import { prisma } from '@/lib/db'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const getCafe = cache(getCafeSummary)

const DIMENSIONS = [
  { key: 'sabor', label: 'Sabor' },
  { key: 'textura', label: 'Textura do leite' },
  { key: 'temperatura', label: 'Temperatura' },
  { key: 'valor', label: 'Qualidade-preço' },
] as const

const MILK_LABELS = {
  whole: 'inteiro',
  oat: 'de aveia',
  lactose_free: 'sem lactose',
  other: 'outro',
} as const

const SIZE_LABELS = {
  regular: 'normal',
  large: 'grande',
} as const

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const cafe = await getCafe(slug)
  if (!cafe) return { title: 'Café não encontrado' }

  const description =
    cafe.score !== null
      ? `${cafe.name}, ${cafe.area ?? 'Lisboa'}: ${fmtScore(cafe.score)} de 5 em ${cafe.ratings} avaliações.`
      : `${cafe.name}, ${cafe.area ?? 'Lisboa'}. Ainda sem avaliações de flat white.`

  return {
    title: `${cafe.name} — flat white em Lisboa`,
    description,
    alternates: { canonical: `${siteUrl}/cafe/${cafe.slug}` },
    openGraph: {
      title: `${cafe.name} · Flat White Me`,
      description,
      url: `${siteUrl}/cafe/${cafe.slug}`,
    },
  }
}

export default async function CafePage({ params }: Params) {
  const { slug } = await params
  const cafe = await getCafe(slug)
  if (!cafe) notFound()

  const status = statusLabel(cafe.ratings)
  const rated = cafe.score !== null && cafe.dims !== null
  const notes = await prisma.rating.findMany({
    where: { status: 'visible', note: { not: null }, cafe: { slug } },
    orderBy: { visitedOn: 'desc' },
    take: 10,
    select: {
      id: true,
      note: true,
      visitedOn: true,
      user: { select: { displayName: true, nickname: true } },
    },
  })
  const jsonLd =
    rated && cafe.ratings >= 3
      ? {
          '@context': 'https://schema.org',
          '@type': 'CafeOrCoffeeShop',
          name: cafe.name,
          address: { '@type': 'PostalAddress', addressLocality: 'Lisboa', addressCountry: 'PT' },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: cafe.latitude,
            longitude: cafe.longitude,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: cafe.score,
            reviewCount: cafe.ratings,
            bestRating: 5,
          },
        }
      : null

  return (
    <>
      <AppBar
        title={cafe.name}
        backHref="/"
        action="search"
      />

      <main className="px-4 py-6 sm:px-6">
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
            }}
          />
        ) : null}
        <nav
          className="mb-4 hidden lg:block"
          aria-label="Migalhas"
        >
          <Link
            href="/"
            className="text-sm text-text-muted no-underline hover:underline"
          >
            ← Explorar Lisboa
          </Link>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="grid gap-6 lg:col-start-1 lg:row-start-1">
            <div className="grid gap-1">
              <p className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                {cafe.area ?? 'Lisboa'}
                {cafe.specialty ? (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                    Especialidade
                  </span>
                ) : null}
              </p>
              <h1 className="display">{cafe.name}</h1>
            </div>

            <div className="card grid gap-3 lg:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ScoreBadge
                  score={cafe.score}
                  large
                />
                <p className={`text-sm font-semibold ${status.className}`}>{status.text}</p>
              </div>
              {cafe.ratings > 0 ? (
                <p className="text-sm text-text-muted">
                  <span className="font-semibold text-text">{cafe.ratings} avaliações</span> nos
                  últimos 365 dias
                  {cafe.lastVisit ? (
                    <>
                      <br />
                      Última visita · {fmtDate(cafe.lastVisit)}
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          </div>

          <aside className="grid gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-border lg:pl-7">
            <div className="hidden gap-2 lg:grid">
              <p className="flex items-baseline gap-2">
                {cafe.score !== null ? (
                  <>
                    <span className="text-7xl leading-none font-semibold tracking-tight tabular-nums">
                      {fmtScore(cafe.score)}
                    </span>
                    <span className="text-xl text-text-muted">/5</span>
                  </>
                ) : (
                  <span className="text-xl font-semibold text-text-muted">Sem nota</span>
                )}
              </p>
              <p className={`text-sm font-semibold ${status.className}`}>{status.text}</p>
              {cafe.ratings > 0 ? (
                <p className="text-sm text-text-muted">
                  {cafe.ratings} avaliações
                  {cafe.lastVisit ? ` · última ${fmtDate(cafe.lastVisit)}` : ''}
                </p>
              ) : null}
            </div>
            <CafeActions cafe={{ slug: cafe.slug, name: cafe.name, price: cafe.price }} />
          </aside>

          <div className="grid gap-6 lg:col-start-1 lg:row-start-2">
            {rated ? (
              <section
                className="grid gap-4"
                aria-labelledby="dims-title"
              >
                <h2
                  id="dims-title"
                  className="section-title"
                >
                  Cada detalhe conta
                </h2>
                {DIMENSIONS.map((dimension) => {
                  const value = cafe.dims?.[dimension.key] ?? 0
                  return (
                    <div
                      key={dimension.key}
                      className="grid gap-1.5"
                    >
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-medium">{dimension.label}</span>
                        <span className="font-semibold tabular-nums">{fmtScore(value)} / 5</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="flex flex-wrap gap-2 pt-1">
                  {cafe.price !== null ? (
                    <span className="fact">
                      Preço médio <b>{fmtPrice(cafe.price)}</b>
                    </span>
                  ) : null}
                  {cafe.milkType ? (
                    <span className="fact">
                      Leite mais pedido <b>{MILK_LABELS[cafe.milkType]}</b>
                    </span>
                  ) : null}
                  {cafe.size ? (
                    <span className="fact">
                      Tamanho mais pedido <b>{SIZE_LABELS[cafe.size]}</b>
                    </span>
                  ) : null}
                  <span className="fact">{cafe.specialty ? 'Especialidade' : 'Café'}</span>
                </div>
              </section>
            ) : (
              <section className="grid gap-3">
                <h2 className="section-title">A primeira visita conta</h2>
                <div className="card-flat grid gap-2">
                  <p className="text-base font-semibold">
                    {cafe.price !== null
                      ? `Preço médio ${fmtPrice(cafe.price)}`
                      : 'Preço ainda não indicado'}
                  </p>
                  <p className="meta">Ainda sem dados de leite ou tamanho.</p>
                </div>
              </section>
            )}

            <section className="grid gap-3">
              <h2 className="section-title">Notas públicas</h2>
              {notes.length === 0 ? (
                <p className="meta">Ainda não há notas públicas.</p>
              ) : (
                <div className="grid gap-3">
                  {notes.map((note) => {
                    const author = note.user?.nickname ?? note.user?.displayName ?? 'Anónimo'
                    return (
                      <article
                        key={note.id}
                        className="card-flat grid gap-2"
                      >
                        <p className="text-sm">“{note.note}”</p>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="avatar">{author.charAt(0).toUpperCase()}</span>
                            <span>
                              {author} · {fmtDate(note.visitedOn.toISOString().slice(0, 10))}
                            </span>
                          </div>
                          <ReportNote ratingId={note.id} />
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
