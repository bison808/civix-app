// Performance benchmarking suite for CITZN legislative data integration
import { legislativeApiClient } from '../services/legislativeApiClient';
import { legislativeCacheManager } from '../utils/legislativeCacheManager';
import { dataSyncManager } from '../services/dataSyncManager';
import { queryOptimizer } from '../services/queryOptimizer';
import { requestOrchestrator } from '../services/requestOrchestrator';

interface BenchmarkResult {
  testName: string;
  duration: number;
  success: boolean;
  metadata: {
    iterations: number;
    averageLatency: number;
    throughput: number; // operations per second
    errorRate: number;
    cacheHitRate?: number;
    memoryUsage?: number;
  };
  requirements: {
    maxLatency: number;
    minThroughput: number;
    maxErrorRate: number;
    met: boolean;
  };
}

interface PerformanceRequirements {
  [key: string]: {
    maxLatency: number; // milliseconds
    minThroughput: number; // operations per second
    maxErrorRate: number; // percentage (0-1)
    cacheHitRate?: number; // minimum cache hit rate
  };
}

class PerformanceBenchmarkSuite {
  private requirements: PerformanceRequirements;
  private results: BenchmarkResult[] = [];

  constructor() {
    this.requirements = {
      // Core API performance requirements
      'bill_search_performance': {
        maxLatency: 2000, // 2 seconds for bill searches
        minThroughput: 10, // 10 searches per second
        maxErrorRate: 0.01, // 1% error rate
        cacheHitRate: 0.7 // 70% cache hit rate
      },
      'representative_lookup': {
        maxLatency: 500, // 500ms for ZIP-to-representative lookup
        minThroughput: 20, // 20 lookups per second
        maxErrorRate: 0.005, // 0.5% error rate
        cacheHitRate: 0.9 // 90% cache hit rate for this static data
      },
      'committee_data_load': {
        maxLatency: 1000, // 1 second for committee data
        minThroughput: 15, // 15 requests per second
        maxErrorRate: 0.02, // 2% error rate
        cacheHitRate: 0.8 // 80% cache hit rate
      },
      'user_engagement_tracking': {
        maxLatency: 100, // 100ms for real-time engagement
        minThroughput: 100, // 100 events per second
        maxErrorRate: 0.001, // 0.1% error rate
      },
      'api_orchestration': {
        maxLatency: 3000, // 3 seconds for complex orchestrated requests
        minThroughput: 5, // 5 complex requests per second
        maxErrorRate: 0.05, // 5% error rate due to external API dependencies
      },
      'cache_operations': {
        maxLatency: 50, // 50ms for cache operations
        minThroughput: 1000, // 1000 cache ops per second
        maxErrorRate: 0.001, // 0.1% error rate
        cacheHitRate: 0.95 // 95% hit rate for cache
      },
      'data_synchronization': {
        maxLatency: 30000, // 30 seconds for sync operations
        minThroughput: 0.1, // 1 sync every 10 seconds
        maxErrorRate: 0.1, // 10% error rate (external APIs)
      }
    };
  }

  // Main benchmark execution
  async runAllBenchmarks(): Promise<BenchmarkReport> {
    console.log('🚀 Starting CITZN Performance Benchmark Suite...');
    
    this.results = [];
    const startTime = Date.now();

    // Run each benchmark
    await this.benchmarkBillSearchPerformance();
    await this.benchmarkRepresentativeLookup();
    await this.benchmarkCommitteeDataLoad();
    await this.benchmarkUserEngagementTracking();
    await this.benchmarkApiOrchestration();
    await this.benchmarkCacheOperations();
    await this.benchmarkDataSynchronization();

    const totalTime = Date.now() - startTime;
    
    // Generate report
    const report = this.generateReport(totalTime);
    console.log('✅ Benchmark Suite Completed');
    
    return report;
  }

