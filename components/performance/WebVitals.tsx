'use client';

import { useEffect, useState } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsData {
  cls?: VitalMetric;
  fcp?: VitalMetric;
  lcp?: VitalMetric;
  ttfb?: VitalMetric;
  inp?: VitalMetric;
}

// Thresholds based on Google's Web Vitals standards
const THRESHOLDS = {
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 }
};

export function WebVitalsMonitor() {
  const [metrics, setMetrics] = useState<WebVitalsData>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or if explicitly enabled
    const showMetrics = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('showWebVitals') === 'true';
    
    if (!showMetrics) return;

    const handleMetric = (metric: any) => {
      const rating = getRating(metric.name.toLowerCase(), metric.value);
      
      setMetrics(prev => ({
        ...prev,
        [metric.name.toLowerCase()]: {
          name: metric.name,
          value: metric.value,
          rating,
          timestamp: Date.now()
        }
      }));

      // Log to console for debugging
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating,
        delta: metric.delta
      });

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(metric);
      }
    };

    // Register Web Vitals observers
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);

    // Show metrics panel after delay
    setTimeout(() => setIsVisible(true), 1000);
  }, []);

  const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'poor';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const sendToAnalytics = async (metric: any) => {
    try {
      // Send to your analytics endpoint
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
          url: window.location.href,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  };

  const formatValue = (name: string, value: number): string => {
    if (name === 'cls') return value.toFixed(3);
    if (value < 1000) return `${Math.round(value)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (rating?: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (rating?: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (rating) {
      case 'good': return 'bg-green-100';
      case 'needs-improvement': return 'bg-yellow-100';
      case 'poor': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  if (!isVisible || process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Web Vitals</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {/* CLS - Cumulative Layout Shift */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">CLS</span>
          <span className={`text-xs font-mono ${getStatusColor(metrics.cls?.rating)} ${getStatusBg(metrics.cls?.rating)} px-2 py-1 rounded`}>
            {metrics.cls ? formatValue('cls', metrics.cls.value) : '-'}
          </span>
        </div>

        {/* FCP - First Contentful Paint */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">FCP</span>
          <span className={`text-xs font-mono ${getStatusColor(metrics.fcp?.rating)} ${getStatusBg(metrics.fcp?.rating)} px-2 py-1 rounded`}>
            {metrics.fcp ? formatValue('fcp', metrics.fcp.value) : '-'}
          </span>
        </div>

        {/* LCP - Largest Contentful Paint */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">LCP</span>
          <span className={`text-xs font-mono ${getStatusColor(metrics.lcp?.rating)} ${getStatusBg(metrics.lcp?.rating)} px-2 py-1 rounded`}>
            {metrics.lcp ? formatValue('lcp', metrics.lcp.value) : '-'}
          </span>
        </div>

        {/* TTFB - Time to First Byte */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">TTFB</span>
          <span className={`text-xs font-mono ${getStatusColor(metrics.ttfb?.rating)} ${getStatusBg(metrics.ttfb?.rating)} px-2 py-1 rounded`}>
            {metrics.ttfb ? formatValue('ttfb', metrics.ttfb.value) : '-'}
          </span>
        </div>

        {/* INP - Interaction to Next Paint */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">INP</span>
          <span className={`text-xs font-mono ${getStatusColor(metrics.inp?.rating)} ${getStatusBg(metrics.inp?.rating)} px-2 py-1 rounded`}>
            {metrics.inp ? formatValue('inp', metrics.inp.value) : '-'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Target: &lt;3s load</span>
          <span className={`font-semibold ${metrics.lcp && metrics.lcp.value < 3000 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.lcp && metrics.lcp.value < 3000 ? '✓ Met' : '✗ Missed'}
          </span>
        </div>
      </div>
    </div>
  );
}