const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';
const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/feed', name: 'Feed' },
  { path: '/representatives', name: 'Representatives' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/settings', name: 'Settings' }
];

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  pageLoad: { target: 3000, max: 5000 },
  fcp: { target: 1800, max: 3000 },
  lcp: { target: 2500, max: 4000 },
  tti: { target: 3800, max: 7300 },
  cls: { target: 0.1, max: 0.25 }
};

class PerformanceTester {
  constructor() {
    this.browser = null;
    this.results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      pages: [],
      summary: {},
      bottlenecks: []
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async testPage(url, pageName) {
    console.log(`📊 Testing ${pageName}...`);
    const page = await this.browser.newPage();
    
    // Enable performance tracking
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {
        fcp: 0,
        lcp: 0,
        cls: 0,
        tti: 0,
        resources: []
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
        window.performanceMetrics.lcp = entries[entries.length - 1].startTime;
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
    });

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Measure page load
    const startTime = Date.now();
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
    } catch (error) {
      console.error(`❌ Failed to load ${pageName}: ${error.message}`);
      return {
        page: pageName,
        url,
        error: error.message,
        failed: true
      };
    }

    const loadTime = Date.now() - startTime;

    // Wait for metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        ...window.performanceMetrics,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        domInteractive: navigation.domInteractive,
        resources: resources.map(r => ({
          name: r.name,
          type: r.initiatorType,
          duration: r.duration,
          size: r.transferSize || 0
        })).filter(r => r.duration > 100) // Only slow resources
      };
    });

    // Calculate TTI (approximation)
    const tti = metrics.domInteractive + (loadTime * 0.3);

    // Get memory usage if available
    const memoryUsage = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2)
        };
      }
      return null;
    });

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.close();

    const result = {
      page: pageName,
      url,
      metrics: {
        pageLoadTime: loadTime,
        firstContentfulPaint: Math.round(metrics.fcp),
        largestContentfulPaint: Math.round(metrics.lcp),
        cumulativeLayoutShift: parseFloat(metrics.cls.toFixed(3)),
        timeToInteractive: Math.round(tti),
        domContentLoaded: Math.round(metrics.domContentLoaded)
      },
      memory: memoryUsage,
      slowResources: metrics.resources.slice(0, 5),
      consoleErrors: consoleErrors.slice(0, 5),
      performance: this.evaluatePerformance(loadTime, metrics.fcp, metrics.lcp, metrics.cls)
    };

    // Check for bottlenecks
    this.identifyBottlenecks(result);

    return result;
  }

  evaluatePerformance(pageLoad, fcp, lcp, cls) {
    const scores = {
      pageLoad: this.getScore(pageLoad, THRESHOLDS.pageLoad),
      fcp: this.getScore(fcp, THRESHOLDS.fcp),
      lcp: this.getScore(lcp, THRESHOLDS.lcp),
      cls: this.getScore(cls, THRESHOLDS.cls, true)
    };

    const avgScore = (scores.pageLoad + scores.fcp + scores.lcp + scores.cls) / 4;

    return {
      scores,
      overall: avgScore >= 90 ? 'Excellent' : avgScore >= 70 ? 'Good' : avgScore >= 50 ? 'Needs Improvement' : 'Poor',
      grade: this.getGrade(avgScore)
    };
  }

  getScore(value, threshold, inverse = false) {
    if (inverse) {
      if (value <= threshold.target) return 100;
      if (value >= threshold.max) return 0;
    } else {
      if (value <= threshold.target) return 100;
      if (value >= threshold.max) return 0;
    }
    
    const range = threshold.max - threshold.target;
    const position = value - threshold.target;
    return Math.round(100 - (position / range * 100));
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  identifyBottlenecks(result) {
    const bottlenecks = [];

    // Check page load time
    if (result.metrics.pageLoadTime > THRESHOLDS.pageLoad.target) {
      bottlenecks.push({
        type: 'Page Load',
        severity: result.metrics.pageLoadTime > THRESHOLDS.pageLoad.max ? 'High' : 'Medium',
        value: `${result.metrics.pageLoadTime}ms`,
        target: `${THRESHOLDS.pageLoad.target}ms`,
        recommendation: 'Optimize server response time, reduce JavaScript bundle size, implement code splitting'
      });
    }

    // Check FCP
    if (result.metrics.firstContentfulPaint > THRESHOLDS.fcp.target) {
      bottlenecks.push({
        type: 'First Contentful Paint',
        severity: result.metrics.firstContentfulPaint > THRESHOLDS.fcp.max ? 'High' : 'Medium',
        value: `${result.metrics.firstContentfulPaint}ms`,
        target: `${THRESHOLDS.fcp.target}ms`,
        recommendation: 'Reduce render-blocking resources, optimize critical rendering path'
      });
    }

    // Check LCP
    if (result.metrics.largestContentfulPaint > THRESHOLDS.lcp.target) {
      bottlenecks.push({
        type: 'Largest Contentful Paint',
        severity: result.metrics.largestContentfulPaint > THRESHOLDS.lcp.max ? 'High' : 'Medium',
        value: `${result.metrics.largestContentfulPaint}ms`,
        target: `${THRESHOLDS.lcp.target}ms`,
        recommendation: 'Optimize images, preload critical resources, reduce server response time'
      });
    }

    // Check CLS
    if (result.metrics.cumulativeLayoutShift > THRESHOLDS.cls.target) {
      bottlenecks.push({
        type: 'Cumulative Layout Shift',
        severity: result.metrics.cumulativeLayoutShift > THRESHOLDS.cls.max ? 'High' : 'Medium',
        value: result.metrics.cumulativeLayoutShift.toString(),
        target: THRESHOLDS.cls.target.toString(),
        recommendation: 'Add size attributes to images, avoid inserting content above existing content'
      });
    }

    // Check for slow resources
    if (result.slowResources && result.slowResources.length > 0) {
      const slowestResource = result.slowResources[0];
      bottlenecks.push({
        type: 'Slow Resource',
        severity: slowestResource.duration > 3000 ? 'High' : 'Medium',
        value: `${slowestResource.name.split('/').pop()} (${Math.round(slowestResource.duration)}ms)`,
        target: '<1000ms',
        recommendation: 'Optimize resource size, implement caching, use CDN'
      });
    }

    // Check memory usage
    if (result.memory && parseFloat(result.memory.usedJSHeapSize) > 50) {
      bottlenecks.push({
        type: 'Memory Usage',
        severity: parseFloat(result.memory.usedJSHeapSize) > 100 ? 'High' : 'Medium',
        value: `${result.memory.usedJSHeapSize}MB`,
        target: '<50MB',
        recommendation: 'Fix memory leaks, optimize data structures, implement proper cleanup'
      });
    }

    if (bottlenecks.length > 0) {
      this.results.bottlenecks.push({
        page: result.page,
        issues: bottlenecks
      });
    }

    result.bottlenecks = bottlenecks;
  }

  async runTests() {
    console.log('🚀 Starting CITZN Performance Testing...\n');
    console.log(`Testing URL: ${BASE_URL}`);
    console.log(`Target page load time: ${THRESHOLDS.pageLoad.target}ms\n`);

    await this.init();

    for (const page of PAGES_TO_TEST) {
      const result = await this.testPage(BASE_URL + page.path, page.name);
      this.results.pages.push(result);
      
      if (!result.failed) {
        console.log(`✅ ${page.name}: ${result.performance.grade} (${result.performance.overall})`);
        console.log(`   Load: ${result.metrics.pageLoadTime}ms | FCP: ${result.metrics.firstContentfulPaint}ms | LCP: ${result.metrics.largestContentfulPaint}ms\n`);
      }
    }

    await this.browser.close();
    this.generateSummary();
    await this.saveResults();
    this.printReport();
  }

  generateSummary() {
    const validPages = this.results.pages.filter(p => !p.failed);
    
    if (validPages.length === 0) {
      this.results.summary = { error: 'No pages could be tested' };
      return;
    }

    const avgMetrics = {
      pageLoadTime: Math.round(validPages.reduce((sum, p) => sum + p.metrics.pageLoadTime, 0) / validPages.length),
      firstContentfulPaint: Math.round(validPages.reduce((sum, p) => sum + p.metrics.firstContentfulPaint, 0) / validPages.length),
      largestContentfulPaint: Math.round(validPages.reduce((sum, p) => sum + p.metrics.largestContentfulPaint, 0) / validPages.length),
      cumulativeLayoutShift: parseFloat((validPages.reduce((sum, p) => sum + p.metrics.cumulativeLayoutShift, 0) / validPages.length).toFixed(3)),
      timeToInteractive: Math.round(validPages.reduce((sum, p) => sum + p.metrics.timeToInteractive, 0) / validPages.length)
    };

    const performance = this.evaluatePerformance(
      avgMetrics.pageLoadTime,
      avgMetrics.firstContentfulPaint,
      avgMetrics.largestContentfulPaint,
      avgMetrics.cumulativeLayoutShift
    );

    this.results.summary = {
      averageMetrics: avgMetrics,
      performance,
      totalPages: PAGES_TO_TEST.length,
      successfulTests: validPages.length,
      failedTests: this.results.pages.filter(p => p.failed).length,
      meetsTarget: avgMetrics.pageLoadTime <= THRESHOLDS.pageLoad.target
    };
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Report saved to: ${filename}\n`);
  }

  printReport() {
    console.log('=' * 60);
    console.log('📊 PERFORMANCE TEST RESULTS');
    console.log('=' * 60);
    
    const summary = this.results.summary;
    
    if (summary.error) {
      console.log(`\n❌ ERROR: ${summary.error}\n`);
      return;
    }

    console.log('\n📈 OVERALL PERFORMANCE:');
    console.log(`Grade: ${summary.performance.grade} (${summary.performance.overall})`);
    console.log(`Meets target (<3s): ${summary.meetsTarget ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📊 AVERAGE METRICS:');
    console.log(`Page Load: ${summary.averageMetrics.pageLoadTime}ms ${this.getStatusIcon(summary.averageMetrics.pageLoadTime, THRESHOLDS.pageLoad)}`);
    console.log(`First Contentful Paint: ${summary.averageMetrics.firstContentfulPaint}ms ${this.getStatusIcon(summary.averageMetrics.firstContentfulPaint, THRESHOLDS.fcp)}`);
    console.log(`Largest Contentful Paint: ${summary.averageMetrics.largestContentfulPaint}ms ${this.getStatusIcon(summary.averageMetrics.largestContentfulPaint, THRESHOLDS.lcp)}`);
    console.log(`Cumulative Layout Shift: ${summary.averageMetrics.cumulativeLayoutShift} ${this.getStatusIcon(summary.averageMetrics.cumulativeLayoutShift, THRESHOLDS.cls, true)}`);
    console.log(`Time to Interactive: ${summary.averageMetrics.timeToInteractive}ms ${this.getStatusIcon(summary.averageMetrics.timeToInteractive, THRESHOLDS.tti)}`);
    
    if (this.results.bottlenecks.length > 0) {
      console.log('\n⚠️  BOTTLENECKS IDENTIFIED:');
      
      for (const pageBottlenecks of this.results.bottlenecks) {
        console.log(`\n${pageBottlenecks.page}:`);
        for (const bottleneck of pageBottlenecks.issues) {
          console.log(`  • [${bottleneck.severity}] ${bottleneck.type}: ${bottleneck.value} (target: ${bottleneck.target})`);
          console.log(`    → ${bottleneck.recommendation}`);
        }
      }
    }
    
    console.log('\n' + '=' * 60);
  }

  getStatusIcon(value, threshold, inverse = false) {
    if (inverse) {
      return value <= threshold.target ? '✅' : value <= threshold.max ? '⚠️' : '❌';
    }
    return value <= threshold.target ? '✅' : value <= threshold.max ? '⚠️' : '❌';
  }
}

// Run the tests
const tester = new PerformanceTester();
tester.runTests().catch(console.error);