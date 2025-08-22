// Bug testing script for CITZN platform
const puppeteer = require('puppeteer');

async function testCitzn() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const bugs = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      bugs.push({
        type: 'Console Error',
        message: msg.text(),
        location: page.url()
      });
    }
  });
  
  // Listen for page errors
  page.on('error', err => {
    bugs.push({
      type: 'Page Error',
      message: err.toString(),
      location: page.url()
    });
  });
  
  page.on('pageerror', err => {
    bugs.push({
      type: 'Page Error',
      message: err.toString(),
      location: page.url()
    });
  });
  
  try {
    console.log('\n🔍 Testing CITZN Platform...\n');
    
    // Test 1: Homepage
    console.log('Test 1: Homepage');
    await page.goto('http://localhost:3011', { waitUntil: 'networkidle2' });
    const title = await page.title();
    console.log(`  ✓ Page loaded: ${title}`);
    
    // Check if ZIP input exists
    const zipInput = await page.$('#zipCode');
    if (!zipInput) {
      bugs.push({ type: 'Missing Element', message: 'ZIP code input not found', location: '/' });
    } else {
      console.log('  ✓ ZIP code input found');
    }
    
    // Test 2: ZIP Code Entry
    console.log('\nTest 2: ZIP Code Entry');
    if (zipInput) {
      await page.type('#zipCode', '90210');
      await new Promise(r => setTimeout(r, 500));
      
      // Check if button is enabled
      const buttonDisabled = await page.$eval('button[type="submit"]', btn => btn.disabled);
      if (buttonDisabled) {
        bugs.push({ type: 'Interaction Bug', message: 'Submit button not enabled after entering ZIP', location: '/' });
      } else {
        console.log('  ✓ Submit button enabled');
        
        // Click submit
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        
        // Check navigation
        const currentUrl = page.url();
        if (currentUrl.includes('register')) {
          console.log('  ✓ Redirected to registration');
        } else if (currentUrl.includes('feed')) {
          console.log('  ✓ Redirected to feed');
        } else {
          bugs.push({ type: 'Navigation Bug', message: `Unexpected redirect: ${currentUrl}`, location: '/' });
        }
      }
    }
    
    // Test 3: Direct navigation to protected routes
    console.log('\nTest 3: Protected Routes');
    await page.goto('http://localhost:3011/feed', { waitUntil: 'networkidle2' });
    const feedUrl = page.url();
    if (!feedUrl.includes('feed')) {
      console.log(`  ✓ Correctly redirected from /feed to ${feedUrl}`);
    } else {
      bugs.push({ type: 'Auth Bug', message: 'Unauthorized access to /feed', location: '/feed' });
    }
    
    // Test 4: Representatives page
    console.log('\nTest 4: Representatives Page');
    await page.goto('http://localhost:3011/representatives', { waitUntil: 'networkidle2' });
    const repsUrl = page.url();
    if (!repsUrl.includes('representatives')) {
      console.log(`  ✓ Correctly redirected from /representatives to ${repsUrl}`);
    } else {
      bugs.push({ type: 'Auth Bug', message: 'Unauthorized access to /representatives', location: '/representatives' });
    }
    
  } catch (error) {
    bugs.push({
      type: 'Test Error',
      message: error.toString(),
      location: 'Test script'
    });
  } finally {
    await browser.close();
  }
  
  // Report bugs
  console.log('\n' + '='.repeat(50));
  console.log('📊 BUG REPORT');
  console.log('='.repeat(50));
  
  if (bugs.length === 0) {
    console.log('✅ No bugs found!');
  } else {
    console.log(`🐛 Found ${bugs.length} bug(s):\n`);
    bugs.forEach((bug, index) => {
      console.log(`${index + 1}. ${bug.type}`);
      console.log(`   Message: ${bug.message}`);
      console.log(`   Location: ${bug.location}\n`);
    });
  }
}

// Run the test
testCitzn().catch(console.error);