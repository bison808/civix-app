/**
 * External Dependencies Health Check
 * Agent 54: System Stability & External Dependencies Integration Specialist
 * 
 * This script systematically tests all external dependencies to identify
 * the specific failure patterns causing service degradation.
 */

const { performance } = require('perf_hooks');

// Configuration
const TEST_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  verbose: true
};

// External Dependencies to Test
const EXTERNAL_DEPENDENCIES = [
  {
    name: 'Congress API',
    url: 'https://api.congress.gov/v3/bill/118?format=json&limit=1',
    headers: {},
    required: false,
    fallbackAvailable: true
  },
  {
    name: 'California Legislative API',
    url: 'https://leginfo.legislature.ca.gov/faces/rest/billsSearch',
    headers: { 'Accept': 'application/json' },
    required: false,
    fallbackAvailable: true
  },
  {
    name: 'OpenStates CSV Data',
    url: 'https://data.openstates.org/people/current/ca.csv',
    headers: {},
    required: false,
    fallbackAvailable: true
  },
  {
    name: 'Geocodio API (Test)',
    url: 'https://api.geocod.io/v1.7/geocode?q=90210&format=json',
    headers: {},
    required: false,
    fallbackAvailable: true,
    requiresAuth: true
  },
  {
    name: 'Google Civic Info API (Test)',
    url: 'https://www.googleapis.com/civicinfo/v2/representatives?address=90210',
    headers: {},
    required: false,
    fallbackAvailable: true,
    requiresAuth: true
  }
];

// Test Results Storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: EXTERNAL_DEPENDENCIES.length,
    passing: 0,
    failing: 0,
    warning: 0
  },
  dependencies: [],
  recommendations: []
};

/**
 * Test a single external dependency
 */
