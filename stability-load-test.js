/**
 * Stability Load Test
 * Agent 54: System Stability & External Dependencies Integration Specialist
 * 
 * Comprehensive load testing to validate stability improvements and 
 * resilience infrastructure under concurrent load.
 */

const { performance } = require('perf_hooks');

// Load Test Configuration
const LOAD_TEST_CONFIG = {
  scenarios: [
    {
      name: 'Light Load',
      concurrentUsers: 5,
      requestsPerUser: 10,
      delayBetweenRequests: 1000
    },
    {
      name: 'Moderate Load',
      concurrentUsers: 15,
      requestsPerUser: 20,
      delayBetweenRequests: 500
    },
    {
      name: 'Heavy Load',
      concurrentUsers: 30,
      requestsPerUser: 30,
      delayBetweenRequests: 200
    },
    {
      name: 'Stress Test',
      concurrentUsers: 50,
      requestsPerUser: 50,
      delayBetweenRequests: 100
    }
  ],
  endpoints: [
    {
      name: 'System Health',
      url: '/api/system/health',
      method: 'GET',
      expectedStatus: 200,
      timeout: 5000,
      critical: true
    },
    {
      name: 'Representatives API',
      url: '/api/representatives?zipCode=90210',
      method: 'GET',
      expectedStatus: 200,
      timeout: 10000,
      critical: true
    },
    {
      name: 'Bills API',
      url: '/api/bills?limit=10',
      method: 'GET',
      expectedStatus: 200,
      timeout: 8000,
      critical: true
    },
    {
      name: 'ZIP Verification',
      url: '/api/auth/verify-zip',
      method: 'POST',
      body: { zipCode: '90210' },
      expectedStatus: 200,
      timeout: 5000,
      critical: false
    }
  ],
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3008'
};

// Results tracking
const testResults = {
  startTime: null,
  endTime: null,
  scenarios: [],
  overallStats: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    errorRate: 0,
    throughput: 0
  },
  stabilityMetrics: {
    circuitBreakerTriggered: false,
    gracefulDegradationActivated: false,
    cacheHitRate: 0,
    errorRecoveryRate: 0
  },
  recommendations: []
};

/**
 * Execute a single HTTP request with timing
 */
async function executeRequest(endpoint, baseUrl) {
  const startTime = performance.now();
  const url = `${baseUrl}${endpoint.url}`;
  
  const result = {
    endpoint: endpoint.name,
    url,
    status: 0,
    responseTime: 0,
    success: false,
    error: null,
    cached: false,
    retries: 0
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

    const requestOptions = {
      method: endpoint.method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Load-Test': 'true'
      }
    };

    if (endpoint.body) {
      requestOptions.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    const endTime = performance.now();
    result.responseTime = Math.round(endTime - startTime);
    result.status = response.status;
    
    // Check for cached responses
    result.cached = response.headers.get('x-cache') === 'HIT' || 
                   response.headers.get('x-from-cache') === 'true';

    // Check for circuit breaker or fallback indicators
    if (response.headers.get('x-circuit-breaker') === 'OPEN') {
      testResults.stabilityMetrics.circuitBreakerTriggered = true;
    }
    
    if (response.headers.get('x-fallback-used') === 'true') {
      testResults.stabilityMetrics.gracefulDegradationActivated = true;
    }

    result.success = response.status === endpoint.expectedStatus;
    
    if (!result.success) {
      const responseText = await response.text().catch(() => 'Unknown error');
      result.error = `HTTP ${response.status}: ${responseText}`;
    }

  } catch (error) {
    const endTime = performance.now();
    result.responseTime = Math.round(endTime - startTime);
    result.error = error.message;
    result.success = false;

    if (error.name === 'AbortError') {
      result.error = `Timeout after ${endpoint.timeout}ms`;
    }
  }

  return result;
}

/**
 * Simulate a single user's load pattern
 */
async function simulateUser(userId, scenario, baseUrl) {
  const userResults = {
    userId,
    requests: [],
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  };

  console.log(`User ${userId} starting ${scenario.requestsPerUser} requests...`);

  for (let i = 0; i < scenario.requestsPerUser; i++) {
    // Select random endpoint (weighted towards critical endpoints)
    const endpoint = selectRandomEndpoint();
    
    const result = await executeRequest(endpoint, baseUrl);
    userResults.requests.push(result);
    userResults.totalRequests++;
    
    if (result.success) {
      userResults.successfulRequests++;
    } else {
      userResults.failedRequests++;
      console.warn(`User ${userId} request ${i + 1} failed: ${result.error}`);
    }

    // Delay between requests
    if (i < scenario.requestsPerUser - 1) {
      await sleep(scenario.delayBetweenRequests);
    }
  }

  // Calculate user stats
  const responseTimes = userResults.requests.map(r => r.responseTime);
  userResults.averageResponseTime = responseTimes.length > 0 ? 
    Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0;

  console.log(`User ${userId} completed: ${userResults.successfulRequests}/${userResults.totalRequests} successful`);
  return userResults;
}

/**
 * Select random endpoint with weighting
 */
function selectRandomEndpoint() {
  const criticalEndpoints = LOAD_TEST_CONFIG.endpoints.filter(e => e.critical);
  const nonCriticalEndpoints = LOAD_TEST_CONFIG.endpoints.filter(e => !e.critical);
  
  // 70% chance of critical endpoint, 30% non-critical
  const useCritical = Math.random() < 0.7;
  const pool = useCritical ? criticalEndpoints : nonCriticalEndpoints;
  
  return pool[Math.floor(Math.random() * pool.length)] || LOAD_TEST_CONFIG.endpoints[0];
}

/**
 * Run a single load test scenario
 */
async function runScenario(scenario) {
  console.log(`\n🔧 Running ${scenario.name} (${scenario.concurrentUsers} users, ${scenario.requestsPerUser} requests each)`);
  console.log('=' .repeat(80));

  const scenarioStartTime = performance.now();
  const baseUrl = LOAD_TEST_CONFIG.baseUrl;
  
  // Create user simulation promises
  const userPromises = [];
  for (let i = 0; i < scenario.concurrentUsers; i++) {
    userPromises.push(simulateUser(i + 1, scenario, baseUrl));
  }

  // Wait for all users to complete
  const userResults = await Promise.all(userPromises);
  const scenarioEndTime = performance.now();
  
  const scenarioDuration = (scenarioEndTime - scenarioStartTime) / 1000;

  // Aggregate results
  const allRequests = userResults.flatMap(user => user.requests);
  const successfulRequests = allRequests.filter(r => r.success);
  const failedRequests = allRequests.filter(r => !r.success);
  const responseTimes = allRequests.map(r => r.responseTime).sort((a, b) => a - b);
  const cachedRequests = allRequests.filter(r => r.cached);

  const scenarioResult = {
    name: scenario.name,
    duration: scenarioDuration,
    totalRequests: allRequests.length,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length,
    errorRate: (failedRequests.length / allRequests.length) * 100,
    averageResponseTime: responseTimes.length > 0 ? 
      Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0,
    p95ResponseTime: responseTimes.length > 0 ? 
      responseTimes[Math.floor(responseTimes.length * 0.95)] : 0,
    p99ResponseTime: responseTimes.length > 0 ? 
      responseTimes[Math.floor(responseTimes.length * 0.99)] : 0,
    throughput: Math.round(allRequests.length / scenarioDuration),
    cacheHitRate: (cachedRequests.length / allRequests.length) * 100,
    userResults,
    errors: failedRequests.map(r => ({ endpoint: r.endpoint, error: r.error }))
  };

  // Display results
  console.log(`\n📊 ${scenario.name} Results:`);
  console.log(`Duration: ${scenarioDuration.toFixed(1)}s`);
  console.log(`Requests: ${scenarioResult.totalRequests} total, ${scenarioResult.successfulRequests} successful, ${scenarioResult.failedRequests} failed`);
  console.log(`Error Rate: ${scenarioResult.errorRate.toFixed(2)}%`);
  console.log(`Response Time: ${scenarioResult.averageResponseTime}ms avg, ${scenarioResult.p95ResponseTime}ms p95, ${scenarioResult.p99ResponseTime}ms p99`);
  console.log(`Throughput: ${scenarioResult.throughput} req/sec`);
  console.log(`Cache Hit Rate: ${scenarioResult.cacheHitRate.toFixed(1)}%`);

  if (scenarioResult.errors.length > 0) {
    console.log(`\n❌ Top Errors:`);
    const errorCounts = {};
    scenarioResult.errors.forEach(e => {
      const key = `${e.endpoint}: ${e.error}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });
    
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([error, count]) => {
        console.log(`  ${count}x ${error}`);
      });
  }

  return scenarioResult;
}

/**
 * Generate stability assessment and recommendations
 */
function generateStabilityAssessment() {
  const overallStats = testResults.overallStats;
  const stabilityMetrics = testResults.stabilityMetrics;

  let stabilityScore = 10;
  const issues = [];
  const recommendations = [];

  // Assess error rate
  if (overallStats.errorRate > 5) {
    stabilityScore -= 3;
    issues.push(`High error rate: ${overallStats.errorRate.toFixed(2)}%`);
    recommendations.push('Investigate and fix high error rate causes');
  } else if (overallStats.errorRate > 1) {
    stabilityScore -= 1;
    issues.push(`Elevated error rate: ${overallStats.errorRate.toFixed(2)}%`);
  }

  // Assess response times
  if (overallStats.p99ResponseTime > 10000) {
    stabilityScore -= 2;
    issues.push(`Very slow p99 response time: ${overallStats.p99ResponseTime}ms`);
    recommendations.push('Optimize slow endpoints and implement better caching');
  } else if (overallStats.p95ResponseTime > 5000) {
    stabilityScore -= 1;
    issues.push(`Slow p95 response time: ${overallStats.p95ResponseTime}ms`);
    recommendations.push('Consider response time optimizations');
  }

  // Assess throughput
  if (overallStats.throughput < 5) {
    stabilityScore -= 1;
    issues.push(`Low throughput: ${overallStats.throughput} req/sec`);
    recommendations.push('Investigate throughput bottlenecks');
  }

  // Assess resilience mechanisms
  if (stabilityMetrics.circuitBreakerTriggered) {
    console.log('✅ Circuit breaker functionality validated');
  }

  if (stabilityMetrics.gracefulDegradationActivated) {
    console.log('✅ Graceful degradation functionality validated');
  }

  if (stabilityMetrics.cacheHitRate > 20) {
    console.log(`✅ Good cache utilization: ${stabilityMetrics.cacheHitRate.toFixed(1)}%`);
  }

  // Generate overall assessment
  let overallAssessment;
  if (stabilityScore >= 9) {
    overallAssessment = 'EXCELLENT';
  } else if (stabilityScore >= 7) {
    overallAssessment = 'GOOD';
  } else if (stabilityScore >= 5) {
    overallAssessment = 'ACCEPTABLE';
  } else {
    overallAssessment = 'NEEDS_IMPROVEMENT';
  }

  // Add general recommendations
  if (stabilityScore < 8) {
    recommendations.push('Consider implementing additional monitoring');
    recommendations.push('Review and optimize resource allocation');
  }

  return {
    stabilityScore,
    overallAssessment,
    issues,
    recommendations
  };
}

/**
 * Main load test execution
 */
async function runStabilityLoadTest() {
  console.log('🚀 Agent 54: System Stability Load Test');
  console.log('=' .repeat(60));
  console.log(`Target: ${LOAD_TEST_CONFIG.baseUrl}`);
  console.log(`Scenarios: ${LOAD_TEST_CONFIG.scenarios.length}`);
  console.log(`Endpoints: ${LOAD_TEST_CONFIG.endpoints.length}`);
  
  testResults.startTime = new Date();

  let allRequests = [];
  let allResponseTimes = [];

  // Run each scenario
  for (const scenario of LOAD_TEST_CONFIG.scenarios) {
    const scenarioResult = await runScenario(scenario);
    testResults.scenarios.push(scenarioResult);

    // Aggregate data
    allRequests.push(...scenarioResult.userResults.flatMap(u => u.requests));
    allResponseTimes.push(...scenarioResult.userResults.flatMap(u => 
      u.requests.map(r => r.responseTime)
    ));

    // Short break between scenarios
    console.log('\n⏸️  Cooling down for 5 seconds...\n');
    await sleep(5000);
  }

  testResults.endTime = new Date();
  const totalDuration = (testResults.endTime - testResults.startTime) / 1000;

  // Calculate overall statistics
  const successfulRequests = allRequests.filter(r => r.success);
  const failedRequests = allRequests.filter(r => !r.success);
  const cachedRequests = allRequests.filter(r => r.cached);
  allResponseTimes.sort((a, b) => a - b);

  testResults.overallStats = {
    totalRequests: allRequests.length,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length,
    averageResponseTime: allResponseTimes.length > 0 ? 
      Math.round(allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length) : 0,
    p95ResponseTime: allResponseTimes.length > 0 ? 
      allResponseTimes[Math.floor(allResponseTimes.length * 0.95)] : 0,
    p99ResponseTime: allResponseTimes.length > 0 ? 
      allResponseTimes[Math.floor(allResponseTimes.length * 0.99)] : 0,
    errorRate: (failedRequests.length / allRequests.length) * 100,
    throughput: Math.round(allRequests.length / totalDuration)
  };

  testResults.stabilityMetrics.cacheHitRate = 
    (cachedRequests.length / allRequests.length) * 100;

  // Generate assessment
  const assessment = generateStabilityAssessment();

  // Display final results
  console.log('\n📋 OVERALL STABILITY TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`Test Duration: ${totalDuration.toFixed(1)} seconds`);
  console.log(`Total Requests: ${testResults.overallStats.totalRequests}`);
  console.log(`Success Rate: ${((testResults.overallStats.successfulRequests / testResults.overallStats.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Error Rate: ${testResults.overallStats.errorRate.toFixed(2)}%`);
  console.log(`Average Response Time: ${testResults.overallStats.averageResponseTime}ms`);
  console.log(`95th Percentile: ${testResults.overallStats.p95ResponseTime}ms`);
  console.log(`99th Percentile: ${testResults.overallStats.p99ResponseTime}ms`);
  console.log(`Throughput: ${testResults.overallStats.throughput} req/sec`);
  console.log(`Cache Hit Rate: ${testResults.stabilityMetrics.cacheHitRate.toFixed(1)}%`);

  console.log('\n🎯 STABILITY ASSESSMENT');
  console.log('=' .repeat(40));
  console.log(`Overall Assessment: ${assessment.overallAssessment}`);
  console.log(`Stability Score: ${assessment.stabilityScore}/10`);

  if (testResults.stabilityMetrics.circuitBreakerTriggered) {
    console.log('✅ Circuit Breaker: ACTIVATED (Resilience Validated)');
  }

  if (testResults.stabilityMetrics.gracefulDegradationActivated) {
    console.log('✅ Graceful Degradation: ACTIVATED (Fallback Validated)');
  }

  if (assessment.issues.length > 0) {
    console.log('\n⚠️  ISSUES IDENTIFIED:');
    assessment.issues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }

  if (assessment.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    assessment.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
  }

  // Save detailed results
  const detailedResults = {
    ...testResults,
    assessment,
    testConfig: LOAD_TEST_CONFIG
  };

  const fs = require('fs').promises;
  const filename = `stability-load-test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await fs.writeFile(filename, JSON.stringify(detailedResults, null, 2));

  console.log(`\n📊 Detailed results saved to: ${filename}`);
  
  return {
    passed: assessment.stabilityScore >= 7,
    score: assessment.stabilityScore,
    assessment: assessment.overallAssessment
  };
}

/**
 * Utility function to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute if run directly
if (require.main === module) {
  runStabilityLoadTest()
    .then(result => {
      console.log(`\n${result.passed ? '✅' : '❌'} Load test ${result.passed ? 'PASSED' : 'FAILED'} (Score: ${result.score}/10)`);
      process.exit(result.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Load test failed with error:', error);
      process.exit(1);
    });
}

module.exports = {
  runStabilityLoadTest,
  LOAD_TEST_CONFIG
};