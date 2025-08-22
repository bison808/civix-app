/**
 * QA Testing Script for CITZN Platform ZIP Code Functionality
 * Tests various ZIP codes and documents results
 */

const testCases = [
  {
    zip: '02134',
    expected: 'Boston, MA',
    description: 'Boston ZIP code test'
  },
  {
    zip: '90210',
    expected: 'Beverly Hills, CA',
    description: 'Beverly Hills ZIP code test'
  },
  {
    zip: '10001',
    expected: 'New York, NY',
    description: 'New York City ZIP code test'
  },
  {
    zip: '99999',
    expected: 'ERROR',
    description: 'Invalid ZIP code test'
  }
];

async function runZIPCodeTests() {
  console.log('🧪 Starting ZIP Code QA Tests for CITZN Platform');
  console.log('=' .repeat(50));
  
  for (const testCase of testCases) {
    console.log(`\n📍 Testing ZIP: ${testCase.zip} (${testCase.description})`);
    
    try {
      // Test the ZIP code endpoint
      const response = await fetch('https://citznvote.netlify.app/api/auth/verify-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zipCode: testCase.zip })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response received:', JSON.stringify(data, null, 2));
        
        // Check if the response matches expected location
        if (testCase.expected === 'ERROR') {
          console.log('❌ Expected error but got valid response');
        } else if (data.city && data.state) {
          const location = `${data.city}, ${data.state}`;
          if (location.includes(testCase.expected.split(',')[0])) {
            console.log(`✅ Location match: ${location}`);
          } else {
            console.log(`❌ Location mismatch. Expected: ${testCase.expected}, Got: ${location}`);
          }
        }
      } else {
        console.log(`❌ API Error: ${response.status} - ${response.statusText}`);
        if (testCase.expected === 'ERROR') {
          console.log('✅ Error response expected and received');
        }
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 ZIP Code testing completed');
}

// Run the tests
runZIPCodeTests().catch(console.error);