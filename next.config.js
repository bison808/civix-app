/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-side configuration for API routes to work
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable image optimization
  images: {
    domains: ['localhost', 'citznvote.netlify.app', 'citzn.vote'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Disable experimental features for stability
  experimental: {},
  
  // Basic configuration
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig