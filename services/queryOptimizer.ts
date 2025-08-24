// Query optimization and indexing strategy for legislative data
interface QueryPattern {
  entity: string;
  operation: 'select' | 'search' | 'filter' | 'aggregate';
  fields: string[];
  conditions: QueryCondition[];
  orderBy?: string[];
  limit?: number;
  frequency: number; // How often this pattern is used
  averageLatency: number; // Average execution time
}

interface QueryCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'starts_with';
  value: any;
  selectivity: number; // 0-1, how selective this condition is
}

interface IndexStrategy {
  entity: string;
  fields: string[];
  type: 'btree' | 'hash' | 'composite' | 'partial' | 'gin' | 'gist';
  unique: boolean;
  sparse: boolean;
  condition?: string; // For partial indexes
  priority: number;
  estimatedBenefit: number;
}

interface QueryExecution {
  query: string;
  parameters: any[];
  startTime: number;
  endTime: number;
  resultCount: number;
  cacheHit: boolean;
  optimizationApplied: string[];
}

class QueryOptimizer {
  private queryPatterns: Map<string, QueryPattern> = new Map();
  private indexStrategies: Map<string, IndexStrategy[]> = new Map();
  private executionHistory: QueryExecution[] = [];
  private optimizedQueries: Map<string, string> = new Map();
  private connectionPool: any = null; // Would be actual DB connection pool

  constructor() {
    this.initializeOptimizationStrategies();
    this.startPerformanceMonitoring();
  }

  private initializeOptimizationStrategies() {
    // Define common query patterns and their optimizations
    this.defineEntityOptimizations();
    this.createIndexStrategies();
  }

  private defineEntityOptimizations() {
    // Bills optimization strategies
    this.indexStrategies.set('bills', [
      {
        entity: 'bills',
        fields: ['congress', 'bill_type', 'status'],
        type: 'composite',
        unique: false,
        sparse: false,
        priority: 10,
        estimatedBenefit: 0.8
      },
      {
        entity: 'bills',
        fields: ['sponsor.id'],
        type: 'btree',
        unique: false,
        sparse: false,
        priority: 9,
        estimatedBenefit: 0.7
      },
      {
        entity: 'bills',
        fields: ['subject_areas'],
        type: 'gin', // For array/text search
        unique: false,
        sparse: false,
        priority: 8,
        estimatedBenefit: 0.9
      },
      {
        entity: 'bills',
        fields: ['last_action.action_date'],
        type: 'btree',
        unique: false,
        sparse: false,
        condition: 'status = "active"', // Partial index for active bills
        priority: 7,
        estimatedBenefit: 0.6
      }
    ]);

    // Committee optimization strategies
    this.indexStrategies.set('committees', [
      {
        entity: 'committees',
        fields: ['chamber', 'committee_type'],
        type: 'composite',
        unique: false,
        sparse: false,
        priority: 8,
        estimatedBenefit: 0.7
      },
      {
        entity: 'committees',
        fields: ['jurisdiction_areas'],
        type: 'gin',
        unique: false,
        sparse: false,
        priority: 7,
        estimatedBenefit: 0.8
      }
    ]);

    // Representatives optimization strategies
    this.indexStrategies.set('representatives', [
      {
        entity: 'representatives',
        fields: ['state', 'district'],
        type: 'composite',
        unique: false,
        sparse: false,
        priority: 9,
        estimatedBenefit: 0.9
      },
      {
        entity: 'representatives',
        fields: ['party'],
        type: 'hash',
        unique: false,
        sparse: false,
        priority: 6,
        estimatedBenefit: 0.5
      }
    ]);

    // User engagement optimization strategies
    this.indexStrategies.set('user_engagement', [
      {
        entity: 'user_engagement',
        fields: ['user_id', 'timestamp'],
        type: 'composite',
        unique: false,
        sparse: false,
        priority: 10,
        estimatedBenefit: 0.9
      },
      {
        entity: 'user_engagement',
        fields: ['item_type', 'item_id'],
        type: 'composite',
        unique: false,
        sparse: false,
        priority: 9,
        estimatedBenefit: 0.8
      },
      {
        entity: 'user_engagement',
        fields: ['timestamp'],
        type: 'btree',
        unique: false,
        sparse: false,
        condition: 'timestamp > NOW() - INTERVAL "7 days"', // Recent engagement only
        priority: 8,
        estimatedBenefit: 0.7
      }
    ]);
  }

