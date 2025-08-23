// Performance monitoring and analytics for political mapping system
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UserFlow {
  flowId: string;
  startTime: number;
  endTime?: number;
  steps: Array<{
    name: string;
    timestamp: number;
    duration?: number;
    metadata?: Record<string, any>;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeFlows: Map<string, UserFlow> = new Map();
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.setupWebVitalsMonitoring();
  }

  private initializeObserver() {
    if (typeof window === 'undefined') return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(`performance_${entry.entryType}`, entry.duration, {
            name: entry.name,
            type: entry.entryType
          });
        }
      });

      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private setupWebVitalsMonitoring() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
  }

  private observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime, {
        element: (lastEntry as any).element?.tagName,
        url: (lastEntry as any).url
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private observeFID() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('fid', (entry as any).processingStart - entry.startTime, {
          name: entry.name,
          target: (entry as any).target?.tagName
        });
      }
    }).observe({ type: 'first-input', buffered: true });
  }

  private observeCLS() {
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeLayoutShift += (entry as any).value;
        }
      }
      this.recordMetric('cls', cumulativeLayoutShift);
    }).observe({ type: 'layout-shift', buffered: true });
  }

  private observeFCP() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime);
        }
      }
    }).observe({ type: 'paint', buffered: true });
  }

  private observeTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.recordMetric('ttfb', navigation.responseStart - navigation.fetchStart);
    }
  }

  // Public API for recording custom metrics
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    });

    // Keep only recent metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  // Measure function execution time
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().then(
      (result) => {
        this.recordMetric(`async_${name}`, performance.now() - start);
        return result;
      },
      (error) => {
        this.recordMetric(`async_${name}_error`, performance.now() - start);
        throw error;
      }
    );
  }

  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      this.recordMetric(`sync_${name}`, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMetric(`sync_${name}_error`, performance.now() - start);
      throw error;
    }
  }

  // User flow tracking
  startFlow(flowId: string): void {
    this.activeFlows.set(flowId, {
      flowId,
      startTime: Date.now(),
      steps: []
    });
  }

  addFlowStep(flowId: string, stepName: string, metadata?: Record<string, any>): void {
    const flow = this.activeFlows.get(flowId);
    if (flow) {
      const now = Date.now();
      const lastStep = flow.steps[flow.steps.length - 1];
      
      flow.steps.push({
        name: stepName,
        timestamp: now,
        duration: lastStep ? now - lastStep.timestamp : now - flow.startTime,
        metadata
      });
    }
  }

  endFlow(flowId: string): UserFlow | null {
    const flow = this.activeFlows.get(flowId);
    if (flow) {
      flow.endTime = Date.now();
      this.activeFlows.delete(flowId);
      
      // Record overall flow duration
      this.recordMetric(`flow_${flowId}`, flow.endTime - flow.startTime, {
        steps: flow.steps.length,
        totalDuration: flow.endTime - flow.startTime
      });
      
      return flow;
    }
    return null;
  }

  // Analytics for political mapping system
  trackZipLookup(zipCode: string, duration: number, success: boolean) {
    this.recordMetric('zip_lookup', duration, {
      zipCode,
      success,
      timestamp: Date.now()
    });
  }

  trackRepresentativeLoad(repId: string, level: string, duration: number, cached: boolean) {
    this.recordMetric('representative_load', duration, {
      repId,
      level,
      cached,
      timestamp: Date.now()
    });
  }

  trackServiceLoad(serviceName: string, duration: number, success: boolean) {
    this.recordMetric('service_load', duration, {
      serviceName,
      success,
      timestamp: Date.now()
    });
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes

    const summary: Record<string, any> = {};
    
    for (const metric of recentMetrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
          recent: []
        };
      }
      
      const stats = summary[metric.name];
      stats.count++;
      stats.total += metric.value;
      stats.avg = stats.total / stats.count;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.recent.push({
        value: metric.value,
        timestamp: metric.timestamp,
        metadata: metric.metadata
      });
      
      // Keep only last 10 recent values
      if (stats.recent.length > 10) {
        stats.recent = stats.recent.slice(-10);
      }
    }

    return summary;
  }

  // Core Web Vitals summary
  getWebVitalsSummary() {
    const summary = this.getPerformanceSummary();
    
    return {
      LCP: summary.lcp || null,
      FID: summary.fid || null,
      CLS: summary.cls || null,
      FCP: summary.fcp || null,
      TTFB: summary.ttfb || null,
      scores: this.calculateWebVitalsScores(summary)
    };
  }

  private calculateWebVitalsScores(summary: Record<string, any>) {
    const scores: Record<string, 'good' | 'needs-improvement' | 'poor'> = {};
    
    if (summary.lcp) {
      const lcp = summary.lcp.avg;
      scores.lcp = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor';
    }
    
    if (summary.fid) {
      const fid = summary.fid.avg;
      scores.fid = fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor';
    }
    
    if (summary.cls) {
      const cls = summary.cls.avg;
      scores.cls = cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor';
    }
    
    return scores;
  }

  // Export data for external analytics
  exportMetrics() {
    return {
      metrics: this.metrics,
      activeFlows: Array.from(this.activeFlows.values()),
      summary: this.getPerformanceSummary(),
      webVitals: this.getWebVitalsSummary(),
      timestamp: Date.now()
    };
  }

  // Clear old data
  cleanup() {
    const cutoff = Date.now() - 600000; // 10 minutes ago
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    // Clear stale flows
    for (const [flowId, flow] of this.activeFlows.entries()) {
      if (flow.startTime < cutoff) {
        this.activeFlows.delete(flowId);
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for common use cases
export const trackPoliticalMappingFlow = {
  zipLookup: (zipCode: string) => {
    performanceMonitor.startFlow(`zip_lookup_${zipCode}`);
    performanceMonitor.addFlowStep(`zip_lookup_${zipCode}`, 'input_zip', { zipCode });
  },
  
  districtFound: (zipCode: string, district: string) => {
    performanceMonitor.addFlowStep(`zip_lookup_${zipCode}`, 'district_found', { district });
  },
  
  representativesLoaded: (zipCode: string, count: number) => {
    performanceMonitor.addFlowStep(`zip_lookup_${zipCode}`, 'representatives_loaded', { count });
    performanceMonitor.endFlow(`zip_lookup_${zipCode}`);
  }
};

// Automatic cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.cleanup();
  }, 300000); // Every 5 minutes
}