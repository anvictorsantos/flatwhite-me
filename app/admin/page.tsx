import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { LocationPicker } from '@/components/LocationPicker'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { findDuplicateCandidates } from '@/lib/suggestions'
import { normalizeName } from '@/lib/slugs'
import { fmtDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ cafe?: string }>
}) {
  const user = await getSessionUser()
  const { cafe: cafeQuery } = await searchParams

  if (!user) {
    return (
      <>
        <AppBar
          title="Moderação"
          backHref="/"
          action="search"
        />
        <main className="px-4 py-6 sm:px-6">
          <div className="mx-auto grid w-full max-w-reading gap-3">
            <h1 className="display-sm">Área reservada.</h1>
            <p className="lede">Entra com uma conta de administrador para rever sugestões.</p>
            <a
              className="btn btn-primary w-fit"
              href="/auth/google?next=/admin"
            >
              Entrar com Google
            </a>
          </div>
        </main>
      </>
    )
  }

  if (user.role !== 'admin') {
    return (
      <>
        <AppBar
          title="Moderação"
          backHref="/"
          action="search"
        />
        <main className="px-4 py-6 sm:px-6">
          <div className="mx-auto grid w-full max-w-reading gap-3">
            <h1 className="display-sm">Área reservada.</h1>
            <p className="lede">Esta conta não está na lista de administradores.</p>
            <Link
              href="/"
              className="btn btn-secondary w-fit"
            >
              Voltar a explorar
            </Link>
          </div>
        </main>
      </>
    )
  }

  const [pending, reports] = await Promise.all([
    prisma.cafeSuggestion.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { displayName: true, nickname: true } } },
    }),
    prisma.ratingReport.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'asc' },
      include: {
        rating: { select: { id: true, note: true, cafe: { select: { name: true } } } },
      },
    }),
  ])

  const suggestions = await Promise.all(
    pending.map(async (suggestion) => ({
      ...suggestion,
      duplicates: await findDuplicateCandidates(
        suggestion.name,
        suggestion.latitude,
        suggestion.longitude,
      ),
    })),
  )

  const query = cafeQuery?.trim() ?? ''
  const cafeMatches = query
    ? await prisma.cafe.findMany({
        where: { normalizedName: { contains: normalizeName(query) } },
        orderBy: { name: 'asc' },
        take: 20,
        select: {
          id: true,
          name: true,
          neighborhood: true,
          status: true,
          specialty: true,
        },
      })
    : []

  const [ratingCount, ratedCafes, rankedCafes] = await Promise.all([
    prisma.rating.count({ where: { status: 'visible' } }),
    prisma.rating.findMany({
      where: { status: 'visible' },
      distinct: ['cafeId'],
      select: { cafeId: true },
    }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      select count(*)::bigint as count from cafe_scores where sample_size >= 3
    `,
  ])
  const rankedCount = Number(rankedCafes[0]?.count ?? 0)

  return (
    <>
      <AppBar
        title="Moderação"
        backHref="/"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="grid gap-4">
          <h1 className="display-sm">Rever antes de publicar.</h1>
          <p className="text-sm text-text-muted">
            Área reservada · Administrador · sessão de{' '}
            {user.nickname ?? user.displayName ?? user.email}
          </p>

          <div className="grid grid-cols-2 gap-3 lg:max-w-md">
            <div className="rounded-card bg-surface-muted px-4 py-3">
              <p className="text-3xl font-bold">{suggestions.length}</p>
              <p className="text-sm text-text-muted">
                {suggestions.length === 1 ? 'sugestão' : 'sugestões'}
              </p>
            </div>
            <div className="rounded-card bg-surface-muted px-4 py-3">
              <p className="text-3xl font-bold">{reports.length}</p>
              <p className="text-sm text-text-muted">
                {reports.length === 1 ? 'denúncia' : 'denúncias'}
              </p>
            </div>
          </div>

          <section className="grid gap-2">
            <h2 className="section-title">Lançamento</h2>
            <p className="text-sm text-text-muted">
              {ratingCount} avaliações · {ratedCafes.length} cafés avaliados · {rankedCount} no
              ranking. Meta pública: 100 avaliações em 40 cafés.
            </p>
          </section>

          <section className="grid gap-3">
            <h2 className="section-title">Cafés</h2>
            <form
              action="/admin"
              method="get"
              className="flex flex-wrap gap-2"
            >
              <input
                className="input max-w-md"
                type="search"
                name="cafe"
                defaultValue={query}
                placeholder="Procurar café para fechar ou marcar especialidade"
                aria-label="Procurar café"
              />
              <button
                type="submit"
                className="btn btn-secondary"
              >
                Procurar
              </button>
            </form>
            {query && cafeMatches.length === 0 ? (
              <p className="card-flat">Nenhum café encontrado.</p>
            ) : null}
            {cafeMatches.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {cafeMatches.map((cafe) => (
                  <article
                    key={cafe.id}
                    className="card grid gap-2"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-bold">{cafe.name}</h3>
                      <span className="text-sm text-text-muted">
                        {cafe.neighborhood ?? 'Lisboa'} · {cafe.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cafe.status === 'closed' ? (
                        <form
                          action={`/api/admin/cafes/${cafe.id}`}
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="action"
                            value="reopen"
                          />
                          <button
                            type="submit"
                            className="btn btn-secondary"
                          >
                            Reabrir
                          </button>
                        </form>
                      ) : (
                        <form
                          action={`/api/admin/cafes/${cafe.id}`}
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="action"
                            value="close"
                          />
                          <button
                            type="submit"
                            className="btn btn-secondary"
                          >
                            Fechar
                          </button>
                        </form>
                      )}
                      <form
                        action={`/api/admin/cafes/${cafe.id}`}
                        method="post"
                      >
                        <input
                          type="hidden"
                          name="action"
                          value={cafe.specialty ? 'specialty-off' : 'specialty-on'}
                        />
                        <button
                          type="submit"
                          className="btn btn-secondary"
                        >
                          {cafe.specialty ? 'Remover especialidade' : 'Marcar especialidade'}
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          {suggestions.length === 0 ? (
            <p className="card-flat">Sem sugestões pendentes.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {suggestions.map((suggestion) => (
                <article
                  key={suggestion.id}
                  className="card grid gap-3"
                >
                  <p className="w-fit rounded-full bg-surface-muted px-2.5 py-1 text-sm font-semibold text-warning">
                    Sugestão pendente
                  </p>
                  <h2 className="text-lg font-bold">{suggestion.name}</h2>
                  <p className="text-sm text-text-muted">
                    {suggestion.addressLine ?? 'Sem morada'}
                    <br />
                    Enviada por{' '}
                    {suggestion.user.nickname ?? suggestion.user.displayName ?? 'utilizador'} ·{' '}
                    {fmtDate(suggestion.createdAt.toISOString().slice(0, 10))}
                  </p>
                  {suggestion.latitude === null || suggestion.longitude === null ? (
                    <p className="text-sm font-semibold text-warning">
                      Sem coordenadas: serão obtidas da morada ao aprovar.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-success">
                        Coordenadas presentes: {suggestion.latitude.toFixed(4)},{' '}
                        {suggestion.longitude.toFixed(4)}
                      </p>
                      <LocationPicker
                        latitude={suggestion.latitude}
                        longitude={suggestion.longitude}
                        heightClass="h-48"
                      />
                    </>
                  )}
                  {suggestion.duplicates.length > 0 ? (
                    <div className="card-flat grid gap-2">
                      <p className="text-sm font-semibold">Possíveis duplicados</p>
                      {suggestion.duplicates.map((candidate) => (
                        <form
                          key={candidate.slug}
                          action={`/api/admin/suggestions/${suggestion.id}`}
                          method="post"
                          className="flex items-center justify-between gap-2"
                        >
                          <input
                            type="hidden"
                            name="action"
                            value="merge"
                          />
                          <input
                            type="hidden"
                            name="matchedCafeId"
                            value={candidate.id}
                          />
                          <span className="text-sm">
                            {candidate.name}
                            {candidate.distanceMetres !== null
                              ? ` · ${candidate.distanceMetres} m`
                              : ''}
                          </span>
                          <button
                            type="submit"
                            className="btn btn-secondary"
                          >
                            Fundir
                          </button>
                        </form>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-success">
                      Nenhum duplicado suspeito a menos de 100 m.
                    </p>
                  )}
                  {suggestion.note ? <p>“{suggestion.note}”</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={`/api/admin/suggestions/${suggestion.id}`}
                      method="post"
                    >
                      <input
                        type="hidden"
                        name="action"
                        value="approve"
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Aprovar sugestão
                      </button>
                    </form>
                    <form
                      action={`/api/admin/suggestions/${suggestion.id}`}
                      method="post"
                    >
                      <input
                        type="hidden"
                        name="action"
                        value="reject"
                      />
                      <button
                        type="submit"
                        className="btn btn-secondary"
                      >
                        Rejeitar
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}

          <section className="grid gap-3">
            <h2 className="section-title">Denúncias abertas</h2>
            {reports.length === 0 ? (
              <p className="card-flat">Sem denúncias abertas.</p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {reports.map((report) => (
                  <article
                    key={report.id}
                    className="card grid gap-2"
                  >
                    <p className="text-sm font-semibold text-warning">
                      Nota denunciada · {report.rating.cafe.name}
                    </p>
                    <p className="meta">{report.reason}</p>
                    {report.rating.note ? <p>“{report.rating.note}”</p> : null}
                    <form
                      action={`/api/admin/ratings/${report.rating.id}`}
                      method="post"
                      className="grid gap-2"
                    >
                      <input
                        type="hidden"
                        name="action"
                        value="hide"
                      />
                      <button
                        type="submit"
                        className="btn btn-secondary"
                      >
                        Ocultar nota
                      </button>
                    </form>
                    <form
                      action={`/api/admin/reports/${report.id}`}
                      method="post"
                      className="grid gap-2"
                    >
                      <input
                        type="hidden"
                        name="action"
                        value="dismiss"
                      />
                      <button
                        type="submit"
                        className="btn btn-secondary"
                      >
                        Ignorar denúncia
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
