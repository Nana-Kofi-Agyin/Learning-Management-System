/**
 * Resolves the canonical site URL in both local development and Vercel deployments.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && configured.startsWith('http')) {
    return configured.replace(/\/$/, '')
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) {
    return `https://${vercelProd.replace(/\/$/, '')}`
  }

  const vercelPreview = process.env.VERCEL_URL?.trim()
  if (vercelPreview) {
    return `https://${vercelPreview.replace(/\/$/, '')}`
  }

  return 'http://localhost:3000'
}
