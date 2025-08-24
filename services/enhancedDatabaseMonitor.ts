/**
 * Enhanced Database Monitor - Agent Casey
 * Advanced database performance monitoring for Morgan's Vercel Postgres operations
 * 
 * Features:
 * - Real-time query performance tracking
 * - Connection pool monitoring
 * - Slow query detection and alerting
 * - Database health scoring
 * - Automated optimization recommendations
 */

import { VercelPostgresDatabaseAdapter } from '@/lib/database/vercelPostgresAdapter';
import { performanceMonitor } from '@/utils/performanceMonitor';

export interface DatabasePerformanceMetrics {
  connectionHealth: {
    healthy: boolean;
    latency: number;
    activeConnections: number;
    totalConnections: number;
    idleConnections: number;
    error?: string;
  };
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    queryCount: number;
    errorRate: number;
    p95QueryTime: number;
    p99QueryTime: number;
  };
  tableMetrics: {
    totalTables: number;
    totalSize: number;
    largestTable: { name: string; size: number };
    indexUtilization: number;
  };
  securityMetrics: {
    activeUsers: number;
    recentLogins: number;
    failedAttempts: number;
    lockedAccounts: number;
  };
  healthScore: number; // 0-100
  recommendations: string[];
  lastChecked: string;
}

export interface QueryMetric {
  query: string;
  executionTime: number;
  timestamp: string;
  rows: number;
  cached: boolean;
  error?: string;
}

