import { AppBar } from '@/components/AppBar'

export default function ContactoPage() {
  return (
    <>
      <AppBar
        title="Contacto"
        backHref="/sobre"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-reading gap-6">
          <h1 className="display">Fala connosco.</h1>
          <p className="lede">
            Para correções de dados, remoções ou qualquer dúvida sobre o ranking.
          </p>
          <div className="card-flat">
            <p className="font-semibold">contacto@flatwhite.me</p>
          </div>
        </div>
      </main>
    </>
  )
}
