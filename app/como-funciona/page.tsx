import Link from 'next/link'
import { AppBar } from '@/components/AppBar'

const WEIGHTS = [
  { label: 'Sabor', value: '40%' },
  { label: 'Textura do leite', value: '30%' },
  { label: 'Temperatura', value: '10%' },
  { label: 'Qualidade-preço', value: '20%' },
]

export default function ComoFuncionaPage() {
  return (
    <>
      <AppBar
        title="Como funciona"
        backHref="/sobre"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-reading gap-6">
          <h1 className="display">O que conta na chávena</h1>

          <div className="card-flat grid gap-3">
            {WEIGHTS.map((item) => (
              <div
                key={item.label}
                className="flex justify-between gap-3"
              >
                <span>{item.label}</span>
                <span className="font-bold text-accent tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>

          <section className="grid gap-2">
            <h2 className="section-title">As visitas recentes pesam mais</h2>
            <p>
              A nota do café é a média ponderada das avaliações visíveis com visitas nos últimos 365
              dias. O peso de cada visita reduz-se a metade a cada 182,5 dias.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="section-title">3 avaliações para entrar no ranking</h2>
            <p>
              Um café precisa de pelo menos 3 avaliações na janela de 365 dias. Abaixo disso
              mostramos a nota com a indicação de poucas avaliações; sem visitas, não há nota.
            </p>
          </section>

          <Link
            href="/"
            className="btn btn-secondary w-fit"
          >
            Explorar cafés
          </Link>
        </div>
      </main>
    </>
  )
}
