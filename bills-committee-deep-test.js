#!/usr/bin/env node

/**
 * Deep Bills & Committee System Testing
 * Tests actual API responses and data quality
 */

const http = require('http');

class BillsCommitteeValidator {
  constructor() {
    this.serverUrl = 'http://localhost:3010';
    this.results = {
      billsTests: [],
      committeeTests: [],
      dataQualityTests: [],
      performanceTests: [],
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
          'User-Agent': 'CITZN-Bills-Test/1.0'
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

  async testBillsEndpoints() {
    console.log('\n📜 Testing Bills API Endpoints');
    console.log('-'.repeat(40));

    const billsEndpoints = [
      '/api/bills',
      '/api/bills?source=federal',
      '/api/bills?source=california', 
      '/api/bills?limit=10',
      '/api/bills?zipCode=90210',
      '/api/bills/test'
    ];

    for (const endpoint of billsEndpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest(endpoint);
        const responseTime = Date.now() - startTime;

        const testResult = {
          endpoint,
          statusCode: response.statusCode,
          responseTime,
          hasData: Array.isArray(response.data),
          billCount: Array.isArray(response.data) ? response.data.length : 0,
          dataQuality: this.analyzeBillDataQuality(response.data),
          status: response.statusCode === 200 ? 'PASS' : 'FAIL'
        };

        this.results.billsTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ ${endpoint}: ${testResult.billCount} bills (${responseTime}ms)`);
          
          if (testResult.dataQuality.hasRealData) {
            console.log(`     Data Quality: Real bills detected`);
          } else {
            console.log(`     Data Quality: Mock/placeholder data`);
          }
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ ${endpoint}: ${response.statusCode} (${responseTime}ms)`);
        }

      } catch (error) {
        console.log(`  ❌ ${endpoint}: ERROR - ${error.message}`);
        this.results.billsTests.push({
          endpoint,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  analyzeBillDataQuality(bills) {
    if (!Array.isArray(bills) || bills.length === 0) {
      return {
        hasRealData: false,
        issues: ['No bill data available']
      };
    }

    const issues = [];
    let hasRealData = true;
    let sampleBill = bills[0];

    // Check for placeholder/mock data indicators
    const mockIndicators = [
      'mock', 'Mock', 'MOCK',
      'sample', 'Sample', 'SAMPLE', 
      'test', 'Test', 'TEST',
      'example', 'Example', 'EXAMPLE',
      'demo', 'Demo', 'DEMO',
      'placeholder', 'Placeholder', 'PLACEHOLDER'
    ];

    const billText = JSON.stringify(bills).toLowerCase();
    const foundIndicators = mockIndicators.filter(indicator => 
      billText.includes(indicator.toLowerCase())
    );

    if (foundIndicators.length > 0) {
      hasRealData = false;
      issues.push(`Mock indicators found: ${foundIndicators.join(', ')}`);
    }

    // Check bill structure and content quality
    if (sampleBill) {
      if (!sampleBill.title || sampleBill.title.length < 10) {
        issues.push('Bill titles too short or missing');
      }
      
      if (!sampleBill.summary || sampleBill.summary.length < 20) {
        issues.push('Bill summaries too short or missing');
      }
      
      if (!sampleBill.billNumber || !sampleBill.billNumber.match(/^[SH]\.?R?\.?\s?\d+/)) {
        issues.push('Invalid or missing bill numbers');
      }

      if (!sampleBill.introducedDate) {
        issues.push('Missing introduction dates');
      }

      // Check for realistic sponsor names
      if (sampleBill.sponsor) {
        const sponsorName = typeof sampleBill.sponsor === 'string' 
          ? sampleBill.sponsor 
          : sampleBill.sponsor.name || '';
          
        if (sponsorName === 'Unknown' || 
            sponsorName.includes('Sample') ||
            sponsorName.includes('Test') ||
            sponsorName === '') {
          hasRealData = false;
          issues.push('Placeholder sponsor names detected');
        }
      }
    }

    return {
      hasRealData,
      issues,
      sampleCount: bills.length,
      structure: sampleBill ? Object.keys(sampleBill) : []
    };
  }

  async testCommitteeData() {
    console.log('\n🏛️ Testing Committee Data');
    console.log('-'.repeat(40));

    // Since there's no explicit committee endpoint in the routes we found,
    // let's test if committee data is embedded in bills or representatives
    try {
      const response = await this.makeHttpRequest('/api/bills');
      
      if (response.data && Array.isArray(response.data)) {
        const billsWithCommittees = response.data.filter(bill => 
          bill.committee || bill.committees || bill.committeeData
        );

        const testResult = {
          endpoint: '/api/bills (committee data)',
          billsWithCommittees: billsWithCommittees.length,
          totalBills: response.data.length,
          hasCommitteeData: billsWithCommittees.length > 0,
          status: billsWithCommittees.length > 0 ? 'PASS' : 'WARNING'
        };

        this.results.committeeTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ Committee data: ${billsWithCommittees.length}/${response.data.length} bills have committee info`);
        } else {
          this.results.testSummary.warnings++;
          console.log(`  ⚠️ Committee data: No committee information found in bills`);
        }
      }

    } catch (error) {
      console.log(`  ❌ Committee data test: ERROR - ${error.message}`);
      this.results.committeeTests.push({
        endpoint: 'committee-data',
        status: 'ERROR',
        error: error.message
      });
      this.results.testSummary.totalTests++;
      this.results.testSummary.failed++;
    }
  }

  async testBillsWithZipCodes() {
    console.log('\n📍 Testing Bills with ZIP Code Integration');
    console.log('-'.repeat(40));

    const testZips = ['90210', '94102', '95814', '92101'];

    for (const zipCode of testZips) {
      try {
        const response = await this.makeHttpRequest(`/api/bills?zipCode=${zipCode}`);
        
        const testResult = {
          zipCode,
          statusCode: response.statusCode,
          billCount: Array.isArray(response.data) ? response.data.length : 0,
          hasLocationSpecificBills: this.checkLocationSpecificBills(response.data, zipCode),
          status: response.statusCode === 200 ? 'PASS' : 'FAIL'
        };

        this.results.dataQualityTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ ${zipCode}: ${testResult.billCount} bills returned`);
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ ${zipCode}: Failed to get bills`);
        }

      } catch (error) {
        console.log(`  ❌ ${zipCode}: ERROR - ${error.message}`);
        this.results.dataQualityTests.push({
          zipCode,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  checkLocationSpecificBills(bills, zipCode) {
    if (!Array.isArray(bills)) return false;
    
    // Check if bills might be location-specific
    // This would be more sophisticated in a real implementation
    return bills.some(bill => {
      const sponsorState = typeof bill.sponsor === 'string' 
        ? bill.sponsor 
        : bill.sponsor?.state || '';
        
      return bill.title?.toLowerCase().includes('california') ||
             bill.summary?.toLowerCase().includes('california') ||
             sponsorState === 'CA';
    });
  }

  async testPerformanceBenchmarks() {
    console.log('\n⚡ Testing Performance Benchmarks');
    console.log('-'.repeat(40));

    const performanceTests = [
      { name: 'Basic bills fetch', endpoint: '/api/bills' },
      { name: 'Limited bills fetch', endpoint: '/api/bills?limit=5' },
      { name: 'Federal bills only', endpoint: '/api/bills?source=federal' },
      { name: 'California bills only', endpoint: '/api/bills?source=california' }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest(test.endpoint);
        const responseTime = Date.now() - startTime;

        const testResult = {
          testName: test.name,
          endpoint: test.endpoint,
          responseTime,
          status: responseTime < 1000 ? 'PASS' : responseTime < 3000 ? 'WARNING' : 'FAIL'
        };

        this.results.performanceTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ ${test.name}: ${responseTime}ms`);
        } else if (testResult.status === 'WARNING') {
          this.results.testSummary.warnings++;
          console.log(`  ⚠️ ${test.name}: ${responseTime}ms (slow)`);
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ ${test.name}: ${responseTime}ms (too slow)`);
        }

      } catch (error) {
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
        this.results.performanceTests.push({
          testName: test.name,
          endpoint: test.endpoint,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  async runFullValidation() {
    console.log('🚀 Starting Bills & Committee Deep Validation');
    console.log('=' .repeat(60));

    try {
      await this.testBillsEndpoints();
      await this.testCommitteeData();
      await this.testBillsWithZipCodes();
      await this.testPerformanceBenchmarks();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Critical error in bills validation suite:', error);
      this.results.overallStatus = 'CRITICAL_FAILURE';
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 BILLS & COMMITTEE VALIDATION REPORT');
    console.log('='.repeat(60));

    const { totalTests, passed, failed, warnings } = this.results.testSummary;
    const successRate = ((passed / totalTests) * 100).toFixed(1);

    console.log('\n📊 TEST SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passed} (${successRate}%)`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Warnings: ${warnings}`);

    // Bills system analysis
    const billsEndpointsPassed = this.results.billsTests.filter(t => t.status === 'PASS').length;
    console.log('\n📜 BILLS SYSTEM ANALYSIS:');
    console.log(`  Bills endpoints working: ${billsEndpointsPassed}/${this.results.billsTests.length}`);
    
    // Check for real data vs mock data
    const realDataTests = this.results.billsTests.filter(t => t.dataQuality?.hasRealData).length;
    console.log(`  Endpoints with real data: ${realDataTests}/${this.results.billsTests.length}`);

    // Committee system analysis
    console.log('\n🏛️ COMMITTEE SYSTEM ANALYSIS:');
    console.log(`  Committee tests run: ${this.results.committeeTests.length}`);
    
    // Performance analysis
    const fastEndpoints = this.results.performanceTests.filter(t => t.status === 'PASS').length;
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    console.log(`  Fast endpoints (<1s): ${fastEndpoints}/${this.results.performanceTests.length}`);

    // Overall status
    if (failed === 0 && warnings < totalTests * 0.2) {
      this.results.overallStatus = 'BILLS_SYSTEM_READY';
      console.log('\n✅ BILLS SYSTEM STATUS: READY FOR PRODUCTION');
    } else if (failed < totalTests * 0.1) {
      this.results.overallStatus = 'MINOR_ISSUES';
      console.log('\n⚠️ BILLS SYSTEM STATUS: MINOR ISSUES DETECTED');
    } else {
      this.results.overallStatus = 'REQUIRES_FIXES';
      console.log('\n❌ BILLS SYSTEM STATUS: REQUIRES FIXES');
    }

    // Save results
    require('fs').writeFileSync(
      require('path').join(__dirname, 'bills-committee-validation-results.json'),
      JSON.stringify(this.results, null, 2)
    );

    console.log('\n📄 Detailed results saved to: bills-committee-validation-results.json');
    console.log('='.repeat(60));
  }
}

async function main() {
  const validator = new BillsCommitteeValidator();
  await validator.runFullValidation();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BillsCommitteeValidator;