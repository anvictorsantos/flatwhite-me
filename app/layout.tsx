import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AppNav } from '@/components/AppNav'
import { StoreProvider } from '@/components/StoreProvider'
import { getSessionUser } from '@/lib/auth'
import { siteUrl } from '@/lib/site'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Flat White Me — o melhor flat white de Lisboa',
    template: '%s · Flat White Me',
  },
  description: 'Os melhores flat whites de Lisboa, ordenados por quem prova.',
  applicationName: 'Flat White Me',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'Flat White Me',
    locale: 'pt_PT',
    url: siteUrl,
    title: 'Flat White Me — o melhor flat white de Lisboa',
    description: 'Os melhores flat whites de Lisboa, ordenados por quem prova.',
  },
}

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()

  return (
    <html
      lang="pt-PT"
      className={inter.variable}
    >
      <body suppressHydrationWarning>
        <a
          href="#conteudo"
          className="sr-only rounded-input bg-surface px-4 py-3 font-semibold text-text focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
        >
          Saltar para o conteúdo
        </a>
        <AppNav user={user} />
        <div
          id="conteudo"
          tabIndex={-1}
          className="mx-auto w-full max-w-app pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-16"
        >
          <StoreProvider signedIn={Boolean(user)}>{children}</StoreProvider>
        </div>
      </body>
    </html>
  )
}
