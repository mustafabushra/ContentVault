import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
  },
  // Compress responses
  compress: true,
  // Faster page loads
  poweredByHeader: false,
}

export default nextConfig
