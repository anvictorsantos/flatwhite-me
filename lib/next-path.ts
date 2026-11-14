const BASE = 'https://flatwhite.me'

// Checking for `//` and `\` is not enough: the URL parser strips tabs and newlines,
// so `/\t/evil.com` would still resolve to a protocol-relative redirect.
export function safeNextPath(value: string | null): string {
  if (!value?.startsWith('/')) return '/'
  const url = new URL(value, BASE)
  return url.origin === BASE ? url.pathname + url.search + url.hash : '/'
}
