import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { OAUTH_NEXT_COOKIE, OAUTH_STATE_COOKIE, googleRedirectUri } from '@/lib/auth'
import { safeNextPath } from '@/lib/next-path'
import { publicOrigin } from '@/lib/site'

const STATE_MAX_AGE_SECONDS = 600

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = publicOrigin(request)
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return Response.redirect(new URL('/entrar?auth=config', origin), 302)
  }

  const state = randomBytes(16).toString('base64url')
  const store = await cookies()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: STATE_MAX_AGE_SECONDS,
  }
  store.set(OAUTH_STATE_COOKIE, state, cookieOptions)
  store.set(OAUTH_NEXT_COOKIE, safeNextPath(url.searchParams.get('next')), cookieOptions)

  const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authorization.searchParams.set('client_id', clientId)
  authorization.searchParams.set('redirect_uri', googleRedirectUri(origin))
  authorization.searchParams.set('response_type', 'code')
  authorization.searchParams.set('scope', 'openid email profile')
  authorization.searchParams.set('state', state)
  authorization.searchParams.set('prompt', 'select_account')

  return Response.redirect(authorization, 302)
}
