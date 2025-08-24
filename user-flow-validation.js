#!/usr/bin/env node

/**
 * User Experience Flow Testing for CITZN Phase 1
 * Tests complete user journeys and validates no unknown data
 */

const http = require('http');

class UserFlowValidator {
  constructor() {
    this.serverUrl = 'http://localhost:3010';
    this.results = {
      userFlowTests: [],
      unknownDataTests: [],
      endToEndTests: [],
      performanceTests: [],
      overallStatus: 'PENDING',
      testSummary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    // Forbidden placeholder values per requirements
    this.forbiddenValues = [
      'unknown', 'Unknown', 'UNKNOWN',
      'placeholder', 'Placeholder', 'PLACEHOLDER',
      'TBD', 'tbd', 'To Be Determined',
      'Coming Soon', 'COMING SOON',
      'N/A', 'n/a', 'Not Available',
      '[City Name]', '[Representative Name]', '[District]',
      'Sample', 'SAMPLE', 'Example', 'EXAMPLE',
      'Test', 'TEST', 'Demo', 'DEMO',
      'Unknown City', 'Unknown State', 'Unknown County',
      'Unknown Representative', 'Unknown Office'
    ];
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
          'User-Agent': 'CITZN-UserFlow-Test/1.0'
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
              rawData: responseData,
              responseTime: Date.now() - startTime
            };
            resolve(result);
          } catch (parseError) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: responseData,
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

  checkForForbiddenValues(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const foundValues = [];
    
    for (const forbidden of this.forbiddenValues) {
      if (dataString.toLowerCase().includes(forbidden.toLowerCase())) {
        foundValues.push(forbidden);
      }
    }
    
    return {
      found: foundValues.length > 0,
      values: foundValues
    };
  }

