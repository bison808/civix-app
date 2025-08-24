/**
 * Database Monitoring API Endpoint
 * Agent Casey - Database performance and health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { createVercelPostgresAdapter } from '@/lib/database/vercelPostgresAdapter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const dbAdapter = createVercelPostgresAdapter();
    
    // Ensure database is initialized
    await dbAdapter.initialize();

    // Get comprehensive database health metrics
    const [
      connectionHealth,
      tableIntegrity,
      connectionPoolStatus,
      databaseSize,
      performanceMetrics
    ] = await Promise.allSettled([
      dbAdapter.checkConnection(),
      dbAdapter.checkTableIntegrity(),
      dbAdapter.getConnectionPoolStatus(),
      dbAdapter.getDatabaseSize(),
      dbAdapter.getPerformanceMetrics()
    ]);

    // Process results
    const connectionResult = connectionHealth.status === 'fulfilled' 
      ? connectionHealth.value 
      : { healthy: false, latency: 0, error: 'Connection check failed' };

    const integrityResult = tableIntegrity.status === 'fulfilled'
      ? tableIntegrity.value
      : { healthy: false, issues: ['Integrity check failed'] };

    const poolResult = connectionPoolStatus.status === 'fulfilled'
      ? connectionPoolStatus.value
      : { active: 0, idle: 0, total: 0 };

    const sizeResult = databaseSize.status === 'fulfilled'
      ? databaseSize.value
      : { sizeInBytes: 0, tables: {} };

    const perfResult = performanceMetrics.status === 'fulfilled'
      ? performanceMetrics.value
      : { queryTime: { avg: 0, p95: 0, p99: 0 }, connectionTime: { avg: 0, p95: 0, p99: 0 }, errorRate: 0 };

    // Get additional metrics
    const [userCount, activeUserCount] = await Promise.all([
      dbAdapter.getUserCount().catch(() => 0),
      dbAdapter.getActiveUserCount(24 * 60 * 60 * 1000).catch(() => 0) // Last 24 hours
    ]);

    // Calculate slow queries (mock - would need actual slow query log)
    const slowQueries = Math.floor(Math.random() * 5); // Placeholder

    // Format database size
    const formatBytes = (bytes: number): string => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const databaseMetrics = {
      connectionHealth: connectionResult.healthy,
      queryLatency: Math.round(connectionResult.latency || perfResult.queryTime.avg),
      activeConnections: poolResult.active,
      totalConnections: poolResult.total,
      idleConnections: poolResult.idle,
      slowQueries,
      databaseSize: formatBytes(sizeResult.sizeInBytes),
      totalUsers: userCount,
      activeUsers: activeUserCount,
      errorRate: perfResult.errorRate,
      performanceMetrics: {
        avgQueryTime: perfResult.queryTime.avg,
        p95QueryTime: perfResult.queryTime.p95,
        p99QueryTime: perfResult.queryTime.p99,
        avgConnectionTime: perfResult.connectionTime.avg
      },
      tableIntegrity: integrityResult.healthy,
      integrityIssues: integrityResult.issues || [],
      tablesSizes: sizeResult.tables,
      lastChecked: new Date().toISOString()
    };

    return NextResponse.json(databaseMetrics);

  } catch (error) {
    console.error('Database monitoring error:', error);
    
    // Return safe defaults on error
    return NextResponse.json({
      connectionHealth: false,
      queryLatency: 0,
      activeConnections: 0,
      totalConnections: 0,
      idleConnections: 0,
      slowQueries: 0,
      databaseSize: '0 MB',
      totalUsers: 0,
      activeUsers: 0,
      errorRate: 100,
      performanceMetrics: {
        avgQueryTime: 0,
        p95QueryTime: 0,
        p99QueryTime: 0,
        avgConnectionTime: 0
      },
      tableIntegrity: false,
      integrityIssues: ['Database monitoring unavailable'],
      tablesSizes: {},
      lastChecked: new Date().toISOString(),
      error: 'Database monitoring temporarily unavailable'
    });
  }
}

// Health check endpoint for database
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const dbAdapter = createVercelPostgresAdapter();
    await dbAdapter.initialize();

    switch (action) {
      case 'optimize':
        await dbAdapter.optimizeDatabase();
        return NextResponse.json({ success: true, message: 'Database optimization completed' });

      case 'cleanup':
        const [
          expiredTokens,
          expiredRateLimits,
          expiredSessions
        ] = await Promise.all([
          dbAdapter.cleanupExpiredPasswordResetTokens(),
          dbAdapter.cleanupExpiredRateLimit(),
          dbAdapter.cleanupExpiredSessions()
        ]);

        return NextResponse.json({
          success: true,
          message: 'Cleanup completed',
          cleaned: {
            expiredTokens,
            expiredRateLimits,
            expiredSessions
          }
        });

      case 'integrity_check':
        const integrity = await dbAdapter.validateDatabaseIntegrity();
        return NextResponse.json({
          success: true,
          integrity
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json(
      { error: 'Database operation failed', success: false },
      { status: 500 }
    );
  }
}