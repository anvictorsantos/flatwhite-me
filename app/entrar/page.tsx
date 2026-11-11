import Link from 'next/link'
import { AppBar } from '@/components/AppBar'
import { getSessionUser, safeNextPath } from '@/lib/auth'

const ERRORS: Record<string, string> = {
  config: 'A autenticação Google não está configurada neste ambiente.',
  state: 'A sessão de entrada expirou. Tenta outra vez.',
  token: 'O Google não devolveu uma sessão válida. Tenta outra vez.',
  profile: 'Não foi possível ler o teu perfil Google. Tenta outra vez.',
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; auth?: string }>
}) {
  const { next, auth } = await searchParams
  const user = await getSessionUser()
  const nextPath = safeNextPath(next ?? null)
  const error = auth ? (ERRORS[auth] ?? 'Não foi possível entrar. Tenta outra vez.') : null

  return (
    <>
      <AppBar
        title="Entrar"
        backHref="/"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-reading gap-6">
          <div className="grid gap-2">
            <h1 className="display">
              {user ? 'Sessão iniciada.' : 'Entra para guardar e avaliar.'}
            </h1>
            <p className="lede">
              {user
                ? `Olá, ${user.nickname ?? user.displayName ?? 'vizinha'}.`
                : 'Podes explorar os cafés e ler as notas sem conta.'}
            </p>
          </div>

          {error ? (
            <p
              className="card-flat text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {user ? (
            <div className="grid gap-3">
              <Link
                href={nextPath}
                className="btn btn-primary"
              >
                Continuar
              </Link>
              <form
                action="/auth/signout"
                method="post"
              >
                <button
                  type="submit"
                  className="btn btn-secondary btn-block"
                >
                  Terminar sessão
                </button>
              </form>
            </div>
          ) : (
            <div className="grid gap-3">
              <a
                href={`/auth/google?next=${encodeURIComponent(nextPath)}`}
                className="btn btn-primary btn-block"
              >
                Continuar com Google
              </a>
              <Link
                href="/"
                className="btn btn-secondary btn-block"
              >
                Continuar sem conta
              </Link>
            </div>
          )}

          <p className="meta">
            O Google é usado apenas para identificar a tua conta. O email nunca é público. Lê a{' '}
            <Link href="/privacidade">política de privacidade</Link>.
          </p>
        </div>
      </main>
    </>
  )
}
