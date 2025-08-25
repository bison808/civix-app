#!/usr/bin/env node

/**
 * CITZN Phase 1 Beta - Comprehensive User Experience Validation
 * Agent 38: User Experience & Integration Validation Specialist
 * 
 * Complete end-to-end user journey testing with real data validation
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PRODUCTION_URL = 'https://civix-app.vercel.app'; // TODO: Update to CITZN domain when available
const LOCAL_URL = 'http://localhost:3012';

// Test ZIP codes for comprehensive coverage
const TEST_ZIP_CODES = [
  '95060', // Santa Cruz, CA - Primary test location
  '90210', // Beverly Hills, CA - High profile area
  '94102', // San Francisco, CA - Nancy Pelosi district
  '92109', // San Diego, CA - Different region
  '95814', // Sacramento, CA - State capital
  '90025', // West LA - Ted Lieu district
  '91801', // Alhambra, CA - Judy Chu district
  '95113'  // San Jose, CA - Tech hub
];

class UXValidationSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      userJourneyTests: {},
      dataConsistency: {},
      errorHandling: {},
      performance: {},
      accessibility: {},
      mobileResponsiveness: {},
      overallScore: 0
    };
  }

  async initialize() {
    console.log('🚀 Initializing CITZN UX Validation Suite...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Visual debugging
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Enable performance monitoring
    await this.page.coverage.startCSSCoverage();
    await this.page.coverage.startJSCoverage();
    
    console.log('✅ Browser initialized');
  }

  async testCompleteUserJourneys() {
    console.log('\n📍 Testing Complete User Journey Flows...');
    
    for (const zipCode of TEST_ZIP_CODES) {
      console.log(`\n🔍 Testing ZIP code: ${zipCode}`);
      
      const journeyResult = await this.testSingleUserJourney(zipCode);
      this.results.userJourneyTests[zipCode] = journeyResult;
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async testSingleUserJourney(zipCode) {
    const journey = {
      zipCode,
      steps: {},
      dataValidation: {},
      performance: {},
      errors: []
    };

    try {
      // Step 1: Landing Page
      console.log('  📱 Step 1: Landing page load...');
      const startTime = Date.now();
      
      await this.page.goto(PRODUCTION_URL, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      const landingLoadTime = Date.now() - startTime;
      journey.performance.landingPageLoad = landingLoadTime;
      journey.steps.landingPage = await this.validateLandingPage();

      // Step 2: ZIP Code Entry
      console.log('  🏠 Step 2: ZIP code entry...');
      const zipResult = await this.testZipCodeEntry(zipCode);
      journey.steps.zipCodeEntry = zipResult;

      // Step 3: Representative Discovery
      console.log('  👥 Step 3: Representative discovery...');
      const repResult = await this.testRepresentativeDiscovery();
      journey.steps.representativeDiscovery = repResult;

      // Step 4: Bill Tracking
      console.log('  📄 Step 4: Bill tracking functionality...');
      const billResult = await this.testBillTracking();
      journey.steps.billTracking = billResult;

      // Step 5: Committee Exploration
      console.log('  🏛️ Step 5: Committee exploration...');
      const committeeResult = await this.testCommitteeExploration();
      journey.steps.committeeExploration = committeeResult;

      // Step 6: Dashboard Personalization
      console.log('  📊 Step 6: Dashboard personalization...');
      const dashboardResult = await this.testDashboardPersonalization();
      journey.steps.dashboardPersonalization = dashboardResult;

      // Real data validation across all steps
      journey.dataValidation = await this.validateRealDataUsage();

    } catch (error) {
      console.error(`❌ Error in user journey for ${zipCode}:`, error.message);
      journey.errors.push({
        step: 'general',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return journey;
  }

  async validateLandingPage() {
    const result = {
      loaded: false,
      hasRealContent: false,
      hasPlaceholders: false,
      placeholderContent: [],
      realContent: [],
      loadTime: 0,
      errors: []
    };

    try {
      // Check for basic page structure
      const title = await this.page.title();
      result.loaded = title.includes('CITZN') || title.includes('CIVIX');

      // Check for placeholder content
      const placeholderSelectors = [
        'text="Lorem ipsum"',
        'text="Placeholder"',
        'text="TODO"',
        'text="Coming Soon"',
        'text="Sample"',
        '[placeholder*="placeholder"]'
      ];

      for (const selector of placeholderSelectors) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 0) {
            result.hasPlaceholders = true;
            result.placeholderContent.push(selector);
          }
        } catch (e) {
          // Selector not found is expected
        }
      }

      // Check for real content indicators
      const realContentSelectors = [
        'input[placeholder*="ZIP"]',
        'text="Get Started"',
        'text="Representatives"',
        'text="Bills"',
        'text="Committees"'
      ];

      for (const selector of realContentSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            result.hasRealContent = true;
            result.realContent.push(selector);
          }
        } catch (e) {
          // Expected for missing elements
        }
      }

      // Test ZIP code input functionality
      const zipInput = await this.page.$('input[type="text"]');
      if (zipInput) {
        result.hasZipInput = true;
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  async testZipCodeEntry(zipCode) {
    const result = {
      zipCode,
      entrySuccessful: false,
      responseTime: 0,
      dataReturned: false,
      realData: false,
      representatives: [],
      errors: []
    };

    try {
      const startTime = Date.now();

      // Find ZIP code input
      const zipInput = await this.page.$('input[type="text"], input[placeholder*="ZIP"], input[placeholder*="zip"]');
      
      if (!zipInput) {
        result.errors.push('ZIP code input not found');
        return result;
      }

      // Clear and enter ZIP code
      await zipInput.click({ clickCount: 3 }); // Select all
      await zipInput.type(zipCode);
      
      // Submit ZIP code
      const submitButton = await this.page.$('button:contains("Get Started"), button:contains("Submit"), button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
      } else {
        await this.page.keyboard.press('Enter');
      }

      // Wait for response
      await this.page.waitForSelector('.representative, .bill, .loading, .error', { timeout: 10000 });
      
      result.responseTime = Date.now() - startTime;
      result.entrySuccessful = true;

      // Check for data returned
      const dataElements = await this.page.$$('.representative, .bill, [data-testid*="rep"], [data-testid*="bill"]');
      result.dataReturned = dataElements.length > 0;

      // Validate real vs placeholder data
      if (result.dataReturned) {
        const textContent = await this.page.evaluate(() => document.body.innerText);
        result.realData = !textContent.includes('Sample') && 
                         !textContent.includes('Placeholder') && 
                         !textContent.includes('Lorem ipsum');
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  async testRepresentativeDiscovery() {
    const result = {
      representativesFound: false,
      realRepresentatives: false,
      contactInfoAvailable: false,
      profilesAccessible: false,
      dataConsistent: true,
      representatives: [],
      errors: []
    };

    try {
      // Look for representative elements
      const repElements = await this.page.$$('.representative, [data-testid*="rep"], .rep-card');
      result.representativesFound = repElements.length > 0;

      if (result.representativesFound) {
        // Validate representative data
        for (let i = 0; i < Math.min(repElements.length, 3); i++) {
          const repElement = repElements[i];
          const repData = await this.page.evaluate(el => ({
            name: el.textContent.match(/[A-Z][a-z]+ [A-Z][a-z]+/)?.[0] || '',
            title: el.textContent.includes('Senator') || el.textContent.includes('Representative'),
            hasContact: el.textContent.includes('@') || el.textContent.includes('phone')
          }), repElement);

          result.representatives.push(repData);
          
          if (repData.name && repData.name !== 'Sample Name') {
            result.realRepresentatives = true;
          }
          
          if (repData.hasContact) {
            result.contactInfoAvailable = true;
          }
        }

        // Test profile accessibility
        const profileLinks = await this.page.$$('a[href*="/representative"], a[href*="/rep/"], .rep-profile-link');
        if (profileLinks.length > 0) {
          result.profilesAccessible = true;
        }
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  async testBillTracking() {
    const result = {
      billsVisible: false,
      realBills: false,
      trackingFunctional: false,
      simplificationAvailable: false,
      bills: [],
      errors: []
    };

    try {
      // Navigate to bills section if not already there
      const billsLink = await this.page.$('a[href*="/bills"], nav a:contains("Bills"), .bills-nav');
      if (billsLink) {
        await billsLink.click();
        await this.page.waitForSelector('.bill, [data-testid*="bill"]', { timeout: 5000 });
      }

      // Check for bill elements
      const billElements = await this.page.$$('.bill, [data-testid*="bill"], .bill-card');
      result.billsVisible = billElements.length > 0;

      if (result.billsVisible) {
        // Validate bill data
        for (let i = 0; i < Math.min(billElements.length, 3); i++) {
          const billElement = billElements[i];
          const billData = await this.page.evaluate(el => ({
            title: el.textContent.match(/[A-Z]+\s\d+/)?.[0] || '',
            hasDescription: el.textContent.length > 100,
            hasStatus: el.textContent.includes('Passed') || el.textContent.includes('Pending')
          }), billElement);

          result.bills.push(billData);
          
          if (billData.title && !billData.title.includes('Sample')) {
            result.realBills = true;
          }
        }

        // Test tracking functionality
        const trackButtons = await this.page.$$('button:contains("Track"), button:contains("Follow"), .track-button');
        result.trackingFunctional = trackButtons.length > 0;

        // Test simplification
        const simplifyElements = await this.page.$$('.simplified, .ai-summary, [data-testid*="simple"]');
        result.simplificationAvailable = simplifyElements.length > 0;
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  async testCommitteeExploration() {
    const result = {
      committeesVisible: false,
      realCommittees: false,
      membershipAccurate: false,
      committees: [],
      errors: []
    };

    try {
      // Navigate to committees section
      const committeesLink = await this.page.$('a[href*="/committees"], nav a:contains("Committees"), .committees-nav');
      if (committeesLink) {
        await committeesLink.click();
        await this.page.waitForSelector('.committee, [data-testid*="committee"]', { timeout: 5000 });
      }

      // Check for committee elements
      const committeeElements = await this.page.$$('.committee, [data-testid*="committee"], .committee-card');
      result.committeesVisible = committeeElements.length > 0;

      if (result.committeesVisible) {
        // Validate committee data
        for (let i = 0; i < Math.min(committeeElements.length, 3); i++) {
          const committeeElement = committeeElements[i];
          const committeeData = await this.page.evaluate(el => ({
            name: el.textContent.match(/Committee on [A-Z][a-z\s]+/)?.[0] || '',
            hasMembers: el.textContent.includes('Members') || el.textContent.includes('Chair'),
            hasBills: el.textContent.includes('Bill') || el.textContent.includes('HR')
          }), committeeElement);

          result.committees.push(committeeData);
          
          if (committeeData.name && !committeeData.name.includes('Sample')) {
            result.realCommittees = true;
          }
          
          if (committeeData.hasMembers) {
            result.membershipAccurate = true;
          }
        }
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  async testDashboardPersonalization() {
    const result = {
      dashboardAccessible: false,
      personalizationFeatures: false,
      userPreferences: false,
      trackingHistory: false,
      errors: []
    };

    try {
      // Navigate to dashboard
      const dashboardLink = await this.page.$('a[href*="/dashboard"], nav a:contains("Dashboard"), .dashboard-nav');
      if (dashboardLink) {
        await dashboardLink.click();
        await this.page.waitForSelector('.dashboard, [data-testid*="dashboard"]', { timeout: 5000 });
        result.dashboardAccessible = true;

        // Check personalization features
        const personalizedElements = await this.page.$$('.personalized, .user-specific, .tracked-bills, .my-representatives');
        result.personalizationFeatures = personalizedElements.length > 0;

        // Check user preferences
        const preferencesElements = await this.page.$$('.preferences, .settings, .notification-settings');
        result.userPreferences = preferencesElements.length > 0;

        // Check tracking history
        const historyElements = await this.page.$$('.history, .tracking-history, .engagement-history');
        result.trackingHistory = historyElements.length > 0;
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  async validateRealDataUsage() {
    const validation = {
      noPlaceholderContent: true,
      realRepresentativeData: true,
      realBillData: true,
      realCommitteeData: true,
      placeholdersFound: [],
      errors: []
    };

    try {
      // Get all page text content
      const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase());

      // Check for common placeholder patterns
      const placeholderPatterns = [
        'lorem ipsum',
        'placeholder',
        'sample data',
        'todo',
        'coming soon',
        'test user',
        'example.com',
        'dummy data',
        'fake',
        '[name]',
        '[title]',
        'john doe',
        'jane smith'
      ];

      placeholderPatterns.forEach(pattern => {
        if (pageText.includes(pattern)) {
          validation.noPlaceholderContent = false;
          validation.placeholdersFound.push(pattern);
        }
      });

      // Validate specific data types
      const representativeNames = await this.page.$$eval('.representative-name, .rep-name', 
        elements => elements.map(el => el.textContent)
      ).catch(() => []);

      const billTitles = await this.page.$$eval('.bill-title, .bill-name', 
        elements => elements.map(el => el.textContent)
      ).catch(() => []);

      // Check if data looks real (has proper formatting, reasonable content)
      validation.realRepresentativeData = representativeNames.every(name => 
        name.length > 5 && !name.includes('Sample') && !name.includes('Test')
      );

      validation.realBillData = billTitles.every(title => 
        title.length > 10 && (title.includes('HR') || title.includes('S.') || title.includes('AB'))
      );

    } catch (error) {
      validation.errors.push(error.message);
    }

    return validation;
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling Scenarios...');
    
    const errorTests = {
      invalidZipCodes: [],
      networkFailures: {},
      apiTimeouts: {},
      malformedData: {},
      errors: []
    };

    try {
      // Test invalid ZIP codes
      const invalidZips = ['00000', '99999', 'ABCDE', '123'];
      
      for (const invalidZip of invalidZips) {
        console.log(`  🚫 Testing invalid ZIP: ${invalidZip}`);
        
        await this.page.goto(PRODUCTION_URL);
        const zipInput = await this.page.$('input[type="text"]');
        
        if (zipInput) {
          await zipInput.click({ clickCount: 3 });
          await zipInput.type(invalidZip);
          await this.page.keyboard.press('Enter');
          
          // Wait for error handling
          await this.page.waitForTimeout(3000);
          
          const errorMessage = await this.page.$('.error-message, .alert-error, .invalid-zip');
          const hasGracefulError = errorMessage !== null;
          
          errorTests.invalidZipCodes.push({
            zipCode: invalidZip,
            hasGracefulError,
            errorMessage: hasGracefulError ? await errorMessage.textContent() : null
          });
        }
      }

      // Test network simulation (if possible in browser context)
      console.log('  🌐 Testing network failure scenarios...');
      await this.page.setOfflineMode(true);
      await this.page.reload();
      await this.page.waitForTimeout(5000);
      
      const offlineHandling = await this.page.$('.offline-message, .network-error');
      errorTests.networkFailures.hasOfflineHandling = offlineHandling !== null;
      
      await this.page.setOfflineMode(false);

    } catch (error) {
      errorTests.errors.push(error.message);
    }

    this.results.errorHandling = errorTests;
  }

  async performPerformanceAndLoadTesting() {
    console.log('\n⚡ Performing Performance and Load Testing...');
    
    const performance = {
      loadTimes: {},
      coreWebVitals: {},
      apiResponseTimes: {},
      concurrentUserSimulation: {},
      errors: []
    };

    try {
      // Test initial page load performance
      console.log('  📊 Measuring page load performance...');
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await this.page.goto(PRODUCTION_URL, { waitUntil: 'networkidle2' });
        const loadTime = Date.now() - startTime;
        
        performance.loadTimes[`run_${i + 1}`] = loadTime;
      }

      performance.loadTimes.average = Object.values(performance.loadTimes)
        .reduce((a, b) => a + b, 0) / 5;

      // Measure Core Web Vitals
      const metrics = await this.page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const vitals = {};
            for (const entry of list.getEntries()) {
              vitals[entry.name] = entry.value;
            }
            resolve(vitals);
          }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
          
          // Timeout after 10 seconds
          setTimeout(() => resolve({}), 10000);
        });
      });

      performance.coreWebVitals = metrics;

      // Test API response times
      console.log('  🔌 Testing API response times...');
      
      const apiTests = [
        () => this.testZipCodeEntry('95060'),
        () => this.testRepresentativeDiscovery(),
        () => this.testBillTracking()
      ];

      for (const [index, test] of apiTests.entries()) {
        const startTime = Date.now();
        await test();
        const responseTime = Date.now() - startTime;
        performance.apiResponseTimes[`test_${index + 1}`] = responseTime;
      }

    } catch (error) {
      performance.errors.push(error.message);
    }

    this.results.performance = performance;
  }

  async validateMobileResponsivenessAndAccessibility() {
    console.log('\n📱 Validating Mobile Responsiveness and Accessibility...');
    
    const validation = {
      mobileResponsiveness: {},
      accessibility: {},
      touchInteractions: {},
      screenReaderSupport: {},
      errors: []
    };

    try {
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'iPhone_SE' },
        { width: 414, height: 896, name: 'iPhone_XR' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];

      for (const viewport of viewports) {
        console.log(`  📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await this.page.setViewport(viewport);
        await this.page.goto(PRODUCTION_URL);
        
        // Test responsive behavior
        const mobileMenuVisible = await this.page.$('.mobile-menu, .hamburger-menu') !== null;
        const contentOverflow = await this.page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        validation.mobileResponsiveness[viewport.name] = {
          mobileMenuVisible,
          contentOverflow,
          responsive: !contentOverflow
        };
      }

      // Reset to desktop viewport for accessibility testing
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.goto(PRODUCTION_URL);

      // Test accessibility features
      console.log('  ♿ Testing accessibility compliance...');
      
      // Check for proper heading structure
      const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', 
        elements => elements.map(el => ({ tag: el.tagName, text: el.textContent }))
      );
      
      validation.accessibility.properHeadingStructure = headings.length > 0;

      // Check for alt text on images
      const imagesWithoutAlt = await this.page.$$eval('img:not([alt])', 
        elements => elements.length
      );
      
      validation.accessibility.altTextCompliance = imagesWithoutAlt === 0;

      // Check for keyboard navigation support
      const focusableElements = await this.page.$$eval(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
        elements => elements.length
      );
      
      validation.accessibility.keyboardNavigation = focusableElements > 0;

      // Test screen reader support
      const ariaLabels = await this.page.$$eval('[aria-label], [aria-labelledby], [aria-describedby]',
        elements => elements.length
      );
      
      validation.screenReaderSupport.ariaSupport = ariaLabels > 0;

    } catch (error) {
      validation.errors.push(error.message);
    }

    this.results.mobileResponsiveness = validation.mobileResponsiveness;
    this.results.accessibility = validation.accessibility;
  }

  calculateOverallScore() {
    console.log('\n📊 Calculating Overall UX Score...');
    
    let totalScore = 0;
    let maxScore = 0;

    // User Journey Score (40% weight)
    let journeyScore = 0;
    let journeyMax = 0;
    
    Object.values(this.results.userJourneyTests).forEach(journey => {
      Object.values(journey.steps).forEach(step => {
        if (typeof step === 'object' && step.errors) {
          journeyMax += 10;
          journeyScore += step.errors.length === 0 ? 10 : 5;
        }
      });
    });
    
    totalScore += (journeyScore / journeyMax) * 40;
    maxScore += 40;

    // Performance Score (25% weight)
    const avgLoadTime = this.results.performance?.loadTimes?.average || 5000;
    const performanceScore = Math.max(0, 25 - (avgLoadTime / 200)); // 200ms = 1 point deduction
    totalScore += Math.min(performanceScore, 25);
    maxScore += 25;

    // Accessibility Score (20% weight)
    let accessibilityScore = 0;
    if (this.results.accessibility?.properHeadingStructure) accessibilityScore += 7;
    if (this.results.accessibility?.altTextCompliance) accessibilityScore += 6;
    if (this.results.accessibility?.keyboardNavigation) accessibilityScore += 7;
    totalScore += accessibilityScore;
    maxScore += 20;

    // Mobile Responsiveness Score (15% weight)
    let mobileScore = 0;
    Object.values(this.results.mobileResponsiveness || {}).forEach(viewport => {
      if (viewport.responsive) mobileScore += 3.75; // 15/4 viewports
    });
    totalScore += mobileScore;
    maxScore += 15;

    this.results.overallScore = Math.round((totalScore / maxScore) * 100);
    
    console.log(`📈 Overall UX Score: ${this.results.overallScore}/100`);
  }

  async generateComprehensiveReport() {
    console.log('\n📋 Generating Comprehensive Validation Report...');
    
    const report = {
      ...this.results,
      summary: {
        testDate: this.results.timestamp,
        totalZipCodesTested: Object.keys(this.results.userJourneyTests).length,
        overallScore: this.results.overallScore,
        criticalIssues: [],
        recommendations: [],
        productionReadiness: this.results.overallScore >= 85
      }
    };

    // Identify critical issues
    Object.entries(this.results.userJourneyTests).forEach(([zipCode, journey]) => {
      if (journey.errors.length > 0) {
        report.summary.criticalIssues.push(`ZIP ${zipCode}: ${journey.errors[0].error}`);
      }
      
      if (journey.dataValidation?.placeholdersFound?.length > 0) {
        report.summary.criticalIssues.push(`ZIP ${zipCode}: Placeholder content found - ${journey.dataValidation.placeholdersFound.join(', ')}`);
      }
    });

    // Generate recommendations
    if (this.results.performance?.loadTimes?.average > 2000) {
      report.summary.recommendations.push('Optimize page load times - currently averaging ' + Math.round(this.results.performance.loadTimes.average) + 'ms');
    }

    if (!this.results.accessibility?.altTextCompliance) {
      report.summary.recommendations.push('Add alt text to all images for accessibility compliance');
    }

    const mobileIssues = Object.entries(this.results.mobileResponsiveness || {})
      .filter(([name, viewport]) => !viewport.responsive);
    
    if (mobileIssues.length > 0) {
      report.summary.recommendations.push(`Fix mobile responsiveness issues on: ${mobileIssues.map(([name]) => name).join(', ')}`);
    }

    // Save comprehensive report
    const reportPath = path.join(__dirname, `ux-validation-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📁 Report saved to: ${reportPath}`);
    
    // Generate summary console output
    this.printSummary(report);
    
    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CITZN PHASE 1 BETA - UX VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`📅 Test Date: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🏆 Overall Score: ${report.overallScore}/100`);
    console.log(`🗳️ ZIP Codes Tested: ${report.summary.totalZipCodesTested}`);
    console.log(`🚀 Production Ready: ${report.summary.productionReadiness ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📊 DETAILED SCORES:');
    console.log('─'.repeat(40));
    
    // User Journey Success Rate
    const successfulJourneys = Object.values(this.results.userJourneyTests)
      .filter(journey => journey.errors.length === 0).length;
    const journeySuccessRate = Math.round((successfulJourneys / Object.keys(this.results.userJourneyTests).length) * 100);
    console.log(`👤 User Journey Success: ${journeySuccessRate}%`);
    
    // Performance
    const avgLoadTime = this.results.performance?.loadTimes?.average || 0;
    console.log(`⚡ Avg Load Time: ${Math.round(avgLoadTime)}ms`);
    
    // Accessibility
    const accessibilityFeatures = Object.values(this.results.accessibility || {})
      .filter(feature => feature === true).length;
    console.log(`♿ Accessibility Features: ${accessibilityFeatures}/3`);
    
    // Mobile Responsiveness
    const responsiveViewports = Object.values(this.results.mobileResponsiveness || {})
      .filter(viewport => viewport.responsive).length;
    console.log(`📱 Mobile Responsive: ${responsiveViewports}/4 viewports`);

    if (report.summary.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      console.log('─'.repeat(40));
      report.summary.criticalIssues.forEach(issue => console.log(`❌ ${issue}`));
    }

    if (report.summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('─'.repeat(40));
      report.summary.recommendations.forEach(rec => console.log(`🔧 ${rec}`));
    }

    console.log('\n' + '='.repeat(80));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }

  async runFullValidationSuite() {
    try {
      await this.initialize();
      await this.testCompleteUserJourneys();
      await this.testErrorHandling();
      await this.performPerformanceAndLoadTesting();
      await this.validateMobileResponsivenessAndAccessibility();
      this.calculateOverallScore();
      
      const report = await this.generateComprehensiveReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ Validation suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run validation suite
async function main() {
  console.log('🚀 Starting CITZN Phase 1 Beta UX Validation Suite...');
  console.log('Agent 38: User Experience & Integration Validation Specialist');
  console.log('Target: Complete end-to-end user experience validation\n');

  const validator = new UXValidationSuite();
  
  try {
    const report = await validator.runFullValidationSuite();
    
    console.log('\n✅ Validation suite completed successfully!');
    
    // Return exit code based on production readiness
    process.exit(report.summary.productionReadiness ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Validation suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = UXValidationSuite;