import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const version = process.env.APP_VERSION ?? 'dev'
  try {
    await prisma.$queryRaw`select 1`
  } catch {
    return Response.json({ status: 'error', version }, { status: 503 })
  }
  return Response.json({ status: 'ok', version })
}
