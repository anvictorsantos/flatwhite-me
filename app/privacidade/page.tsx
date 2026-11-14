import { AppBar } from '@/components/AppBar'
import { DeleteAccount } from '@/components/DeleteAccount'
import { getSessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function PrivacidadePage() {
  const user = await getSessionUser()

  return (
    <>
      <AppBar
        title="Privacidade"
        backHref="/sobre"
        action="search"
      />
      <main className="px-4 py-6 sm:px-6">
        <div className="mx-auto grid w-full max-w-reading gap-6">
          <h1 className="display">A tua lista é tua. Os teus dados também.</h1>

          <section className="grid gap-2">
            <h2 className="section-title">O que fica público</h2>
            <p>O teu nome ou alcunha, as avaliações e as notas. O teu email nunca é público.</p>
          </section>

          <section className="grid gap-2">
            <h2 className="section-title">O que fica privado</h2>
            <p>
              A lista “Quero experimentar” só é visível para ti. A localização é pedida apenas
              quando tocas em “Perto de mim” e não é guardada no servidor.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="section-title">Se eliminares a conta</h2>
            <div className="card-flat">
              O perfil e as notas são eliminados. As avaliações ficam anónimas, sem ligação à tua
              conta, para preservar o ranking.
            </div>
            {user ? <DeleteAccount /> : null}
          </section>

          <section className="grid gap-2">
            <h2 className="section-title">Entrar com Google</h2>
            <p>
              O Google confirma a tua identidade e devolve o nome, o email e a imagem de perfil.
              Guardamos o identificador Google, o email privado e o nome. O email nunca é mostrado
              publicamente. Não pedimos acesso ao Gmail, contactos, localização nem a outros dados
              Google.
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="section-title">Sobre os dados</h2>
            <p className="meta">
              Diretório: Overture Maps Places (CDLA-Permissive 2.0). Mapa: OpenFreeMap e
              OpenStreetMap (ODbL). Google é usado apenas para autenticação.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
