const axios = require('axios');
const { performance } = require('perf_hooks');

class APIStressTest {
  constructor() {
    this.baseUrl = process.env.CITZN_URL || 'https://citznvote.netlify.app';
    this.results = [];
    this.concurrentUsers = 0;
    this.maxConcurrentUsers = 0;
    this.errorCount = 0;
    this.successCount = 0;
  }

  async testZipVerificationEndpoint() {
    console.log('🔍 Testing ZIP verification endpoint under load...');
    
    const zipCodes = ['95060', '90210', '10001', '60601', '94102', '78701', '02101', '98101'];
    const concurrencyLevels = [1, 5, 10, 25, 50, 100];
    
    for (const concurrency of concurrencyLevels) {
      console.log(`\n📊 Testing with ${concurrency} concurrent requests...`);
      
      const promises = [];
      const startTime = performance.now();
      
      for (let i = 0; i < concurrency; i++) {
        const zipCode = zipCodes[i % zipCodes.length];
        promises.push(this.testSingleZipVerification(zipCode, i));
      }
      
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const avgResponseTime = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => sum + r.value.responseTime, 0) / successful;
      
      this.results.push({
        endpoint: '/api/auth/verify-zip',
        concurrency,
        totalRequests: concurrency,
        successful,
        failed,
        successRate: (successful / concurrency) * 100,
        avgResponseTime: Math.round(avgResponseTime),
        totalTime: Math.round(endTime - startTime),
        requestsPerSecond: Math.round(concurrency / ((endTime - startTime) / 1000)),
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ✅ Success: ${successful}/${concurrency} (${Math.round((successful/concurrency)*100)}%)`);
      console.log(`  ⚡ Avg Response: ${Math.round(avgResponseTime)}ms`);
      console.log(`  🚀 RPS: ${Math.round(concurrency / ((endTime - startTime) / 1000))}`);
      
      // Rate limiting pause
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async testSingleZipVerification(zipCode, requestId) {
    const startTime = performance.now();
    
    try {
      this.concurrentUsers++;
      this.maxConcurrentUsers = Math.max(this.maxConcurrentUsers, this.concurrentUsers);
      
      const response = await axios.post(`${this.baseUrl}/api/auth/verify-zip`, {
        zipCode: zipCode
      }, {
        timeout: 10000,
        headers: {
          'User-Agent': 'CITZN-LoadTest/1.0',
          'X-Request-ID': `load-test-${requestId}-${Date.now()}`
        }
      });
      
      const endTime = performance.now();
      this.concurrentUsers--;
      this.successCount++;
      
      return {
        success: true,
        statusCode: response.status,
        responseTime: endTime - startTime,
        zipCode,
        requestId
      };
      
    } catch (error) {
      const endTime = performance.now();
      this.concurrentUsers--;
      this.errorCount++;
      
      return {
        success: false,
        statusCode: error.response?.status || 0,
        responseTime: endTime - startTime,
        error: error.message,
        zipCode,
        requestId
      };
    }
  }

  async testBillFetchingConcurrency() {
    console.log('\n📄 Testing concurrent bill fetching...');
    
    const concurrencyLevels = [1, 5, 10, 20, 50];
    const billParams = [
      { page: 1, limit: 20 },
      { page: 2, limit: 20 },
      { page: 1, limit: 50 },
      { status: 'introduced' },
      { status: 'passed' }
    ];
    
    for (const concurrency of concurrencyLevels) {
      console.log(`\n📊 Testing bills API with ${concurrency} concurrent requests...`);
      
      const promises = [];
      const startTime = performance.now();
      
      for (let i = 0; i < concurrency; i++) {
        const params = billParams[i % billParams.length];
        promises.push(this.testSingleBillFetch(params, i));
      }
      
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.success).length;
      
      const avgResponseTime = results
        .filter(r => r.status === 'fulfilled' && r.value.success)
        .reduce((sum, r) => sum + r.value.responseTime, 0) / (successful || 1);
      
      this.results.push({
        endpoint: '/api/bills',
        concurrency,
        totalRequests: concurrency,
        successful,
        failed,
        successRate: (successful / concurrency) * 100,
        avgResponseTime: Math.round(avgResponseTime),
        totalTime: Math.round(endTime - startTime),
        requestsPerSecond: Math.round(concurrency / ((endTime - startTime) / 1000)),
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ✅ Success: ${successful}/${concurrency} (${Math.round((successful/concurrency)*100)}%)`);
      console.log(`  ⚡ Avg Response: ${Math.round(avgResponseTime)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async testSingleBillFetch(params, requestId) {
    const startTime = performance.now();
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseUrl}/api/bills${queryString ? '?' + queryString : ''}`;
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'CITZN-LoadTest/1.0',
          'X-Request-ID': `bill-test-${requestId}-${Date.now()}`
        }
      });
      
