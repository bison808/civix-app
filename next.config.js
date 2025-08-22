/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations for civic platform
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization for faster loading
  images: {
    domains: ['localhost', 'citznvote.netlify.app', 'citzn.vote', 'bioguide.congress.gov'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days for civic content
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance and SEO features
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false, // Security
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    emotion: false, // We don't use emotion
    styledComponents: false, // We don't use styled-components
  },
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    serverComponentsExternalPackages: ['@tanstack/react-query'],
  },
  
  // Headers for performance and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Core Web Vitals optimization
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Security headers for civic platform
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Performance hints
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        // Static assets caching for performance
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // API caching for Congressional data
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ]
      }
    ]
  },
  
  // Rewrites for SEO-friendly URLs
  async rewrites() {
    return [
      {
        source: '/bill/:id',
        destination: '/bill/:id'
      },
      {
        source: '/representative/:id',
        destination: '/representatives/:id'
      },
      {
        source: '/rep/:id',
        destination: '/representatives/:id'
      }
    ]
  },
  
  // Webpack optimizations for civic platform
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle splitting for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          common: {
            name: 'commons',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    // Performance optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize React Query for civic data
      '@tanstack/react-query': require.resolve('@tanstack/react-query'),
    };
    
    return config;
  },
}

module.exports = nextConfig