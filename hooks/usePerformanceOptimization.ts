// Performance optimization hook for political mapping system
import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, trackPoliticalMappingFlow } from '@/utils/performanceMonitor';
import { initializeServicePreloading, preloadForZipLookup } from '@/utils/serviceLoader';
import { batchCacheOperations } from '@/utils/cacheOptimizer';

interface UsePerformanceOptimizationOptions {
  enablePreloading?: boolean;
  enableCaching?: boolean;
  enableMonitoring?: boolean;
  preloadZips?: string[];
}

export const usePerformanceOptimization = (options: UsePerformanceOptimizationOptions = {}) => {
  const {
    enablePreloading = true,
    enableCaching = true,
    enableMonitoring = true,
    preloadZips = []
  } = options;

  const initialized = useRef(false);

  // Initialize performance optimizations
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (enablePreloading) {
      // Initialize service preloading
      initializeServicePreloading();
      
      // Preload common ZIP codes
      if (preloadZips.length > 0) {
        batchCacheOperations.warmUpCache(preloadZips);
      }
      
      // Preload based on user's ZIP code
      const userZip = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') : null;
      if (userZip) {
        batchCacheOperations.warmUpCache([userZip]);
      }
    }

    if (enableCaching) {
      // Set up periodic cache cleanup
      const cleanup = setInterval(() => {
        batchCacheOperations.clearExpiredEntries();
      }, 300000); // Every 5 minutes

      return () => clearInterval(cleanup);
    }
  }, [enablePreloading, enableCaching, preloadZips]);

  // Optimized ZIP lookup with tracking
  const optimizedZipLookup = useCallback(async (zipCode: string) => {
    if (!enableMonitoring) {
      // Simple lookup without tracking
      const { getZipMappingServices } = await import('@/services/lazy');
      const services = await getZipMappingServices();
      return services.zipDistrictMappingService.getDistrictByZip(zipCode);
    }

    // Track the full user flow
    trackPoliticalMappingFlow.zipLookup(zipCode);
    
    try {
      const startTime = performance.now();
      
      // Preload related services
      preloadForZipLookup();
      
      // Load ZIP mapping service
      const { getZipMappingServices } = await import('@/services/lazy');
      const services = await getZipMappingServices();
      
      // Perform the lookup
      const district = await services.zipDistrictMappingService.getDistrictByZip(zipCode);
      
      const duration = performance.now() - startTime;
      trackPoliticalMappingFlow.districtFound(zipCode, district);
      performanceMonitor.trackZipLookup(zipCode, duration, true);
      
      return district;
    } catch (error) {
      const duration = performance.now() - Date.now();
      performanceMonitor.trackZipLookup(zipCode, duration, false);
      throw error;
    }
  }, [enableMonitoring]);

  // Optimized representative loading
  const optimizedRepresentativeLoad = useCallback(async (
    zipCode: string, 
    level: 'federal' | 'state' | 'local' = 'federal'
  ) => {
    const startTime = performance.now();
    
    try {
      let representatives = [];
      
      if (level === 'federal') {
        // Load federal representatives (highest priority)
        const response = await fetch(`/api/representatives?zip=${zipCode}&level=federal`);
        representatives = await response.json();
      } else if (level === 'state') {
        // Load state representatives through lazy services
        const { getCaliforniaServices } = await import('@/services/lazy');
        const services = await getCaliforniaServices();
        representatives = await services.integratedCaliforniaStateService.getByZipCode(zipCode);
      } else if (level === 'local') {
        // Load local representatives through lazy services
        const { getCountyServices } = await import('@/services/lazy');
        const services = await getCountyServices();
        representatives = await services.countyOfficialsApi.getByZipCode(zipCode);
      }
      
      const duration = performance.now() - startTime;
      
      if (enableMonitoring) {
        performanceMonitor.trackRepresentativeLoad(
          `${zipCode}_${level}`, 
          level, 
          duration, 
          false // Not cached in this case
        );
        
        if (level === 'federal') {
          trackPoliticalMappingFlow.representativesLoaded(zipCode, representatives.length);
        }
      }
      
      return representatives;
    } catch (error) {
      const duration = performance.now() - startTime;
      if (enableMonitoring) {
        performanceMonitor.trackRepresentativeLoad(
          `${zipCode}_${level}_error`, 
          level, 
          duration, 
          false
        );
      }
      throw error;
    }
  }, [enableMonitoring]);

  // Optimized service loading with monitoring
  const optimizedServiceLoad = useCallback(async <T>(
    serviceName: string,
    loader: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await performanceMonitor.measureAsync(`service_${serviceName}`, loader);
      
      if (enableMonitoring) {
        const duration = performance.now() - startTime;
        performanceMonitor.trackServiceLoad(serviceName, duration, true);
      }
      
      return result;
    } catch (error) {
      if (enableMonitoring) {
        const duration = performance.now() - startTime;
        performanceMonitor.trackServiceLoad(serviceName, duration, false);
      }
      throw error;
    }
  }, [enableMonitoring]);

  // Performance stats getter
  const getPerformanceStats = useCallback(() => {
    if (!enableMonitoring) return null;
    
    return {
      summary: performanceMonitor.getPerformanceSummary(),
      webVitals: performanceMonitor.getWebVitalsSummary(),
      export: performanceMonitor.exportMetrics()
    };
  }, [enableMonitoring]);

  // Intelligent preloading based on user behavior
  const intelligentPreload = useCallback((context: {
    currentPage?: string;
    userZip?: string;
    userInterests?: string[];
  }) => {
    if (!enablePreloading) return;
    
    const { currentPage, userZip, userInterests = [] } = context;
    
    // Preload based on current page
    if (currentPage === 'representatives' && userZip) {
      preloadForZipLookup();
      batchCacheOperations.warmUpCache([userZip]);
    }
    
    // Preload based on user interests
    if (userInterests.includes('local-government')) {
      import('@/services/countyServices');
    }
    
    if (userInterests.includes('state-politics')) {
      import('@/services/californiaServices');
    }
  }, [enablePreloading]);

  return {
    optimizedZipLookup,
    optimizedRepresentativeLoad,
    optimizedServiceLoad,
    getPerformanceStats,
    intelligentPreload,
    
    // Direct access to monitoring functions
    startFlow: performanceMonitor.startFlow.bind(performanceMonitor),
    addFlowStep: performanceMonitor.addFlowStep.bind(performanceMonitor),
    endFlow: performanceMonitor.endFlow.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor)
  };
};

// Hook for component-level performance optimization
export const useComponentPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>();
  
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        performanceMonitor.recordMetric(`component_${componentName}_render`, renderTime);
      }
    };
  });

  const measureOperation = useCallback(<T>(
    operationName: string,
    operation: () => T
  ): T => {
    return performanceMonitor.measureSync(`${componentName}_${operationName}`, operation);
  }, [componentName]);

  const measureAsyncOperation = useCallback(<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    return performanceMonitor.measureAsync(`${componentName}_${operationName}`, operation);
  }, [componentName]);

  return {
    measureOperation,
    measureAsyncOperation
  };
};