/**
 * Agent 35: California ZIP Code Validation Mission
 * Run against the live CITZN server to validate all California ZIP codes
 */

const CaliforniaZipValidationFramework = require('./california-zip-validation-framework');
const RealDataValidationCriteria = require('./real-data-validation-criteria');

async function runComprehensiveCaliforniaValidation() {
  const framework = new CaliforniaZipValidationFramework();
  const validator = new RealDataValidationCriteria();

  const SERVER_URL = 'http://localhost:3015/api/auth/verify-zip';

  console.log('🎯 AGENT 35: CALIFORNIA ZIP CODE VALIDATION MISSION\n');
  console.log('=' .repeat(80));
  console.log('🔍 COMPREHENSIVE VALIDATION OF ALL CALIFORNIA ZIP CODES');
  console.log('🚫 MISSION: Zero tolerance for placeholder or "unknown" data');
  console.log('✅ GOAL: 100% real, accurate geographic and political data');
  console.log('=' .repeat(80));
  console.log(`🔗 Server: ${SERVER_URL}\n`);

  try {
    // Step 1: Quick sample validation to assess current state
    console.log('📊 PHASE 1: QUICK SAMPLE ASSESSMENT\n');
    
    const sampleZipCodes = [
      // California test cases
      '90210', // Beverly Hills - should have real data
      '94102', // San Francisco - should have real data  
      '95060', // Santa Cruz - test fallback
      '92101', // San Diego - test real data
      '95814', // Sacramento - test real data
      '93401', // San Luis Obispo - test less common area
      '96001', // Redding - test northern CA
      '92252', // Palm Springs - test desert area
      '90210', // Duplicate to test consistency
      
      // Edge cases 
      '95014', // Cupertino - tech area
      '91730', // Rancho Cucamonga - inland empire
      '93023', // Ojai - small city
    ];

    const sampleResults = [];
    let placeholderCount = 0;
    let realDataCount = 0;

    for (const zipCode of sampleZipCodes) {
      try {
        const response = await fetch(SERVER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipCode })
        });

        const data = await response.json();
        
        if (data.valid) {
          // Validate with real data criteria
          const validation = validator.validateRealData(zipCode, data);
          sampleResults.push({ zipCode, data, validation });

          // Check for placeholder violations
          const hasPlaceholder = validation.violations?.some(v => v.issue.includes('PLACEHOLDER')) || 
                                validation.warnings?.some(w => w.issue.includes('SUSPICIOUS'));

          if (hasPlaceholder || !validation.isRealData) {
            placeholderCount++;
            console.log(`   ❌ ${zipCode}: ${data.city}, ${data.county} [PLACEHOLDER DETECTED]`);
            
            // Show specific violations
            if (validation.violations) {
              validation.violations.forEach(v => {
                console.log(`      🚨 ${v.severity}: ${v.message}`);
              });
            }
          } else {
            realDataCount++;
            console.log(`   ✅ ${zipCode}: ${data.city}, ${data.county} [REAL DATA CONFIRMED]`);
          }
        } else {
          console.log(`   ❌ ${zipCode}: ${data.error} [VALIDATION FAILED]`);
        }
      } catch (error) {
        console.log(`   ❌ ${zipCode}: ${error.message} [REQUEST FAILED]`);
      }
    }

    console.log(`\n📊 SAMPLE RESULTS:`);
    console.log(`   Total Tested: ${sampleZipCodes.length}`);
    console.log(`   Real Data: ${realDataCount} (${((realDataCount/sampleZipCodes.length)*100).toFixed(1)}%)`);
    console.log(`   Placeholder Data: ${placeholderCount} (${((placeholderCount/sampleZipCodes.length)*100).toFixed(1)}%)`);

    // Step 2: Detailed analysis of data quality issues
    console.log('\n📋 PHASE 2: DETAILED DATA QUALITY ANALYSIS\n');

    // Analyze the validation results
    const validationReport = validator.generateValidationReport(
      sampleResults.map(r => r.validation).filter(v => v)
    );

    validator.printValidationReport(validationReport);

    // Step 3: Critical findings and recommendations
    console.log('\n🔍 PHASE 3: CRITICAL FINDINGS AND MISSION ASSESSMENT\n');

    const criticalIssues = [];
    const recommendations = [];

    // Check for specific placeholder patterns in the current system
    const testFallbackZip = '95999'; // Test edge case
    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: testFallbackZip })
      });
      const data = await response.json();

      console.log(`🧪 Fallback System Test (${testFallbackZip}):`)
      if (data.valid) {
        console.log(`   Response: ${data.city}, ${data.state}, ${data.county || 'N/A'}`);
        
        // Check for generic placeholder patterns
        const hasGenericPlaceholder = 
          data.city?.includes('area') || 
          data.city?.includes('Unknown') ||
          data.county?.includes('Unknown') ||
          !data.county;

        if (hasGenericPlaceholder) {
          criticalIssues.push('FALLBACK_SYSTEM_USES_PLACEHOLDERS');
          console.log(`   ❌ Fallback system generates placeholder data`);
        } else {
          console.log(`   ✅ Fallback system provides acceptable data`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Fallback test failed: ${error.message}`);
    }

    // Analysis of current system issues
    console.log(`\n🔍 SYSTEM ANALYSIS:`);
    
    // Check the actual API endpoint source code issues
    if (placeholderCount > 0) {
      criticalIssues.push('PLACEHOLDER_DATA_IN_RESPONSES');
      console.log(`   ❌ CRITICAL: ${placeholderCount} ZIP codes returned placeholder data`);
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Replace all placeholder data in ZIP_LOCATIONS and fallback functions',
        action: 'Update route.ts:121-144 getStateFromZip() to return real city names'
      });
    }

    // Check for missing county data
    const missingCounties = sampleResults.filter(r => 
      !r.data.county || r.data.county.includes('Unknown')
    );
    if (missingCounties.length > 0) {
      criticalIssues.push('MISSING_COUNTY_DATA');
      console.log(`   ❌ HIGH: ${missingCounties.length} ZIP codes missing proper county data`);
      recommendations.push({
        priority: 'HIGH', 
        issue: 'Add complete California county mapping',
        action: 'Integrate with authoritative county data source'
      });
    }

    // Check geocoding service integration
    console.log(`   🔍 Geocoding Service: ${realDataCount > placeholderCount ? 'Functioning' : 'Degraded'}`);
    if (realDataCount <= placeholderCount) {
      criticalIssues.push('GEOCODING_SERVICE_DEGRADED');
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Geocoding service not providing adequate real data',
        action: 'Fix geocodingService integration or improve fallback data quality'
      });
    }

    // Step 4: Mission success/failure assessment
    console.log('\n' + '='.repeat(80));
    console.log('🎯 AGENT 35 MISSION ASSESSMENT - CALIFORNIA ZIP VALIDATION');
    console.log('='.repeat(80));

    const successThreshold = 0.99; // 99% success rate required
    const currentSuccessRate = realDataCount / sampleZipCodes.length;
    const missionSuccess = currentSuccessRate >= successThreshold && placeholderCount === 0;

    if (missionSuccess) {
      console.log('🏆 MISSION STATUS: SUCCESS');
      console.log('✅ All sampled California ZIP codes return real, accurate data');
      console.log('✅ Zero placeholder or "unknown" values detected');
      console.log('✅ System meets production quality standards for California Phase 1');
      console.log('\n🚀 RECOMMENDATION: Proceed with full California deployment');
    } else {
      console.log('⚠️  MISSION STATUS: CRITICAL ISSUES DETECTED');
      console.log(`❌ Success rate: ${(currentSuccessRate*100).toFixed(1)}% (Required: ${successThreshold*100}%)`);
      console.log(`❌ Placeholder violations: ${placeholderCount} (Required: 0)`);
      console.log('❌ System NOT ready for California Phase 1 deployment');
      console.log('\n🔧 REQUIRED ACTIONS:');
      
      recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`      Action: ${rec.action}`);
      });
    }

    // Step 5: Next steps and implementation guidance
    console.log('\n📋 IMPLEMENTATION ROADMAP:');
    
    if (missionSuccess) {
      console.log('   1. Run full validation on all 1,797 California ZIP codes');
      console.log('   2. Performance testing under production load');
      console.log('   3. Monitor data freshness and accuracy over time');
    } else {
      console.log('   1. FIX CRITICAL: Update route.ts fallback functions');
      console.log('   2. FIX HIGH: Complete county data mapping');
      console.log('   3. TEST: Re-run validation after fixes');
      console.log('   4. VALIDATE: Full California ZIP code testing');
    }

    console.log('\n📊 DATA QUALITY REQUIREMENTS FOR PRODUCTION:');
    console.log('   ✅ 0% placeholder or "unknown" values');
    console.log('   ✅ 100% real city names (no "area" suffixes)');
    console.log('   ✅ 100% real county names with "County" suffix');
    console.log('   ✅ Valid California coordinates for all ZIP codes');
    console.log('   ✅ Accurate congressional district mappings (1-52)');

    console.log('\n' + '='.repeat(80));
    console.log('🎯 AGENT 35 MISSION REPORT COMPLETE');
    console.log('='.repeat(80));

    return {
      missionSuccess,
      criticalIssues,
      recommendations,
      sampleResults,
      validationReport
    };

  } catch (error) {
    console.error('❌ MISSION CRITICAL FAILURE:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute the comprehensive validation
runComprehensiveCaliforniaValidation()
  .then(result => {
    process.exit(result.missionSuccess ? 0 : 1);
  })
  .catch(error => {
    console.error('Mission failed:', error);
    process.exit(1);
  });