      const endTime = performance.now();
      
      return {
        success: true,
        statusCode: response.status,
        responseTime: endTime - startTime,
        dataSize: JSON.stringify(response.data).length,
        billCount: Array.isArray(response.data?.bills) ? response.data.bills.length : 0,
        params,
        requestId
      };
      
    } catch (error) {
      const endTime = performance.now();
      
      return {
        success: false,
        statusCode: error.response?.status || 0,
        responseTime: endTime - startTime,
        error: error.message,
        params,
        requestId
      };
    }
  }

  async testMemoryUsage() {
    console.log('\n🧠 Monitoring memory usage during load...');
    
    const initialMemory = process.memoryUsage();
    const memorySnapshots = [initialMemory];
    
    // Run intensive operations while monitoring memory
    const promises = [];
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      promises.push(this.testSingleZipVerification('95060', i));
      
      // Take memory snapshot every 10 iterations
      if (i % 10 === 0) {
        memorySnapshots.push(process.memoryUsage());
      }
    }
    
    await Promise.allSettled(promises);
    
    const finalMemory = process.memoryUsage();
    memorySnapshots.push(finalMemory);
    
    // Analyze memory usage
    const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
    const maxHeap = Math.max(...memorySnapshots.map(m => m.heapUsed));
    
    const memoryReport = {
      initialHeapMB: Math.round(initialMemory.heapUsed / 1024 / 1024 * 100) / 100,
      finalHeapMB: Math.round(finalMemory.heapUsed / 1024 / 1024 * 100) / 100,
      heapGrowthMB: Math.round(heapGrowth / 1024 / 1024 * 100) / 100,
      maxHeapMB: Math.round(maxHeap / 1024 / 1024 * 100) / 100,
      possibleMemoryLeak: heapGrowth > (10 * 1024 * 1024), // 10MB threshold
      snapshots: memorySnapshots.map(m => ({
        heapUsedMB: Math.round(m.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotalMB: Math.round(m.heapTotal / 1024 / 1024 * 100) / 100
      }))
    };
    
    console.log(`  📊 Initial Heap: ${memoryReport.initialHeapMB}MB`);
    console.log(`  📊 Final Heap: ${memoryReport.finalHeapMB}MB`);
    console.log(`  📈 Heap Growth: ${memoryReport.heapGrowthMB}MB`);
    console.log(`  🔍 Possible Memory Leak: ${memoryReport.possibleMemoryLeak ? '⚠️  YES' : '✅ NO'}`);
    
    return memoryReport;
  }

  async testRateLimiting() {
    console.log('\n🚦 Testing rate limiting behavior...');
    
    const rapidRequests = 200;
    const promises = [];
    const startTime = performance.now();
    
    // Send rapid requests to trigger rate limiting
    for (let i = 0; i < rapidRequests; i++) {
      promises.push(
        axios.post(`${this.baseUrl}/api/auth/verify-zip`, {
          zipCode: '95060'
        }, {
          timeout: 5000,
          headers: {
            'User-Agent': 'CITZN-RateLimit-Test/1.0'
          }
        }).catch(error => ({
          error: true,
          status: error.response?.status,
          message: error.message
        }))
      );
    }
    
    const results = await Promise.allSettled(promises);
    const endTime = performance.now();
    
    const rateLimited = results.filter(r => 
      r.value?.error && (r.value.status === 429 || r.value.message.includes('rate'))
    ).length;
    
    const successful = results.filter(r => 
      r.status === 'fulfilled' && !r.value?.error
    ).length;
    
    console.log(`  📊 Total Requests: ${rapidRequests}`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  🚦 Rate Limited: ${rateLimited}`);
    console.log(`  ⏱️  Total Time: ${Math.round(endTime - startTime)}ms`);
    
    return {
      totalRequests: rapidRequests,
      successful,
      rateLimited,
      rateLimitingWorking: rateLimited > 0,
      totalTime: Math.round(endTime - startTime)
    };
  }

  generateStressTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        maxConcurrentUsers: this.maxConcurrentUsers,
        totalSuccesses: this.successCount,
        totalErrors: this.errorCount,
        overallSuccessRate: Math.round((this.successCount / (this.successCount + this.errorCount)) * 100)
      },
      endpointResults: this.results,
      performance: {
        fastestResponse: Math.min(...this.results.map(r => r.avgResponseTime)),
        slowestResponse: Math.max(...this.results.map(r => r.avgResponseTime)),
        averageRPS: Math.round(this.results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / this.results.length)
      },
      bottlenecks: this.identifyBottlenecks(),
      recommendations: this.generateRecommendations()
    };
    
    const fs = require('fs');
    const path = require('path');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../performance/stress-test-report-${timestamp}.json`);
    
    // Ensure performance directory exists
    const perfDir = path.dirname(reportPath);
    if (!fs.existsSync(perfDir)) {
      fs.mkdirSync(perfDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Stress test report saved to: ${reportPath}`);
    
    return report;
  }

  identifyBottlenecks() {
    const bottlenecks = [];
    
    // High response time bottlenecks
    const slowResponses = this.results.filter(r => r.avgResponseTime > 2000);
    if (slowResponses.length > 0) {
      bottlenecks.push({
        type: 'High Response Time',
        severity: 'HIGH',
        endpoints: slowResponses.map(r => `${r.endpoint} (${r.avgResponseTime}ms)`),
        impact: 'Poor user experience, potential timeouts'
      });
    }
    
    // Low success rate bottlenecks
    const lowSuccessRate = this.results.filter(r => r.successRate < 95);
    if (lowSuccessRate.length > 0) {
      bottlenecks.push({
        type: 'Low Success Rate',
        severity: 'CRITICAL',
        endpoints: lowSuccessRate.map(r => `${r.endpoint} (${r.successRate}%)`),
        impact: 'Service unreliability, user frustration'
      });
    }
    
    // Concurrency bottlenecks
    const concurrencyIssues = this.results.filter(r => r.concurrency > 10 && r.successRate < 90);
    if (concurrencyIssues.length > 0) {
      bottlenecks.push({
        type: 'Concurrency Limitations',
        severity: 'MEDIUM',
        details: `Performance degrades significantly with ${concurrencyIssues[0].concurrency}+ concurrent users`,
        impact: 'Limited scalability under load'
      });
    }
    
    return bottlenecks;
  }

  generateRecommendations() {
    const recommendations = [];
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.avgResponseTime, 0) / this.results.length;
    
    if (avgResponseTime > 1000) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Response Time',
        issue: `Average response time is ${Math.round(avgResponseTime)}ms`,
        recommendation: 'Implement API response caching, optimize database queries, consider CDN'
      });
    }
    
    const worstSuccessRate = Math.min(...this.results.map(r => r.successRate));
    if (worstSuccessRate < 95) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Reliability',
        issue: `Minimum success rate is ${Math.round(worstSuccessRate)}%`,
        recommendation: 'Investigate error handling, implement retry logic, improve server stability'
      });
    }
    
    const maxConcurrency = Math.max(...this.results.map(r => r.concurrency));
    const concurrentPerformance = this.results.filter(r => r.concurrency === maxConcurrency)[0];
    if (concurrentPerformance && concurrentPerformance.successRate < 90) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Scalability',
        issue: 'Performance degrades under high concurrency',
        recommendation: 'Implement connection pooling, optimize for concurrent requests, consider load balancing'
      });
    }
    
    return recommendations;
  }
}

// CLI execution
if (require.main === module) {
  async function main() {
    const stressTest = new APIStressTest();
    
    try {
      console.log('🚀 Starting CITZN API Stress Tests...');
      
      // Test ZIP verification under load
      await stressTest.testZipVerificationEndpoint();
      
      // Test bill fetching concurrency
      await stressTest.testBillFetchingConcurrency();
      
      // Monitor memory usage
      const memoryReport = await stressTest.testMemoryUsage();
      
      // Test rate limiting
      const rateLimitReport = await stressTest.testRateLimiting();
      
      // Generate comprehensive report
      const report = stressTest.generateStressTestReport();
      
      console.log('\n🎯 Stress Test Summary:');
      console.log(`Overall Success Rate: ${report.summary.overallSuccessRate}%`);
      console.log(`Max Concurrent Users: ${report.summary.maxConcurrentUsers}`);
      console.log(`Average RPS: ${report.performance.averageRPS}`);
      
      if (report.bottlenecks.length > 0) {
        console.log('\n🚨 Bottlenecks Detected:');
        report.bottlenecks.forEach(bottleneck => {
          console.log(`  ${bottleneck.severity}: ${bottleneck.type}`);
          console.log(`    Impact: ${bottleneck.impact}`);
        });
      }
      
      if (memoryReport.possibleMemoryLeak) {
        console.log('\n⚠️  Memory leak detected during testing!');
      }
      
      if (!rateLimitReport.rateLimitingWorking) {
        console.log('\n⚠️  Rate limiting may not be properly configured!');
      }
      
    } catch (error) {
      console.error('❌ Stress testing failed:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = APIStressTest;