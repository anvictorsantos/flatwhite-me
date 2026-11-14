import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { normalizeSslMode } from '@/lib/db-url'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizeSslMode(url),
      connectionTimeoutMillis: 5000,
    }),
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
