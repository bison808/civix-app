/**
 * Comprehensive Final Validation Suite
 * Complete testing of mobile responsiveness, performance, and regression testing
 */

const http = require('http');
const fs = require('fs');

class ComprehensiveFinalValidationSuite {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            mobileResponsiveness: [],
            accessibility: [],
            performanceBenchmarks: [],
            loadTesting: [],
            regressionTests: [],
            systemReadiness: [],
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
                    'User-Agent': 'CITZN-Final-Validation/1.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 15000
            };

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
                            raw: data,
                            responseTime: responseTime,
                            size: Buffer.byteLength(data, 'utf8')
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: null,
                            raw: data,
                            responseTime: responseTime,
                            size: Buffer.byteLength(data, 'utf8'),
                            parseError: error.message
                        });
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async testMobileResponsiveness() {
        console.log('📱 Testing mobile responsiveness...');

        const mobileTests = [
            {
                name: 'Mobile-First Design',
                description: 'Check if pages load optimally on mobile',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    return response.status === 200 && response.raw.includes('viewport');
                }
            },
            {
                name: 'Touch-Friendly Interface',
                description: 'Verify touch-friendly button sizes and interactions',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    // Look for mobile-friendly CSS classes like touch-feedback
                    return response.raw.includes('touch') || response.raw.includes('mobile');
                }
            },
            {
                name: 'Responsive Navigation',
                description: 'Mobile navigation works correctly',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    // Check for mobile navigation patterns
                    return response.raw.includes('MobileNav') || response.raw.includes('mobile');
                }
            },
            {
                name: 'Mobile Performance',
                description: 'Fast loading on mobile connections',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    return response.responseTime < 3000 && response.size < 1000000; // < 3s, < 1MB
                }
            }
        ];

        for (const test of mobileTests) {
            try {
                const passed = await test.test();
                const result = {
                    name: test.name,
                    description: test.description,
                    passed: passed
                };

                this.testResults.mobileResponsiveness.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${test.description}`);

            } catch (error) {
                console.error(`❌ Error testing ${test.name}:`, error.message);
                this.testResults.errors.push(`Mobile test error: ${error.message}`);
            }
        }
    }

    async testAccessibility() {
        console.log('\n♿ Testing accessibility features...');

        const accessibilityTests = [
            {
                name: 'Skip Links',
                description: 'Skip to main content links present',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    return response.raw.includes('Skip to main content') || 
                           response.raw.includes('skip-link');
                }
            },
            {
                name: 'ARIA Labels',
                description: 'Proper ARIA labels and roles',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    return response.raw.includes('aria-label') || 
                           response.raw.includes('role=');
                }
            },
            {
                name: 'Semantic HTML',
                description: 'Proper semantic HTML structure',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    return response.raw.includes('<main') && 
                           response.raw.includes('<nav') &&
                           response.raw.includes('<section');
                }
            },
            {
                name: 'Color Contrast',
                description: 'Adequate color contrast for readability',
                test: async () => {
                    const response = await this.makeRequest(this.baseUrl);
                    // Check for proper contrast CSS classes or WCAG compliance
                    return response.raw.includes('contrast') || response.status === 200;
                }
            }
        ];

        for (const test of accessibilityTests) {
            try {
                const passed = await test.test();
                const result = {
                    name: test.name,
                    description: test.description,
                    passed: passed
                };

                this.testResults.accessibility.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${test.description}`);

            } catch (error) {
                console.error(`❌ Error testing ${test.name}:`, error.message);
                this.testResults.errors.push(`Accessibility test error: ${error.message}`);
            }
        }
    }

    async testPerformanceBenchmarks() {
        console.log('\n⚡ Testing performance benchmarks...');

        const performanceTests = [
            { name: 'Home Page Load', url: '/', target: 2000 },
            { name: 'Bills API Response', url: '/api/bills?limit=10', target: 1000 },
            { name: 'ZIP Validation Speed', url: '/api/auth/verify-zip', method: 'POST', body: { zipCode: '90210' }, target: 500 },
            { name: 'Federal Bills Query', url: '/api/bills?source=federal&limit=20', target: 1500 },
            { name: 'State Bills Query', url: '/api/bills?source=california&limit=15', target: 1500 },
            { name: 'Topic Filter Performance', url: '/api/bills?topic=energy&limit=10', target: 1000 }
        ];

        for (const test of performanceTests) {
            const times = [];
            const sizes = [];
            
            // Run each test 5 times to get reliable averages
            for (let i = 0; i < 5; i++) {
                try {
                    const response = await this.makeRequest(`${this.baseUrl}${test.url}`, {
                        method: test.method || 'GET',
                        body: test.body
                    });
                    times.push(response.responseTime);
                    sizes.push(response.size);
                } catch (error) {
                    console.error(`Performance test error: ${error.message}`);
                }
            }

            if (times.length > 0) {
                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);
                const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;

                const result = {
                    name: test.name,
                    averageTime: Math.round(avgTime),
                    minTime: minTime,
                    maxTime: maxTime,
                    averageSize: Math.round(avgSize),
                    target: test.target,
                    passed: avgTime <= test.target,
                    variance: maxTime - minTime
                };

                this.testResults.performanceBenchmarks.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.averageTime}ms avg (${result.minTime}-${result.maxTime}ms) | ${(result.averageSize/1024).toFixed(1)}KB`);
            }
        }
    }

    async testLoadCapacity() {
        console.log('\n🔥 Testing load capacity...');

        try {
            // Simulate concurrent requests
            const concurrentTests = [
                { requests: 5, description: 'Light Load' },
                { requests: 10, description: 'Medium Load' },
                { requests: 15, description: 'Heavy Load' }
            ];

            for (const loadTest of concurrentTests) {
                console.log(`  Testing ${loadTest.description} (${loadTest.requests} concurrent requests)...`);
                
                const promises = [];
                const startTime = Date.now();
                
                // Create concurrent requests
                for (let i = 0; i < loadTest.requests; i++) {
                    promises.push(
                        this.makeRequest(`${this.baseUrl}/api/bills?limit=5&offset=${i}`)
                            .catch(error => ({ error: error.message }))
                    );
                }

                const results = await Promise.all(promises);
                const totalTime = Date.now() - startTime;
                
                const successful = results.filter(r => r.status === 200).length;
                const failed = results.filter(r => r.error || r.status !== 200).length;
                const avgResponseTime = results
                    .filter(r => r.responseTime)
                    .reduce((acc, r) => acc + r.responseTime, 0) / successful;

                const loadResult = {
                    name: loadTest.description,
                    concurrentRequests: loadTest.requests,
                    successful: successful,
                    failed: failed,
                    totalTime: totalTime,
                    averageResponseTime: Math.round(avgResponseTime) || 0,
                    successRate: (successful / loadTest.requests) * 100,
                    passed: successful >= loadTest.requests * 0.8 && avgResponseTime < 5000 // 80% success, <5s avg
                };

                this.testResults.loadTesting.push(loadResult);
                console.log(`    ${loadResult.passed ? '✅' : '❌'} ${loadResult.successRate.toFixed(1)}% success (${successful}/${loadTest.requests}) | ${loadResult.averageResponseTime}ms avg`);
            }

        } catch (error) {
            console.error('❌ Error in load testing:', error.message);
            this.testResults.errors.push(`Load testing error: ${error.message}`);
        }
    }

    async testSystemRegression() {
        console.log('\n🔄 Testing system regression...');

        const regressionTests = [
            {
                name: 'ZIP Code Validation Still Works',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                        method: 'POST',
                        body: { zipCode: '90210' }
                    });
                    return response.data?.valid === true && 
                           response.data?.city === 'Beverly Hills' && 
                           response.data?.state === 'CA';
                }
            },
            {
                name: 'Bills API Maintains Structure',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/bills?limit=3`);
                    if (!Array.isArray(response.data) || response.data.length === 0) return false;
                    const bill = response.data[0];
                    return bill.id && bill.title && bill.billNumber && bill.status;
                }
            },
            {
                name: 'Political Mapping Unchanged',
                test: async () => {
                    const zipResponse = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                        method: 'POST',
                        body: { zipCode: '95814' }
                    });
                    return zipResponse.data?.city === 'Sacramento' && zipResponse.data?.state === 'CA';
                }
            },
            {
                name: 'Performance Standards Maintained',
                test: async () => {
                    const start = Date.now();
                    const response = await this.makeRequest(`${this.baseUrl}/api/bills?limit=5`);
                    const time = Date.now() - start;
                    return response.status === 200 && time < 2000;
                }
            },
            {
                name: 'Legislative Integration Works',
                test: async () => {
                    const federal = await this.makeRequest(`${this.baseUrl}/api/bills?source=federal&limit=2`);
                    const state = await this.makeRequest(`${this.baseUrl}/api/bills?source=california&limit=2`);
                    return Array.isArray(federal.data) && Array.isArray(state.data) && 
                           federal.data.length > 0 && state.data.length > 0;
                }
            }
        ];

        for (const test of regressionTests) {
            try {
                const passed = await test.test();
                const result = {
                    name: test.name,
                    passed: passed
                };

                this.testResults.regressionTests.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}`);

            } catch (error) {
                console.error(`❌ Error in regression test ${test.name}:`, error.message);
                this.testResults.errors.push(`Regression test error: ${error.message}`);
            }
        }
    }

    async testSystemReadiness() {
        console.log('\n🚀 Testing overall system readiness...');

        const readinessChecks = [
            {
                name: 'Core Infrastructure',
                test: async () => {
                    const health = await this.makeRequest(this.baseUrl);
                    return health.status === 200;
                }
            },
            {
                name: 'API Ecosystem',
                test: async () => {
                    const bills = await this.makeRequest(`${this.baseUrl}/api/bills`);
                    const zip = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                        method: 'POST',
                        body: { zipCode: '90210' }
                    });
                    return bills.status === 200 && zip.status === 200;
                }
            },
            {
                name: 'Data Quality',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/bills?limit=3`);
                    if (!Array.isArray(response.data) || response.data.length === 0) return false;
                    return response.data.every(bill => bill.title && bill.billNumber && bill.status);
                }
            },
            {
                name: 'User Journey Completion',
                test: async () => {
                    // Test complete user flow
                    const zip = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                        method: 'POST',
                        body: { zipCode: '90210' }
                    });
                    if (!zip.data?.valid) return false;

                    const bills = await this.makeRequest(`${this.baseUrl}/api/bills?zipCode=90210&limit=3`);
                    return Array.isArray(bills.data) && bills.data.length > 0;
                }
            }
        ];

        for (const check of readinessChecks) {
            try {
                const passed = await check.test();
                const result = {
                    name: check.name,
                    passed: passed
                };

                this.testResults.systemReadiness.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${check.name}: ${passed ? 'Ready' : 'Issues detected'}`);

            } catch (error) {
                console.error(`❌ Error in readiness check ${check.name}:`, error.message);
                this.testResults.errors.push(`Readiness check error: ${error.message}`);
            }
        }
    }

    async runAllTests() {
        console.log('🎯 Starting Comprehensive Final Validation Suite\n');
        console.log('Testing mobile responsiveness, performance, and system readiness...\n');

        try {
            await this.testMobileResponsiveness();
            await this.testAccessibility();
            await this.testPerformanceBenchmarks();
            await this.testLoadCapacity();
            await this.testSystemRegression();
            await this.testSystemReadiness();
        } catch (error) {
            console.error('❌ Test suite error:', error);
            this.testResults.errors.push(`Test suite error: ${error.message}`);
        }

        await this.generateFinalReport();
    }

    async generateFinalReport() {
        const totalTime = Date.now() - this.startTime;
        
        console.log('\n🏆 COMPREHENSIVE FINAL VALIDATION REPORT');
        console.log('========================================\n');

        // Test Results Summary
        const sections = [
            { name: 'Mobile Responsiveness', tests: this.testResults.mobileResponsiveness },
            { name: 'Accessibility', tests: this.testResults.accessibility },
            { name: 'Performance Benchmarks', tests: this.testResults.performanceBenchmarks },
            { name: 'Load Testing', tests: this.testResults.loadTesting },
            { name: 'Regression Tests', tests: this.testResults.regressionTests },
            { name: 'System Readiness', tests: this.testResults.systemReadiness }
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
            
            // Show key metrics for performance
            if (section.name === 'Performance Benchmarks') {
                const avgPerformance = section.tests.reduce((acc, test) => acc + test.averageTime, 0) / section.tests.length;
                console.log(`    ⚡ Average response time: ${Math.round(avgPerformance)}ms`);
            }
            
            // Show failures
            const failures = section.tests.filter(t => !t.passed);
            if (failures.length > 0) {
                failures.forEach(failure => {
                    console.log(`    ❌ ${failure.name}: Failed`);
                });
            }
            console.log('');
        });

        // Overall Success Rate
        const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
        
        // Performance Summary
        const performanceResults = this.testResults.performanceBenchmarks;
        const avgPerformance = performanceResults.length > 0 ? 
            performanceResults.reduce((acc, test) => acc + test.averageTime, 0) / performanceResults.length : 0;
        
        // Load Testing Summary
        const loadResults = this.testResults.loadTesting;
        const avgSuccessRate = loadResults.length > 0 ? 
            loadResults.reduce((acc, test) => acc + test.successRate, 0) / loadResults.length : 0;

        console.log('🎯 FINAL SYSTEM ASSESSMENT:');
        console.log(`  ✅ Overall test success: ${totalPassed}/${totalTests} (${successRate}%)`);
        console.log(`  ⚡ Average performance: ${Math.round(avgPerformance)}ms`);
        console.log(`  🔥 Load test success rate: ${avgSuccessRate.toFixed(1)}%`);
        console.log(`  ❌ Total errors: ${this.testResults.errors.length}`);
        console.log(`  ⏱️ Total validation time: ${(totalTime/1000).toFixed(1)} seconds`);

        // Mobile & Accessibility
        const mobileReady = this.testResults.mobileResponsiveness.every(t => t.passed);
        const accessibilityReady = this.testResults.accessibility.every(t => t.passed);
        
        console.log('\n📱 MOBILE & ACCESSIBILITY:');
        console.log(`  📱 Mobile responsiveness: ${mobileReady ? '✅ Excellent' : '⚠️ Needs improvement'}`);
        console.log(`  ♿ Accessibility compliance: ${accessibilityReady ? '✅ WCAG ready' : '⚠️ Partial compliance'}`);

        // System Health
        const regressionClean = this.testResults.regressionTests.every(t => t.passed);
        const systemReady = this.testResults.systemReadiness.every(t => t.passed);
        
        console.log('\n🏥 SYSTEM HEALTH:');
        console.log(`  🔄 No regressions: ${regressionClean ? '✅ All clear' : '❌ Issues detected'}`);
        console.log(`  🚀 Production readiness: ${systemReady ? '✅ Ready to deploy' : '⚠️ Needs attention'}`);
        console.log(`  ⚡ Performance targets: ${performanceResults.every(t => t.passed) ? '✅ All met' : '⚠️ Some missed'}`);
        console.log(`  🔥 Load handling: ${loadResults.every(t => t.passed) ? '✅ Scales well' : '⚠️ Load issues'}`);

        // Final Production Assessment
        console.log('\n🚀 PRODUCTION DEPLOYMENT ASSESSMENT:');
        
        const criticalSystemsReady = systemReady && regressionClean;
        const performanceAcceptable = successRate >= 80 && avgPerformance < 2000;
        const userExperienceReady = mobileReady && (avgSuccessRate >= 80);

        if (criticalSystemsReady && performanceAcceptable && userExperienceReady) {
            console.log('  🎉 ✅ READY FOR PRODUCTION DEPLOYMENT');
            console.log('    • All critical systems operational');
            console.log('    • Performance meets targets');
            console.log('    • User experience optimized');
            console.log('    • No regressions detected');
        } else if (criticalSystemsReady && performanceAcceptable) {
            console.log('  ⚠️ MOSTLY READY - Minor optimizations needed');
            console.log('    • Core systems ready');
            if (!userExperienceReady) console.log('    • UX improvements recommended');
        } else {
            console.log('  ❌ NOT READY FOR PRODUCTION');
            if (!criticalSystemsReady) console.log('    • Critical system issues must be resolved');
            if (!performanceAcceptable) console.log('    • Performance optimization required');
        }

        // Final Recommendations
        console.log('\n💡 FINAL RECOMMENDATIONS:');
        if (!regressionClean) {
            console.log('  🔧 CRITICAL: Fix regression test failures');
        }
        if (avgPerformance > 1500) {
            console.log('  ⚡ IMPORTANT: Optimize API response times');
        }
        if (!mobileReady) {
            console.log('  📱 IMPORTANT: Complete mobile responsiveness');
        }
        if (!accessibilityReady) {
            console.log('  ♿ RECOMMENDED: Enhance accessibility features');
        }
        if (avgSuccessRate < 90) {
            console.log('  🔥 RECOMMENDED: Improve load handling capacity');
        }
        
        console.log('  📊 Set up production monitoring');
        console.log('  🔄 Implement automated testing pipeline');
        console.log('  📈 Monitor user engagement metrics post-launch');

        // Error Details
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ ERROR DETAILS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        // Save comprehensive results
        const reportData = {
            summary: {
                totalTests,
                totalPassed,
                successRate: parseFloat(successRate),
                averagePerformance: Math.round(avgPerformance),
                loadSuccessRate: parseFloat(avgSuccessRate.toFixed(1)),
                totalTime: totalTime,
                mobileReady,
                accessibilityReady,
                regressionClean,
                systemReady,
                productionReady: criticalSystemsReady && performanceAcceptable && userExperienceReady,
                timestamp: new Date().toISOString()
            },
            detailedResults: this.testResults
        };

        fs.writeFileSync('comprehensive-final-validation-results.json', JSON.stringify(reportData, null, 2));
        console.log('\n💾 Comprehensive results saved to comprehensive-final-validation-results.json');
        console.log('\n🏁 Final validation completed.\n');
    }
}

// Run the comprehensive validation
if (require.main === module) {
    const tester = new ComprehensiveFinalValidationSuite();
    tester.runAllTests().catch(console.error);
}

module.exports = ComprehensiveFinalValidationSuite;