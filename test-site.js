// Test script to check site functionality
const baseURL = 'http://localhost:3004';

async function testSite() {
  console.log('🔍 Testing CITZN site functionality...\n');
  
  // Test 1: Check if homepage loads
  console.log('1. Testing homepage...');
  try {
    const response = await fetch(baseURL);
    if (response.ok) {
      console.log('✅ Homepage loads successfully');
      const text = await response.text();
      if (text.includes('CITZN')) {
        console.log('✅ CITZN branding found');
      }
      if (text.includes('ZIP code')) {
        console.log('✅ ZIP code form found');
      }
    } else {
      console.log('❌ Homepage failed to load:', response.status);
    }
  } catch (error) {
    console.log('❌ Error loading homepage:', error.message);
  }
  
  // Test 2: Check API routes
  console.log('\n2. Testing API routes...');
  const apiRoutes = [
    '/api/auth/verify-zip',
    '/api/auth/register',
    '/api/bills',
  ];
  
  for (const route of apiRoutes) {
    try {
      const response = await fetch(baseURL + route);
      console.log(`   ${route}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`   ${route}: Failed - ${error.message}`);
    }
  }
  
  // Test 3: Check static assets
  console.log('\n3. Testing static assets...');
  try {
    const response = await fetch(baseURL + '/citzn-logo.jpeg');
    if (response.ok) {
      console.log('✅ Logo loads successfully');
    } else {
      console.log('❌ Logo failed to load:', response.status);
    }
  } catch (error) {
    console.log('❌ Error loading logo:', error.message);
  }
  
  // Test 4: Check protected routes
  console.log('\n4. Testing protected routes...');
  const protectedRoutes = ['/feed', '/dashboard', '/representatives'];
  
  for (const route of protectedRoutes) {
    try {
      const response = await fetch(baseURL + route, {
        redirect: 'manual'
      });
      if (response.status === 307 || response.status === 302) {
        console.log(`   ${route}: Redirects (protected) ✅`);
      } else if (response.ok) {
        console.log(`   ${route}: Accessible (${response.status})`);
      } else {
        console.log(`   ${route}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`   ${route}: Failed - ${error.message}`);
    }
  }
  
  console.log('\n📊 Test complete!');
}

testSite();