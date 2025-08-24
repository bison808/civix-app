/**
 * Run California ZIP code validation against the running CITZN server
 */

const CaliforniaZipValidationFramework = require('./california-zip-validation-framework');
const RealDataValidationCriteria = require('./real-data-validation-criteria');

async function runValidation() {
  const framework = new CaliforniaZipValidationFramework();
  const validator = new RealDataValidationCriteria();

  const SERVER_URL = 'http://localhost:3015/api/auth/verify-zip';

  console.log('🎯 Agent 35: California ZIP Code Validation Mission Starting\n');
  console.log(`🔗 Testing against server: ${SERVER_URL}\n`);

  try {
    // Run quick validation on representative ZIP codes
    console.log('Phase 1: Quick validation test on representative ZIP codes...\n');
    const quickResults = await framework.runQuickValidationTest([
      '90210', '90001', '91101', // LA area
      '94102', '94301', '95014', // Bay Area
      '92101', '92037', '91910', // San Diego
      '95814', '93701', '93301', // Central Valley
      '92602', '92801', '92660', // Orange County
      '93401', '93101', '95060'  // Central Coast
    ]);

    console.log('\n='.repeat(60));
    console.log('Phase 2: Real data validation criteria analysis...\n');

    const realDataValidations = [];
    
    // Test each ZIP code with detailed validation
    for (const result of quickResults) {
      if (result.success && result.data) {
        const validation = validator.validateRealData(result.zipCode, result.data);
        realDataValidations.push(validation);

        const status = validation.isRealData ? '✅' : '❌';
        const accuracyStatus = validation.accuracy.overall;
        const issueCount = (validation.violations?.length || 0) + (validation.warnings?.length || 0);

        console.log(`   ${status} ${result.zipCode}: ${result.data.city}, ${result.data.county} [${accuracyStatus}]${issueCount > 0 ? ` (${issueCount} issues)` : ''}`);

        // Show specific violations
        if (validation.violations && validation.violations.length > 0) {
          validation.violations.forEach(v => {
            console.log(`      🚨 ${v.severity}: ${v.message}`);
          });
        }

        // Show warnings
        if (validation.warnings && validation.warnings.length > 0) {
          validation.warnings.forEach(w => {
            console.log(`      ⚠️  ${w.severity}: ${w.message}`);
          });
        }
      } else {
        console.log(`   ❌ ${result.zipCode}: ${result.error}`);
      }
    }

    // Generate comprehensive report
    console.log('\n='.repeat(60));
    console.log('Phase 3: Generating validation report...\n');

    const validationReport = validator.generateValidationReport(realDataValidations);
    validator.printValidationReport(validationReport);

    // Final assessment
    console.log('\n' + '='.repeat(80));
    console.log('🎯 AGENT 35 MISSION ASSESSMENT');
    console.log('='.repeat(80));

    const realDataCount = realDataValidations.filter(v => v.isRealData).length;
    const totalValidated = realDataValidations.length;
    const realDataPercentage = ((realDataCount / totalValidated) * 100).toFixed(1);

    console.log(`\n📊 QUICK VALIDATION RESULTS:`);
    console.log(`   ZIP Codes Tested: ${totalValidated}`);
    console.log(`   Real Data Confirmed: ${realDataCount} (${realDataPercentage}%)`);
    console.log(`   Placeholder Detected: ${totalValidated - realDataCount}`);

    // Mission success criteria
    const missionSuccess = validationReport.summary.placeholderDetected === 0 && 
                          validationReport.summary.criticalViolations === 0 &&
                          realDataPercentage >= 95;

    if (missionSuccess) {
      console.log('\n🏆 MISSION STATUS: SUCCESS');
      console.log('✅ Sample data shows no placeholder values');
      console.log('✅ All critical validation criteria met');
      console.log('✅ Ready for full validation of all 1,797 California ZIP codes');
    } else {
      console.log('\n⚠️  MISSION STATUS: ISSUES DETECTED');
      console.log('❌ Placeholder values or data quality issues found');
      console.log('🔧 System requires fixes before full production deployment');
    }

    console.log('\n📋 NEXT STEPS:');
    if (missionSuccess) {
      console.log('   1. Run full validation: node california-zip-validation-framework.js full');
      console.log('   2. Monitor performance under load');
      console.log('   3. Implement any minor improvements identified');
    } else {
      console.log('   1. Fix placeholder data issues identified above');
      console.log('   2. Verify geographic data accuracy');
      console.log('   3. Re-run validation after fixes');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Validation mission failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the validation
runValidation();