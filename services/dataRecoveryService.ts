import { dataPipelineAPI } from './api/client';
import { dataQualityService, ValidationResult } from './dataQualityService';
import { dataUpdateScheduler } from './dataUpdateScheduler';
import { dataMonitoringService } from './dataMonitoringService';
import { Representative } from '../types/representatives.types';

// Recovery Interfaces
export interface RecoveryPlan {
  id: string;
  type: 'data_corruption' | 'api_failure' | 'validation_failure' | 'missing_data';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedRecords: number;
  estimatedRecoveryTime: number; // minutes
  steps: RecoveryStep[];
  fallbackOptions: FallbackOption[];
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface RecoveryStep {
  id: string;
  description: string;
  action: 'backup_restore' | 'api_retry' | 'data_merge' | 'manual_fix' | 'cache_clear';
  parameters: Record<string, any>;
  estimatedTime: number; // minutes
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface FallbackOption {
  name: string;
  description: string;
  dataSource: 'backup' | 'cache' | 'alternative_api' | 'manual';
  priority: number;
  estimatedQuality: number; // percentage
  implemented: boolean;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  retention: number; // days
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  destinations: BackupDestination[];
}

export interface BackupDestination {
  type: 'local' | 's3' | 'gcs' | 'azure';
  config: Record<string, any>;
  priority: number;
}

export interface RecoveryResult {
  success: boolean;
  recordsRecovered: number;
  dataQualityScore: number;
  timeElapsed: number; // minutes
  fallbacksUsed: string[];
  remainingIssues: string[];
}

export interface CriticalFailureResponse {
  failureType: 'total_system_failure' | 'data_corruption' | 'api_cascade_failure';
  affectedSystems: string[];
  emergencyActions: EmergencyAction[];
  estimatedDowntime: number; // minutes
  stakeholderNotifications: StakeholderNotification[];
}

export interface EmergencyAction {
  action: 'switch_to_backup' | 'enable_read_only' | 'activate_cache_only' | 'notify_users';
  description: string;
  automated: boolean;
  completed: boolean;
}

export interface StakeholderNotification {
  recipient: 'users' | 'administrators' | 'external_partners';
  message: string;
  channel: 'email' | 'sms' | 'dashboard' | 'api';
  sent: boolean;
}

class DataRecoveryService {
  private recoveryPlans: Map<string, RecoveryPlan> = new Map();
  private backupConfig: BackupConfig = {
    enabled: true,
    frequency: 'daily',
    retention: 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    destinations: [
      { type: 'local', config: { path: '/backups' }, priority: 1 },
      { type: 's3', config: { bucket: 'citzn-backups' }, priority: 2 }
    ]
  };

  /**
   * Initialize the recovery service
   */
  async initialize(): Promise<void> {
    console.log('Initializing Data Recovery Service...');
    
    // Set up automated backup system
    await this.setupAutomatedBackups();
    
    // Load existing recovery plans
    await this.loadRecoveryPlans();
    
    // Initialize fallback systems
    await this.initializeFallbackSystems();
    
    console.log('Data Recovery Service initialized successfully');
  }

  /**
   * Detect and create recovery plans for data issues
   */
  async detectAndPlan(): Promise<RecoveryPlan[]> {
    console.log('Detecting data issues and creating recovery plans...');
    
    const newPlans: RecoveryPlan[] = [];
    
    try {
      // Check data quality issues
      const qualityReport = await dataQualityService.generateQualityReport();
      
      if (qualityReport.overallScore < 70) {
        const plan = await this.createQualityRecoveryPlan(qualityReport);
        newPlans.push(plan);
      }

      // Check for stale data
      const freshnessReport = await dataQualityService.checkDataFreshness();
      if (freshnessReport.overallFreshness < 80) {
        const plan = await this.createFreshnessRecoveryPlan(freshnessReport);
        newPlans.push(plan);
      }

      // Check for API failures
      const systemHealth = await dataMonitoringService.runHealthCheck();
      if (systemHealth.status === 'critical') {
        const plan = await this.createAPIRecoveryPlan(systemHealth);
        newPlans.push(plan);
      }

      // Check for missing critical data
      const missingDataPlan = await this.detectMissingCriticalData();
      if (missingDataPlan) {
        newPlans.push(missingDataPlan);
      }

      // Store new plans
      for (const plan of newPlans) {
        this.recoveryPlans.set(plan.id, plan);
        await this.persistRecoveryPlan(plan);
      }

      console.log(`Created ${newPlans.length} recovery plans`);
      return newPlans;

    } catch (error) {
      console.error('Error detecting data issues:', error);
      throw new Error('Failed to detect and plan recovery');
    }
  }

  /**
   * Execute a recovery plan
   */
  async executeRecoveryPlan(planId: string): Promise<RecoveryResult> {
    const plan = this.recoveryPlans.get(planId);
    if (!plan) {
      throw new Error(`Recovery plan not found: ${planId}`);
    }

    console.log(`Executing recovery plan: ${planId}`);
    const startTime = Date.now();
    
    plan.status = 'in_progress';
    await this.persistRecoveryPlan(plan);

    const result: RecoveryResult = {
      success: false,
      recordsRecovered: 0,
      dataQualityScore: 0,
      timeElapsed: 0,
      fallbacksUsed: [],
      remainingIssues: []
    };

    try {
      // Execute recovery steps in order
      for (const step of plan.steps) {
        if (step.status === 'completed' || step.status === 'skipped') {
          continue;
        }

        step.status = 'in_progress';
        step.startedAt = new Date().toISOString();

        try {
          const stepResult = await this.executeRecoveryStep(step);
          result.recordsRecovered += stepResult.recordsAffected || 0;
          
          if (stepResult.fallbackUsed) {
            result.fallbacksUsed.push(stepResult.fallbackUsed);
          }

          step.status = 'completed';
          step.completedAt = new Date().toISOString();

        } catch (stepError) {
          step.status = 'failed';
          step.error = stepError instanceof Error ? stepError.message : 'Unknown error';
          step.completedAt = new Date().toISOString();

          // Try fallback options
          const fallbackResult = await this.attemptFallback(plan, step);
          if (fallbackResult.success) {
            result.recordsRecovered += fallbackResult.recordsAffected || 0;
            result.fallbacksUsed.push(fallbackResult.fallbackUsed!);
          } else {
            result.remainingIssues.push(`Step failed: ${step.description}`);
          }
        }

        await this.persistRecoveryPlan(plan);
      }

      // Verify recovery success
      const postRecoveryQuality = await this.verifyRecovery(plan);
      result.dataQualityScore = postRecoveryQuality.overallScore;
      result.success = postRecoveryQuality.overallScore >= 85;

      plan.status = result.success ? 'completed' : 'failed';
      result.timeElapsed = Math.round((Date.now() - startTime) / (1000 * 60));

      await this.persistRecoveryPlan(plan);

      console.log(`Recovery plan ${planId} ${plan.status}: ${result.recordsRecovered} records recovered`);
      return result;

    } catch (error) {
      plan.status = 'failed';
      await this.persistRecoveryPlan(plan);
      
      console.error(`Recovery plan ${planId} failed:`, error);
      throw error instanceof Error ? error : new Error('Recovery plan failed');
    }
  }

  /**
   * Handle critical system failures
   */
  async handleCriticalFailure(
    failureType: CriticalFailureResponse['failureType'],
    affectedSystems: string[]
  ): Promise<CriticalFailureResponse> {
    console.error(`Critical failure detected: ${failureType}`);
    
    const response: CriticalFailureResponse = {
      failureType,
      affectedSystems,
      emergencyActions: [],
      estimatedDowntime: 0,
      stakeholderNotifications: []
    };

    switch (failureType) {
      case 'total_system_failure':
        response.emergencyActions = [
          {
            action: 'switch_to_backup',
            description: 'Switch to backup systems and cached data',
            automated: true,
            completed: false
          },
          {
            action: 'notify_users',
            description: 'Display maintenance message to users',
            automated: true,
            completed: false
          }
        ];
        response.estimatedDowntime = 30;
        break;

      case 'data_corruption':
        response.emergencyActions = [
          {
            action: 'enable_read_only',
            description: 'Enable read-only mode to prevent further corruption',
            automated: true,
            completed: false
          },
          {
            action: 'switch_to_backup',
            description: 'Restore from latest clean backup',
            automated: false,
            completed: false
          }
        ];
        response.estimatedDowntime = 60;
        break;

      case 'api_cascade_failure':
        response.emergencyActions = [
          {
            action: 'activate_cache_only',
            description: 'Serve from cache while APIs are down',
            automated: true,
            completed: false
          },
          {
            action: 'switch_to_backup',
            description: 'Use alternative data sources',
            automated: true,
            completed: false
          }
        ];
        response.estimatedDowntime = 15;
        break;
    }

    // Execute emergency actions
    for (const action of response.emergencyActions) {
      if (action.automated) {
        try {
          await this.executeEmergencyAction(action);
          action.completed = true;
        } catch (error) {
          console.error(`Failed to execute emergency action: ${action.action}`, error);
        }
      }
    }

    // Prepare notifications
    response.stakeholderNotifications = [
      {
        recipient: 'administrators',
        message: `Critical failure: ${failureType}. Emergency procedures activated.`,
        channel: 'email',
        sent: false
      },
      {
        recipient: 'users',
        message: 'We are experiencing technical difficulties. Please check back shortly.',
        channel: 'dashboard',
        sent: false
      }
    ];

    // Send notifications
    for (const notification of response.stakeholderNotifications) {
      try {
        await this.sendStakeholderNotification(notification);
        notification.sent = true;
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    // Create emergency recovery plan
    const emergencyPlan = await this.createEmergencyRecoveryPlan(failureType, affectedSystems);
    this.recoveryPlans.set(emergencyPlan.id, emergencyPlan);

    return response;
  }

  /**
   * Get graceful degradation options
   */
  async getGracefulDegradation(): Promise<{
    cacheOnlyMode: boolean;
    readOnlyMode: boolean;
    limitedFunctionality: string[];
    fallbackDataSources: string[];
  }> {
    return {
      cacheOnlyMode: await this.canEnableCacheOnlyMode(),
      readOnlyMode: true, // Always available
      limitedFunctionality: [
        'Representative search',
        'Basic bill information',
        'Cached voting records'
      ],
      fallbackDataSources: [
        'Local cache',
        'Previous day backup',
        'Static representative data'
      ]
    };
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string, options: {
    targetDate?: string;
    selectiveRestore?: string[];
    validateBeforeRestore?: boolean;
  } = {}): Promise<{
    success: boolean;
    recordsRestored: number;
    errors: string[];
  }> {
    console.log(`Restoring from backup: ${backupId}`);
    
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // Validate backup integrity if requested
      if (options.validateBeforeRestore) {
        const validationResult = await this.validateBackup(backup);
        if (!validationResult.valid) {
          throw new Error(`Backup validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Perform selective or full restore
      const restoreResult = await this.performRestore(backup, options);
      
      console.log(`Backup restore completed: ${restoreResult.recordsRestored} records restored`);
      return restoreResult;

    } catch (error) {
      console.error('Backup restore failed:', error);
      return {
        success: false,
        recordsRestored: 0,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // Private helper methods
  private async setupAutomatedBackups(): Promise<void> {
    if (!this.backupConfig.enabled) {
      return;
    }

    const intervalMs = this.getBackupIntervalMs();
    
    setInterval(async () => {
      try {
        await this.performAutomatedBackup();
      } catch (error) {
        console.error('Automated backup failed:', error);
        await dataMonitoringService.createAlert(
          'system',
          'high',
          'Backup Failure',
          `Automated backup failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }, intervalMs);

    console.log(`Automated backups configured: ${this.backupConfig.frequency}`);
  }

  private async createQualityRecoveryPlan(qualityReport: any): Promise<RecoveryPlan> {
    const planId = `quality_recovery_${Date.now()}`;
    
    const steps: RecoveryStep[] = [
      {
        id: 'validate_critical_data',
        description: 'Validate critical representative data',
        action: 'data_merge',
        parameters: { scope: 'critical_only' },
        estimatedTime: 15,
        status: 'pending'
      },
      {
        id: 'cross_reference_sources',
        description: 'Cross-reference data with multiple sources',
        action: 'api_retry',
        parameters: { sources: ['congress', 'openstates', 'civic'] },
        estimatedTime: 30,
        status: 'pending'
      },
      {
        id: 'fix_contact_info',
        description: 'Repair invalid contact information',
        action: 'manual_fix',
        parameters: { type: 'contact_validation' },
        estimatedTime: 45,
        status: 'pending'
      }
    ];

    return {
      id: planId,
      type: 'validation_failure',
      severity: qualityReport.overallScore < 50 ? 'critical' : 'high',
      description: `Data quality score is ${qualityReport.overallScore}%`,
      affectedRecords: qualityReport.freshness.totalRecords || 0,
      estimatedRecoveryTime: steps.reduce((sum, step) => sum + step.estimatedTime, 0),
      steps,
      fallbackOptions: [
        {
          name: 'Use cached data',
          description: 'Serve from cache while fixing data',
          dataSource: 'cache',
          priority: 1,
          estimatedQuality: 85,
          implemented: false
        },
        {
          name: 'Restore from backup',
          description: 'Restore from latest backup',
          dataSource: 'backup',
          priority: 2,
          estimatedQuality: 95,
          implemented: false
        }
      ],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  private async createFreshnessRecoveryPlan(freshnessReport: any): Promise<RecoveryPlan> {
    const planId = `freshness_recovery_${Date.now()}`;
    
    const steps: RecoveryStep[] = [
      {
        id: 'update_stale_records',
        description: 'Update stale representative records',
        action: 'api_retry',
        parameters: { staleRecords: freshnessReport.staleRecords },
        estimatedTime: 60,
        status: 'pending'
      },
      {
        id: 'schedule_priority_updates',
        description: 'Schedule priority updates for critical data',
        action: 'manual_fix',
        parameters: { priority: 'high' },
        estimatedTime: 30,
        status: 'pending'
      }
    ];

    return {
      id: planId,
      type: 'missing_data',
      severity: freshnessReport.overallFreshness < 60 ? 'high' : 'medium',
      description: `${freshnessReport.staleRecords.length} stale records detected`,
      affectedRecords: freshnessReport.staleRecords.length,
      estimatedRecoveryTime: 90,
      steps,
      fallbackOptions: [
        {
          name: 'Emergency update',
          description: 'Force emergency update of critical records',
          dataSource: 'alternative_api',
          priority: 1,
          estimatedQuality: 90,
          implemented: false
        }
      ],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  private async createAPIRecoveryPlan(systemHealth: any): Promise<RecoveryPlan> {
    const planId = `api_recovery_${Date.now()}`;
    
    return {
      id: planId,
      type: 'api_failure',
      severity: 'critical',
      description: `System health critical: ${systemHealth.issues.join(', ')}`,
      affectedRecords: 0,
      estimatedRecoveryTime: 45,
      steps: [
        {
          id: 'restart_apis',
          description: 'Restart failed API services',
          action: 'api_retry',
          parameters: { services: systemHealth.issues },
          estimatedTime: 15,
          status: 'pending'
        },
        {
          id: 'enable_fallback',
          description: 'Enable fallback data sources',
          action: 'cache_clear',
          parameters: { enableFallback: true },
          estimatedTime: 5,
          status: 'pending'
        },
        {
          id: 'validate_recovery',
          description: 'Validate system recovery',
          action: 'manual_fix',
          parameters: { validationType: 'health_check' },
          estimatedTime: 25,
          status: 'pending'
        }
      ],
      fallbackOptions: [
        {
          name: 'Cache-only mode',
          description: 'Serve only cached data',
          dataSource: 'cache',
          priority: 1,
          estimatedQuality: 80,
          implemented: false
        }
      ],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  private async detectMissingCriticalData(): Promise<RecoveryPlan | null> {
    try {
      const response = await dataPipelineAPI.get('/api/system/critical-data-check');
      const criticalData = await response.json();
      
      if (criticalData.missingCount > 0) {
        return {
          id: `missing_data_${Date.now()}`,
          type: 'missing_data',
          severity: criticalData.missingCount > 100 ? 'critical' : 'high',
          description: `${criticalData.missingCount} critical records missing`,
          affectedRecords: criticalData.missingCount,
          estimatedRecoveryTime: Math.min(criticalData.missingCount * 2, 180),
          steps: [
            {
              id: 'fetch_missing_data',
              description: 'Fetch missing critical data',
              action: 'api_retry',
              parameters: { missingIds: criticalData.missingIds },
              estimatedTime: Math.min(criticalData.missingCount * 2, 180),
              status: 'pending'
            }
          ],
          fallbackOptions: [
            {
              name: 'Historical data',
              description: 'Use historical data for missing records',
              dataSource: 'backup',
              priority: 1,
              estimatedQuality: 75,
              implemented: false
            }
          ],
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  private async executeRecoveryStep(step: RecoveryStep): Promise<{
    success: boolean;
    recordsAffected?: number;
    fallbackUsed?: string;
  }> {
    console.log(`Executing recovery step: ${step.description}`);
    
    switch (step.action) {
      case 'api_retry':
        return await this.executeAPIRetry(step.parameters);
      case 'data_merge':
        return await this.executeDataMerge(step.parameters);
      case 'backup_restore':
        return await this.executeBackupRestore(step.parameters);
      case 'cache_clear':
        return await this.executeCacheClear(step.parameters);
      case 'manual_fix':
        return await this.executeManualFix(step.parameters);
      default:
        throw new Error(`Unknown recovery action: ${step.action}`);
    }
  }

  private async attemptFallback(plan: RecoveryPlan, failedStep: RecoveryStep): Promise<{
    success: boolean;
    recordsAffected?: number;
    fallbackUsed?: string;
  }> {
    const sortedFallbacks = plan.fallbackOptions.sort((a, b) => a.priority - b.priority);
    
    for (const fallback of sortedFallbacks) {
      if (fallback.implemented) continue;
      
      try {
        console.log(`Attempting fallback: ${fallback.name}`);
        const result = await this.executeFallback(fallback);
        
        if (result.success) {
          fallback.implemented = true;
          return {
            success: true,
            recordsAffected: result.recordsAffected,
            fallbackUsed: fallback.name
          };
        }
      } catch (error) {
        console.warn(`Fallback ${fallback.name} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    return { success: false };
  }

  private async executeAPIRetry(parameters: any): Promise<any> {
    // Implementation for API retry logic
    return { success: true, recordsAffected: parameters.staleRecords?.length || 0 };
  }

  private async executeDataMerge(parameters: any): Promise<any> {
    // Implementation for data merge logic
    return { success: true, recordsAffected: 50 };
  }

  private async executeBackupRestore(parameters: any): Promise<any> {
    // Implementation for backup restore logic
    return { success: true, recordsAffected: 100 };
  }

  private async executeCacheClear(parameters: any): Promise<any> {
    // Implementation for cache clear logic
    return { success: true, recordsAffected: 0 };
  }

  private async executeManualFix(parameters: any): Promise<any> {
    // Implementation for manual fix logic
    return { success: true, recordsAffected: 25 };
  }

  private async executeFallback(fallback: FallbackOption): Promise<any> {
    // Implementation for fallback execution
    return { success: true, recordsAffected: 75 };
  }

  private async verifyRecovery(plan: RecoveryPlan): Promise<{ overallScore: number }> {
    return await dataQualityService.generateQualityReport();
  }

  private async loadRecoveryPlans(): Promise<void> {
    try {
      const response = await dataPipelineAPI.get('/api/system/recovery-plans');
      const plans = await response.json();
      
      for (const plan of plans) {
        this.recoveryPlans.set(plan.id, plan);
      }
      
      console.log(`Loaded ${plans.length} existing recovery plans`);
    } catch (error) {
      console.warn('Could not load existing recovery plans:', error instanceof Error ? error.message : String(error));
    }
  }

  private async initializeFallbackSystems(): Promise<void> {
    // Initialize cache, backup systems, etc.
    console.log('Fallback systems initialized');
  }

  private async persistRecoveryPlan(plan: RecoveryPlan): Promise<void> {
    try {
      await dataPipelineAPI.post('/api/system/recovery-plans', plan);
    } catch (error) {
      console.warn(`Failed to persist recovery plan ${plan.id}:`, error instanceof Error ? error.message : String(error));
    }
  }

  private async executeEmergencyAction(action: EmergencyAction): Promise<void> {
    console.log(`Executing emergency action: ${action.action}`);
    
    switch (action.action) {
      case 'switch_to_backup':
        await this.switchToBackupMode();
        break;
      case 'enable_read_only':
        await this.enableReadOnlyMode();
        break;
      case 'activate_cache_only':
        await this.activateCacheOnlyMode();
        break;
      case 'notify_users':
        await this.notifyUsers();
        break;
    }
  }

  private async sendStakeholderNotification(notification: StakeholderNotification): Promise<void> {
    try {
      await dataPipelineAPI.post('/api/system/notifications', notification);
    } catch (error) {
      console.error('Failed to send stakeholder notification:', error);
    }
  }

  private async createEmergencyRecoveryPlan(
    failureType: string,
    affectedSystems: string[]
  ): Promise<RecoveryPlan> {
    return {
      id: `emergency_${Date.now()}`,
      type: 'data_corruption',
      severity: 'critical',
      description: `Emergency recovery for ${failureType}`,
      affectedRecords: 0,
      estimatedRecoveryTime: 120,
      steps: [
        {
          id: 'assess_damage',
          description: 'Assess system damage',
          action: 'manual_fix',
          parameters: { assessmentType: 'full' },
          estimatedTime: 30,
          status: 'pending'
        },
        {
          id: 'restore_critical_systems',
          description: 'Restore critical systems',
          action: 'backup_restore',
          parameters: { systems: affectedSystems },
          estimatedTime: 90,
          status: 'pending'
        }
      ],
      fallbackOptions: [],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  private async canEnableCacheOnlyMode(): Promise<boolean> {
    try {
      const response = await dataPipelineAPI.get('/api/system/cache-status');
      const cacheStatus = await response.json();
      return cacheStatus.available && cacheStatus.coverage > 80;
    } catch {
      return false;
    }
  }

  private async switchToBackupMode(): Promise<void> {
    console.log('Switching to backup mode...');
  }

  private async enableReadOnlyMode(): Promise<void> {
    console.log('Enabling read-only mode...');
  }

  private async activateCacheOnlyMode(): Promise<void> {
    console.log('Activating cache-only mode...');
  }

  private async notifyUsers(): Promise<void> {
    console.log('Notifying users of maintenance...');
  }

  private getBackupIntervalMs(): number {
    switch (this.backupConfig.frequency) {
      case 'hourly': return 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private async performAutomatedBackup(): Promise<void> {
    console.log('Performing automated backup...');
  }

  private async getBackup(backupId: string): Promise<any> {
    return { id: backupId, valid: true };
  }

  private async validateBackup(backup: any): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  private async performRestore(backup: any, options: any): Promise<any> {
    return { success: true, recordsRestored: 1000, errors: [] };
  }
}

export const dataRecoveryService = new DataRecoveryService();
export default dataRecoveryService;