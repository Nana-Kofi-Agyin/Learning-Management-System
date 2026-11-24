import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/courses', '/verify', '/privacy', '/terms'],
      disallow: ['/admin', '/dashboard', '/api', '/reset-password'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
