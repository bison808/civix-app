const puppeteer = require('puppeteer');

// 3G network simulation settings
const NETWORK_PRESETS = {
  '3g-slow': {
    offline: false,
    downloadThroughput: 500 * 1024 / 8, // 500 kbps
    uploadThroughput: 500 * 1024 / 8,   // 500 kbps
    latency: 400 // 400ms RTT
  },
  '3g-fast': {
    offline: false,
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 kbps
    latency: 150 // 150ms RTT
  },
  '4g': {
    offline: false,
    downloadThroughput: 9 * 1024 * 1024 / 8,   // 9 Mbps
    uploadThroughput: 9 * 1024 * 1024 / 8,     // 9 Mbps
    latency: 50 // 50ms RTT
  }
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';
const PAGES_TO_TEST = ['/', '/feed', '/representatives'];

class Network3GTest {
  constructor() {
    this.browser = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async testPageOn3G(url, pageName, networkType) {
    console.log(`🔍 Testing ${pageName} on ${networkType.toUpperCase()}...`);
    
    const page = await this.browser.newPage();
    
    // Set network conditions
    await page.emulateNetworkConditions(NETWORK_PRESETS[networkType]);
    
    // Set viewport for mobile
    await page.setViewport({ width: 375, height: 812 });
    
    // Track performance metrics
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {
        startTime: performance.now(),
        fcp: 0,
        lcp: 0,
        cls: 0,
        networkRequests: [],
        errors: []
      };

      // Track FCP
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.fcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Track LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          window.performanceMetrics.lcp = entries[entries.length - 1].startTime;
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            window.performanceMetrics.cls = clsValue;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Track network requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const startTime = performance.now();
        return originalFetch.apply(this, args).then(response => {
          const endTime = performance.now();
          window.performanceMetrics.networkRequests.push({
            url: args[0],
            duration: endTime - startTime,
            status: response.status,
            size: response.headers.get('content-length') || 0
          });
          return response;
        });
      };

      // Track errors
      window.addEventListener('error', (e) => {
        window.performanceMetrics.errors.push({
          message: e.message,
          source: e.filename,
          line: e.lineno
        });
      });
    });

    const startTime = Date.now();
    
    try {
      // Navigate with timeout
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Wait for any dynamic content
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.error(`❌ Failed to load ${pageName} on ${networkType}:`, error.message);
      return this.createFailedResult(pageName, networkType, error.message);
    }

    const loadTime = Date.now() - startTime;

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perf = window.performanceMetrics;
      const nav = performance.getEntriesByType('navigation')[0];
      
      return {
        ...perf,
        domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.navigationStart : 0,
        resourceCount: performance.getEntriesByType('resource').length,
        transferSize: performance.getEntriesByType('resource')
          .reduce((total, resource) => total + (resource.transferSize || 0), 0),
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        } : null
      };
    });

    await page.close();

    const result = {
      page: pageName,
      networkType,
      loadTime,
      metrics: {
        fcp: Math.round(metrics.fcp),
        lcp: Math.round(metrics.lcp),
        cls: parseFloat(metrics.cls.toFixed(3)),
        domContentLoaded: Math.round(metrics.domContentLoaded),
        resourceCount: metrics.resourceCount,
        transferSize: Math.round(metrics.transferSize / 1024), // KB
        networkRequests: metrics.networkRequests.length,
        errors: metrics.errors.length
      },
      memoryUsage: metrics.memoryUsage,
      errors: metrics.errors,
      performance: this.evaluatePerformance(loadTime, metrics, networkType)
    };

    this.logResult(result);
    return result;
  }

  createFailedResult(pageName, networkType, error) {
    return {
      page: pageName,
      networkType,
      loadTime: 0,
      failed: true,
      error,
      performance: { grade: 'F', score: 0 }
    };
  }

  evaluatePerformance(loadTime, metrics, networkType) {
    // Adjust thresholds based on network type
    const thresholds = {
      '3g-slow': { load: 10000, fcp: 5000, lcp: 8000 },
      '3g-fast': { load: 6000, fcp: 3000, lcp: 5000 },
      '4g': { load: 3000, fcp: 1800, lcp: 2500 }
    };

    const threshold = thresholds[networkType];
    
    const scores = {
      load: this.getScore(loadTime, threshold.load),
      fcp: this.getScore(metrics.fcp, threshold.fcp),
      lcp: this.getScore(metrics.lcp, threshold.lcp),
      cls: this.getScore(metrics.cls, 0.1, true)
    };

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 4;
    
    return {
      scores,
      score: Math.round(avgScore),
      grade: this.getGrade(avgScore),
      verdict: avgScore >= 70 ? 'Good' : avgScore >= 50 ? 'Needs Work' : 'Poor'
    };
  }

  getScore(value, threshold, inverse = false) {
    if (value === 0) return 0;
    
    if (inverse) {
      return value <= threshold ? 100 : Math.max(0, 100 - (value - threshold) / threshold * 100);
    } else {
      return value <= threshold ? 100 : Math.max(0, 100 - (value - threshold) / threshold * 100);
    }
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  logResult(result) {
    const icon = result.performance.grade === 'A' ? '✅' : 
                result.performance.grade === 'B' ? '✅' : 
                result.performance.grade === 'C' ? '⚠️' : '❌';
    
    console.log(`${icon} ${result.page} (${result.networkType.toUpperCase()}): ${result.performance.grade} - ${result.loadTime}ms`);
    console.log(`   FCP: ${result.metrics.fcp}ms | LCP: ${result.metrics.lcp}ms | Transfer: ${result.metrics.transferSize}KB`);
  }

  async runAllTests() {
    console.log('🚀 Starting 3G Network Performance Tests...\n');
    console.log(`Testing URL: ${BASE_URL}`);
    console.log('Network types: 3G Slow, 3G Fast, 4G\n');

    await this.init();

    for (const networkType of Object.keys(NETWORK_PRESETS)) {
      console.log(`\n📶 Testing on ${networkType.toUpperCase()} network:`);
      
      for (const page of PAGES_TO_TEST) {
        const pageName = page === '/' ? 'Homepage' : page.replace('/', '');
        const result = await this.testPageOn3G(BASE_URL + page, pageName, networkType);
        this.results.tests.push(result);
      }
    }

    await this.browser.close();
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 3G NETWORK PERFORMANCE REPORT');
    console.log('='.repeat(60));

    // Group results by network type
    const byNetwork = {};
    this.results.tests.forEach(test => {
      if (!byNetwork[test.networkType]) byNetwork[test.networkType] = [];
      byNetwork[test.networkType].push(test);
    });

    Object.entries(byNetwork).forEach(([network, tests]) => {
      console.log(`\n📶 ${network.toUpperCase()} RESULTS:`);
      
      const validTests = tests.filter(t => !t.failed);
      if (validTests.length === 0) {
        console.log('   ❌ All tests failed');
        return;
      }

      const avgLoad = Math.round(validTests.reduce((sum, t) => sum + t.loadTime, 0) / validTests.length);
      const avgFCP = Math.round(validTests.reduce((sum, t) => sum + t.metrics.fcp, 0) / validTests.length);
      const avgLCP = Math.round(validTests.reduce((sum, t) => sum + t.metrics.lcp, 0) / validTests.length);
      const avgTransfer = Math.round(validTests.reduce((sum, t) => sum + t.metrics.transferSize, 0) / validTests.length);

      console.log(`   Average Load Time: ${avgLoad}ms`);
      console.log(`   Average FCP: ${avgFCP}ms`);
      console.log(`   Average LCP: ${avgLCP}ms`);
      console.log(`   Average Transfer: ${avgTransfer}KB`);

      // Check if meets 3G targets
      const target = network === '3g-slow' ? 10000 : network === '3g-fast' ? 6000 : 3000;
      const meetsTarget = avgLoad <= target;
      console.log(`   Target (<${target/1000}s): ${meetsTarget ? '✅ MET' : '❌ MISSED'}`);
    });

    // Overall recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    const slowTests = this.results.tests.filter(t => t.loadTime > 6000);
    
    if (slowTests.length > 0) {
      console.log('   • Further optimize bundle size for 3G networks');
      console.log('   • Implement more aggressive lazy loading');
      console.log('   • Consider reducing image quality for mobile');
    } else {
      console.log('   • Performance is good across all network types');
      console.log('   • Monitor real-world usage for optimization opportunities');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run the test
const tester = new Network3GTest();
tester.runAllTests().catch(console.error);