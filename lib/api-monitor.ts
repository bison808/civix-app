interface APIMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  size?: number;
  cached: boolean;
  error?: string;
}

class APIMonitor {
  private metrics: APIMetric[] = [];
  private maxMetrics = 100;
  private slowThreshold = 1000; // 1 second
  private enabled = process.env.NODE_ENV === 'development';

  constructor() {
    // Load saved metrics from localStorage in development
    if (this.enabled && typeof window !== 'undefined') {
      const saved = localStorage.getItem('apiMetrics');
      if (saved) {
        try {
          this.metrics = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load API metrics:', e);
        }
      }
    }
  }

  recordMetric(metric: APIMetric) {
    if (!this.enabled) return;

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (metric.responseTime > this.slowThreshold) {
      console.warn(`[API Monitor] Slow request detected:`, {
        endpoint: metric.endpoint,
        time: `${metric.responseTime}ms`,
        status: metric.statusCode
      });
    }

    // Save to localStorage in development
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiMetrics', JSON.stringify(this.metrics));
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private async sendToAnalytics(metric: APIMetric) {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'api',
          ...metric
        })
      });
    } catch (error) {
      // Silently fail to not affect user experience
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.responseTime, 0);
    return Math.round(sum / relevantMetrics.length);
  }

  getSlowRequests(threshold = this.slowThreshold): APIMetric[] {
    return this.metrics.filter(m => m.responseTime > threshold);
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) return 0;
    
    const errors = this.metrics.filter(m => m.statusCode >= 400).length;
    return (errors / this.metrics.length) * 100;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    
    const cached = this.metrics.filter(m => m.cached).length;
    return (cached / this.metrics.length) * 100;
  }

  getSummary() {
    const endpoints = new Map<string, { count: number; totalTime: number; errors: number }>();
    
    this.metrics.forEach(m => {
      const key = `${m.method} ${m.endpoint}`;
      const current = endpoints.get(key) || { count: 0, totalTime: 0, errors: 0 };
      
      current.count++;
      current.totalTime += m.responseTime;
      if (m.statusCode >= 400) current.errors++;
      
      endpoints.set(key, current);
    });

    const summary = Array.from(endpoints.entries()).map(([endpoint, stats]) => ({
      endpoint,
      calls: stats.count,
      avgTime: Math.round(stats.totalTime / stats.count),
      errorRate: ((stats.errors / stats.count) * 100).toFixed(1),
    }));

    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.getAverageResponseTime(),
      slowRequests: this.getSlowRequests().length,
      errorRate: this.getErrorRate().toFixed(1),
      cacheHitRate: this.getCacheHitRate().toFixed(1),
      byEndpoint: summary.sort((a, b) => b.avgTime - a.avgTime)
    };
  }

  clear() {
    this.metrics = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apiMetrics');
    }
  }
}

// Create singleton instance
export const apiMonitor = new APIMonitor();

// Create monitored fetch wrapper
export function createMonitoredFetch(baseURL: string) {
  return async (path: string, options?: RequestInit): Promise<Response> => {
    const startTime = Date.now();
    const url = `${baseURL}${path}`;
    const method = options?.method || 'GET';
    
    try {
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      // Get response size if possible
      let size: number | undefined;
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        size = parseInt(contentLength, 10);
      }
      
      apiMonitor.recordMetric({
        endpoint: path,
        method: method.toUpperCase(),
        responseTime,
        statusCode: response.status,
        timestamp: Date.now(),
        size,
        cached: response.headers.get('x-cache') === 'HIT' || response.status === 304
      });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      apiMonitor.recordMetric({
        endpoint: path,
        method: method.toUpperCase(),
        responseTime,
        statusCode: 0,
        timestamp: Date.now(),
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };
}

// Hook for React components
export function useAPIMetrics() {
  return {
    metrics: apiMonitor.getMetrics(),
    summary: apiMonitor.getSummary(),
    clear: () => apiMonitor.clear()
  };
}