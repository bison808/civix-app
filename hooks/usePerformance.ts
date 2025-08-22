import { useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance';

export function usePerformance() {
  useEffect(() => {
    // Initialize performance monitoring on mount
    if (performanceMonitor && process.env.NODE_ENV === 'production') {
      // Report Web Vitals
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS((metric) => console.log('CLS:', metric.value));
        onFCP((metric) => console.log('FCP:', metric.value));
        onLCP((metric) => console.log('LCP:', metric.value));
        onTTFB((metric) => console.log('TTFB:', metric.value));
        onINP((metric) => console.log('INP:', metric.value));
      });
    }

    // Cleanup
    return () => {
      if (performanceMonitor) {
        performanceMonitor.clearMetrics();
      }
    };
  }, []);
}