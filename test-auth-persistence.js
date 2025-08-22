// Test script for authentication persistence
const puppeteer = require('puppeteer');

async function testAuthPersistence() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('\n🔍 Testing Authentication Persistence...\n');
  
  try {
    // Test 1: Register and get authenticated
    console.log('Step 1: Register a new user');
    const page = await browser.newPage();
    
    // Navigate to homepage
    await page.goto('http://localhost:3011', { waitUntil: 'networkidle2' });
    
    // Enter ZIP code
    await page.type('#zipCode', '90210');
    await new Promise(r => setTimeout(r, 500));
    
    // Submit ZIP
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Should be on registration page
    const registerUrl = page.url();
    console.log(`  ✓ Navigated to: ${registerUrl}`);
    
    // Click "Continue Anonymously" button
    await page.waitForSelector('button', { timeout: 5000 });
    // Find the button with text "Continue Anonymously"
    const buttons = await page.$$('button');
    let continueButton = null;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Continue Anonymously')) {
        continueButton = button;
        break;
      }
    }
    if (continueButton) {
      await continueButton.click();
    } else {
      console.log('  ⚠️  Could not find "Continue Anonymously" button');
      // Try to find any button that navigates to feed
      await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent?.includes('Continue') || btn.textContent?.includes('Start')) {
            btn.click();
            break;
          }
        }
      });
    }
    
    // Wait for navigation to feed
    await new Promise(r => setTimeout(r, 3000));
    
    const feedUrl = page.url();
    console.log(`  ✓ Authenticated and navigated to: ${feedUrl}`);
    
    // Get cookies and localStorage data
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => {
      return {
        sessionToken: window.localStorage.getItem('sessionToken'),
        anonymousId: window.localStorage.getItem('anonymousId'),
        userZipCode: window.localStorage.getItem('userZipCode'),
        userSession: window.localStorage.getItem('userSession')
      };
    });
    
    console.log('\nStep 2: Check stored authentication data');
    console.log('  Cookies found:', cookies.map(c => c.name).join(', '));
    console.log('  LocalStorage keys:', Object.keys(localStorage).filter(k => localStorage[k]).join(', '));
    
    // Test 2: Refresh the page
    console.log('\nStep 3: Refresh the page');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    const urlAfterRefresh = page.url();
    console.log(`  Current URL after refresh: ${urlAfterRefresh}`);
    
    if (urlAfterRefresh.includes('/feed')) {
      console.log('  ✅ SUCCESS: Session persisted after refresh!');
    } else {
      console.log('  ❌ FAILED: Session lost after refresh');
    }
    
    // Test 3: Open a new page (new tab simulation)
    console.log('\nStep 4: Open new page/tab');
    const page2 = await browser.newPage();
    
    // Copy cookies to new page
    await page2.setCookie(...cookies);
    
    // Navigate directly to feed
    await page2.goto('http://localhost:3011/feed', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    const newPageUrl = page2.url();
    console.log(`  New page URL: ${newPageUrl}`);
    
    if (newPageUrl.includes('/feed')) {
      console.log('  ✅ SUCCESS: Session works in new tab!');
    } else {
      console.log('  ❌ FAILED: Session not recognized in new tab');
    }
    
    // Test 4: Close and reopen browser
    console.log('\nStep 5: Close and reopen browser');
    await browser.close();
    
    const browser2 = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page3 = await browser2.newPage();
    
    // Set cookies from original session
    await page3.setCookie(...cookies);
    
    await page3.goto('http://localhost:3011/feed', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    const reopenUrl = page3.url();
    console.log(`  URL after browser restart: ${reopenUrl}`);
    
    if (reopenUrl.includes('/feed')) {
      console.log('  ✅ SUCCESS: Session persists across browser restart!');
    } else {
      console.log('  ❌ FAILED: Session lost after browser restart');
    }
    
    await browser2.close();
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test Complete');
  console.log('='.repeat(50) + '\n');
}

// Run the test
testAuthPersistence().catch(console.error);