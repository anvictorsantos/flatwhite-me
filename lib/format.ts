const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function fmtScore(value: number | null): string {
  return value === null ? '—' : String(value).replace('.', ',')
}

export function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso + 'T12:00:00')
  return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''} ${date.getFullYear()}`
}

export function fmtPrice(cents: number | null): string {
  return cents === null ? '' : `${(cents / 100).toFixed(2).replace('.', ',')} €`
}

export function addDays(iso: string, days: number): string {
  const date = new Date(iso + 'T12:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
