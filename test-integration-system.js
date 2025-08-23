#!/usr/bin/env node

/**
 * COMPREHENSIVE INTEGRATION TEST SUITE
 * Tests the complete CITZN Political Mapping System
 * 
 * This suite validates end-to-end integration of:
 * - ZIP code geocoding
 * - Federal representatives lookup
 * - State representatives (CA Assembly/Senate)
 * - County officials mapping
 * - Municipal/local officials
 * - Data quality monitoring
 * - Error handling and fallback mechanisms
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds per test
  retries: 3,
  parallelTests: false, // Set to true for faster execution, false for detailed logs
  outputFile: 'integration-test-results.json',
  performanceThresholds: {
    zipLookup: 500, // ms
    representativeLookup: 1000, // ms
    completeFlow: 2000 // ms
  }
};

// Test data - California ZIP codes covering different scenarios
const TEST_ZIP_CODES = [
  // Major cities
  { zip: '90210', city: 'Beverly Hills', county: 'Los Angeles', type: 'urban' },
  { zip: '94102', city: 'San Francisco', county: 'San Francisco', type: 'urban' },
  { zip: '95814', city: 'Sacramento', county: 'Sacramento', type: 'capital' },
  { zip: '92101', city: 'San Diego', county: 'San Diego', type: 'urban' },
  { zip: '95110', city: 'San Jose', county: 'Santa Clara', type: 'tech_hub' },
  
  // Rural areas
  { zip: '93514', city: 'Bishop', county: 'Inyo', type: 'rural' },
  { zip: '96161', city: 'Truckee', county: 'Nevada', type: 'rural' },
  
  // Edge cases
  { zip: '93940', city: 'Monterey', county: 'Monterey', type: 'coastal' },
  { zip: '92373', city: 'Redlands', county: 'San Bernardino', type: 'suburban' },
  
  // Invalid/edge cases
  { zip: '99999', city: 'Invalid', county: 'Invalid', type: 'invalid' },
  { zip: '12345', city: 'Out of State', county: 'Out of State', type: 'out_of_state' }
];

// Test results tracking
const testResults = {
  timestamp: new Date().toISOString(),
  config: TEST_CONFIG,
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: []
  },
  performance: {
    averageResponseTime: 0,
    slowestOperation: null,
    fastestOperation: null,
    operationTimes: []
  },
  integrationTests: {},
  serviceTests: {},
  uiTests: {},
  dataQualityTests: {}
};

/**
 * Utility functions
 */
