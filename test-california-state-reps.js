// Test California State Representatives Integration
const { openStatesService } = require('./services/openStatesService.ts');
const { californiaStateApi } = require('./services/californiaStateApi.ts');
const { integratedCaliforniaStateService } = require('./services/integratedCaliforniaState.service.ts');

async function testCaliforniaStateReps() {
  console.log('🏛️  Testing California State Representatives System');
  console.log('=' .repeat(60));

  // Test 1: OpenStates Service
  console.log('\n📊 Testing OpenStates Service...');
  try {
    const assemblyMembers = await openStatesService.getCaliforniaAssemblyMembers();
    const senateMembers = await openStatesService.getCaliforniaSenateMembers();
    const executives = await openStatesService.getCaliforniaExecutives();

    console.log(`✅ Assembly Members: ${assemblyMembers.length} found`);
    console.log(`✅ Senate Members: ${senateMembers.length} found`);
    console.log(`✅ Executives: ${executives.length} found`);

    if (assemblyMembers.length > 0) {
      const sample = assemblyMembers[0];
      console.log(`   Sample Assembly Member: ${sample.name} (District ${sample.district})`);
    }
  } catch (error) {
    console.error('❌ OpenStates Service Error:', error.message);
  }

  // Test 2: California State API
  console.log('\n🏛️  Testing California State API...');
  try {
    const governor = await californiaStateApi.getGovernor();
    const ltGovernor = await californiaStateApi.getLieutenantGovernor();
    const session = await californiaStateApi.getCurrentLegislativeSession();

    console.log(`✅ Governor: ${governor ? governor.name : 'Not found'}`);
    console.log(`✅ Lt. Governor: ${ltGovernor ? ltGovernor.name : 'Not found'}`);
    console.log(`✅ Current Session: ${session.year} (${session.status})`);
  } catch (error) {
    console.error('❌ California State API Error:', error.message);
  }

  // Test 3: Integrated Service
  console.log('\n🔄 Testing Integrated California Service...');
  try {
    const allReps = await integratedCaliforniaStateService.getAllCaliforniaRepresentatives();
    console.log(`✅ Total Representatives: ${allReps.total}`);
    console.log(`   - Assembly: ${allReps.assembly.length}`);
    console.log(`   - Senate: ${allReps.senate.length}`);
    console.log(`   - Executives: ${allReps.executives.length}`);

    // Test search functionality
    const searchResults = await integratedCaliforniaStateService.searchRepresentatives('newsom');
    console.log(`✅ Search Results for 'newsom': ${searchResults.length} found`);

  } catch (error) {
    console.error('❌ Integrated Service Error:', error.message);
  }

  // Test 4: District Coverage
  console.log('\n🗺️  Testing District Coverage...');
  try {
    const assemblyMembers = await integratedCaliforniaStateService.getAssemblyMembers();
    const senateMembers = await integratedCaliforniaStateService.getSenateMembers();

    // Check if all districts are covered
    const assemblyDistricts = new Set(assemblyMembers.map(rep => rep.district));
    const senateDistricts = new Set(senateMembers.map(rep => rep.district));

    console.log(`✅ Assembly Districts Covered: ${assemblyDistricts.size}/80`);
    console.log(`✅ Senate Districts Covered: ${senateDistricts.size}/40`);

    // Find any missing districts
    const missingAssembly = [];
    for (let i = 1; i <= 80; i++) {
      if (!assemblyDistricts.has(i)) {
        missingAssembly.push(i);
      }
    }

    const missingSenate = [];
    for (let i = 1; i <= 40; i++) {
      if (!senateDistricts.has(i)) {
        missingSenate.push(i);
      }
    }

    if (missingAssembly.length > 0) {
      console.log(`⚠️  Missing Assembly Districts: ${missingAssembly.join(', ')}`);
    }
    if (missingSenate.length > 0) {
      console.log(`⚠️  Missing Senate Districts: ${missingSenate.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ District Coverage Error:', error.message);
  }

  // Test 5: Data Quality Check
  console.log('\n🔍 Testing Data Quality...');
  try {
    const allReps = await integratedCaliforniaStateService.getAllCaliforniaRepresentatives();
    const allLegislators = [...allReps.assembly, ...allReps.senate];

    let contactInfoCount = 0;
    let photoUrlCount = 0;
    let committeeCount = 0;

    allLegislators.forEach(rep => {
      if (rep.contactInfo && (rep.contactInfo.phone || rep.contactInfo.email)) {
        contactInfoCount++;
      }
      if (rep.photoUrl) {
        photoUrlCount++;
      }
      if (rep.committees && rep.committees.length > 0) {
        committeeCount++;
      }
    });

    console.log(`✅ Representatives with Contact Info: ${contactInfoCount}/${allLegislators.length}`);
    console.log(`✅ Representatives with Photos: ${photoUrlCount}/${allLegislators.length}`);
    console.log(`✅ Representatives with Committee Info: ${committeeCount}/${allLegislators.length}`);

  } catch (error) {
    console.error('❌ Data Quality Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 California State Representatives Test Complete');
}

// Run the test
if (require.main === module) {
  testCaliforniaStateReps().catch(console.error);
}

module.exports = { testCaliforniaStateReps };