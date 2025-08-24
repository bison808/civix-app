#!/usr/bin/env node

/**
 * Real API Validation for CITZN Phase 1
 * Tests actual running system endpoints
 */

const http = require('http');

class RealAPIValidator {
  constructor() {
    this.serverUrl = 'http://localhost:3010';
    this.results = {
      zipCodeTests: [],
      apiEndpointTests: [],
      performanceTests: [],
      errorHandlingTests: [],
      overallStatus: 'PENDING',
      testSummary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async makeHttpRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.serverUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CITZN-Test-Suite/1.0'
        }
      };

      if (body && method === 'POST') {
        const data = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(data);
      }

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = {
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData ? JSON.parse(responseData) : null,
              responseTime: Date.now() - startTime
            };
            resolve(result);
          } catch (parseError) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData,
              responseTime: Date.now() - startTime,
              parseError: parseError.message
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      const startTime = Date.now();
      
      if (body && method === 'POST') {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  async testZipCodeAPI() {
    console.log('\n📍 Testing ZIP Code API Endpoint');
    console.log('-'.repeat(40));
    
    const testZipCodes = [
      '90210', '94102', '95814', '92101', // Major CA cities
      '93514', '95947', '96161', // Rural CA
      '00000', '99999', 'ABCDE' // Invalid codes
    ];

    for (const zipCode of testZipCodes) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest(
          '/api/auth/verify-zip',
          'POST',
          { zipCode }
        );
        const responseTime = Date.now() - startTime;

        const testResult = {
          zipCode,
          statusCode: response.statusCode,
          responseTime,
          valid: response.data?.valid || false,
          city: response.data?.city,
          state: response.data?.state,
          county: response.data?.county,
          coverage: response.data?.coverage,
          status: 'PENDING'
        };

        // Determine test status
        if (/^\d{5}$/.test(zipCode)) {
          // Valid ZIP code format
          if (response.statusCode === 200 && testResult.valid) {
            testResult.status = 'PASS';
            this.results.testSummary.passed++;
          } else {
            testResult.status = 'FAIL';
            testResult.error = 'Valid ZIP returned invalid response';
            this.results.testSummary.failed++;
          }
        } else {
          // Invalid ZIP code format
          if (response.statusCode === 400 || !testResult.valid) {
            testResult.status = 'PASS';
            this.results.testSummary.passed++;
          } else {
            testResult.status = 'WARNING';
            testResult.error = 'Invalid ZIP not properly rejected';
            this.results.testSummary.warnings++;
          }
        }

        this.results.zipCodeTests.push(testResult);
        this.results.testSummary.totalTests++;

        console.log(`  ${testResult.status === 'PASS' ? '✅' : testResult.status === 'WARNING' ? '⚠️' : '❌'} ${zipCode}: ${testResult.status} (${responseTime}ms)`);
        if (testResult.city && testResult.state) {
          console.log(`     Location: ${testResult.city}, ${testResult.state}`);
        }

      } catch (error) {
        console.log(`  ❌ ${zipCode}: ERROR - ${error.message}`);
        this.results.zipCodeTests.push({
          zipCode,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  async testOtherAPIEndpoints() {
    console.log('\n🌐 Testing Other API Endpoints');
    console.log('-'.repeat(40));

    const endpoints = [
      { path: '/api/bills', method: 'GET' },
      { path: '/api/bills/test', method: 'GET' },
      { path: '/api/auth/register', method: 'POST', body: { email: 'test@example.com', zipCode: '90210' } }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest(endpoint.path, endpoint.method, endpoint.body);
        const responseTime = Date.now() - startTime;

        const testResult = {
          endpoint: endpoint.path,
          method: endpoint.method,
          statusCode: response.statusCode,
          responseTime,
          hasData: !!response.data,
          dataType: typeof response.data,
          status: response.statusCode < 400 ? 'PASS' : 'FAIL'
        };

        this.results.apiEndpointTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ ${endpoint.method} ${endpoint.path}: ${response.statusCode} (${responseTime}ms)`);
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ ${endpoint.method} ${endpoint.path}: ${response.statusCode} (${responseTime}ms)`);
        }

      } catch (error) {
        console.log(`  ❌ ${endpoint.method} ${endpoint.path}: ERROR - ${error.message}`);
        this.results.apiEndpointTests.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  async testPageLoadPerformance() {
    console.log('\n⚡ Testing Page Load Performance');
    console.log('-'.repeat(40));

    const pages = ['/', '/bills', '/about'];

    for (const page of pages) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest(page);
        const responseTime = Date.now() - startTime;

        const testResult = {
          page,
          responseTime,
          statusCode: response.statusCode,
          status: responseTime < 2000 ? 'PASS' : 'WARNING'
        };

        this.results.performanceTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ ${page}: ${responseTime}ms`);
        } else {
          this.results.testSummary.warnings++;
          console.log(`  ⚠️ ${page}: ${responseTime}ms (exceeds 2s target)`);
        }

      } catch (error) {
        console.log(`  ❌ ${page}: ERROR - ${error.message}`);
        this.results.performanceTests.push({
          page,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  async runFullValidation() {
    console.log('🚀 Starting Real API Validation Suite');
    console.log('=' .repeat(60));

    try {
      await this.testZipCodeAPI();
      await this.testOtherAPIEndpoints();
      await this.testPageLoadPerformance();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Critical error in validation suite:', error);
      this.results.overallStatus = 'CRITICAL_FAILURE';
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 REAL API VALIDATION REPORT');
    console.log('='.repeat(60));

    const { totalTests, passed, failed, warnings } = this.results.testSummary;
    const successRate = ((passed / totalTests) * 100).toFixed(1);

    console.log('\n📊 TEST SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passed} (${successRate}%)`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Warnings: ${warnings}`);

    // Analyze ZIP code test results
    const validZipTests = this.results.zipCodeTests.filter(t => /^\d{5}$/.test(t.zipCode));
    const validZipPassed = validZipTests.filter(t => t.status === 'PASS').length;
    
    console.log('\n📍 ZIP CODE ANALYSIS:');
    console.log(`  Valid ZIP codes tested: ${validZipTests.length}`);
    console.log(`  Valid ZIP codes passing: ${validZipPassed} (${((validZipPassed / validZipTests.length) * 100).toFixed(1)}%)`);

    // Check for no unknown data
    const zipWithRealData = validZipTests.filter(t => 
      t.city && t.city !== 'Unknown City' && 
      t.state && t.state !== 'Unknown State'
    ).length;

    console.log(`  ZIP codes with real location data: ${zipWithRealData} (${((zipWithRealData / validZipTests.length) * 100).toFixed(1)}%)`);

    // Performance analysis
    const performancePassed = this.results.performanceTests.filter(t => t.status === 'PASS').length;
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    console.log(`  Pages meeting <2s target: ${performancePassed}/${this.results.performanceTests.length}`);

    // Overall status
    if (failed === 0 && warnings < totalTests * 0.1) {
      this.results.overallStatus = 'PRODUCTION_READY';
      console.log('\n✅ OVERALL STATUS: PRODUCTION READY');
    } else if (failed < totalTests * 0.05) {
      this.results.overallStatus = 'MINOR_ISSUES';
      console.log('\n⚠️ OVERALL STATUS: MINOR ISSUES DETECTED');
    } else {
      this.results.overallStatus = 'REQUIRES_FIXES';
      console.log('\n❌ OVERALL STATUS: REQUIRES FIXES');
    }

    // Save results
    require('fs').writeFileSync(
      require('path').join(__dirname, 'real-api-validation-results.json'),
      JSON.stringify(this.results, null, 2)
    );

    console.log('\n📄 Detailed results saved to: real-api-validation-results.json');
    console.log('='.repeat(60));
  }
}

async function main() {
  const validator = new RealAPIValidator();
  await validator.runFullValidation();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RealAPIValidator;