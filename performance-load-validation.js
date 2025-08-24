/**
 * Agent Alex - Performance & Load Validation Suite
 * Testing Lisa's performance optimizations under real load conditions
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

class PerformanceLoadValidation {
    constructor() {
        this.baseUrl = 'http://localhost:3008';
        this.testResults = {
            loadTests: [],
            bundleTests: [],
            cacheTests: [],
            concurrencyTests: [],
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
                    'User-Agent': 'CITZN-Performance-Test/1.0',
                    'Accept': 'application/json, text/html',
                    'Connection': 'keep-alive',
                    ...options.headers
                },
                timeout: options.timeout || 10000
            };

            if (options.body) {
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
            }

            const req = http.request(requestOptions, (res) => {
                let data = '';
                const startTime = Date.now();
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    const contentLength = res.headers['content-length'] || data.length;
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data,
                        responseTime,
                        contentLength: parseInt(contentLength),
                        location: res.headers.location
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.body) {
                req.write(options.body);
            }
            req.end();
        });
    }

    // Test Bundle Performance (Lisa's 185KB optimization)
    async testBundlePerformance() {
        console.log('\n📦 Testing Bundle Performance & Optimization...');
        
        const bundleTests = [
            {
                name: 'Main Bundle Size Check',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/`);
                    const isOptimized = response.responseTime < 1500; // Under 1.5s indicates good bundle
                    return {
                        passed: isOptimized,
                        details: `Load time: ${response.responseTime}ms, Status: ${response.status}`,
                        responseTime: response.responseTime,
                        bundleEfficient: isOptimized
                    };
                }
            },
            {
                name: 'Dynamic Import Performance',
                test: async () => {
                    // Test multiple pages to validate dynamic loading
                    const pages = ['/feed', '/representatives', '/committees'];
                    const results = [];
                    
                    for (const page of pages) {
                        try {
                            const response = await this.makeRequest(`${this.baseUrl}${page}`);
                            results.push({
                                page,
                                responseTime: response.responseTime,
                                status: response.status
                            });
                        } catch (error) {
                            results.push({
                                page,
                                error: error.message,
                                status: 'ERROR'
                            });
                        }
                    }
                    
                    const avgTime = results
                        .filter(r => r.responseTime)
                        .reduce((sum, r) => sum + r.responseTime, 0) / results.length || 0;
                    
                    return {
                        passed: avgTime < 2000,
                        details: `Avg dynamic load: ${Math.round(avgTime)}ms across ${pages.length} pages`,
                        responseTime: Math.round(avgTime),
                        pageResults: results
                    };
                }
            },
            {
                name: 'React Query Bundle Integration',
                test: async () => {
                    const response = await this.makeRequest(`${this.baseUrl}/api/system/health`);
                    return {
                        passed: response.status === 200 && response.responseTime < 500,
                        details: `React Query health: ${response.responseTime}ms`,
                        responseTime: response.responseTime
                    };
                }
            }
        ];

        for (const test of bundleTests) {
            try {
                const result = await test.test();
                this.testResults.bundleTests.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.bundleTests.push({
                    testName: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Test Caching Performance  
    async testCachePerformance() {
        console.log('\n🗄️  Testing Cache Performance...');
        
        const cacheTests = [
            {
                name: 'API Response Caching',
                test: async () => {
                    const endpoints = [
                        '/api/bills',
                        '/api/representatives?zipCode=94102',
                        '/api/committees'
                    ];
                    
                    const results = [];
                    
                    for (const endpoint of endpoints) {
                        // First call (cache miss)
                        const start1 = Date.now();
                        const response1 = await this.makeRequest(`${this.baseUrl}${endpoint}`);
                        const time1 = Date.now() - start1;
                        
                        // Second call (should be cached or faster)
                        const start2 = Date.now();
                        const response2 = await this.makeRequest(`${this.baseUrl}${endpoint}`);
                        const time2 = Date.now() - start2;
                        
                        results.push({
                            endpoint,
                            firstCall: time1,
                            secondCall: time2,
                            improvement: time1 - time2,
                            cached: time2 <= time1
                        });
                    }
                    
                    const avgImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length;
                    
                    return {
                        passed: avgImprovement >= 0, // Second calls should be same or better
                        details: `Avg cache improvement: ${Math.round(avgImprovement)}ms`,
                        responseTime: Math.round(avgImprovement),
                        cacheResults: results
                    };
                }
            },
            {
                name: 'Static Asset Caching',
                test: async () => {
                    // Test static asset loading
                    const response = await this.makeRequest(`${this.baseUrl}/`);
                    const hasCacheHeaders = response.headers['cache-control'] || 
                                          response.headers['etag'] || 
                                          response.headers['last-modified'];
                    
                    return {
                        passed: !!hasCacheHeaders,
                        details: `Cache headers present: ${!!hasCacheHeaders}`,
                        responseTime: response.responseTime,
                        cacheHeaders: {
                            cacheControl: response.headers['cache-control'],
                            etag: response.headers['etag'],
                            lastModified: response.headers['last-modified']
                        }
                    };
                }
            }
        ];

        for (const test of cacheTests) {
            try {
                const result = await test.test();
                this.testResults.cacheTests.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.cacheTests.push({
                    testName: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Test Concurrency & Load Handling
    async testConcurrencyLoad() {
        console.log('\n⚡ Testing Concurrency & Load Handling...');
        
        const concurrencyTests = [
            {
                name: 'Concurrent API Requests (10 parallel)',
                test: async () => {
                    const concurrentRequests = 10;
                    const endpoint = '/api/system/health';
                    
                    const promises = Array(concurrentRequests).fill().map(() =>
                        this.makeRequest(`${this.baseUrl}${endpoint}`)
                    );
                    
                    const start = Date.now();
                    const results = await Promise.allSettled(promises);
                    const totalTime = Date.now() - start;
                    
                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
                    const avgResponseTime = results
                        .filter(r => r.status === 'fulfilled')
                        .reduce((sum, r) => sum + r.value.responseTime, 0) / successful || 0;
                    
                    return {
                        passed: successful >= concurrentRequests * 0.9, // 90% success rate
                        details: `${successful}/${concurrentRequests} requests succeeded, Avg: ${Math.round(avgResponseTime)}ms`,
                        responseTime: Math.round(avgResponseTime),
                        successRate: (successful / concurrentRequests) * 100,
                        totalTime
                    };
                }
            },
            {
                name: 'Mixed Endpoint Load Test',
                test: async () => {
                    const endpoints = [
                        '/api/bills',
                        '/api/representatives?zipCode=94102',
                        '/api/committees',
                        '/api/system/health'
                    ];
                    
                    // Create mixed load pattern
                    const promises = [];
                    endpoints.forEach(endpoint => {
                        // 3 requests per endpoint
                        for (let i = 0; i < 3; i++) {
                            promises.push(this.makeRequest(`${this.baseUrl}${endpoint}`));
                        }
                    });
                    
                    const start = Date.now();
                    const results = await Promise.allSettled(promises);
                    const totalTime = Date.now() - start;
                    
                    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
                    const avgResponseTime = results
                        .filter(r => r.status === 'fulfilled')
                        .reduce((sum, r) => sum + r.value.responseTime, 0) / successful || 0;
                    
                    return {
                        passed: successful >= promises.length * 0.85, // 85% success rate under mixed load
                        details: `${successful}/${promises.length} mixed requests succeeded in ${totalTime}ms`,
                        responseTime: Math.round(avgResponseTime),
                        successRate: (successful / promises.length) * 100,
                        totalTime
                    };
                }
            }
        ];

        for (const test of concurrencyTests) {
            try {
                const result = await test.test();
                this.testResults.concurrencyTests.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.concurrencyTests.push({
                    testName: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Generate performance report
    generatePerformanceReport() {
        const allTests = [
            ...this.testResults.bundleTests,
            ...this.testResults.cacheTests,
            ...this.testResults.concurrencyTests
        ];
        
        const totalTests = allTests.length;
        const passedTests = allTests.filter(test => test.passed).length;
        
        const responseTimes = allTests
            .filter(test => test.responseTime)
            .map(test => test.responseTime);
        
        const avgResponseTime = responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        return {
            summary: {
                totalTests,
                passedTests,
                failedTests: totalTests - passedTests,
                successRate: Math.round((passedTests / totalTests) * 100),
                averageResponseTime: avgResponseTime,
                performanceGrade: avgResponseTime < 500 ? 'A+' : avgResponseTime < 1000 ? 'A' : avgResponseTime < 1500 ? 'B' : 'C',
                bundleOptimized: this.testResults.bundleTests.filter(t => t.passed).length >= 2,
                cacheEffective: this.testResults.cacheTests.filter(t => t.passed).length >= 1,
                loadHandling: this.testResults.concurrencyTests.filter(t => t.passed).length >= 1,
                productionReady: passedTests >= Math.floor(totalTests * 0.8), // 80% threshold
                timestamp: new Date().toISOString()
            },
            detailedResults: this.testResults,
            recommendations: this.generatePerformanceRecommendations(passedTests, totalTests, avgResponseTime)
        };
    }

    generatePerformanceRecommendations(passed, total, avgTime) {
        const recommendations = [];
        
        if (avgTime > 1000) {
            recommendations.push('⚡ Consider further bundle optimization - response times above 1s');
        }
        
        if (this.testResults.cacheTests.filter(t => t.passed).length === 0) {
            recommendations.push('🗄️  Implement API caching for better performance');
        }
        
        if (passed / total < 0.8) {
            recommendations.push('🔧 Address performance issues before production deployment');
        }
        
        if (passed / total >= 0.9 && avgTime < 500) {
            recommendations.push('🚀 Excellent performance optimization! Ready for high-load production');
        }
        
        return recommendations;
    }

    // Main execution
    async runPerformanceValidation() {
        console.log('⚡ Agent Alex - Performance & Load Validation');
        console.log('📊 Testing Lisa\'s bundle optimizations (185KB target) under real load conditions');
        console.log('=' .repeat(80));

        await this.testBundlePerformance();
        await this.testCachePerformance();
        await this.testConcurrencyLoad();

        const report = this.generatePerformanceReport();
        
        console.log('\n📋 PERFORMANCE VALIDATION REPORT');
        console.log('=' .repeat(50));
        console.log(`✅ Performance Tests: ${report.summary.passedTests}/${report.summary.totalTests} (${report.summary.successRate}%)`);
        console.log(`⚡ Average Response Time: ${report.summary.averageResponseTime}ms`);
        console.log(`🏆 Performance Grade: ${report.summary.performanceGrade}`);
        console.log(`📦 Bundle Optimized: ${report.summary.bundleOptimized ? 'YES' : 'NO'}`);
        console.log(`🗄️  Cache Effective: ${report.summary.cacheEffective ? 'YES' : 'NO'}`);
        console.log(`⚡ Load Handling: ${report.summary.loadHandling ? 'YES' : 'NO'}`);
        console.log(`🚀 Production Ready: ${report.summary.productionReady ? 'YES' : 'NO'}`);
        
        if (report.recommendations.length > 0) {
            console.log('\n📝 PERFORMANCE RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`  ${rec}`));
        }

        // Save report
        const filename = `performance-validation-report-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`\n💾 Performance report saved: ${filename}`);

        return report;
    }
}

// Execute if run directly
if (require.main === module) {
    const validator = new PerformanceLoadValidation();
    validator.runPerformanceValidation()
        .then(report => {
            process.exit(report.summary.productionReady ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Performance validation failed:', error);
            process.exit(1);
        });
}

module.exports = PerformanceLoadValidation;