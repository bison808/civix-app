#!/usr/bin/env ts-node

import authService from './services/auth.service';
import representativesService from './services/representatives.service';
import billsService from './services/bills.service';
import feedbackService from './services/feedback.service';

const TEST_ZIP_CODE = '10001'; // New York ZIP for testing
const TEST_EMAIL = 'test@civix.com';
const TEST_PASSWORD = 'TestPassword123!';

async function testAuthService() {
  console.log('🔍 Testing Auth Service...');
  
  try {
    // Test ZIP code verification
    console.log('  - Testing ZIP code verification...');
    const zipVerification = await authService.verifyZipCode(TEST_ZIP_CODE);
    console.log('    ✅ ZIP verification:', zipVerification);
    
    // Test registration
    console.log('  - Testing registration...');
    const registrationData = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Test User',
      zipCode: TEST_ZIP_CODE,
    };
    
    try {
      const registrationResponse = await authService.register(registrationData);
      console.log('    ✅ Registration successful:', registrationResponse.user.email);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('    ⚠️  User already exists, skipping registration');
      } else {
        throw error;
      }
    }
    
    // Test login
    console.log('  - Testing login...');
    const loginResponse = await authService.login({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    console.log('    ✅ Login successful, token received');
    
    // Test getting current user
    console.log('  - Testing get current user...');
    const currentUser = await authService.getCurrentUser();
    console.log('    ✅ Current user:', currentUser?.email);
    
    return true;
  } catch (error) {
    console.error('    ❌ Auth Service Error:', error);
    return false;
  }
}

async function testRepresentativesService() {
  console.log('🔍 Testing Representatives Service...');
  
  try {
    // Test getting representatives by ZIP code
    console.log('  - Testing get representatives by ZIP...');
    const representatives = await representativesService.getRepresentativesByZipCode(TEST_ZIP_CODE);
    console.log(`    ✅ Found ${representatives.length} representatives`);
    
    // Test getting all representatives with filter
    console.log('  - Testing get representatives with filter...');
    const filteredReps = await representativesService.getRepresentatives({
      chamber: 'House',
      state: 'NY',
    });
    console.log(`    ✅ Found ${filteredReps.total} filtered representatives`);
    
    // Test search
    console.log('  - Testing search representatives...');
    const searchResults = await representativesService.searchRepresentatives('New York');
    console.log(`    ✅ Search returned ${searchResults.length} results`);
    
    return true;
  } catch (error) {
    console.error('    ❌ Representatives Service Error:', error);
    return false;
  }
}

async function testBillsService() {
  console.log('🔍 Testing Bills Service...');
  
  try {
    // Test getting bills
    console.log('  - Testing get bills...');
    const bills = await billsService.getBills({
      limit: 5,
      sortBy: 'date',
    });
    console.log(`    ✅ Found ${bills.total} total bills, returned ${bills.bills.length}`);
    
    // Test getting trending bills
    console.log('  - Testing get trending bills...');
    const trendingBills = await billsService.getTrendingBills(5);
    console.log(`    ✅ Found ${trendingBills.length} trending bills`);
    
    // Test getting recent bills
    console.log('  - Testing get recent bills...');
    const recentBills = await billsService.getRecentBills(5);
    console.log(`    ✅ Found ${recentBills.length} recent bills`);
    
    // Test personalized bills
    console.log('  - Testing get personalized bills...');
    const personalizedBills = await billsService.getPersonalizedBills(TEST_ZIP_CODE, ['healthcare', 'education']);
    console.log(`    ✅ Found ${personalizedBills.length} personalized bills`);
    
    // Test bill search
    console.log('  - Testing search bills...');
    const searchResults = await billsService.searchBills('healthcare');
    console.log(`    ✅ Search returned ${searchResults.length} results`);
    
    return true;
  } catch (error) {
    console.error('    ❌ Bills Service Error:', error);
    return false;
  }
}

async function testFeedbackService() {
  console.log('🔍 Testing Feedback Service...');
  
  try {
    // Test submitting feedback
    console.log('  - Testing submit feedback...');
    const feedbackData = {
      type: 'general' as const,
      category: 'suggestion' as const,
      content: 'This is a test feedback from API integration testing',
      urgency: 'low' as const,
      tags: ['test', 'api'],
    };
    
    const submittedFeedback = await feedbackService.submitFeedback(feedbackData);
    console.log('    ✅ Feedback submitted with ID:', submittedFeedback.id);
    
    // Test getting feedback
    console.log('  - Testing get feedback...');
    const feedbackList = await feedbackService.getFeedback({
      limit: 5,
      sortBy: 'date',
    });
    console.log(`    ✅ Found ${feedbackList.total} total feedback items`);
    
    // Test getting feedback stats
    console.log('  - Testing get feedback stats...');
    const stats = await feedbackService.getFeedbackStats();
    console.log('    ✅ Stats retrieved:', {
      total: stats.totalFeedback,
      today: stats.todaysFeedback,
      responseRate: stats.responseRate,
    });
    
    // Test sentiment analysis
    console.log('  - Testing sentiment analysis...');
    const sentiment = await feedbackService.analyzeSentiment('I love this new feature!');
    console.log('    ✅ Sentiment:', sentiment.sentiment, 'Confidence:', sentiment.confidence);
    
    // Test tag suggestions
    console.log('  - Testing tag suggestions...');
    const tags = await feedbackService.suggestTags('Healthcare bill affecting seniors in rural areas');
    console.log('    ✅ Suggested tags:', tags);
    
    return true;
  } catch (error) {
    console.error('    ❌ Feedback Service Error:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Integration Tests\n');
  console.log('📍 Testing against:');
  console.log('  - Auth Service: http://localhost:3003');
  console.log('  - AI Engine: http://localhost:3002');
  console.log('  - Data Pipeline: http://localhost:3001');
  console.log('  - Communications: http://localhost:3005\n');
  
  const results = {
    auth: false,
    representatives: false,
    bills: false,
    feedback: false,
  };
  
  // Run tests sequentially to avoid overwhelming the services
  results.auth = await testAuthService();
  console.log();
  
  results.representatives = await testRepresentativesService();
  console.log();
  
  results.bills = await testBillsService();
  console.log();
  
  results.feedback = await testFeedbackService();
  console.log();
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log('  - Auth Service:', results.auth ? '✅ PASSED' : '❌ FAILED');
  console.log('  - Representatives Service:', results.representatives ? '✅ PASSED' : '❌ FAILED');
  console.log('  - Bills Service:', results.bills ? '✅ PASSED' : '❌ FAILED');
  console.log('  - Feedback Service:', results.feedback ? '✅ PASSED' : '❌ FAILED');
  
  const allPassed = Object.values(results).every(r => r === true);
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'));
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testAuthService, testRepresentativesService, testBillsService, testFeedbackService };