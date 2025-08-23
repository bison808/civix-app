#!/usr/bin/env node

/**
 * COMPATIBLE INTEGRATION TEST SUITE
 * Tests the complete CITZN Political Mapping System
 * Using compatible imports for the existing codebase
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  outputFile: 'integration-test-results.json',
  performanceThresholds: {
    zipLookup: 500,
    representativeLookup: 1000,
    completeFlow: 2000
  }
};

// Test data - California ZIP codes covering different scenarios
const TEST_ZIP_CODES = [
  { zip: '90210', city: 'Beverly Hills', county: 'Los Angeles', type: 'urban' },
  { zip: '94102', city: 'San Francisco', county: 'San Francisco', type: 'urban' },
  { zip: '95814', city: 'Sacramento', county: 'Sacramento', type: 'capital' },
  { zip: '92101', city: 'San Diego', county: 'San Diego', type: 'urban' },
  { zip: '95110', city: 'San Jose', county: 'Santa Clara', type: 'tech_hub' },
  { zip: '93514', city: 'Bishop', county: 'Inyo', type: 'rural' },
  { zip: '99999', city: 'Invalid', county: 'Invalid', type: 'invalid' }
];

// Test results tracking
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: []
  },
  performance: {
    averageResponseTime: 0,
    operationTimes: []
  },
  integrationTests: {}
};

/**
 * Utility functions
 */
