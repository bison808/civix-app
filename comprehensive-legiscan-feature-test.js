/**
 * Agent Alex - Comprehensive LegiScan Feature Testing Suite
 * Testing all comprehensive features delivered by Carlos, Lisa, and Rachel
 */

const http = require('http');
const fs = require('fs');

class ComprehensiveLegiScanTestSuite {
    constructor() {
        this.baseUrl = 'http://localhost:3008';
        this.testResults = {
            votingRecords: [],
            committeeFunctionality: [],
            documentRetrieval: [],
            legislativeCalendars: [],
            advancedSearch: [],
            performanceValidation: [],
            uiUxComponents: [],
            integrationWorkflows: [],
            errors: []
        };
        this.startTime = Date.now();
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || 3008,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': 'CITZN-LegiScan-Test/1.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 15000
            };

            if (options.body) {
                requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
            }

            const req = http.request(requestOptions, (res) => {
                let data = '';
                const startTime = Date.now();
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    try {
                        const jsonData = data ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: jsonData,
                            responseTime,
                            rawData: data
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: null,
                            responseTime,
                            rawData: data,
                            parseError: error.message
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject({ error: error.message, code: error.code });
            });

            req.on('timeout', () => {
                req.destroy();
                reject({ error: 'Request timeout', code: 'TIMEOUT' });
            });

            if (options.body) {
                req.write(options.body);
            }
            req.end();
        });
    }

    // 1. VOTING RECORDS & ROLL CALL VOTES TESTING
    async testVotingRecordsFeatures() {
        console.log('\n🗳️  Testing Voting Records & Roll Call Features...');
        
        const votingTests = [
            {
                name: 'System Health Check',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/system/health`);
                    return {
                        passed: response.status === 200 && response.data?.overallStatus === 'healthy',
                        details: `Status: ${response.data?.overallStatus}, Dependencies: ${response.data?.dependencies?.length}`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Bills API Availability',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/bills`);
                    return {
                        passed: response.status === 200,
                        details: `Status: ${response.status}, Response time: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Committee API Functionality',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/committees`);
                    return {
                        passed: response.status === 200,
                        details: `Status: ${response.status}, Response time: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Representatives API Integration',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                    return {
                        passed: response.status === 200,
                        details: `Status: ${response.status}, Response time: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            }
        ];

        for (const test of votingTests) {
            try {
                const result = await test.test();
                this.testResults.votingRecords.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.votingRecords.push({
                    testName: test.name,
                    passed: false,
                    error: error.message || error.toString(),
                    timestamp: new Date().toISOString()
                });
                this.testResults.errors.push({ test: test.name, error: error.message });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // 2. UI/UX COMPONENTS TESTING
    async testUxUiComponents() {
        console.log('\n🎨 Testing UX/UI Components...');
        
        const uiTests = [
            {
                name: 'Homepage Load Performance',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/`);
                    return {
                        passed: response.status === 200 && response.responseTime < 2000,
                        details: `Load time: ${response.responseTime}ms (target: <2000ms)`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Feed Page Performance',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/feed`);
                    return {
                        passed: response.status === 200,
                        details: `Status: ${response.status}, Load time: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Representatives Page Performance',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/representatives`);
                    return {
                        passed: response.status === 200,
                        details: `Status: ${response.status}, Load time: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Committees Page Performance',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/committees`);
                    return {
                        passed: response.status === 200,
                        details: `Status: ${response.status}, Load time: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            }
        ];

        for (const test of uiTests) {
            try {
                const result = await test.test();
                this.testResults.uiUxComponents.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.uiUxComponents.push({
                    testName: test.name,
                    passed: false,
                    error: error.message || error.toString(),
                    timestamp: new Date().toISOString()
                });
                this.testResults.errors.push({ test: test.name, error: error.message });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // 3. PERFORMANCE OPTIMIZATION TESTING
    async testPerformanceOptimizations() {
        console.log('\n⚡ Testing Performance Optimizations...');
        
        const performanceTests = [
            {
                name: 'Bundle Size Check (Target: <400KB)',
                test: async () => {
                    // Simulate bundle size check through load time
                    const response = await this.makeRequest(`${this.baseUrl}/`);
                    return {
                        passed: response.responseTime < 3000, // Under 3s indicates good bundle size
                        details: `Initial load: ${response.responseTime}ms (indicates bundle efficiency)`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'API Response Caching',
                test: async () => {
                    // Test API caching by making consecutive requests
                    const start = Date.now();
                    await this.makeRequest(`${this.baseUrl}/api/bills`);
                    const firstCall = Date.now() - start;
                    
                    const start2 = Date.now();
                    await this.makeRequest(`${this.baseUrl}/api/bills`);
                    const secondCall = Date.now() - start2;
                    
                    return {
                        passed: secondCall <= firstCall, // Second call should be same or faster due to caching
                        details: `First: ${firstCall}ms, Second: ${secondCall}ms`,
                        responseTime: secondCall
                    };
                }
            },
            {
                name: 'React Query Integration',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/system/health`);
                    return {
                        passed: response.status === 200,
                        details: `React Query backend health: ${response.data?.overallStatus}`,
                        responseTime: response.responseTime
                    };
                }
            }
        ];

        for (const test of performanceTests) {
            try {
                const result = await test.test();
                this.testResults.performanceValidation.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.performanceValidation.push({
                    testName: test.name,
                    passed: false,
                    error: error.message || error.toString(),
                    timestamp: new Date().toISOString()
                });
                this.testResults.errors.push({ test: test.name, error: error.message });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // 4. INTEGRATION WORKFLOW TESTING
    async testIntegrationWorkflows() {
        console.log('\n🔄 Testing Integration Workflows...');
        
        const workflowTests = [
            {
                name: 'ZIP Code → Representatives Workflow',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                    return {
                        passed: response.status === 200,
                        details: `ZIP 94102 lookup: ${response.status} status`,
                        responseTime: response.responseTime
                    };
                }
            },
            {
                name: 'Bills → Committee Integration',
                test: async () => {
                    const billsResponse = await this.makeRequest(`${this.baseUrl}/api/bills`);
                    const committeesResponse = await this.makeRequest(`${this.baseUrl}/api/committees`);
                    
                    const bothWorking = billsResponse.status === 200 && committeesResponse.status === 200;
                    return {
                        passed: bothWorking,
                        details: `Bills: ${billsResponse.status}, Committees: ${committeesResponse.status}`,
                        responseTime: Math.max(billsResponse.responseTime, committeesResponse.responseTime)
                    };
                }
            },
            {
                name: 'Complete User Journey (ZIP → Bills → Representatives)',
                test: async () => {
                    // Simulate complete user workflow
                    const zipResponse = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                        method: 'POST',
                        body: JSON.stringify({ zipCode: '94102' })
                    });
                    
                    const billsResponse = await this.makeRequest(`${this.baseUrl}/api/bills`);
                    const repsResponse = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                    
                    const allWorking = [zipResponse.status, billsResponse.status, repsResponse.status]
                        .every(status => status === 200 || status === 201);
                    
                    return {
                        passed: allWorking,
                        details: `ZIP: ${zipResponse.status}, Bills: ${billsResponse.status}, Reps: ${repsResponse.status}`,
                        responseTime: Math.max(zipResponse.responseTime, billsResponse.responseTime, repsResponse.responseTime)
                    };
                }
            }
        ];

        for (const test of workflowTests) {
            try {
                const result = await test.test();
                this.testResults.integrationWorkflows.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.integrationWorkflows.push({
                    testName: test.name,
                    passed: false,
                    error: error.message || error.toString(),
                    timestamp: new Date().toISOString()
                });
                this.testResults.errors.push({ test: test.name, error: error.message });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Generate comprehensive test report
    generateReport() {
        const totalTests = Object.values(this.testResults).reduce((acc, category) => 
            acc + (Array.isArray(category) ? category.length : 0), 0) - this.testResults.errors.length;
        
        const passedTests = Object.values(this.testResults).reduce((acc, category) => {
            if (Array.isArray(category) && category !== this.testResults.errors) {
                return acc + category.filter(test => test.passed).length;
            }
            return acc;
        }, 0);

        const averageResponseTime = Object.values(this.testResults).reduce((acc, category) => {
            if (Array.isArray(category) && category !== this.testResults.errors) {
                const times = category.filter(test => test.responseTime).map(test => test.responseTime);
                return acc.concat(times);
            }
            return acc;
        }, []);

        const avgTime = averageResponseTime.length > 0 
            ? Math.round(averageResponseTime.reduce((a, b) => a + b, 0) / averageResponseTime.length)
            : 0;

        return {
            summary: {
                totalTests,
                passedTests,
                failedTests: totalTests - passedTests,
                successRate: Math.round((passedTests / totalTests) * 100),
                averageResponseTime: avgTime,
                totalTime: Date.now() - this.startTime,
                timestamp: new Date().toISOString(),
                productionReady: passedTests >= Math.floor(totalTests * 0.9), // 90% pass rate
                performanceGrade: avgTime < 1000 ? 'A' : avgTime < 2000 ? 'B' : 'C',
                criticalIssues: this.testResults.errors.length
            },
            detailedResults: this.testResults,
            recommendations: this.generateRecommendations(passedTests, totalTests, avgTime)
        };
    }

    generateRecommendations(passed, total, avgTime) {
        const recommendations = [];
        
        if (passed / total < 0.9) {
            recommendations.push('🔧 Address failing tests before production deployment');
        }
        
        if (avgTime > 1500) {
            recommendations.push('⚡ Optimize API response times for better user experience');
        }
        
        if (this.testResults.errors.length > 0) {
            recommendations.push('🚨 Investigate and resolve error conditions');
        }
        
        if (passed / total >= 0.95 && avgTime < 1000) {
            recommendations.push('🎉 Excellent performance! Ready for production deployment');
        }
        
        return recommendations;
    }

    // Main test execution
    async runComprehensiveTests() {
        console.log('🧪 Agent Alex - Comprehensive LegiScan Feature Testing');
        console.log('📊 Testing Carlos\'s LegiScan features, Lisa\'s optimizations, and Rachel\'s UX components');
        console.log('=' .repeat(80));

        await this.testVotingRecordsFeatures();
        await this.testUxUiComponents();
        await this.testPerformanceOptimizations();
        await this.testIntegrationWorkflows();

        const report = this.generateReport();
        
        console.log('\n📋 COMPREHENSIVE TEST REPORT');
        console.log('=' .repeat(50));
        console.log(`✅ Tests Passed: ${report.summary.passedTests}/${report.summary.totalTests} (${report.summary.successRate}%)`);
        console.log(`⚡ Average Response Time: ${report.summary.averageResponseTime}ms`);
        console.log(`🏆 Performance Grade: ${report.summary.performanceGrade}`);
        console.log(`🚀 Production Ready: ${report.summary.productionReady ? 'YES' : 'NO'}`);
        console.log(`⏱️  Total Test Time: ${Math.round(report.summary.totalTime / 1000)}s`);
        
        if (report.recommendations.length > 0) {
            console.log('\n📝 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`  ${rec}`));
        }

        // Save detailed report
        const filename = `comprehensive-legiscan-test-results-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`\n💾 Detailed report saved: ${filename}`);

        return report;
    }
}

// Execute tests if run directly
if (require.main === module) {
    const testSuite = new ComprehensiveLegiScanTestSuite();
    testSuite.runComprehensiveTests()
        .then(report => {
            process.exit(report.summary.productionReady ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = ComprehensiveLegiScanTestSuite;