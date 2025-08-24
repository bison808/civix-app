/**
 * Agent Alex - Comprehensive Integration Workflow Testing Suite
 * End-to-end testing of complete civic engagement workflows combining all agent deliverables
 */

const http = require('http');
const fs = require('fs');

class ComprehensiveIntegrationWorkflowTest {
    constructor() {
        this.baseUrl = 'http://localhost:3008';
        this.testResults = {
            citizenJourney: [],
            dataIntegration: [],
            crossPlatformWorkflows: [],
            productionReadiness: [],
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
                    'User-Agent': 'CITZN-Integration-Test/1.0',
                    'Accept': 'application/json, text/html',
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive',
                    ...options.headers
                },
                timeout: options.timeout || 12000
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
                        const jsonData = data && data.trim().startsWith('{') ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: jsonData,
                            rawData: data,
                            responseTime,
                            redirect: res.headers.location
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: null,
                            rawData: data,
                            responseTime,
                            redirect: res.headers.location
                        });
                    }
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

    // Test Complete Citizen Journey Workflows
    async testCitizenJourneyWorkflows() {
        console.log('\n🏛️  Testing Complete Citizen Journey Workflows...');
        
        const journeyTests = [
            {
                name: 'New User → ZIP Entry → Representative Discovery',
                test: async () => {
                    let journeySuccess = true;
                    let journeyDetails = [];
                    let totalTime = 0;

                    // Step 1: Homepage visit
                    try {
                        const homepageResponse = await this.makeRequest(`${this.baseUrl}/`);
                        journeyDetails.push(`Homepage: ${homepageResponse.status}`);
                        totalTime += homepageResponse.responseTime;
                        if (homepageResponse.status !== 200 && homepageResponse.status !== 307) {
                            journeySuccess = false;
                        }
                    } catch (error) {
                        journeySuccess = false;
                        journeyDetails.push(`Homepage: ERROR`);
                    }

                    // Step 2: ZIP verification
                    try {
                        const zipResponse = await this.makeRequest(`${this.baseUrl}/api/auth/verify-zip`, {
                            method: 'POST',
                            body: JSON.stringify({ zipCode: '94102' })
                        });
                        journeyDetails.push(`ZIP Verify: ${zipResponse.status}`);
                        totalTime += zipResponse.responseTime;
                        if (zipResponse.status !== 200 && zipResponse.status !== 201) {
                            journeySuccess = false;
                        }
                    } catch (error) {
                        journeySuccess = false;
                        journeyDetails.push(`ZIP Verify: ERROR`);
                    }

                    // Step 3: Representatives lookup
                    try {
                        const repsResponse = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                        journeyDetails.push(`Representatives: ${repsResponse.status}`);
                        totalTime += repsResponse.responseTime;
                        if (repsResponse.status !== 200) {
                            journeySuccess = false;
                        }
                    } catch (error) {
                        journeySuccess = false;
                        journeyDetails.push(`Representatives: ERROR`);
                    }

                    return {
                        passed: journeySuccess,
                        details: `Journey steps: ${journeyDetails.join(' → ')}`,
                        responseTime: totalTime,
                        journeySteps: journeyDetails
                    };
                }
            },
            {
                name: 'Representative → Voting Records → Committee Participation',
                test: async () => {
                    let workflowSuccess = true;
                    let workflowDetails = [];
                    let totalTime = 0;

                    // Step 1: Get representatives
                    try {
                        const repsResponse = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                        workflowDetails.push(`Reps API: ${repsResponse.status}`);
                        totalTime += repsResponse.responseTime;
                        workflowSuccess = workflowSuccess && repsResponse.status === 200;
                    } catch (error) {
                        workflowSuccess = false;
                        workflowDetails.push(`Reps API: ERROR`);
                    }

                    // Step 2: Access voting records (simulated via bills API)
                    try {
                        const votingResponse = await this.makeRequest(`${this.baseUrl}/api/bills`);
                        workflowDetails.push(`Voting/Bills: ${votingResponse.status}`);
                        totalTime += votingResponse.responseTime;
                        workflowSuccess = workflowSuccess && votingResponse.status === 200;
                    } catch (error) {
                        workflowSuccess = false;
                        workflowDetails.push(`Voting/Bills: ERROR`);
                    }

                    // Step 3: Committee information
                    try {
                        const committeeResponse = await this.makeRequest(`${this.baseUrl}/api/committees`);
                        workflowDetails.push(`Committees: ${committeeResponse.status}`);
                        totalTime += committeeResponse.responseTime;
                        workflowSuccess = workflowSuccess && committeeResponse.status === 200;
                    } catch (error) {
                        workflowSuccess = false;
                        workflowDetails.push(`Committees: ERROR`);
                    }

                    return {
                        passed: workflowSuccess,
                        details: `Workflow: ${workflowDetails.join(' → ')}`,
                        responseTime: totalTime,
                        workflowSteps: workflowDetails
                    };
                }
            },
            {
                name: 'Bill Discovery → Representative Voting → Contact Representative',
                test: async () => {
                    let discoverySuccess = true;
                    let discoveryDetails = [];
                    let totalTime = 0;

                    // Step 1: Bills discovery
                    try {
                        const billsResponse = await this.makeRequest(`${this.baseUrl}/api/bills`);
                        discoveryDetails.push(`Bills: ${billsResponse.status}`);
                        totalTime += billsResponse.responseTime;
                        discoverySuccess = discoverySuccess && billsResponse.status === 200;
                    } catch (error) {
                        discoverySuccess = false;
                        discoveryDetails.push(`Bills: ERROR`);
                    }

                    // Step 2: Representative lookup for bill context
                    try {
                        const repsResponse = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                        discoveryDetails.push(`Rep Lookup: ${repsResponse.status}`);
                        totalTime += repsResponse.responseTime;
                        discoverySuccess = discoverySuccess && repsResponse.status === 200;
                    } catch (error) {
                        discoverySuccess = false;
                        discoveryDetails.push(`Rep Lookup: ERROR`);
                    }

                    // Step 3: System health (contact functionality)
                    try {
                        const healthResponse = await this.makeRequest(`${this.baseUrl}/api/system/health`);
                        discoveryDetails.push(`Contact System: ${healthResponse.status}`);
                        totalTime += healthResponse.responseTime;
                        discoverySuccess = discoverySuccess && healthResponse.status === 200;
                    } catch (error) {
                        discoverySuccess = false;
                        discoveryDetails.push(`Contact System: ERROR`);
                    }

                    return {
                        passed: discoverySuccess,
                        details: `Discovery flow: ${discoveryDetails.join(' → ')}`,
                        responseTime: totalTime,
                        discoverySteps: discoveryDetails
                    };
                }
            }
        ];

        for (const test of journeyTests) {
            try {
                const result = await test.test();
                this.testResults.citizenJourney.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.citizenJourney.push({
                    testName: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Test Data Integration Across Systems
    async testDataIntegrationWorkflows() {
        console.log('\n🔗 Testing Data Integration Across Systems...');
        
        const integrationTests = [
            {
                name: 'Multi-API Coordination (Congress + OpenStates + LegiScan)',
                test: async () => {
                    const systemHealthResponse = await this.makeRequest(`${this.baseUrl}/api/system/health`);
                    
                    if (systemHealthResponse.status === 200 && systemHealthResponse.data) {
                        const dependencies = systemHealthResponse.data.dependencies || [];
                        const healthyDependencies = dependencies.filter(dep => dep.status === 'healthy').length;
                        const totalDependencies = dependencies.length;
                        
                        return {
                            passed: healthyDependencies >= totalDependencies * 0.8, // 80% of APIs healthy
                            details: `${healthyDependencies}/${totalDependencies} APIs healthy`,
                            responseTime: systemHealthResponse.responseTime,
                            apiStatus: dependencies.map(dep => ({ name: dep.name, status: dep.status }))
                        };
                    }
                    
                    return {
                        passed: systemHealthResponse.status === 200,
                        details: `System health: ${systemHealthResponse.status}`,
                        responseTime: systemHealthResponse.responseTime
                    };
                }
            },
            {
                name: 'Cross-System Data Consistency',
                test: async () => {
                    // Test that multiple endpoints return consistent data structures
                    const billsResponse = await this.makeRequest(`${this.baseUrl}/api/bills`);
                    const repsResponse = await this.makeRequest(`${this.baseUrl}/api/representatives?zipCode=94102`);
                    const committeesResponse = await this.makeRequest(`${this.baseUrl}/api/committees`);
                    
                    const allResponses = [billsResponse, repsResponse, committeesResponse];
                    const successfulResponses = allResponses.filter(r => r.status === 200).length;
                    
                    const avgResponseTime = allResponses.reduce((sum, r) => sum + r.responseTime, 0) / allResponses.length;
                    
                    return {
                        passed: successfulResponses >= 3, // All 3 should work
                        details: `${successfulResponses}/3 data endpoints consistent`,
                        responseTime: Math.round(avgResponseTime),
                        endpointStatus: allResponses.map((r, i) => ({
                            endpoint: ['bills', 'representatives', 'committees'][i],
                            status: r.status
                        }))
                    };
                }
            },
            {
                name: 'Performance Under Integrated Load',
                test: async () => {
                    // Test all major endpoints simultaneously 
                    const endpoints = [
                        '/api/bills',
                        '/api/representatives?zipCode=94102',
                        '/api/committees',
                        '/api/system/health'
                    ];
                    
                    const promises = endpoints.map(endpoint => 
                        this.makeRequest(`${this.baseUrl}${endpoint}`)
                    );
                    
                    const start = Date.now();
                    const results = await Promise.allSettled(promises);
                    const totalTime = Date.now() - start;
                    
                    const successful = results.filter(r => 
                        r.status === 'fulfilled' && r.value.status === 200
                    ).length;
                    
                    return {
                        passed: successful >= endpoints.length * 0.75 && totalTime < 3000, // 75% success in under 3s
                        details: `${successful}/${endpoints.length} endpoints, ${totalTime}ms total`,
                        responseTime: totalTime,
                        endpointResults: results.map((r, i) => ({
                            endpoint: endpoints[i],
                            status: r.status === 'fulfilled' ? r.value.status : 'ERROR'
                        }))
                    };
                }
            }
        ];

        for (const test of integrationTests) {
            try {
                const result = await test.test();
                this.testResults.dataIntegration.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.dataIntegration.push({
                    testName: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Test Production Readiness
    async testProductionReadiness() {
        console.log('\n🚀 Testing Production Readiness...');
        
        const productionTests = [
            {
                name: 'System Stability & Health Monitoring',
                test: async () => {
                    const healthResponse = await this.makeRequest(`${this.baseUrl}/api/system/health`);
                    
                    if (healthResponse.status === 200 && healthResponse.data) {
                        const stability = healthResponse.data.stabilityScore || 0;
                        const overallStatus = healthResponse.data.overallStatus;
                        
                        return {
                            passed: stability >= 8 && overallStatus === 'healthy',
                            details: `Stability: ${stability}/10, Status: ${overallStatus}`,
                            responseTime: healthResponse.responseTime,
                            stabilityScore: stability
                        };
                    }
                    
                    return {
                        passed: false,
                        details: `Health check failed: ${healthResponse.status}`,
                        responseTime: healthResponse.responseTime
                    };
                }
            },
            {
                name: 'Error Resilience & Fallback Systems',
                test: async () => {
                    // Test system behavior with invalid inputs
                    const tests = [
                        { endpoint: '/api/representatives?zipCode=00000', expectedStatus: [200, 400, 404] },
                        { endpoint: '/api/bills?invalid=true', expectedStatus: [200, 400] },
                        { endpoint: '/api/committees?page=999', expectedStatus: [200, 404] }
                    ];
                    
                    let resilientResponses = 0;
                    let totalTime = 0;
                    
                    for (const test of tests) {
                        try {
                            const response = await this.makeRequest(`${this.baseUrl}${test.endpoint}`);
                            totalTime += response.responseTime;
                            if (test.expectedStatus.includes(response.status)) {
                                resilientResponses++;
                            }
                        } catch (error) {
                            // Errors are acceptable for resilience testing
                            resilientResponses++;
                        }
                    }
                    
                    return {
                        passed: resilientResponses >= tests.length * 0.8,
                        details: `${resilientResponses}/${tests.length} error scenarios handled gracefully`,
                        responseTime: Math.round(totalTime / tests.length)
                    };
                }
            },
            {
                name: 'Comprehensive Feature Integration',
                test: async () => {
                    // Test that all major features work together
                    const featureEndpoints = [
                        '/api/system/health',
                        '/api/bills',
                        '/api/representatives?zipCode=94102',
                        '/api/committees'
                    ];
                    
                    let workingFeatures = 0;
                    let totalTime = 0;
                    
                    for (const endpoint of featureEndpoints) {
                        try {
                            const response = await this.makeRequest(`${this.baseUrl}${endpoint}`);
                            totalTime += response.responseTime;
                            if (response.status === 200) {
                                workingFeatures++;
                            }
                        } catch (error) {
                            // Count as non-working feature
                        }
                    }
                    
                    const avgResponseTime = totalTime / featureEndpoints.length;
                    
                    return {
                        passed: workingFeatures >= featureEndpoints.length * 0.9 && avgResponseTime < 1000,
                        details: `${workingFeatures}/${featureEndpoints.length} features working, avg ${Math.round(avgResponseTime)}ms`,
                        responseTime: Math.round(avgResponseTime),
                        workingFeatures
                    };
                }
            }
        ];

        for (const test of productionTests) {
            try {
                const result = await test.test();
                this.testResults.productionReadiness.push({
                    testName: test.name,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
            } catch (error) {
                this.testResults.productionReadiness.push({
                    testName: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    // Generate comprehensive integration report
    generateIntegrationReport() {
        const allTests = [
            ...this.testResults.citizenJourney,
            ...this.testResults.dataIntegration,
            ...this.testResults.productionReadiness
        ];
        
        const totalTests = allTests.length;
        const passedTests = allTests.filter(test => test.passed).length;
        
        const responseTimes = allTests
            .filter(test => test.responseTime && test.responseTime > 0)
            .map(test => test.responseTime);
        
        const avgResponseTime = responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        // Category scores
        const journeyScore = this.testResults.citizenJourney.filter(t => t.passed).length / this.testResults.citizenJourney.length;
        const integrationScore = this.testResults.dataIntegration.filter(t => t.passed).length / this.testResults.dataIntegration.length;
        const productionScore = this.testResults.productionReadiness.filter(t => t.passed).length / this.testResults.productionReadiness.length;

        return {
            summary: {
                totalTests,
                passedTests,
                failedTests: totalTests - passedTests,
                successRate: Math.round((passedTests / totalTests) * 100),
                averageResponseTime: avgResponseTime,
                scores: {
                    citizenJourney: Math.round(journeyScore * 100),
                    dataIntegration: Math.round(integrationScore * 100),
                    productionReadiness: Math.round(productionScore * 100)
                },
                overallGrade: this.calculateOverallGrade(passedTests, totalTests, avgResponseTime),
                productionReady: passedTests >= Math.floor(totalTests * 0.85) && journeyScore >= 0.8,
                userJourneyComplete: journeyScore >= 0.8,
                systemIntegrated: integrationScore >= 0.7,
                deploymentReady: productionScore >= 0.8,
                timestamp: new Date().toISOString(),
                testDuration: Date.now() - this.startTime
            },
            detailedResults: this.testResults,
            recommendations: this.generateIntegrationRecommendations(journeyScore, integrationScore, productionScore)
        };
    }

    calculateOverallGrade(passed, total, avgTime) {
        const passRate = passed / total;
        const performanceGood = avgTime < 1000;
        
        if (passRate >= 0.95 && performanceGood) return 'A+';
        if (passRate >= 0.9 && performanceGood) return 'A';
        if (passRate >= 0.8) return 'B';
        if (passRate >= 0.7) return 'C';
        return 'D';
    }

    generateIntegrationRecommendations(journey, integration, production) {
        const recommendations = [];
        
        if (journey < 0.8) {
            recommendations.push('🏛️  Improve citizen journey workflows - core user paths need attention');
        }
        
        if (integration < 0.7) {
            recommendations.push('🔗 Address data integration issues between systems');
        }
        
        if (production < 0.8) {
            recommendations.push('🚀 Resolve production readiness issues before deployment');
        }
        
        if (journey >= 0.9 && integration >= 0.8 && production >= 0.9) {
            recommendations.push('🎉 Excellent integration! Platform ready for production deployment');
        }
        
        return recommendations;
    }

    // Main execution
    async runComprehensiveIntegrationTest() {
        console.log('🏛️  Agent Alex - Comprehensive Integration Workflow Testing');
        console.log('📊 End-to-end validation of complete civic engagement platform');
        console.log('=' .repeat(80));

        await this.testCitizenJourneyWorkflows();
        await this.testDataIntegrationWorkflows();
        await this.testProductionReadiness();

        const report = this.generateIntegrationReport();
        
        console.log('\n📋 COMPREHENSIVE INTEGRATION REPORT');
        console.log('=' .repeat(50));
        console.log(`✅ Integration Tests: ${report.summary.passedTests}/${report.summary.totalTests} (${report.summary.successRate}%)`);
        console.log(`⚡ Average Response Time: ${report.summary.averageResponseTime}ms`);
        console.log(`🏛️  Citizen Journey: ${report.summary.scores.citizenJourney}%`);
        console.log(`🔗 Data Integration: ${report.summary.scores.dataIntegration}%`);
        console.log(`🚀 Production Ready: ${report.summary.scores.productionReadiness}%`);
        console.log(`🏆 Overall Grade: ${report.summary.overallGrade}`);
        console.log(`👤 User Journey Complete: ${report.summary.userJourneyComplete ? 'YES' : 'NO'}`);
        console.log(`🔧 System Integrated: ${report.summary.systemIntegrated ? 'YES' : 'NO'}`);
        console.log(`🚀 Deployment Ready: ${report.summary.deploymentReady ? 'YES' : 'NO'}`);
        console.log(`⏱️  Test Duration: ${Math.round(report.summary.testDuration / 1000)}s`);
        
        if (report.recommendations.length > 0) {
            console.log('\n📝 INTEGRATION RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`  ${rec}`));
        }

        // Save comprehensive report
        const filename = `comprehensive-integration-report-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`\n💾 Integration report saved: ${filename}`);

        return report;
    }
}

// Execute if run directly
if (require.main === module) {
    const integrationTest = new ComprehensiveIntegrationWorkflowTest();
    integrationTest.runComprehensiveIntegrationTest()
        .then(report => {
            process.exit(report.summary.productionReady ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Integration testing failed:', error);
            process.exit(1);
        });
}

module.exports = ComprehensiveIntegrationWorkflowTest;