  private createIndexStrategies() {
    // Sort strategies by priority and estimated benefit
    for (const [entity, strategies] of this.indexStrategies.entries()) {
      strategies.sort((a, b) => {
        const aScore = a.priority * a.estimatedBenefit;
        const bScore = b.priority * b.estimatedBenefit;
        return bScore - aScore;
      });
    }
  }

  // Query optimization methods
  optimizeQuery(entity: string, query: any): OptimizedQuery {
    const querySignature = this.generateQuerySignature(entity, query);
    
    // Check if we have a pre-optimized version
    const cached = this.optimizedQueries.get(querySignature);
    if (cached) {
      return { 
        optimizedQuery: cached, 
        optimizations: ['cached_query'],
        estimatedImprovement: 0.9 
      };
    }

    const optimizations: string[] = [];
    let optimizedQuery = { ...query };
    let estimatedImprovement = 0;

    // Apply various optimization strategies
    if (this.canUseIndex(entity, query)) {
      optimizedQuery = this.applyIndexOptimization(optimizedQuery, entity);
      optimizations.push('index_optimization');
      estimatedImprovement += 0.3;
    }

    if (this.shouldLimitResults(query)) {
      optimizedQuery = this.applyResultLimiting(optimizedQuery);
      optimizations.push('result_limiting');
      estimatedImprovement += 0.1;
    }

    if (this.canBatchSubqueries(query)) {
      optimizedQuery = this.applyBatchOptimization(optimizedQuery);
      optimizations.push('batch_optimization');
      estimatedImprovement += 0.2;
    }

    if (this.shouldUseProjection(query)) {
      optimizedQuery = this.applyFieldProjection(optimizedQuery);
      optimizations.push('field_projection');
      estimatedImprovement += 0.15;
    }

    // Cache the optimized query
    this.optimizedQueries.set(querySignature, optimizedQuery);

    return {
      optimizedQuery,
      optimizations,
      estimatedImprovement: Math.min(estimatedImprovement, 0.9)
    };
  }

