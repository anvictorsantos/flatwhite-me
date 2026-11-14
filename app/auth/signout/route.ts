import { destroySession } from '@/lib/auth'
import { publicOrigin } from '@/lib/site'

export async function POST(request: Request) {
  await destroySession()
  return Response.redirect(new URL('/', publicOrigin(request)), 303)
}
