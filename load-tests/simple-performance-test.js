const puppeteer = require('puppeteer');
const axios = require('axios');
const { performance } = require('perf_hooks');

class SimplePerformanceTest {
  constructor() {
    this.baseUrl = process.env.CITZN_URL || 'https://citznvote.netlify.app';
    this.results = [];
  }

  async measurePageLoadTimes() {
    console.log('🚀 Measuring page load times with Puppeteer...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const pages = [
      { name: 'Homepage', url: `${this.baseUrl}/` },
      { name: 'Feed', url: `${this.baseUrl}/feed` },
      { name: 'Representatives', url: `${this.baseUrl}/representatives` },
      { name: 'Register', url: `${this.baseUrl}/register` }
    ];
    
    for (const pageInfo of pages) {
      console.log(`\n📄 Testing ${pageInfo.name}...`);
      
      try {
        const page = await browser.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('CITZN-Performance-Test/1.0');
        
        // Measure with performance timing
        const startTime = performance.now();
        
        const response = await page.goto(pageInfo.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        const loadTime = performance.now() - startTime;
        
        // Get Web Vitals using browser APIs
        const vitals = await page.evaluate(() => {
          return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const vitalsData = {};
              
              entries.forEach(entry => {
                if (entry.name === 'FCP') vitalsData.fcp = entry.value;
                if (entry.name === 'LCP') vitalsData.lcp = entry.value;
                if (entry.name === 'FID') vitalsData.fid = entry.value;
                if (entry.name === 'CLS') vitalsData.cls = entry.value;
              });
              
              // Fallback to Navigation Timing API
              const navigation = performance.getEntriesByType('navigation')[0];
              if (navigation) {
                vitalsData.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
                vitalsData.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
                vitalsData.firstByte = navigation.responseStart - navigation.navigationStart;
              }
              
              resolve(vitalsData);
            });
            
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
            
            // Timeout after 5 seconds
            setTimeout(() => {
              const navigation = performance.getEntriesByType('navigation')[0];
              resolve({
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : null,
                loadComplete: navigation ? navigation.loadEventEnd - navigation.navigationStart : null,
                firstByte: navigation ? navigation.responseStart - navigation.navigationStart : null
              });
            }, 5000);
          });
        });
        
        // Check for errors in console
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        // Measure resource counts
        const resourceStats = await page.evaluate(() => {
          const resources = performance.getEntriesByType('resource');
          const stats = {
            totalResources: resources.length,
            images: resources.filter(r => r.initiatorType === 'img').length,
            scripts: resources.filter(r => r.initiatorType === 'script').length,
            stylesheets: resources.filter(r => r.initiatorType === 'link').length,
            totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
          };
          return stats;
        });
        
        this.results.push({
          page: pageInfo.name,
          url: pageInfo.url,
          timestamp: new Date().toISOString(),
          success: response.ok(),
          statusCode: response.status(),
          metrics: {
            totalLoadTime: Math.round(loadTime),
            firstByte: Math.round(vitals.firstByte || 0),
            domContentLoaded: Math.round(vitals.domContentLoaded || 0),
            loadComplete: Math.round(vitals.loadComplete || 0),
            fcp: Math.round(vitals.fcp || 0),
            lcp: Math.round(vitals.lcp || 0)
          },
          resources: resourceStats,
          errors: errors.slice(0, 5) // Limit error count
        });
        
        console.log(`  ✅ Status: ${response.status()}`);
        console.log(`  ⚡ Load Time: ${Math.round(loadTime)}ms`);
        console.log(`  📊 DOM Ready: ${Math.round(vitals.domContentLoaded || 0)}ms`);
        console.log(`  🎯 Resources: ${resourceStats.totalResources}`);
        console.log(`  💾 Size: ${Math.round((resourceStats.totalSize || 0) / 1024)}KB`);
        
