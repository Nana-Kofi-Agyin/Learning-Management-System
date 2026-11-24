import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Serve lightweight modern formats automatically for mobile & low-bandwidth users
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        // Admin-curated course thumbnails from external HTTPS hosts
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
