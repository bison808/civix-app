// API Client
export { default as apiClient, authAPI, aiEngineAPI, dataPipelineAPI, communicationsAPI } from './api/client';

// Services
export { authService } from './auth.service';
export { representativesService } from './representatives.service';
export { billsService } from './bills.service';
export { feedbackService } from './feedback.service';

// California State Services
export { openStatesService } from './openStatesService';
export { californiaStateApi } from './californiaStateApi';
export { integratedCaliforniaStateService } from './integratedCaliforniaState.service';

// ZIP Code & District Mapping Services
export { geocodingService } from './geocodingService';
export { zipDistrictMappingService } from './zipDistrictMapping';
export { batchProcessor } from './batchProcessor';

// County Services
export { countyMappingService } from './countyMappingService';
export { countyOfficialsApi } from './countyOfficialsApi';

// Data Quality & Updates Services
export { dataQualityService } from './dataQualityService';
export { dataUpdateScheduler } from './dataUpdateScheduler';
export { dataMonitoringService } from './dataMonitoringService';
export { dataRecoveryService } from './dataRecoveryService';
export { dataCorrectionsService } from './dataCorrectionsService';
export { dataQualityOrchestrator } from './dataQualityOrchestrator';

// Re-export types for convenience
export * from '../types';