class TestUtils {
  static async withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), timeoutMs)
      )
    ]);
  }

  static async measureTime(operation) {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      return { result, duration, error: null };
    } catch (error) {
      const duration = Date.now() - start;
      return { result: null, duration, error };
    }
  }

  static logTest(testName, status, details = null) {
    const timestamp = new Date().toISOString();
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'SKIP' ? '⏭️' : '🔄';
    console.log(`${icon} [${timestamp}] ${testName}: ${status}`);
    if (details) {
      console.log(`   ${details}`);
    }
  }

  static validateRepresentativeData(rep, level = 'unknown') {
    const required = ['id', 'name', 'title'];
    const missing = required.filter(field => !rep[field]);
    
    if (missing.length > 0) {
      return { valid: false, errors: [`Missing required fields: ${missing.join(', ')}`] };
    }

    const errors = [];
    if (!rep.party || !['Democratic', 'Republican', 'Independent', 'Democrat', 'GOP'].some(p => rep.party.includes(p))) {
      errors.push('Invalid or missing party information');
    }

    if (level === 'federal' && !rep.bioguideId) {
      errors.push('Federal rep missing bioguideId');
    }

    if (level === 'state' && !rep.district) {
      errors.push('State rep missing district information');
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Core Integration Tests
 */
class IntegrationTestSuite {
  constructor() {
    this.services = {};
    this.loadServices();
  }

  async loadServices() {
    try {
      // Import services dynamically to handle ES modules
      const { integratedRepresentativesService } = await import('./services/integratedRepresentatives.service.ts');
      const { geocodingService } = await import('./services/geocodingService.ts');
      const { federalRepresentativesService } = await import('./services/federalRepresentatives.service.ts');
      const { countyMappingService } = await import('./services/countyMappingService.ts');
      const { municipalApi } = await import('./services/municipalApi.ts');
      const { dataQualityService } = await import('./services/dataQualityService.ts');

      this.services = {
        integrated: integratedRepresentativesService,
        geocoding: geocodingService,
        federal: federalRepresentativesService,
        county: countyMappingService,
        municipal: municipalApi,
        dataQuality: dataQualityService
      };

      console.log('🔧 All services loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load services:', error.message);
      throw error;
    }
  }

  /**
   * Test 1: Complete ZIP Code to Representatives Flow
   */
  async testCompleteRepresentativeLookup() {
    console.log('\n🏛️  Testing Complete Representative Lookup Flow');
    console.log('=' .repeat(60));

    for (const testCase of TEST_ZIP_CODES) {
      const testName = `Complete lookup for ${testCase.zip} (${testCase.city})`;
      
      try {
        const { result, duration, error } = await TestUtils.measureTime(async () => {
          return await this.services.integrated.getAllRepresentativesByZipCode(testCase.zip);
        });

        if (error) {
          TestUtils.logTest(testName, 'FAIL', error.message);
          testResults.summary.failed++;
          continue;
        }

        // Validate results
        const validation = this.validateCompleteRepLookup(result, testCase);
        if (validation.valid) {
          TestUtils.logTest(testName, 'PASS', 
            `Found ${result.total} reps (F:${result.breakdown.federal}, S:${result.breakdown.state}, L:${result.breakdown.local}) in ${duration}ms`
          );
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', validation.errors.join('; '));
          testResults.summary.failed++;
        }

        // Record performance
        testResults.performance.operationTimes.push({
          operation: 'complete_lookup',
          zipCode: testCase.zip,
          duration,
          representatives: result.total
        });

      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 2: County/City Name Collision Handling
   */
  async testNameCollisionHandling() {
    console.log('\n🏷️  Testing County/City Name Collision Handling');
    console.log('=' .repeat(60));

    const collisionTests = [
      { zip: '95814', city: 'Sacramento', county: 'Sacramento' },
      { zip: '92868', city: 'Orange', county: 'Orange' },
      { zip: '93711', city: 'Fresno', county: 'Fresno' }
    ];

    for (const test of collisionTests) {
      const testName = `Name collision: ${test.city} City vs ${test.county} County`;
      
      try {
        const [countyOfficials, municipalOfficials] = await Promise.all([
          this.services.county.getCountyOfficials(test.county),
          this.services.municipal.getMunicipalOfficials(test.city, test.county)
        ]);

        // Validate that officials are properly differentiated
        const validation = this.validateNameCollisionResolution(
          countyOfficials, municipalOfficials, test
        );

        if (validation.valid) {
          TestUtils.logTest(testName, 'PASS', 
            `County officials: ${countyOfficials.length}, Municipal: ${municipalOfficials.length}`
          );
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', validation.errors.join('; '));
          testResults.summary.failed++;
        }

      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 3: Cross-Service Data Consistency
   */
  async testDataConsistency() {
    console.log('\n🔍 Testing Cross-Service Data Consistency');
    console.log('=' .repeat(60));

    const consistencyZips = ['90210', '94102', '95814'];

    for (const zipCode of consistencyZips) {
      const testName = `Data consistency for ZIP ${zipCode}`;
      
      try {
        // Get geographic data from multiple services
        const [geoData, integratedData, countyData] = await Promise.all([
          this.services.geocoding.getLocationFromZipCode(zipCode),
          this.services.integrated.getAllRepresentativesByZipCode(zipCode),
          this.services.county.getCountyFromZipCode(zipCode)
        ]);

        const validation = this.validateDataConsistency(geoData, integratedData, countyData, zipCode);
        
        if (validation.valid) {
          TestUtils.logTest(testName, 'PASS', 'Geographic data consistent across services');
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', validation.errors.join('; '));
          testResults.summary.failed++;
        }

      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 4: Error Handling and Graceful Degradation
   */
  async testErrorHandling() {
    console.log('\n🛡️  Testing Error Handling and Graceful Degradation');
    console.log('=' .repeat(60));

    const errorTests = [
      { zip: '99999', expectedBehavior: 'graceful_empty_result' },
      { zip: '00000', expectedBehavior: 'graceful_empty_result' },
      { zip: 'invalid', expectedBehavior: 'graceful_empty_result' },
      { zip: '', expectedBehavior: 'graceful_empty_result' }
    ];

    for (const test of errorTests) {
      const testName = `Error handling for invalid ZIP: ${test.zip}`;
      
      try {
        const result = await this.services.integrated.getAllRepresentativesByZipCode(test.zip);
        
        // Should return empty but valid result structure
        if (this.isGracefulResult(result)) {
          TestUtils.logTest(testName, 'PASS', 'Graceful degradation successful');
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', 'Did not handle error gracefully');
          testResults.summary.failed++;
        }

      } catch (error) {
        // Unexpected errors should not occur - should gracefully return empty results
        TestUtils.logTest(testName, 'FAIL', `Unexpected error: ${error.message}`);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 5: Performance Integration
   */
  async testPerformanceIntegration() {
    console.log('\n⚡ Testing Performance Integration');
    console.log('=' .repeat(60));

    const performanceZips = ['90210', '94102', '95814'];
    const performanceResults = [];

    for (const zipCode of performanceZips) {
      const testName = `Performance test for ZIP ${zipCode}`;
      
      try {
        const { result, duration, error } = await TestUtils.measureTime(async () => {
          return await this.services.integrated.getAllRepresentativesByZipCode(zipCode);
        });

        const threshold = TEST_CONFIG.performanceThresholds.completeFlow;
        const performance = {
          zipCode,
          duration,
          representatives: result ? result.total : 0,
          withinThreshold: duration < threshold
        };

        performanceResults.push(performance);

        if (performance.withinThreshold) {
          TestUtils.logTest(testName, 'PASS', `${duration}ms (under ${threshold}ms threshold)`);
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', `${duration}ms (over ${threshold}ms threshold)`);
          testResults.summary.failed++;
        }

      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }

    // Calculate performance statistics
    const avgDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
    const slowest = performanceResults.reduce((max, r) => r.duration > max.duration ? r : max);
    const fastest = performanceResults.reduce((min, r) => r.duration < min.duration ? r : min);

    testResults.performance.averageResponseTime = Math.round(avgDuration);
    testResults.performance.slowestOperation = slowest;
    testResults.performance.fastestOperation = fastest;

    console.log(`\n📊 Performance Summary:`);
    console.log(`   Average Response Time: ${Math.round(avgDuration)}ms`);
    console.log(`   Fastest: ${fastest.duration}ms (${fastest.zipCode})`);
    console.log(`   Slowest: ${slowest.duration}ms (${slowest.zipCode})`);
  }

  /**
   * Test 6: Data Quality System Integration
   */
  async testDataQualityIntegration() {
    console.log('\n🔍 Testing Data Quality System Integration');
    console.log('=' .repeat(60));

    try {
      // Test data quality monitoring
      const qualityReport = await this.services.dataQuality.generateQualityReport();
      
      const testName = 'Data Quality System';
      if (qualityReport && qualityReport.overallScore !== undefined) {
        TestUtils.logTest(testName, 'PASS', 
          `Quality score: ${qualityReport.overallScore}/100`
        );
        testResults.summary.passed++;
      } else {
        TestUtils.logTest(testName, 'FAIL', 'Data quality system not responding');
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
      testResults.dataQualityTests.report = qualityReport;

    } catch (error) {
      TestUtils.logTest('Data Quality System', 'FAIL', error.message);
      testResults.summary.failed++;
      testResults.summary.totalTests++;
    }
  }

  /**
   * Validation helpers
   */
  validateCompleteRepLookup(result, testCase) {
    const errors = [];
    
    if (!result || typeof result !== 'object') {
      return { valid: false, errors: ['Invalid result structure'] };
    }

    if (!result.hasOwnProperty('total') || !result.hasOwnProperty('breakdown')) {
      errors.push('Missing required result properties');
    }

    if (testCase.type === 'invalid' || testCase.type === 'out_of_state') {
      // Should return empty results for invalid ZIP codes
      if (result.total > 0) {
        errors.push('Should return empty results for invalid ZIP codes');
      }
    } else {
      // Valid California ZIP codes should return some representatives
      if (result.total === 0) {
        errors.push('No representatives found for valid California ZIP code');
      }

      // Should have at least federal representatives
      if (result.breakdown.federal === 0) {
        errors.push('Missing federal representatives');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateNameCollisionResolution(countyOfficials, municipalOfficials, test) {
    const errors = [];

    // Should have different officials for county vs municipal
    if (countyOfficials.length === 0 && municipalOfficials.length === 0) {
      errors.push('No officials found for either county or municipal level');
    }

    // Check for proper jurisdiction differentiation
    const countyTitles = countyOfficials.map(o => o.title).join(', ');
    const municipalTitles = municipalOfficials.map(o => o.title).join(', ');

    if (countyTitles.includes('Mayor') || municipalTitles.includes('County')) {
      errors.push('Officials may be incorrectly categorized between county/municipal');
    }

    return { valid: errors.length === 0, errors };
  }

  validateDataConsistency(geoData, integratedData, countyData, zipCode) {
    const errors = [];

    if (!geoData || !integratedData) {
      errors.push('Missing geographic or representative data');
      return { valid: false, errors };
    }

    // Check county name consistency
    if (geoData.county && countyData && geoData.county !== countyData.name) {
      errors.push(`County name inconsistency: ${geoData.county} vs ${countyData.name}`);
    }

    // Check state consistency
    if (geoData.state && geoData.state !== 'CA') {
      errors.push('ZIP code not in California but processed as CA ZIP');
    }

    return { valid: errors.length === 0, errors };
  }

  isGracefulResult(result) {
    return result && 
           typeof result === 'object' &&
           result.hasOwnProperty('total') &&
           result.total === 0 &&
           Array.isArray(result.federal) &&
           Array.isArray(result.state) &&
           Array.isArray(result.local);
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const report = {
      ...testResults,
      completedAt: new Date().toISOString(),
      successRate: Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100),
      recommendations: this.generateRecommendations()
    };

    // Save to file
    fs.writeFileSync(
      path.join(__dirname, TEST_CONFIG.outputFile), 
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (testResults.performance.averageResponseTime > TEST_CONFIG.performanceThresholds.completeFlow) {
      recommendations.push('Consider implementing caching to improve response times');
    }

    if (testResults.summary.failed > 0) {
      recommendations.push('Review failed tests and implement necessary fixes');
    }

    if (testResults.performance.slowestOperation && 
        testResults.performance.slowestOperation.duration > TEST_CONFIG.performanceThresholds.completeFlow * 2) {
      recommendations.push(`Investigate slow performance for ZIP ${testResults.performance.slowestOperation.zipCode}`);
    }

    return recommendations;
  }
}

/**
 * Main test runner
 */
async function runIntegrationTests() {
  console.log('🚀 CITZN Political Mapping System - Integration Test Suite');
  console.log('='.repeat(80));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}\n`);

  const suite = new IntegrationTestSuite();
  
  try {
    // Run all integration tests
    await suite.testCompleteRepresentativeLookup();
    await suite.testNameCollisionHandling();
    await suite.testDataConsistency();
    await suite.testErrorHandling();
    await suite.testPerformanceIntegration();
    await suite.testDataQualityIntegration();

    // Generate final report
    const report = suite.generateReport();

    console.log('\n🏁 INTEGRATION TEST SUITE COMPLETED');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log(`Average Response Time: ${report.performance.averageResponseTime}ms`);
    console.log(`Report saved to: ${TEST_CONFIG.outputFile}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n💥 Integration test suite failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = { IntegrationTestSuite, runIntegrationTests, TestUtils };