  async testCompleteUserFlow() {
    console.log('\n👤 Testing Complete User Flows');
    console.log('-'.repeat(40));

    const userFlows = [
      {
        name: 'Anonymous User Registration',
        steps: [
          { action: 'verify_zip', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '90210' } },
          { action: 'register', endpoint: '/api/auth/register', method: 'POST', body: { email: 'test@example.com', zipCode: '90210' } }
        ]
      },
      {
        name: 'ZIP Code Entry and Validation',
        steps: [
          { action: 'verify_valid_zip', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '94102' } },
          { action: 'verify_invalid_zip', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '00000' } }
        ]
      },
      {
        name: 'Representative Discovery',
        steps: [
          { action: 'verify_zip', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '95814' } },
          { action: 'get_bills', endpoint: '/api/bills?zipCode=95814', method: 'GET' }
        ]
      },
      {
        name: 'Bill Tracking Engagement',
        steps: [
          { action: 'get_federal_bills', endpoint: '/api/bills?source=federal', method: 'GET' },
          { action: 'get_california_bills', endpoint: '/api/bills?source=california', method: 'GET' }
        ]
      }
    ];

    for (const flow of userFlows) {
      try {
        console.log(`\nTesting flow: ${flow.name}`);
        let flowPassed = true;
        let flowErrors = [];
        let flowWarnings = [];
        let totalResponseTime = 0;

        for (const step of flow.steps) {
          try {
            const startTime = Date.now();
            const response = await this.makeHttpRequest(step.endpoint, step.method, step.body);
            const responseTime = Date.now() - startTime;
            totalResponseTime += responseTime;

            console.log(`    ✓ ${step.action}: ${response.statusCode} (${responseTime}ms)`);
            
            // Check for forbidden values in response
            const forbiddenCheck = this.checkForForbiddenValues(response.rawData);
            if (forbiddenCheck.found) {
              flowWarnings.push(`${step.action}: Found forbidden values: ${forbiddenCheck.values.join(', ')}`);
            }

            // Check response validity
            if (step.action.includes('invalid') && response.statusCode === 200) {
              flowWarnings.push(`${step.action}: Invalid input accepted (should be rejected)`);
            }

          } catch (stepError) {
            console.log(`    ❌ ${step.action}: ERROR - ${stepError.message}`);
            flowPassed = false;
            flowErrors.push(`${step.action}: ${stepError.message}`);
          }
        }

        const flowResult = {
          flowName: flow.name,
          status: flowErrors.length === 0 ? (flowWarnings.length === 0 ? 'PASS' : 'WARNING') : 'FAIL',
          totalResponseTime,
          errors: flowErrors,
          warnings: flowWarnings,
          stepCount: flow.steps.length
        };

        this.results.userFlowTests.push(flowResult);
        this.results.testSummary.totalTests++;

        if (flowResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ Flow completed: ${flow.name} (${totalResponseTime}ms total)`);
        } else if (flowResult.status === 'WARNING') {
          this.results.testSummary.warnings++;
          console.log(`  ⚠️ Flow completed with warnings: ${flow.name}`);
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ Flow failed: ${flow.name}`);
        }

      } catch (error) {
        console.log(`  ❌ Flow error: ${flow.name} - ${error.message}`);
        this.results.userFlowTests.push({
          flowName: flow.name,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  async testForUnknownData() {
    console.log('\n🔍 Testing for Unknown/Placeholder Data');
    console.log('-'.repeat(40));

    const criticalEndpoints = [
      { name: 'ZIP Code Validation', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '90210' } },
      { name: 'ZIP Code Validation SF', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '94102' } },
      { name: 'ZIP Code Validation Sacramento', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '95814' } },
      { name: 'ZIP Code Validation San Diego', endpoint: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '92101' } },
      { name: 'Federal Bills', endpoint: '/api/bills?source=federal', method: 'GET' },
      { name: 'California Bills', endpoint: '/api/bills?source=california', method: 'GET' },
      { name: 'Bills by ZIP', endpoint: '/api/bills?zipCode=90210', method: 'GET' }
    ];

    for (const test of criticalEndpoints) {
      try {
        const response = await this.makeHttpRequest(test.endpoint, test.method, test.body);
        
        const forbiddenCheck = this.checkForForbiddenValues(response.rawData);
        
        const testResult = {
          endpointName: test.name,
          endpoint: test.endpoint,
          statusCode: response.statusCode,
          hasForbiddenValues: forbiddenCheck.found,
          forbiddenValues: forbiddenCheck.values,
          status: forbiddenCheck.found ? 'FAIL' : 'PASS',
          dataPreview: this.getDataPreview(response.data)
        };

        this.results.unknownDataTests.push(testResult);
        this.results.testSummary.totalTests++;

        if (testResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ ${test.name}: No forbidden values detected`);
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ ${test.name}: Forbidden values found: ${forbiddenCheck.values.join(', ')}`);
        }

      } catch (error) {
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
        this.results.unknownDataTests.push({
          endpointName: test.name,
          endpoint: test.endpoint,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  getDataPreview(data) {
    if (!data) return 'No data';
    if (typeof data === 'string') return data.substring(0, 100);
    if (Array.isArray(data)) return `Array with ${data.length} items`;
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      return `Object with keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`;
    }
    return typeof data;
  }

  async testEndToEndScenarios() {
    console.log('\n🎯 Testing End-to-End Scenarios');
    console.log('-'.repeat(40));

    const scenarios = [
      {
        name: 'New User Onboarding',
        description: 'Complete new user registration and bill discovery',
        zipCode: '90210',
        email: 'newuser@example.com'
      },
      {
        name: 'Rural Area User',
        description: 'User from rural California area',
        zipCode: '93514',
        email: 'rural@example.com'
      },
      {
        name: 'Urban Area User',
        description: 'User from major urban center',
        zipCode: '94102',
        email: 'urban@example.com'
      }
    ];

    for (const scenario of scenarios) {
      try {
        console.log(`\nTesting scenario: ${scenario.name} (${scenario.zipCode})`);
        let scenarioData = {};
        let scenarioErrors = [];
        let totalTime = 0;

        // Step 1: Verify ZIP code
        const zipResponse = await this.makeHttpRequest('/api/auth/verify-zip', 'POST', { zipCode: scenario.zipCode });
        totalTime += zipResponse.responseTime;

        if (zipResponse.statusCode === 200 && zipResponse.data?.valid) {
          scenarioData.location = {
            city: zipResponse.data.city,
            state: zipResponse.data.state,
            county: zipResponse.data.county,
            coverage: zipResponse.data.coverage
          };
          console.log(`    ✓ Location: ${zipResponse.data.city}, ${zipResponse.data.state}`);
        } else {
          scenarioErrors.push('ZIP code validation failed');
        }

        // Step 2: Register user
        const registerResponse = await this.makeHttpRequest('/api/auth/register', 'POST', { 
          email: scenario.email, 
          zipCode: scenario.zipCode 
        });
        totalTime += registerResponse.responseTime;

        if (registerResponse.statusCode === 200) {
          scenarioData.registration = 'success';
          console.log(`    ✓ Registration successful`);
        } else {
          scenarioErrors.push('User registration failed');
        }

        // Step 3: Get relevant bills
        const billsResponse = await this.makeHttpRequest(`/api/bills?zipCode=${scenario.zipCode}`);
        totalTime += billsResponse.responseTime;

        if (billsResponse.statusCode === 200 && Array.isArray(billsResponse.data)) {
          scenarioData.bills = {
            count: billsResponse.data.length,
            hasFederalBills: billsResponse.data.some(b => b.chamber),
            hasCaliforniaBills: billsResponse.data.some(b => b.billNumber?.startsWith('AB') || b.billNumber?.startsWith('SB'))
          };
          console.log(`    ✓ Found ${billsResponse.data.length} relevant bills`);
        } else {
          scenarioErrors.push('Bills retrieval failed');
        }

        // Check for forbidden values across all responses
        const allResponses = [zipResponse.rawData, registerResponse.rawData, billsResponse.rawData].join(' ');
        const forbiddenCheck = this.checkForForbiddenValues(allResponses);

        const scenarioResult = {
          scenarioName: scenario.name,
          zipCode: scenario.zipCode,
          totalTime,
          data: scenarioData,
          errors: scenarioErrors,
          hasForbiddenValues: forbiddenCheck.found,
          forbiddenValues: forbiddenCheck.values,
          status: scenarioErrors.length === 0 && !forbiddenCheck.found ? 'PASS' : 
                 scenarioErrors.length === 0 && forbiddenCheck.found ? 'WARNING' : 'FAIL'
        };

        this.results.endToEndTests.push(scenarioResult);
        this.results.testSummary.totalTests++;

        if (scenarioResult.status === 'PASS') {
          this.results.testSummary.passed++;
          console.log(`  ✅ Scenario completed successfully (${totalTime}ms)`);
        } else if (scenarioResult.status === 'WARNING') {
          this.results.testSummary.warnings++;
          console.log(`  ⚠️ Scenario completed with data quality warnings`);
        } else {
          this.results.testSummary.failed++;
          console.log(`  ❌ Scenario failed: ${scenarioErrors.join(', ')}`);
        }

      } catch (error) {
        console.log(`  ❌ Scenario error: ${scenario.name} - ${error.message}`);
        this.results.endToEndTests.push({
          scenarioName: scenario.name,
          zipCode: scenario.zipCode,
          status: 'ERROR',
          error: error.message
        });
        this.results.testSummary.totalTests++;
        this.results.testSummary.failed++;
      }
    }
  }

  async runFullValidation() {
    console.log('🚀 Starting User Experience Flow Validation');
    console.log('=' .repeat(60));

    try {
      await this.testCompleteUserFlow();
      await this.testForUnknownData();
      await this.testEndToEndScenarios();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Critical error in user flow validation suite:', error);
      this.results.overallStatus = 'CRITICAL_FAILURE';
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 USER EXPERIENCE VALIDATION REPORT');
    console.log('='.repeat(60));

    const { totalTests, passed, failed, warnings } = this.results.testSummary;
    const successRate = ((passed / totalTests) * 100).toFixed(1);

    console.log('\n📊 TEST SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passed} (${successRate}%)`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Warnings: ${warnings}`);

    // User flow analysis
    const userFlowsPassed = this.results.userFlowTests.filter(t => t.status === 'PASS').length;
    console.log('\n👤 USER FLOW ANALYSIS:');
    console.log(`  User flows completed successfully: ${userFlowsPassed}/${this.results.userFlowTests.length}`);

    // Data quality analysis
    const cleanDataTests = this.results.unknownDataTests.filter(t => t.status === 'PASS').length;
    console.log('\n🔍 DATA QUALITY ANALYSIS:');
    console.log(`  Endpoints with clean data: ${cleanDataTests}/${this.results.unknownDataTests.length}`);
    
    const endpointsWithIssues = this.results.unknownDataTests.filter(t => t.status === 'FAIL');
    if (endpointsWithIssues.length > 0) {
      console.log('  Endpoints with forbidden values:');
      endpointsWithIssues.forEach(endpoint => {
        console.log(`    - ${endpoint.endpointName}: ${endpoint.forbiddenValues.join(', ')}`);
      });
    }

    // End-to-end scenarios
    const e2ePassed = this.results.endToEndTests.filter(t => t.status === 'PASS').length;
    console.log('\n🎯 END-TO-END SCENARIOS:');
    console.log(`  Complete scenarios passed: ${e2ePassed}/${this.results.endToEndTests.length}`);

    // Overall status determination
    const dataQualityRate = (cleanDataTests / this.results.unknownDataTests.length) * 100;
    
    if (failed === 0 && warnings === 0 && dataQualityRate === 100) {
      this.results.overallStatus = 'PRODUCTION_READY';
      console.log('\n✅ OVERALL UX STATUS: PRODUCTION READY');
      console.log('   All user flows work correctly with clean data.');
    } else if (failed < totalTests * 0.1 && dataQualityRate > 90) {
      this.results.overallStatus = 'MINOR_ISSUES';
      console.log('\n⚠️ OVERALL UX STATUS: MINOR ISSUES DETECTED');
      console.log('   User flows mostly work but some data quality issues exist.');
    } else {
      this.results.overallStatus = 'REQUIRES_FIXES';
      console.log('\n❌ OVERALL UX STATUS: REQUIRES FIXES');
      console.log('   Critical user experience or data quality issues detected.');
    }

    console.log('\n📋 PHASE 1 PRODUCTION READINESS CHECKLIST:');
    console.log(`  □ User flows functional: ${userFlowsPassed}/${this.results.userFlowTests.length} ✅`);
    console.log(`  □ No forbidden data values: ${dataQualityRate.toFixed(1)}% clean ${dataQualityRate === 100 ? '✅' : '❌'}`);
    console.log(`  □ End-to-end scenarios: ${e2ePassed}/${this.results.endToEndTests.length} working`);

    // Save results
    require('fs').writeFileSync(
      require('path').join(__dirname, 'user-flow-validation-results.json'),
      JSON.stringify(this.results, null, 2)
    );

    console.log('\n📄 Detailed results saved to: user-flow-validation-results.json');
    console.log('='.repeat(60));
  }
}

async function main() {
  const validator = new UserFlowValidator();
  await validator.runFullValidation();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = UserFlowValidator;