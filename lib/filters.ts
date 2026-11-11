import type { CafeSummary } from '@/lib/types'

export type Filters = {
  query: string
  minScore: 'all' | '4.5' | '4.6'
  price: 'all' | 'up3' | '3to4'
  specialty: 'all' | 'specialty'
}

export const defaultFilters: Filters = {
  query: '',
  minScore: 'all',
  price: 'all',
  specialty: 'all',
}

export function filtersActive(filters: Filters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.minScore !== 'all' ||
    filters.price !== 'all' ||
    filters.specialty !== 'all'
  )
}

export function activeFilterCount(filters: Filters): number {
  let count = 0
  if (filters.minScore !== 'all') count += 1
  if (filters.price !== 'all') count += 1
  if (filters.specialty !== 'all') count += 1
  return count
}

export function filterCafes(cafes: readonly CafeSummary[], filters: Filters): CafeSummary[] {
  const query = filters.query.trim().toLowerCase()
  return cafes.filter((cafe) => {
    if (cafe.score === null) return false
    if (
      query &&
      !cafe.name.toLowerCase().includes(query) &&
      !(cafe.area ?? '').toLowerCase().includes(query)
    ) {
      return false
    }
    if (filters.minScore === '4.5' && cafe.score < 4.5) return false
    if (filters.minScore === '4.6' && cafe.score < 4.6) return false
    if (filters.price === 'up3' && !(cafe.price !== null && cafe.price <= 300)) return false
    if (
      filters.price === '3to4' &&
      !(cafe.price !== null && cafe.price > 300 && cafe.price <= 400)
    ) {
      return false
    }
    if (filters.specialty === 'specialty' && !cafe.specialty) return false
    return true
  })
}

export function resultsHeading(filters: Filters, count: number, total: number) {
  if (!filtersActive(filters)) {
    return {
      title: 'O ranking de Lisboa',
      meta: `${total} classificados · últimos 365 dias`,
    }
  }
  if (filters.query.trim()) {
    return {
      title: `Pesquisa: ${filters.query.trim()}`,
      meta: count === 1 ? '1 café encontrado' : `${count} cafés encontrados`,
    }
  }
  const bits: string[] = [count === 1 ? '1 café' : `${count} cafés`]
  if (filters.minScore !== 'all') bits.push(`nota mínima ${filters.minScore.replace('.', ',')}`)
  if (filters.price === 'up3') bits.push('até 3 €')
  if (filters.price === '3to4') bits.push('3–4 €')
  if (filters.specialty === 'specialty') bits.push('só especialidade')
  return { title: 'Resultados filtrados', meta: bits.join(' · ') }
}
