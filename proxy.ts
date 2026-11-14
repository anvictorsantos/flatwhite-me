import { NextResponse, type NextRequest } from 'next/server'

const DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{nonce}' 'strict-dynamic'{dev}",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tiles.openfreemap.org",
  "font-src 'self'",
  "connect-src 'self' https://tiles.openfreemap.org https://*.ingest.sentry.io",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  'upgrade-insecure-requests',
]

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const policy = DIRECTIVES.join('; ')
    .replace('{nonce}', nonce)
    .replace('{dev}', process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next.js reads the nonce from this request header and attaches it to its scripts.
  requestHeaders.set('Content-Security-Policy', policy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  // Report-only until the policy is validated against the map, Sentry and the forms.
  response.headers.set('Content-Security-Policy-Report-Only', policy)
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
