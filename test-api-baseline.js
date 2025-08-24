/**
 * CITZN API Baseline Test Suite
 * Tests existing API functionality before legislative expansion
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

class APIBaselineTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            zipValidation: [],
            apiEndpoints: [],
            authFlow: [],
            dataIntegrity: [],
            errors: []
        };
        this.apiKey = process.env.CONGRESS_API_KEY;
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const lib = isHttps ? https : http;
            
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': 'CITZN-Test-Suite/1.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 10000
            };

            const req = lib.request(requestOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = data ? JSON.parse(data) : null;
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: jsonData,
                            raw: data
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: null,
                            raw: data,
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

    async testZipValidationAPI() {
        console.log('🔍 Testing ZIP code validation API...');
        
        const testZips = [
            { zip: '90210', expected: 'valid', location: 'Beverly Hills, CA' },
            { zip: '10001', expected: 'valid', location: 'New York, NY' },
            { zip: '30309', expected: 'valid', location: 'Atlanta, GA' },
            { zip: '00000', expected: 'invalid' },
            { zip: 'abcde', expected: 'invalid' }
        ];

        for (const testCase of testZips) {
            try {
                // Test ZIP validation endpoint
                const response = await this.makeRequest(`${this.baseUrl}/api/validate-zip`, {
                    method: 'POST',
                    body: { zipCode: testCase.zip }
                });

                const result = {
                    zip: testCase.zip,
                    expected: testCase.expected,
                    status: response.status,
                    valid: response.data?.valid || false,
                    city: response.data?.city || null,
                    state: response.data?.state || null,
                    passed: (response.status === 200 && response.data?.valid && testCase.expected === 'valid') ||
                           (!response.data?.valid && testCase.expected === 'invalid')
                };

                this.testResults.zipValidation.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${testCase.zip}: ${result.valid ? 'valid' : 'invalid'} (${result.city}, ${result.state})`);
                
            } catch (error) {
                console.error(`❌ Error testing ZIP ${testCase.zip}:`, error.message);
                this.testResults.errors.push(`ZIP validation error: ${error.message}`);
            }
        }
    }

    async testAPIEndpoints() {
        console.log('\n🔗 Testing API endpoints...');
        
        const endpoints = [
            { path: '/api/health', method: 'GET', name: 'Health Check' },
            { path: '/api/representatives', method: 'GET', name: 'Representatives' },
            { path: '/api/bills', method: 'GET', name: 'Bills' },
            { path: '/api/committees', method: 'GET', name: 'Committees' },
            { path: '/api/auth/status', method: 'GET', name: 'Auth Status' }
        ];

        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now();
                const response = await this.makeRequest(`${this.baseUrl}${endpoint.path}`, {
                    method: endpoint.method
                });
                const responseTime = Date.now() - startTime;

                const result = {
                    path: endpoint.path,
                    name: endpoint.name,
                    status: response.status,
                    responseTime: responseTime,
                    hasData: response.data !== null,
                    passed: response.status === 200 || response.status === 401, // 401 is OK for protected endpoints
                    error: response.parseError || null
                };

                this.testResults.apiEndpoints.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${endpoint.name}: ${response.status} (${responseTime}ms)`);
                
            } catch (error) {
                console.error(`❌ Error testing ${endpoint.path}:`, error.message);
                this.testResults.errors.push(`API endpoint error: ${error.message}`);
            }
        }
    }

    async testCongressAPI() {
        console.log('\n🏛️ Testing Congress API integration...');
        
        try {
            if (!this.apiKey) {
                console.log('  ⚠️ No Congress API key found - skipping external API tests');
                return;
            }

            // Test Congress API directly
            const billsResponse = await this.makeRequest('https://api.congress.gov/v3/bill?api_key=' + this.apiKey);
            
            const result = {
                endpoint: 'Congress API Bills',
                status: billsResponse.status,
                hasData: billsResponse.data && billsResponse.data.bills && billsResponse.data.bills.length > 0,
                billCount: billsResponse.data?.bills?.length || 0,
                passed: billsResponse.status === 200 && billsResponse.data?.bills
            };

            this.testResults.apiEndpoints.push(result);
            console.log(`  ${result.passed ? '✅' : '❌'} Congress API: ${result.status} (${result.billCount} bills)`);
            
        } catch (error) {
            console.error('❌ Error testing Congress API:', error.message);
            this.testResults.errors.push(`Congress API error: ${error.message}`);
        }
    }

    async testDataIntegrity() {
        console.log('\n📊 Testing data integrity...');
        
        try {
            // Check if configuration files exist
            const configFiles = [
                './next.config.js',
                './package.json',
                './.env.local',
                './app/layout.tsx'
            ];

            for (const file of configFiles) {
                const exists = fs.existsSync(file);
                const result = {
                    file: file,
                    exists: exists,
                    passed: exists
                };

                this.testResults.dataIntegrity.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${file}: ${exists ? 'exists' : 'missing'}`);
            }

            // Check environment variables
            const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'CONGRESS_API_KEY'];
            for (const envVar of requiredEnvVars) {
                const value = process.env[envVar];
                const result = {
                    variable: envVar,
                    hasValue: !!value,
                    passed: !!value
                };

                this.testResults.dataIntegrity.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${envVar}: ${value ? 'set' : 'not set'}`);
            }
            
        } catch (error) {
            console.error('❌ Error testing data integrity:', error.message);
            this.testResults.errors.push(`Data integrity error: ${error.message}`);
        }
    }

    async checkServerHealth() {
        console.log('🏥 Checking server health...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/api/health`);
            
            if (response.status === 200) {
                console.log('  ✅ Server is healthy and responding');
                return true;
            } else {
                console.log(`  ❌ Server health check failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            // Try the main page if health endpoint doesn't exist
            try {
                const pageResponse = await this.makeRequest(this.baseUrl);
                if (pageResponse.status === 200) {
                    console.log('  ✅ Server is responding (main page)');
                    return true;
                }
            } catch (pageError) {
                console.error('❌ Server is not responding:', error.message);
                return false;
            }
        }
        return false;
    }

    async runAllTests() {
        console.log('🎯 Starting CITZN API Baseline Test Suite\n');
        
        const serverHealthy = await this.checkServerHealth();
        if (!serverHealthy) {
            console.log('❌ Server not responding - stopping tests');
            return;
        }

        try {
            await this.testZipValidationAPI();
            await this.testAPIEndpoints();
            await this.testCongressAPI();
            await this.testDataIntegrity();
        } catch (error) {
            console.error('❌ Test suite error:', error);
        }

        await this.generateReport();
    }

    async generateReport() {
        console.log('\n📊 API BASELINE TEST REPORT');
        console.log('===========================\n');

        // ZIP Validation Results
        console.log('🔍 ZIP VALIDATION API:');
        const zipPassed = this.testResults.zipValidation.filter(t => t.passed).length;
        const zipTotal = this.testResults.zipValidation.length;
        console.log(`  ✅ Passed: ${zipPassed}/${zipTotal}`);
        
        // API Endpoints Results
        console.log('\n🔗 API ENDPOINTS:');
        const apiPassed = this.testResults.apiEndpoints.filter(t => t.passed).length;
        const apiTotal = this.testResults.apiEndpoints.length;
        console.log(`  ✅ Passed: ${apiPassed}/${apiTotal}`);
        this.testResults.apiEndpoints.forEach(test => {
            console.log(`    ${test.passed ? '✅' : '❌'} ${test.name || test.endpoint}: ${test.status}`);
        });

        // Data Integrity Results
        console.log('\n📊 DATA INTEGRITY:');
        const dataPassed = this.testResults.dataIntegrity.filter(t => t.passed).length;
        const dataTotal = this.testResults.dataIntegrity.length;
        console.log(`  ✅ Passed: ${dataPassed}/${dataTotal}`);

        // Error Summary
        console.log('\n❌ ERRORS:');
        console.log(`  Total errors: ${this.testResults.errors.length}`);
        this.testResults.errors.forEach(error => {
            console.log(`    • ${error}`);
        });

        // Overall Summary
        const totalPassed = zipPassed + apiPassed + dataPassed;
        const totalTests = zipTotal + apiTotal + dataTotal;
        const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        console.log('\n🎯 OVERALL API BASELINE SUMMARY:');
        console.log(`  ✅ Tests passed: ${totalPassed}/${totalTests} (${passRate}%)`);
        console.log(`  ❌ Errors encountered: ${this.testResults.errors.length}`);
        console.log(`  📈 API baseline status: ${passRate >= 70 ? 'GOOD' : 'NEEDS ATTENTION'}`);
        
        // Save results
        fs.writeFileSync('api-baseline-results.json', JSON.stringify(this.testResults, null, 2));
        console.log('\n💾 Results saved to api-baseline-results.json');
    }
}

// Run the tests
if (require.main === module) {
    const tester = new APIBaselineTester();
    tester.runAllTests().catch(console.error);
}

module.exports = APIBaselineTester;