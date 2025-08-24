/**
 * CITZN Baseline Political Mapping Functionality Test Suite
 * Tests existing ZIP-to-representative functionality before legislative expansion
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

class BaselineFunctionalityTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            zipCodeValidation: [],
            politicalMapping: [],
            representativeData: [],
            navigation: [],
            performance: [],
            errors: []
        };
    }

    async initialize() {
        console.log('🚀 Initializing baseline functionality tests...\n');
        
        try {
            this.browser = await puppeteer.launch({ 
                headless: false, // Show browser for debugging
                devtools: false,
                slowMo: 100,
                args: ['--no-sandbox', '--disable-web-security']
            });
            this.page = await this.browser.newPage();
            
            // Set viewport for mobile-first testing
            await this.page.setViewport({ width: 375, height: 667 });
            
            // Enable request interception to monitor API calls
            await this.page.setRequestInterception(true);
            this.page.on('request', (request) => {
                console.log(`📡 API Request: ${request.method()} ${request.url()}`);
                request.continue();
            });

            // Monitor console errors
            this.page.on('console', (msg) => {
                if (msg.type() === 'error') {
                    this.testResults.errors.push(`Console Error: ${msg.text()}`);
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize browser:', error);
            return false;
        }
    }

    async testZipCodeValidation() {
        console.log('🔍 Testing ZIP code validation...');
        
        const testCases = [
            { zip: '90210', expected: 'valid', description: 'Valid CA ZIP' },
            { zip: '10001', expected: 'valid', description: 'Valid NY ZIP' },
            { zip: '00000', expected: 'invalid', description: 'Invalid ZIP' },
            { zip: '1234', expected: 'invalid', description: 'Too short' },
            { zip: '123456', expected: 'invalid', description: 'Too long' },
            { zip: 'abcde', expected: 'invalid', description: 'Non-numeric' }
        ];

        for (const testCase of testCases) {
            try {
                await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
                
                // Find ZIP input
                await this.page.waitForSelector('#zipCode', { timeout: 5000 });
                
                // Clear and enter ZIP
                await this.page.click('#zipCode');
                await this.page.keyboard.press('Control+KeyA');
                await this.page.type('#zipCode', testCase.zip);
                
                // Submit form
                await this.page.click('button[type="submit"]');
                
                // Wait for response
                await this.page.waitForTimeout(2000);
                
                // Check for validation result
                const errorElement = await this.page.$('.text-red-600');
                const successElement = await this.page.$('.text-green-600');
                
                const result = {
                    zip: testCase.zip,
                    description: testCase.description,
                    expected: testCase.expected,
                    actual: errorElement ? 'invalid' : 'valid',
                    passed: (errorElement && testCase.expected === 'invalid') || 
                           (successElement && testCase.expected === 'valid')
                };
                
                this.testResults.zipCodeValidation.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${testCase.description}: ${result.actual}`);
                
            } catch (error) {
                console.error(`❌ Error testing ZIP ${testCase.zip}:`, error);
                this.testResults.errors.push(`ZIP validation error: ${error.message}`);
            }
        }
    }

    async testPoliticalMapping() {
        console.log('\n🏛️ Testing political mapping functionality...');
        
        const testZips = ['90210', '10001', '30309', '60601', '78701'];
        
        for (const zip of testZips) {
            try {
                await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
                
                // Enter valid ZIP
                await this.page.waitForSelector('#zipCode');
                await this.page.click('#zipCode');
                await this.page.keyboard.press('Control+KeyA');
                await this.page.type('#zipCode', zip);
                await this.page.click('button[type="submit"]');
                
                // Wait for location confirmation
                await this.page.waitForSelector('.text-green-600', { timeout: 10000 });
                
                // Check location display
                const locationText = await this.page.$eval('p', el => el.textContent);
                const hasValidLocation = locationText && locationText.includes(zip);
                
                // Navigate to representatives
                const continueButton = await this.page.$('button:contains("Browse Bills & Representatives")') ||
                                     await this.page.$('button:contains("Get Started")');
                
                if (continueButton) {
                    await continueButton.click();
                    await this.page.waitForTimeout(3000);
                }
                
                const result = {
                    zip: zip,
                    locationFound: hasValidLocation,
                    navigationWorked: this.page.url() !== this.baseUrl,
                    passed: hasValidLocation
                };
                
                this.testResults.politicalMapping.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${zip}: Location ${hasValidLocation ? 'found' : 'not found'}`);
                
            } catch (error) {
                console.error(`❌ Error mapping ZIP ${zip}:`, error);
                this.testResults.errors.push(`Political mapping error: ${error.message}`);
            }
        }
    }

    async testRepresentativeData() {
        console.log('\n👥 Testing representative data retrieval...');
        
        try {
            // Go to representatives page directly
            await this.page.goto(`${this.baseUrl}/representatives`, { waitUntil: 'networkidle0' });
            
            // Check if page loads
            const pageTitle = await this.page.title();
            console.log(`  📄 Page title: ${pageTitle}`);
            
            // Look for representative cards or data
            const repElements = await this.page.$$('[data-testid="representative-card"]') ||
                               await this.page.$$('.representative') ||
                               await this.page.$$('[class*="rep"]');
            
            const result = {
                pageLoaded: pageTitle.toLowerCase().includes('representative'),
                dataFound: repElements && repElements.length > 0,
                count: repElements ? repElements.length : 0,
                passed: repElements && repElements.length > 0
            };
            
            this.testResults.representativeData.push(result);
            console.log(`  ${result.passed ? '✅' : '❌'} Representatives data: ${result.count} items found`);
            
        } catch (error) {
            console.error('❌ Error testing representative data:', error);
            this.testResults.errors.push(`Representative data error: ${error.message}`);
        }
    }

    async testNavigation() {
        console.log('\n🧭 Testing navigation functionality...');
        
        const routes = [
            { path: '/', name: 'Landing' },
            { path: '/feed', name: 'Feed' },
            { path: '/representatives', name: 'Representatives' },
            { path: '/bills', name: 'Bills' },
            { path: '/committees', name: 'Committees' },
            { path: '/dashboard', name: 'Dashboard' }
        ];
        
        for (const route of routes) {
            try {
                const startTime = Date.now();
                await this.page.goto(`${this.baseUrl}${route.path}`, { waitUntil: 'networkidle0' });
                const loadTime = Date.now() - startTime;
                
                const pageLoaded = !this.page.url().includes('404') && 
                                 !await this.page.$('text=Page not found');
                
                const result = {
                    route: route.path,
                    name: route.name,
                    loaded: pageLoaded,
                    loadTime: loadTime,
                    passed: pageLoaded && loadTime < 5000 // 5 second timeout
                };
                
                this.testResults.navigation.push(result);
                console.log(`  ${result.passed ? '✅' : '❌'} ${route.name} (${route.path}): ${loadTime}ms`);
                
            } catch (error) {
                console.error(`❌ Error testing route ${route.path}:`, error);
                this.testResults.errors.push(`Navigation error: ${error.message}`);
            }
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing performance metrics...');
        
        try {
            // Test main page load time
            const startTime = Date.now();
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            const loadTime = Date.now() - startTime;
            
            // Get Web Vitals
            const metrics = await this.page.evaluate(() => {
                return new Promise((resolve) => {
                    if ('performance' in window) {
                        const navigation = performance.getEntriesByType('navigation')[0];
                        resolve({
                            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                        });
                    } else {
                        resolve({});
                    }
                });
            });
            
            const result = {
                pageLoadTime: loadTime,
                domContentLoaded: metrics.domContentLoaded || 0,
                firstPaint: metrics.firstPaint || 0,
                firstContentfulPaint: metrics.firstContentfulPaint || 0,
                passed: loadTime < 3000 // 3 second target
            };
            
            this.testResults.performance.push(result);
            console.log(`  ${result.passed ? '✅' : '❌'} Page load: ${loadTime}ms`);
            console.log(`  📊 FCP: ${result.firstContentfulPaint.toFixed(0)}ms`);
            
        } catch (error) {
            console.error('❌ Error testing performance:', error);
            this.testResults.errors.push(`Performance error: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🎯 Starting CITZN Baseline Functionality Test Suite\n');
        
        const success = await this.initialize();
        if (!success) return;
        
        try {
            await this.testZipCodeValidation();
            await this.testPoliticalMapping();
            await this.testRepresentativeData();
            await this.testNavigation();
            await this.testPerformance();
        } catch (error) {
            console.error('❌ Test suite error:', error);
        }
        
        await this.generateReport();
        await this.cleanup();
    }

    async generateReport() {
        console.log('\n📊 BASELINE FUNCTIONALITY TEST REPORT');
        console.log('=====================================\n');
        
        // ZIP Code Validation Results
        console.log('🔍 ZIP CODE VALIDATION:');
        const zipPassed = this.testResults.zipCodeValidation.filter(t => t.passed).length;
        const zipTotal = this.testResults.zipCodeValidation.length;
        console.log(`  ✅ Passed: ${zipPassed}/${zipTotal}`);
        this.testResults.zipCodeValidation.forEach(test => {
            console.log(`    ${test.passed ? '✅' : '❌'} ${test.description}`);
        });
        
        // Political Mapping Results
        console.log('\n🏛️ POLITICAL MAPPING:');
        const mapPassed = this.testResults.politicalMapping.filter(t => t.passed).length;
        const mapTotal = this.testResults.politicalMapping.length;
        console.log(`  ✅ Passed: ${mapPassed}/${mapTotal}`);
        
        // Navigation Results
        console.log('\n🧭 NAVIGATION:');
        const navPassed = this.testResults.navigation.filter(t => t.passed).length;
        const navTotal = this.testResults.navigation.length;
        console.log(`  ✅ Passed: ${navPassed}/${navTotal}`);
        
        // Performance Results
        console.log('\n⚡ PERFORMANCE:');
        const perfPassed = this.testResults.performance.filter(t => t.passed).length;
        const perfTotal = this.testResults.performance.length;
        console.log(`  ✅ Passed: ${perfPassed}/${perfTotal}`);
        
        // Error Summary
        console.log('\n❌ ERRORS:');
        console.log(`  Total errors: ${this.testResults.errors.length}`);
        this.testResults.errors.forEach(error => {
            console.log(`    • ${error}`);
        });
        
        // Overall Summary
        const totalPassed = zipPassed + mapPassed + navPassed + perfPassed;
        const totalTests = zipTotal + mapTotal + navTotal + perfTotal;
        const passRate = ((totalPassed / totalTests) * 100).toFixed(1);
        
        console.log('\n🎯 OVERALL SUMMARY:');
        console.log(`  ✅ Tests passed: ${totalPassed}/${totalTests} (${passRate}%)`);
        console.log(`  ❌ Errors encountered: ${this.testResults.errors.length}`);
        console.log(`  📈 Baseline functionality status: ${passRate >= 80 ? 'GOOD' : 'NEEDS ATTENTION'}`);
        
        // Save detailed results to file
        require('fs').writeFileSync(
            'baseline-test-results.json', 
            JSON.stringify(this.testResults, null, 2)
        );
        console.log('\n💾 Detailed results saved to baseline-test-results.json');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('\n🏁 Baseline functionality testing completed.\n');
    }
}

// Run the tests
if (require.main === module) {
    const tester = new BaselineFunctionalityTester();
    tester.runAllTests().catch(console.error);
}

module.exports = BaselineFunctionalityTester;