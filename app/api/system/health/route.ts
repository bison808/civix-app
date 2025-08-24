/**
 * System Health API Endpoint
 * Agent 54: System Stability & External Dependencies Integration Specialist
 * 
 * Provides real-time health status for all external dependencies and system components
 */

import { NextRequest, NextResponse } from 'next/server';
import { systemHealthService } from '@/services/systemHealthService';

export const dynamic = 'force-dynamic'; // Always execute dynamically
export const revalidate = 0; // Don't cache this endpoint

// GET /api/system/health
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'detailed';
    const dependency = searchParams.get('dependency');

    let healthData;

    if (dependency) {
      // Get health for specific dependency
      healthData = await systemHealthService.getDependencyHealth(dependency);
      if (!healthData) {
        return NextResponse.json(
          { error: `Dependency '${dependency}' not found` },
          { status: 404 }
        );
      }
    } else {
      // Get overall system health
      healthData = await systemHealthService.getSystemHealth();
    }

    // Format response based on request
    if (format === 'simple') {
      const simpleResponse = dependency ? {
        name: (healthData as any).name,
        status: (healthData as any).status,
        uptime: (healthData as any).uptime
      } : {
        status: (healthData as any).overallStatus,
        score: (healthData as any).stabilityScore,
        uptime: (healthData as any).uptime,
        dependencies: (healthData as any).dependencies?.length || 0,
        critical: (healthData as any).criticalIssues?.length || 0
      };

      return NextResponse.json(simpleResponse);
    }

    // Set appropriate cache headers
    const response = NextResponse.json(healthData);
    
    // Don't cache health data, but allow short-term client caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('X-Health-Check', 'true');
    response.headers.set('X-Timestamp', new Date().toISOString());

    // Add health status headers for load balancer health checks
    if (dependency) {
      const depHealth = healthData as any;
      response.headers.set('X-Dependency-Status', depHealth.status);
    } else {
      const systemHealth = healthData as any;
      response.headers.set('X-System-Status', systemHealth.overallStatus);
      response.headers.set('X-Stability-Score', systemHealth.stabilityScore.toString());
    }

    return response;

  } catch (error) {
    console.error('Health check API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/system/health/reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dependency } = body;

    if (!action || !['reset', 'reset-all'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "reset" or "reset-all"' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'reset-all') {
      await systemHealthService.resetAllDependencies();
      result = { message: 'All dependencies reset successfully' };
    } else if (action === 'reset' && dependency) {
      const success = await systemHealthService.resetDependency(dependency);
      if (!success) {
        return NextResponse.json(
          { error: `Dependency '${dependency}' not found` },
          { status: 404 }
        );
      }
      result = { message: `Dependency '${dependency}' reset successfully` };
    } else {
      return NextResponse.json(
        { error: 'Missing dependency parameter for reset action' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Health reset API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Health reset failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}