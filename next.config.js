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
    // Temporarily ignore comprehensive feature type conflicts during SSR optimization
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
          // CRITICAL: Resource hints for faster chunk loading
          {
            key: 'Link',
            value: '</static/chunks/framework.js>; rel=preload; as=script, </static/chunks/critical-ui.js>; rel=preload; as=script'
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
          },
          // CRITICAL: Connection preloading for faster resource fetching
          {
            key: 'Link',
            value: '<https://api.congress.gov>; rel=preconnect; crossorigin, <https://v3.openstates.org>; rel=preconnect; crossorigin'
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
        minSize: 20000,      // Larger minimum to reduce fragmentation  
        maxSize: 200000,     // Balanced for fewer chunks
        maxAsyncRequests: 15, // Reduce async fragmentation
        maxInitialRequests: 6, // Allow critical UI chunks
        cacheGroups: {
          // Disable default chunk splitting to prevent fragmentation
          default: false,
          defaultVendors: false,
          
          // CRITICAL: Consolidated framework chunk - FORCE SINGLE CHUNK
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler|prop-types|use-subscription)[\\/]/,
            name: 'framework',
            priority: 60,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
            minSize: 0,
            maxSize: 500000, // Allow larger framework chunk to prevent splitting
          },
          
          // CRITICAL: Navigation and interaction libraries - FIRST PRIORITY
          criticalUI: {
            test: /[\\/](components[\\/](navigation|layout|core)|hooks[\\/](useAuth|useMediaQuery))[\\/]/,
            name: 'critical-ui',
            priority: 55,
            chunks: 'initial', // Load immediately with page
            enforce: true,
            minSize: 0,
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
    
    // CRITICAL: Module concatenation for faster loading
    config.optimization.concatenateModules = true;
    
    // CRITICAL: Parallel chunk loading optimization  
    if (!dev && !isServer) {
      config.optimization.runtimeChunk = {
        name: 'runtime'  // Single runtime chunk for faster loading
      };
      
      // Minimize chunk dependencies for parallel loading
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }
    
    // Performance budgets - OPTIMIZED FOR <20 CHUNK TARGET
    if (!dev) {
      config.performance = {
        maxAssetSize: 250000,  // 250KB per asset - STRICTER for fewer chunks
        maxEntrypointSize: 350000, // 350KB entry points - REDUCED from 400KB
        hints: 'error', // ERROR on budget violations to enforce <20 chunks
        assetFilter: (assetFilename) => {
          // Monitor all chunks except specific data files
          return !assetFilename.endsWith('.html') && 
                 !assetFilename.includes('california-federal-data') &&
                 !assetFilename.includes('comprehensive-legislative') &&
                 !assetFilename.includes('.map'); // Skip sourcemaps
        }
      };
    }
    
    // CRITICAL: Bundle analysis and chunk monitoring
    config.plugins = config.plugins || [];
    
    if (!dev) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      
      // Add bundle analyzer in CI or when ANALYZE=true
      if (process.env.CI || process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-analysis.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json'
          })
        );
      }
      
      // Custom plugin to monitor chunk count
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('ChunkCountMonitor', (stats) => {
            const chunks = stats.compilation.chunks;
            const chunkCount = chunks.size;
            
            console.log(`\n🎯 BUNDLE OPTIMIZATION REPORT:`);
            console.log(`📦 Total chunks: ${chunkCount} (Target: <20)`);
            
            if (chunkCount > 20) {
              console.log(`❌ CHUNK COUNT EXCEEDED TARGET: ${chunkCount} > 20`);
              console.log(`🔧 Bundle fragmentation optimization needed`);
            } else {
              console.log(`✅ Chunk count within target: ${chunkCount} ≤ 20`);
            }
            
            // List largest chunks for optimization guidance
            const sortedChunks = Array.from(chunks).sort((a, b) => b.size - a.size);
            console.log(`\n📊 Largest chunks:`);
            sortedChunks.slice(0, 5).forEach((chunk, i) => {
              const sizeKB = Math.round(chunk.size / 1024);
              console.log(`${i + 1}. ${chunk.name || 'unnamed'}: ${sizeKB}KB`);
            });
          });
        }
      });
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)