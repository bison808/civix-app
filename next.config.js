/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Performance optimizations for civic platform
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable static generation to fix React Query SSR issues
  output: 'standalone',
  
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
  
  // Webpack optimizations for civic platform with enhanced code splitting
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enhanced bundle splitting for better caching and performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Political mapping services split
          politicalMapping: {
            test: /[\\/]services[\\/](california|county|zip|dataQuality)/,
            name: 'political-mapping',
            priority: 15,
            chunks: 'all',
          },
          // Representative components split
          representatives: {
            test: /[\\/]components[\\/]representatives[\\/]/,
            name: 'representatives',
            priority: 12,
            chunks: 'all',
          },
          // Large libraries split
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: 'react-query',
            priority: 11,
            chunks: 'all',
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }
    
    // Performance optimizations and aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize React Query for civic data
      '@tanstack/react-query': require.resolve('@tanstack/react-query'),
    };

    // Tree shaking optimizations - removed usedExports to fix webpack conflict
    config.optimization.sideEffects = false;
    
    // Add performance budgets
    if (!dev) {
      config.performance = {
        maxAssetSize: 250000, // 250KB per asset
        maxEntrypointSize: 350000, // 350KB for entry points
        hints: 'warning',
      };
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)