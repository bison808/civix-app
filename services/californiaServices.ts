// California-specific services - lazy loaded for performance
export { openStatesService } from './openStatesService';
export { californiaStateApi } from './californiaStateApi';
export { integratedCaliforniaStateService } from './integratedCaliforniaState.service';

// Lazy-loaded California federal representatives to reduce initial bundle size
export const getCaliforniaFederalReps = async (zipCode: string) => {
  const { getCaliforniaFederalReps } = await import('./californiaFederalReps');
  return getCaliforniaFederalReps(zipCode);
};

export const getCaliforniaRepByDistrict = async (district: string) => {
  const { getCaliforniaRepByDistrict } = await import('./californiaFederalReps');
  return getCaliforniaRepByDistrict(district);
};