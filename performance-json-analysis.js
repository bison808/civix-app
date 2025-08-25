#!/usr/bin/env node

/**
 * JSON Performance Impact Analysis
 * Agent Lisa - Performance & Bundle Architecture Specialist
 * 
 * Measures performance impact of JSON data loading vs UI timing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3020';

class JSONPerformanceAnalyzer {
    constructor() {
        this.results = {};
        this.browser = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=TranslateUI'
            ]
        });
    }

    async analyzePagePerformance(path, pageName) {
        const page = await this.browser.newPage();
        
        // Enable performance monitoring
        await page.evaluateOnNewDocument(() => {
            window.performanceData = {
                jsonRequests: [],
                navigationTiming: {},
                componentHydration: {},
                interactionDelays: []
            };

            // Monitor JSON API requests
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const startTime = performance.now();
                const url = args[0];
                
                return originalFetch.apply(this, args).then(response => {
                    const endTime = performance.now();
                    
                    if (url.includes('/api/')) {
                        window.performanceData.jsonRequests.push({
                            url: url,
                            duration: endTime - startTime,
                            size: response.headers.get('content-length'),
                            timestamp: startTime
                        });
                    }
                    
                    return response;
                });
            };

            // Monitor navigation timing
            window.addEventListener('load', () => {
                setTimeout(() => {
                    window.performanceData.navigationTiming = {
                        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                        load: performance.timing.loadEventEnd - performance.timing.navigationStart,
                        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
                        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
                    };
                }, 1000);
            });
        });

        // Navigate and measure
        const startTime = Date.now();
        
        try {
            const response = await page.goto(`${BASE_URL}${path}`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for React to hydrate and JSON to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Test navigation responsiveness BEFORE JSON loads
            const preJsonNavigation = await this.testNavigationResponsiveness(page);
            
            // Wait for potential JSON loading  
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test navigation responsiveness AFTER JSON loads
            const postJsonNavigation = await this.testNavigationResponsiveness(page);

            // Collect performance data
            const performanceData = await page.evaluate(() => window.performanceData);
            
            // Measure JavaScript execution time
            const jsExecutionTime = await page.evaluate(() => {
                const entries = performance.getEntriesByType('measure');
                return entries.reduce((total, entry) => total + entry.duration, 0);
            });

            // Check Core Web Vitals
            const webVitals = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const vitals = {};
                        
                        entries.forEach(entry => {
                            if (entry.name === 'FCP') vitals.fcp = entry.value;
                            if (entry.name === 'LCP') vitals.lcp = entry.value;
                            if (entry.name === 'FID') vitals.fid = entry.value;
                            if (entry.name === 'CLS') vitals.cls = entry.value;
                        });
                        
                        resolve(vitals);
                    }).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
                    
                    // Fallback timeout
                    setTimeout(() => resolve({}), 2000);
                });
            });

            this.results[pageName] = {
                path,
                loadTime: Date.now() - startTime,
                statusCode: response.status(),
                performanceData,
                jsExecutionTime,
                webVitals,
                navigation: {
                    preJson: preJsonNavigation,
                    postJson: postJsonNavigation,
                    degradation: postJsonNavigation.averageDelay - preJsonNavigation.averageDelay
                }
            };

        } catch (error) {
            this.results[pageName] = {
                path,
                error: error.message,
                loadTime: Date.now() - startTime,
                failed: true
            };
        }

        await page.close();
    }

    async testNavigationResponsiveness(page) {
        const delays = [];
        
        // Test multiple navigation interactions
        const navSelectors = [
            'nav a[href="/bills"]',
            'nav a[href="/committees"]', 
            'nav a[href="/dashboard"]',
            '.logo',
            'button'
        ];

        for (let selector of navSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    const startTime = performance.now();
                    await element.hover();
                    const endTime = performance.now();
                    delays.push(endTime - startTime);
                }
            } catch (e) {
                // Element not found, skip
            }
        }

        return {
            delays,
            averageDelay: delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0,
            maxDelay: Math.max(...delays, 0)
        };
    }

    async analyzeJSONImpact() {
        console.log('🔍 Analyzing JSON Performance Impact on UI Responsiveness...');
        
        // Test lightweight pages first
        await this.analyzePagePerformance('/', 'homepage');
        await this.analyzePagePerformance('/login', 'login');
        await this.analyzePagePerformance('/preview', 'preview');
        
        // Test JSON-heavy pages
        await this.analyzePagePerformance('/bills', 'bills');
        await this.analyzePagePerformance('/committees', 'committees');
        await this.analyzePagePerformance('/dashboard', 'dashboard');
    }

    async generateReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFile = `json-performance-analysis-${timestamp}.json`;

        const analysis = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(),
            detailedResults: this.results,
            recommendations: this.generateRecommendations()
        };

        fs.writeFileSync(reportFile, JSON.stringify(analysis, null, 2));
        console.log(`\n📊 JSON Performance Analysis saved to: ${reportFile}`);
        
        return analysis;
    }

    generateSummary() {
        const pages = Object.keys(this.results);
        const summary = {
            totalPages: pages.length,
            failedPages: pages.filter(p => this.results[p].failed).length,
            averageLoadTime: 0,
            jsonHeavyPages: [],
            lightweightPages: [],
            navigationDegradation: {}
        };

        const successfulPages = pages.filter(p => !this.results[p].failed);
        
        if (successfulPages.length > 0) {
            summary.averageLoadTime = successfulPages
                .reduce((sum, p) => sum + this.results[p].loadTime, 0) / successfulPages.length;

            // Categorize pages by JSON usage
            successfulPages.forEach(pageName => {
                const page = this.results[pageName];
                const jsonRequests = page.performanceData?.jsonRequests?.length || 0;
                
                if (jsonRequests > 2) {
                    summary.jsonHeavyPages.push({
                        name: pageName,
                        jsonRequests,
                        loadTime: page.loadTime,
                        navigationDegradation: page.navigation?.degradation || 0
                    });
                } else {
                    summary.lightweightPages.push({
                        name: pageName,
                        loadTime: page.loadTime,
                        navigationDegradation: page.navigation?.degradation || 0
                    });
                }

                summary.navigationDegradation[pageName] = page.navigation?.degradation || 0;
            });
        }

        return summary;
    }

    generateRecommendations() {
        const recs = [];
        
        const bills = this.results.bills;
        const committees = this.results.committees;
        const homepage = this.results.homepage;

        if (bills && !bills.failed) {
            const jsonCount = bills.performanceData?.jsonRequests?.length || 0;
            const navDegradation = bills.navigation?.degradation || 0;
            
            if (jsonCount > 3) {
                recs.push({
                    priority: 'HIGH',
                    page: 'bills',
                    issue: `${jsonCount} JSON requests detected`,
                    impact: `Navigation degradation: ${navDegradation.toFixed(2)}ms`,
                    recommendation: 'Implement JSON response caching and pagination'
                });
            }
        }

        if (committees && !committees.failed) {
            const jsonCount = committees.performanceData?.jsonRequests?.length || 0;
            const navDegradation = committees.navigation?.degradation || 0;
            
            if (jsonCount > 3) {
                recs.push({
                    priority: 'HIGH', 
                    page: 'committees',
                    issue: `${jsonCount} JSON requests detected`,
                    impact: `Navigation degradation: ${navDegradation.toFixed(2)}ms`,
                    recommendation: 'Implement lazy loading for committee data'
                });
            }
        }

        // Compare with lightweight page performance
        if (homepage && bills && committees) {
            const homepageTime = homepage.loadTime;
            const billsTime = bills.loadTime;
            const committeesTime = committees.loadTime;

            if (billsTime > homepageTime * 2) {
                recs.push({
                    priority: 'CRITICAL',
                    page: 'bills',
                    issue: `${(billsTime/homepageTime).toFixed(1)}x slower than homepage`,
                    impact: 'Poor user experience on primary feature page',
                    recommendation: 'Optimize JSON data loading strategy'
                });
            }

            if (committeesTime > homepageTime * 2) {
                recs.push({
                    priority: 'CRITICAL',
                    page: 'committees', 
                    issue: `${(committeesTime/homepageTime).toFixed(1)}x slower than homepage`,
                    impact: 'Poor user experience on primary feature page',
                    recommendation: 'Implement progressive loading for committee data'
                });
            }
        }

        return recs;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

async function main() {
    const analyzer = new JSONPerformanceAnalyzer();
    
    try {
        await analyzer.init();
        await analyzer.analyzeJSONImpact();
        const analysis = await analyzer.generateReport();
        
        console.log('\n🎯 JSON PERFORMANCE ANALYSIS SUMMARY:');
        console.log('=====================================');
        console.log(`Total pages analyzed: ${analysis.summary.totalPages}`);
        console.log(`Failed pages: ${analysis.summary.failedPages}`);
        console.log(`Average load time: ${analysis.summary.averageLoadTime.toFixed(0)}ms`);
        console.log(`JSON-heavy pages: ${analysis.summary.jsonHeavyPages.length}`);
        console.log(`Lightweight pages: ${analysis.summary.lightweightPages.length}`);
        
        console.log('\n🚨 CRITICAL NAVIGATION DEGRADATION:');
        Object.entries(analysis.summary.navigationDegradation).forEach(([page, degradation]) => {
            if (degradation > 50) {
                console.log(`❌ ${page}: +${degradation.toFixed(1)}ms navigation delay`);
            } else if (degradation > 20) {
                console.log(`⚠️  ${page}: +${degradation.toFixed(1)}ms navigation delay`);
            } else {
                console.log(`✅ ${page}: +${degradation.toFixed(1)}ms navigation delay`);
            }
        });
        
        if (analysis.recommendations.length > 0) {
            console.log('\n📋 RECOMMENDATIONS:');
            analysis.recommendations.forEach((rec, i) => {
                console.log(`${i + 1}. [${rec.priority}] ${rec.page}: ${rec.issue}`);
                console.log(`   Impact: ${rec.impact}`);
                console.log(`   Fix: ${rec.recommendation}\n`);
            });
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    } finally {
        await analyzer.cleanup();
    }
}

if (require.main === module) {
    main();
}

module.exports = { JSONPerformanceAnalyzer };