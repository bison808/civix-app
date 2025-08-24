/**
 * Comprehensive Legislative Integration Test Suite
 * Tests the expanded legislative features integration with existing political mapping system
 */

const http = require('http');
const fs = require('fs');

class ComprehensiveLegislativeTestSuite {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            zipValidation: [],
            billsAPI: [],
            legislativeIntegration: [],
            userJourney: [],
            performanceMetrics: [],
            regressionTests: [],
            errors: []
        };
        this.startTime = Date.now();
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || 3000,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': 'CITZN-Legislative-Test/1.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 15000
            };

            const req = http.request(requestOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = data ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: jsonData,
                            raw: data,
                            responseTime: Date.now() - requestStartTime
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: null,
                            raw: data,
                            responseTime: Date.now() - requestStartTime,
                            parseError: error.message
                        });
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));

            const requestStartTime = Date.now();

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async testZipCodeValidation() {
        console.log('🔍 Testing ZIP code validation functionality...');
        
        const testCases = [
            { zip: '90210', expected: true, description: 'Beverly Hills, CA' },
            { zip: '10001', expected: true, description: 'New York, NY' },
            { zip: '95814', expected: true, description: 'Sacramento, CA' },
            { zip: '02108', expected: true, description: 'Boston, MA' },
            { zip: '00000', expected: false, description: 'Invalid ZIP' },
            { zip: '99999', expected: false, description: 'Out of range ZIP' }
        ];

        for (const testCase of testCases) {
            try {
                const response = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                    method: 'POST',
                    body: { zipCode: testCase.zip }
                });

                const result = {
                    zip: testCase.zip,
                    description: testCase.description,
                    expected: testCase.expected,
                    actual: response.data?.valid || false,
                    responseTime: response.responseTime,
                    status: response.status,
                    location: response.data ? `${response.data.city}, ${response.data.state}` : null,
                    passed: (response.data?.valid === testCase.expected) && response.status === 200
                };

                this.testResults.zipValidation.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${testCase.zip} (${testCase.description}): ${result.actual ? 'valid' : 'invalid'} - ${result.responseTime}ms`);

            } catch (error) {
                console.error(`❌ Error testing ZIP ${testCase.zip}:`, error.message);
                this.testResults.errors.push(`ZIP validation error: ${error.message}`);
            }
        }
    }

    async testBillsAPI() {
        console.log('\n📄 Testing Bills API functionality...');

        const testCases = [
            { endpoint: '/api/bills', params: {}, name: 'Default Bills List' },
            { endpoint: '/api/bills', params: { source: 'federal', limit: '10' }, name: 'Federal Bills (Limited)' },
            { endpoint: '/api/bills', params: { source: 'california', limit: '5' }, name: 'California Bills' },
            { endpoint: '/api/bills', params: { zipCode: '90210', limit: '15' }, name: 'Bills by ZIP (90210)' },
            { endpoint: '/api/bills', params: { topic: 'energy', limit: '10' }, name: 'Energy Bills' },
            { endpoint: '/api/bills', params: { status: 'Committee' }, name: 'Bills in Committee' }
        ];

        for (const testCase of testCases) {
            try {
                const params = new URLSearchParams(testCase.params).toString();
                const url = `${this.baseUrl}${testCase.endpoint}${params ? '?' + params : ''}`;
                
                const response = await this.makeRequest(url);

                const result = {
                    endpoint: testCase.endpoint,
                    name: testCase.name,
                    params: testCase.params,
                    status: response.status,
                    responseTime: response.responseTime,
                    billCount: Array.isArray(response.data) ? response.data.length : 0,
                    hasValidStructure: this.validateBillStructure(response.data),
                    cacheHeaders: response.headers['cache-control'] || null,
                    passed: response.status === 200 && Array.isArray(response.data) && response.data.length > 0
                };

                this.testResults.billsAPI.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${testCase.name}: ${result.billCount} bills (${result.responseTime}ms)`);

                // Test first bill structure if available
                if (response.data && response.data.length > 0) {
                    const firstBill = response.data[0];
                    console.log(`    📋 Sample: "${firstBill.title?.substring(0, 50)}..." (${firstBill.billNumber})`);
                }

            } catch (error) {
                console.error(`❌ Error testing ${testCase.name}:`, error.message);
                this.testResults.errors.push(`Bills API error: ${error.message}`);
            }
        }
    }

    validateBillStructure(bills) {
        if (!Array.isArray(bills) || bills.length === 0) return false;

        const requiredFields = ['id', 'title', 'billNumber', 'status'];
        const sampleBill = bills[0];

        return requiredFields.every(field => field in sampleBill);
    }

    async testLegislativeIntegration() {
        console.log('\n🔗 Testing legislative system integration...');

        try {
            // Test 1: ZIP to Bills workflow
            const zipCode = '90210';
            
            // Step 1: Validate ZIP
            const zipResponse = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                method: 'POST',
                body: { zipCode }
            });

            // Step 2: Get bills for that ZIP
            const billsResponse = await this.makeRequest(`${this.baseUrl}/api/bills?zipCode=${zipCode}&limit=10`);

            const zipToBillsResult = {
                test: 'ZIP to Bills Integration',
                zipValid: zipResponse.data?.valid || false,
                billsReturned: Array.isArray(billsResponse.data) ? billsResponse.data.length : 0,
                totalTime: (zipResponse.responseTime || 0) + (billsResponse.responseTime || 0),
                passed: zipResponse.data?.valid && Array.isArray(billsResponse.data) && billsResponse.data.length > 0
            };

            this.testResults.legislativeIntegration.push(zipToBillsResult);
            console.log(`  ${zipToBillsResult.passed ? '✅' : '❌'} ZIP to Bills: ${zipToBillsResult.billsReturned} bills found (${zipToBillsResult.totalTime}ms)`);

            // Test 2: Cross-jurisdiction bills
            const mixedResponse = await this.makeRequest(`${this.baseUrl}/api/bills?source=all&limit=20`);
            
            const mixedResult = {
                test: 'Mixed Federal/State Bills',
                billsReturned: Array.isArray(mixedResponse.data) ? mixedResponse.data.length : 0,
                hasFederalBills: this.hasFederalBills(mixedResponse.data),
                hasStateBills: this.hasStateBills(mixedResponse.data),
                responseTime: mixedResponse.responseTime,
                passed: Array.isArray(mixedResponse.data) && mixedResponse.data.length > 0
            };

            this.testResults.legislativeIntegration.push(mixedResult);
            console.log(`  ${mixedResult.passed ? '✅' : '❌'} Mixed Bills: ${mixedResult.billsReturned} bills (Fed: ${mixedResult.hasFederalBills}, State: ${mixedResult.hasStateBills})`);

        } catch (error) {
            console.error('❌ Error testing integration:', error.message);
            this.testResults.errors.push(`Integration error: ${error.message}`);
        }
    }

    hasFederalBills(bills) {
        return bills && bills.some(bill => 
            bill.billNumber?.match(/^(H\.R\.|S\.)/) || bill.chamber === 'House' || bill.chamber === 'Senate'
        );
    }

    hasStateBills(bills) {
        return bills && bills.some(bill => 
            bill.billNumber?.match(/^(AB|SB|ACR|SCR)/) || bill.jurisdiction === 'California'
        );
    }

    async testUserJourney() {
        console.log('\n🚶 Testing complete user journey...');

        const journeySteps = [
            {
                step: 1,
                name: 'Landing Page Load',
                url: '/',
                expectation: 'Page loads successfully'
            },
            {
                step: 2,
                name: 'ZIP Code Validation',
                url: '/api/auth/verify-zip',
                method: 'POST',
                body: { zipCode: '95814' },
                expectation: 'ZIP validates as Sacramento, CA'
            },
            {
                step: 3,
                name: 'Browse Bills',
                url: '/api/bills?zipCode=95814&limit=5',
                expectation: 'Returns bills relevant to area'
            },
            {
                step: 4,
                name: 'Feed Page',
                url: '/feed',
                expectation: 'Feed page loads'
            },
            {
                step: 5,
                name: 'Bills Page',
                url: '/bills',
                expectation: 'Bills page loads'
            }
        ];

        for (const step of journeySteps) {
            try {
                const startTime = Date.now();
                const response = await this.makeRequest(`${this.baseUrl}${step.url}`, {
                    method: step.method || 'GET',
                    body: step.body
                });
                const stepTime = Date.now() - startTime;

                const result = {
                    step: step.step,
                    name: step.name,
                    status: response.status,
                    responseTime: stepTime,
                    passed: response.status === 200 || response.status === 304,
                    expectation: step.expectation,
                    dataReturned: !!response.data
                };

                this.testResults.userJourney.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} Step ${step.step}: ${step.name} (${stepTime}ms)`);

            } catch (error) {
                console.error(`❌ Error in journey step ${step.step}:`, error.message);
                this.testResults.errors.push(`Journey error: ${error.message}`);
            }
        }
    }

    async testPerformanceMetrics() {
        console.log('\n⚡ Testing performance metrics...');

        const performanceTests = [
            { name: 'Bills API Load Time', url: '/api/bills?limit=50' },
            { name: 'ZIP Validation Speed', url: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '90210' } },
            { name: 'Filtered Bills Query', url: '/api/bills?topic=energy&limit=10' },
            { name: 'Home Page Load', url: '/' }
        ];

        for (const test of performanceTests) {
            const times = [];
            
            // Run each test 3 times to get average
            for (let i = 0; i < 3; i++) {
                try {
                    const response = await this.makeRequest(`${this.baseUrl}${test.url}`, {
                        method: test.method || 'GET',
                        body: test.body
                    });
                    times.push(response.responseTime);
                } catch (error) {
                    console.error(`Performance test error: ${error.message}`);
                }
            }

            if (times.length > 0) {
                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);

                const result = {
                    name: test.name,
                    averageTime: Math.round(avgTime),
                    minTime: minTime,
                    maxTime: maxTime,
                    passed: avgTime < 2000 // 2 second target
                };

                this.testResults.performanceMetrics.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.averageTime}ms avg (${result.minTime}-${result.maxTime}ms)`);
            }
        }
    }

    async testRegressionPrevention() {
        console.log('\n🔄 Testing existing functionality (regression prevention)...');

        const regressionTests = [
            {
                name: 'Political Mapping Still Works',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                        method: 'POST',
                        body: { zipCode: '90210' }
                    });
                    return response.data?.valid && response.data?.city === 'Beverly Hills' && response.data?.state === 'CA';
                }
            },
            {
                name: 'Routes Still Accessible',
                test: async () => {
                    const routes = ['/', '/feed', '/representatives', '/bills'];
                    for (const route of routes) {
                        const response = await this.makeRequest(`${this.baseUrl}${route}`);
                        if (response.status !== 200 && response.status !== 304) return false;
                    }
                    return true;
                }
            },
            {
                name: 'API Endpoints Consistent',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/bills`);
                    return response.status === 200 && Array.isArray(response.data);
                }
            }
        ];

        for (const regression of regressionTests) {
            try {
                const passed = await regression.test();
                const result = {
                    name: regression.name,
                    passed: passed
                };

                this.testResults.regressionTests.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${regression.name}`);

            } catch (error) {
                console.error(`❌ Regression test error: ${error.message}`);
                this.testResults.errors.push(`Regression error: ${error.message}`);
            }
        }
    }

    async runAllTests() {
        console.log('🎯 Starting Comprehensive Legislative Integration Test Suite\n');
        console.log('Testing the integration of legislative expansion with existing political mapping system...\n');

        try {
            await this.testZipCodeValidation();
            await this.testBillsAPI();
            await this.testLegislativeIntegration();
            await this.testUserJourney();
            await this.testPerformanceMetrics();
            await this.testRegressionPrevention();
        } catch (error) {
            console.error('❌ Test suite error:', error);
            this.testResults.errors.push(`Test suite error: ${error.message}`);
        }

        await this.generateComprehensiveReport();
    }

    async generateComprehensiveReport() {
        const totalTime = Date.now() - this.startTime;
        
        console.log('\n📊 COMPREHENSIVE LEGISLATIVE INTEGRATION TEST REPORT');
        console.log('=====================================================\n');

        // Test Results Summary
        const sections = [
            { name: 'ZIP Validation', tests: this.testResults.zipValidation },
            { name: 'Bills API', tests: this.testResults.billsAPI },
            { name: 'Legislative Integration', tests: this.testResults.legislativeIntegration },
            { name: 'User Journey', tests: this.testResults.userJourney },
            { name: 'Performance Metrics', tests: this.testResults.performanceMetrics },
            { name: 'Regression Tests', tests: this.testResults.regressionTests }
        ];

        let totalPassed = 0;
        let totalTests = 0;

        sections.forEach(section => {
            const passed = section.tests.filter(t => t.passed).length;
            const total = section.tests.length;
            totalPassed += passed;
            totalTests += total;

            console.log(`${section.name.toUpperCase()}:`);
            console.log(`  ✅ Passed: ${passed}/${total} (${total > 0 ? ((passed/total)*100).toFixed(1) : 0}%)`);
            
            // Show any failures
            const failures = section.tests.filter(t => !t.passed);
            if (failures.length > 0) {
                failures.forEach(failure => {
                    console.log(`    ❌ ${failure.name || failure.description || failure.test}: Failed`);
                });
            }
            console.log('');
        });

        // Overall Success Rate
        const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
        console.log('🎯 OVERALL RESULTS:');
        console.log(`  ✅ Tests passed: ${totalPassed}/${totalTests} (${successRate}%)`);
        console.log(`  ❌ Errors encountered: ${this.testResults.errors.length}`);
        console.log(`  ⏱️ Total test time: ${(totalTime/1000).toFixed(1)} seconds`);

        // Performance Summary
        if (this.testResults.performanceMetrics.length > 0) {
            const avgPerformance = this.testResults.performanceMetrics.reduce((acc, test) => 
                acc + test.averageTime, 0) / this.testResults.performanceMetrics.length;
            console.log(`  ⚡ Average response time: ${Math.round(avgPerformance)}ms`);
        }

        // Integration Status
        console.log('\n🔗 INTEGRATION STATUS:');
        const integrationHealthy = this.testResults.legislativeIntegration.every(t => t.passed);
        const regressionClean = this.testResults.regressionTests.every(t => t.passed);
        
        console.log(`  📋 Legislative features: ${integrationHealthy ? '✅ Integrated successfully' : '❌ Integration issues detected'}`);
        console.log(`  🔄 Existing functionality: ${regressionClean ? '✅ No regressions detected' : '❌ Regressions found'}`);
        
        // System Readiness Assessment
        console.log('\n🚀 SYSTEM READINESS:');
        if (successRate >= 90 && integrationHealthy && regressionClean) {
            console.log('  ✅ READY FOR PRODUCTION - All systems go!');
        } else if (successRate >= 75) {
            console.log('  ⚠️ MOSTLY READY - Minor issues to address');
        } else {
            console.log('  ❌ NOT READY - Significant issues need resolution');
        }

        // Error Details
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ ERROR DETAILS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (!integrationHealthy) {
            console.log('  • Fix legislative API integration issues');
        }
        if (!regressionClean) {
            console.log('  • Address regression test failures');
        }
        if (successRate < 90) {
            console.log('  • Improve overall test pass rate to 90%+');
        }
        console.log('  • Monitor performance metrics in production');
        console.log('  • Set up continuous integration for these tests');

        // Save detailed results
        const reportData = {
            summary: {
                totalTests,
                totalPassed,
                successRate: parseFloat(successRate),
                totalTime: totalTime,
                integrationHealthy,
                regressionClean,
                timestamp: new Date().toISOString()
            },
            results: this.testResults
        };

        fs.writeFileSync('comprehensive-legislative-test-results.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Detailed results saved to comprehensive-legislative-test-results.json');
        console.log('\n🏁 Legislative integration testing completed.\n');
    }
}

// Run the comprehensive tests
if (require.main === module) {
    const tester = new ComprehensiveLegislativeTestSuite();
    tester.runAllTests().catch(console.error);
}

module.exports = ComprehensiveLegislativeTestSuite;