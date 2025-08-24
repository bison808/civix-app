/**
 * Security Monitoring API Endpoint
 * Agent Casey - Security monitoring data for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveSecurityMonitor } from '@/services/comprehensiveSecurityMonitor';
import { createVercelPostgresAdapter } from '@/lib/database/vercelPostgresAdapter';
import type { SecurityMonitorConfig } from '@/lib/integrations/securityMonitor';

// Initialize security monitor
const securityConfig: SecurityMonitorConfig = {
  enabled: true,
  realTimeAnalysis: true,
  alertThresholds: {
    failedLoginAttempts: 5,
    suspiciousActivityScore: 70,
    geographicAnomalyDistance: 1000, // km
    timeBasedAnomalyWindow: 60 // minutes
  },
  notifications: {
    email: ['security@citzn.com'],
    webhook: process.env.SECURITY_WEBHOOK_URL
  },
  threatIntelligence: {
    enabled: true,
    providers: ['basic'],
    updateInterval: 60, // minutes
    cacheTimeout: 240 // minutes
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
    // Get real-time security metrics
    const [
      realTimeMetrics,
      activeAlerts,
      monitoringStatus
    ] = await Promise.all([
      securityMonitor.getRealTimeMetrics(),
      securityMonitor.getActiveAlerts(),
      securityMonitor.getMonitoringStatus()
    ]);

    // Calculate threat level based on active alerts
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const highAlerts = activeAlerts.filter(a => a.severity === 'high').length;
    
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalAlerts > 0) threatLevel = 'critical';
    else if (highAlerts > 2) threatLevel = 'high';
    else if (highAlerts > 0 || activeAlerts.length > 5) threatLevel = 'medium';

    const securityMetrics = {
      activeAlerts: activeAlerts.length,
      blockedAttempts: realTimeMetrics.blockedAttempts || 0,
      suspiciousIPs: realTimeMetrics.suspiciousIPs || 0,
      alertsToday: realTimeMetrics.alertsToday || 0,
      threatLevel,
      monitoringActive: monitoringStatus.active,
      eventsProcessed: monitoringStatus.eventsProcessed
    };

    return NextResponse.json(securityMetrics);

  } catch (error) {
    console.error('Security monitoring API error:', error);
    
    // Return safe defaults on error
    return NextResponse.json({
      activeAlerts: 0,
      blockedAttempts: 0,
      suspiciousIPs: 0,
      alertsToday: 0,
      threatLevel: 'medium',
      monitoringActive: false,
      eventsProcessed: 0,
      error: 'Security monitoring temporarily unavailable'
    });
  }
}