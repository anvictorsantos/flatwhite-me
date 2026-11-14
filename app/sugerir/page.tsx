import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { SuggestForm } from '@/components/SuggestForm'
import { getSessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function SugerirPage() {
  const user = await getSessionUser()

  return (
    <>
      <AppBar
        title="Sugerir café"
        backHref="/"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-app gap-6">
          <div className="grid gap-2">
            <h1 className="display">Conheces um café que falta aqui?</h1>
            <p className="lede">
              Procura primeiro. As sugestões são revistas antes de aparecerem no mapa.
            </p>
          </div>

          {user ? (
            <SuggestForm />
          ) : (
            <div className="card-flat grid gap-3">
              <p className="font-semibold">Entra para sugerir um café.</p>
              <p className="meta">
                A sugestão fica pendente até um administrador a aprovar. Nada é publicado
                automaticamente.
              </p>
              <Link
                href="/entrar?next=/sugerir"
                className="btn btn-primary w-fit"
              >
                Entrar com Google
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
