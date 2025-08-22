const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.results = [];
    this.baseUrl = process.env.CITZN_URL || 'https://citznvote.netlify.app';
  }

  async runLighthouseTest(url, options = {}) {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    
    const config = {
      extends: 'lighthouse:default',
      settings: {
        throttlingMethod: options.network || 'simulate',
        throttling: {
          rttMs: options.network === '3G' ? 300 : 40,
          throughputKbps: options.network === '3G' ? 1600 : 10240,
          cpuSlowdownMultiplier: options.network === '3G' ? 4 : 1,
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        ...options.settings
      }
    };

    try {
      const runnerResult = await lighthouse(url, {
        port: chrome.port,
        ...options.flags
      }, config);

      await chrome.kill();
      return runnerResult;
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  }

  async measurePageLoadTimes() {
    const pages = [
      { name: 'Homepage', url: `${this.baseUrl}/` },
      { name: 'Bill Feed', url: `${this.baseUrl}/feed` },
      { name: 'Representatives', url: `${this.baseUrl}/representatives` },
      { name: 'Registration', url: `${this.baseUrl}/register` },
      { name: 'Login', url: `${this.baseUrl}/login` }
    ];

    const networkConditions = [
      { name: 'Fast 4G', network: 'fast4G' },
      { name: '3G', network: '3G' },
      { name: 'Slow 3G', network: 'slow3G' }
    ];

    console.log('🚀 Starting Lighthouse performance tests...');

    for (const condition of networkConditions) {
      console.log(`\n📡 Testing with ${condition.name} network`);
      
      for (const page of pages) {
        console.log(`  📄 Testing ${page.name}...`);
        
        try {
          const result = await this.runLighthouseTest(page.url, {
            network: condition.network,
            flags: {
              onlyCategories: ['performance']
            }
          });

          const metrics = result.lhr.audits;
          
          this.results.push({
            page: page.name,
            url: page.url,
            network: condition.name,
            timestamp: new Date().toISOString(),
            scores: {
              performance: result.lhr.categories.performance.score * 100,
              accessibility: result.lhr.categories.accessibility?.score * 100 || 0,
              bestPractices: result.lhr.categories['best-practices']?.score * 100 || 0
            },
            metrics: {
              firstContentfulPaint: metrics['first-contentful-paint']?.numericValue,
              largestContentfulPaint: metrics['largest-contentful-paint']?.numericValue,
              speedIndex: metrics['speed-index']?.numericValue,
              timeToInteractive: metrics['interactive']?.numericValue,
              firstMeaningfulPaint: metrics['first-meaningful-paint']?.numericValue,
              cumulativeLayoutShift: metrics['cumulative-layout-shift']?.numericValue,
              totalBlockingTime: metrics['total-blocking-time']?.numericValue
            },
            resourceSummary: {
              totalBytes: metrics['total-byte-weight']?.numericValue,
              imageBytes: metrics['modern-image-formats']?.details?.overallSavingsBytes || 0,
              jsBytes: metrics['unused-javascript']?.details?.overallSavingsBytes || 0,
              cssBytes: metrics['unused-css-rules']?.details?.overallSavingsBytes || 0
            }
          });

          console.log(`    ✅ Performance Score: ${Math.round(result.lhr.categories.performance.score * 100)}`);
          console.log(`    ⚡ LCP: ${Math.round(metrics['largest-contentful-paint']?.numericValue)}ms`);
          console.log(`    🎯 TTI: ${Math.round(metrics['interactive']?.numericValue)}ms`);
          
        } catch (error) {
          console.error(`    ❌ Failed to test ${page.name}: ${error.message}`);
          this.results.push({
            page: page.name,
            url: page.url,
            network: condition.name,
            timestamp: new Date().toISOString(),
            error: error.message
          });
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return this.results;
  }

  async measureBundleSizes() {
    console.log('\n📦 Analyzing bundle sizes...');
    
    try {
      const bundleAnalysisResult = await this.runLighthouseTest(`${this.baseUrl}/`, {
        flags: {
          onlyAudits: [
            'total-byte-weight',
            'unused-javascript',
            'unused-css-rules',
            'modern-image-formats',
            'uses-text-compression',
            'uses-optimized-images'
          ]
        }
      });

      const audits = bundleAnalysisResult.lhr.audits;
      
      return {
        totalBytes: audits['total-byte-weight']?.numericValue,
        unusedJS: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
        unusedCSS: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
        unoptimizedImages: audits['modern-image-formats']?.details?.overallSavingsBytes || 0,
        compressionSavings: audits['uses-text-compression']?.details?.overallSavingsBytes || 0,
        imageSavings: audits['uses-optimized-images']?.details?.overallSavingsBytes || 0
      };
      
    } catch (error) {
      console.error(`❌ Bundle analysis failed: ${error.message}`);
      return { error: error.message };
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../performance/lighthouse-report-${timestamp}.json`);
    
    // Ensure performance directory exists
    const perfDir = path.dirname(reportPath);
    if (!fs.existsSync(perfDir)) {
      fs.mkdirSync(perfDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Performance report saved to: ${reportPath}`);
    
    return report;
  }

  generateSummary() {
    const validResults = this.results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      return { error: 'No valid test results' };
    }

    const avgPerformance = validResults.reduce((sum, r) => sum + (r.scores?.performance || 0), 0) / validResults.length;
    const slowestLCP = Math.max(...validResults.map(r => r.metrics?.largestContentfulPaint || 0));
    const slowestTTI = Math.max(...validResults.map(r => r.metrics?.timeToInteractive || 0));
    
    return {
      averagePerformanceScore: Math.round(avgPerformance),
      slowestLargestContentfulPaint: Math.round(slowestLCP),
      slowestTimeToInteractive: Math.round(slowestTTI),
      totalTestsRun: validResults.length,
      failedTests: this.results.filter(r => r.error).length
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const validResults = this.results.filter(r => !r.error);

    // Performance recommendations
    const avgPerf = validResults.reduce((sum, r) => sum + (r.scores?.performance || 0), 0) / validResults.length;
    if (avgPerf < 80) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Performance',
        issue: 'Low performance scores detected',
        recommendation: 'Optimize Core Web Vitals - focus on LCP, FID, and CLS improvements'
      });
    }

    // LCP recommendations
    const maxLCP = Math.max(...validResults.map(r => r.metrics?.largestContentfulPaint || 0));
    if (maxLCP > 2500) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Loading Performance',
        issue: `Largest Contentful Paint is ${Math.round(maxLCP)}ms (target: <2500ms)`,
        recommendation: 'Optimize images, implement lazy loading, and reduce server response times'
      });
    }

    // TTI recommendations
    const maxTTI = Math.max(...validResults.map(r => r.metrics?.timeToInteractive || 0));
    if (maxTTI > 3800) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Interactivity',
        issue: `Time to Interactive is ${Math.round(maxTTI)}ms (target: <3800ms)`,
        recommendation: 'Reduce JavaScript execution time and minimize main thread blocking'
      });
    }

    return recommendations;
  }
}

// CLI execution
if (require.main === module) {
  async function main() {
    const monitor = new PerformanceMonitor();
    
    try {
      await monitor.measurePageLoadTimes();
      const bundleAnalysis = await monitor.measureBundleSizes();
      
      console.log('\n📦 Bundle Analysis:');
      console.log(`Total Bundle Size: ${Math.round((bundleAnalysis.totalBytes || 0) / 1024)}KB`);
      console.log(`Unused JavaScript: ${Math.round((bundleAnalysis.unusedJS || 0) / 1024)}KB`);
      console.log(`Unused CSS: ${Math.round((bundleAnalysis.unusedCSS || 0) / 1024)}KB`);
      
      const report = monitor.generateReport();
      console.log('\n🎯 Performance Summary:');
      console.log(`Average Performance Score: ${report.summary.averagePerformanceScore}/100`);
      console.log(`Slowest LCP: ${report.summary.slowestLargestContentfulPaint}ms`);
      console.log(`Slowest TTI: ${report.summary.slowestTimeToInteractive}ms`);
      
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

module.exports = PerformanceMonitor;