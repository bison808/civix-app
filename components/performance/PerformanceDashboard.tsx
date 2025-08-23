'use client';
import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { optimizedApiClient } from '@/services/optimizedApiClient';
import { Activity, Zap, Clock, TrendingUp, Database } from 'lucide-react';

interface PerformanceStats {
  webVitals: any;
  cacheStats: any;
  recentMetrics: any;
  systemHealth: {
    bundleSize: number;
    memoryUsage: number;
    cacheHitRate: number;
    averageLoadTime: number;
  };
}

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development or for admin users
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    setIsVisible(isDev || isAdmin);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const updateStats = () => {
      const webVitals = performanceMonitor.getWebVitalsSummary();
      const cacheStats = optimizedApiClient.getCacheStats();
      const recentMetrics = performanceMonitor.getPerformanceSummary();
      
      // Calculate system health metrics
      const bundleSize = getBundleSize();
      const memoryUsage = getMemoryUsage();
      const cacheHitRate = cacheStats.hitRate || 0;
      const averageLoadTime = calculateAverageLoadTime(recentMetrics);
      
      setStats({
        webVitals,
        cacheStats,
        recentMetrics,
        systemHealth: {
          bundleSize,
          memoryUsage,
          cacheHitRate,
          averageLoadTime
        }
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  const getBundleSize = (): number => {
    // In a real implementation, this would come from build metrics
    // For now, estimate based on loaded resources
    if (typeof window === 'undefined') return 0;
    
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    return jsResources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
  };

  const getMemoryUsage = (): number => {
    if (typeof window === 'undefined') return 0;
    
    // Use performance.memory if available (Chrome)
    const memory = (performance as any).memory;
    return memory ? Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) : 0;
  };

  const calculateAverageLoadTime = (metrics: any): number => {
    const loadMetrics = Object.entries(metrics)
      .filter(([key]) => key.includes('load') || key.includes('fetch'))
      .map(([, value]: [string, any]) => value.avg)
      .filter(Boolean);
    
    return loadMetrics.length > 0 
      ? loadMetrics.reduce((sum, time) => sum + time, 0) / loadMetrics.length 
      : 0;
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isVisible || !stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity size={20} />
            Performance Monitor
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Core Web Vitals */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <Zap size={16} />
            Core Web Vitals
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(stats.webVitals.scores || {}).map(([metric, score]) => (
              <div key={metric} className={`p-2 rounded text-center ${getScoreColor(score as string)}`}>
                <div className="font-semibold uppercase">{metric}</div>
                <div>
                  {stats.webVitals[metric.toUpperCase()]?.avg?.toFixed(0) || 'N/A'}
                  {metric === 'cls' ? '' : 'ms'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <TrendingUp size={16} />
            System Health
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Bundle Size:</span>
              <span className="font-mono">
                {(stats.systemHealth.bundleSize / 1024).toFixed(0)}KB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="font-mono">{stats.systemHealth.memoryUsage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Hit Rate:</span>
              <span className="font-mono">
                {(stats.systemHealth.cacheHitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Load Time:</span>
              <span className="font-mono">
                {stats.systemHealth.averageLoadTime.toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <Database size={16} />
            Cache Performance
          </h4>
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span className="font-mono">{stats.cacheStats.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span>API Hit Rate:</span>
              <span className="font-mono">
                {(stats.cacheStats.hitRate * 100 || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Performance Issues */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-1">
            <Clock size={16} />
            Recent Issues
          </h4>
          <div className="text-xs space-y-1">
            {Object.entries(stats.recentMetrics)
              .filter(([key, data]: [string, any]) => data.avg > 1000) // Show slow operations
              .slice(0, 3)
              .map(([key, data]: [string, any]) => (
                <div key={key} className="flex justify-between text-yellow-700">
                  <span className="truncate">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono">{data.avg.toFixed(0)}ms</span>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <button
              onClick={() => {
                optimizedApiClient.clearCache();
                alert('Cache cleared');
              }}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Clear Cache
            </button>
            <button
              onClick={() => {
                const data = performanceMonitor.exportMetrics();
                console.log('Performance Data:', data);
                alert('Data exported to console');
              }}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};