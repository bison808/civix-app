/**
 * System Health Dashboard
 * Agent 54: System Stability & External Dependencies Integration Specialist
 * 
 * Real-time monitoring dashboard for external dependencies and system health
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Shield, 
  Wifi, 
  WifiOff,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { systemHealthService, SystemHealthReport, DependencyHealth } from '@/services/systemHealthService';

interface SystemHealthDashboardProps {
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function SystemHealthDashboard({ 
  compact = false, 
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: SystemHealthDashboardProps) {
  const [healthReport, setHealthReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);

  const fetchHealthReport = async () => {
    try {
      setLoading(true);
      const report = await systemHealthService.getSystemHealth();
      setHealthReport(report);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthReport();
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(fetchHealthReport, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <WifiOff className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'text-green-600';
      case 'HALF_OPEN': return 'text-yellow-600';
      case 'OPEN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && !healthReport) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} bg-white rounded-lg shadow border`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">Loading system health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} bg-red-50 rounded-lg border border-red-200`}>
        <div className="flex items-center text-red-800">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="font-medium">Health Monitor Error</span>
        </div>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchHealthReport}
          className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!healthReport) return null;

  if (compact) {
    return (
      <div className="p-4 bg-white rounded-lg shadow border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Shield className={`h-5 w-5 mr-2 ${getStatusColor(healthReport.overallStatus).split(' ')[0]}`} />
            <span className="font-medium text-sm">System Health</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(healthReport.overallStatus)}`}>
              {healthReport.overallStatus.toUpperCase()}
            </span>
            <span className="ml-2">{healthReport.stabilityScore}/10</span>
          </div>
        </div>
        
        {healthReport.criticalIssues.length > 0 && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {healthReport.criticalIssues.length} critical issue{healthReport.criticalIssues.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">System Health Monitor</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`p-2 rounded-lg ${autoRefreshEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              title={autoRefreshEnabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <Zap className="h-4 w-4" />
            </button>
            <button
              onClick={fetchHealthReport}
              disabled={loading}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
              title="Refresh now"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthReport.overallStatus)}`}>
              {getStatusIcon(healthReport.overallStatus)}
              <span className="ml-2">{healthReport.overallStatus.toUpperCase()}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">Overall Status</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {healthReport.stabilityScore}/10
            </div>
            <div className="text-xs text-gray-600">Stability Score</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(healthReport.uptime * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Uptime</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </div>
            <div className="text-xs text-gray-600">Last Check</div>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {healthReport.criticalIssues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-800 mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {healthReport.criticalIssues.length} Critical Issue{healthReport.criticalIssues.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {healthReport.criticalIssues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dependencies Status */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Wifi className="h-5 w-5 mr-2" />
          External Dependencies
        </h3>
        
        <div className="space-y-4">
          {healthReport.dependencies.map((dependency, index) => (
            <DependencyStatusCard key={index} dependency={dependency} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {healthReport.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Recommendations
          </h3>
          
          <ul className="space-y-2">
            {healthReport.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DependencyStatusCard({ dependency }: { dependency: DependencyHealth }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'text-green-600';
      case 'HALF_OPEN': return 'text-yellow-600';
      case 'OPEN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(dependency.status)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            dependency.status === 'healthy' ? 'bg-green-500' :
            dependency.status === 'degraded' ? 'bg-yellow-500' :
            dependency.status === 'critical' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
          <span className="font-medium">{dependency.name}</span>
          {dependency.isRequired && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
              Required
            </span>
          )}
        </div>
        <span className={`text-sm font-medium ${getStatusColor(dependency.status).split(' ')[0]}`}>
          {dependency.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {dependency.responseTime && (
          <div>
            <div className="text-gray-600">Response Time</div>
            <div className="font-medium">{dependency.responseTime}ms</div>
          </div>
        )}
        
        <div>
          <div className="text-gray-600">Error Rate</div>
          <div className="font-medium">{(dependency.errorRate * 100).toFixed(1)}%</div>
        </div>
        
        <div>
          <div className="text-gray-600">Circuit Breaker</div>
          <div className={`font-medium ${getCircuitBreakerColor(dependency.circuitBreakerState)}`}>
            {dependency.circuitBreakerState}
          </div>
        </div>
        
        <div>
          <div className="text-gray-600">Uptime</div>
          <div className="font-medium">{(dependency.uptime * 100).toFixed(1)}%</div>
        </div>
      </div>

      {dependency.lastError && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
          Last Error: {dependency.lastError}
        </div>
      )}
    </div>
  );
}