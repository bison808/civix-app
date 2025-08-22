#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Performance testing configuration for civic platform
const CIVIC_TEST_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  outputDir: './performance-reports',
  testDuration: 60, // seconds
  concurrentUsers: [1, 5, 10, 25], // Simulate different load levels
  pages: [
    { name: 'Homepage', path: '/' },
    { name: 'Bills Feed', path: '/feed' },
    { name: 'Representatives', path: '/representatives' },
    { name: 'Bill Detail', path: '/bill/hr-1-119' },
    { name: 'Representative Detail', path: '/representatives/A000374' },
  ],
  metrics: [
    'First Contentful Paint',
    'Largest Contentful Paint', 
    'Cumulative Layout Shift',
    'Time to Interactive',
    'Total Blocking Time',
  ],
  thresholds: {
    lcp: 2500, // ms
    fcp: 1800, // ms
    cls: 0.1,
    tti: 3800, // ms
    tbt: 300, // ms
  }
};

class CivicPerformanceTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async runFullSuite() {
    console.log('🚀 Starting CITZN Civic Platform Performance Testing');
    console.log(`📊 Testing ${CIVIC_TEST_CONFIG.pages.length} pages with ${CIVIC_TEST_CONFIG.concurrentUsers.length} user load scenarios\n`);

    // Create output directory
    await fs.mkdir(CIVIC_TEST_CONFIG.outputDir, { recursive: true });

    // Test each page under different loads
    for (const userCount of CIVIC_TEST_CONFIG.concurrentUsers) {
      console.log(`👥 Testing with ${userCount} concurrent users...`);
      await this.testConcurrentUsers(userCount);
    }

    // Generate comprehensive report
    await this.generateReport();
    
