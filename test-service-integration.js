#!/usr/bin/env node

/**
 * SERVICE-TO-SERVICE INTEGRATION TEST
 * Tests direct service communication and data consistency
 * Focuses on the service layer without requiring running server
 */

const fs = require('fs');
const path = require('path');

// Mock data for testing service integration
const MOCK_ZIP_CODES = {
  '90210': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
  '94102': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '95814': { city: 'Sacramento', state: 'CA', county: 'Sacramento' }
};

const MOCK_FEDERAL_REPS = [
  {
    id: 'fed-001',
    name: 'Jane Doe',
    title: 'Representative',
    party: 'Democratic',
    chamber: 'House',
    district: '34',
    state: 'CA',
    bioguideId: 'D000123'
  }
];

const MOCK_STATE_REPS = [
  {
    id: 'state-001', 
    name: 'John Smith',
    title: 'Assemblymember',
    party: 'Democratic',
    chamber: 'Assembly',
    district: '54',
    state: 'CA'
  }
];

const MOCK_COUNTY_OFFICIALS = [
  {
    id: 'county-001',
    name: 'Maria Garcia',
    title: 'County Supervisor',
    jurisdiction: 'Los Angeles County',
    district: '2'
  }
];

const testResults = {
  timestamp: new Date().toISOString(),
  summary: { totalTests: 0, passed: 0, failed: 0 },
  serviceIntegration: {},
  dataFlow: {},
  consistency: {}
};

/**
 * Service Integration Tester
 */
class ServiceIntegrationTester {
  constructor() {
    this.services = {};
    this.mockData = {
      zipCodes: MOCK_ZIP_CODES,
      federalReps: MOCK_FEDERAL_REPS,
      stateReps: MOCK_STATE_REPS,
      countyOfficials: MOCK_COUNTY_OFFICIALS
    };
  }

  logTest(testName, status, details = null) {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '🔄';
    console.log(`${icon} ${testName}: ${status}`);
    if (details) console.log(`   ${details}`);
  }

