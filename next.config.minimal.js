/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for guaranteed Netlify deployment
  reactStrictMode: true,
  swcMinify: true,
  
  // Static export for maximum compatibility
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Disable experimental features
  experimental: {},
  
  // Basic configuration only
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig