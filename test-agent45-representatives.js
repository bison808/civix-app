#!/usr/bin/env node

/**
 * Agent 48 Validation: Test Agent 45's House Representatives (Districts 11-52)
 * 
 * CRITICAL TEST: Verify Agent 45 added real representative names
 * for all 43 missing House districts (11-52) instead of generic placeholders
 */

console.log('🔍 Agent 48: Testing Agent 45 House Representatives...\n');

const testRepresentatives = async () => {
  try {
    // Import the California federal reps data
    const { californiaFederalReps } = await import('./services/californiaFederalReps.ts');
    
    console.log('📊 Validating Districts 11-52 have real representative names...\n');
    
    const results = [];
    let passCount = 0;
    let totalDistricts = 0;
    
    // Test districts 11-52
    for (let district = 11; district <= 52; district++) {
      totalDistricts++;
      const districtString = district.toString();
      
      // Find representative for this district
      const rep = californiaFederalReps.find(r => 
        r.district === districtString && r.chamber === 'House'
      );
      
      if (rep) {
        const hasRealName = rep.name && 
          !rep.name.includes('Representative District') &&
          !rep.name.includes('Mock District') &&
          rep.name !== `District ${district}` &&
          rep.name.length > 5; // Real names are longer than generic ones
        
        if (hasRealName) {
          console.log(`✅ District ${district}: ${rep.name} (${rep.party}) - PASS`);
          passCount++;
        } else {
          console.log(`❌ District ${district}: "${rep.name}" - GENERIC NAME DETECTED`);
        }
        
        results.push({
          district,
          name: rep.name,
          party: rep.party,
          hasRealName,
          found: true
        });
      } else {
        console.log(`❌ District ${district}: NO REPRESENTATIVE FOUND`);
        results.push({
          district,
          name: null,
          party: null,
          hasRealName: false,
          found: false
        });
      }
    }
    
    console.log(`\n📊 Agent 45 House Representatives Validation Results: ${passCount}/${totalDistricts} PASSED`);
    
    if (passCount === totalDistricts) {
      console.log('🎉 All districts 11-52 have real representative names! Agent 45 validation: PASSED');
    } else {
      const failCount = totalDistricts - passCount;
      console.log(`❌ ${failCount} districts still need fixes. Agent 45 validation: FAILED`);
    }
    
    // Additional verification: Check for any remaining generic patterns
    console.log('\n🔍 Checking for generic patterns in all House representatives...');
    const allHouseReps = californiaFederalReps.filter(r => r.chamber === 'House');
    const genericPatterns = [
      'Representative District',
      'Mock District',
      'District [0-9]',
      'Rep District',
      'Generic',
      'Placeholder'
    ];
    
    let genericCount = 0;
    allHouseReps.forEach(rep => {
      const hasGenericPattern = genericPatterns.some(pattern => 
        rep.name.includes(pattern.replace('[0-9]', '')) || 
        /District \d+/.test(rep.name)
      );
      
      if (hasGenericPattern) {
        console.log(`⚠️ Generic pattern found: District ${rep.district} - "${rep.name}"`);
        genericCount++;
      }
    });
    
    if (genericCount === 0) {
      console.log('✅ No generic patterns detected in House representatives');
    } else {
      console.log(`❌ ${genericCount} generic patterns still detected`);
    }
    
    return { 
      results, 
      passCount, 
      totalDistricts,
      genericCount,
      agent45ValidationPassed: passCount === totalDistricts && genericCount === 0
    };
    
  } catch (error) {
    console.error('❌ Critical error during representative validation:', error);
    return { error: error.message, results: [] };
  }
};

if (require.main === module) {
  testRepresentatives().catch(console.error);
}

module.exports = { testRepresentatives };