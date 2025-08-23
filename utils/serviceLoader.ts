// Service loader with performance optimizations
import { 
  getCaliforniaServices, 
  getZipMappingServices, 
  getCountyServices, 
  getDataQualityServices,
  preloadPoliticalMappingServices 
} from '../services/lazy';

export interface ServiceLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error?: Error;
}

// Service loading cache and state management
const serviceStates = new Map<string, ServiceLoadingState>();
const servicePromises = new Map<string, Promise<any>>();

// Initialize preloading after app startup
let preloadInitialized = false;
export const initializeServicePreloading = () => {
  if (!preloadInitialized) {
    preloadInitialized = true;
    preloadPoliticalMappingServices();
  }
};

// Generic service loader with caching
async function loadService<T>(
  serviceKey: string,
  loader: () => Promise<T>
): Promise<T> {
  // Return cached promise if already loading
  if (servicePromises.has(serviceKey)) {
    return servicePromises.get(serviceKey);
  }

  // Set loading state
  serviceStates.set(serviceKey, { isLoading: true, isLoaded: false });

  try {
    const loadPromise = loader();
    servicePromises.set(serviceKey, loadPromise);
    
    const result = await loadPromise;
    
    // Update success state
    serviceStates.set(serviceKey, { isLoading: false, isLoaded: true });
    
    return result;
  } catch (error) {
    // Update error state
    serviceStates.set(serviceKey, { 
      isLoading: false, 
      isLoaded: false, 
      error: error as Error 
    });
    
    // Remove failed promise so we can retry
    servicePromises.delete(serviceKey);
    throw error;
  }
}

// Specific service loaders
export const loadCaliforniaServicesOptimized = () => 
  loadService('california', getCaliforniaServices);

export const loadZipMappingServicesOptimized = () => 
  loadService('zipMapping', getZipMappingServices);

export const loadCountyServicesOptimized = () => 
  loadService('county', getCountyServices);

export const loadDataQualityServicesOptimized = () => 
  loadService('dataQuality', getDataQualityServices);

// Get service loading state
export const getServiceLoadingState = (serviceKey: string): ServiceLoadingState => {
  return serviceStates.get(serviceKey) || { isLoading: false, isLoaded: false };
};

// Preload based on user action hints
export const preloadForZipLookup = () => {
  loadZipMappingServicesOptimized();
  loadCaliforniaServicesOptimized();
};

export const preloadForRepresentativeSearch = () => {
  loadCountyServicesOptimized();
  loadCaliforniaServicesOptimized();
};

export const preloadForDataAnalysis = () => {
  loadDataQualityServicesOptimized();
};