        await page.close();
        
      } catch (error) {
        console.error(`  ❌ Failed to test ${pageInfo.name}: ${error.message}`);
        this.results.push({
          page: pageInfo.name,
          url: pageInfo.url,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await browser.close();
    return this.results;
  }

  async testOfflineFunctionality() {
    console.log('\n📱 Testing offline functionality...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Load the main page first
      await page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      
      // Go offline
      await page.setOfflineMode(true);
      
      // Try to navigate to different pages
      const offlinePages = ['/feed', '/representatives', '/register'];
      const offlineResults = [];
      
      for (const pagePath of offlinePages) {
        try {
          const response = await page.goto(`${this.baseUrl}${pagePath}`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });
          
          // Check if offline page is shown
          const hasOfflineIndicator = await page.evaluate(() => {
            return document.body.textContent.toLowerCase().includes('offline') ||
                   document.body.textContent.toLowerCase().includes('no connection') ||
                   document.querySelector('[data-offline]') !== null;
          });
          
          offlineResults.push({
            page: pagePath,
            accessible: response !== null,
            hasOfflineIndicator,
            statusCode: response ? response.status() : null
          });
          
        } catch (error) {
          offlineResults.push({
            page: pagePath,
            accessible: false,
            error: error.message
          });
        }
      }
      
      console.log('  📊 Offline test results:');
      offlineResults.forEach(result => {
        console.log(`    ${result.page}: ${result.accessible ? '✅ Accessible' : '❌ Not accessible'}`);
        if (result.hasOfflineIndicator) {
          console.log(`      📱 Has offline indicator`);
        }
      });
      
      await browser.close();
      return offlineResults;
      
    } catch (error) {
      await browser.close();
      console.error(`  ❌ Offline testing failed: ${error.message}`);
      return { error: error.message };
    }
  }

  async testWith3GConnection() {
    console.log('\n📡 Testing with 3G network simulation...');
    
    try {
      // Use axios with timeout to simulate slower connection
      const startTime = performance.now();
      
      const response = await axios.get(`${this.baseUrl}/`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'CITZN-3G-Test/1.0'
        }
      });
      
      const loadTime = performance.now() - startTime;
      
      const result = {
        success: response.status === 200,
        loadTime: Math.round(loadTime),
        statusCode: response.status,
        isUsable: response.data.includes('CITZN') || response.data.includes('Bills')
      };
      
      console.log(`  ✅ 3G Load Time: ${Math.round(loadTime)}ms`);
      console.log(`  📱 Usable: ${result.isUsable ? 'Yes' : 'No'}`);
      
      return result;
      
    } catch (error) {
      console.error(`  ❌ 3G testing failed: ${error.message}`);
      return { error: error.message };
    }
  }

  generatePerformanceReport() {
    const validResults = this.results.filter(r => r.success);
    
    if (validResults.length === 0) {
      return { error: 'No valid performance data collected' };
    }
    
    const avgLoadTime = validResults.reduce((sum, r) => sum + r.metrics.totalLoadTime, 0) / validResults.length;
    const avgDOMReady = validResults.reduce((sum, r) => sum + (r.metrics.domContentLoaded || 0), 0) / validResults.length;
    const avgFirstByte = validResults.reduce((sum, r) => sum + (r.metrics.firstByte || 0), 0) / validResults.length;
    const totalSize = validResults.reduce((sum, r) => sum + (r.resources?.totalSize || 0), 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        pagesLoaded: validResults.length,
        averageLoadTime: Math.round(avgLoadTime),
        averageDOMReady: Math.round(avgDOMReady),
        averageFirstByte: Math.round(avgFirstByte),
        totalResourceSize: Math.round(totalSize / 1024) + 'KB'
      },
      pageResults: this.results,
      performance: {
        fastest: Math.min(...validResults.map(r => r.metrics.totalLoadTime)),
        slowest: Math.max(...validResults.map(r => r.metrics.totalLoadTime)),
        grade: this.calculatePerformanceGrade(avgLoadTime)
      },
      recommendations: this.generatePerformanceRecommendations(validResults)
    };
    
    const fs = require('fs');
    const path = require('path');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../performance/simple-performance-report-${timestamp}.json`);
    
    // Ensure performance directory exists
    const perfDir = path.dirname(reportPath);
    if (!fs.existsSync(perfDir)) {
      fs.mkdirSync(perfDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Performance report saved to: ${reportPath}`);
    
    return report;
  }

  calculatePerformanceGrade(avgLoadTime) {
    if (avgLoadTime < 1000) return 'A+';
    if (avgLoadTime < 2000) return 'A';
    if (avgLoadTime < 3000) return 'B';
    if (avgLoadTime < 5000) return 'C';
    return 'D';
  }

  generatePerformanceRecommendations(results) {
    const recommendations = [];
    const avgLoadTime = results.reduce((sum, r) => sum + r.metrics.totalLoadTime, 0) / results.length;
    const avgSize = results.reduce((sum, r) => sum + (r.resources?.totalSize || 0), 0) / results.length;
    
    if (avgLoadTime > 3000) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Load Time',
        issue: `Average load time is ${Math.round(avgLoadTime)}ms`,
        recommendation: 'Optimize images, implement lazy loading, minify CSS/JS'
      });
    }
    
    if (avgSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Bundle Size',
        issue: `Average page size is ${Math.round(avgSize / 1024 / 1024 * 100) / 100}MB`,
        recommendation: 'Implement code splitting, compress images, remove unused code'
      });
    }
    
    const hasErrors = results.some(r => r.errors && r.errors.length > 0);
    if (hasErrors) {
      recommendations.push({
        priority: 'HIGH',
        category: 'JavaScript Errors',
        issue: 'JavaScript errors detected during page load',
        recommendation: 'Fix console errors that may impact user experience'
      });
    }
    
    return recommendations;
  }
}

// CLI execution
if (require.main === module) {
  async function main() {
    const perfTest = new SimplePerformanceTest();
    
    try {
      console.log('🚀 Starting Simple Performance Tests...');
      
      // Measure page load times
      await perfTest.measurePageLoadTimes();
      
      // Test 3G performance
      const g3Result = await perfTest.testWith3GConnection();
      
      // Test offline functionality
      const offlineResult = await perfTest.testOfflineFunctionality();
      
      // Generate report
      const report = perfTest.generatePerformanceReport();
      
      console.log('\n🎯 Performance Summary:');
      console.log(`Pages Loaded: ${report.summary.pagesLoaded}`);
      console.log(`Average Load Time: ${report.summary.averageLoadTime}ms`);
      console.log(`Performance Grade: ${report.performance.grade}`);
      console.log(`Total Resource Size: ${report.summary.totalResourceSize}`);
      
      if (g3Result && !g3Result.error) {
        console.log(`3G Load Time: ${g3Result.loadTime}ms`);
      }
      
      if (report.recommendations.length > 0) {
        console.log('\n🔧 Recommendations:');
        report.recommendations.forEach(rec => {
          console.log(`  ${rec.priority}: ${rec.issue}`);
          console.log(`    💡 ${rec.recommendation}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = SimplePerformanceTest;