  // Specialized query builders for legislative data
  buildBillSearchQuery(filters: BillSearchFilters): OptimizedQuery {
    let query: any = {
      entity: 'bills',
      operation: 'search'
    };

    const conditions: QueryCondition[] = [];

    // Congress filter (highly selective)
    if (filters.congress) {
      conditions.push({
        field: 'congress',
        operator: 'eq',
        value: filters.congress,
        selectivity: 0.1
      });
    }

    // Status filter (moderately selective)
    if (filters.status && filters.status.length > 0) {
      conditions.push({
        field: 'status',
        operator: 'in',
        value: filters.status,
        selectivity: 0.3
      });
    }

    // Subject area filter (less selective but important)
    if (filters.subjectAreas && filters.subjectAreas.length > 0) {
      conditions.push({
        field: 'subject_areas',
        operator: 'contains',
        value: filters.subjectAreas,
        selectivity: 0.4
      });
    }

    // Sponsor filter (highly selective)
    if (filters.sponsorId) {
      conditions.push({
        field: 'sponsor.id',
        operator: 'eq',
        value: filters.sponsorId,
        selectivity: 0.05
      });
    }

    // Date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        conditions.push({
          field: 'last_action.action_date',
          operator: 'gte',
          value: filters.dateRange.start,
          selectivity: 0.5
        });
      }
      if (filters.dateRange.end) {
        conditions.push({
          field: 'last_action.action_date',
          operator: 'lte',
          value: filters.dateRange.end,
          selectivity: 0.7
        });
      }
    }

    // Text search (least selective, apply last)
    if (filters.searchText) {
      conditions.push({
        field: 'full_text',
        operator: 'contains',
        value: filters.searchText,
        selectivity: 0.8
      });
    }

    // Sort conditions by selectivity (most selective first)
    conditions.sort((a, b) => a.selectivity - b.selectivity);

    query.conditions = conditions;

    // Add ordering
    if (filters.sortBy) {
      query.orderBy = [filters.sortBy];
      if (filters.sortDirection === 'desc') {
        query.orderBy = [`${filters.sortBy} DESC`];
      }
    }

    // Add pagination
    if (filters.limit) {
      query.limit = filters.limit;
    }
    if (filters.offset) {
      query.offset = filters.offset;
    }

    return this.optimizeQuery('bills', query);
  }

  buildUserEngagementQuery(userId: string, options: EngagementQueryOptions): OptimizedQuery {
    const query: any = {
      entity: 'user_engagement',
      operation: 'select',
      conditions: [
        {
          field: 'user_id',
          operator: 'eq',
          value: userId,
          selectivity: 0.001 // Very selective
        }
      ]
    };

    if (options.itemType) {
      query.conditions.push({
        field: 'item_type',
        operator: 'eq',
        value: options.itemType,
        selectivity: 0.3
      });
    }

    if (options.since) {
      query.conditions.push({
        field: 'timestamp',
        operator: 'gte',
        value: options.since,
        selectivity: 0.2
      });
    }

    if (options.engagementTypes && options.engagementTypes.length > 0) {
      query.conditions.push({
        field: 'engagement_type',
        operator: 'in',
        value: options.engagementTypes,
        selectivity: 0.4
      });
    }

    query.orderBy = ['timestamp DESC'];
    query.limit = options.limit || 100;

    return this.optimizeQuery('user_engagement', query);
  }

  // Query execution with performance monitoring
  async executeQuery<T>(optimizedQuery: OptimizedQuery): Promise<QueryResult<T>> {
    const execution: QueryExecution = {
      query: JSON.stringify(optimizedQuery.optimizedQuery),
      parameters: [], // Would extract from query
      startTime: performance.now(),
      endTime: 0,
      resultCount: 0,
      cacheHit: false,
      optimizationApplied: optimizedQuery.optimizations
    };

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(optimizedQuery.optimizedQuery);
      let result = await this.checkQueryCache(cacheKey);
      
      if (result) {
        execution.cacheHit = true;
        execution.resultCount = result.length;
      } else {
        // Execute against data source
        result = await this.executeAgainstDataSource(optimizedQuery.optimizedQuery);
        execution.resultCount = result.length;
        
        // Cache results if appropriate
        await this.cacheQueryResult(cacheKey, result);
      }

      execution.endTime = performance.now();
      this.recordExecution(execution);

      return {
        data: result,
        totalCount: result.length,
        executionTime: execution.endTime - execution.startTime,
        optimizations: optimizedQuery.optimizations,
        cacheHit: execution.cacheHit
      };

    } catch (error) {
      execution.endTime = performance.now();
      this.recordExecution(execution);
      throw error;
    }
  }

  // Connection pooling and query execution
  private async executeAgainstDataSource(query: any): Promise<any[]> {
    // In the current frontend-focused architecture, this would integrate
    // with the legislative API client rather than direct DB access
    const { legislativeApiClient } = await import('./legislativeApiClient');
    
    try {
      switch (query.entity) {
        case 'bills':
          return await this.executeBillQuery(query);
        case 'committees':
          return await this.executeCommitteeQuery(query);
        case 'representatives':
          return await this.executeRepresentativeQuery(query);
        case 'user_engagement':
          return await this.executeEngagementQuery(query);
        default:
          throw new Error(`Unknown entity: ${query.entity}`);
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  private async executeBillQuery(query: any): Promise<any[]> {
    const { legislativeApiClient } = await import('./legislativeApiClient');
    
    // Convert query conditions to API parameters
    const params: any = {};
    
    for (const condition of query.conditions || []) {
      switch (condition.field) {
        case 'congress':
          params.congress = condition.value;
          break;
        case 'status':
          if (condition.operator === 'in') {
            params.status = condition.value.join(',');
          } else {
            params.status = condition.value;
          }
          break;
        case 'sponsor.id':
          params.sponsor = condition.value;
          break;
        // Add more field mappings
      }
    }

    if (query.limit) params.limit = query.limit;
    if (query.offset) params.offset = query.offset;

    const response = await legislativeApiClient.getBills(params);
    return response.results || [];
  }

  private async executeCommitteeQuery(query: any): Promise<any[]> {
    const { legislativeApiClient } = await import('./legislativeApiClient');
    
    const params: any = {};
    
    for (const condition of query.conditions || []) {
      switch (condition.field) {
        case 'chamber':
          params.chamber = condition.value;
          break;
        // Add more mappings
      }
    }

    const response = await legislativeApiClient.getCommittees(params.chamber);
    return response.results || [];
  }

  private async executeRepresentativeQuery(query: any): Promise<any[]> {
    // Similar implementation for representatives
    return [];
  }

  private async executeEngagementQuery(query: any): Promise<any[]> {
    // This would query user engagement data
    return [];
  }

  // Query analysis and optimization hints
  analyzeSlowQueries(): QueryAnalysis {
    const slowQueries = this.executionHistory
      .filter(exec => exec.endTime - exec.startTime > 1000) // > 1 second
      .sort((a, b) => (b.endTime - b.startTime) - (a.endTime - a.startTime));

    const recommendations: OptimizationRecommendation[] = [];

    for (const slowQuery of slowQueries.slice(0, 10)) { // Top 10 slowest
      const parsed = JSON.parse(slowQuery.query);
      
      if (!slowQuery.optimizationApplied.includes('index_optimization')) {
        recommendations.push({
          query: slowQuery.query,
          issue: 'Missing index optimization',
          recommendation: `Add index for entity: ${parsed.entity}`,
          estimatedImprovement: 0.5,
          priority: 'high'
        });
      }

      if (slowQuery.resultCount > 1000 && !slowQuery.optimizationApplied.includes('result_limiting')) {
        recommendations.push({
          query: slowQuery.query,
          issue: 'Large result set without pagination',
          recommendation: 'Implement pagination or result limiting',
          estimatedImprovement: 0.3,
          priority: 'medium'
        });
      }

      if (!slowQuery.cacheHit && slowQuery.resultCount < 100) {
        recommendations.push({
          query: slowQuery.query,
          issue: 'Small result set not cached',
          recommendation: 'Enable query result caching',
          estimatedImprovement: 0.8,
          priority: 'high'
        });
      }
    }

    return {
      totalQueries: this.executionHistory.length,
      slowQueries: slowQueries.length,
      averageExecutionTime: this.calculateAverageExecutionTime(),
      cacheHitRate: this.calculateCacheHitRate(),
      recommendations
    };
  }

  // Utility methods
  private canUseIndex(entity: string, query: any): boolean {
    const strategies = this.indexStrategies.get(entity) || [];
    const queryFields = this.extractQueryFields(query);
    
    return strategies.some(strategy => 
      strategy.fields.some(field => queryFields.includes(field))
    );
  }

  private shouldLimitResults(query: any): boolean {
    return !query.limit || query.limit > 100;
  }

  private canBatchSubqueries(query: any): boolean {
    return query.conditions && query.conditions.length > 1;
  }

  private shouldUseProjection(query: any): boolean {
    return !query.fields || query.fields.length === 0;
  }

  private applyIndexOptimization(query: any, entity: string): any {
    const strategies = this.indexStrategies.get(entity) || [];
    const bestStrategy = strategies[0]; // Highest priority
    
    if (bestStrategy) {
      // Reorder conditions to match index
      if (query.conditions) {
        query.conditions = this.reorderConditionsForIndex(query.conditions, bestStrategy.fields);
      }
    }
    
    return query;
  }

  private applyResultLimiting(query: any): any {
    if (!query.limit) {
      query.limit = 100; // Default limit
    }
    return query;
  }

  private applyBatchOptimization(query: any): any {
    // Group related conditions
    if (query.conditions) {
      query.conditions = this.optimizeConditionOrder(query.conditions);
    }
    return query;
  }

  private applyFieldProjection(query: any): any {
    if (!query.fields) {
      // Add essential fields only
      query.fields = this.getEssentialFields(query.entity);
    }
    return query;
  }

  private generateQuerySignature(entity: string, query: any): string {
    return `${entity}_${JSON.stringify(query).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private generateCacheKey(query: any): string {
    return `query_${JSON.stringify(query).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private extractQueryFields(query: any): string[] {
    const fields: string[] = [];
    if (query.conditions) {
      fields.push(...query.conditions.map((c: any) => c.field));
    }
    if (query.orderBy) {
      fields.push(...query.orderBy.map((o: string) => o.split(' ')[0]));
    }
    return [...new Set(fields)];
  }

  private reorderConditionsForIndex(conditions: QueryCondition[], indexFields: string[]): QueryCondition[] {
    return conditions.sort((a, b) => {
      const aIndex = indexFields.indexOf(a.field);
      const bIndex = indexFields.indexOf(b.field);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
  }

  private optimizeConditionOrder(conditions: QueryCondition[]): QueryCondition[] {
    // Order by selectivity (most selective first)
    return conditions.sort((a, b) => a.selectivity - b.selectivity);
  }

  private getEssentialFields(entity: string): string[] {
    const essentialFields: Record<string, string[]> = {
      bills: ['id', 'title', 'bill_number', 'status', 'sponsor'],
      committees: ['id', 'name', 'chamber', 'committee_type'],
      representatives: ['id', 'name', 'state', 'district', 'party'],
      user_engagement: ['id', 'user_id', 'item_id', 'engagement_type', 'timestamp']
    };
    
    return essentialFields[entity] || ['id'];
  }

  private async checkQueryCache(cacheKey: string): Promise<any[] | null> {
    // Integration with legislative cache manager
    const { legislativeCacheManager } = await import('../utils/legislativeCacheManager');
    return legislativeCacheManager.get('search_results', cacheKey);
  }

  private async cacheQueryResult(cacheKey: string, result: any[]): Promise<void> {
    if (result.length < 1000) { // Only cache smaller result sets
      const { legislativeCacheManager } = await import('../utils/legislativeCacheManager');
      legislativeCacheManager.set('search_results', cacheKey, result);
    }
  }

  private recordExecution(execution: QueryExecution): void {
    this.executionHistory.push(execution);
    
    // Keep only last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory.splice(0, this.executionHistory.length - 1000);
    }
  }

  private calculateAverageExecutionTime(): number {
    if (this.executionHistory.length === 0) return 0;
    
    const total = this.executionHistory.reduce(
      (sum, exec) => sum + (exec.endTime - exec.startTime), 0
    );
    
    return total / this.executionHistory.length;
  }

  private calculateCacheHitRate(): number {
    if (this.executionHistory.length === 0) return 0;
    
    const cacheHits = this.executionHistory.filter(exec => exec.cacheHit).length;
    return cacheHits / this.executionHistory.length;
  }

  private startPerformanceMonitoring(): void {
    // Monitor performance every 5 minutes
    setInterval(() => {
      const analysis = this.analyzeSlowQueries();
      
      if (analysis.slowQueries > 10) {
        console.warn('High number of slow queries detected:', analysis);
      }
      
      if (analysis.cacheHitRate < 0.5) {
        console.warn('Low cache hit rate detected:', analysis.cacheHitRate);
      }
    }, 5 * 60 * 1000);
  }

  // Public API
  getPerformanceStats() {
    return {
      totalQueries: this.executionHistory.length,
      averageExecutionTime: this.calculateAverageExecutionTime(),
      cacheHitRate: this.calculateCacheHitRate(),
      optimizedQueries: this.optimizedQueries.size
    };
  }

  clearCache() {
    this.optimizedQueries.clear();
  }
}

// Type definitions
interface BillSearchFilters {
  congress?: number;
  status?: string[];
  subjectAreas?: string[];
  sponsorId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  searchText?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface EngagementQueryOptions {
  itemType?: string;
  since?: string;
  engagementTypes?: string[];
  limit?: number;
}

interface OptimizedQuery {
  optimizedQuery: any;
  optimizations: string[];
  estimatedImprovement: number;
}

interface QueryResult<T> {
  data: T[];
  totalCount: number;
  executionTime: number;
  optimizations: string[];
  cacheHit: boolean;
}

interface QueryAnalysis {
  totalQueries: number;
  slowQueries: number;
  averageExecutionTime: number;
  cacheHitRate: number;
  recommendations: OptimizationRecommendation[];
}

interface OptimizationRecommendation {
  query: string;
  issue: string;
  recommendation: string;
  estimatedImprovement: number;
  priority: 'low' | 'medium' | 'high';
}

// Export singleton
export const queryOptimizer = new QueryOptimizer();
export default queryOptimizer;