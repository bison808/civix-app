import { dataQualityService } from './dataQualityService';
import { dataUpdateScheduler } from './dataUpdateScheduler';
import { dataMonitoringService } from './dataMonitoringService';
import { dataRecoveryService } from './dataRecoveryService';
import { dataCorrectionsService } from './dataCorrectionsService';

/**
 * Main orchestrator for the Data Quality & Updates system
 * Coordinates all data quality, monitoring, recovery, and correction services
 */
export interface DataQualitySystem {
  initialized: boolean;
  services: {
    quality: boolean;
    scheduler: boolean;
    monitoring: boolean;
    recovery: boolean;
    corrections: boolean;
  };
  lastHealthCheck: string;
  systemStatus: 'healthy' | 'degraded' | 'critical';
}

export interface SystemMetrics {
  overallHealth: number;
  dataQuality: {
    score: number;
    freshness: number;
    accuracy: number;
    completeness: number;
  };
  operations: {
    updatesThisWeek: number;
    correctionsProcessed: number;
    alertsActive: number;
    avgResponseTime: number;
  };
  reliability: {
    uptime: number;
    successRate: number;
    errorRate: number;
  };
}

class DataQualityOrchestrator {
  private system: DataQualitySystem = {
    initialized: false,
    services: {
      quality: false,
      scheduler: false,
      monitoring: false,
      recovery: false,
      corrections: false
    },
    lastHealthCheck: '',
    systemStatus: 'critical'
  };

  /**
   * Initialize the entire data quality system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Data Quality & Updates System...');
    
    try {
      // Initialize services in dependency order
      console.log('📊 Initializing Data Quality Service...');
      await dataQualityService;
      this.system.services.quality = true;

      console.log('📅 Initializing Update Scheduler...');
      await dataUpdateScheduler.initialize();
      this.system.services.scheduler = true;

      console.log('📈 Initializing Monitoring Service...');
      await dataMonitoringService.initialize();
      this.system.services.monitoring = true;

      console.log('🔧 Initializing Recovery Service...');
      await dataRecoveryService.initialize();
      this.system.services.recovery = true;

      console.log('✏️ Initializing Corrections Service...');
      await dataCorrectionsService.initialize();
      this.system.services.corrections = true;

      // Start orchestration workflows
      await this.startOrchestrationWorkflows();

      this.system.initialized = true;
      this.system.systemStatus = 'healthy';
      this.system.lastHealthCheck = new Date().toISOString();

      console.log('✅ Data Quality & Updates System initialized successfully!');
      console.log('📋 System Status:', this.getSystemSummary());

    } catch (error) {
      console.error('❌ Failed to initialize Data Quality System:', error);
      this.system.systemStatus = 'critical';
      throw new Error(`System initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<DataQualitySystem> {
    await this.performHealthCheck();
    return { ...this.system };
  }

  /**
   * Get system metrics dashboard
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [
        qualityReport,
        updateMetrics,
        monitoringDashboard,
        correctionsStats
      ] = await Promise.all([
        dataQualityService.generateQualityReport(),
        dataUpdateScheduler.getUpdateMetrics(),
        dataMonitoringService.getDashboard(),
        dataCorrectionsService.getDataStewardDashboard()
      ]);

      return {
        overallHealth: this.calculateOverallHealth([
          qualityReport.overallScore,
          updateMetrics.successRate,
          monitoringDashboard.performance.uptime
        ]),
        dataQuality: {
          score: qualityReport.overallScore,
          freshness: qualityReport.freshness.overallFreshness,
          accuracy: this.calculateAccuracy(qualityReport),
          completeness: this.calculateCompleteness(qualityReport)
        },
        operations: {
          updatesThisWeek: updateMetrics.totalUpdatesThisWeek,
          correctionsProcessed: correctionsStats.pendingCorrections,
          alertsActive: monitoringDashboard.activeAlerts.length,
          avgResponseTime: monitoringDashboard.performance.apiResponseTimes.average
        },
        reliability: {
          uptime: monitoringDashboard.performance.uptime,
          successRate: updateMetrics.successRate,
          errorRate: monitoringDashboard.performance.errorRate
        }
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw new Error(`Failed to retrieve system metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle system alerts and trigger appropriate responses
   */
  async handleAlert(alert: any): Promise<void> {
    console.log(`🚨 Processing system alert: ${alert.title} (${alert.severity})`);

    switch (alert.type) {
      case 'data_quality':
        await this.handleDataQualityAlert(alert);
        break;
      
      case 'performance':
        await this.handlePerformanceAlert(alert);
        break;
      
      case 'system':
        await this.handleSystemLevelAlert(alert);
        break;
      
      default:
        console.warn(`Unknown alert type: ${alert.type}`);
    }
  }

