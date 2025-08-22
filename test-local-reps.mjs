// Test script to verify local representatives show real data
import { civicInfoService } from './services/civicInfoService.ts';

async function testLocalReps() {
  console.log('\n🔍 Testing Local Representatives Data\n');
  console.log('=' .repeat(50));
  
  const testCases = [
    { city: 'Beverly Hills', state: 'CA', expectedMayor: 'Lester Friedman' },
    { city: 'New York', state: 'NY', expectedMayor: 'Eric Adams' },
    { city: 'Houston', state: 'TX', expectedMayor: 'John Whitmire' },
    { city: 'Chicago', state: 'IL', expectedMayor: 'Brandon Johnson' },
    { city: 'Boston', state: 'MA', expectedMayor: 'Michelle Wu' },
    { city: 'San Francisco', state: 'CA', expectedMayor: 'London Breed' },
    { city: 'Los Angeles', state: 'CA', expectedMayor: 'Karen Bass' },
    { city: 'Miami Beach', state: 'FL', expectedMayor: 'Steven Meiner' },
  ];
  
  let realMayorsCount = 0;
  let placeholderCount = 0;
  
  for (const test of testCases) {
    console.log(`\nTesting: ${test.city}, ${test.state}`);
    console.log('-'.repeat(40));
    
    try {
      const officials = await civicInfoService.getLocalOfficials(test.city, test.state);
      
      const mayor = officials.find(rep => rep.title === 'Mayor');
      const councilMembers = officials.filter(rep => rep.title.includes('Council'));
      
      if (mayor) {
        console.log(`✅ Mayor found: ${mayor.name}`);
        
        // Check if it's the real mayor name or placeholder
        if (mayor.name === test.expectedMayor) {
          console.log('   ✓ REAL mayor data verified!');
          realMayorsCount++;
        } else if (mayor.name.includes('Mayor of')) {
          console.log('   ⚠️  Placeholder mayor name');
          placeholderCount++;
        } else {
          console.log(`   ℹ️  Different mayor found: ${mayor.name}`);
          realMayorsCount++;
        }
        
        console.log(`   Party: ${mayor.party}`);
        console.log(`   Phone: ${mayor.contactInfo.phone}`);
        console.log(`   Website: ${mayor.contactInfo.website}`);
      } else {
        console.log('❌ No mayor found');
      }
      
      console.log(`   City Council: ${councilMembers.length} members`);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Real mayors with actual names: ${realMayorsCount}/${testCases.length}`);
  console.log(`⚠️  Placeholder mayors: ${placeholderCount}/${testCases.length}`);
  
  if (realMayorsCount >= testCases.length * 0.8) {
    console.log('\n🎉 SUCCESS: Most mayors show real data!');
  } else {
    console.log('\n⚠️  WARNING: Many mayors still show placeholder data');
  }
  
  console.log('='.repeat(50) + '\n');
}

// Run the test
testLocalReps().catch(console.error);