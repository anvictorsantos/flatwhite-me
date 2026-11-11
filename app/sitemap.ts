import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cafes = await prisma.cafe.findMany({
    where: { status: 'active' },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  })

  const staticPages = [
    '',
    '/top',
    '/best-flat-white-lisbon',
    '/sobre',
    '/como-funciona',
    '/privacidade',
    '/contacto',
  ]

  return [
    ...staticPages.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' || path === '/best-flat-white-lisbon' ? 1 : 0.7,
    })),
    ...cafes.map((cafe) => ({
      url: `${siteUrl}/cafe/${cafe.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
