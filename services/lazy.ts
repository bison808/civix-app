// Lazy loading for political mapping services to optimize bundle size
import { lazy } from 'react';

// Core services - loaded immediately
export { default as apiClient, authAPI, aiEngineAPI, dataPipelineAPI, communicationsAPI } from './api/client';
export { authService } from './auth.service';
export { representativesService } from './representatives.service';
export { billsService } from './bills.service';
export { feedbackService } from './feedback.service';

// Lazy-loaded political mapping services
export const loadCaliforniaServices = () => import('./californiaServices');
export const loadZipMappingServices = () => import('./zipMappingServices');
export const loadCountyServices = () => import('./countyServices');
export const loadDataQualityServices = () => import('./dataQualityServices');

// For immediate access when needed
let californiaServicesCache: any = null;
let zipMappingServicesCache: any = null;
let countyServicesCache: any = null;
let dataQualityServicesCache: any = null;

export const getCaliforniaServices = async () => {
  if (!californiaServicesCache) {
    californiaServicesCache = await loadCaliforniaServices();
  }
  return californiaServicesCache;
};

export const getZipMappingServices = async () => {
  if (!zipMappingServicesCache) {
    zipMappingServicesCache = await loadZipMappingServices();
  }
  return zipMappingServicesCache;
};

export const getCountyServices = async () => {
  if (!countyServicesCache) {
    countyServicesCache = await loadCountyServices();
  }
  return countyServicesCache;
};

export const getDataQualityServices = async () => {
  if (!dataQualityServicesCache) {
    dataQualityServicesCache = await loadDataQualityServices();
  }
  return dataQualityServicesCache;
};

// Preload services for better UX
export const preloadPoliticalMappingServices = () => {
  // Preload in the background after initial page load
  setTimeout(() => {
    loadCaliforniaServices();
    loadZipMappingServices();
    loadCountyServices();
    loadDataQualityServices();
  }, 2000);
};