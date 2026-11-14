import { createHmac, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export const SESSION_COOKIE = 'fw_session'
export const OAUTH_STATE_COOKIE = 'fw_oauth_state'
export const OAUTH_NEXT_COOKIE = 'fw_oauth_next'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type SessionUser = {
  id: string
  email: string | null
  displayName: string | null
  nickname: string | null
  role: 'user' | 'admin'
}

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return secret
}

export function hashToken(token: string): string {
  return createHmac('sha256', sessionSecret()).update(token).digest('hex')
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function googleRedirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || new URL('/auth/callback', origin).toString()
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          nickname: true,
          role: true,
          deletedAt: true,
        },
      },
    },
  })
  if (!session || session.expiresAt < new Date() || session.user.deletedAt) return null

  if (Date.now() - session.lastSeenAt.getTime() > 60 * 60 * 1000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
  }

  const { user } = session
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    nickname: user.nickname,
    role: user.role,
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } })
  }
  store.delete(SESSION_COOKIE)
}
