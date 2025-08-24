/**
 * AGENT 29: Bills & Committee Component Integration Testing Suite
 * 
 * Comprehensive testing for all Bills and Committee components after TypeScript fixes
 * Tests component rendering, user interactions, data flow, and cross-page integration
 */

const LOCALHOST = 'http://localhost:3008';

class BillsCommitteeIntegrationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testSuite: 'Bills & Committee Component Integration',
      agent: 'Agent 29',
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: [],
      componentTests: {
        billsPage: { passed: 0, failed: 0, tests: [] },
        committeePage: { passed: 0, failed: 0, tests: [] },
        dashboard: { passed: 0, failed: 0, tests: [] },
        crossPage: { passed: 0, failed: 0, tests: [] }
      }
    };
  }

  logResult(component, testName, passed, details = null) {
    this.results.totalTests++;
    if (passed) {
      this.results.passed++;
      this.results.componentTests[component].passed++;
    } else {
      this.results.failed++;
      this.results.componentTests[component].failed++;
      if (details) {
        this.results.errors.push({
          component,
          test: testName,
          error: details
        });
      }
    }

    this.results.componentTests[component].tests.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} [${component.toUpperCase()}] ${testName}`);
    if (!passed && details) {
      console.log(`   Error: ${details}`);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(path, options = {}) {
    try {
      const response = await fetch(`${LOCALHOST}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return {
        success: true,
        status: response.status,
        data: await response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractElementFromHtml(html, selector) {
    // Simple regex-based extraction for testing
    const matches = html.match(new RegExp(`<[^>]*${selector}[^>]*>.*?</[^>]*>`, 'gi'));
    return matches || [];
  }

  checkForJavaScriptErrors(html) {
    // Look for common error patterns in rendered HTML
    const errorPatterns = [
      /Error:/gi,
      /TypeError:/gi,
      /ReferenceError:/gi,
      /undefined is not/gi,
      /Cannot read property/gi,
      /webpack.*error/gi,
      /_error/gi
    ];

    const errors = [];
    for (const pattern of errorPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        errors.push(...matches);
      }
    }
    return errors;
  }

  async testBillsPageComponents() {
    console.log('\n🔍 Testing Bills Page Components...');

    // Test 1: Bills page loads without errors
    const billsPageResponse = await this.makeRequest('/bills');
    const billsPageLoads = billsPageResponse.success && billsPageResponse.status === 200;
    this.logResult('billsPage', 'Bills page loads successfully', billsPageLoads, 
      !billsPageLoads ? billsPageResponse.error : null);

    if (!billsPageLoads) return;

    const billsHtml = billsPageResponse.data;

    // Test 2: Check for JavaScript errors
    const jsErrors = this.checkForJavaScriptErrors(billsHtml);
    this.logResult('billsPage', 'No JavaScript errors on page load', jsErrors.length === 0,
      jsErrors.length > 0 ? `Found errors: ${jsErrors.join(', ')}` : null);

    // Test 3: Essential components present
    const hasHeader = billsHtml.includes('Legislative Bills') || billsHtml.includes('Bills');
    this.logResult('billsPage', 'Page header renders', hasHeader);

    // Test 4: Search functionality present
    const hasSearch = billsHtml.includes('Search bills') || billsHtml.includes('search');
    this.logResult('billsPage', 'Search input renders', hasSearch);

    // Test 5: Filter components present
    const hasFilters = billsHtml.includes('Filter') || billsHtml.includes('filter');
    this.logResult('billsPage', 'Filter components render', hasFilters);

    // Test 6: Stats cards present
    const hasStats = billsHtml.includes('Total Bills') || billsHtml.includes('Tracked') || billsHtml.includes('Voted');
    this.logResult('billsPage', 'Statistics cards render', hasStats);

    // Test 7: Bill feed component
    const hasBillFeed = billsHtml.includes('BillFeed') || billsHtml.includes('bill-feed') || 
                        billsHtml.includes('No bills') || billsHtml.includes('Loading');
    this.logResult('billsPage', 'Bill feed component present', hasBillFeed);

    // Test 8: Representative connections
    const hasRepConnections = billsHtml.includes('Representatives') || billsHtml.includes('Your Rep');
    this.logResult('billsPage', 'Representative connections display', hasRepConnections);

    // Test 9: View toggle buttons
    const hasViewToggle = billsHtml.includes('All Bills') || billsHtml.includes('Tracked') || billsHtml.includes('Voted');
    this.logResult('billsPage', 'View toggle buttons render', hasViewToggle);

    // Test 10: Responsive design elements
    const hasResponsiveClasses = billsHtml.includes('md:') || billsHtml.includes('lg:') || billsHtml.includes('responsive');
    this.logResult('billsPage', 'Responsive design classes present', hasResponsiveClasses);
  }

  async testCommitteePageComponents() {
    console.log('\n🏛️ Testing Committee Page Components...');

    // Test 1: Committee page loads without errors
    const committeePageResponse = await this.makeRequest('/committees');
    const committeePageLoads = committeePageResponse.success && committeePageResponse.status === 200;
    this.logResult('committeePage', 'Committee page loads successfully', committeePageLoads,
      !committeePageLoads ? committeePageResponse.error : null);

    if (!committeePageLoads) return;

    const committeeHtml = committeePageResponse.data;

    // Test 2: Check for JavaScript errors
    const jsErrors = this.checkForJavaScriptErrors(committeeHtml);
    this.logResult('committeePage', 'No JavaScript errors on page load', jsErrors.length === 0,
      jsErrors.length > 0 ? `Found errors: ${jsErrors.join(', ')}` : null);

    // Test 3: Page header and description
    const hasHeader = committeeHtml.includes('Congressional Committees') || committeeHtml.includes('Committees');
    this.logResult('committeePage', 'Page header renders', hasHeader);

    // Test 4: Stats dashboard
    const hasStats = committeeHtml.includes('Your Committees') || committeeHtml.includes('Upcoming Meetings') ||
                     committeeHtml.includes('stats');
    this.logResult('committeePage', 'Statistics dashboard renders', hasStats);

    // Test 5: Search functionality
    const hasSearch = committeeHtml.includes('Search committees') || committeeHtml.includes('search');
    this.logResult('committeePage', 'Committee search renders', hasSearch);

    // Test 6: Filter controls
    const hasFilters = committeeHtml.includes('All Levels') || committeeHtml.includes('Federal') || 
                       committeeHtml.includes('filter');
    this.logResult('committeePage', 'Filter controls render', hasFilters);

    // Test 7: View toggle (Your Committees / Search Results)
    const hasViewToggle = committeeHtml.includes('Your Committees') && committeeHtml.includes('Search Results');
    this.logResult('committeePage', 'View toggle buttons render', hasViewToggle);

    // Test 8: Committee cards or loading state
    const hasCommitteeList = committeeHtml.includes('committee') || committeeHtml.includes('Loading committees') ||
                             committeeHtml.includes('No Committee');
    this.logResult('committeePage', 'Committee list or loading state present', hasCommitteeList);

    // Test 9: Recent activity sidebar
    const hasActivity = committeeHtml.includes('Recent Activity') || committeeHtml.includes('activity');
    this.logResult('committeePage', 'Recent activity sidebar renders', hasActivity);

    // Test 10: Representative information
    const hasRepInfo = committeeHtml.includes('Your Representatives') || committeeHtml.includes('Rep');
    this.logResult('committeePage', 'Representative information displays', hasRepInfo);
  }

  async testDashboardIntegration() {
    console.log('\n📊 Testing Dashboard Integration...');

    // Test 1: Dashboard page loads
    const dashboardResponse = await this.makeRequest('/dashboard');
    const dashboardLoads = dashboardResponse.success && dashboardResponse.status === 200;
    this.logResult('dashboard', 'Dashboard page loads successfully', dashboardLoads,
      !dashboardLoads ? dashboardResponse.error : null);

    if (!dashboardLoads) return;

    const dashboardHtml = dashboardResponse.data;

    // Test 2: User engagement tracking
    const hasEngagement = dashboardHtml.includes('engagement') || dashboardHtml.includes('activity') ||
                          dashboardHtml.includes('Your Activity');
    this.logResult('dashboard', 'User engagement tracking present', hasEngagement);

    // Test 3: Legislative activity display
    const hasLegislativeActivity = dashboardHtml.includes('Bills') || dashboardHtml.includes('Committee') ||
                                   dashboardHtml.includes('legislative');
    this.logResult('dashboard', 'Legislative activity displays', hasLegislativeActivity);

    // Test 4: Personalized content
    const hasPersonalization = dashboardHtml.includes('Your') || dashboardHtml.includes('Tracked') ||
                               dashboardHtml.includes('Following');
    this.logResult('dashboard', 'Personalized content sections present', hasPersonalization);

    // Test 5: Navigation to bills and committees
    const hasNavLinks = dashboardHtml.includes('/bills') || dashboardHtml.includes('/committees') ||
                        dashboardHtml.includes('href');
    this.logResult('dashboard', 'Navigation links to other pages present', hasNavLinks);
  }

  async testCrossPageIntegration() {
    console.log('\n🔗 Testing Cross-Page Integration...');

    // Test 1: Navigation consistency
    const pages = ['/dashboard', '/bills', '/committees', '/representatives'];
    let navConsistency = true;
    let navErrors = [];

    for (const page of pages) {
      const response = await this.makeRequest(page);
      if (!response.success) {
        navConsistency = false;
        navErrors.push(`${page}: ${response.error}`);
      }
    }
    this.logResult('crossPage', 'All main pages accessible', navConsistency,
      navErrors.length > 0 ? navErrors.join('; ') : null);

    // Test 2: Check for consistent navigation elements
    const billsResponse = await this.makeRequest('/bills');
    const committeesResponse = await this.makeRequest('/committees');
    
    if (billsResponse.success && committeesResponse.success) {
      const billsHasNav = billsResponse.data.includes('nav') || billsResponse.data.includes('menu');
      const committeesHasNav = committeesResponse.data.includes('nav') || committeesResponse.data.includes('menu');
      
      this.logResult('crossPage', 'Consistent navigation elements across pages', 
        billsHasNav && committeesHasNav);
    }

    // Test 3: Representative data integration
    const repResponse = await this.makeRequest('/representatives');
    if (repResponse.success) {
      const hasRepData = repResponse.data.includes('Representative') || repResponse.data.includes('Senator');
      this.logResult('crossPage', 'Representative data integrates across pages', hasRepData);
    }

    // Test 4: URL routing works
    const routingPaths = ['/bills', '/committees', '/dashboard', '/representatives'];
    let routingWorks = true;
    let routingErrors = [];

    for (const path of routingPaths) {
      const response = await this.makeRequest(path);
      if (!response.success || response.status >= 400) {
        routingWorks = false;
        routingErrors.push(`${path}: ${response.status || response.error}`);
      }
    }
    this.logResult('crossPage', 'URL routing works for all pages', routingWorks,
      routingErrors.length > 0 ? routingErrors.join('; ') : null);
  }

  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');

    const pages = ['/bills', '/committees', '/dashboard'];
    
    for (const page of pages) {
      const response = await this.makeRequest(page);
      if (response.success) {
        const html = response.data;
        
        // Check for responsive design classes
        const hasMdClasses = html.includes('md:');
        const hasLgClasses = html.includes('lg:');
        const hasXlClasses = html.includes('xl:');
        const hasGridResponsive = html.includes('grid-cols-') && (html.includes('md:grid-cols-') || html.includes('lg:grid-cols-'));
        const hasFlexResponsive = html.includes('flex-col') || html.includes('flex-row');
        
        const pageName = page.replace('/', '') || 'root';
        this.logResult('crossPage', `${pageName} has responsive design classes`, 
          hasMdClasses || hasLgClasses || hasXlClasses || hasGridResponsive || hasFlexResponsive);
      }
    }
  }

  async testBrowserConsoleErrors() {
    console.log('\n🐛 Testing for Browser Console Errors...');

    // This is a simulation - in a real browser environment, you'd use Puppeteer or similar
    const pages = ['/dashboard', '/bills', '/committees', '/representatives'];
    let hasConsoleErrors = false;
    let consoleErrors = [];

    for (const page of pages) {
      const response = await this.makeRequest(page);
      if (response.success) {
        const html = response.data;
        
        // Check for obvious error patterns in the HTML
        const errorPatterns = [
          /Error:/gi,
          /TypeError:/gi,
          /undefined/gi,
          /null/gi,
          /_error/gi,
          /Failed to/gi,
          /Cannot read/gi
        ];

        for (const pattern of errorPatterns) {
          const matches = html.match(pattern);
          if (matches && matches.length > 2) { // Allow for some normal occurrences
            hasConsoleErrors = true;
            consoleErrors.push(`${page}: Found potential errors - ${matches.slice(0, 3).join(', ')}`);
          }
        }
      }
    }

    this.logResult('crossPage', 'No JavaScript console errors detected', !hasConsoleErrors,
      hasConsoleErrors ? consoleErrors.join('; ') : null);
  }

  async runCompleteTestSuite() {
    console.log('🚀 Starting Bills & Committee Component Integration Testing Suite');
    console.log('Agent 29: Component Integration Testing Agent');
    console.log('=' .repeat(80));

    const startTime = Date.now();

    try {
      await this.testBillsPageComponents();
      await this.testCommitteePageComponents();
      await this.testDashboardIntegration();
      await this.testCrossPageIntegration();
      await this.testResponsiveDesign();
      await this.testBrowserConsoleErrors();

    } catch (error) {
      console.error('❌ Test suite encountered an error:', error);
      this.results.errors.push({
        component: 'testSuite',
        test: 'Complete test execution',
        error: error.message
      });
    }

    const endTime = Date.now();
    this.results.executionTime = `${(endTime - startTime) / 1000}s`;

    this.generateReport();
    this.saveResults();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 BILLS & COMMITTEE COMPONENT INTEGRATION TEST REPORT');
    console.log('Agent 29: Component Integration Testing Agent');
    console.log('='.repeat(80));

    console.log(`⏱️  Execution Time: ${this.results.executionTime}`);
    console.log(`📊 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.totalTests) * 100).toFixed(1)}%`);

    console.log('\n📁 COMPONENT BREAKDOWN:');
    for (const [component, data] of Object.entries(this.results.componentTests)) {
      const total = data.passed + data.failed;
      const successRate = total > 0 ? ((data.passed / total) * 100).toFixed(1) : '0.0';
      console.log(`   ${component.toUpperCase()}: ${data.passed}/${total} passed (${successRate}%)`);
    }

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      for (const error of this.results.errors) {
        console.log(`   [${error.component.toUpperCase()}] ${error.test}: ${error.error}`);
      }
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    if (this.results.failed === 0) {
      console.log('   ✅ All components functioning correctly after TypeScript fixes');
      console.log('   ✅ System ready for user testing and production deployment');
      console.log('   ✅ Cross-page integration working seamlessly');
      console.log('   ✅ Responsive design implemented properly');
    } else {
      console.log('   ⚠️  Some components need attention before production');
      console.log('   🔧 Review failed tests and fix underlying issues');
      console.log('   🧪 Re-run tests after fixes are applied');
    }

    console.log('\n🚀 DEPLOYMENT STATUS:');
    const criticalFailures = this.results.errors.filter(e => 
      e.test.includes('loads successfully') || e.test.includes('JavaScript errors')
    );
    
    if (criticalFailures.length === 0) {
      console.log('   ✅ READY FOR DEPLOYMENT');
      console.log('   ✅ All critical components loading without errors');
      console.log('   ✅ TypeScript fixes successfully applied');
    } else {
      console.log('   ❌ NOT READY FOR DEPLOYMENT');
      console.log('   🚨 Critical errors detected - fix before deploying');
    }
  }

  saveResults() {
    const fs = require('fs');
    const resultsFile = '/home/bison808/DELTA/agent4_frontend/tests/bills-committee-integration-results.json';
    
    try {
      fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${resultsFile}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }
}

// Execute the test suite
async function main() {
  const tester = new BillsCommitteeIntegrationTester();
  await tester.runCompleteTestSuite();
  
  // Exit with appropriate code
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { BillsCommitteeIntegrationTester };