async function testDependency(dependency, retryCount = 0) {
  const startTime = performance.now();
  const result = {
    name: dependency.name,
    url: dependency.url,
    status: 'unknown',
    responseTime: 0,
    error: null,
    httpStatus: null,
    retryAttempts: retryCount,
    requiresAuth: dependency.requiresAuth || false,
    fallbackAvailable: dependency.fallbackAvailable
  };

  try {
    console.log(`Testing ${dependency.name}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
    
    const response = await fetch(dependency.url, {
      method: 'GET',
      headers: dependency.headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    result.responseTime = Math.round(endTime - startTime);
    result.httpStatus = response.status;
    
    if (response.ok) {
      result.status = 'healthy';
      console.log(`✅ ${dependency.name}: ${result.responseTime}ms`);
    } else if (response.status === 401 || response.status === 403) {
      result.status = 'auth_required';
      result.error = `Authentication required (${response.status})`;
      console.log(`🔐 ${dependency.name}: Auth required`);
    } else if (response.status === 429) {
      result.status = 'rate_limited';
      result.error = `Rate limited (${response.status})`;
      console.log(`⚠️ ${dependency.name}: Rate limited`);
    } else {
      result.status = 'degraded';
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      console.log(`⚠️ ${dependency.name}: ${result.error}`);
    }
    
  } catch (error) {
    const endTime = performance.now();
    result.responseTime = Math.round(endTime - startTime);
    
    if (error.name === 'AbortError') {
      result.status = 'timeout';
      result.error = `Request timeout after ${TEST_CONFIG.timeout}ms`;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      result.status = 'unreachable';
      result.error = `Network error: ${error.code}`;
    } else {
      result.status = 'failed';
      result.error = error.message;
    }
    
    console.log(`❌ ${dependency.name}: ${result.error}`);
    
    // Retry logic for transient failures
    if (retryCount < TEST_CONFIG.retries && 
        (result.status === 'timeout' || result.status === 'failed')) {
      console.log(`   Retrying ${dependency.name} (attempt ${retryCount + 1}/${TEST_CONFIG.retries})...`);
      return await testDependency(dependency, retryCount + 1);
    }
  }
  
  return result;
}

/**
 * Analyze test results and generate recommendations
 */
function analyzeResults() {
  let healthyCount = 0;
  let degradedCount = 0;
  let failedCount = 0;
  
  testResults.dependencies.forEach(dep => {
    switch (dep.status) {
      case 'healthy':
        healthyCount++;
        break;
      case 'degraded':
      case 'rate_limited':
      case 'auth_required':
        degradedCount++;
        break;
      case 'failed':
      case 'timeout':
      case 'unreachable':
        failedCount++;
        break;
    }
  });
  
  testResults.summary = {
    total: EXTERNAL_DEPENDENCIES.length,
    passing: healthyCount,
    failing: failedCount,
    warning: degradedCount
  };
  
  // Generate stability recommendations
  const recommendations = [];
  
  // High failure rate
  if (failedCount > EXTERNAL_DEPENDENCIES.length * 0.3) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Network Infrastructure',
      issue: 'High external dependency failure rate',
      recommendation: 'Implement comprehensive fallback mechanisms and circuit breakers',
      action: 'Add retry logic with exponential backoff for all external API calls'
    });
  }
  
  // Slow response times
  const slowDeps = testResults.dependencies.filter(dep => dep.responseTime > 5000);
  if (slowDeps.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Performance',
      issue: `Slow response times detected: ${slowDeps.map(d => d.name).join(', ')}`,
      recommendation: 'Implement request timeouts and caching strategies',
      action: 'Set aggressive timeouts (< 5s) and implement local caching'
    });
  }
  
  // Authentication issues
  const authIssues = testResults.dependencies.filter(dep => dep.status === 'auth_required');
  if (authIssues.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Configuration',
      issue: `Missing API keys for: ${authIssues.map(d => d.name).join(', ')}`,
      recommendation: 'Configure API keys in environment variables',
      action: 'Add proper API key management and fallback strategies'
    });
  }
  
  // Rate limiting issues
  const rateLimited = testResults.dependencies.filter(dep => dep.status === 'rate_limited');
  if (rateLimited.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Rate Limiting',
      issue: `Rate limiting detected: ${rateLimited.map(d => d.name).join(', ')}`,
      recommendation: 'Implement proper request throttling and caching',
      action: 'Add request queuing and increase cache duration'
    });
  }
  
  // Single point of failure analysis
  const criticalDeps = testResults.dependencies.filter(dep => !dep.fallbackAvailable && dep.status !== 'healthy');
  if (criticalDeps.length > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Resilience',
      issue: 'Critical dependencies without fallbacks are failing',
      recommendation: 'Implement fallback mechanisms for all critical dependencies',
      action: 'Create local data caches and alternative data sources'
    });
  }
  
  testResults.recommendations = recommendations;
}

/**
 * Generate detailed stability report
 */
function generateStabilityReport() {
  const report = {
    title: 'External Dependencies Stability Assessment',
    timestamp: testResults.timestamp,
    summary: testResults.summary,
    overallHealth: 'UNKNOWN',
    stabilityScore: 0,
    details: testResults.dependencies,
    recommendations: testResults.recommendations,
    nextSteps: []
  };
  
  // Calculate stability score (0-10)
  const healthyRatio = testResults.summary.passing / testResults.summary.total;
  const warningRatio = testResults.summary.warning / testResults.summary.total;
  const failingRatio = testResults.summary.failing / testResults.summary.total;
  
  report.stabilityScore = Math.round(
    (healthyRatio * 10) + 
    (warningRatio * 6) + 
    (failingRatio * 0)
  );
  
  // Determine overall health
  if (report.stabilityScore >= 9) {
    report.overallHealth = 'EXCELLENT';
  } else if (report.stabilityScore >= 7) {
    report.overallHealth = 'GOOD';
  } else if (report.stabilityScore >= 5) {
    report.overallHealth = 'DEGRADED';
  } else {
    report.overallHealth = 'CRITICAL';
  }
  
  // Generate next steps
  report.nextSteps = [
    'Implement comprehensive resilience infrastructure',
    'Add circuit breakers for failing dependencies',
    'Enhance error handling with graceful degradation',
    'Implement comprehensive monitoring and alerting',
    'Create operational runbooks for dependency failures'
  ];
  
  return report;
}

/**
 * Main test execution
 */
async function runDependencyHealthCheck() {
  console.log('🔍 Agent 54: External Dependencies Health Check');
  console.log('=' .repeat(60));
  console.log(`Testing ${EXTERNAL_DEPENDENCIES.length} external dependencies...`);
  console.log('');
  
  // Test all dependencies
  for (const dependency of EXTERNAL_DEPENDENCIES) {
    const result = await testDependency(dependency);
    testResults.dependencies.push(result);
  }
  
  console.log('');
  console.log('Analysis complete. Generating stability report...');
  console.log('');
  
  // Analyze results
  analyzeResults();
  const report = generateStabilityReport();
  
  // Display summary
  console.log('📊 STABILITY SUMMARY');
  console.log('=' .repeat(40));
  console.log(`Overall Health: ${report.overallHealth}`);
  console.log(`Stability Score: ${report.stabilityScore}/10`);
  console.log(`Passing: ${testResults.summary.passing}/${testResults.summary.total}`);
  console.log(`Warning: ${testResults.summary.warning}/${testResults.summary.total}`);
  console.log(`Failing: ${testResults.summary.failing}/${testResults.summary.total}`);
  console.log('');
  
  // Display detailed results
  console.log('🔍 DETAILED RESULTS');
  console.log('=' .repeat(40));
  testResults.dependencies.forEach(dep => {
    const statusIcon = dep.status === 'healthy' ? '✅' : 
                      dep.status === 'auth_required' ? '🔐' :
                      dep.status === 'rate_limited' ? '⚠️' :
                      dep.status === 'degraded' ? '⚠️' : '❌';
    
    console.log(`${statusIcon} ${dep.name}`);
    console.log(`   Status: ${dep.status.toUpperCase()}`);
    console.log(`   Response Time: ${dep.responseTime}ms`);
    if (dep.error) console.log(`   Error: ${dep.error}`);
    if (dep.retryAttempts > 0) console.log(`   Retry Attempts: ${dep.retryAttempts}`);
    console.log(`   Fallback Available: ${dep.fallbackAvailable ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  // Display recommendations
  if (testResults.recommendations.length > 0) {
    console.log('💡 CRITICAL RECOMMENDATIONS');
    console.log('=' .repeat(40));
    testResults.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Recommendation: ${rec.recommendation}`);
      console.log(`   Action: ${rec.action}`);
      console.log('');
    });
  }
  
  console.log('🎯 NEXT STEPS');
  console.log('=' .repeat(40));
  report.nextSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  
  // Save detailed results
  const fs = require('fs').promises;
  const detailedResults = {
    ...report,
    rawTestResults: testResults
  };
  
  await fs.writeFile(
    'external-dependencies-stability-report.json', 
    JSON.stringify(detailedResults, null, 2)
  );
  
  console.log('');
  console.log('📋 Detailed report saved to: external-dependencies-stability-report.json');
  console.log('');
  
  return report;
}

// Execute if run directly
if (require.main === module) {
  runDependencyHealthCheck()
    .then(report => {
      process.exit(report.overallHealth === 'CRITICAL' ? 1 : 0);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runDependencyHealthCheck,
  testDependency,
  TEST_CONFIG,
  EXTERNAL_DEPENDENCIES
};