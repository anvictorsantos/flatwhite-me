'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { SavedCafe, StoredRating } from '@/lib/types'

type Library = {
  signedIn: boolean
  saved: string[]
  savedCafes: SavedCafe[]
  ratings: StoredRating[]
}

type Store = Library & {
  refresh: () => Promise<void>
  ratingFor: (slug: string) => StoredRating | undefined
  isSaved: (slug: string) => boolean
  toggleSaved: (slug: string) => Promise<void>
}

const EMPTY: Library = { signedIn: false, saved: [], savedCafes: [], ratings: [] }

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ signedIn, children }: { signedIn: boolean; children: ReactNode }) {
  const [library, setLibrary] = useState<Library>({ ...EMPTY, signedIn })
  const router = useRouter()

  const refresh = useCallback(async () => {
    const response = await fetch('/api/library').catch(() => null)
    if (!response || !response.ok) return
    setLibrary((await response.json()) as Library)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial library fetch
    void refresh()
  }, [refresh])

  const ratingFor = (slug: string) => library.ratings.find((rating) => rating.slug === slug)
  const isSaved = (slug: string) => library.saved.includes(slug)

  const toggleSaved = async (slug: string) => {
    if (!library.signedIn) {
      router.push('/entrar?next=' + encodeURIComponent(window.location.pathname))
      return
    }
    const saved = library.saved.includes(slug)
    const response = await fetch('/api/want-to-try', {
      method: saved ? 'DELETE' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => null)
    if (response?.status === 401) {
      router.push('/entrar?next=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (response?.ok) await refresh()
  }

  return (
    <StoreContext.Provider value={{ ...library, refresh, ratingFor, isSaved, toggleSaved }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
