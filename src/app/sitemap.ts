import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  let courseEntries: MetadataRoute.Sitemap = []

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient()
    const { data: courses } = await supabase
      .from('courses')
      .select('slug, updated_at')
      .eq('is_published', true)

    courseEntries = (courses ?? []).map((c) => ({
      url: `${siteUrl}/courses/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  }

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...courseEntries,
  ]
}
