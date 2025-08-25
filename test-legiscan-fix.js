/**
 * Direct test of corrected LegiScan API format
 * Tests the exact format from the manual: /?key=APIKEY&op=getMasterList&state=CA
 */

const https = require('https');
const API_KEY = '319097f61079e8bdbb4d07c10c34a961';

// Test the corrected format
const testCorrectFormat = () => {
  const endpoint = `/?key=${API_KEY}&op=getMasterList&state=CA`;
  const url = `https://api.legiscan.com${endpoint}`;
  
  console.log('Testing CORRECT format from manual:');
  console.log('URL:', url.replace(API_KEY, '***'));
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      
      if (data.startsWith('<!DOCTYPE') || data.includes('<html>')) {
        console.log('❌ FAILED: Received HTML instead of JSON');
        console.log('First 200 chars:', data.substring(0, 200));
      } else {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ SUCCESS: Received JSON data');
          console.log('Response status:', parsed.status);
          if (parsed.masterlist) {
            const bills = Object.keys(parsed.masterlist);
            console.log('Bill count:', bills.length);
            console.log('Sample bills:', bills.slice(0, 3));
          }
        } catch (e) {
          console.log('❌ FAILED: Invalid JSON response');
          console.log('First 200 chars:', data.substring(0, 200));
        }
      }
    });
  }).on('error', (err) => {
    console.error('Request failed:', err.message);
  });
};

// Test the old incorrect format for comparison  
const testOldFormat = () => {
  const endpoint = `/?op=getMasterListByState&id=CA&api_key=${API_KEY}`;
  const url = `https://api.legiscan.com${endpoint}`;
  
  console.log('\n\nTesting OLD (incorrect) format:');
  console.log('URL:', url.replace(API_KEY, '***'));
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      
      if (data.startsWith('<!DOCTYPE') || data.includes('<html>')) {
        console.log('❌ CONFIRMED: Old format returns HTML (expected)');
        console.log('Title:', data.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title');
      } else {
        console.log('Unexpected: Old format returned non-HTML');
        console.log('First 200 chars:', data.substring(0, 200));
      }
    });
  }).on('error', (err) => {
    console.error('Request failed:', err.message);
  });
};

console.log('Testing LegiScan API format fixes...\n');
testCorrectFormat();
setTimeout(testOldFormat, 2000);