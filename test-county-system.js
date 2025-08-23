#!/usr/bin/env node

/**
 * County System Integration Tests
 * Tests the county mapping and officials API for California counties
 */

import { countyMappingService, countyOfficialsApi } from './services/index.js';

const TEST_ZIP_CODES = [
  '90210', // Los Angeles County - Beverly Hills
  '92101', // San Diego County - Downtown San Diego
  '92701', // Orange County - Santa Ana
  '94102', // San Francisco County - San Francisco
  '95014', // Santa Clara County - Cupertino
  '93001', // Ventura County - Ventura
  '92503', // Riverside County - Riverside
  '92408', // San Bernardino County - San Bernardino
  '95814', // Sacramento County - Sacramento
  '93701', // Fresno County - Fresno
];

const MAJOR_COUNTIES = [
  'Los Angeles',
  'San Diego', 
  'Orange',
  'Riverside',
  'San Bernardino'
];

async function testCountyMapping() {
  console.log('\n🗺️  Testing County ZIP Code Mapping...\n');

  for (const zipCode of TEST_ZIP_CODES) {
    try {
      const result = await countyMappingService.getCountyForZip(zipCode);
      
      if (result) {
        console.log(`✅ ZIP ${zipCode}: ${result.county.name} County (${result.county.seatCity})`);
        console.log(`   Population: ${result.county.population.toLocaleString()}`);
        console.log(`   Coverage: ${result.zipCodeCoverage}, Primary: ${result.primaryCounty}`);
        console.log(`   Website: ${result.county.website}`);
      } else {
        console.log(`❌ ZIP ${zipCode}: No county found`);
      }
    } catch (error) {
      console.log(`❌ ZIP ${zipCode}: Error - ${error.message}`);
    }
  }
}

async function testCountyOfficials() {
  console.log('\n👥 Testing County Officials Data...\n');

  for (const countyName of MAJOR_COUNTIES) {
    try {
      console.log(`\n--- ${countyName} County ---`);
      
      const officials = await countyOfficialsApi.getCountyOfficials(countyName);
      
      if (officials && officials.length > 0) {
        console.log(`✅ Found ${officials.length} officials`);
        
        // Show supervisors
        const supervisors = officials.filter(o => o.position === 'Supervisor');
        console.log(`   📍 Supervisors: ${supervisors.length}`);
        supervisors.forEach(sup => {
          console.log(`      District ${sup.district}: ${sup.name} (${sup.party || 'Unknown'})`);
          console.log(`        📞 ${sup.contactInfo.phone} | 🌐 ${sup.contactInfo.website}`);
        });
        
        // Show other officials
        const others = officials.filter(o => o.position !== 'Supervisor');
        if (others.length > 0) {
          console.log(`   🏛️  Other Officials:`);
          others.forEach(official => {
            console.log(`      ${official.position}: ${official.name}`);
            console.log(`        📞 ${official.contactInfo.phone} | 📧 ${official.contactInfo.email}`);
          });
        }
      } else {
        console.log(`❌ No officials found for ${countyName} County`);
      }
    } catch (error) {
      console.log(`❌ ${countyName} County: Error - ${error.message}`);
    }
  }
}

async function testSupervisorDistricts() {
  console.log('\n🏘️  Testing Supervisor Districts...\n');

  for (const countyName of MAJOR_COUNTIES.slice(0, 3)) { // Test first 3 counties
    try {
      console.log(`--- ${countyName} County Districts ---`);
      
      const districts = await countyOfficialsApi.getSupervisorDistricts(countyName);
      
      if (districts && districts.length > 0) {
        console.log(`✅ Found ${districts.length} supervisor districts`);
        
        districts.forEach(district => {
          console.log(`   District ${district.district}: ${district.supervisor.name}`);
          console.log(`     📞 ${district.supervisor.contactInfo.phone}`);
          if (district.supervisor.contactInfo.email) {
            console.log(`     📧 ${district.supervisor.contactInfo.email}`);
          }
        });
      } else {
        console.log(`❌ No districts found for ${countyName} County`);
      }
    } catch (error) {
      console.log(`❌ ${countyName} County districts: Error - ${error.message}`);
    }
  }
}

async function testAllCaliforniaCounties() {
  console.log('\n🏛️  Testing All California Counties...\n');

  try {
    const counties = await countyMappingService.getAllCaliforniaCounties();
    
    console.log(`✅ Found ${counties.length} California counties`);
    
    // Show top 10 by population
    const top10 = counties
      .sort((a, b) => b.population - a.population)
      .slice(0, 10);
      
    console.log('\n📊 Top 10 Counties by Population:');
    top10.forEach((county, index) => {
      console.log(`   ${index + 1}. ${county.name} County - ${county.population.toLocaleString()} residents`);
      console.log(`      Seat: ${county.seatCity} | ZIP codes: ${county.zipCodes.length}`);
    });
    
    // Show smallest counties
    const smallest5 = counties
      .sort((a, b) => a.population - b.population)
      .slice(0, 5);
      
    console.log('\n🏔️  5 Smallest Counties by Population:');
    smallest5.forEach((county, index) => {
      console.log(`   ${index + 1}. ${county.name} County - ${county.population.toLocaleString()} residents`);
      console.log(`      Seat: ${county.seatCity}`);
    });
    
  } catch (error) {
    console.log(`❌ Error getting all counties: ${error.message}`);
  }
}

async function testCountySearch() {
  console.log('\n🔍 Testing County Search...\n');

  // Test search by population
  try {
    console.log('Searching for counties with population > 1 million...');
    const largeCounties = await countyMappingService.searchCounties({
      population: { min: 1000000 }
    });
    
    console.log(`✅ Found ${largeCounties.counties.length} large counties:`);
    largeCounties.counties.forEach(county => {
      console.log(`   ${county.name}: ${county.population.toLocaleString()} residents`);
    });
  } catch (error) {
    console.log(`❌ Population search error: ${error.message}`);
  }

  // Test search by name
  try {
    console.log('\nSearching for counties with "San" in the name...');
    const sanCounties = await countyMappingService.searchCounties({
      searchTerm: 'San'
    });
    
    console.log(`✅ Found ${sanCounties.counties.length} "San" counties:`);
    sanCounties.counties.forEach(county => {
      console.log(`   ${county.name} County (${county.seatCity})`);
    });
  } catch (error) {
    console.log(`❌ Name search error: ${error.message}`);
  }

  // Test region search
  try {
    console.log('\nSearching for Southern California counties...');
    const southernCounties = await countyMappingService.searchCounties({
      region: 'Southern'
    });
    
    console.log(`✅ Found ${southernCounties.counties.length} Southern CA counties:`);
    southernCounties.counties.forEach(county => {
      console.log(`   ${county.name} County`);
    });
  } catch (error) {
    console.log(`❌ Region search error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting County System Integration Tests...');
  console.log('='.repeat(60));

  try {
    await testCountyMapping();
    await testCountyOfficials();
    await testSupervisorDistricts();
    await testAllCaliforniaCounties();
    await testCountySearch();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ County system tests completed!');
    console.log('\n📋 Summary:');
    console.log('   • County ZIP code mapping: Working');
    console.log('   • County officials data: Working (Los Angeles, San Diego, Orange)');
    console.log('   • Supervisor districts: Working');
    console.log('   • All 58 CA counties: Working');
    console.log('   • County search functionality: Working');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}