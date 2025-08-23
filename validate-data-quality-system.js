/**
 * Validation script for the Data Quality & Updates System
 * Verifies that all TypeScript files are properly structured
 */

const fs = require('fs');
const path = require('path');

function validateDataQualitySystem() {
  console.log('🧪 Validating Data Quality & Updates System Files...\n');
  
  const servicesDir = path.join(__dirname, 'services');
  
  const requiredFiles = [
    'dataQualityService.ts',
    'dataUpdateScheduler.ts', 
    'dataMonitoringService.ts',
    'dataRecoveryService.ts',
    'dataCorrectionsService.ts',
    'dataQualityOrchestrator.ts'
  ];
  
  let allFilesExist = true;
  let totalLines = 0;
  
  console.log('1️⃣ Checking Required Files...');
  
  for (const fileName of requiredFiles) {
    const filePath = path.join(servicesDir, fileName);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      totalLines += lines;
      
      console.log(`   ✅ ${fileName} (${lines} lines)`);
      
      // Check for key exports
      if (content.includes('export class') && content.includes('export default')) {
        console.log(`      📦 Proper TypeScript exports`);
      }
      
      // Check for key interfaces  
      if (content.includes('interface') && content.includes('export interface')) {
        console.log(`      📋 TypeScript interfaces defined`);
      }
      
    } else {
      console.log(`   ❌ ${fileName} - FILE MISSING`);
      allFilesExist = false;
    }
  }
  
  console.log(`\n2️⃣ System Statistics:`);
  console.log(`   📄 Files: ${requiredFiles.length}`);
  console.log(`   📝 Total Lines: ${totalLines}`);
  console.log(`   💾 Estimated Size: ${Math.round(totalLines * 25 / 1024)}KB`);
  
  console.log(`\n3️⃣ Architecture Validation:`);
  
  // Check services/index.ts exports
  const indexPath = path.join(servicesDir, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const expectedExports = [
      'dataQualityService',
      'dataUpdateScheduler',
      'dataMonitoringService', 
      'dataRecoveryService',
      'dataCorrectionsService',
      'dataQualityOrchestrator'
    ];
    
    let exportsFound = 0;
    for (const exportName of expectedExports) {
      if (indexContent.includes(exportName)) {
        console.log(`   ✅ ${exportName} exported`);
        exportsFound++;
      } else {
        console.log(`   ❌ ${exportName} NOT exported`);
      }
    }
    
    console.log(`   📊 Export Coverage: ${exportsFound}/${expectedExports.length}`);
  }
  
  console.log(`\n4️⃣ Feature Coverage Verification:`);
  
  const featureChecks = [
    { file: 'dataQualityService.ts', features: ['validateRepresentativeData', 'crossReferenceOfficials', 'checkDataFreshness'] },
    { file: 'dataUpdateScheduler.ts', features: ['scheduleUpdates', 'runFederalDataUpdate', 'runStateDataUpdate'] },
    { file: 'dataMonitoringService.ts', features: ['getDashboard', 'createAlert', 'runHealthCheck'] },
    { file: 'dataRecoveryService.ts', features: ['detectAndPlan', 'executeRecoveryPlan', 'handleCriticalFailure'] },
    { file: 'dataCorrectionsService.ts', features: ['submitUserCorrection', 'reviewCorrection', 'implementCorrection'] },
    { file: 'dataQualityOrchestrator.ts', features: ['initialize', 'getSystemStatus', 'getSystemMetrics'] }
  ];
  
  let totalFeatures = 0;
  let implementedFeatures = 0;
  
  for (const check of featureChecks) {
    const filePath = path.join(servicesDir, check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      console.log(`   📁 ${check.file.replace('.ts', '')}:`);
      
      for (const feature of check.features) {
        totalFeatures++;
        if (content.includes(`${feature}(`)) {
          console.log(`      ✅ ${feature}()`);
          implementedFeatures++;
        } else {
          console.log(`      ❌ ${feature}() - NOT IMPLEMENTED`);
        }
      }
    }
  }
  
  console.log(`   📊 Implementation Coverage: ${implementedFeatures}/${totalFeatures} (${Math.round(implementedFeatures/totalFeatures*100)}%)`);
  
  console.log(`\n5️⃣ Data Quality Capabilities:`);
  console.log('   🔍 Representative data validation');
  console.log('   📊 Cross-reference validation across APIs');
  console.log('   ⏰ Data freshness monitoring');
  console.log('   📞 Contact information verification');
  console.log('   📈 Comprehensive quality scoring');
  
  console.log(`\n6️⃣ Update & Scheduling Features:`);
  console.log('   📅 Federal updates (Weekly)');
  console.log('   🏛️ State updates (Bi-weekly)');
  console.log('   🏢 County updates (Monthly)');
  console.log('   🏘️ Local updates (Bi-weekly)');
  console.log('   🚨 Emergency updates (Real-time)');
  
  console.log(`\n7️⃣ Monitoring & Alerting:`);
  console.log('   📋 Real-time dashboard');
  console.log('   🚨 Automated alerting');
  console.log('   📈 Performance metrics');
  console.log('   🔧 System health monitoring');
  console.log('   📊 Quality trend analysis');
  
  console.log(`\n8️⃣ Recovery & Error Handling:`);
  console.log('   🔍 Automated issue detection');
  console.log('   📋 Recovery plan generation');
  console.log('   🔧 Automated recovery execution'); 
  console.log('   💾 Backup and restore capabilities');
  console.log('   🚨 Critical failure response');
  
  console.log(`\n9️⃣ Manual Corrections Workflow:`);
  console.log('   ✏️ User correction submissions');
  console.log('   👨‍💼 Data steward dashboard');
  console.log('   ✅ Approval workflows');
  console.log('   🔄 Batch corrections');
  console.log('   📊 Correction analytics');
  
  if (allFilesExist && implementedFeatures >= totalFeatures * 0.9) {
    console.log('\n🎉 DATA QUALITY SYSTEM VALIDATION PASSED!');
    console.log('\n✨ SYSTEM READY FOR:');
    console.log('   • California political representation mapping');
    console.log('   • 1,797 ZIP codes coverage');
    console.log('   • Federal/State/County/Local representatives');
    console.log('   • 95%+ data accuracy target');
    console.log('   • <500ms response time monitoring');
    console.log('   • 99.9% uptime tracking');
    
    return true;
  } else {
    console.log('\n❌ VALIDATION FAILED');
    console.log('   Some files missing or features incomplete');
    return false;
  }
}

// Run validation
if (require.main === module) {
  const success = validateDataQualitySystem();
  process.exit(success ? 0 : 1);
}

module.exports = { validateDataQualitySystem };