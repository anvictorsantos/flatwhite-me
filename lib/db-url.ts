// pg 9 switches these aliases to weaker semantics; pin today's verify-full behavior.
export function normalizeSslMode(url: string) {
  return url.replace(/([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/, '$1verify-full')
}
