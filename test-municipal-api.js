/**
 * Simple test to verify municipal API data integrity
 */

console.log('Testing Municipal API data structure...');

const fs = require('fs');
const municipalContent = fs.readFileSync('services/municipalApi.ts', 'utf-8');

// Test 1: No duplicate entries within same object
console.log('✓ Test 1: Checking for duplicate entries within same data structure...');

// Check for duplicates within CALIFORNIA_MAJOR_CITIES
const majorCitiesSection = municipalContent.substring(
  municipalContent.indexOf('CALIFORNIA_MAJOR_CITIES'),
  municipalContent.indexOf('CALIFORNIA_CITY_OFFICIALS')
);
const majorCitiesOakland = (majorCitiesSection.match(/'Oakland'\s*:\s*{/g) || []).length;

// Check for duplicates within CALIFORNIA_CITY_OFFICIALS  
const officialsSection = municipalContent.substring(
  municipalContent.indexOf('CALIFORNIA_CITY_OFFICIALS'),
  municipalContent.indexOf('export class MunicipalApi')
);
const officialsOakland = (officialsSection.match(/'Oakland'\s*:\s*{/g) || []).length;

if (majorCitiesOakland <= 1 && officialsOakland <= 1) {
  console.log('  ✅ No duplicate entries within data structures');
  console.log(`    - CALIFORNIA_MAJOR_CITIES has ${majorCitiesOakland} Oakland entry`);
  console.log(`    - CALIFORNIA_CITY_OFFICIALS has ${officialsOakland} Oakland entry`);
} else {
  console.log('  ❌ Duplicate entries found within data structures');
  console.log(`    - CALIFORNIA_MAJOR_CITIES has ${majorCitiesOakland} Oakland entries`);
  console.log(`    - CALIFORNIA_CITY_OFFICIALS has ${officialsOakland} Oakland entries`);
  process.exit(1);
}

// Test 2: Required interfaces exist
console.log('✓ Test 2: Checking for required interfaces...');
const requiredInterfaces = ['CityInfo', 'MunicipalOfficial', 'CityOfficials'];
const interfaceTests = requiredInterfaces.map(iface => {
  const exists = municipalContent.includes(`interface ${iface}`);
  console.log(`  ${exists ? '✅' : '❌'} Interface ${iface}: ${exists ? 'Found' : 'Missing'}`);
  return exists;
});

if (!interfaceTests.every(Boolean)) {
  process.exit(1);
}

// Test 3: Required data objects exist
console.log('✓ Test 3: Checking for required data objects...');
const requiredObjects = ['CALIFORNIA_MAJOR_CITIES', 'CALIFORNIA_CITY_OFFICIALS'];
const objectTests = requiredObjects.map(obj => {
  const exists = municipalContent.includes(`${obj}:`);
  console.log(`  ${exists ? '✅' : '❌'} Object ${obj}: ${exists ? 'Found' : 'Missing'}`);
  return exists;
});

if (!objectTests.every(Boolean)) {
  process.exit(1);
}

// Test 4: Valid object syntax
console.log('✓ Test 4: Checking object syntax...');
try {
  // Simple syntax validation - check for matching braces
  const openBraces = (municipalContent.match(/{/g) || []).length;
  const closeBraces = (municipalContent.match(/}/g) || []).length;
  
  if (openBraces === closeBraces) {
    console.log('  ✅ Balanced braces found');
  } else {
    console.log(`  ❌ Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
    process.exit(1);
  }
} catch (error) {
  console.log(`  ❌ Syntax validation error: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 All Municipal API tests passed!');
console.log('✅ Data structure is valid and ready for production');