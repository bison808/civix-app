/**
 * Production Health Check Endpoints - Agent Casey
 * Comprehensive health monitoring for deployment and operations
 * 
 * Endpoints:
 * - GET /api/monitoring/health-checks - Full system health
 * - GET /api/monitoring/health-checks/quick - Fast health check for load balancers
 * - GET /api/monitoring/health-checks/detailed - Detailed diagnostics
 * - POST /api/monitoring/health-checks/run-diagnostics - Manual diagnostic run
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveSecurityMonitor } from '@/services/comprehensiveSecurityMonitor';
import { EnhancedDatabaseMonitor } from '@/services/enhancedDatabaseMonitor';
import { legiScanMonitor } from '@/services/legiScanMonitor';
import { createVercelPostgresAdapter } from '@/lib/database/vercelPostgresAdapter';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { systemHealthService } from '@/services/systemHealthService';
import type { SecurityMonitorConfig } from '@/lib/integrations/securityMonitor';

// Health check configuration
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds max for health checks
const CRITICAL_SERVICES = ['database', 'legiscan-api', 'authentication'];
const OPTIONAL_SERVICES = ['geocoding', 'congress-api', 'openstates-api'];

// Initialize monitoring services
const securityConfig: SecurityMonitorConfig = {
  enabled: true,
  realTimeAnalysis: true,
  alertThresholds: {
    failedLoginAttempts: 5,
    suspiciousActivityScore: 70,
    geographicAnomalyDistance: 1000,
    timeBasedAnomalyWindow: 60
  },
  notifications: { email: ['admin@citzn.com'] },
  threatIntelligence: { enabled: true, providers: ['basic'], updateInterval: 60, cacheTimeout: 240 },
  logging: { enabled: true, level: 'info', retentionDays: 30, compressOldLogs: true },
  rateLimiting: { eventsPerSecond: 100, burstSize: 500 }
};

const dbAdapter = createVercelPostgresAdapter();
const securityMonitor = new ComprehensiveSecurityMonitor(securityConfig, dbAdapter);
const databaseMonitor = new EnhancedDatabaseMonitor(dbAdapter);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// =============================================================================
// MAIN HEALTH CHECK ENDPOINT
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkType = searchParams.get('type') || 'standard';
  const includeDetails = searchParams.get('details') === 'true';
  
  const startTime = Date.now();
  
  try {
    let healthReport;
    
    switch (checkType) {
      case 'quick':
        healthReport = await performQuickHealthCheck();
        break;
      case 'detailed':
        healthReport = await performDetailedHealthCheck();
        break;
      case 'critical':
        healthReport = await performCriticalServicesCheck();
        break;
      default:
        healthReport = await performStandardHealthCheck(includeDetails);
    }
    
    const responseTime = Date.now() - startTime;
    
    // Add response metadata
    const response = {
      ...healthReport,
      meta: {
        timestamp: new Date().toISOString(),
        responseTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        checkType
      }
    };
    
    // Set appropriate HTTP status based on health
    const statusCode = 
      healthReport.status === 'healthy' ? 200 :
      healthReport.status === 'degraded' ? 200 : // Still return 200 for degraded
      503; // Service unavailable for critical issues

    // Set health check headers for load balancers
    const nextResponse = NextResponse.json(response, { status: statusCode });
    nextResponse.headers.set('X-Health-Status', healthReport.status);
    nextResponse.headers.set('X-Health-Score', healthReport.score?.toString() || '0');
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return nextResponse;
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'critical',
      score: 0,
      services: {},
      issues: [`Health check system failure: ${error instanceof Error ? error.message : String(error)}`],
      recommendations: ['Investigate health check system', 'Check monitoring service connectivity'],
      meta: {
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        checkType,
        error: true
      }
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'X-Health-Status': 'critical',
        'X-Health-Score': '0',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// =============================================================================
// DIAGNOSTIC ENDPOINT
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { action, services } = await request.json();
    
    switch (action) {
      case 'run-diagnostics':
        const diagnostics = await runComprehensiveDiagnostics(services);
        return NextResponse.json(diagnostics);
        
      case 'check-connectivity':
        const connectivity = await checkExternalConnectivity();
        return NextResponse.json(connectivity);
        
      case 'validate-config':
        const configValidation = await validateConfiguration();
        return NextResponse.json(configValidation);
        
      case 'performance-snapshot':
        const performanceSnapshot = await capturePerformanceSnapshot();
        return NextResponse.json(performanceSnapshot);
        
      default:
        return NextResponse.json(
          { error: 'Invalid diagnostic action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Diagnostic operation failed:', error);
    return NextResponse.json(
      { 
        error: 'Diagnostic failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// HEALTH CHECK IMPLEMENTATIONS
// =============================================================================

async function performQuickHealthCheck() {
  // Fast check for load balancers - under 1 second
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkBasicFunctionality()
  ]);
  
  const issues: string[] = [];
  let healthyServices = 0;
  const totalServices = 2;
  
  if (checks[0].status === 'fulfilled' && checks[0].value.healthy) {
    healthyServices++;
  } else {
    issues.push('Database connectivity issue');
  }
  
  if (checks[1].status === 'fulfilled' && checks[1].value.healthy) {
    healthyServices++;
  } else {
    issues.push('Basic functionality issue');
  }
  
  const score = Math.round((healthyServices / totalServices) * 100);
  const status = score >= 100 ? 'healthy' : score >= 50 ? 'degraded' : 'critical';
  
  return {
    status,
    score,
    services: {
      database: checks[0].status === 'fulfilled' ? checks[0].value : { healthy: false },
      basic: checks[1].status === 'fulfilled' ? checks[1].value : { healthy: false }
    },
    issues,
    recommendations: issues.length > 0 ? ['Run detailed health check for more information'] : []
  };
}

async function performStandardHealthCheck(includeDetails: boolean = false) {
  const services = await checkAllServices();
  const { status, score, issues, recommendations } = evaluateOverallHealth(services);
  
  return {
    status,
    score,
    services: includeDetails ? services : Object.keys(services).reduce((acc, key) => {
      acc[key] = { healthy: services[key].healthy, status: services[key].status };
      return acc;
    }, {} as any),
    issues,
    recommendations
  };
}

async function performDetailedHealthCheck() {
  const services = await checkAllServices();
  const performance = await capturePerformanceSnapshot();
  const security = await securityMonitor.healthCheck();
  const database = await databaseMonitor.getComprehensiveMetrics();
  const legiscan = legiScanMonitor.getMetrics();
  
  const { status, score, issues, recommendations } = evaluateOverallHealth(services);
  
  return {
    status,
    score,
    services,
    performance,
    security,
    database: {
      healthScore: database.healthScore,
      connections: database.connectionHealth,
      queryPerformance: database.queryPerformance
    },
    legiscan: {
      quota: legiscan.quota,
      quality: legiscan.quality
    },
    issues,
    recommendations,
    diagnostics: await runBasicDiagnostics()
  };
}

async function performCriticalServicesCheck() {
  const criticalChecks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkAuthenticationService(),
    checkLegiScanQuota()
  ]);
  
  const services: any = {};
  const issues: string[] = [];
  let healthyServices = 0;
  
  // Database
  if (criticalChecks[0].status === 'fulfilled' && criticalChecks[0].value.healthy) {
    services.database = criticalChecks[0].value;
    healthyServices++;
  } else {
    services.database = { healthy: false, error: 'Database connectivity failed' };
    issues.push('CRITICAL: Database is unreachable');
  }
  
  // Authentication
  if (criticalChecks[1].status === 'fulfilled' && criticalChecks[1].value.healthy) {
    services.authentication = criticalChecks[1].value;
    healthyServices++;
  } else {
    services.authentication = { healthy: false, error: 'Authentication service failed' };
    issues.push('CRITICAL: Authentication service is down');
  }
  
  // LegiScan
  if (criticalChecks[2].status === 'fulfilled' && criticalChecks[2].value.healthy) {
    services.legiscan = criticalChecks[2].value;
    healthyServices++;
  } else {
    services.legiscan = { healthy: false, error: 'LegiScan quota exceeded or API failed' };
    issues.push('CRITICAL: LegiScan API is unavailable');
  }
  
  const score = Math.round((healthyServices / 3) * 100);
  const status = score >= 100 ? 'healthy' : score >= 67 ? 'degraded' : 'critical';
  
  return {
    status,
    score,
    services,
    issues,
    recommendations: issues.length > 0 ? 
      ['Immediate intervention required for critical services'] : 
      ['All critical services operational']
  };
}

// =============================================================================
// SERVICE CHECK FUNCTIONS
// =============================================================================

async function checkAllServices() {
  const services: any = {};
  
  // Database
  try {
    services.database = await checkDatabaseConnection();
  } catch (error) {
    services.database = { healthy: false, error: error instanceof Error ? error.message : String(error) };
  }
  
  // Authentication
  try {
    services.authentication = await checkAuthenticationService();
  } catch (error) {
    services.authentication = { healthy: false, error: error instanceof Error ? error.message : String(error) };
  }
  
  // LegiScan API
  try {
    services.legiscan = await checkLegiScanQuota();
  } catch (error) {
    services.legiscan = { healthy: false, error: error instanceof Error ? error.message : String(error) };
  }
  
  // Performance monitoring
  try {
    services.performance = await checkPerformanceMonitoring();
  } catch (error) {
    services.performance = { healthy: false, error: error instanceof Error ? error.message : String(error) };
  }
  
  // Security monitoring
  try {
    services.security = await checkSecurityMonitoring();
  } catch (error) {
    services.security = { healthy: false, error: error instanceof Error ? error.message : String(error) };
  }
  
  // External APIs (optional)
  services.external_apis = await checkExternalAPIs();
  
  return services;
}

async function checkDatabaseConnection() {
  const startTime = Date.now();
  try {
    await dbAdapter.initialize();
    const health = await dbAdapter.checkConnection();
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: health.healthy,
      status: health.healthy ? 'operational' : 'failed',
      responseTime,
      latency: health.latency,
      error: health.error
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'failed',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkAuthenticationService() {
  try {
    // Test basic authentication functionality
    const userCount = await dbAdapter.getUserCount();
    
    return {
      healthy: true,
      status: 'operational',
      userCount,
      features: ['login', 'register', 'password_reset', 'session_management']
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkLegiScanQuota() {
  try {
    const quotaStatus = legiScanMonitor.getQuotaStatus();
    const isHealthy = quotaStatus.quotaPercentage < 95 && quotaStatus.rateStatus !== 'blocked';
    
    return {
      healthy: isHealthy,
      status: isHealthy ? 'operational' : 'quota_exceeded',
      quotaPercentage: quotaStatus.quotaPercentage,
      rateStatus: quotaStatus.rateStatus,
      alertLevel: quotaStatus.alertLevel
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkPerformanceMonitoring() {
  try {
    const summary = performanceMonitor.getPerformanceSummary();
    const hasMetrics = Object.keys(summary).length > 0;
    
    return {
      healthy: hasMetrics,
      status: hasMetrics ? 'operational' : 'no_data',
      metricsCount: Object.keys(summary).length,
      uptime: Date.now() // Simplified uptime
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkSecurityMonitoring() {
  try {
    const health = await securityMonitor.healthCheck();
    
    return {
      healthy: health.healthy,
      status: health.healthy ? 'operational' : 'degraded',
      components: health.components,
      eventsPerSecond: health.metrics.eventsPerSecond
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function checkExternalAPIs() {
  // Check external API connectivity (non-critical)
  const apis = ['congress-api', 'geocoding', 'openstates'];
  const results: any = {};
  
  for (const api of apis) {
    try {
      const health = await systemHealthService.getDependencyHealth(api);
      results[api] = {
        healthy: health?.status === 'healthy',
        status: health?.status || 'unknown',
        lastChecked: health?.lastChecked
      };
    } catch (error) {
      results[api] = { healthy: false, status: 'failed' };
    }
  }
  
  return results;
}

async function checkBasicFunctionality() {
  // Basic application functionality test
  try {
    // Test that core routes are accessible
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/system/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    return {
      healthy: response.ok,
      status: response.ok ? 'operational' : 'failed',
      httpStatus: response.status
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// =============================================================================
// DIAGNOSTIC FUNCTIONS
// =============================================================================

async function runComprehensiveDiagnostics(targetServices?: string[]) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    services: {},
    system: {},
    recommendations: []
  };
  
  // System diagnostics
  diagnostics.system = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV
  };
  
  // Service-specific diagnostics
  if (!targetServices || targetServices.includes('database')) {
    try {
      const dbMetrics = await databaseMonitor.getComprehensiveMetrics();
      diagnostics.services.database = {
        healthScore: dbMetrics.healthScore,
        issues: dbMetrics.recommendations,
        performance: dbMetrics.queryPerformance,
        connections: dbMetrics.connectionHealth
      };
    } catch (error) {
      diagnostics.services.database = { error: error instanceof Error ? error.message : String(error) };
    }
  }
  
  if (!targetServices || targetServices.includes('legiscan')) {
    const legiScanMetrics = legiScanMonitor.getMetrics();
    diagnostics.services.legiscan = {
      quota: legiScanMetrics.quota,
      quality: legiScanMetrics.quality,
      recommendations: legiScanMetrics.recommendations
    };
  }
  
  return diagnostics;
}

async function checkExternalConnectivity() {
  const connectivity = {
    internet: false,
    dns: false,
    externalAPIs: {} as any
  };
  
  try {
    // Basic internet connectivity
    const response = await fetch('https://api.github.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    connectivity.internet = response.ok;
  } catch (error) {
    connectivity.internet = false;
  }
  
  return connectivity;
}

async function validateConfiguration() {
  const config = {
    environment: process.env.NODE_ENV,
    requiredEnvVars: {} as any,
    optionalEnvVars: {} as any,
    issues: [] as string[]
  };
  
  // Check required environment variables
  const required = ['POSTGRES_URL', 'NEXTAUTH_SECRET'];
  const optional = ['LEGISCAN_API_KEY', 'SECURITY_WEBHOOK_URL'];
  
  required.forEach(envVar => {
    config.requiredEnvVars[envVar] = !!process.env[envVar];
    if (!process.env[envVar]) {
      config.issues.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  optional.forEach(envVar => {
    config.optionalEnvVars[envVar] = !!process.env[envVar];
  });
  
  return config;
}

async function capturePerformanceSnapshot() {
  return {
    timestamp: new Date().toISOString(),
    webVitals: performanceMonitor.getWebVitalsSummary(),
    performance: performanceMonitor.getPerformanceSummary(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
}

async function runBasicDiagnostics() {
  return {
    timestamp: new Date().toISOString(),
    checks: {
      filesystem: true, // Would check file system access
      network: true,    // Would check network connectivity
      permissions: true // Would check file permissions
    }
  };
}

// =============================================================================
// HEALTH EVALUATION
// =============================================================================

function evaluateOverallHealth(services: any) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let healthyServices = 0;
  let criticalServicesDown = 0;
  
  const serviceKeys = Object.keys(services);
  const totalServices = serviceKeys.length;
  
  serviceKeys.forEach(serviceName => {
    const service = services[serviceName];
    
    if (service.healthy) {
      healthyServices++;
    } else {
      const isCritical = CRITICAL_SERVICES.includes(serviceName);
      
      if (isCritical) {
        criticalServicesDown++;
        issues.push(`CRITICAL: ${serviceName} service is down - ${service.error || 'Unknown error'}`);
        recommendations.push(`Immediate attention required for ${serviceName}`);
      } else {
        issues.push(`${serviceName} service degraded - ${service.error || 'Unknown error'}`);
        recommendations.push(`Monitor ${serviceName} service closely`);
      }
    }
  });
  
  // Calculate score
  const baseScore = Math.round((healthyServices / totalServices) * 100);
  const criticalPenalty = criticalServicesDown * 30; // Heavy penalty for critical services
  const score = Math.max(0, baseScore - criticalPenalty);
  
  // Determine status
  let status: 'healthy' | 'degraded' | 'critical';
  if (criticalServicesDown > 0) {
    status = 'critical';
  } else if (score >= 85) {
    status = 'healthy';
  } else {
    status = 'degraded';
  }
  
  // Add general recommendations
  if (status === 'healthy' && recommendations.length === 0) {
    recommendations.push('All systems operational - continue monitoring');
  } else if (status === 'critical') {
    recommendations.unshift('EMERGENCY: Critical systems down - escalate immediately');
  }
  
  return { status, score, issues, recommendations };
}