export class EnhancedDatabaseMonitor {
  private dbAdapter: VercelPostgresDatabaseAdapter;
  private queryMetrics: QueryMetric[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private alertThresholds = {
    slowQueryMs: 1000,
    highErrorRate: 0.05, // 5%
    lowHealthScore: 70,
    highConnectionUsage: 0.8 // 80% of pool
  };

  constructor(dbAdapter: VercelPostgresDatabaseAdapter) {
    this.dbAdapter = dbAdapter;
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    console.log('🔍 Starting enhanced database monitoring...');
    this.isMonitoring = true;

    // Initialize database connection
    await this.dbAdapter.initialize();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Database monitoring cycle failed:', error);
      }
    }, 30000); // Every 30 seconds

    console.log('✅ Enhanced database monitoring active');
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;

    console.log('🔍 Stopping database monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('✅ Database monitoring stopped');
  }

  async getComprehensiveMetrics(): Promise<DatabasePerformanceMetrics> {
    await this.collectMetrics();
    
    const [
      connectionHealth,
      performanceMetrics,
      databaseSize,
      userCount,
      activeUserCount
    ] = await Promise.allSettled([
      this.getConnectionHealth(),
      this.dbAdapter.getPerformanceMetrics(),
      this.dbAdapter.getDatabaseSize(),
      this.dbAdapter.getUserCount(),
      this.dbAdapter.getActiveUserCount(24 * 60 * 60 * 1000) // Last 24 hours
    ]);

    // Process connection health
    const connHealth = connectionHealth.status === 'fulfilled' 
      ? connectionHealth.value 
      : { healthy: false, latency: 0, activeConnections: 0, totalConnections: 0, idleConnections: 0, error: 'Failed to check connection' };

    // Process performance metrics
    const perfMetrics = performanceMetrics.status === 'fulfilled' 
      ? performanceMetrics.value 
      : { queryTime: { avg: 0, p95: 0, p99: 0 }, connectionTime: { avg: 0, p95: 0, p99: 0 }, errorRate: 1 };

    // Process database size
    const sizeInfo = databaseSize.status === 'fulfilled' 
      ? databaseSize.value 
      : { sizeInBytes: 0, tables: {} };

    // Process user counts
    const totalUsers = userCount.status === 'fulfilled' ? userCount.value : 0;
    const activeUsers = activeUserCount.status === 'fulfilled' ? activeUserCount.value : 0;

    // Calculate query performance from collected metrics
    const recentQueries = this.queryMetrics.filter(
      q => new Date(q.timestamp).getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    const queryPerformance = this.calculateQueryPerformance(recentQueries);
    const tableMetrics = this.calculateTableMetrics(sizeInfo);
    const securityMetrics = await this.getSecurityMetrics(totalUsers, activeUsers);
    const healthScore = this.calculateHealthScore(connHealth, queryPerformance, perfMetrics.errorRate);
    const recommendations = this.generateRecommendations(connHealth, queryPerformance, healthScore);

    return {
      connectionHealth: {
        ...connHealth,
        ...await this.dbAdapter.getConnectionPoolStatus()
      },
      queryPerformance,
      tableMetrics,
      securityMetrics,
      healthScore,
      recommendations,
      lastChecked: new Date().toISOString()
    };
  }

  // Track individual query performance
  async trackQuery(
    queryOperation: () => Promise<any>,
    queryDescription: string = 'unknown'
  ): Promise<any> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    let error: string | undefined;
    let result: any;
    let rowCount = 0;

    try {
      result = await queryOperation();
      
      // Try to determine row count
      if (Array.isArray(result)) {
        rowCount = result.length;
      } else if (result && typeof result === 'object' && 'rows' in result) {
        rowCount = Array.isArray(result.rows) ? result.rows.length : 0;
      }

    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      
      // Record query metric
      const queryMetric: QueryMetric = {
        query: queryDescription,
        executionTime,
        timestamp,
        rows: rowCount,
        cached: false, // Could implement cache detection
        error
      };
      
      this.queryMetrics.push(queryMetric);
      
      // Keep only recent metrics (last 1000 or 1 hour)
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      this.queryMetrics = this.queryMetrics
        .filter(m => new Date(m.timestamp).getTime() > oneHourAgo)
        .slice(-1000);

      // Track slow queries
      if (executionTime > this.alertThresholds.slowQueryMs) {
        this.handleSlowQuery(queryMetric);
      }

      // Record metric for performance monitoring
      performanceMonitor.recordMetric('database_query', executionTime, {
        query: queryDescription,
        rows: rowCount,
        success: !error
      });
    }

    return result;
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Perform test query to measure current performance
      await this.trackQuery(
        () => this.dbAdapter.checkConnection(),
        'health_check'
      );
      
      // Collect additional health metrics
      await this.trackQuery(
        () => this.dbAdapter.getUserCount(),
        'user_count'
      );

    } catch (error) {
      console.error('Failed to collect database metrics:', error);
    }
  }

  private async getConnectionHealth(): Promise<any> {
    try {
      const health = await this.dbAdapter.checkConnection();
      const pool = await this.dbAdapter.getConnectionPoolStatus();
      
      return {
        ...health,
        ...pool
      };
    } catch (error) {
      return {
        healthy: false,
        latency: 0,
        activeConnections: 0,
        totalConnections: 0,
        idleConnections: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private calculateQueryPerformance(queries: QueryMetric[]) {
    if (queries.length === 0) {
      return {
        averageQueryTime: 0,
        slowQueries: 0,
        queryCount: 0,
        errorRate: 0,
        p95QueryTime: 0,
        p99QueryTime: 0
      };
    }

    const successfulQueries = queries.filter(q => !q.error);
    const errorQueries = queries.filter(q => q.error);
    const queryTimes = successfulQueries.map(q => q.executionTime).sort((a, b) => a - b);

    return {
      averageQueryTime: Math.round(queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length || 0),
      slowQueries: queries.filter(q => q.executionTime > this.alertThresholds.slowQueryMs).length,
      queryCount: queries.length,
      errorRate: errorQueries.length / queries.length,
      p95QueryTime: Math.round(queryTimes[Math.floor(queryTimes.length * 0.95)] || 0),
      p99QueryTime: Math.round(queryTimes[Math.floor(queryTimes.length * 0.99)] || 0)
    };
  }

  private calculateTableMetrics(sizeInfo: any) {
    const tables = Object.entries(sizeInfo.tables || {});
    const totalSize = sizeInfo.sizeInBytes || 0;
    
    let largestTable = { name: 'none', size: 0 };
    if (tables.length > 0) {
      const [name, size] = tables.reduce((largest, [tableName, tableSize]) => 
        (tableSize as number) > (largest[1] as number) ? [tableName, tableSize] : largest
      );
      largestTable = { name: name as string, size: size as number };
    }

    return {
      totalTables: tables.length,
      totalSize,
      largestTable,
      indexUtilization: 0.85 // Placeholder - would need actual index usage stats
    };
  }

  private async getSecurityMetrics(totalUsers: number, activeUsers: number) {
    try {
      // Get security-related metrics
      const [recentLogins, failedAttempts] = await Promise.all([
        this.dbAdapter.getLoginStats({
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }),
        this.dbAdapter.getSecurityEventsByType('login_failed', {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        })
      ]);

      const todayLogins = recentLogins.reduce((sum, day) => sum + day.count, 0);
      
      return {
        activeUsers,
        recentLogins: todayLogins,
        failedAttempts: failedAttempts.length,
        lockedAccounts: 0 // Would need to query for locked accounts
      };

    } catch (error) {
      return {
        activeUsers: 0,
        recentLogins: 0,
        failedAttempts: 0,
        lockedAccounts: 0
      };
    }
  }

  private calculateHealthScore(
    connectionHealth: any,
    queryPerformance: any,
    errorRate: number
  ): number {
    let score = 100;

    // Connection health (30%)
    if (!connectionHealth.healthy) score -= 30;
    else if (connectionHealth.latency > 100) score -= 15;
    else if (connectionHealth.latency > 50) score -= 5;

    // Query performance (40%)
    if (queryPerformance.averageQueryTime > 1000) score -= 25;
    else if (queryPerformance.averageQueryTime > 500) score -= 15;
    else if (queryPerformance.averageQueryTime > 200) score -= 5;

    if (queryPerformance.errorRate > 0.1) score -= 15;
    else if (queryPerformance.errorRate > 0.05) score -= 10;
    else if (queryPerformance.errorRate > 0.01) score -= 5;

    // Overall error rate (30%)
    if (errorRate > 0.1) score -= 30;
    else if (errorRate > 0.05) score -= 20;
    else if (errorRate > 0.01) score -= 10;

    return Math.max(0, Math.round(score));
  }

  private generateRecommendations(
    connectionHealth: any,
    queryPerformance: any,
    healthScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Connection recommendations
    if (!connectionHealth.healthy) {
      recommendations.push('🔴 CRITICAL: Database connection is unhealthy - investigate immediately');
    } else if (connectionHealth.latency > 100) {
      recommendations.push('⚠️ High database latency detected - consider connection pooling optimization');
    }

    // Query performance recommendations
    if (queryPerformance.averageQueryTime > 1000) {
      recommendations.push('🐌 Very slow average query time - review query optimization and indexing');
    } else if (queryPerformance.averageQueryTime > 500) {
      recommendations.push('⏱️ Slow query performance - consider query optimization');
    }

    if (queryPerformance.slowQueries > 10) {
      recommendations.push(`📊 ${queryPerformance.slowQueries} slow queries detected - review and optimize`);
    }

    if (queryPerformance.errorRate > 0.05) {
      recommendations.push('❌ High query error rate - investigate failing queries');
    }

    // Connection pool recommendations
    const poolUsage = connectionHealth.activeConnections / (connectionHealth.totalConnections || 1);
    if (poolUsage > 0.8) {
      recommendations.push('🏊‍♂️ High connection pool usage - consider increasing pool size');
    }

    // Health score recommendations
    if (healthScore < 70) {
      recommendations.push('🏥 Overall database health is poor - immediate attention required');
    } else if (healthScore < 85) {
      recommendations.push('💊 Database health could be improved - review recommendations above');
    }

    // Performance optimization suggestions
    if (recommendations.length === 0) {
      recommendations.push('✅ Database is performing well - continue monitoring');
    }

    return recommendations;
  }

  private handleSlowQuery(queryMetric: QueryMetric): void {
    console.warn(
      `🐌 Slow query detected: ${queryMetric.query} took ${queryMetric.executionTime}ms`
    );

    // Could implement alerting, logging to external systems, etc.
    performanceMonitor.recordMetric('slow_query_alert', queryMetric.executionTime, {
      query: queryMetric.query,
      timestamp: queryMetric.timestamp
    });
  }

  // Public methods for integration
  getRecentQueries(limit: number = 50): QueryMetric[] {
    return this.queryMetrics.slice(-limit);
  }

  getSlowQueries(thresholdMs?: number): QueryMetric[] {
    const threshold = thresholdMs || this.alertThresholds.slowQueryMs;
    return this.queryMetrics.filter(q => q.executionTime > threshold);
  }

  async optimizeDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      await this.dbAdapter.optimizeDatabase();
      return { success: true, message: 'Database optimization completed successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: `Database optimization failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async runHealthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    try {
      const integrity = await this.dbAdapter.validateDatabaseIntegrity();
      return {
        healthy: integrity.healthy ?? true,
        issues: integrity.issues || []
      };
    } catch (error) {
      return {
        healthy: false,
        issues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
}

export default EnhancedDatabaseMonitor;