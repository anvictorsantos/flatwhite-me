import Link from 'next/link'
import type { Metadata } from 'next'
import { AppBar } from '@/components/AppBar'
import { CafeCard } from '@/components/CafeCard'
import { RankingPodium } from '@/components/RankingPodium'
import { listCafeSummaries } from '@/lib/cafes-db'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Melhor flat white em Lisboa — ranking 2026',
  description:
    'O ranking de flat white em Lisboa, avaliado por quem bebeu. Nota transparente, amostra visível, sem lugares pagos.',
  alternates: { canonical: `${siteUrl}/best-flat-white-lisbon` },
  openGraph: {
    title: 'Melhor flat white em Lisboa — ranking 2026',
    description: 'O ranking de flat white em Lisboa, avaliado por quem bebeu. Sem lugares pagos.',
    url: `${siteUrl}/best-flat-white-lisbon`,
  },
}

export default async function LandingPage() {
  const cafes = await listCafeSummaries()
  const ranked = cafes.filter((cafe) => cafe.ratings >= 3)

  return (
    <>
      <AppBar action="city" />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-app gap-8">
          <section className="grid gap-3">
            <h1 className="display">O melhor flat white de Lisboa.</h1>
            <p className="lede">Avaliado por quem bebeu. Sem publicidade, sem lugares pagos.</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="#top-10"
                className="btn btn-primary"
              >
                Ver o ranking
              </a>
              <Link
                href="/"
                className="btn btn-secondary"
              >
                Explorar lista e mapa
              </Link>
            </div>
          </section>

          <section
            id="top-10"
            className="grid gap-3"
            aria-labelledby="top-title"
          >
            <h2
              id="top-title"
              className="section-title"
            >
              {ranked.length} cafés no ranking
            </h2>
            <p className="meta">Só entram cafés com 3 ou mais avaliações nos últimos 365 dias.</p>
            {ranked.length === 0 ? (
              <div className="card-flat grid gap-2">
                <p className="font-semibold">Ainda sem cafés no ranking.</p>
                <p className="meta">O ranking abre com as primeiras três avaliações.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {ranked.length >= 3 ? <RankingPodium cafes={ranked} /> : null}
                <div className="grid gap-3 md:grid-cols-2">
                  {(ranked.length >= 3 ? ranked.slice(3, 10) : ranked).map((cafe) => (
                    <CafeCard
                      key={cafe.slug}
                      cafe={cafe}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section
            className="grid gap-3"
            aria-labelledby="how-title"
          >
            <h2
              id="how-title"
              className="section-title"
            >
              Como funciona a nota
            </h2>
            <p>
              Cada visita é avaliada em sabor (40%), textura do leite (30%), temperatura (10%) e
              qualidade-preço (20%). A nota do café é a média ponderada das visitas dos últimos 365
              dias, com o peso a reduzir-se para metade a cada 182,5 dias.
            </p>
            <Link
              href="/como-funciona"
              className="btn btn-secondary w-fit"
            >
              Ler a explicação completa
            </Link>
          </section>

          <footer className="grid gap-2 border-t border-border pt-6">
            <p className="meta">Diretório: Overture Maps. Mapa: OpenFreeMap e OpenStreetMap.</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/sobre">Sobre</Link>
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/contacto">Contacto</Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  )
}
