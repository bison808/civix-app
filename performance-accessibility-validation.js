#!/usr/bin/env node

/**
 * CITZN Phase 1 Beta - Performance & Accessibility Validation
 * Agent 38: User Experience & Integration Validation Specialist
 * 
 * Comprehensive performance and accessibility testing without browser automation
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const PRODUCTION_URL = 'https://civix-app.vercel.app';

class PerformanceAccessibilityValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      performanceMetrics: {},
      accessibilityChecks: {},
      mobileResponsiveness: {},
      loadTesting: {},
      coreWebVitals: {},
      overallScore: 0
    };
  }

  async makeTimedRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();
      
      https.get(url, (res) => {
        let data = '';
        let dataSize = 0;
        
        res.on('data', chunk => {
          data += chunk;
          dataSize += chunk.length;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const endMemory = process.memoryUsage();
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
            metrics: {
              responseTime: endTime - startTime,
              dataSize,
              memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
              contentType: res.headers['content-type'] || '',
              cacheControl: res.headers['cache-control'] || '',
              serverTiming: res.headers['server-timing'] || '',
              transferEncoding: res.headers['transfer-encoding'] || ''
            }
          });
        });
      }).on('error', reject).setTimeout(30000, () => {
        reject(new Error('Request timeout'));
      });
    });
  }

  async validatePerformanceMetrics() {
    console.log('⚡ Validating Performance Metrics...');
    
    const performance = {
      loadTimes: [],
      averageLoadTime: 0,
      dataTransfer: {},
      caching: {},
      compression: {},
      errors: []
    };

    try {
      // Test multiple load times for consistency
      console.log('  📊 Testing load times (5 runs)...');
      
      for (let i = 0; i < 5; i++) {
        try {
          const response = await this.makeTimedRequest(PRODUCTION_URL);
          performance.loadTimes.push(response.metrics.responseTime);
          
          console.log(`    Run ${i + 1}: ${response.metrics.responseTime}ms (${Math.round(response.metrics.dataSize / 1024)}KB)`);
          
          // Collect metrics from first run
          if (i === 0) {
            performance.dataTransfer = {
              totalSize: response.metrics.dataSize,
              sizeKB: Math.round(response.metrics.dataSize / 1024),
              contentType: response.metrics.contentType,
              compression: response.metrics.transferEncoding.includes('gzip') || 
                          response.headers['content-encoding'] === 'gzip'
            };
            
            performance.caching = {
              cacheControl: response.metrics.cacheControl,
              hasCacheHeaders: !!response.metrics.cacheControl,
              etag: !!response.headers.etag,
              lastModified: !!response.headers['last-modified']
            };
          }
          
        } catch (error) {
          performance.errors.push(`Run ${i + 1} failed: ${error.message}`);
        }
        
        // Brief pause between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (performance.loadTimes.length > 0) {
        performance.averageLoadTime = Math.round(
          performance.loadTimes.reduce((a, b) => a + b, 0) / performance.loadTimes.length
        );
      }

      console.log(`  📈 Average load time: ${performance.averageLoadTime}ms`);
      console.log(`  📦 Page size: ${performance.dataTransfer.sizeKB}KB`);
      console.log(`  🗜️ Compression: ${performance.dataTransfer.compression ? '✅' : '❌'}`);
      console.log(`  💾 Caching: ${performance.caching.hasCacheHeaders ? '✅' : '❌'}`);

    } catch (error) {
      performance.errors.push(error.message);
    }

    this.results.performanceMetrics = performance;
  }

  async validateAccessibilityFeatures() {
    console.log('\n♿ Validating Accessibility Features...');
    
    const accessibility = {
      htmlStructure: {},
      semanticElements: {},
      ariaSupport: {},
      imageAccessibility: {},
      keyboardNavigation: {},
      colorContrast: {},
      errors: []
    };

    try {
      const response = await this.makeTimedRequest(PRODUCTION_URL);
      const html = response.data;

      // Check HTML structure
      console.log('  📋 Analyzing HTML structure...');
      accessibility.htmlStructure = {
        hasDoctype: html.trim().toLowerCase().startsWith('<!doctype'),
        hasLangAttribute: /<html[^>]+lang=/i.test(html),
        hasTitle: /<title>/i.test(html),
        hasMetaViewport: /<meta[^>]+name=['"']viewport['"']/i.test(html),
        hasMetaCharset: /<meta[^>]+charset=/i.test(html)
      };

      // Check semantic elements
      console.log('  🏗️ Checking semantic elements...');
      const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
      accessibility.semanticElements = {};
      
      semanticTags.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>`, 'i');
        accessibility.semanticElements[tag] = regex.test(html);
      });

      // Check heading structure
      const headings = html.match(/<h[1-6][^>]*>/gi) || [];
      accessibility.htmlStructure.hasProperHeadings = headings.length > 0;
      accessibility.htmlStructure.headingCount = headings.length;

      // Check ARIA support
      console.log('  🎯 Analyzing ARIA support...');
      accessibility.ariaSupport = {
        hasAriaLabels: /aria-label=/i.test(html),
        hasAriaDescriptions: /aria-describedby=/i.test(html),
        hasAriaRoles: /role=/i.test(html),
        hasAriaExpanded: /aria-expanded=/i.test(html),
        hasAriaHidden: /aria-hidden=/i.test(html)
      };

      // Check image accessibility
      console.log('  🖼️ Checking image accessibility...');
      const images = html.match(/<img[^>]*>/gi) || [];
      const imagesWithAlt = html.match(/<img[^>]*alt=/gi) || [];
      
      accessibility.imageAccessibility = {
        totalImages: images.length,
        imagesWithAlt: imagesWithAlt.length,
        altTextCompliance: images.length === 0 || imagesWithAlt.length === images.length,
        compliancePercentage: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 100
      };

      // Check for keyboard navigation indicators
      console.log('  ⌨️ Analyzing keyboard navigation...');
      accessibility.keyboardNavigation = {
        hasFocusableElements: /tabindex=/i.test(html),
        hasSkipLinks: /skip.{0,20}(to.{0,20})?content/i.test(html),
        hasAccessKeys: /accesskey=/i.test(html)
      };

      // Basic color contrast check (limited without visual analysis)
      accessibility.colorContrast = {
        hasHighContrastOption: /high.?contrast/i.test(html),
        hasDarkModeOption: /dark.?mode|theme.?dark/i.test(html),
        hasCustomColors: /#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\(/i.test(html)
      };

      // Print accessibility summary
      const structureScore = Object.values(accessibility.htmlStructure).filter(v => v).length;
      const semanticScore = Object.values(accessibility.semanticElements).filter(v => v).length;
      const ariaScore = Object.values(accessibility.ariaSupport).filter(v => v).length;
      
      console.log(`  📋 HTML Structure: ${structureScore}/${Object.keys(accessibility.htmlStructure).length}`);
      console.log(`  🏗️ Semantic Elements: ${semanticScore}/${semanticTags.length}`);
      console.log(`  🎯 ARIA Support: ${ariaScore}/${Object.keys(accessibility.ariaSupport).length}`);
      console.log(`  🖼️ Image Alt Text: ${accessibility.imageAccessibility.compliancePercentage}%`);

    } catch (error) {
      accessibility.errors.push(error.message);
    }

    this.results.accessibilityChecks = accessibility;
  }

  async validateMobileResponsiveness() {
    console.log('\n📱 Validating Mobile Responsiveness...');
    
    const mobile = {
      viewportMeta: {},
      responsiveDesign: {},
      touchFriendly: {},
      mobileOptimization: {},
      errors: []
    };

    try {
      const response = await this.makeTimedRequest(PRODUCTION_URL);
      const html = response.data;

      // Check viewport meta tag
      console.log('  📐 Checking viewport configuration...');
      const viewportMatch = html.match(/<meta[^>]+name=['"']viewport['"'][^>]*content=['"']([^'"]*)['"']/i);
      
      mobile.viewportMeta = {
        hasViewportMeta: !!viewportMatch,
        viewportContent: viewportMatch ? viewportMatch[1] : null,
        hasWidth: viewportMatch ? viewportMatch[1].includes('width') : false,
        hasInitialScale: viewportMatch ? viewportMatch[1].includes('initial-scale') : false,
        hasMaximumScale: viewportMatch ? viewportMatch[1].includes('maximum-scale') : false
      };

      // Check responsive design indicators
      console.log('  📱 Analyzing responsive design...');
      mobile.responsiveDesign = {
        hasMediaQueries: /@media[^{]*\([^)]*\)/i.test(html),
        hasFlexbox: /display:\s*flex|flex-/i.test(html),
        hasGrid: /display:\s*grid|grid-/i.test(html),
        hasResponsiveImages: /srcset=/i.test(html),
        hasResponsiveUnits: /%|vw|vh|em|rem/i.test(html)
      };

      // Check touch-friendly elements
      console.log('  👆 Checking touch-friendly design...');
      mobile.touchFriendly = {
        hasTouchEvents: /ontouchstart|ontouchmove|ontouchend/i.test(html),
        hasLargeClickTargets: /min-height|min-width.*(?:44|48|56)px/i.test(html),
        hasMobileNavigation: /mobile.{0,20}nav|hamburger|menu.{0,20}toggle/i.test(html)
      };

      // Check mobile optimization
      console.log('  🚀 Analyzing mobile optimization...');
      mobile.mobileOptimization = {
        hasAppleTouchIcon: /<link[^>]*apple-touch-icon/i.test(html),
        hasManifest: /<link[^>]*manifest\.json/i.test(html),
        hasThemeColor: /<meta[^>]*theme-color/i.test(html),
        hasMobileFriendlyForms: /type=['"'](?:tel|email|number|date)/i.test(html)
      };

      // Print mobile summary
      const viewportScore = Object.values(mobile.viewportMeta).filter(v => v).length - 1; // Exclude hasViewportMeta from count
      const responsiveScore = Object.values(mobile.responsiveDesign).filter(v => v).length;
      const touchScore = Object.values(mobile.touchFriendly).filter(v => v).length;
      const optimizationScore = Object.values(mobile.mobileOptimization).filter(v => v).length;
      
      console.log(`  📐 Viewport Setup: ${mobile.viewportMeta.hasViewportMeta ? '✅' : '❌'}`);
      console.log(`  📱 Responsive Features: ${responsiveScore}/${Object.keys(mobile.responsiveDesign).length}`);
      console.log(`  👆 Touch-Friendly: ${touchScore}/${Object.keys(mobile.touchFriendly).length}`);
      console.log(`  🚀 Mobile Optimization: ${optimizationScore}/${Object.keys(mobile.mobileOptimization).length}`);

    } catch (error) {
      mobile.errors.push(error.message);
    }

    this.results.mobileResponsiveness = mobile;
  }

  async performLoadTesting() {
    console.log('\n🔄 Performing Load Testing...');
    
    const loadTest = {
      concurrentRequests: {},
      stressTest: {},
      consistencyTest: {},
      errors: []
    };

    try {
      // Test concurrent requests
      console.log('  🚀 Testing concurrent requests...');
      const concurrentCount = 10;
      const startTime = Date.now();
      
      const promises = Array(concurrentCount).fill().map((_, i) => 
        this.makeTimedRequest(PRODUCTION_URL).catch(error => ({ error: error.message, index: i }))
      );
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const successfulRequests = results.filter(r => !r.error);
      const failedRequests = results.filter(r => r.error);
      
      loadTest.concurrentRequests = {
        totalRequests: concurrentCount,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        totalTime,
        averageResponseTime: successfulRequests.length > 0 ? 
          Math.round(successfulRequests.reduce((sum, r) => sum + r.metrics.responseTime, 0) / successfulRequests.length) : 0,
        successRate: Math.round((successfulRequests.length / concurrentCount) * 100)
      };

      console.log(`    ${successfulRequests.length}/${concurrentCount} requests successful`);
      console.log(`    Average response time: ${loadTest.concurrentRequests.averageResponseTime}ms`);
      console.log(`    Success rate: ${loadTest.concurrentRequests.successRate}%`);

      // Quick stress test
      console.log('  💪 Quick stress test...');
      const stressStartTime = Date.now();
      const stressPromises = Array(5).fill().map(() => 
        this.makeTimedRequest(PRODUCTION_URL).catch(error => ({ error: error.message }))
      );
      
      const stressResults = await Promise.all(stressPromises);
      const stressSuccessful = stressResults.filter(r => !r.error);
      
      loadTest.stressTest = {
        requests: 5,
        successful: stressSuccessful.length,
        totalTime: Date.now() - stressStartTime,
        maintained: stressSuccessful.length === 5
      };

      console.log(`    Stress test: ${stressSuccessful.length}/5 successful`);

    } catch (error) {
      loadTest.errors.push(error.message);
    }

    this.results.loadTesting = loadTest;
  }

  async analyzeCoreWebVitals() {
    console.log('\n📊 Analyzing Core Web Vitals Indicators...');
    
    const vitals = {
      loadingPerformance: {},
      interactivityIndicators: {},
      visualStability: {},
      resourceOptimization: {},
      errors: []
    };

    try {
      const response = await this.makeTimedRequest(PRODUCTION_URL);
      const html = response.data;

      // Loading performance indicators
      console.log('  ⚡ Checking loading performance...');
      vitals.loadingPerformance = {
        responseTime: response.metrics.responseTime,
        pageSize: response.metrics.dataSize,
        hasPreload: /<link[^>]*rel=['"']preload/i.test(html),
        hasPrefetch: /<link[^>]*rel=['"']prefetch/i.test(html),
        hasAsyncScripts: /<script[^>]*async/i.test(html),
        hasDeferScripts: /<script[^>]*defer/i.test(html),
        hasLazyLoading: /loading=['"']lazy/i.test(html)
      };

      // Interactivity indicators
      console.log('  🖱️ Analyzing interactivity...');
      vitals.interactivityIndicators = {
        hasServiceWorker: /service.?worker/i.test(html),
        hasEventListeners: /addEventListener|on\w+=/i.test(html),
        hasFormElements: /<(?:input|button|select|textarea)/i.test(html),
        hasInteractiveElements: /<(?:button|a\s[^>]*href|input|select)/i.test(html)
      };

      // Visual stability indicators
      console.log('  👀 Checking visual stability...');
      vitals.visualStability = {
        hasImageDimensions: /<img[^>]*(?:width|height)/i.test(html),
        hasFixedDimensions: /width:\s*\d+px|height:\s*\d+px/i.test(html),
        hasFlexLayout: /display:\s*flex/i.test(html),
        hasGridLayout: /display:\s*grid/i.test(html)
      };

      // Resource optimization
      console.log('  📦 Analyzing resource optimization...');
      vitals.resourceOptimization = {
        hasCompression: response.headers['content-encoding'] === 'gzip',
        hasCaching: !!response.headers['cache-control'],
        hasMinifiedCSS: /\.min\.css/i.test(html),
        hasMinifiedJS: /\.min\.js/i.test(html),
        hasWebP: /\.webp/i.test(html),
        hasCDN: /cdn\.|cloudflare|amazonaws/i.test(html)
      };

      // Print vitals summary
      const loadingScore = Object.values(vitals.loadingPerformance).filter((v, i) => i > 2 && v).length; // Skip responseTime and pageSize
      const interactivityScore = Object.values(vitals.interactivityIndicators).filter(v => v).length;
      const stabilityScore = Object.values(vitals.visualStability).filter(v => v).length;
      const optimizationScore = Object.values(vitals.resourceOptimization).filter(v => v).length;
      
      console.log(`  ⚡ Loading Optimization: ${loadingScore}/${Object.keys(vitals.loadingPerformance).length - 2}`);
      console.log(`  🖱️ Interactivity Features: ${interactivityScore}/${Object.keys(vitals.interactivityIndicators).length}`);
      console.log(`  👀 Visual Stability: ${stabilityScore}/${Object.keys(vitals.visualStability).length}`);
      console.log(`  📦 Resource Optimization: ${optimizationScore}/${Object.keys(vitals.resourceOptimization).length}`);

    } catch (error) {
      vitals.errors.push(error.message);
    }

    this.results.coreWebVitals = vitals;
  }

  calculateOverallScore() {
    console.log('\n📊 Calculating Overall Performance & Accessibility Score...');
    
    let totalScore = 0;
    let maxScore = 100;

    // Performance Score (35 points)
    let performanceScore = 35;
    const avgLoadTime = this.results.performanceMetrics.averageLoadTime || 5000;
    
    if (avgLoadTime > 3000) performanceScore -= 10;
    if (avgLoadTime > 5000) performanceScore -= 10;
    if (!this.results.performanceMetrics.dataTransfer?.compression) performanceScore -= 5;
    if (!this.results.performanceMetrics.caching?.hasCacheHeaders) performanceScore -= 5;
    if (this.results.performanceMetrics.dataTransfer?.sizeKB > 1000) performanceScore -= 5;
    
    totalScore += Math.max(0, performanceScore);

    // Accessibility Score (25 points)
    let accessibilityScore = 0;
    const accessibility = this.results.accessibilityChecks;
    
    if (accessibility.htmlStructure?.hasDoctype) accessibilityScore += 3;
    if (accessibility.htmlStructure?.hasLangAttribute) accessibilityScore += 3;
    if (accessibility.htmlStructure?.hasTitle) accessibilityScore += 3;
    if (accessibility.htmlStructure?.hasMetaViewport) accessibilityScore += 3;
    if (accessibility.imageAccessibility?.altTextCompliance) accessibilityScore += 5;
    if (accessibility.htmlStructure?.hasProperHeadings) accessibilityScore += 4;
    
    const semanticCount = Object.values(accessibility.semanticElements || {}).filter(v => v).length;
    accessibilityScore += Math.min(4, semanticCount);
    
    totalScore += accessibilityScore;

    // Mobile Responsiveness Score (25 points)
    let mobileScore = 0;
    const mobile = this.results.mobileResponsiveness;
    
    if (mobile.viewportMeta?.hasViewportMeta) mobileScore += 8;
    if (mobile.responsiveDesign?.hasMediaQueries) mobileScore += 5;
    if (mobile.responsiveDesign?.hasFlexbox || mobile.responsiveDesign?.hasGrid) mobileScore += 4;
    if (mobile.touchFriendly?.hasMobileNavigation) mobileScore += 4;
    if (mobile.mobileOptimization?.hasManifest) mobileScore += 2;
    if (mobile.mobileOptimization?.hasAppleTouchIcon) mobileScore += 2;
    
    totalScore += mobileScore;

    // Load Testing Score (15 points)
    let loadScore = 0;
    const loadTest = this.results.loadTesting;
    
    if (loadTest.concurrentRequests?.successRate >= 90) loadScore += 8;
    else if (loadTest.concurrentRequests?.successRate >= 80) loadScore += 5;
    else if (loadTest.concurrentRequests?.successRate >= 70) loadScore += 3;
    
    if (loadTest.stressTest?.maintained) loadScore += 7;
    
    totalScore += loadScore;

    this.results.overallScore = Math.min(totalScore, maxScore);
    
    console.log(`📈 Overall Performance & Accessibility Score: ${this.results.overallScore}/100`);
  }

  async generateComprehensiveReport() {
    console.log('\n📋 Generating Performance & Accessibility Report...');
    
    const report = {
      ...this.results,
      summary: {
        testDate: this.results.timestamp,
        overallScore: this.results.overallScore,
        performanceGrade: this.getGrade(this.results.overallScore),
        productionReady: this.results.overallScore >= 80,
        criticalIssues: [],
        recommendations: []
      }
    };

    // Identify critical issues
    if (this.results.performanceMetrics.averageLoadTime > 3000) {
      report.summary.criticalIssues.push(`Slow page load time: ${this.results.performanceMetrics.averageLoadTime}ms`);
    }

    if (!this.results.accessibilityChecks.imageAccessibility?.altTextCompliance) {
      report.summary.criticalIssues.push('Images missing alt text - accessibility compliance issue');
    }

    if (!this.results.mobileResponsiveness.viewportMeta?.hasViewportMeta) {
      report.summary.criticalIssues.push('Missing viewport meta tag - mobile experience compromised');
    }

    if (this.results.loadTesting.concurrentRequests?.successRate < 90) {
      report.summary.criticalIssues.push(`Low success rate under load: ${this.results.loadTesting.concurrentRequests.successRate}%`);
    }

    // Generate recommendations
    if (this.results.performanceMetrics.averageLoadTime > 2000) {
      report.summary.recommendations.push('Optimize page load time through code splitting and lazy loading');
    }

    if (!this.results.performanceMetrics.dataTransfer?.compression) {
      report.summary.recommendations.push('Enable gzip compression for better performance');
    }

    if (!this.results.performanceMetrics.caching?.hasCacheHeaders) {
      report.summary.recommendations.push('Implement proper caching headers for static assets');
    }

    if (!this.results.accessibilityChecks.htmlStructure?.hasProperHeadings) {
      report.summary.recommendations.push('Add proper heading structure for screen reader navigation');
    }

    const semanticCount = Object.values(this.results.accessibilityChecks.semanticElements || {}).filter(v => v).length;
    if (semanticCount < 4) {
      report.summary.recommendations.push('Use more semantic HTML elements for better accessibility');
    }

    // Save report
    const reportPath = path.join(__dirname, `performance-accessibility-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📁 Report saved to: ${reportPath}`);
    
    this.printSummary(report);
    
    return report;
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CITZN PHASE 1 BETA - PERFORMANCE & ACCESSIBILITY SUMMARY');
    console.log('='.repeat(80));
    console.log(`📅 Test Date: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🏆 Overall Score: ${report.overallScore}/100 (Grade: ${report.summary.performanceGrade})`);
    console.log(`🚀 Production Ready: ${report.summary.productionReady ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📊 DETAILED RESULTS:');
    console.log('─'.repeat(50));
    console.log(`⚡ Average Load Time: ${this.results.performanceMetrics.averageLoadTime}ms`);
    console.log(`📦 Page Size: ${this.results.performanceMetrics.dataTransfer?.sizeKB}KB`);
    console.log(`🗜️ Compression: ${this.results.performanceMetrics.dataTransfer?.compression ? '✅' : '❌'}`);
    console.log(`💾 Caching: ${this.results.performanceMetrics.caching?.hasCacheHeaders ? '✅' : '❌'}`);
    console.log(`♿ Alt Text Compliance: ${this.results.accessibilityChecks.imageAccessibility?.compliancePercentage}%`);
    console.log(`📱 Mobile Viewport: ${this.results.mobileResponsiveness.viewportMeta?.hasViewportMeta ? '✅' : '❌'}`);
    console.log(`🔄 Load Test Success: ${this.results.loadTesting.concurrentRequests?.successRate}%`);

    if (report.summary.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      console.log('─'.repeat(50));
      report.summary.criticalIssues.forEach(issue => console.log(`❌ ${issue}`));
    }

    if (report.summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('─'.repeat(50));
      report.summary.recommendations.forEach(rec => console.log(`🔧 ${rec}`));
    }

    console.log('\n' + '='.repeat(80));
  }

  async runComprehensiveValidation() {
    try {
      console.log('🚀 Starting CITZN Performance & Accessibility Validation...');
      console.log('Agent 38: Comprehensive UX Performance Analysis\n');

      await this.validatePerformanceMetrics();
      await this.validateAccessibilityFeatures();
      await this.validateMobileResponsiveness();
      await this.performLoadTesting();
      await this.analyzeCoreWebVitals();
      
      this.calculateOverallScore();
      const report = await this.generateComprehensiveReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ Performance & Accessibility validation failed:', error);
      throw error;
    }
  }
}

// Run validation suite
async function main() {
  const validator = new PerformanceAccessibilityValidator();
  
  try {
    const report = await validator.runComprehensiveValidation();
    
    console.log('\n✅ Performance & Accessibility validation completed!');
    
    // Return exit code based on production readiness
    process.exit(report.summary.productionReady ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Performance & Accessibility validation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PerformanceAccessibilityValidator;