/**
 * LegiScan API Usage Monitoring Endpoint
 * Agent Casey - Critical quota tracking for 30K monthly limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveSecurityMonitor } from '@/services/comprehensiveSecurityMonitor';
import { createVercelPostgresAdapter } from '@/lib/database/vercelPostgresAdapter';
import type { SecurityMonitorConfig } from '@/lib/integrations/securityMonitor';

// Initialize security monitor (includes LegiScan tracking)
const securityConfig: SecurityMonitorConfig = {
  enabled: true,
  realTimeAnalysis: true,
  alertThresholds: {
    failedLoginAttempts: 5,
    suspiciousActivityScore: 70,
    geographicAnomalyDistance: 1000,
    timeBasedAnomalyWindow: 60
  },
  notifications: {
    email: ['admin@citzn.com'],
    webhook: process.env.SECURITY_WEBHOOK_URL
  },
  threatIntelligence: {
    enabled: true,
    providers: ['basic'],
    updateInterval: 60,
    cacheTimeout: 240
  },
  logging: {
    enabled: true,
    level: 'info',
    retentionDays: 30,
    compressOldLogs: true
  },
  rateLimiting: {
    eventsPerSecond: 100,
    burstSize: 500
  }
};

const dbAdapter = createVercelPostgresAdapter();
const securityMonitor = new ComprehensiveSecurityMonitor(securityConfig, dbAdapter);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get LegiScan usage metrics
    const metrics = await securityMonitor.getLegiScanUsageMetrics();

    // Add alert status based on usage
    const alertStatus = 
      metrics.quotaPercentage >= 95 ? 'critical' :
      metrics.quotaPercentage >= 85 ? 'high' :
      metrics.quotaPercentage >= 70 ? 'medium' : 'low';

    const response = {
      ...metrics,
      alertStatus,
      recommendations: getUsageRecommendations(metrics)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('LegiScan usage monitoring error:', error);
    
    // Return safe defaults
    return NextResponse.json({
      monthlyUsage: 0,
      monthlyLimit: 30000,
      quotaPercentage: 0,
      dailyUsage: 0,
      projectedMonthlyUsage: 0,
      daysUntilReset: 30,
      alertStatus: 'low',
      recommendations: [],
      error: 'Usage tracking temporarily unavailable'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requestCount = 1 } = await request.json();
    
    // Track usage
    await securityMonitor.trackLegiScanUsage(requestCount);
    
    // Return updated metrics
    const metrics = await securityMonitor.getLegiScanUsageMetrics();
    
    return NextResponse.json({
      success: true,
      ...metrics
    });

  } catch (error) {
    console.error('LegiScan usage tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track usage', success: false },
      { status: 500 }
    );
  }
}

function getUsageRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.quotaPercentage >= 95) {
    recommendations.push('URGENT: Enable emergency rate limiting');
    recommendations.push('Consider upgrading to paid tier immediately');
    recommendations.push('Disable non-essential LegiScan features');
  } else if (metrics.quotaPercentage >= 85) {
    recommendations.push('Enable aggressive caching for LegiScan responses');
    recommendations.push('Optimize API usage patterns');
    recommendations.push('Prepare for potential quota upgrade');
  } else if (metrics.quotaPercentage >= 70) {
    recommendations.push('Monitor usage patterns closely');
    recommendations.push('Review high-usage features');
    recommendations.push('Increase cache TTL for legislative data');
  } else if (metrics.projectedMonthlyUsage > metrics.monthlyLimit * 0.8) {
    recommendations.push('Projected to exceed 80% quota this month');
    recommendations.push('Consider implementing usage optimization');
  }
  
  return recommendations;
}