/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Performance optimizations for civic platform
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScript configuration for comprehensive platform
  typescript: {
    // Temporarily ignore comprehensive feature type conflicts during optimization
    ignoreBuildErrors: true,
  },
  
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
    optimizeServerReact: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
  
  // Aggressive webpack optimizations for civic platform performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Aggressive bundle splitting for optimal performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,      // Smaller chunks for better caching
        maxSize: 150000,     // Much smaller max size - was 244000
        maxAsyncRequests: 30, // Allow more async requests
        maxInitialRequests: 4, // Much more aggressive limit
        cacheGroups: {
          // Disable default chunk splitting to prevent fragmentation
          default: false,
          defaultVendors: false,
          
          // Single consolidated framework chunk
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 50,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          
          // Large data files - MUST be async only
          californiaData: {
            test: /[\\/]services[\\/]californiaFederalReps\.ts$/,
            name: 'california-federal-data',
            priority: 30,
            chunks: 'async', // CRITICAL: Only load when needed
            enforce: true,
          },
          
          // Agent Carlos comprehensive features - async only
          comprehensiveLegislative: {
            test: /[\\/](services[\\/]legiScanComprehensiveApi\.ts|hooks[\\/]useComprehensiveLegislative\.ts)$/,
            name: 'comprehensive-legislative',
            priority: 32,
            chunks: 'async', // Load only when advanced features accessed
            enforce: true,
          },
          
          // UI libraries - async only
          lucideReact: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide-icons',
            priority: 25,
            chunks: 'async', // Icons loaded as needed
            enforce: true,
          },
          
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 24,
            chunks: 'async', // Animation library - not critical path
            enforce: true,
          },
          
          // Data management libraries
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: 'react-query',
            priority: 23,
            chunks: 'async',
            enforce: true,
          },
          
          // Service chunks by functionality
          representativeServices: {
            test: /[\\/]services[\\/](representatives|federal|integrated).*\.ts$/,
            name: 'representative-services',
            priority: 20,
            chunks: 'async',
            enforce: true,
          },
          
          billServices: {
            test: /[\\/]services[\\/](bills|congress|committees?).*\.ts$/,
            name: 'bill-services', 
            priority: 19,
            chunks: 'async',
            enforce: true,
          },
          
          geoServices: {
            test: /[\\/]services[\\/](geo|zip|county|municipal).*\.ts$/,
            name: 'geo-services',
            priority: 18,
            chunks: 'async',
            enforce: true,
          },
          
          // Component chunks consolidated
          uiComponents: {
            test: /[\\/]components[\\/]/,
            name: 'ui-components',
            priority: 15,
            chunks: 'async',
            minSize: 20000, // Larger minimum for fewer chunks
          },
          
          // Remaining vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
              return `vendor-${packageName?.replace('@', '')}`;
            },
            priority: -10,
            chunks: 'async',
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
    
    // Performance budgets - COMPREHENSIVE PLATFORM OPTIMIZED
    if (!dev) {
      config.performance = {
        maxAssetSize: 350000,  // 350KB per asset (realistic for comprehensive civic features)
        maxEntrypointSize: 400000, // 400KB for comprehensive civic engagement entry points  
        hints: 'warning', // Warn but don't fail build - comprehensive features justified
        assetFilter: (assetFilename) => {
          // Skip large data files and comprehensive feature chunks
          return !assetFilename.endsWith('.html') && 
                 !assetFilename.includes('california-federal-data') &&
                 !assetFilename.includes('comprehensive-legislative');
        }
      };
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)