class TestUtils {
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
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '🔄';
    console.log(`${icon} [${timestamp}] ${testName}: ${status}`);
    if (details) {
      console.log(`   ${details}`);
    }
  }

  static async makeAPIRequest(endpoint, data = null) {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://civix-app.vercel.app' 
      : 'http://localhost:3008';
      
    const url = `${baseUrl}${endpoint}`;
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Network Error: ${error.message}`);
    }
  }
}

/**
 * Integration Test Suite that works with the deployed app
 */
class CompatibleIntegrationTestSuite {
  constructor() {
    console.log('🔧 Initializing Compatible Integration Test Suite');
  }

  /**
   * Test 1: ZIP Code Verification API
   */
  async testZipCodeVerificationAPI() {
    console.log('\n📍 Testing ZIP Code Verification API');
    console.log('=' .repeat(60));

    for (const testCase of TEST_ZIP_CODES) {
      const testName = `ZIP verification for ${testCase.zip} (${testCase.city})`;
      
      try {
        const { result, duration, error } = await TestUtils.measureTime(async () => {
          return await TestUtils.makeAPIRequest('/api/auth/verify-zip', { 
            zipCode: testCase.zip 
          });
        });

        if (error) {
          if (testCase.type === 'invalid') {
            TestUtils.logTest(testName, 'PASS', 'Expected error for invalid ZIP');
            testResults.summary.passed++;
          } else {
            TestUtils.logTest(testName, 'FAIL', error.message);
            testResults.summary.failed++;
          }
        } else {
          if (testCase.type === 'invalid') {
            TestUtils.logTest(testName, 'FAIL', 'Should have failed for invalid ZIP');
            testResults.summary.failed++;
          } else {
            TestUtils.logTest(testName, 'PASS', 
              `Valid response: ${result.city}, ${result.state} in ${duration}ms`
            );
            testResults.summary.passed++;
          }
        }

        testResults.performance.operationTimes.push({
          operation: 'zip_verification',
          zipCode: testCase.zip,
          duration,
          success: !error
        });

      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 2: Service Layer Integration (Direct file testing)
   */
  async testServiceLayerIntegration() {
    console.log('\n🔧 Testing Service Layer Integration');
    console.log('=' .repeat(60));

    const serviceTests = [
      {
        name: 'Federal Representatives Service',
        file: 'test-federal-reps.js',
        expectedExports: ['testFederalReps']
      },
      {
        name: 'California State Reps Service', 
        file: 'test-california-state-reps.js',
        expectedExports: ['testCaliforniaStateReps']
      },
      {
        name: 'County System Service',
        file: 'test-county-system.js', 
        expectedExports: ['testCountySystem']
      },
      {
        name: 'Municipal API Service',
        file: 'test-municipal-system.js',
        expectedExports: ['testMunicipalSystem']
      }
    ];

    for (const serviceTest of serviceTests) {
      const testName = `Service test: ${serviceTest.name}`;
      
      try {
        // Check if test file exists
        const testFilePath = path.join(__dirname, serviceTest.file);
        if (!fs.existsSync(testFilePath)) {
          TestUtils.logTest(testName, 'FAIL', 'Test file not found');
          testResults.summary.failed++;
          testResults.summary.totalTests++;
          continue;
        }

        // Try to require and run the test
        const testModule = require(testFilePath);
        
        // Verify exports exist
        const missingExports = serviceTest.expectedExports.filter(
          exp => typeof testModule[exp] !== 'function'
        );

        if (missingExports.length > 0) {
          TestUtils.logTest(testName, 'FAIL', 
            `Missing exports: ${missingExports.join(', ')}`);
          testResults.summary.failed++;
        } else {
          TestUtils.logTest(testName, 'PASS', 'Service test module loaded successfully');
          testResults.summary.passed++;
        }

      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', `Module error: ${error.message}`);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 3: Data Quality System Files
   */
  async testDataQualitySystemFiles() {
    console.log('\n📊 Testing Data Quality System Files');
    console.log('=' .repeat(60));

    const dataQualityFiles = [
      'services/dataQualityService.ts',
      'services/dataMonitoringService.ts', 
      'services/dataUpdateScheduler.ts',
      'validate-data-quality-system.js'
    ];

    for (const file of dataQualityFiles) {
      const testName = `Data Quality file: ${file}`;
      
      try {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          TestUtils.logTest(testName, 'PASS', 
            `File exists (${Math.round(stats.size / 1024)}KB)`);
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', 'File not found');
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
   * Test 4: Representative Services Integration
   */
  async testRepresentativeServicesFiles() {
    console.log('\n🏛️  Testing Representative Services Integration');
    console.log('=' .repeat(60));

    const representativeServices = [
      'services/integratedRepresentatives.service.ts',
      'services/federalRepresentatives.service.ts',
      'services/californiaStateApi.ts',
      'services/openStatesService.ts',
      'services/countyMappingService.ts',
      'services/municipalApi.ts',
      'services/civicInfoService.ts',
      'services/geocodingService.ts'
    ];

    let servicesFound = 0;
    let totalServiceSize = 0;

    for (const service of representativeServices) {
      const testName = `Service file: ${service}`;
      
      try {
        const filePath = path.join(__dirname, service);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          totalServiceSize += stats.size;
          servicesFound++;
          
          TestUtils.logTest(testName, 'PASS', `File exists (${sizeKB}KB)`);
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', 'Service file not found');
          testResults.summary.failed++;
        }
      } catch (error) {
        TestUtils.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }

      testResults.summary.totalTests++;
    }

    console.log(`\n📈 Service Layer Summary:`);
    console.log(`   Services Found: ${servicesFound}/${representativeServices.length}`);
    console.log(`   Total Service Code: ${Math.round(totalServiceSize / 1024)}KB`);
  }

  /**
   * Test 5: Type System Integration
   */
  async testTypeSystemIntegration() {
    console.log('\n📝 Testing Type System Integration');
    console.log('=' .repeat(60));

    const typeFiles = [
      'types/representatives.types.ts',
      'types/federal.types.ts',
      'types/california-state.types.ts',
      'types/county.types.ts',
      'types/districts.types.ts'
    ];

    for (const typeFile of typeFiles) {
      const testName = `Type file: ${typeFile}`;
      
      try {
        const filePath = path.join(__dirname, typeFile);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const interfaces = (content.match(/interface\s+\w+/g) || []).length;
          const types = (content.match(/type\s+\w+/g) || []).length;
          
          TestUtils.logTest(testName, 'PASS', 
            `File exists (${interfaces} interfaces, ${types} types)`);
          testResults.summary.passed++;
        } else {
          TestUtils.logTest(testName, 'FAIL', 'Type file not found');
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
   * Test 6: Build System Integration
   */
  async testBuildSystemIntegration() {
    console.log('\n🔨 Testing Build System Integration');
    console.log('=' .repeat(60));

    const buildTests = [
      {
        name: 'TypeScript Configuration',
        file: 'tsconfig.json',
        test: (content) => {
          const config = JSON.parse(content);
          return config.compilerOptions && config.include;
        }
      },
      {
        name: 'Next.js Configuration',
        file: 'next.config.js',
        test: (content) => content.includes('module.exports')
      },
      {
        name: 'Package Dependencies',
        file: 'package.json',
        test: (content) => {
          const pkg = JSON.parse(content);
          return pkg.dependencies && pkg.devDependencies;
        }
      }
    ];

    for (const buildTest of buildTests) {
      const testName = `Build config: ${buildTest.name}`;
      
      try {
        const filePath = path.join(__dirname, buildTest.file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const isValid = buildTest.test(content);
          
          if (isValid) {
            TestUtils.logTest(testName, 'PASS', 'Configuration valid');
            testResults.summary.passed++;
          } else {
            TestUtils.logTest(testName, 'FAIL', 'Configuration invalid');
            testResults.summary.failed++;
          }
        } else {
          TestUtils.logTest(testName, 'FAIL', 'Configuration file not found');
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
   * Generate comprehensive test report
   */
  generateReport() {
    const avgResponseTime = testResults.performance.operationTimes.length > 0 
      ? testResults.performance.operationTimes.reduce((sum, op) => sum + op.duration, 0) / testResults.performance.operationTimes.length
      : 0;

    const report = {
      ...testResults,
      completedAt: new Date().toISOString(),
      successRate: Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100),
      performance: {
        ...testResults.performance,
        averageResponseTime: Math.round(avgResponseTime)
      },
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

    if (testResults.summary.failed > 0) {
      recommendations.push('Review failed tests and implement necessary fixes');
    }

    if (testResults.summary.passed === 0) {
      recommendations.push('No tests passed - system may have critical issues');
    }

    const successRate = (testResults.summary.passed / testResults.summary.totalTests) * 100;
    if (successRate < 80) {
      recommendations.push('Success rate below 80% - investigate failing components');
    }

    return recommendations;
  }
}

/**
 * Main test runner
 */
async function runCompatibleIntegrationTests() {
  console.log('🚀 CITZN Political Mapping System - Compatible Integration Test Suite');
  console.log('='.repeat(80));
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const suite = new CompatibleIntegrationTestSuite();
  
  try {
    // Run all integration tests
    await suite.testZipCodeVerificationAPI();
    await suite.testServiceLayerIntegration();
    await suite.testDataQualitySystemFiles();
    await suite.testRepresentativeServicesFiles();
    await suite.testTypeSystemIntegration();
    await suite.testBuildSystemIntegration();

    // Generate final report
    const report = suite.generateReport();

    console.log('\n🏁 COMPATIBLE INTEGRATION TEST SUITE COMPLETED');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Success Rate: ${report.successRate}%`);
    
    if (report.performance.averageResponseTime > 0) {
      console.log(`Average Response Time: ${report.performance.averageResponseTime}ms`);
    }
    
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
    console.error('\n💥 Compatible integration test suite failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runCompatibleIntegrationTests().catch(console.error);
}

module.exports = { CompatibleIntegrationTestSuite, runCompatibleIntegrationTests, TestUtils };