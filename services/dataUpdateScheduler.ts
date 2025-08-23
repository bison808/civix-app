import { dataPipelineAPI } from './api/client';
import { dataQualityService } from './dataQualityService';

// Update Schedule Interfaces
export interface UpdateSchedule {
  federal: 'weekly';
  state: 'bi-weekly';  
  county: 'monthly';
  local: 'bi-weekly';
  emergency: 'as-needed';
}

export interface UpdateResult {
  success: boolean;
  recordsUpdated: number;
  recordsAdded: number;
  recordsRemoved: number;
  errors: UpdateError[];
  duration: number;
  nextScheduledUpdate: string;
}

export interface UpdateError {
  type: 'api_failure' | 'validation_error' | 'network_error' | 'rate_limit';
  message: string;
  representativeId?: string;
  retryable: boolean;
  timestamp: string;
}

export interface UpdateJob {
  id: string;
  type: 'federal' | 'state' | 'county' | 'local' | 'emergency';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  scheduledFor: string;
  startedAt?: string;
  completedAt?: string;
  result?: UpdateResult;
  retryCount: number;
  maxRetries: number;
}

export interface UpdateMetrics {
  totalUpdatesThisWeek: number;
  successRate: number;
  averageUpdateDuration: number;
  lastUpdateTimes: {
    federal: string | null;
    state: string | null;
    county: string | null;
    local: string | null;
  };
  nextScheduledUpdates: {
    federal: string;
    state: string;
    county: string;
    local: string;
  };
}

class DataUpdateScheduler {
  private readonly UPDATE_SCHEDULE: UpdateSchedule = {
    federal: 'weekly',
    state: 'bi-weekly',
    county: 'monthly',
    local: 'bi-weekly',
    emergency: 'as-needed'
  };

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_DELAY_MS = 60 * 60 * 1000; // 1 hour
  
  private jobs: Map<string, UpdateJob> = new Map();
  private isSchedulerRunning = false;

  /**
   * Initialize the update scheduler
   */
  async initialize(): Promise<void> {
    console.log('Initializing Data Update Scheduler...');
    
    // Load existing jobs from storage
    await this.loadExistingJobs();
    
    // Schedule initial updates if none exist
    await this.scheduleInitialUpdates();
    
    // Start the scheduler
    this.startScheduler();
    
    console.log('Data Update Scheduler initialized successfully');
  }

  /**
   * Schedule updates based on the defined schedule
   */
  async scheduleUpdates(): Promise<void> {
    const now = new Date();
    
    // Federal updates - weekly (every Sunday at 2 AM)
    const nextFederalUpdate = this.getNextScheduledTime('weekly', 0, 2); // Sunday, 2 AM
    await this.scheduleUpdateJob('federal', nextFederalUpdate);
    
    // State updates - bi-weekly (every other Wednesday at 3 AM)
    const nextStateUpdate = this.getNextScheduledTime('bi-weekly', 3, 3); // Wednesday, 3 AM
    await this.scheduleUpdateJob('state', nextStateUpdate);
    
    // County updates - monthly (1st of every month at 4 AM)
    const nextCountyUpdate = this.getNextMonthlyUpdate(1, 4); // 1st of month, 4 AM
    await this.scheduleUpdateJob('county', nextCountyUpdate);
    
    // Local updates - bi-weekly (every other Friday at 1 AM)
    const nextLocalUpdate = this.getNextScheduledTime('bi-weekly', 5, 1); // Friday, 1 AM
    await this.scheduleUpdateJob('local', nextLocalUpdate);
  }

