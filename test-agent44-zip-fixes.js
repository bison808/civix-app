#!/usr/bin/env node

/**
 * Agent 48 Validation: Test Agent 44's ZIP Code Fixes
 * 
 * CRITICAL TEST: Verify Agent 44 fixed the 4 critical ZIP codes:
 * - 93401 should return San Luis Obispo
 * - 96001 should return Redding  
 * - 92252 should return Palm Springs
 * - 95014 should return Cupertino
 */

console.log('🔍 Agent 48: Testing Agent 44 ZIP Code Fixes...\n');

const testCriticalZIPs = async () => {
  const criticalTests = [
    { zip: '93401', expectedCity: 'San Luis Obispo' },
    { zip: '96001', expectedCity: 'Redding' },
    { zip: '92252', expectedCity: 'Palm Springs' },
    { zip: '95014', expectedCity: 'Cupertino' }
  ];

  const results = [];

  try {
    // Test API endpoint directly
    const baseURL = 'http://localhost:3008';
    
    console.log('Testing ZIP code API endpoints...\n');
    
    for (const test of criticalTests) {
      try {
        const response = await fetch(`${baseURL}/api/auth/verify-zip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ zipCode: test.zip })
        });

        const data = await response.json();
        
        const isCorrect = data.city === test.expectedCity;
        
        results.push({
          zip: test.zip,
          expectedCity: test.expectedCity,
          actualCity: data.city,
          isCorrect,
          response: data
        });

        console.log(`✅ ZIP ${test.zip}: Expected "${test.expectedCity}", Got "${data.city}" - ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
        
      } catch (error) {
        console.log(`❌ ZIP ${test.zip}: ERROR - ${error.message}`);
        results.push({
          zip: test.zip,
          expectedCity: test.expectedCity,
          actualCity: null,
          isCorrect: false,
          error: error.message
        });
      }
    }

    // Summary
    const passCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;
    
    console.log(`\n📊 Agent 44 ZIP Fix Validation Results: ${passCount}/${totalCount} PASSED`);
    
    if (passCount === totalCount) {
      console.log('🎉 All critical ZIP codes fixed successfully! Agent 44 validation: PASSED');
    } else {
      console.log('❌ Some ZIP codes still need fixes. Agent 44 validation: FAILED');
    }
    
    return { results, passCount, totalCount };
    
  } catch (error) {
    console.error('❌ Critical error during ZIP validation:', error);
    return { error: error.message, results: [] };
  }
};

// Also test geocoding service directly
const testGeocodingService = async () => {
  console.log('\n🔍 Testing geocoding service directly...\n');
  
  try {
    const { geocodingService } = await import('./services/geocodingService.ts');
    
    const criticalTests = [
      { zip: '93401', expectedCity: 'San Luis Obispo' },
      { zip: '96001', expectedCity: 'Redding' },
      { zip: '92252', expectedCity: 'Palm Springs' },
      { zip: '95014', expectedCity: 'Cupertino' }
    ];

    const results = [];
    
    for (const test of criticalTests) {
      try {
        const result = await geocodingService.getCityFromZip(test.zip);
        const isCorrect = result.city === test.expectedCity;
        
        results.push({
          zip: test.zip,
          expectedCity: test.expectedCity,
          actualCity: result.city,
          isCorrect,
          result
        });

        console.log(`✅ Geocoding ${test.zip}: Expected "${test.expectedCity}", Got "${result.city}" - ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
        
      } catch (error) {
        console.log(`❌ Geocoding ${test.zip}: ERROR - ${error.message}`);
        results.push({
          zip: test.zip,
          expectedCity: test.expectedCity,
          actualCity: null,
          isCorrect: false,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.log(`❌ Error testing geocoding service: ${error.message}`);
    return [];
  }
};

// Run tests
const runValidation = async () => {
  console.log('🚀 Starting Agent 44 ZIP Code Fix Validation\n');
  
  const apiResults = await testCriticalZIPs();
  const geocodingResults = await testGeocodingService();
  
  console.log('\n📋 Final Validation Report:');
  console.log('============================');
  
  if (apiResults.passCount === 4) {
    console.log('✅ Agent 44 ZIP Code Fixes: VALIDATED SUCCESSFULLY');
    console.log('✅ All 4 critical ZIP codes now return correct cities');
  } else {
    console.log('❌ Agent 44 ZIP Code Fixes: VALIDATION FAILED');
    console.log(`❌ Only ${apiResults.passCount}/4 ZIP codes working correctly`);
  }
  
  return {
    agent44ValidationPassed: apiResults.passCount === 4,
    apiResults,
    geocodingResults
  };
};

if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { runValidation, testCriticalZIPs };