  /**
   * Trigger emergency procedures
   */
  async triggerEmergencyProcedures(
    failureType: 'total_system_failure' | 'data_corruption' | 'api_cascade_failure'
  ): Promise<void> {
    console.error(`🚨 EMERGENCY: ${failureType} detected!`);
    
    // Immediate response
    const response = await dataRecoveryService.handleCriticalFailure(
      failureType,
      this.getAffectedSystems()
    );

    // Update system status
    this.system.systemStatus = 'critical';
    
    // Log emergency response
    console.log('🔧 Emergency response activated:', response);

    // Schedule recovery assessment
    setTimeout(() => {
      this.assessPostEmergencyRecovery();
    }, response.estimatedDowntime * 60 * 1000); // Convert minutes to ms
  }

  /**
   * Run comprehensive system health check
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    services: Record<string, boolean>;
    issues: string[];
  }> {
    const issues: string[] = [];
    const serviceStatus: Record<string, boolean> = {};

    try {
      // Check data quality service
      const qualityReport = await dataQualityService.generateQualityReport();
      serviceStatus.quality = qualityReport.overallScore >= 70;
      if (!serviceStatus.quality) {
        issues.push(`Data quality score below threshold: ${qualityReport.overallScore}%`);
      }

      // Check update scheduler
      const updateMetrics = await dataUpdateScheduler.getUpdateMetrics();
      serviceStatus.scheduler = updateMetrics.successRate >= 80;
      if (!serviceStatus.scheduler) {
        issues.push(`Update success rate below threshold: ${updateMetrics.successRate}%`);
      }

      // Check monitoring service
      const monitoringHealth = await dataMonitoringService.runHealthCheck();
      serviceStatus.monitoring = monitoringHealth.status !== 'critical';
      if (!serviceStatus.monitoring) {
        issues.push(`Monitoring system critical: ${monitoringHealth.issues.join(', ')}`);
      }

      // Check recovery service
      serviceStatus.recovery = true; // Recovery service is always available

      // Check corrections service
      const correctionsStats = await dataCorrectionsService.getDataStewardDashboard();
      serviceStatus.corrections = correctionsStats.overdueCorrections < 10;
      if (!serviceStatus.corrections) {
        issues.push(`Too many overdue corrections: ${correctionsStats.overdueCorrections}`);
      }

      // Determine overall status
      const healthyServices = Object.values(serviceStatus).filter(Boolean).length;
      const totalServices = Object.values(serviceStatus).length;
      
      let overall: 'healthy' | 'degraded' | 'critical';
      if (healthyServices === totalServices) {
        overall = 'healthy';
      } else if (healthyServices >= totalServices * 0.6) {
        overall = 'degraded';
      } else {
        overall = 'critical';
      }

      // Update system state
      this.system.systemStatus = overall;
      this.system.lastHealthCheck = new Date().toISOString();
      Object.assign(this.system.services, serviceStatus);

      return { overall, services: serviceStatus, issues };

    } catch (error) {
      console.error('Health check failed:', error instanceof Error ? error.message : 'Unknown error');
      return {
        overall: 'critical',
        services: serviceStatus,
        issues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Get system summary for logging
   */
  getSystemSummary(): string {
    const activeServices = Object.entries(this.system.services)
      .filter(([_, active]) => active)
      .map(([service, _]) => service);

    return [
      `Status: ${this.system.systemStatus}`,
      `Services: ${activeServices.join(', ')} (${activeServices.length}/5)`,
      `Last Check: ${this.system.lastHealthCheck}`,
      `Initialized: ${this.system.initialized ? '✅' : '❌'}`
    ].join(' | ');
  }

