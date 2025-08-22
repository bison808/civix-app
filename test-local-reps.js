// Test script to verify local representatives show real data
const { api } = require('./services/api.ts');

async function testLocalReps() {
  console.log('\n🔍 Testing Local Representatives Data\n');
  console.log('=' .repeat(50));
  
  const testZipCodes = [
    { zip: '90210', expectedCity: 'Beverly Hills', expectedState: 'CA', expectedMayor: 'Lester Friedman' },
    { zip: '10001', expectedCity: 'New York', expectedState: 'NY', expectedMayor: 'Eric Adams' },
    { zip: '77001', expectedCity: 'Houston', expectedState: 'TX', expectedMayor: 'John Whitmire' },
    { zip: '60601', expectedCity: 'Chicago', expectedState: 'IL', expectedMayor: 'Brandon Johnson' },
    { zip: '02101', expectedCity: 'Boston', expectedState: 'MA', expectedMayor: 'Michelle Wu' },
    { zip: '94102', expectedCity: 'San Francisco', expectedState: 'CA', expectedMayor: 'London Breed' },
    { zip: '98101', expectedCity: 'Seattle', expectedState: 'WA', expectedMayor: 'Bruce Harrell' },
    { zip: '33139', expectedCity: 'Miami Beach', expectedState: 'FL', expectedMayor: 'Steven Meiner' },
  ];
  
  for (const test of testZipCodes) {
    console.log(`\nTesting ZIP: ${test.zip} (${test.expectedCity}, ${test.expectedState})`);
    console.log('-'.repeat(40));
    
    try {
      const reps = await api.representatives.getByZipCode(test.zip);
      
      // Find local officials
      const localOfficials = reps.filter(rep => 
        rep.chamber === 'Local' || 
        rep.title === 'Mayor' || 
        rep.title.includes('Council')
      );
      
      const mayor = localOfficials.find(rep => rep.title === 'Mayor');
      const councilMembers = localOfficials.filter(rep => rep.title.includes('Council'));
      
      if (mayor) {
        console.log(`✅ Mayor found: ${mayor.name}`);
        
        // Check if it's the real mayor name or placeholder
        if (mayor.name === test.expectedMayor) {
          console.log('   ✓ REAL mayor data!');
        } else if (mayor.name.includes('Local Mayor') || mayor.name.includes('Mayor of')) {
          console.log('   ⚠️  Placeholder mayor name');
        } else {
          console.log(`   ℹ️  Different mayor: ${mayor.name}`);
        }
        
        console.log(`   Party: ${mayor.party}`);
        console.log(`   Phone: ${mayor.contactInfo.phone}`);
        console.log(`   Website: ${mayor.contactInfo.website}`);
      } else {
        console.log('❌ No mayor found');
      }
      
      console.log(`\n   City Council: ${councilMembers.length} members found`);
      
      if (councilMembers.length > 0) {
        const firstCouncil = councilMembers[0];
        if (firstCouncil.name.includes('Council Member 1') || 
            firstCouncil.name.includes('City Council Member')) {
          console.log('   ⚠️  Placeholder council names detected');
        } else {
          console.log('   ✓ Council members have specific district names');
        }
      }
      
      // Summary
      const totalReps = reps.length;
      const federalReps = reps.filter(rep => rep.chamber === 'House' || rep.chamber === 'Senate').length;
      const stateReps = reps.filter(rep => rep.title.includes('State')).length;
      
      console.log(`\n   Total Representatives: ${totalReps}`);
      console.log(`   - Federal: ${federalReps}`);
      console.log(`   - State: ${stateReps}`);
      console.log(`   - Local: ${localOfficials.length}`);
      
    } catch (error) {
      console.error(`❌ Error testing ${test.zip}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Test Complete!');
  console.log('='.repeat(50) + '\n');
}

// Run the test
testLocalReps().catch(console.error);