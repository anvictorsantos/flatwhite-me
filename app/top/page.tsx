import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { CafeCard } from '@/components/CafeCard'
import { RankedTable } from '@/components/RankedTable'
import { RankingPodium } from '@/components/RankingPodium'
import { listCafeSummaries } from '@/lib/cafes-db'

export const dynamic = 'force-dynamic'

export default async function TopPage() {
  const cafes = await listCafeSummaries()
  const ranked = cafes.filter((cafe) => cafe.ratings >= 3)
  const rest = ranked.slice(3, 10)

  return (
    <>
      <AppBar
        title="Top 10 de Lisboa"
        backHref="/sobre"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-app gap-6">
          <div className="grid gap-2">
            <h1 className="display">Onde beber um flat white em Lisboa.</h1>
            <p className="lede">O top 10, segundo quem prova. Sem lugares pagos.</p>
          </div>

          <Link
            href="/"
            className="btn btn-primary w-fit lg:hidden"
          >
            Explorar lista e mapa
          </Link>

          <section
            className="grid gap-3"
            aria-labelledby="top-title"
          >
            <h2
              id="top-title"
              className="section-title"
            >
              {ranked.length} cafés no ranking
            </h2>
            {ranked.length === 0 ? (
              <div className="card-flat grid gap-2">
                <p className="font-semibold">Ainda sem cafés no ranking.</p>
                <p className="meta">
                  Um café entra quando tem 3 avaliações nos últimos 365 dias. Avalia os que já
                  provaste.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden items-start gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_260px]">
                  <RankedTable cafes={ranked.slice(0, 10)} />
                  <aside className="border-l border-border pl-8">
                    <h3 className="text-base font-semibold tracking-tight">Como entra um café</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      Precisa de 3 avaliações nos últimos 365 dias. A nota é a média ponderada das
                      visitas, com o peso a reduzir para metade a cada 182,5 dias.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                      Nenhum café paga para aparecer. A amostra fica sempre à vista.
                    </p>
                    <Link
                      href="/"
                      className="btn btn-secondary mt-4"
                    >
                      Explorar lista e mapa
                    </Link>
                  </aside>
                </div>

                <div className="grid gap-6 lg:hidden">
                  <RankingPodium cafes={ranked} />

                  {ranked.length < 3 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {ranked.map((cafe) => (
                        <CafeCard
                          key={cafe.slug}
                          cafe={cafe}
                        />
                      ))}
                    </div>
                  ) : rest.length > 0 ? (
                    <div className="grid gap-3">
                      <h3 className="text-base font-semibold tracking-tight">Do 4.º ao 10.º</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {rest.map((cafe) => (
                          <CafeCard
                            key={cafe.slug}
                            cafe={cafe}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