  // Individual benchmark implementations
  private async benchmarkBillSearchPerformance(): Promise<void> {
    console.log('📊 Testing bill search performance...');

    const iterations = 50;
    const results: number[] = [];
    let errors = 0;
    let cacheHits = 0;

    const testQueries = [
      { congress: 118, status: ['introduced'] },
      { subjectAreas: ['Healthcare'], limit: 20 },
      { searchText: 'climate change', limit: 10 },
      { sponsorId: 'rep123', congress: 118 },
      { status: ['passed'], dateRange: { start: '2024-01-01' } }
    ];

    for (let i = 0; i < iterations; i++) {
      const query = testQueries[i % testQueries.length];
      const start = performance.now();
      
      try {
        const optimizedQuery = queryOptimizer.buildBillSearchQuery(query);
        const result = await queryOptimizer.executeQuery(optimizedQuery);
        
        const duration = performance.now() - start;
        results.push(duration);
        
        if (result.cacheHit) cacheHits++;
        
        // Small delay to prevent overwhelming APIs
        await this.wait(100);
        
      } catch (error) {
        errors++;
        console.warn(`Bill search error (${i}):`, error);
      }
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const throughput = 1000 / avgLatency; // ops per second
    const errorRate = errors / iterations;
    const cacheHitRate = cacheHits / iterations;

    this.recordResult('bill_search_performance', {
      duration: avgLatency,
      success: errorRate < this.requirements.bill_search_performance.maxErrorRate,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        cacheHitRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  private async benchmarkRepresentativeLookup(): Promise<void> {
    console.log('🏛️ Testing representative lookup performance...');

    const iterations = 100;
    const results: number[] = [];
    let errors = 0;
    let cacheHits = 0;

    // Test ZIP codes from different regions
    const testZips = [
      '90210', '10001', '60601', '30309', '94102',
      '02101', '77001', '85001', '19101', '53201'
    ];

    for (let i = 0; i < iterations; i++) {
      const zipCode = testZips[i % testZips.length];
      const start = performance.now();
      
      try {
        // Test the optimized API client
        const result = await legislativeApiClient.request('congress', {
          endpoint: '/representatives',
          method: 'GET',
          params: { zip: zipCode },
          priority: 8
        });
        
        const duration = performance.now() - start;
        results.push(duration);
        
        // Check if result came from cache
        const cached = legislativeCacheManager.get('representatives', `zip_${zipCode}`);
        if (cached) cacheHits++;
        
        await this.wait(50);
        
      } catch (error) {
        errors++;
        console.warn(`Representative lookup error (${i}):`, error);
      }
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const throughput = 1000 / avgLatency;
    const errorRate = errors / iterations;
    const cacheHitRate = cacheHits / iterations;

    this.recordResult('representative_lookup', {
      duration: avgLatency,
      success: avgLatency < this.requirements.representative_lookup.maxLatency,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        cacheHitRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  private async benchmarkCommitteeDataLoad(): Promise<void> {
    console.log('🏢 Testing committee data loading performance...');

    const iterations = 30;
    const results: number[] = [];
    let errors = 0;
    let cacheHits = 0;

    const testChambers = ['house', 'senate'];

    for (let i = 0; i < iterations; i++) {
      const chamber = testChambers[i % testChambers.length];
      const start = performance.now();
      
      try {
        const result = await legislativeApiClient.getCommittees(chamber as any);
        
        const duration = performance.now() - start;
        results.push(duration);
        
        // Check cache
        const cached = legislativeCacheManager.get('committees', `${chamber}_committees`);
        if (cached) cacheHits++;
        
        await this.wait(200);
        
      } catch (error) {
        errors++;
        console.warn(`Committee data error (${i}):`, error);
      }
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const throughput = 1000 / avgLatency;
    const errorRate = errors / iterations;
    const cacheHitRate = cacheHits / iterations;

    this.recordResult('committee_data_load', {
      duration: avgLatency,
      success: avgLatency < this.requirements.committee_data_load.maxLatency,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        cacheHitRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  private async benchmarkUserEngagementTracking(): Promise<void> {
    console.log('👥 Testing user engagement tracking performance...');

    const iterations = 500;
    const results: number[] = [];
    let errors = 0;

    const engagementTypes = ['view', 'follow', 'comment', 'share'];
    const itemTypes = ['bill', 'representative', 'committee'];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      try {
        const engagement = {
          userId: `user_${Math.floor(i / 10)}`, // 10 engagements per user
          itemId: `item_${Math.floor(Math.random() * 100)}`,
          itemType: itemTypes[Math.floor(Math.random() * itemTypes.length)] as any,
          engagementType: engagementTypes[Math.floor(Math.random() * engagementTypes.length)] as any,
          timestamp: Date.now(),
          metadata: { source: 'benchmark_test' }
        };

        legislativeCacheManager.trackEngagement(engagement);
        
        const duration = performance.now() - start;
        results.push(duration);
        
        // No delay for engagement tracking - should be real-time
        
      } catch (error) {
        errors++;
        console.warn(`Engagement tracking error (${i}):`, error);
      }
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const throughput = 1000 / avgLatency;
    const errorRate = errors / iterations;

    this.recordResult('user_engagement_tracking', {
      duration: avgLatency,
      success: avgLatency < this.requirements.user_engagement_tracking.maxLatency,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  private async benchmarkApiOrchestration(): Promise<void> {
    console.log('🎭 Testing API orchestration performance...');

    const iterations = 20;
    const results: number[] = [];
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      try {
        // Test complex orchestrated request (multiple API calls)
        const promises = [
          requestOrchestrator.enqueueRequest('congress', '/bills', 'GET', { limit: 5 }, 8),
          requestOrchestrator.enqueueRequest('congress', '/committees', 'GET', { chamber: 'house' }, 7),
          requestOrchestrator.enqueueRequest('openstates', '/bills', 'GET', { jurisdiction: 'ca' }, 6)
        ];

        const apiResults = await Promise.allSettled(promises);
        
        const duration = performance.now() - start;
        results.push(duration);

        // Check for failures
        const failures = apiResults.filter(r => r.status === 'rejected').length;
        if (failures > 0) errors++;
        
        await this.wait(500); // Longer delay for orchestrated requests
        
      } catch (error) {
        errors++;
        console.warn(`API orchestration error (${i}):`, error);
      }
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const throughput = 1000 / avgLatency;
    const errorRate = errors / iterations;

    this.recordResult('api_orchestration', {
      duration: avgLatency,
      success: avgLatency < this.requirements.api_orchestration.maxLatency,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  private async benchmarkCacheOperations(): Promise<void> {
    console.log('💾 Testing cache operations performance...');

    const iterations = 1000;
    const setResults: number[] = [];
    const getResults: number[] = [];
    let errors = 0;
    let hits = 0;

    // Warm up cache with some data
    for (let i = 0; i < 100; i++) {
      legislativeCacheManager.set('bills', `bill_${i}`, { 
        id: `bill_${i}`, 
        title: `Test Bill ${i}` 
      });
    }

    // Test cache operations
    for (let i = 0; i < iterations; i++) {
      try {
        // Test cache set operation
        const setStart = performance.now();
        legislativeCacheManager.set('bills', `test_bill_${i}`, {
          id: `test_bill_${i}`,
          title: `Benchmark Test Bill ${i}`,
          status: 'active',
          timestamp: Date.now()
        });
        setResults.push(performance.now() - setStart);

        // Test cache get operation
        const getStart = performance.now();
        const key = `bill_${Math.floor(Math.random() * 100)}`;
        const result = legislativeCacheManager.get('bills', key);
        getResults.push(performance.now() - getStart);
        
        if (result) hits++;
        
      } catch (error) {
        errors++;
        console.warn(`Cache operation error (${i}):`, error);
      }
    }

    const avgSetLatency = setResults.reduce((a, b) => a + b, 0) / setResults.length;
    const avgGetLatency = getResults.reduce((a, b) => a + b, 0) / getResults.length;
    const avgLatency = (avgSetLatency + avgGetLatency) / 2;
    const throughput = 1000 / avgLatency;
    const errorRate = errors / iterations;
    const cacheHitRate = hits / iterations;

    this.recordResult('cache_operations', {
      duration: avgLatency,
      success: avgLatency < this.requirements.cache_operations.maxLatency,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        cacheHitRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  private async benchmarkDataSynchronization(): Promise<void> {
    console.log('🔄 Testing data synchronization performance...');

    const iterations = 5; // Fewer iterations for sync operations
    const results: number[] = [];
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      try {
        // Test forced sync of different entities
        const entities = ['bills', 'committees', 'representatives'];
        const entity = entities[i % entities.length];
        
        const syncResult = await dataSyncManager.forceSyncEntity(entity);
        
        const duration = performance.now() - start;
        results.push(duration);
        
        if (!syncResult) errors++;
        
        await this.wait(2000); // Longer delay between syncs
        
      } catch (error) {
        errors++;
        console.warn(`Data sync error (${i}):`, error);
      }
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const throughput = 1000 / avgLatency;
    const errorRate = errors / iterations;

    this.recordResult('data_synchronization', {
      duration: avgLatency,
      success: avgLatency < this.requirements.data_synchronization.maxLatency,
      metadata: {
        iterations,
        averageLatency: avgLatency,
        throughput,
        errorRate,
        memoryUsage: this.getMemoryUsage()
      }
    });
  }

  // Utility methods
  private recordResult(testName: string, result: Partial<BenchmarkResult>): void {
    const requirements = this.requirements[testName];
    
    const fullResult: BenchmarkResult = {
      testName,
      duration: result.duration || 0,
      success: result.success || false,
      metadata: result.metadata || {
        iterations: 0,
        averageLatency: 0,
        throughput: 0,
        errorRate: 0
      },
      requirements: {
        maxLatency: requirements.maxLatency,
        minThroughput: requirements.minThroughput,
        maxErrorRate: requirements.maxErrorRate,
        met: this.checkRequirementsMet(result.metadata!, requirements)
      }
    };

    this.results.push(fullResult);
    
    // Log immediate result
    const status = fullResult.requirements.met ? '✅' : '❌';
    console.log(`${status} ${testName}: ${fullResult.duration.toFixed(2)}ms (${fullResult.metadata.throughput.toFixed(2)} ops/s)`);
  }

  private checkRequirementsMet(metadata: any, requirements: any): boolean {
    const latencyOk = metadata.averageLatency <= requirements.maxLatency;
    const throughputOk = metadata.throughput >= requirements.minThroughput;
    const errorRateOk = metadata.errorRate <= requirements.maxErrorRate;
    const cacheHitOk = !requirements.cacheHitRate || 
                       (metadata.cacheHitRate && metadata.cacheHitRate >= requirements.cacheHitRate);

    return latencyOk && throughputOk && errorRateOk && cacheHitOk;
  }

  private generateReport(totalTime: number): BenchmarkReport {
    const passed = this.results.filter(r => r.requirements.met).length;
    const failed = this.results.length - passed;

    const report: BenchmarkReport = {
      summary: {
        totalTests: this.results.length,
        passed,
        failed,
        successRate: passed / this.results.length,
        totalExecutionTime: totalTime,
        overallStatus: failed === 0 ? 'PASS' : 'FAIL'
      },
      results: this.results,
      systemInfo: {
        timestamp: new Date().toISOString(),
        memoryUsage: this.getMemoryUsage(),
        cacheStats: legislativeCacheManager.getStats(),
        orchestratorStats: requestOrchestrator.getStats(),
        queryOptimizerStats: queryOptimizer.getPerformanceStats()
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze results and generate recommendations
    const failedTests = this.results.filter(r => !r.requirements.met);
    
    for (const test of failedTests) {
      if (test.metadata.averageLatency > test.requirements.maxLatency) {
        recommendations.push(`${test.testName}: Latency exceeds requirement (${test.metadata.averageLatency.toFixed(2)}ms > ${test.requirements.maxLatency}ms). Consider optimizing queries or adding caching.`);
      }
      
      if (test.metadata.throughput < test.requirements.minThroughput) {
        recommendations.push(`${test.testName}: Throughput below requirement (${test.metadata.throughput.toFixed(2)} < ${test.requirements.minThroughput} ops/s). Consider connection pooling or API batching.`);
      }
      
      if (test.metadata.errorRate > test.requirements.maxErrorRate) {
        recommendations.push(`${test.testName}: Error rate too high (${(test.metadata.errorRate * 100).toFixed(1)}% > ${(test.requirements.maxErrorRate * 100).toFixed(1)}%). Improve error handling and retry logic.`);
      }
      
      if (test.metadata.cacheHitRate && (test.requirements as any).cacheHitRate && 
          test.metadata.cacheHitRate < (test.requirements as any).cacheHitRate) {
        recommendations.push(`${test.testName}: Cache hit rate below target (${(test.metadata.cacheHitRate * 100).toFixed(1)}% < ${((test.requirements as any).cacheHitRate * 100).toFixed(1)}%). Review caching strategy.`);
      }
    }

    // General recommendations
    const avgLatency = this.results.reduce((sum, r) => sum + r.metadata.averageLatency, 0) / this.results.length;
    if (avgLatency > 1000) {
      recommendations.push('Overall system latency is high. Consider implementing more aggressive caching and query optimization.');
    }

    const avgCacheHitRate = this.results
      .filter(r => r.metadata.cacheHitRate !== undefined)
      .reduce((sum, r) => sum + (r.metadata.cacheHitRate || 0), 0) / this.results.length;
    
    if (avgCacheHitRate < 0.7) {
      recommendations.push('Cache hit rates are suboptimal. Review cache warming strategies and TTL settings.');
    }

    return recommendations;
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API for integration testing
  async quickHealthCheck(): Promise<HealthCheckResult> {
    console.log('🏥 Running quick health check...');
    
    const checks = [
      this.checkApiClientHealth(),
      this.checkCacheHealth(),
      this.checkSyncManagerHealth(),
      this.checkOrchestratorHealth()
    ];

    const results = await Promise.allSettled(checks);
    const healthy = results.filter(r => r.status === 'fulfilled' && r.value).length;

    return {
      overall: healthy === checks.length,
      details: {
        apiClient: results[0].status === 'fulfilled' && results[0].value,
        cache: results[1].status === 'fulfilled' && results[1].value,
        syncManager: results[2].status === 'fulfilled' && results[2].value,
        orchestrator: results[3].status === 'fulfilled' && results[3].value
      },
      timestamp: Date.now()
    };
  }

  private async checkApiClientHealth(): Promise<boolean> {
    try {
      const start = performance.now();
      await legislativeApiClient.healthCheck();
      const duration = performance.now() - start;
      return duration < 5000; // Should complete within 5 seconds
    } catch {
      return false;
    }
  }

  private async checkCacheHealth(): Promise<boolean> {
    try {
      const stats = legislativeCacheManager.getStats();
      return typeof stats === 'object';
    } catch {
      return false;
    }
  }

  private async checkSyncManagerHealth(): Promise<boolean> {
    try {
      const status = dataSyncManager.getSyncStatus();
      return typeof status === 'object';
    } catch {
      return false;
    }
  }

  private async checkOrchestratorHealth(): Promise<boolean> {
    try {
      const stats = requestOrchestrator.getStats();
      return typeof stats === 'object';
    } catch {
      return false;
    }
  }
}

// Type definitions
interface BenchmarkReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    successRate: number;
    totalExecutionTime: number;
    overallStatus: 'PASS' | 'FAIL';
  };
  results: BenchmarkResult[];
  systemInfo: {
    timestamp: string;
    memoryUsage: number;
    cacheStats: any;
    orchestratorStats: any;
    queryOptimizerStats: any;
  };
  recommendations: string[];
}

interface HealthCheckResult {
  overall: boolean;
  details: {
    apiClient: boolean;
    cache: boolean;
    syncManager: boolean;
    orchestrator: boolean;
  };
  timestamp: number;
}

// Export singleton
export const performanceBenchmarks = new PerformanceBenchmarkSuite();
export default performanceBenchmarks;