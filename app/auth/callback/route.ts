import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  adminEmails,
  createSession,
  googleRedirectUri,
} from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publicOrigin } from '@/lib/site'

const tokenSchema = z.object({
  access_token: z.string().min(1),
})

const profileSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).optional(),
  picture: z.string().url().optional(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = publicOrigin(request)
  const store = await cookies()
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value
  const nextPath = store.get(OAUTH_NEXT_COOKIE)?.value ?? '/'
  store.delete(OAUTH_STATE_COOKIE)
  store.delete(OAUTH_NEXT_COOKIE)

  const fail = (reason: string) => Response.redirect(new URL(`/entrar?auth=${reason}`, origin), 302)

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state || !expectedState || state !== expectedState) return fail('state')

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return fail('config')

  const redirectUri = googleRedirectUri(origin)
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenResponse.ok) return fail('token')

  const tokens = tokenSchema.safeParse(await tokenResponse.json())
  if (!tokens.success) return fail('token')

  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${tokens.data.access_token}` },
  })
  if (!profileResponse.ok) return fail('profile')

  const profile = profileSchema.safeParse(await profileResponse.json())
  if (!profile.success) return fail('profile')

  const email = profile.data.email.toLowerCase()
  const role = adminEmails().includes(email) ? 'admin' : 'user'
  const displayName = profile.data.name ?? email.split('@')[0] ?? 'Café'
  const user = await prisma.user.upsert({
    where: { googleSub: profile.data.sub },
    create: {
      googleSub: profile.data.sub,
      email,
      displayName,
      avatarUrl: profile.data.picture ?? null,
      role,
    },
    update: {
      email,
      displayName,
      avatarUrl: profile.data.picture ?? null,
      role,
    },
    select: { id: true },
  })

  await createSession(user.id)
  return Response.redirect(new URL(nextPath, origin), 303)
}
