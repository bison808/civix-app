// Legislative Data Manager - Main integration layer orchestrating all systems
import { legislativeApiClient } from './legislativeApiClient';
import { legislativeCacheManager } from '../utils/legislativeCacheManager';
import { dataSyncManager } from './dataSyncManager';
import { queryOptimizer } from './queryOptimizer';
import { requestOrchestrator } from './requestOrchestrator';
import { performanceBenchmarks } from '../tests/performanceBenchmarks';

interface DataRequest {
  type: 'bills' | 'committees' | 'representatives' | 'engagement';
  parameters: any;
  options?: {
    priority?: number;
    cacheStrategy?: 'prefer_cache' | 'prefer_fresh' | 'cache_only';
    timeout?: number;
    includeMetadata?: boolean;
  };
}

interface DataResponse<T> {
  data: T[];
  metadata: {
    source: 'cache' | 'api' | 'sync';
    timestamp: number;
    latency: number;
    totalCount?: number;
    cacheHit: boolean;
    optimizations: string[];
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

class LegislativeDataManager {
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private performanceMetrics = new Map<string, number[]>();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Legislative Data Manager...');

    try {
      // Initialize all subsystems
      await this.initializeSubsystems();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Warm up critical caches
      await this.warmUpCaches();
      
      this.isInitialized = true;
      console.log('✅ Legislative Data Manager initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Legislative Data Manager:', error);
      throw error;
    }
  }

  private async initializeSubsystems(): Promise<void> {
    // Test connectivity to all services
    const healthCheck = await performanceBenchmarks.quickHealthCheck();
    
    if (!healthCheck.overall) {
      const failedSystems = Object.entries(healthCheck.details)
        .filter(([_, healthy]) => !healthy)
        .map(([system]) => system);
      
      console.warn('⚠️ Some subsystems failed health check:', failedSystems);
      // Continue initialization but log the issues
    }
  }

  private startHealthMonitoring(): void {
    // Run health checks every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      const health = await performanceBenchmarks.quickHealthCheck();
      
      if (!health.overall) {
        console.warn('🏥 System health check failed:', health.details);
        // Could trigger alerts or auto-recovery here
      }
    }, 5 * 60 * 1000);
  }

  private async warmUpCaches(): Promise<void> {
    console.log('🔥 Warming up caches...');
    
    try {
      // Warm up common ZIP codes and representative data
      const commonZips = ['90210', '10001', '60601', '30309', '94102'];
      await Promise.all(
        commonZips.map(zip => 
          legislativeCacheManager.warmUserCache(`zip_${zip}`)
        )
      );
      
      // Pre-load active committees
      await this.preloadCommittees();
      
      // Pre-load recent bills
      await this.preloadRecentBills();
      
    } catch (error) {
      console.warn('Cache warm-up partially failed:', error);
    }
  }

  // Main public API methods

  // Bills API with full optimization
  async getBills(parameters: any, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    return this.executeOptimizedRequest({
      type: 'bills',
      parameters,
      options
    });
  }

  async getBillDetails(billId: string, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    return this.executeOptimizedRequest({
      type: 'bills',
      parameters: { id: billId, operation: 'details' },
      options: { ...options, priority: 8 }
    });
  }

  async searchBills(searchParams: any, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    // Use query optimizer for complex searches
    const optimizedQuery = queryOptimizer.buildBillSearchQuery(searchParams);
    
    const startTime = performance.now();
    const result = await queryOptimizer.executeQuery(optimizedQuery);
    const latency = performance.now() - startTime;

    this.recordPerformanceMetric('bill_search', latency);

    return {
      data: result.data,
      metadata: {
        source: result.cacheHit ? 'cache' : 'api',
        timestamp: Date.now(),
        latency,
        totalCount: result.totalCount,
        cacheHit: result.cacheHit,
        optimizations: result.optimizations
      },
      pagination: searchParams.limit ? {
        page: Math.floor((searchParams.offset || 0) / searchParams.limit) + 1,
        limit: searchParams.limit,
        total: result.totalCount,
        hasNext: (searchParams.offset || 0) + searchParams.limit < result.totalCount
      } : undefined
    };
  }

  // Representatives API
  async getRepresentativesByZip(zipCode: string, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    return this.executeOptimizedRequest({
      type: 'representatives',
      parameters: { zip: zipCode },
      options: { ...options, priority: 9, cacheStrategy: 'prefer_cache' }
    });
  }

  async getRepresentativeDetails(repId: string, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    return this.executeOptimizedRequest({
      type: 'representatives',
      parameters: { id: repId, operation: 'details' },
      options: { ...options, priority: 7 }
    });
  }

  // Committees API
  async getCommittees(chamber?: string, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    return this.executeOptimizedRequest({
      type: 'committees',
      parameters: { chamber },
      options: { ...options, priority: 6, cacheStrategy: 'prefer_cache' }
    });
  }

  async getCommitteeDetails(committeeId: string, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    return this.executeOptimizedRequest({
      type: 'committees',
      parameters: { id: committeeId, operation: 'details' },
      options: { ...options, priority: 7 }
    });
  }

  // User Engagement API
  async trackEngagement(engagement: any, options: DataRequest['options'] = {}): Promise<DataResponse<any>> {
    const startTime = performance.now();
    
    // Track with cache manager for real-time processing
    legislativeCacheManager.trackEngagement(engagement);
    
    const latency = performance.now() - startTime;
    this.recordPerformanceMetric('engagement_tracking', latency);

    return {
      data: [engagement],
      metadata: {
        source: 'cache',
        timestamp: Date.now(),
        latency,
        cacheHit: false,
        optimizations: ['real_time_processing']
      }
    };
  }

  async getUserEngagement(userId: string, options: any = {}): Promise<DataResponse<any>> {
    const optimizedQuery = queryOptimizer.buildUserEngagementQuery(userId, options);
    
    const startTime = performance.now();
    const result = await queryOptimizer.executeQuery(optimizedQuery);
    const latency = performance.now() - startTime;

    return {
      data: result.data,
      metadata: {
        source: result.cacheHit ? 'cache' : 'api',
        timestamp: Date.now(),
        latency,
        totalCount: result.totalCount,
        cacheHit: result.cacheHit,
        optimizations: result.optimizations
      }
    };
  }

  // Core optimization engine
  private async executeOptimizedRequest(request: DataRequest): Promise<DataResponse<any>> {
    const { type, parameters, options = {} } = request;
    const startTime = performance.now();

    try {
      // Determine the best execution strategy
      const strategy = await this.determineExecutionStrategy(request);
      
      let result;
      let source: 'cache' | 'api' | 'sync';
      let cacheHit = false;
      let optimizations: string[] = [];

      switch (strategy.method) {
        case 'cache_only':
          result = await this.executeFromCache(type, parameters);
          source = 'cache';
          cacheHit = true;
          optimizations.push('cache_only');
          break;

        case 'api_with_cache':
          const apiResult = await this.executeFromApi(type, parameters, options);
          result = apiResult.data;
          source = apiResult.source as any;
          cacheHit = apiResult.cacheHit;
          optimizations = apiResult.optimizations;
          break;

        case 'sync_and_wait':
          await dataSyncManager.forceSyncEntity(type);
          result = await this.executeFromCache(type, parameters);
          source = 'sync';
          optimizations.push('forced_sync');
          break;

        default:
          throw new Error(`Unknown execution strategy: ${strategy.method}`);
      }

      const latency = performance.now() - startTime;
      this.recordPerformanceMetric(`${type}_request`, latency);

      return {
        data: result || [],
        metadata: {
          source,
          timestamp: Date.now(),
          latency,
          cacheHit,
          optimizations: [...optimizations, ...strategy.optimizations]
        }
      };

    } catch (error) {
      const latency = performance.now() - startTime;
      this.recordPerformanceMetric(`${type}_error`, latency);
      
      console.error(`Request failed for ${type}:`, error);
      throw error;
    }
  }

  private async determineExecutionStrategy(request: DataRequest): Promise<{
    method: 'cache_only' | 'api_with_cache' | 'sync_and_wait';
    optimizations: string[];
  }> {
    const { type, parameters, options = {} } = request;
    const optimizations: string[] = [];

    // Check cache strategy preference
    if (options.cacheStrategy === 'cache_only') {
      return { method: 'cache_only', optimizations: ['cache_strategy_override'] };
    }

    // Check if data is available in cache
    const cacheKey = this.generateCacheKey(type, parameters);
    const cached = this.getCachedData(type, cacheKey);

    if (cached && options.cacheStrategy === 'prefer_cache') {
      return { method: 'cache_only', optimizations: ['prefer_cache'] };
    }

    // Check data freshness requirements
    if (this.requiresFreshData(type, parameters)) {
      optimizations.push('fresh_data_required');
      
      // For high-priority requests or real-time data
      if (options.priority && options.priority > 8) {
        return { method: 'sync_and_wait', optimizations: [...optimizations, 'high_priority'] };
      }
    }

    // Default to API with caching
    optimizations.push('api_with_cache_fallback');
    return { method: 'api_with_cache', optimizations };
  }

  private async executeFromCache(type: string, parameters: any): Promise<any[]> {
    const cacheKey = this.generateCacheKey(type, parameters);
    const cached = this.getCachedData(type, cacheKey);
    
    if (!cached) {
      throw new Error(`No cached data available for ${type}: ${cacheKey}`);
    }
    
    return Array.isArray(cached) ? cached : [cached];
  }

  private async executeFromApi(type: string, parameters: any, options: any): Promise<{
    data: any[];
    source: string;
    cacheHit: boolean;
    optimizations: string[];
  }> {
    const optimizations: string[] = [];
    
    switch (type) {
      case 'bills':
        if (parameters.operation === 'details') {
          const result = await legislativeApiClient.getBillDetails(parameters.id);
          return {
            data: [result],
            source: 'api',
            cacheHit: false,
            optimizations: ['bill_details_api']
          };
        } else {
          const result = await legislativeApiClient.getBills(parameters);
          return {
            data: (result as any)?.results || [],
            source: 'api',
            cacheHit: false,
            optimizations: ['bills_api']
          };
        }

      case 'committees':
        if (parameters.operation === 'details') {
          const result = await legislativeApiClient.getCommitteeDetails(parameters.id);
          return {
            data: [result],
            source: 'api',
            cacheHit: false,
            optimizations: ['committee_details_api']
          };
        } else {
          const result = await legislativeApiClient.getCommittees(parameters.chamber);
          return {
            data: (result as any)?.results || [],
            source: 'api',
            cacheHit: false,
            optimizations: ['committees_api']
          };
        }

      case 'representatives':
        if (parameters.zip) {
          // Use request orchestrator for high-volume ZIP lookups
          const result = await requestOrchestrator.enqueueRequest(
            'congress', 
            '/representatives',
            'GET',
            { zip: parameters.zip },
            options.priority || 8
          );
          return {
            data: (result as any)?.results || [],
            source: 'api',
            cacheHit: false,
            optimizations: ['orchestrated_request']
          };
        }
        break;

      default:
        throw new Error(`Unknown data type: ${type}`);
    }

    return {
      data: [],
      source: 'api',
      cacheHit: false,
      optimizations: ['fallback']
    };
  }

  // Utility methods
  private generateCacheKey(type: string, parameters: any): string {
    return `${type}_${JSON.stringify(parameters).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private getCachedData(type: string, cacheKey: string): any {
    return legislativeCacheManager.get(type, cacheKey);
  }

  private requiresFreshData(type: string, parameters: any): boolean {
    // Bill actions and real-time data require fresh data
    if (type === 'bills' && parameters.operation === 'actions') return true;
    if (type === 'engagement') return true;
    
    return false;
  }

  private recordPerformanceMetric(operation: string, latency: number): void {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(latency);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Preloading methods
  private async preloadCommittees(): Promise<void> {
    try {
      await Promise.all([
        this.getCommittees('house', { cacheStrategy: 'prefer_fresh' }),
        this.getCommittees('senate', { cacheStrategy: 'prefer_fresh' })
      ]);
    } catch (error) {
      console.warn('Committee preload failed:', error);
    }
  }

  private async preloadRecentBills(): Promise<void> {
    try {
      const recentBillsParams = {
        congress: 118,
        status: ['introduced', 'passed'],
        limit: 50
      };
      
      await this.getBills(recentBillsParams, { cacheStrategy: 'prefer_fresh' });
    } catch (error) {
      console.warn('Recent bills preload failed:', error);
    }
  }

  // Performance and monitoring API
  async runPerformanceCheck(): Promise<any> {
    return performanceBenchmarks.runAllBenchmarks();
  }

  getPerformanceMetrics(): Record<string, { avg: number; min: number; max: number }> {
    const metrics: Record<string, { avg: number; min: number; max: number }> = {};
    
    for (const [operation, values] of this.performanceMetrics.entries()) {
      if (values.length > 0) {
        metrics[operation] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    }
    
    return metrics;
  }

  getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      uptime: Date.now(),
      performanceMetrics: this.getPerformanceMetrics(),
      cacheStats: legislativeCacheManager.getStats(),
      syncStatus: dataSyncManager.getSyncStatus(),
      orchestratorStats: requestOrchestrator.getStats()
    };
  }

  // Cleanup
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Legislative Data Manager...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    await Promise.all([
      dataSyncManager.shutdown(),
      requestOrchestrator.shutdown()
    ]);
    
    this.isInitialized = false;
    console.log('✅ Legislative Data Manager shut down successfully');
  }
}

// Export singleton instance
export const legislativeDataManager = new LegislativeDataManager();
export default legislativeDataManager;