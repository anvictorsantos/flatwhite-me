import fs from 'node:fs'
import crypto from 'node:crypto'
import { Client } from 'pg'

function env() {
  return Object.fromEntries(
    fs
      .readFileSync('.env.local', 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=')
        return [
          line.slice(0, index).trim(),
          line
            .slice(index + 1)
            .trim()
            .replace(/^"|"$/g, ''),
        ]
      }),
  )
}

export type TestUser = { id: string; token: string; email: string }

export function makeUser(role: 'user' | 'admin'): TestUser {
  const token = crypto.randomBytes(32).toString('base64url')
  const email = `e2e-${role}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}@example.invalid`
  return { id: crypto.randomUUID(), token, email }
}

export async function connect(): Promise<Client> {
  const url = env().DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const client = new Client({ connectionString: url })
  await client.connect()
  return client
}

export function hashToken(token: string): string {
  const secret = env().SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export async function seedUser(db: Client, user: TestUser, role: 'user' | 'admin', name: string) {
  await db.query(
    `insert into "User" (id,"googleSub",email,"displayName",role) values ($1,$2,$3,$4,$5)`,
    [user.id, `e2e-${user.id}`, user.email, name, role],
  )
  await db.query(
    `insert into "Session" (id,"userId","tokenHash","expiresAt") values ($1,$2,$3, now()+interval '1 day')`,
    [crypto.randomUUID(), user.id, hashToken(user.token)],
  )
}

export async function cleanup(db: Client, userIds: string[], cafeIds: string[]) {
  for (const id of userIds) {
    await db.query(
      `delete from "RatingRevision" where "ratingId" in (select id from "Rating" where "userId"=$1)`,
      [id],
    )
    await db.query(`delete from "Rating" where "userId"=$1`, [id])
    await db.query(`delete from "CafeSuggestion" where "userId"=$1`, [id])
    await db.query(`delete from "WantToTry" where "userId"=$1`, [id])
    await db.query(`delete from "AdminAction" where "actorUserId"=$1`, [id])
    await db.query(`delete from "User" where id=$1`, [id])
  }
  for (const id of cafeIds) {
    await db.query(`delete from "Cafe" where id=$1`, [id])
  }
  await db.query('refresh materialized view concurrently cafe_scores')
}