  /**
   * Run federal data update
   */
  async runFederalDataUpdate(): Promise<UpdateResult> {
    console.log('Starting federal data update...');
    const startTime = Date.now();
    
    const result: UpdateResult = {
      success: false,
      recordsUpdated: 0,
      recordsAdded: 0,
      recordsRemoved: 0,
      errors: [],
      duration: 0,
      nextScheduledUpdate: ''
    };

    try {
      // Update Congress data
      const congressUpdate = await this.updateCongressData();
      result.recordsUpdated += congressUpdate.recordsUpdated;
      result.recordsAdded += congressUpdate.recordsAdded;
      result.errors.push(...congressUpdate.errors);

      // Update Senate data
      const senateUpdate = await this.updateSenateData();
      result.recordsUpdated += senateUpdate.recordsUpdated;
      result.recordsAdded += senateUpdate.recordsAdded;
      result.errors.push(...senateUpdate.errors);

      // Validate updated data
      await this.validateUpdatedData('federal');

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;
      result.nextScheduledUpdate = this.getNextScheduledTime('weekly', 0, 2).toISOString();

      console.log(`Federal update completed: ${result.recordsUpdated} updated, ${result.recordsAdded} added`);
      
    } catch (error) {
      result.errors.push({
        type: 'api_failure',
        message: `Federal update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        retryable: true,
        timestamp: new Date().toISOString()
      });
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Run state data update
   */
  async runStateDataUpdate(): Promise<UpdateResult> {
    console.log('Starting state data update...');
    const startTime = Date.now();
    
    const result: UpdateResult = {
      success: false,
      recordsUpdated: 0,
      recordsAdded: 0,
      recordsRemoved: 0,
      errors: [],
      duration: 0,
      nextScheduledUpdate: ''
    };

    try {
      // Update OpenStates data
      const openStatesUpdate = await this.updateOpenStatesData();
      result.recordsUpdated += openStatesUpdate.recordsUpdated;
      result.recordsAdded += openStatesUpdate.recordsAdded;
      result.errors.push(...openStatesUpdate.errors);

      // Update state-specific APIs
      const stateApiUpdate = await this.updateStateSpecificData();
      result.recordsUpdated += stateApiUpdate.recordsUpdated;
      result.recordsAdded += stateApiUpdate.recordsAdded;
      result.errors.push(...stateApiUpdate.errors);

      // Validate updated data
      await this.validateUpdatedData('state');

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;
      result.nextScheduledUpdate = this.getNextScheduledTime('bi-weekly', 3, 3).toISOString();

      console.log(`State update completed: ${result.recordsUpdated} updated, ${result.recordsAdded} added`);
      
    } catch (error) {
      result.errors.push({
        type: 'api_failure',
        message: `State update failed: ${error instanceof Error ? error.message : String(error)}`,
        retryable: true,
        timestamp: new Date().toISOString()
      });
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Run county data update
   */
  async runCountyDataUpdate(): Promise<UpdateResult> {
    console.log('Starting county data update...');
    const startTime = Date.now();
    
    const result: UpdateResult = {
      success: false,
      recordsUpdated: 0,
      recordsAdded: 0,
      recordsRemoved: 0,
      errors: [],
      duration: 0,
      nextScheduledUpdate: ''
    };

    try {
      // Update California county data
      const countyUpdate = await this.updateCountyData();
      result.recordsUpdated += countyUpdate.recordsUpdated;
      result.recordsAdded += countyUpdate.recordsAdded;
      result.errors.push(...countyUpdate.errors);

      // Validate updated data
      await this.validateUpdatedData('county');

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;
      result.nextScheduledUpdate = this.getNextMonthlyUpdate(1, 4).toISOString();

      console.log(`County update completed: ${result.recordsUpdated} updated, ${result.recordsAdded} added`);
      
    } catch (error) {
      result.errors.push({
        type: 'api_failure',
        message: `County update failed: ${error instanceof Error ? error.message : String(error)}`,
        retryable: true,
        timestamp: new Date().toISOString()
      });
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Run local data update
   */
  async runLocalDataUpdate(): Promise<UpdateResult> {
    console.log('Starting local data update...');
    const startTime = Date.now();
    
    const result: UpdateResult = {
      success: false,
      recordsUpdated: 0,
      recordsAdded: 0,
      recordsRemoved: 0,
      errors: [],
      duration: 0,
      nextScheduledUpdate: ''
    };

    try {
      // Update municipal data
      const municipalUpdate = await this.updateMunicipalData();
      result.recordsUpdated += municipalUpdate.recordsUpdated;
      result.recordsAdded += municipalUpdate.recordsAdded;
      result.errors.push(...municipalUpdate.errors);

      // Update school district data
      const schoolUpdate = await this.updateSchoolDistrictData();
      result.recordsUpdated += schoolUpdate.recordsUpdated;
      result.recordsAdded += schoolUpdate.recordsAdded;
      result.errors.push(...schoolUpdate.errors);

      // Validate updated data
      await this.validateUpdatedData('local');

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;
      result.nextScheduledUpdate = this.getNextScheduledTime('bi-weekly', 5, 1).toISOString();

      console.log(`Local update completed: ${result.recordsUpdated} updated, ${result.recordsAdded} added`);
      
    } catch (error) {
      result.errors.push({
        type: 'api_failure',
        message: `Local update failed: ${error instanceof Error ? error.message : String(error)}`,
        retryable: true,
        timestamp: new Date().toISOString()
      });
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Trigger an emergency update
   */
  async triggerEmergencyUpdate(type: 'federal' | 'state' | 'county' | 'local', reason: string): Promise<string> {
    const jobId = `emergency_${type}_${Date.now()}`;
    
    const job: UpdateJob = {
      id: jobId,
      type: 'emergency',
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.jobs.set(jobId, job);
    
    console.log(`Emergency ${type} update triggered: ${reason}`);
    
    // Execute immediately
    this.executeJob(jobId);
    
    return jobId;
  }

  /**
   * Get update metrics
   */
  async getUpdateMetrics(): Promise<UpdateMetrics> {
    try {
      const response = await dataPipelineAPI.get('/api/system/update-metrics');
      const metrics = await response.json();

      const now = new Date();
      
      return {
        totalUpdatesThisWeek: metrics.totalUpdatesThisWeek || 0,
        successRate: metrics.successRate || 0,
        averageUpdateDuration: metrics.averageUpdateDuration || 0,
        lastUpdateTimes: {
          federal: metrics.lastFederalUpdate || null,
          state: metrics.lastStateUpdate || null,
          county: metrics.lastCountyUpdate || null,
          local: metrics.lastLocalUpdate || null
        },
        nextScheduledUpdates: {
          federal: this.getNextScheduledTime('weekly', 0, 2).toISOString(),
          state: this.getNextScheduledTime('bi-weekly', 3, 3).toISOString(),
          county: this.getNextMonthlyUpdate(1, 4).toISOString(),
          local: this.getNextScheduledTime('bi-weekly', 5, 1).toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching update metrics:', error);
      throw new Error('Failed to fetch update metrics');
    }
  }

  /**
   * Cancel a scheduled job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'running') {
      console.warn(`Cannot cancel running job: ${jobId}`);
      return false;
    }

    job.status = 'cancelled';
    console.log(`Job cancelled: ${jobId}`);
    return true;
  }

  // Private helper methods
  private async loadExistingJobs(): Promise<void> {
    try {
      const response = await dataPipelineAPI.get('/api/system/update-jobs');
      const existingJobs = await response.json();
      
      for (const job of existingJobs) {
        this.jobs.set(job.id, job);
      }
      
      console.log(`Loaded ${existingJobs.length} existing jobs`);
    } catch (error) {
      console.warn('Could not load existing jobs:', error instanceof Error ? error.message : String(error));
    }
  }

  private async scheduleInitialUpdates(): Promise<void> {
    const hasActiveJobs = Array.from(this.jobs.values()).some(
      job => job.status === 'pending' || job.status === 'running'
    );

    if (!hasActiveJobs) {
      await this.scheduleUpdates();
    }
  }

  private startScheduler(): void {
    if (this.isSchedulerRunning) {
      return;
    }

    this.isSchedulerRunning = true;
    
    // Check for pending jobs every minute
    setInterval(() => {
      this.checkPendingJobs();
    }, 60 * 1000);

    console.log('Scheduler started - checking for pending jobs every minute');
  }

  private async checkPendingJobs(): Promise<void> {
    const now = new Date();
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'pending' && new Date(job.scheduledFor) <= now) {
        console.log(`Executing scheduled job: ${jobId}`);
        this.executeJob(jobId);
      }
    }
  }

  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') {
      return;
    }

    job.status = 'running';
    job.startedAt = new Date().toISOString();

    try {
      let result: UpdateResult;
      
      switch (job.type) {
        case 'federal':
          result = await this.runFederalDataUpdate();
          break;
        case 'state':
          result = await this.runStateDataUpdate();
          break;
        case 'county':
          result = await this.runCountyDataUpdate();
          break;
        case 'local':
          result = await this.runLocalDataUpdate();
          break;
        case 'emergency':
          // Determine emergency type and run appropriate update
          result = await this.runFederalDataUpdate(); // Default to federal
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.result = result;
      job.status = result.success ? 'completed' : 'failed';
      job.completedAt = new Date().toISOString();

      if (!result.success && job.retryCount < job.maxRetries) {
        // Schedule retry
        setTimeout(() => {
          job.status = 'pending';
          job.retryCount++;
          job.scheduledFor = new Date(Date.now() + this.RETRY_DELAY_MS).toISOString();
        }, this.RETRY_DELAY_MS);
      }

      // Schedule next update for recurring jobs
      if (result.success && job.type !== 'emergency') {
        await this.scheduleNextUpdate(job.type);
      }

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.result = {
        success: false,
        recordsUpdated: 0,
        recordsAdded: 0,
        recordsRemoved: 0,
        errors: [{
          type: 'api_failure',
          message: error instanceof Error ? error.message : String(error),
          retryable: true,
          timestamp: new Date().toISOString()
        }],
        duration: Date.now() - new Date(job.startedAt!).getTime(),
        nextScheduledUpdate: ''
      };

      console.error(`Job failed: ${jobId}`, error);
    }

    // Persist job state
    await this.persistJobState(job);
  }

  private async scheduleUpdateJob(type: 'federal' | 'state' | 'county' | 'local', scheduledTime: Date): Promise<void> {
    const jobId = `${type}_${scheduledTime.getTime()}`;
    
    const job: UpdateJob = {
      id: jobId,
      type,
      status: 'pending',
      scheduledFor: scheduledTime.toISOString(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.jobs.set(jobId, job);
    await this.persistJobState(job);
    
    console.log(`Scheduled ${type} update for ${scheduledTime.toISOString()}`);
  }

  private async scheduleNextUpdate(type: 'federal' | 'state' | 'county' | 'local'): Promise<void> {
    let nextUpdate: Date;
    
    switch (type) {
      case 'federal':
        nextUpdate = this.getNextScheduledTime('weekly', 0, 2);
        break;
      case 'state':
        nextUpdate = this.getNextScheduledTime('bi-weekly', 3, 3);
        break;
      case 'county':
        nextUpdate = this.getNextMonthlyUpdate(1, 4);
        break;
      case 'local':
        nextUpdate = this.getNextScheduledTime('bi-weekly', 5, 1);
        break;
    }

    await this.scheduleUpdateJob(type, nextUpdate);
  }

  private getNextScheduledTime(frequency: 'weekly' | 'bi-weekly', dayOfWeek: number, hour: number): Date {
    const now = new Date();
    const next = new Date(now);
    
    // Set to target day and hour
    next.setDate(now.getDate() + ((dayOfWeek + 7 - now.getDay()) % 7));
    next.setHours(hour, 0, 0, 0);
    
    // If the time has passed today, move to next occurrence
    if (next <= now) {
      if (frequency === 'weekly') {
        next.setDate(next.getDate() + 7);
      } else { // bi-weekly
        next.setDate(next.getDate() + 14);
      }
    }
    
    return next;
  }

  private getNextMonthlyUpdate(dayOfMonth: number, hour: number): Date {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, hour, 0, 0, 0);
    
    // If the date has passed this month, move to next month
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
    
    return next;
  }

  private async updateCongressData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/congress');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `Congress API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async updateSenateData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/senate');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `Senate API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async updateOpenStatesData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/openstates');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `OpenStates API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async updateStateSpecificData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/state-specific');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `State-specific API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async updateCountyData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/county');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `County API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async updateMunicipalData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/municipal');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `Municipal API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async updateSchoolDistrictData(): Promise<{ recordsUpdated: number; recordsAdded: number; errors: UpdateError[] }> {
    try {
      const response = await dataPipelineAPI.post('/api/system/update/school-districts');
      return await response.json();
    } catch (error) {
      return {
        recordsUpdated: 0,
        recordsAdded: 0,
        errors: [{
          type: 'api_failure',
          message: `School district API update failed: ${error instanceof Error ? error.message : String(error)}`,
          retryable: true,
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  private async validateUpdatedData(category: string): Promise<void> {
    console.log(`Validating updated ${category} data...`);
    
    try {
      // Run basic validation on updated records
      const validation = await dataQualityService.generateQualityReport();
      
      if (validation.overallScore < 70) {
        console.warn(`Data quality score below threshold after ${category} update: ${validation.overallScore}%`);
      }
      
    } catch (error) {
      console.warn(`Data validation failed for ${category}:`, error instanceof Error ? error.message : String(error));
    }
  }

  private async persistJobState(job: UpdateJob): Promise<void> {
    try {
      await dataPipelineAPI.post('/api/system/update-jobs', job);
    } catch (error) {
      console.warn(`Failed to persist job state for ${job.id}:`, error instanceof Error ? error.message : String(error));
    }
  }
}

export const dataUpdateScheduler = new DataUpdateScheduler();
export default dataUpdateScheduler;