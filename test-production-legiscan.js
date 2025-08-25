#!/usr/bin/env node

/**
 * Production LegiScan API Test Script
 * Agent Mike - Critical Production Fix
 * 
 * Tests the production deployment to verify:
 * 1. API key is accessible in Vercel environment
 * 2. LegiScan API calls are working
 * 3. California bills are being fetched
 * 4. Usage counter increases from 0
 */

const https = require('https');

const PRODUCTION_URL = 'https://civix-app.vercel.app';
const LOCAL_URL = 'http://localhost:3008';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            parseError: e.message
          });
        }
      });
    }).on('error', reject);
  });
}

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing ${name}:`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      console.log(`   ✅ Status: ${response.status}`);
      
      if (response.data && typeof response.data === 'object') {
        console.log(`   📊 Response keys:`, Object.keys(response.data).slice(0, 10));
        
        if (response.data.length) {
          console.log(`   📈 Items count: ${response.data.length}`);
          if (response.data[0] && response.data[0].billNumber) {
            console.log(`   📝 Sample bills:`, response.data.slice(0, 3).map(b => b.billNumber));
          }
        }
        
        if (response.data.apiKeyStatus) {
          console.log(`   🔑 API Key Status: ${response.data.apiKeyStatus}`);
          console.log(`   🎯 Session Status: ${response.data.sessionStatus}`);
          console.log(`   📋 Bills Status: ${response.data.billsStatus}`);
          console.log(`   🚀 API Usage Working: ${response.data.apiUsageWorking}`);
        }
      }
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   💥 Error:`, response.data);
    }
  } catch (error) {
    console.log(`   🔥 FAILED:`, error.message);
  }
}

async function runProductionTests() {
  console.log('🚨 Production LegiScan API Test - Agent Mike');
  console.log('============================================');
  
  const baseUrl = process.argv[2] === '--local' ? LOCAL_URL : PRODUCTION_URL;
  console.log(`🎯 Testing environment: ${baseUrl}`);
  
  // Test 1: Diagnostic endpoint
  await testEndpoint(
    'LegiScan Diagnostic',
    `${baseUrl}/api/legiscan-diagnostic`
  );
  
  // Test 2: California bills only
  await testEndpoint(
    'California Bills API',
    `${baseUrl}/api/bills?source=california&limit=5`
  );
  
  // Test 3: Mixed bills (should show federal + california)
  await testEndpoint(
    'Mixed Bills API',
    `${baseUrl}/api/bills?source=all&limit=6`
  );
  
  // Test 4: Committees (should work regardless)
  await testEndpoint(
    'Committees API', 
    `${baseUrl}/api/committees?limit=3`
  );
  
  console.log('\n🎯 Expected Results:');
  console.log('   • LegiScan Diagnostic: apiUsageWorking: true');
  console.log('   • California Bills: Real AB/SB bill numbers (not DEMO)');
  console.log('   • Mixed Bills: Federal H.R./S. + California AB/SB bills');
  console.log('   • Committees: Federal committees working');
  
  console.log('\n🔧 If tests fail in production:');
  console.log('   • Check Vercel environment variables');
  console.log('   • Verify LEGISCAN_API_KEY = 319097f61079e8bdbb4d07c10c34a961');
  console.log('   • Check function logs in Vercel dashboard');
  console.log('   • Monitor API usage at legiscan.com dashboard');
}

runProductionTests().catch(console.error);