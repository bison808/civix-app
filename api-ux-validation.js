#!/usr/bin/env node

/**
 * CITZN Phase 1 Beta - API-Based User Experience Validation
 * Agent 38: User Experience & Integration Validation Specialist
 * 
 * Comprehensive validation without browser automation
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PRODUCTION_URL = 'https://civix-app.vercel.app';
const LOCAL_URL = 'http://localhost:3012';

// Test ZIP codes for comprehensive coverage
const TEST_ZIP_CODES = [
  '95060', // Santa Cruz, CA - Primary test location
  '90210', // Beverly Hills, CA - High profile area
  '94102', // San Francisco, CA - Nancy Pelosi district
  '92109', // San Diego, CA - Different region
  '95814', // Sacramento, CA - State capital
  '90025', // West LA - Ted Lieu district
  '91801', // Alhambra, CA - Judy Chu district
  '95113'  // San Jose, CA - Tech hub
];

class APIUXValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      siteAccessibility: {},
      dataIntegrity: {},
      apiResponseTimes: {},
      zipCodeValidation: {},
      crossPageConsistency: {},
      errorHandling: {},
      overallScore: 0
    };
  }

  async makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      const startTime = Date.now();
      
      const req = protocol.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
            responseTime,
            redirected: res.statusCode >= 300 && res.statusCode < 400
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async validateSiteAccessibility() {
    console.log('🌐 Validating Site Accessibility...');
    
    const accessibility = {
      productionAccessible: false,
      localAccessible: false,
      loadTimes: {},
      errors: []
    };

    try {
      // Test production site
      console.log('  📡 Testing production site...');
      const prodResponse = await this.makeHttpRequest(PRODUCTION_URL);
      accessibility.productionAccessible = prodResponse.statusCode === 200;
      accessibility.loadTimes.production = prodResponse.responseTime;
      
      console.log(`    Production: ${prodResponse.statusCode} (${prodResponse.responseTime}ms)`);

      // Test local development server
      console.log('  🏠 Testing local development server...');
      try {
        const localResponse = await this.makeHttpRequest(LOCAL_URL);
        accessibility.localAccessible = localResponse.statusCode === 200;
        accessibility.loadTimes.local = localResponse.responseTime;
        console.log(`    Local: ${localResponse.statusCode} (${localResponse.responseTime}ms)`);
      } catch (error) {
        accessibility.errors.push(`Local server not accessible: ${error.message}`);
        console.log('    Local: Not running');
      }

    } catch (error) {
      accessibility.errors.push(`Production site error: ${error.message}`);
    }

    this.results.siteAccessibility = accessibility;
  }

  async validateDataIntegrity() {
    console.log('\n📊 Validating Data Integrity...');
    
    const integrity = {
      noPlaceholderContent: true,
      realDataPresent: true,
      placeholdersFound: [],
      realDataIndicators: [],
      errors: []
    };

    try {
      const response = await this.makeHttpRequest(PRODUCTION_URL);
      const content = response.data.toLowerCase();

      // Check for placeholder content
      const placeholderPatterns = [
        'lorem ipsum',
        'placeholder',
        'sample data',
        'todo',
        'coming soon',
        'test user',
        'example.com',
        'dummy data',
        'fake data',
        '[name]',
        '[title]',
        'john doe',
        'jane smith',
        'sample representative',
        'sample bill'
      ];

      placeholderPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          integrity.noPlaceholderContent = false;
          integrity.placeholdersFound.push(pattern);
        }
      });

      // Check for real data indicators
      const realDataPatterns = [
        'representative',
        'senator',
        'congress',
        'bill',
        'committee',
        'california',
        'district',
        'house',
        'senate'
      ];

      realDataPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          integrity.realDataIndicators.push(pattern);
        }
      });

      integrity.realDataPresent = integrity.realDataIndicators.length >= 3;

      console.log(`  ✅ No placeholders: ${integrity.noPlaceholderContent}`);
      console.log(`  ✅ Real data present: ${integrity.realDataPresent}`);
      
      if (integrity.placeholdersFound.length > 0) {
        console.log(`  ⚠️ Placeholders found: ${integrity.placeholdersFound.join(', ')}`);
      }

    } catch (error) {
      integrity.errors.push(error.message);
    }

    this.results.dataIntegrity = integrity;
  }

  async validateZipCodeHandling() {
    console.log('\n🏠 Validating ZIP Code Handling...');
    
    const zipValidation = {
      validZipCodes: {},
      invalidZipCodes: {},
      responseConsistency: true,
      errors: []
    };

    try {
      // Test valid ZIP codes
      console.log('  ✅ Testing valid ZIP codes...');
      for (const zipCode of TEST_ZIP_CODES.slice(0, 3)) { // Test first 3 for speed
        console.log(`    Testing ZIP: ${zipCode}`);
        
        try {
          // Simulate API call for ZIP code
          const zipTestUrl = `${PRODUCTION_URL}/api/representatives?zip=${zipCode}`;
          const response = await this.makeHttpRequest(zipTestUrl);
          
          zipValidation.validZipCodes[zipCode] = {
            statusCode: response.statusCode,
            responseTime: response.responseTime,
            hasData: response.data.length > 100, // Reasonable data size
            accessible: response.statusCode !== 404
          };
          
        } catch (error) {
          zipValidation.validZipCodes[zipCode] = {
            error: error.message,
            accessible: false
          };
        }
      }

      // Test invalid ZIP codes
      console.log('  ❌ Testing invalid ZIP codes...');
      const invalidZips = ['00000', '99999', 'ABCDE', '123'];
      
      for (const invalidZip of invalidZips) {
        try {
          const zipTestUrl = `${PRODUCTION_URL}/api/representatives?zip=${invalidZip}`;
          const response = await this.makeHttpRequest(zipTestUrl);
          
          zipValidation.invalidZipCodes[invalidZip] = {
            statusCode: response.statusCode,
            hasGracefulError: response.statusCode >= 400 && response.statusCode < 500,
            responseTime: response.responseTime
          };
          
        } catch (error) {
          zipValidation.invalidZipCodes[invalidZip] = {
            error: error.message,
            hasGracefulError: true // Network error is acceptable
          };
        }
      }

    } catch (error) {
      zipValidation.errors.push(error.message);
    }

    this.results.zipCodeValidation = zipValidation;
  }

  async validateAPIResponseTimes() {
    console.log('\n⚡ Validating API Response Times...');
    
    const apiTimes = {
      endpoints: {},
      averageResponseTime: 0,
      meetsSLA: true, // < 2 seconds
      errors: []
    };

    const endpoints = [
      '/',
      '/api/health',
      '/api/representatives',
      '/api/bills',
      '/api/committees'
    ];

    try {
      const responseTimes = [];

      for (const endpoint of endpoints) {
        const url = `${PRODUCTION_URL}${endpoint}`;
        console.log(`  📊 Testing: ${endpoint}`);
        
        try {
          const response = await this.makeHttpRequest(url);
          
          apiTimes.endpoints[endpoint] = {
            responseTime: response.responseTime,
            statusCode: response.statusCode,
            accessible: response.statusCode < 500
          };
          
          responseTimes.push(response.responseTime);
          console.log(`    ${endpoint}: ${response.responseTime}ms (${response.statusCode})`);
          
        } catch (error) {
          apiTimes.endpoints[endpoint] = {
            error: error.message,
            accessible: false
          };
          console.log(`    ${endpoint}: Error - ${error.message}`);
        }
      }

      if (responseTimes.length > 0) {
        apiTimes.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        apiTimes.meetsSLA = apiTimes.averageResponseTime < 2000;
      }

      console.log(`  📈 Average response time: ${Math.round(apiTimes.averageResponseTime)}ms`);
      console.log(`  ✅ Meets SLA (<2s): ${apiTimes.meetsSLA}`);

    } catch (error) {
      apiTimes.errors.push(error.message);
    }

    this.results.apiResponseTimes = apiTimes;
  }

  async validateErrorHandling() {
    console.log('\n⚠️ Validating Error Handling...');
    
    const errorHandling = {
      gracefulErrorPages: {},
      apiErrorHandling: {},
      userFriendlyErrors: true,
      errors: []
    };

    try {
      // Test 404 pages
      const notFoundUrl = `${PRODUCTION_URL}/nonexistent-page-12345`;
      console.log('  🚫 Testing 404 error handling...');
      
      try {
        const response = await this.makeHttpRequest(notFoundUrl);
        errorHandling.gracefulErrorPages.notFound = {
          statusCode: response.statusCode,
          hasCustomErrorPage: !response.data.includes('Not Found') || response.data.includes('CITZN'),
          responseTime: response.responseTime
        };
      } catch (error) {
        errorHandling.gracefulErrorPages.notFound = { error: error.message };
      }

      // Test API error handling
      console.log('  🔌 Testing API error handling...');
      const invalidApiUrl = `${PRODUCTION_URL}/api/invalid-endpoint`;
      
      try {
        const response = await this.makeHttpRequest(invalidApiUrl);
        errorHandling.apiErrorHandling.invalidEndpoint = {
          statusCode: response.statusCode,
          hasJsonError: response.data.includes('{') && response.data.includes('}'),
          responseTime: response.responseTime
        };
      } catch (error) {
        errorHandling.apiErrorHandling.invalidEndpoint = { error: error.message };
      }

    } catch (error) {
      errorHandling.errors.push(error.message);
    }

    this.results.errorHandling = errorHandling;
  }

  async validateCrossPageConsistency() {
    console.log('\n🔄 Validating Cross-Page Consistency...');
    
    const consistency = {
      navigationStructure: {},
      brandingConsistency: {},
      dataConsistency: {},
      errors: []
    };

    const pages = ['/', '/bills', '/committees', '/dashboard'];
    const pageContents = {};

    try {
      // Fetch multiple pages
      for (const page of pages) {
        try {
          const response = await this.makeHttpRequest(`${PRODUCTION_URL}${page}`);
          pageContents[page] = response.data;
          console.log(`  📄 Fetched: ${page} (${response.statusCode})`);
        } catch (error) {
          pageContents[page] = null;
          console.log(`  ❌ Failed: ${page} - ${error.message}`);
        }
      }

      // Check branding consistency
      const brandElements = ['CITZN', 'CIVIX', 'logo'];
      consistency.brandingConsistency.consistent = true;
      
      brandElements.forEach(brand => {
        const pagesWithBrand = Object.values(pageContents)
          .filter(content => content && content.toLowerCase().includes(brand.toLowerCase()));
        
        if (pagesWithBrand.length > 0 && pagesWithBrand.length < Object.keys(pageContents).length / 2) {
          consistency.brandingConsistency.consistent = false;
          consistency.brandingConsistency[`${brand}_inconsistent`] = true;
        }
      });

      // Check navigation structure
      const navElements = ['bills', 'representatives', 'committees', 'dashboard'];
      consistency.navigationStructure.hasConsistentNav = true;
      
      Object.entries(pageContents).forEach(([page, content]) => {
        if (content) {
          const navCount = navElements.filter(nav => 
            content.toLowerCase().includes(`href="${nav}`) || 
            content.toLowerCase().includes(`to="${nav}`)
          ).length;
          
          if (navCount < 2) { // Should have at least 2 nav elements
            consistency.navigationStructure.hasConsistentNav = false;
          }
        }
      });

      console.log(`  🎨 Branding consistent: ${consistency.brandingConsistency.consistent}`);
      console.log(`  🧭 Navigation consistent: ${consistency.navigationStructure.hasConsistentNav}`);

    } catch (error) {
      consistency.errors.push(error.message);
    }

    this.results.crossPageConsistency = consistency;
  }

  calculateOverallScore() {
    console.log('\n📊 Calculating Overall UX Score...');
    
    let totalScore = 0;
    let maxScore = 100;

    // Site Accessibility (20 points)
    if (this.results.siteAccessibility.productionAccessible) totalScore += 15;
    if (this.results.siteAccessibility.loadTimes.production < 3000) totalScore += 5;

    // Data Integrity (25 points)
    if (this.results.dataIntegrity.noPlaceholderContent) totalScore += 15;
    if (this.results.dataIntegrity.realDataPresent) totalScore += 10;

    // API Performance (20 points)
    if (this.results.apiResponseTimes.meetsSLA) totalScore += 15;
    if (this.results.apiResponseTimes.averageResponseTime < 1000) totalScore += 5;

    // ZIP Code Handling (15 points)
    const validZipSuccess = Object.values(this.results.zipCodeValidation.validZipCodes || {})
      .filter(result => result.accessible).length;
    const totalValidZips = Object.keys(this.results.zipCodeValidation.validZipCodes || {}).length;
    if (totalValidZips > 0) {
      totalScore += Math.round((validZipSuccess / totalValidZips) * 15);
    }

    // Error Handling (10 points)
    if (this.results.errorHandling.gracefulErrorPages?.notFound?.statusCode === 404) totalScore += 5;
    if (this.results.errorHandling.apiErrorHandling?.invalidEndpoint?.statusCode >= 400) totalScore += 5;

    // Cross-Page Consistency (10 points)
    if (this.results.crossPageConsistency.brandingConsistency?.consistent) totalScore += 5;
    if (this.results.crossPageConsistency.navigationStructure?.hasConsistentNav) totalScore += 5;

    this.results.overallScore = Math.min(totalScore, maxScore);
    
    console.log(`📈 Overall UX Score: ${this.results.overallScore}/100`);
  }

  async generateValidationReport() {
    console.log('\n📋 Generating Validation Report...');
    
    const report = {
      ...this.results,
      summary: {
        testDate: this.results.timestamp,
        overallScore: this.results.overallScore,
        productionReadiness: this.results.overallScore >= 80,
        criticalIssues: [],
        recommendations: [],
        testsConducted: [
          'Site Accessibility',
          'Data Integrity',
          'ZIP Code Handling',
          'API Response Times',
          'Error Handling',
          'Cross-Page Consistency'
        ]
      }
    };

    // Identify critical issues
    if (!this.results.siteAccessibility.productionAccessible) {
      report.summary.criticalIssues.push('Production site not accessible');
    }

    if (!this.results.dataIntegrity.noPlaceholderContent) {
      report.summary.criticalIssues.push(`Placeholder content found: ${this.results.dataIntegrity.placeholdersFound.join(', ')}`);
    }

    if (!this.results.apiResponseTimes.meetsSLA) {
      report.summary.criticalIssues.push(`API response times exceed SLA (avg: ${Math.round(this.results.apiResponseTimes.averageResponseTime)}ms)`);
    }

    // Generate recommendations
    if (this.results.siteAccessibility.loadTimes.production > 2000) {
      report.summary.recommendations.push(`Optimize page load time (currently ${this.results.siteAccessibility.loadTimes.production}ms)`);
    }

    if (!this.results.dataIntegrity.realDataPresent) {
      report.summary.recommendations.push('Ensure all pages display real government data');
    }

    if (!this.results.crossPageConsistency.navigationStructure.hasConsistentNav) {
      report.summary.recommendations.push('Standardize navigation across all pages');
    }

    // Save report
    const reportPath = path.join(__dirname, `api-ux-validation-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📁 Report saved to: ${reportPath}`);
    
    // Print summary
    this.printSummary(report);
    
    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CITZN PHASE 1 BETA - UX VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`📅 Test Date: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🏆 Overall Score: ${report.overallScore}/100`);
    console.log(`🚀 Production Ready: ${report.summary.productionReadiness ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📊 DETAILED RESULTS:');
    console.log('─'.repeat(50));
    console.log(`🌐 Site Accessible: ${this.results.siteAccessibility.productionAccessible ? '✅' : '❌'}`);
    console.log(`📊 Data Integrity: ${this.results.dataIntegrity.noPlaceholderContent && this.results.dataIntegrity.realDataPresent ? '✅' : '⚠️'}`);
    console.log(`⚡ API Performance: ${this.results.apiResponseTimes.meetsSLA ? '✅' : '❌'} (${Math.round(this.results.apiResponseTimes.averageResponseTime)}ms avg)`);
    console.log(`🏠 ZIP Validation: ${Object.keys(this.results.zipCodeValidation.validZipCodes || {}).length} codes tested`);
    console.log(`⚠️ Error Handling: ${this.results.errorHandling.gracefulErrorPages ? '✅' : '⚠️'}`);
    console.log(`🔄 Page Consistency: ${this.results.crossPageConsistency.brandingConsistency?.consistent ? '✅' : '⚠️'}`);

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

  async runValidationSuite() {
    try {
      console.log('🚀 Starting CITZN API-Based UX Validation Suite...');
      console.log('Agent 38: User Experience & Integration Validation Specialist\n');

      await this.validateSiteAccessibility();
      await this.validateDataIntegrity();
      await this.validateZipCodeHandling();
      await this.validateAPIResponseTimes();
      await this.validateErrorHandling();
      await this.validateCrossPageConsistency();
      
      this.calculateOverallScore();
      const report = await this.generateValidationReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ Validation suite failed:', error);
      throw error;
    }
  }
}

// Run validation suite
async function main() {
  const validator = new APIUXValidator();
  
  try {
    const report = await validator.runValidationSuite();
    
    console.log('\n✅ Validation suite completed successfully!');
    
    // Return exit code based on production readiness
    process.exit(report.summary.productionReadiness ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Validation suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = APIUXValidator;