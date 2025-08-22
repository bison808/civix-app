type MetricType = 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';

interface PerformanceMetric {
  name: MetricType;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<MetricType, PerformanceMetric> = new Map();
  private reportEndpoint = '/api/metrics';
  private batchTimer: NodeJS.Timeout | null = null;
  private enableLogging = process.env.NODE_ENV === 'development';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      this.observePaintMetrics();
      this.observeLayoutShift();
      this.observeInputDelay();
      this.observeLargestContentfulPaint();
    }

    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      this.measureNavigationTiming();
    }

    // Resource timing
    this.observeResourceTiming();

    // Memory usage (Chrome only)
    this.monitorMemoryUsage();
  }

  private observePaintMetrics() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Paint metrics not supported');
    }
  }

  private observeLargestContentfulPaint() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP not supported');
    }
  }

  private observeLayoutShift() {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            clsEntries.push(entry);
          }
        }
        this.recordMetric('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS not supported');
    }
  }

  private observeInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID not supported');
    }
  }

  private measureNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
        }
      }, 0);
    });
  }

  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const resource = entry as PerformanceResourceTiming;
          if (resource.initiatorType === 'script' || resource.initiatorType === 'css') {
            this.trackResourceLoad(resource);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource timing not supported');
      }
    }
  }

  private trackResourceLoad(resource: PerformanceResourceTiming) {
    const loadTime = resource.responseEnd - resource.startTime;
    const size = resource.encodedBodySize;
    
    if (this.enableLogging && loadTime > 1000) {
      console.warn(`Slow resource load: ${resource.name} took ${loadTime.toFixed(2)}ms`);
    }
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMemoryMB = memory.usedJSHeapSize / 1048576;
        const totalMemoryMB = memory.totalJSHeapSize / 1048576;
        
        if (usedMemoryMB > 100) {
          console.warn(`High memory usage: ${usedMemoryMB.toFixed(2)}MB / ${totalMemoryMB.toFixed(2)}MB`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private recordMetric(name: MetricType, value: number) {
    const rating = this.getRating(name, value);
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };

    this.metrics.set(name, metric);
    
    if (this.enableLogging) {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms (${rating})`);
    }

    // Batch and send metrics
    this.scheduleBatchReport();
  }

  private getRating(name: MetricType, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<MetricType, [number, number]> = {
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      TTFB: [800, 1800],
      INP: [200, 500],
    };

    const [good, poor] = thresholds[name];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private scheduleBatchReport() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.reportMetrics();
    }, 5000); // Send after 5 seconds of inactivity
  }

  private async reportMetrics() {
    if (this.metrics.size === 0) return;

    const metricsData = Array.from(this.metrics.values());
    
    try {
      // In production, send to analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        await fetch(this.reportEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: metricsData,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          }),
        });
      }
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  public clearMetrics() {
    this.metrics.clear();
  }
}

// Export singleton instance
export const performanceMonitor = typeof window !== 'undefined' ? new PerformanceMonitor() : null;

// Helper function for custom timing
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
    });
  }
  
  const duration = performance.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}