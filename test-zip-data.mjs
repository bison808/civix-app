import { getRepsByZip } from './services/congress2025.ts';

const testZips = [
  { zip: '02139', expectedCity: 'Cambridge', expectedState: 'MA' },
  { zip: '80202', expectedCity: 'Denver', expectedState: 'CO' },
  { zip: '10001', expectedCity: 'New York', expectedState: 'NY' }
];

console.log('=== CITZN ZIP Code Data Validation ===\n');

testZips.forEach(({ zip, expectedCity, expectedState }) => {
  console.log(`Testing ZIP: ${zip} (${expectedCity}, ${expectedState})`);
  console.log('-'.repeat(50));
  
  try {
    const reps = getRepsByZip(zip);
    console.log(`Found ${reps.length} representatives:`);
    
    reps.forEach(rep => {
      console.log(`  ${rep.chamber}: ${rep.name}`);
      console.log(`    Party: ${rep.party}`);
      console.log(`    State: ${rep.state}`);
      if (rep.district) console.log(`    District: ${rep.district}`);
      console.log(`    Term: ${rep.termStart} - ${rep.termEnd}`);
    });
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
  }
  
  console.log('');
});