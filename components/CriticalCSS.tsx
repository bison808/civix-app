'use client';

import { useEffect } from 'react';

// Critical CSS for above-the-fold content
const CRITICAL_CSS = `
  /* Reset and base styles */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    color: #374151;
    background-color: #ffffff;
  }
  
  /* Header styles */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    background: white;
    min-height: 64px;
  }
  
  /* Logo styles */
  .logo-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  /* Navigation styles */
  nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  /* Button styles */
  button {
    padding: 8px;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #f3f4f6;
  }
  
  /* Feed container */
  .feed-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  
  /* Card styles */
  .card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }
  
  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Utility classes */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .gap-4 { gap: 16px; }
  .p-2 { padding: 8px; }
  .p-4 { padding: 16px; }
  .mb-4 { margin-bottom: 16px; }
  .text-sm { font-size: 14px; }
  .text-xs { font-size: 12px; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-700 { color: #374151; }
  .bg-white { background-color: white; }
  .bg-gray-100 { background-color: #f3f4f6; }
  .rounded-lg { border-radius: 8px; }
  .rounded-full { border-radius: 9999px; }
  .shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
  .border { border: 1px solid #e5e7eb; }
  .border-b { border-bottom: 1px solid #e5e7eb; }
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .min-h-screen { min-height: 100vh; }
  .transition-colors { transition: background-color 0.2s, color 0.2s; }
`;

export function CriticalCSS() {
  useEffect(() => {
    // Inject critical CSS immediately
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('critical-css');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'critical-css';
        style.textContent = CRITICAL_CSS;
        document.head.insertBefore(style, document.head.firstChild);
      }
    }
  }, []);

  return null;
}

// Preload critical resources
export function ResourcePreloader() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.crossOrigin = 'anonymous';
      fontLink.href = '/fonts/inter-var.woff2';
      document.head.appendChild(fontLink);

      // Preconnect to external domains
      const domains = ['https://api.congress.gov', 'https://openstates.org'];
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
      });

      // Prefetch critical API calls
      setTimeout(() => {
        fetch('/api/bills', { 
          method: 'HEAD',
          priority: 'low'
        }).catch(() => {});
      }, 100);
    }
  }, []);

  return null;
}

// Performance monitoring component
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Measure and report key metrics
      const measureMetrics = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            connect: navigation.connectEnd - navigation.connectStart,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
            domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            load: navigation.loadEventEnd - navigation.loadEventStart,
            total: navigation.loadEventEnd - navigation.fetchStart
          };

          console.log('[Performance] Navigation Timing:', metrics);
          
          // Send to analytics in production
          if (process.env.NODE_ENV === 'production') {
            fetch('/api/metrics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'navigation',
                metrics,
                url: window.location.href,
                timestamp: Date.now()
              })
            }).catch(() => {});
          }
        }
      };

      // Measure after page load
      if (document.readyState === 'complete') {
        setTimeout(measureMetrics, 100);
      } else {
        window.addEventListener('load', () => {
          setTimeout(measureMetrics, 100);
        });
      }
    }
  }, []);

  return null;
}