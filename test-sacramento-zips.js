/**
 * Test script to verify Sacramento ZIP code mapping bug
 * Tests both geocodingService fallback and municipalApi lookup
 */

const { geocodingService } = require('./services/geocodingService.ts');
const { municipalApi } = require('./services/municipalApi.ts');

async function testSacramentoZipCodes() {
  console.log('Testing Sacramento ZIP Code Mapping Bug');
  console.log('=====================================');
  
  const testZips = ['95814', '95815', '95816', '95817', '95818', '95819', '95820'];
  
  for (const zipCode of testZips) {
    console.log(`\nTesting ZIP: ${zipCode}`);
    console.log('-'.repeat(30));
    
    try {
      // Test 1: Geocoding Service Fallback
      console.log('1. Geocoding Service Fallback:');
      const geocodingResult = await geocodingService.getDistrictsForZip(zipCode, {
        useCache: false,
        includeFallback: true
      });
      console.log(`   City: ${geocodingResult.city}`);
      console.log(`   County: ${geocodingResult.county}`);
      console.log(`   Source: ${geocodingResult.source}`);
      
      // Test 2: Municipal API Lookup
      console.log('2. Municipal API Lookup:');
      const cityInfo = await municipalApi.getCityForZip(zipCode);
      if (cityInfo) {
        console.log(`   City Name: ${cityInfo.name}`);
        console.log(`   County: ${cityInfo.county}`);
        console.log(`   Incorporated: ${cityInfo.incorporated}`);
      } else {
        console.log('   No city data found');
      }
      
      // Test 3: Municipal Representatives
      console.log('3. Municipal Representatives:');
      const municipalReps = await municipalApi.getMunicipalRepresentatives(zipCode);
      console.log(`   Found ${municipalReps.length} municipal representatives`);
      if (municipalReps.length > 0) {
        console.log(`   Mayor: ${municipalReps.find(r => r.title === 'Mayor')?.name || 'Not found'}`);
        console.log(`   Council Members: ${municipalReps.filter(r => r.title.includes('Council')).length}`);
      }
      
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }
  
  // Test specific issues
  console.log('\n\nSPECIFIC BUG ANALYSIS');
  console.log('=====================');
  
  // Bug 1: Sacramento showing "unknown city"
  console.log('\nBug 1: Sacramento ZIP showing "unknown city"');
  try {
    const result = await geocodingService.getDistrictsForZip('95814', { includeFallback: true });
    console.log(`Result for 95814: City="${result.city}", County="${result.county}"`);
    
    if (result.city === 'Unknown City') {
      console.log('🐛 BUG CONFIRMED: Sacramento ZIP 95814 shows "Unknown City"');
      console.log('Root cause: Fallback mapping in geocodingService.ts line 328 uses generic "Sacramento Area"');
    } else if (result.city === 'Sacramento Area') {
      console.log('⚠️  PARTIAL BUG: Shows "Sacramento Area" instead of "Sacramento"');
    } else {
      console.log('✅ Bug appears to be fixed');
    }
  } catch (error) {
    console.error('Error testing Sacramento bug:', error.message);
  }
  
  // Bug 2: Unincorporated area detection
  console.log('\nBug 2: Unincorporated area detection');
  try {
    const cityInfo = await municipalApi.getCityForZip('95814');
    const municipalReps = await municipalApi.getMunicipalRepresentatives('95814');
    
    console.log(`City incorporated status: ${cityInfo?.incorporated}`);
    console.log(`Municipal reps returned: ${municipalReps.length}`);
    
    if (cityInfo?.incorporated && municipalReps.length > 0) {
      console.log('✅ Incorporated area correctly returns city representatives');
    } else if (!cityInfo?.incorporated && municipalReps.length === 0) {
      console.log('✅ Unincorporated area correctly returns no city representatives');
    } else {
      console.log('🐛 BUG: Inconsistent incorporated area logic');
    }
  } catch (error) {
    console.error('Error testing unincorporated area logic:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSacramentoZipCodes().catch(console.error);
}

module.exports = { testSacramentoZipCodes };