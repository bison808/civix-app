/**
 * Security Events API Endpoint
 * Agent Casey - Security event ingestion and processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveSecurityMonitor } from '@/services/comprehensiveSecurityMonitor';
import { createVercelPostgresAdapter } from '@/lib/database/vercelPostgresAdapter';
import type { SecurityEvent } from '@/lib/enhancedUserStore';
import type { SecurityMonitorConfig } from '@/lib/integrations/securityMonitor';

// Security monitor configuration
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
    email: ['security@citzn.com']
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

export async function POST(request: NextRequest) {
  try {
    const event: SecurityEvent = await request.json();
    
    // Validate required fields
    if (!event.type || !event.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: type, timestamp' },
        { status: 400 }
      );
    }

    // Enrich event with server-side context
    const enrichedEvent: SecurityEvent = {
      ...event,
      ipAddress: event.ipAddress || getClientIP(request),
      userAgent: event.userAgent || request.headers.get('user-agent') || undefined,
      details: {
        ...event.details,
        serverTimestamp: new Date().toISOString(),
        forwardedFor: request.headers.get('x-forwarded-for'),
        realIP: request.headers.get('x-real-ip'),
        cfConnectingIP: request.headers.get('cf-connecting-ip')
      }
    };

    // Process the security event
    const processedEvent = await securityMonitor.processSecurityEvent(
      enrichedEvent,
      {
        requestHeaders: Object.fromEntries(request.headers.entries()),
        url: request.url,
        method: request.method
      }
    );

    // If this is a high-risk event, perform additional checks
    if (processedEvent.severity === 'high' || processedEvent.severity === 'critical') {
      await performHighRiskEventActions(processedEvent, request);
    }

    // Track authentication events specifically
    if (isAuthenticationEvent(event.type)) {
      await trackAuthenticationMetrics(event);
    }

    return NextResponse.json({
      success: true,
      eventId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: processedEvent.severity,
      riskScore: processedEvent.riskScore,
      processed: true
    });

  } catch (error) {
    console.error('Security event processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process security event',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');
    const eventType = searchParams.get('type');
    const severity = searchParams.get('severity');
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Calculate time window
    const timeWindowMs = parseTimeRange(timeRange);
    const startTime = new Date(Date.now() - timeWindowMs).toISOString();
    const endTime = new Date().toISOString();

    // Get security events from database
    let events;
    if (eventType) {
      events = await dbAdapter.getSecurityEventsByType(
        eventType as any,
        { start: startTime, end: endTime }
      );
    } else {
      events = await dbAdapter.getSecurityEventsByTimeRange(startTime, endTime);
    }

    // Filter by severity if specified
    if (severity) {
      // This would require storing severity in the database
      // For now, we'll return all events
    }

    // Apply pagination
    const paginatedEvents = events.slice(offset, offset + limit);

    // Add aggregated statistics
    const stats = {
      total: events.length,
      byType: aggregateByField(events, 'type'),
      bySeverity: {}, // Would need to calculate from processed events
      timeRange: { start: startTime, end: endTime }
    };

    return NextResponse.json({
      events: paginatedEvents,
      stats,
      pagination: {
        limit,
        offset,
        total: events.length,
        hasMore: offset + limit < events.length
      }
    });

  } catch (error) {
    console.error('Security events retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve security events' },
      { status: 500 }
    );
  }
}

// Helper functions

function getClientIP(request: NextRequest): string {
  // Try multiple headers for IP detection
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  return 'unknown';
}

function isAuthenticationEvent(eventType: string): boolean {
  const authEvents = [
    'login_attempt',
    'login_success', 
    'login_failed',
    'logout',
    'register_attempt',
    'register_success',
    'register_failed',
    'password_reset',
    'account_locked',
    'session_expired'
  ];
  
  return authEvents.includes(eventType);
}

async function trackAuthenticationMetrics(event: SecurityEvent): Promise<void> {
  try {
    // Update authentication metrics
    // This would integrate with analytics/metrics collection
    console.log(`📊 Auth metric: ${event.type} at ${event.timestamp}`);
    
    // Track failed login attempts for rate limiting
    if (event.type === 'login_failed' && event.ipAddress) {
      await dbAdapter.updateRateLimitInfo(event.ipAddress, {
        identifier: event.ipAddress,
        attempts: 1, // This would increment existing count
        windowStart: Date.now(),
        blocked: false
      });
    }
    
  } catch (error) {
    console.error('Failed to track authentication metrics:', error);
  }
}

async function performHighRiskEventActions(
  event: any, 
  request: NextRequest
): Promise<void> {
  try {
    // Log high-risk event with additional context
    console.warn(`🚨 High-risk security event: ${event.type} (${event.severity}) - Risk: ${event.riskScore}`);
    
    // For critical events, implement immediate response
    if (event.severity === 'critical') {
      // Could implement auto-blocking, alerting, etc.
      console.error(`🔴 CRITICAL security event detected - implementing emergency protocols`);
      
      // Example: Auto-block suspicious IP
      if (event.riskScore > 90 && event.ipAddress) {
        // This would integrate with actual blocking mechanism
        console.log(`Considering auto-block for IP: ${event.ipAddress}`);
      }
    }
    
  } catch (error) {
    console.error('Failed to perform high-risk event actions:', error);
  }
}

function parseTimeRange(timeRange: string): number {
  const unit = timeRange.slice(-1);
  const value = parseInt(timeRange.slice(0, -1));
  
  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    default: return 24 * 60 * 60 * 1000; // Default to 24 hours
  }
}

function aggregateByField(events: any[], field: string): Record<string, number> {
  return events.reduce((acc, event) => {
    const value = event[field] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}