/**
 * System Observability Dashboard - Agent Casey Implementation
 * Real-time monitoring and observability for CITZN platform
 * 
 * Integrates with:
 * - ComprehensiveSecurityMonitor
 * - SystemHealthService 
 * - DataMonitoringService
 * - Performance monitoring infrastructure
 * - LegiScan API usage tracking
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Types for monitoring data
interface SystemHealthMetrics {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  totalRequests: number;
}

interface SecurityMetrics {
  activeAlerts: number;
  blockedAttempts: number;
  suspiciousIPs: number;
  alertsToday: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface LegiScanMetrics {
  monthlyUsage: number;
  monthlyLimit: number;
  quotaPercentage: number;
  dailyUsage: number;
  daysUntilReset: number;
  projectedMonthlyUsage: number;
}

interface DatabaseMetrics {
  connectionHealth: boolean;
  queryLatency: number;
  activeConnections: number;
  slowQueries: number;
  databaseSize: string;
}

interface PerformanceMetrics {
  averageLoadTime: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  apiResponseTimes: {
    congress: number;
    legiScan: number;
    geocoding: number;
  };
}

export const SystemObservabilityDashboard: React.FC = () => {
  // State for all monitoring metrics
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [legiScanMetrics, setLegiScanMetrics] = useState<LegiScanMetrics | null>(null);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all monitoring data
  const fetchMonitoringData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Parallel fetch of all monitoring endpoints
      const [
        systemHealthResponse,
        securityResponse,
        legiScanResponse,
        databaseResponse,
        performanceResponse
      ] = await Promise.allSettled([
        fetch('/api/system/health').then(res => res.json()),
        fetch('/api/monitoring/security').then(res => res.json()),
        fetch('/api/monitoring/legiscan-usage').then(res => res.json()),
        fetch('/api/monitoring/database').then(res => res.json()),
        fetch('/api/monitoring/performance').then(res => res.json())
      ]);

      // Update state with successful responses
      if (systemHealthResponse.status === 'fulfilled') {
        setSystemHealth(systemHealthResponse.value);
      }
      if (securityResponse.status === 'fulfilled') {
        setSecurityMetrics(securityResponse.value);
      }
      if (legiScanResponse.status === 'fulfilled') {
        setLegiScanMetrics(legiScanResponse.value);
      }
      if (databaseResponse.status === 'fulfilled') {
        setDatabaseMetrics(databaseResponse.value);
      }
      if (performanceResponse.status === 'fulfilled') {
        setPerformanceMetrics(performanceResponse.value);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchMonitoringData, autoRefresh]);

  // Status color helpers
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getThreatLevelColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQuotaColor = (percentage: number): string => {
    if (percentage >= 95) return 'text-red-600 bg-red-100';
    if (percentage >= 85) return 'text-orange-600 bg-orange-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatUptime = (uptimeMs: number): string => {
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Observability Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring for CITZN platform
            {lastUpdated && (
              <span className="ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMonitoringData}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">System Status</p>
              <div className="flex items-center mt-2">
                <Badge className={getStatusColor(systemHealth?.status || 'unknown')}>
                  {systemHealth?.status || 'Unknown'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.uptime ? formatUptime(systemHealth.uptime) : '--'}
              </p>
              <p className="text-xs text-gray-500">Uptime</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Security Threat Level</p>
              <div className="flex items-center mt-2">
                <Badge className={getThreatLevelColor(securityMetrics?.threatLevel || 'low')}>
                  {securityMetrics?.threatLevel || 'Low'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {securityMetrics?.activeAlerts || 0}
              </p>
              <p className="text-xs text-gray-500">Active Alerts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">LegiScan Quota</p>
              <div className="flex items-center mt-2">
                <Badge className={getQuotaColor(legiScanMetrics?.quotaPercentage || 0)}>
                  {legiScanMetrics?.quotaPercentage?.toFixed(1) || 0}%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {legiScanMetrics?.monthlyUsage?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500">
                / {legiScanMetrics?.monthlyLimit?.toLocaleString() || 30000}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Database Health</p>
              <div className="flex items-center mt-2">
                <Badge className={databaseMetrics?.connectionHealth ? 
                  'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}>
                  {databaseMetrics?.connectionHealth ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {databaseMetrics?.queryLatency || 0}ms
              </p>
              <p className="text-xs text-gray-500">Avg Query Time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Response Time</span>
              <span className="font-medium">
                {systemHealth?.responseTime || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="font-medium">
                {systemHealth?.errorRate?.toFixed(2) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-medium">
                {systemHealth?.activeUsers?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="font-medium">
                {systemHealth?.totalRequests?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Security Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Security Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Blocked Attempts Today</span>
              <span className="font-medium">
                {securityMetrics?.blockedAttempts || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Suspicious IPs</span>
              <span className="font-medium">
                {securityMetrics?.suspiciousIPs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Security Alerts Today</span>
              <span className="font-medium">
                {securityMetrics?.alertsToday || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Alerts</span>
              <span className="font-medium text-orange-600">
                {securityMetrics?.activeAlerts || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* API Usage and Database Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LegiScan API Usage */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">LegiScan API Usage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Usage</span>
                <span>{legiScanMetrics?.quotaPercentage?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (legiScanMetrics?.quotaPercentage || 0) >= 90 ? 'bg-red-500' :
                    (legiScanMetrics?.quotaPercentage || 0) >= 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, legiScanMetrics?.quotaPercentage || 0)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Usage</span>
                <span>{legiScanMetrics?.dailyUsage || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projected Monthly</span>
                <span>{legiScanMetrics?.projectedMonthlyUsage?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Until Reset</span>
                <span>{legiScanMetrics?.daysUntilReset || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Database Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Database Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Connection Health</span>
              <Badge className={databaseMetrics?.connectionHealth ? 
                'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}>
                {databaseMetrics?.connectionHealth ? 'Healthy' : 'Unhealthy'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="font-medium">
                {databaseMetrics?.activeConnections || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Slow Queries</span>
              <span className="font-medium">
                {databaseMetrics?.slowQueries || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Size</span>
              <span className="font-medium">
                {databaseMetrics?.databaseSize || '0 MB'}
              </span>
            </div>
          </div>
        </Card>

        {/* Core Web Vitals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">LCP (Loading)</span>
              <span className={`font-medium ${
                (performanceMetrics?.coreWebVitals.lcp || 0) > 2500 ? 'text-red-600' :
                (performanceMetrics?.coreWebVitals.lcp || 0) > 4000 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {performanceMetrics?.coreWebVitals.lcp?.toFixed(0) || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">FID (Interactivity)</span>
              <span className={`font-medium ${
                (performanceMetrics?.coreWebVitals.fid || 0) > 300 ? 'text-red-600' :
                (performanceMetrics?.coreWebVitals.fid || 0) > 100 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {performanceMetrics?.coreWebVitals.fid?.toFixed(0) || 0}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CLS (Layout Shift)</span>
              <span className={`font-medium ${
                (performanceMetrics?.coreWebVitals.cls || 0) > 0.25 ? 'text-red-600' :
                (performanceMetrics?.coreWebVitals.cls || 0) > 0.1 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {performanceMetrics?.coreWebVitals.cls?.toFixed(3) || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Load Time</span>
              <span className="font-medium">
                {performanceMetrics?.averageLoadTime?.toFixed(0) || 0}ms
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* API Response Times */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Response Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {performanceMetrics?.apiResponseTimes.congress || 0}ms
            </div>
            <div className="text-sm text-gray-600 mt-1">Congress API</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {performanceMetrics?.apiResponseTimes.legiScan || 0}ms
            </div>
            <div className="text-sm text-gray-600 mt-1">LegiScan API</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {performanceMetrics?.apiResponseTimes.geocoding || 0}ms
            </div>
            <div className="text-sm text-gray-600 mt-1">Geocoding API</div>
          </div>
        </div>
      </Card>

      {/* Status Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          🛡️ Security monitoring active • 📊 Performance tracking enabled • 
          🔄 Real-time updates {autoRefresh ? 'ON' : 'OFF'}
        </p>
      </div>
    </div>
  );
}

export default SystemObservabilityDashboard;