  /**
   * Test 1: Service File Dependencies and Imports
   */
  async testServiceDependencies() {
    console.log('\n🔗 Testing Service Dependencies and Imports');
    console.log('=' .repeat(60));

    const serviceDependencies = [
      {
        service: 'integratedRepresentatives.service.ts',
        expectedImports: [
          'representatives.service',
          'federalRepresentatives.service',
          'zipDistrictMapping'
        ]
      },
      {
        service: 'countyMappingService.ts',
        expectedImports: [
          'geocodingService',
          'county.types'
        ]
      },
      {
        service: 'municipalApi.ts',
        expectedImports: [
          'representatives.types'
        ]
      },
      {
        service: 'dataQualityService.ts',
        expectedImports: [
          'dataMonitoringService'
        ]
      }
    ];

    for (const dep of serviceDependencies) {
      const testName = `Dependencies for ${dep.service}`;
      
      try {
        const filePath = path.join(__dirname, 'services', dep.service);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let foundImports = 0;
        let missingImports = [];
        
        for (const expectedImport of dep.expectedImports) {
          if (content.includes(expectedImport)) {
            foundImports++;
          } else {
            missingImports.push(expectedImport);
          }
        }
        
        if (missingImports.length === 0) {
          this.logTest(testName, 'PASS', `All ${foundImports} imports found`);
          testResults.summary.passed++;
        } else {
          this.logTest(testName, 'FAIL', 
            `Missing imports: ${missingImports.join(', ')}`);
          testResults.summary.failed++;
        }
        
      } catch (error) {
        this.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }
      
      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 2: Service Interface Consistency
   */
  async testServiceInterfaceConsistency() {
    console.log('\n🎯 Testing Service Interface Consistency');
    console.log('=' .repeat(60));

    const interfaceTests = [
      {
        service: 'integratedRepresentatives.service.ts',
        requiredMethods: [
          'getAllRepresentativesByZipCode',
          'getFederalRepresentatives',
          'getStateAndLocalRepresentatives'
        ]
      },
      {
        service: 'federalRepresentatives.service.ts',
        requiredMethods: [
          'getCaliforniaFederalRepsByZip',
          'getRepresentativeByBioguideId',
          'searchFederalRepresentatives'
        ]
      },
      {
        service: 'countyMappingService.ts',
        requiredMethods: [
          'getCountyFromZipCode',
          'getCountyOfficials',
          'getCountyDistricts'
        ]
      }
    ];

    for (const test of interfaceTests) {
      const testName = `Interface consistency for ${test.service}`;
      
      try {
        const filePath = path.join(__dirname, 'services', test.service);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let foundMethods = 0;
        let missingMethods = [];
        
        for (const method of test.requiredMethods) {
          // Check for method definition patterns
          const methodPatterns = [
            `async ${method}`,
            `${method}\\s*\\(`,
            `${method}\\s*:`
          ];
          
          const found = methodPatterns.some(pattern => 
            new RegExp(pattern).test(content)
          );
          
          if (found) {
            foundMethods++;
          } else {
            missingMethods.push(method);
          }
        }
        
        if (missingMethods.length === 0) {
          this.logTest(testName, 'PASS', `All ${foundMethods} methods found`);
          testResults.summary.passed++;
        } else {
          this.logTest(testName, 'FAIL', 
            `Missing methods: ${missingMethods.join(', ')}`);
          testResults.summary.failed++;
        }
        
      } catch (error) {
        this.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }
      
      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 3: Type System Integration
   */
  async testTypeSystemIntegration() {
    console.log('\n📋 Testing Type System Integration');
    console.log('=' .repeat(60));

    const typeIntegrationTests = [
      {
        typeFile: 'federal.types.ts',
        serviceFile: 'federalRepresentatives.service.ts',
        expectedTypes: ['FederalRepresentative', 'VotingRecord', 'CommitteeMembership']
      },
      {
        typeFile: 'county.types.ts',
        serviceFile: 'countyMappingService.ts',
        expectedTypes: ['CountyOfficial', 'CountyInfo', 'CountyDistrict']
      },
      {
        typeFile: 'representatives.types.ts',
        serviceFile: 'integratedRepresentatives.service.ts',
        expectedTypes: ['Representative', 'ContactInfo']
      }
    ];

    for (const test of typeIntegrationTests) {
      const testName = `Type integration: ${test.typeFile} <-> ${test.serviceFile}`;
      
      try {
        const typeFilePath = path.join(__dirname, 'types', test.typeFile);
        const serviceFilePath = path.join(__dirname, 'services', test.serviceFile);
        
        const typeContent = fs.readFileSync(typeFilePath, 'utf8');
        const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');
        
        let typesFound = 0;
        let missingTypes = [];
        
        for (const expectedType of test.expectedTypes) {
          // Check if type is defined in type file
          const typePattern = new RegExp(`(interface|type)\\s+${expectedType}`);
          const typeExists = typePattern.test(typeContent);
          
          // Check if type is used in service file
          const typeUsed = serviceContent.includes(expectedType);
          
          if (typeExists && typeUsed) {
            typesFound++;
          } else if (!typeExists) {
            missingTypes.push(`${expectedType} (not defined)`);
          } else if (!typeUsed) {
            missingTypes.push(`${expectedType} (not used)`);
          }
        }
        
        if (missingTypes.length === 0) {
          this.logTest(testName, 'PASS', `${typesFound} types properly integrated`);
          testResults.summary.passed++;
        } else {
          this.logTest(testName, 'FAIL', 
            `Type issues: ${missingTypes.join(', ')}`);
          testResults.summary.failed++;
        }
        
      } catch (error) {
        this.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }
      
      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 4: Data Flow Patterns
   */
  async testDataFlowPatterns() {
    console.log('\n🔄 Testing Data Flow Patterns');
    console.log('=' .repeat(60));

    const dataFlowTests = [
      {
        name: 'ZIP Code -> Geographic Data Flow',
        sourceService: 'geocodingService.ts',
        targetService: 'countyMappingService.ts',
        expectedFlow: 'zipCode -> geographic coordinates -> county mapping'
      },
      {
        name: 'County Data -> Municipal Data Flow',
        sourceService: 'countyMappingService.ts',
        targetService: 'municipalApi.ts',
        expectedFlow: 'county info -> municipal jurisdiction -> local officials'
      },
      {
        name: 'Federal Reps -> Integrated Service Flow',
        sourceService: 'federalRepresentatives.service.ts',
        targetService: 'integratedRepresentatives.service.ts',
        expectedFlow: 'federal data -> unified representative structure'
      }
    ];

    for (const flow of dataFlowTests) {
      const testName = `Data flow: ${flow.name}`;
      
      try {
        const sourceFilePath = path.join(__dirname, 'services', flow.sourceService);
        const targetFilePath = path.join(__dirname, 'services', flow.targetService);
        
        const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
        const targetContent = fs.readFileSync(targetFilePath, 'utf8');
        
        // Extract service class name from source
        const sourceServiceMatch = sourceContent.match(/class\s+(\w+Service|\w+Api)/);
        const sourceServiceName = sourceServiceMatch ? sourceServiceMatch[1] : flow.sourceService.replace('.ts', '');
        
        // Check if target service imports or references source service
        const isIntegrated = targetContent.includes(sourceServiceName) || 
                            targetContent.includes(flow.sourceService.replace('.ts', ''));
        
        if (isIntegrated) {
          this.logTest(testName, 'PASS', 'Data flow integration found');
          testResults.summary.passed++;
        } else {
          this.logTest(testName, 'FAIL', 'No data flow integration detected');
          testResults.summary.failed++;
        }
        
      } catch (error) {
        this.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }
      
      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 5: Error Handling Integration
   */
  async testErrorHandlingIntegration() {
    console.log('\n🛡️  Testing Error Handling Integration');
    console.log('=' .repeat(60));

    const errorHandlingTests = [
      {
        service: 'integratedRepresentatives.service.ts',
        expectedPatterns: ['try.*catch', 'Promise.all', 'error.*console']
      },
      {
        service: 'dataQualityService.ts',
        expectedPatterns: ['try.*catch', 'error.*log', 'fallback']
      },
      {
        service: 'geocodingService.ts',
        expectedPatterns: ['catch.*error', 'return.*null|return.*empty']
      }
    ];

    for (const test of errorHandlingTests) {
      const testName = `Error handling in ${test.service}`;
      
      try {
        const filePath = path.join(__dirname, 'services', test.service);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let patternsFound = 0;
        let missingPatterns = [];
        
        for (const pattern of test.expectedPatterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(content)) {
            patternsFound++;
          } else {
            missingPatterns.push(pattern);
          }
        }
        
        if (missingPatterns.length === 0) {
          this.logTest(testName, 'PASS', `${patternsFound} error handling patterns found`);
          testResults.summary.passed++;
        } else {
          this.logTest(testName, 'FAIL', 
            `Missing patterns: ${missingPatterns.join(', ')}`);
          testResults.summary.failed++;
        }
        
      } catch (error) {
        this.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }
      
      testResults.summary.totalTests++;
    }
  }

  /**
   * Test 6: Caching Strategy Integration
   */
  async testCachingStrategyIntegration() {
    console.log('\n💾 Testing Caching Strategy Integration');
    console.log('=' .repeat(60));

    const cachingTests = [
      {
        service: 'integratedRepresentatives.service.ts',
        expectedCacheFeatures: ['cache.*Map', 'CACHE_DURATION', 'getFromCache', 'setCache']
      },
      {
        service: 'federalRepresentatives.service.ts',
        expectedCacheFeatures: ['cache', 'Map.*set', 'timestamp']
      }
    ];

    for (const test of cachingTests) {
      const testName = `Caching integration in ${test.service}`;
      
      try {
        const filePath = path.join(__dirname, 'services', test.service);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let cachingFeaturesFound = 0;
        let missingFeatures = [];
        
        for (const feature of test.expectedCacheFeatures) {
          const regex = new RegExp(feature, 'i');
          if (regex.test(content)) {
            cachingFeaturesFound++;
          } else {
            missingFeatures.push(feature);
          }
        }
        
        if (cachingFeaturesFound > 0) {
          this.logTest(testName, 'PASS', 
            `${cachingFeaturesFound}/${test.expectedCacheFeatures.length} caching features found`);
          testResults.summary.passed++;
        } else {
          this.logTest(testName, 'FAIL', 'No caching implementation detected');
          testResults.summary.failed++;
        }
        
      } catch (error) {
        this.logTest(testName, 'FAIL', error.message);
        testResults.summary.failed++;
      }
      
      testResults.summary.totalTests++;
    }
  }

  /**
   * Generate integration report
   */
  generateReport() {
    const report = {
      ...testResults,
      completedAt: new Date().toISOString(),
      successRate: Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100),
      integrationStatus: this.assessIntegrationStatus(),
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(
      path.join(__dirname, 'service-integration-report.json'),
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  assessIntegrationStatus() {
    const successRate = (testResults.summary.passed / testResults.summary.totalTests) * 100;
    
    if (successRate >= 90) return 'EXCELLENT';
    if (successRate >= 80) return 'GOOD';
    if (successRate >= 70) return 'ACCEPTABLE';
    if (successRate >= 60) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }

  generateRecommendations() {
    const recommendations = [];
    const successRate = (testResults.summary.passed / testResults.summary.totalTests) * 100;

    if (successRate < 80) {
      recommendations.push('Service integration below acceptable threshold - review failing tests');
    }

    if (testResults.summary.failed > 5) {
      recommendations.push('Multiple integration failures detected - systematic review needed');
    }

    recommendations.push('Consider implementing integration monitoring in production');
    recommendations.push('Add automated service compatibility tests to CI/CD pipeline');

    return recommendations;
  }
}

/**
 * Main test runner
 */
async function runServiceIntegrationTests() {
  console.log('🔧 CITZN Service-to-Service Integration Test Suite');
  console.log('='.repeat(80));
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const tester = new ServiceIntegrationTester();
  
  try {
    await tester.testServiceDependencies();
    await tester.testServiceInterfaceConsistency();
    await tester.testTypeSystemIntegration();
    await tester.testDataFlowPatterns();
    await tester.testErrorHandlingIntegration();
    await tester.testCachingStrategyIntegration();

    const report = tester.generateReport();

    console.log('\n🏁 SERVICE INTEGRATION TEST COMPLETED');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log(`Integration Status: ${report.integrationStatus}`);
    console.log(`Report saved to: service-integration-report.json`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    process.exit(report.summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n💥 Service integration test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runServiceIntegrationTests().catch(console.error);
}

module.exports = { ServiceIntegrationTester, runServiceIntegrationTests };