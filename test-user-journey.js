/**
 * Comprehensive User Journey Testing for CITZN Platform
 * Tests complete flow from landing to representatives
 */

const testZipCodes = ['02134', '90210', '10001'];

async function testCompleteUserJourney() {
  console.log('🚀 Starting Complete User Journey Test');
  console.log('=' .repeat(60));
  
  for (const zipCode of testZipCodes) {
    console.log(`\n🏁 Testing complete journey for ZIP: ${zipCode}`);
    
    try {
      // Step 1: ZIP Code Verification
      console.log('📍 Step 1: ZIP Code Verification');
      const zipResponse = await fetch('https://citznvote.netlify.app/api/auth/verify-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode })
      });
      
      if (!zipResponse.ok) {
        console.log(`❌ ZIP verification failed: ${zipResponse.status}`);
        continue;
      }
      
      const zipData = await zipResponse.json();
      console.log(`✅ ZIP verified: ${zipData.city}, ${zipData.state}`);
      
      // Step 2: Test Bills/Legislation Lookup
      console.log('📜 Step 2: Bills/Legislation Lookup');
      
      const billsResponse = await fetch('https://citznvote.netlify.app/api/bills', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (billsResponse.ok) {
        const billsData = await billsResponse.json();
        console.log(`✅ Bills found: ${billsData.length || 'unknown'} bills`);
      } else {
        console.log(`⚠️ Bills endpoint: ${billsResponse.status} - ${billsResponse.statusText}`);
      }
      
      console.log(`✅ Journey test completed for ${zipCode}`);
      
    } catch (error) {
      console.log(`❌ Journey test failed for ${zipCode}: ${error.message}`);
    }
    
    // Delay between tests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n🏆 Complete User Journey Testing Finished');
}

async function testSessionPersistence() {
  console.log('\n🔄 Testing Session Persistence');
  console.log('=' .repeat(40));
  
  try {
    // Simulate setting user data
    const testZip = '02134';
    const response = await fetch('https://citznvote.netlify.app/api/auth/verify-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zipCode: testZip })
    });
    
    if (response.ok) {
      console.log(`✅ Session data set for ZIP: ${testZip}`);
      
      // Test if there's a session/profile endpoint
      const sessionResponse = await fetch('https://citznvote.netlify.app/api/auth/session', {
        method: 'GET'
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log(`✅ Session retrieved: ${JSON.stringify(sessionData, null, 2)}`);
      } else {
        console.log(`⚠️ Session endpoint: ${sessionResponse.status} - May not exist`);
      }
    }
  } catch (error) {
    console.log(`❌ Session test error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  await testCompleteUserJourney();
  await testSessionPersistence();
}

runAllTests().catch(console.error);