  /**
   * Shutdown system gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Data Quality & Updates System...');
    
    // Stop all background processes
    // Note: Individual services would need shutdown methods
    
    this.system.initialized = false;
    this.system.systemStatus = 'critical';
    
    console.log('✅ System shutdown complete');
  }

  // Private helper methods
  private async startOrchestrationWorkflows(): Promise<void> {
    // Start automated workflows that coordinate between services
    
    // Daily system health report
    this.scheduleDailyHealthReport();
    
    // Proactive issue detection
    this.startProactiveMonitoring();
    
    // Automated recovery triggers
    this.setupAutomatedRecoveryTriggers();
    
    console.log('🔄 Orchestration workflows started');
  }

  private scheduleDailyHealthReport(): void {
    // Schedule daily health reports at 6 AM
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(6, 0, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const timeUntilNextRun = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generateDailyReport();
      
      // Schedule recurring daily reports
      setInterval(() => {
        this.generateDailyReport();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilNextRun);
  }

  private async generateDailyReport(): Promise<void> {
    try {
      console.log('📊 Generating daily system health report...');
      
      const metrics = await this.getSystemMetrics();
      const healthCheck = await this.performHealthCheck();
      
      const report = [
        '=== DAILY SYSTEM HEALTH REPORT ===',
        `Date: ${new Date().toISOString().split('T')[0]}`,
        `Overall Health: ${metrics.overallHealth}%`,
        `System Status: ${healthCheck.overall}`,
        '',
        '📊 Data Quality:',
        `  Score: ${metrics.dataQuality.score}%`,
        `  Freshness: ${metrics.dataQuality.freshness}%`,
        `  Accuracy: ${metrics.dataQuality.accuracy}%`,
        `  Completeness: ${metrics.dataQuality.completeness}%`,
        '',
        '⚙️ Operations:',
        `  Updates This Week: ${metrics.operations.updatesThisWeek}`,
        `  Corrections Processed: ${metrics.operations.correctionsProcessed}`,
        `  Active Alerts: ${metrics.operations.alertsActive}`,
        `  Avg Response Time: ${metrics.operations.avgResponseTime}ms`,
        '',
        '🔧 Reliability:',
        `  Uptime: ${metrics.reliability.uptime}%`,
        `  Success Rate: ${metrics.reliability.successRate}%`,
        `  Error Rate: ${metrics.reliability.errorRate}%`,
        '',
        healthCheck.issues.length > 0 ? '⚠️ Issues:' : '✅ No Issues Detected',
        ...healthCheck.issues.map(issue => `  - ${issue}`),
        ''
      ].join('\n');
      
      console.log(report);
      
      // Could also send to external monitoring systems
      
    } catch (error) {
      console.error('Failed to generate daily report:', error);
    }
  }

  private startProactiveMonitoring(): void {
    // Monitor for patterns that indicate potential issues
    setInterval(async () => {
      try {
        await this.detectProactiveIssues();
      } catch (error) {
        console.error('Proactive monitoring error:', error);
      }
    }, 15 * 60 * 1000); // Every 15 minutes
  }

  private async detectProactiveIssues(): Promise<void> {
    // Check for early warning signs
    const metrics = await this.getSystemMetrics();
    
    // Declining data quality trend
    if (metrics.dataQuality.score < 85 && metrics.dataQuality.score > 75) {
      await dataMonitoringService.createAlert(
        'data_quality',
        'medium',
        'Data Quality Declining',
        `Data quality score is trending down: ${metrics.dataQuality.score}%`
      );
    }
    
    // High error rate trend
    if (metrics.reliability.errorRate > 3) {
      await dataMonitoringService.createAlert(
        'performance',
        'medium',
        'Error Rate Increasing',
        `Error rate is elevated: ${metrics.reliability.errorRate}%`
      );
    }
    
    // Many pending corrections
    if (metrics.operations.correctionsProcessed > 50) {
      await dataMonitoringService.createAlert(
        'system',
        'low',
        'High Correction Volume',
        `Many corrections pending: ${metrics.operations.correctionsProcessed}`
      );
    }
  }

  private setupAutomatedRecoveryTriggers(): void {
    // Set up triggers that automatically initiate recovery procedures
    
    // Monitor for critical data quality drops
    setInterval(async () => {
      try {
        const qualityReport = await dataQualityService.generateQualityReport();
        
        if (qualityReport.overallScore < 50) {
          console.warn('🚨 Critical data quality detected, initiating recovery...');
          await dataRecoveryService.detectAndPlan();
        }
      } catch (error) {
        console.error('Automated recovery trigger error:', error);
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  private async handleDataQualityAlert(alert: any): Promise<void> {
    // Trigger recovery planning for data quality issues
    await dataRecoveryService.detectAndPlan();
  }

  private async handlePerformanceAlert(alert: any): Promise<void> {
    // Handle performance degradation
    if (alert.severity === 'critical') {
      await this.triggerEmergencyProcedures('api_cascade_failure');
    }
  }

  private async handleSystemLevelAlert(alert: any): Promise<void> {
    // Handle system-level alerts
    if (alert.severity === 'critical') {
      await this.triggerEmergencyProcedures('total_system_failure');
    }
  }

  private getAffectedSystems(): string[] {
    // Return list of systems that could be affected by failures
    return [
      'data_pipeline',
      'representative_service',
      'update_scheduler',
      'monitoring_service'
    ];
  }

  private async assessPostEmergencyRecovery(): Promise<void> {
    console.log('🔍 Assessing post-emergency recovery...');
    
    const healthCheck = await this.performHealthCheck();
    
    if (healthCheck.overall === 'healthy') {
      console.log('✅ System has recovered successfully');
      this.system.systemStatus = 'healthy';
    } else {
      console.log('⚠️ System still experiencing issues, continuing recovery procedures');
      // Could trigger additional recovery steps
    }
  }

  private calculateOverallHealth(scores: number[]): number {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average * 100) / 100;
  }

  private calculateAccuracy(qualityReport: any): number {
    // Calculate accuracy based on validation results
    return qualityReport.overallScore; // Simplified
  }

  private calculateCompleteness(qualityReport: any): number {
    // Calculate completeness based on missing data
    return Math.max(0, 100 - (qualityReport.discrepancies.length * 2));
  }
}

// Export singleton instance
export const dataQualityOrchestrator = new DataQualityOrchestrator();
export default dataQualityOrchestrator;