    console.log('\n✅ Performance testing complete!');
    console.log(`📁 Reports saved to: ${CIVIC_TEST_CONFIG.outputDir}`);
  }

  async testConcurrentUsers(userCount) {
    const browsers = [];
    const testPromises = [];

    try {
      // Launch browsers for concurrent testing
      for (let i = 0; i < userCount; i++) {
        const browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
          ]
        });
        browsers.push(browser);
      }

      // Run tests for each page
      for (const pageConfig of CIVIC_TEST_CONFIG.pages) {
        console.log(`  📄 Testing ${pageConfig.name}...`);
        
        const pagePromises = browsers.map((browser, index) =>
          this.testPagePerformance(browser, pageConfig, userCount, index)
        );
        
        testPromises.push(...pagePromises);
      }

      // Wait for all tests to complete
      const results = await Promise.allSettled(testPromises);
      
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.results.push(result.value);
        } else {
          this.errors.push({
            test: `User ${index % userCount} - ${CIVIC_TEST_CONFIG.pages[Math.floor(index / userCount)]?.name}`,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

    } finally {
      // Clean up browsers
      await Promise.all(browsers.map(browser => 
        browser.close().catch(console.error)
      ));
    }
  }

  async testPagePerformance(browser, pageConfig, userCount, userIndex) {
    const page = await browser.newPage();
    
    try {
      // Simulate different network conditions for civic users
      const networkConditions = this.getNetworkCondition(userIndex);
      await page.emulateNetworkConditions(networkConditions);

      // Enable performance monitoring
      await page.setCacheEnabled(false); // Test fresh loads
      const client = await page.target().createCDPSession();
      await client.send('Performance.enable');

      // Navigate and measure
      const startTime = Date.now();
      await page.goto(`${CIVIC_TEST_CONFIG.baseUrl}${pageConfig.path}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for civic content to load (bills, representatives, etc.)
      await page.waitForSelector('main', { timeout: 10000 }).catch(() => {
        console.warn(`Main content not found for ${pageConfig.name}`);
      });

      const loadTime = Date.now() - startTime;

      // Collect Web Vitals
      const webVitals = await this.collectWebVitals(page);
      
      // Collect civic-specific metrics
      const civicMetrics = await this.collectCivicMetrics(page, pageConfig);

      // Test interactivity for civic actions
      const interactionMetrics = await this.testCivicInteractions(page, pageConfig);

      return {
        page: pageConfig.name,
        path: pageConfig.path,
        userCount,
        userIndex,
        networkCondition: networkConditions.offline ? 'offline' : 
                         networkConditions.downloadThroughput < 1000000 ? '3G' : '4G',
        loadTime,
        webVitals,
        civicMetrics,
        interactionMetrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Performance test failed for ${pageConfig.name}: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async collectWebVitals(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Use web-vitals library if available
        if (window.webVitals) {
          const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;
          
          let metricsCollected = 0;
          const targetMetrics = 5;
          
          const collectMetric = (metric) => {
            vitals[metric.name] = {
              value: metric.value,
              rating: metric.value <= (metric.name === 'CLS' ? 0.1 : 
                     metric.name === 'FCP' ? 1800 :
                     metric.name === 'LCP' ? 2500 :
                     metric.name === 'FID' ? 100 : 800) ? 'good' : 'needs-improvement'
            };
            
            metricsCollected++;
            if (metricsCollected >= targetMetrics) {
              resolve(vitals);
            }
          };

          getCLS(collectMetric);
          getFID(collectMetric);
          getFCP(collectMetric);
          getLCP(collectMetric);
          getTTFB(collectMetric);
          
          // Fallback after timeout
          setTimeout(() => resolve(vitals), 5000);
        } else {
          // Fallback performance measurements
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            vitals.loadTime = navigation.loadEventEnd - navigation.fetchStart;
            vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          }
          resolve(vitals);
        }
      });
    });
  }

  async collectCivicMetrics(page, pageConfig) {
    return await page.evaluate((config) => {
      const metrics = {};
      
      // Count civic content elements
      metrics.billsVisible = document.querySelectorAll('[data-testid*="bill"]').length;
      metrics.representativesVisible = document.querySelectorAll('[data-testid*="representative"]').length;
      metrics.imagesLoaded = document.querySelectorAll('img[src]').length;
      
      // Check for key civic features
      metrics.hasSearchFunction = !!document.querySelector('[data-testid="search"]');
      metrics.hasVotingInterface = !!document.querySelector('[data-testid*="vote"]');
      metrics.hasContactButtons = !!document.querySelector('[data-testid*="contact"]');
      
      // Measure content visibility timing
      const contentElements = document.querySelectorAll('main [data-testid]');
      metrics.contentElementsVisible = contentElements.length;
      
      return metrics;
    }, pageConfig);
  }

  async testCivicInteractions(page, pageConfig) {
    const interactions = {};
    
    try {
      // Test search functionality if available
      const searchInput = await page.$('[data-testid="search"]');
      if (searchInput) {
        const searchStart = Date.now();
        await searchInput.type('climate change');
        await page.keyboard.press('Enter');
        await page.waitForSelector('[data-testid*="search-result"]', { timeout: 5000 });
        interactions.searchResponseTime = Date.now() - searchStart;
      }

      // Test voting interaction if available
      const voteButton = await page.$('[data-testid*="vote-like"]');
      if (voteButton) {
        const voteStart = Date.now();
        await voteButton.click();
        await page.waitForSelector('[data-testid*="vote-success"]', { timeout: 3000 }).catch(() => {});
        interactions.voteResponseTime = Date.now() - voteStart;
      }

      // Test navigation responsiveness
      const navLinks = await page.$$('nav a');
      if (navLinks.length > 0) {
        const navStart = Date.now();
        await navLinks[0].click();
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        interactions.navigationTime = Date.now() - navStart;
      }

    } catch (error) {
      interactions.error = error.message;
    }

    return interactions;
  }

  getNetworkCondition(userIndex) {
    const conditions = [
      // Fast 4G
      {
        offline: false,
        downloadThroughput: 4 * 1024 * 1024, // 4 Mbps
        uploadThroughput: 1 * 1024 * 1024,   // 1 Mbps
        latency: 20
      },
      // Slow 3G (common for civic users)
      {
        offline: false,
        downloadThroughput: 500 * 1024, // 500 Kbps
        uploadThroughput: 500 * 1024,
        latency: 400
      },
      // Regular 3G
      {
        offline: false,
        downloadThroughput: 1.6 * 1024 * 1024, // 1.6 Mbps
        uploadThroughput: 750 * 1024,
        latency: 150
      }
    ];

    return conditions[userIndex % conditions.length];
  }

  async generateReport() {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportData = {
      timestamp,
      config: CIVIC_TEST_CONFIG,
      results: this.results,
      errors: this.errors,
      summary: this.generateSummary()
    };

    // Save detailed JSON report
    const jsonPath = path.join(CIVIC_TEST_CONFIG.outputDir, `civic-performance-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(reportData);
    const htmlPath = path.join(CIVIC_TEST_CONFIG.outputDir, `civic-performance-${timestamp}.html`);
    await fs.writeFile(htmlPath, htmlReport);

    console.log(`\n📊 Performance Summary:`);
    console.log(`   Average Load Time: ${reportData.summary.avgLoadTime}ms`);
    console.log(`   Pages Tested: ${reportData.summary.pagesCount}`);
    console.log(`   Total Tests: ${reportData.summary.testsRun}`);
    console.log(`   Success Rate: ${reportData.summary.successRate}%`);
  }

  generateSummary() {
    const successfulTests = this.results.filter(r => r.loadTime);
    const totalLoadTime = successfulTests.reduce((sum, r) => sum + r.loadTime, 0);
    
    return {
      testsRun: this.results.length,
      successCount: successfulTests.length,
      errorCount: this.errors.length,
      successRate: Math.round((successfulTests.length / this.results.length) * 100),
      avgLoadTime: Math.round(totalLoadTime / successfulTests.length),
      pagesCount: CIVIC_TEST_CONFIG.pages.length,
      webVitalsPassRate: this.calculateWebVitalsPassRate()
    };
  }

  calculateWebVitalsPassRate() {
    const testsWithVitals = this.results.filter(r => r.webVitals && Object.keys(r.webVitals).length > 0);
    if (testsWithVitals.length === 0) return 0;
    
    let totalPassed = 0;
    testsWithVitals.forEach(test => {
      const vitals = test.webVitals;
      let passed = 0;
      let total = 0;
      
      Object.values(vitals).forEach(vital => {
        if (vital.rating) {
          total++;
          if (vital.rating === 'good') passed++;
        }
      });
      
      totalPassed += (passed / total) * 100;
    });
    
    return Math.round(totalPassed / testsWithVitals.length);
  }

  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>CITZN Civic Platform Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #007bff; color: white; }
        .chart { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ CITZN Civic Platform Performance Report</h1>
            <p>Generated on ${data.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${data.summary.avgLoadTime}ms</div>
                <div class="metric-label">Average Load Time</div>
            </div>
            <div class="metric">
                <div class="metric-value ${data.summary.successRate >= 95 ? 'good' : data.summary.successRate >= 90 ? 'warning' : 'error'}">${data.summary.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.webVitalsPassRate}%</div>
                <div class="metric-label">Web Vitals Pass Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.summary.testsRun}</div>
                <div class="metric-label">Total Tests</div>
            </div>
        </div>

        <h2>📄 Page Performance Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Load Time</th>
                    <th>LCP</th>
                    <th>FCP</th>
                    <th>CLS</th>
                    <th>Network</th>
                    <th>Bills/Reps Visible</th>
                </tr>
            </thead>
            <tbody>
                ${data.results.map(result => `
                    <tr>
                        <td>${result.page}</td>
                        <td class="${result.loadTime < 3000 ? 'good' : result.loadTime < 5000 ? 'warning' : 'error'}">${result.loadTime}ms</td>
                        <td>${result.webVitals?.LCP?.value ? Math.round(result.webVitals.LCP.value) + 'ms' : 'N/A'}</td>
                        <td>${result.webVitals?.FCP?.value ? Math.round(result.webVitals.FCP.value) + 'ms' : 'N/A'}</td>
                        <td>${result.webVitals?.CLS?.value ? result.webVitals.CLS.value.toFixed(3) : 'N/A'}</td>
                        <td>${result.networkCondition}</td>
                        <td>${(result.civicMetrics?.billsVisible || 0) + (result.civicMetrics?.representativesVisible || 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        ${data.errors.length > 0 ? `
            <h2>❌ Errors Encountered</h2>
            <ul>
                ${data.errors.map(error => `<li><strong>${error.test}:</strong> ${error.error}</li>`).join('')}
            </ul>
        ` : ''}

        <h2>🎯 Recommendations for Civic Platform</h2>
        <ul>
            <li><strong>Load Time:</strong> ${data.summary.avgLoadTime > 3000 ? 'Consider optimizing images and implementing lazy loading for civic content' : 'Good performance for civic users'}</li>
            <li><strong>Web Vitals:</strong> ${data.summary.webVitalsPassRate < 80 ? 'Focus on improving Core Web Vitals for better civic engagement' : 'Excellent Web Vitals performance'}</li>
            <li><strong>Content:</strong> Ensure bills and representative data load quickly for civic engagement</li>
            <li><strong>Network:</strong> Optimize for 3G networks commonly used by civic-minded citizens</li>
        </ul>
    </div>
</body>
</html>`;
  }
}

// CLI execution
if (require.main === module) {
  const tester = new CivicPerformanceTester();
  tester.runFullSuite().catch(error => {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = CivicPerformanceTester;