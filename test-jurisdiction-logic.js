/**
 * Test Script for Jurisdiction Logic
 * Tests representative assignment and filtering for incorporated vs unincorporated areas
 */

const { integratedRepresentativesService } = require('./services/integratedRepresentatives.service');
const { jurisdictionService } = require('./services/jurisdictionService');

// Test ZIP codes
const testZipCodes = {
  incorporated: [
    { zip: '90210', expected: 'Beverly Hills', type: 'incorporated_city' },
    { zip: '94102', expected: 'San Francisco', type: 'incorporated_city' },
    { zip: '95814', expected: 'Sacramento', type: 'incorporated_city' },
    { zip: '91101', expected: 'Pasadena', type: 'incorporated_city' }
  ],
  unincorporated: [
    { zip: '90022', expected: 'East Los Angeles', type: 'census_designated_place' },
    { zip: '91001', expected: 'Altadena', type: 'census_designated_place' },
    { zip: '90044', expected: 'West Athens', type: 'census_designated_place' }
  ],
  unknown: [
    { zip: '93001', expected: 'Unknown area', type: 'unincorporated_area' },
    { zip: '95501', expected: 'Unknown area', type: 'unincorporated_area' }
  ]
};

async function testJurisdictionDetection() {
  console.log('🔍 Testing Jurisdiction Detection Logic\n');
  console.log('=' .repeat(60));
  
  for (const category of Object.keys(testZipCodes)) {
    console.log(`\n📍 Testing ${category.toUpperCase()} areas:`);
    console.log('-'.repeat(40));
    
    for (const testCase of testZipCodes[category]) {
      try {
        // Get jurisdiction info
        const jurisdictionInfo = await integratedRepresentativesService.getJurisdictionInfo(testCase.zip);
        
        console.log(`\nZIP: ${testCase.zip} (Expected: ${testCase.expected})`);
        console.log(`  Detected: ${jurisdictionInfo.jurisdiction.jurisdiction.name}`);
        console.log(`  Type: ${jurisdictionInfo.jurisdiction.jurisdiction.type}`);
        console.log(`  Incorporated: ${jurisdictionInfo.jurisdiction.jurisdiction.incorporationStatus}`);
        console.log(`  Has Local Reps: ${jurisdictionInfo.jurisdiction.jurisdiction.hasLocalRepresentatives}`);
        console.log(`  Confidence: ${Math.round(jurisdictionInfo.jurisdiction.confidence * 100)}%`);
        console.log(`  Applicable Levels: ${jurisdictionInfo.applicableLevels.join(', ')}`);
        
        if (jurisdictionInfo.excludedLevels.length > 0) {
          console.log(`  Excluded Levels: ${jurisdictionInfo.excludedLevels.join(', ')}`);
        }
        
        // Test if detection matches expectation
        const isCorrectType = jurisdictionInfo.jurisdiction.jurisdiction.type === testCase.type;
        console.log(`  ✓ Type Detection: ${isCorrectType ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
      }
    }
  }
}

async function testRepresentativeFiltering() {
  console.log('\n\n👥 Testing Representative Filtering Logic\n');
  console.log('=' .repeat(60));
  
  // Test incorporated city (should have all levels)
  console.log('\n🏢 INCORPORATED CITY TEST - Beverly Hills (90210)');
  console.log('-'.repeat(50));
  
  try {
    const beverlyHillsReps = await integratedRepresentativesService.getAllRepresentativesByZipCode('90210');
    
    console.log(`Total Representatives: ${beverlyHillsReps.total}`);
    console.log(`  Federal: ${beverlyHillsReps.breakdown.federal}`);
    console.log(`  State: ${beverlyHillsReps.breakdown.state}`);
    console.log(`  Local: ${beverlyHillsReps.breakdown.local}`);
    
    if (beverlyHillsReps.areaInfo) {
      console.log(`Area Description: ${beverlyHillsReps.areaInfo.description}`);
      console.log(`Government Structure: ${beverlyHillsReps.areaInfo.governmentStructure}`);
    }
    
    // Should have local representatives for incorporated city
    const hasLocalReps = beverlyHillsReps.breakdown.local > 0;
    console.log(`✓ Local Representatives: ${hasLocalReps ? '✅ PRESENT' : '❌ MISSING'}`);
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
  
  // Test unincorporated area (should NOT have city-level reps)
  console.log('\n🌾 UNINCORPORATED AREA TEST - East Los Angeles (90022)');
  console.log('-'.repeat(50));
  
  try {
    const eastLAReps = await integratedRepresentativesService.getAllRepresentativesByZipCode('90022');
    
    console.log(`Total Representatives: ${eastLAReps.total}`);
    console.log(`  Federal: ${eastLAReps.breakdown.federal}`);
    console.log(`  State: ${eastLAReps.breakdown.state}`);
    console.log(`  Local: ${eastLAReps.breakdown.local}`);
    
    if (eastLAReps.areaInfo) {
      console.log(`Area Description: ${eastLAReps.areaInfo.description}`);
      console.log(`Government Structure: ${eastLAReps.areaInfo.governmentStructure}`);
    }
    
    // Should NOT have city-level representatives for unincorporated area
    const hasNoLocalReps = eastLAReps.breakdown.local === 0 || 
      (eastLAReps.jurisdiction && !eastLAReps.jurisdiction.jurisdiction.hasLocalRepresentatives);
    console.log(`✓ No City Representatives: ${hasNoLocalReps ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    // Should still have county representatives
    const hasFederalAndState = eastLAReps.breakdown.federal > 0 && eastLAReps.breakdown.state > 0;
    console.log(`✓ Federal & State Reps: ${hasFederalAndState ? '✅ PRESENT' : '❌ MISSING'}`);
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function testDataConsistency() {
  console.log('\n\n📊 Testing Data Consistency\n');
  console.log('=' .repeat(60));
  
  const testZips = ['90210', '90022', '94102', '91001'];
  
  for (const zip of testZips) {
    try {
      const reps = await integratedRepresentativesService.getAllRepresentativesByZipCode(zip);
      
      console.log(`\nZIP ${zip}:`);
      
      // Check that representatives match jurisdiction type
      if (reps.jurisdiction) {
        const expectedLocalReps = reps.jurisdiction.jurisdiction.hasLocalRepresentatives;
        const actualLocalReps = reps.breakdown.local > 0;
        
        const isConsistent = expectedLocalReps === actualLocalReps;
        console.log(`  Jurisdiction-Rep Consistency: ${isConsistent ? '✅ CONSISTENT' : '❌ INCONSISTENT'}`);
        
        if (!isConsistent) {
          console.log(`    Expected local reps: ${expectedLocalReps}`);
          console.log(`    Actual local reps: ${actualLocalReps}`);
        }
        
        // Check that all areas have federal and state reps
        const hasFederalState = reps.breakdown.federal > 0 && reps.breakdown.state > 0;
        console.log(`  Federal/State Reps: ${hasFederalState ? '✅ PRESENT' : '❌ MISSING'}`);
        
      } else {
        console.log(`  ❌ No jurisdiction data available`);
      }
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🧪 CITZN Jurisdiction Logic Test Suite');
  console.log('Testing representative assignment for incorporated vs unincorporated areas\n');
  
  try {
    await testJurisdictionDetection();
    await testRepresentativeFiltering();
    await testDataConsistency();
    
    console.log('\n\n🎉 Test Suite Complete!');
    console.log('=' .repeat(60));
    console.log('Check the results above to verify:');
    console.log('1. ✅ Incorporated cities show all levels of representatives');
    console.log('2. ✅ Unincorporated areas exclude city-level representatives'); 
    console.log('3. ✅ All areas show federal and state representatives');
    console.log('4. ✅ User messaging clearly explains jurisdiction type');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Export for use in other test files
module.exports = {
  testJurisdictionDetection,
  testRepresentativeFiltering,
  testDataConsistency,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}