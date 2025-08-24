/**
 * Performance Monitoring API Endpoint
 * Agent Casey - Performance metrics collection and reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { apiMonitor } from '@/lib/api-monitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get performance summary from performance monitor
    const performanceSummary = performanceMonitor.getPerformanceSummary();
    const webVitalsSummary = performanceMonitor.getWebVitalsSummary();
    const apiSummary = apiMonitor.getSummary();

    // Calculate API response times by service
    const apiResponseTimes = {
      congress: getAverageResponseTime(apiSummary.byEndpoint, 'congress'),
      legiScan: getAverageResponseTime(apiSummary.byEndpoint, 'legiscan'),
      geocoding: getAverageResponseTime(apiSummary.byEndpoint, 'geocoding'),
      overall: apiSummary.averageResponseTime
    };

    // Get Core Web Vitals with proper formatting
    const coreWebVitals = {
      lcp: webVitalsSummary.LCP?.avg || 0,
      fid: webVitalsSummary.FID?.avg || 0,
      cls: webVitalsSummary.CLS?.avg || 0,
      fcp: webVitalsSummary.FCP?.avg || 0,
      ttfb: webVitalsSummary.TTFB?.avg || 0
    };

    // Performance scoring
    const performanceScore = calculatePerformanceScore(coreWebVitals, apiResponseTimes.overall);

    const performanceMetrics = {
      // Core Web Vitals
      coreWebVitals,
      performanceScore,
      
      // API Response Times
      apiResponseTimes,
      
      // Overall metrics
      averageLoadTime: performanceSummary.sync_page_load?.avg || 0,
      totalRequests: apiSummary.totalRequests,
      errorRate: parseFloat(apiSummary.errorRate) || 0,
      cacheHitRate: parseFloat(apiSummary.cacheHitRate) || 0,
      
      // Detailed breakdowns
      slowRequests: apiSummary.slowRequests,
      byEndpoint: apiSummary.byEndpoint,
      
      // User experience metrics
      userExperience: {
        loadTime: coreWebVitals.lcp < 2500 ? 'good' : coreWebVitals.lcp < 4000 ? 'needs_improvement' : 'poor',
        interactivity: coreWebVitals.fid < 100 ? 'good' : coreWebVitals.fid < 300 ? 'needs_improvement' : 'poor',
        visualStability: coreWebVitals.cls < 0.1 ? 'good' : coreWebVitals.cls < 0.25 ? 'needs_improvement' : 'poor'
      },
      
      // Performance trends (last hour)
      trends: {
        improving: performanceScore > 75,
        stable: performanceScore >= 60 && performanceScore <= 75,
        declining: performanceScore < 60
      },
      
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(performanceMetrics);

  } catch (error) {
    console.error('Performance monitoring error:', error);
    
    // Return safe defaults on error
    return NextResponse.json({
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      },
      performanceScore: 50,
      apiResponseTimes: {
        congress: 0,
        legiScan: 0,
        geocoding: 0,
        overall: 0
      },
      averageLoadTime: 0,
      totalRequests: 0,
      errorRate: 0,
      cacheHitRate: 0,
      slowRequests: 0,
      byEndpoint: [],
      userExperience: {
        loadTime: 'unknown',
        interactivity: 'unknown',
        visualStability: 'unknown'
      },
      trends: {
        improving: false,
        stable: false,
        declining: false
      },
      lastUpdated: new Date().toISOString(),
      error: 'Performance monitoring temporarily unavailable'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'record_metric':
        performanceMonitor.recordMetric(data.name, data.value, data.metadata);
        return NextResponse.json({ success: true });

      case 'track_user_flow':
        if (data.flowId && data.stepName) {
          performanceMonitor.addFlowStep(data.flowId, data.stepName, data.metadata);
        }
        return NextResponse.json({ success: true });

      case 'clear_cache':
        apiMonitor.clear();
        return NextResponse.json({ success: true, message: 'Performance cache cleared' });

      case 'export_metrics':
        const exportedData = performanceMonitor.exportMetrics();
        return NextResponse.json({
          success: true,
          data: exportedData,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Performance operation error:', error);
    return NextResponse.json(
      { error: 'Performance operation failed', success: false },
      { status: 500 }
    );
  }
}

// Helper functions
function getAverageResponseTime(endpoints: any[], serviceName: string): number {
  const serviceEndpoints = endpoints.filter(ep => 
    ep.endpoint.toLowerCase().includes(serviceName.toLowerCase())
  );
  
  if (serviceEndpoints.length === 0) return 0;
  
  const totalTime = serviceEndpoints.reduce((sum, ep) => sum + ep.avgTime, 0);
  return Math.round(totalTime / serviceEndpoints.length);
}

function calculatePerformanceScore(webVitals: any, avgResponseTime: number): number {
  let score = 100;
  
  // LCP scoring (40% weight)
  if (webVitals.lcp > 4000) score -= 40;
  else if (webVitals.lcp > 2500) score -= 20;
  
  // FID scoring (30% weight)
  if (webVitals.fid > 300) score -= 30;
  else if (webVitals.fid > 100) score -= 15;
  
  // CLS scoring (20% weight)
  if (webVitals.cls > 0.25) score -= 20;
  else if (webVitals.cls > 0.1) score -= 10;
  
  // API response time scoring (10% weight)
  if (avgResponseTime > 2000) score -= 10;
  else if (avgResponseTime > 1000) score -= 5;
  
  return Math.max(0, Math.round(score));
}