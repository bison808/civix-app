import { dataPipelineAPI } from './api/client';
import { dataQualityService } from './dataQualityService';
import { dataUpdateScheduler } from './dataUpdateScheduler';

// Monitoring Interfaces
export interface QualityMetrics {
  overallScore: number;
  dataCompleteness: number;
  dataAccuracy: number;
  dataFreshness: number;
  contactValidation: number;
  crossReferenceValidation: number;
  timestamp: string;
}

export interface PerformanceMetrics {
  apiResponseTimes: {
    average: number;
    p95: number;
    p99: number;
  };
  cacheHitRate: number;
  errorRate: number;
  throughput: number; // requests per minute
  uptime: number; // percentage
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'data_quality' | 'performance' | 'system' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface MonitoringDashboard {
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  activeAlerts: Alert[];
  systemHealth: SystemHealthStatus;
  dataSourceStatus: DataSourceStatus[];
  recentUpdates: UpdateSummary[];
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  lastHealthCheck: string;
  issues: string[];
}

export interface DataSourceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastSuccessfulUpdate: string;
  errorRate: number;
  responseTime: number;
}

export interface UpdateSummary {
  type: 'federal' | 'state' | 'county' | 'local';
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  recordsAffected: number;
  duration: number;
}

export interface MonitoringConfig {
  alertThresholds: {
    qualityScore: number;
    responseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
  checkIntervals: {
    healthCheck: number; // minutes
    qualityCheck: number; // hours
    performanceCheck: number; // minutes
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhooks: string[];
  };
}

class DataMonitoringService {
  private alerts: Map<string, Alert> = new Map();
  private metricsHistory: QualityMetrics[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private isMonitoring = false;

  private readonly DEFAULT_CONFIG: MonitoringConfig = {
    alertThresholds: {
      qualityScore: 85,
      responseTime: 2000, // ms
      errorRate: 5, // percentage
      cacheHitRate: 80 // percentage
    },
    checkIntervals: {
      healthCheck: 5, // minutes
      qualityCheck: 4, // hours
      performanceCheck: 1 // minute
    },
    notifications: {
      email: true,
      slack: false,
      webhooks: []
    }
  };

  /**
   * Initialize the monitoring service
   */
  async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    console.log('Initializing Data Monitoring Service...');
    
    const monitoringConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Start monitoring loops
    this.startHealthMonitoring(monitoringConfig.checkIntervals.healthCheck);
    this.startQualityMonitoring(monitoringConfig.checkIntervals.qualityCheck);
    this.startPerformanceMonitoring(monitoringConfig.checkIntervals.performanceCheck);
    
    // Load historical data
    await this.loadHistoricalMetrics();
    
    this.isMonitoring = true;
    console.log('Data Monitoring Service initialized successfully');
  }

  /**
   * Get current monitoring dashboard
   */
  async getDashboard(): Promise<MonitoringDashboard> {
    try {
      const [quality, performance, systemHealth, dataSources, updates] = await Promise.all([
        this.getCurrentQualityMetrics(),
        this.getCurrentPerformanceMetrics(),
        this.getSystemHealth(),
        this.getDataSourceStatuses(),
        this.getRecentUpdates()
      ]);

      const activeAlerts = Array.from(this.alerts.values()).filter(alert => !alert.resolved);

      return {
        quality,
        performance,
        activeAlerts,
        systemHealth,
        dataSourceStatus: dataSources,
        recentUpdates: updates
      };
    } catch (error) {
      console.error('Error building monitoring dashboard:', error);
      throw new Error('Failed to build monitoring dashboard');
    }
  }

  /**
   * Get quality metrics over time
   */
  async getQualityMetricsHistory(hours: number = 24): Promise<QualityMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metricsHistory.filter(
      metric => new Date(metric.timestamp) >= cutoff
    );
  }

  /**
   * Get performance metrics over time
   */
  async getPerformanceMetricsHistory(hours: number = 24): Promise<PerformanceMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceHistory.filter(
      metric => new Date(metric.timestamp) >= cutoff
    );
  }

  /**
   * Create a manual alert
   */
  async createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
      metadata
    };

    this.alerts.set(alert.id, alert);
    
    // Send notifications
    await this.sendAlertNotification(alert);
    
    console.log(`Alert created: ${alert.id} - ${title}`);
    return alert.id;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    console.log(`Alert resolved: ${alertId}`);
    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts (active and resolved)
   */
  getAllAlerts(limit: number = 100): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Run a manual health check
   */
  async runHealthCheck(): Promise<SystemHealthStatus> {
    console.log('Running manual health check...');
    return await this.performHealthCheck();
  }

  /**
   * Run a manual quality check
   */
  async runQualityCheck(): Promise<QualityMetrics> {
    console.log('Running manual quality check...');
    return await this.performQualityCheck();
  }

  /**
   * Run a manual performance check
   */
  async runPerformanceCheck(): Promise<PerformanceMetrics> {
    console.log('Running manual performance check...');
    return await this.performPerformanceCheck();
  }

  // Private monitoring methods
  private startHealthMonitoring(intervalMinutes: number): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        await this.checkHealthThresholds(health);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, intervalMs);

    console.log(`Health monitoring started - checking every ${intervalMinutes} minutes`);
  }

  private startQualityMonitoring(intervalHours: number): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        const metrics = await this.performQualityCheck();
        this.metricsHistory.push(metrics);
        
        // Keep only last 7 days of data
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.metricsHistory = this.metricsHistory.filter(
          m => new Date(m.timestamp) >= weekAgo
        );
        
        await this.checkQualityThresholds(metrics);
      } catch (error) {
        console.error('Quality check failed:', error);
      }
    }, intervalMs);

    console.log(`Quality monitoring started - checking every ${intervalHours} hours`);
  }

  private startPerformanceMonitoring(intervalMinutes: number): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    setInterval(async () => {
      try {
        const metrics = await this.performPerformanceCheck();
        this.performanceHistory.push(metrics);
        
        // Keep only last 24 hours of performance data
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.performanceHistory = this.performanceHistory.filter(
          m => new Date(m.timestamp) >= dayAgo
        );
        
        await this.checkPerformanceThresholds(metrics);
      } catch (error) {
        console.error('Performance check failed:', error);
      }
    }, intervalMs);

    console.log(`Performance monitoring started - checking every ${intervalMinutes} minutes`);
  }

  private async performHealthCheck(): Promise<SystemHealthStatus> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    try {
      // Check API endpoints
      const apiHealth = await this.checkAPIHealth();
      if (!apiHealth.allHealthy) {
        issues.push(...apiHealth.issues);
        status = apiHealth.criticalIssues > 0 ? 'critical' : 'degraded';
      }

      // Check data pipeline
      const pipelineHealth = await this.checkDataPipelineHealth();
      if (!pipelineHealth.healthy) {
        issues.push('Data pipeline issues detected');
        status = status === 'critical' ? 'critical' : 'degraded';
      }

      // Check scheduler
      const schedulerHealth = await this.checkSchedulerHealth();
      if (!schedulerHealth.healthy) {
        issues.push('Update scheduler issues detected');
        status = status === 'critical' ? 'critical' : 'degraded';
      }

      return {
        status,
        uptime: await this.calculateUptime(),
        lastHealthCheck: new Date().toISOString(),
        issues
      };
    } catch (error) {
      return {
        status: 'critical',
        uptime: 0,
        lastHealthCheck: new Date().toISOString(),
        issues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  private async performQualityCheck(): Promise<QualityMetrics> {
    try {
      const qualityReport = await dataQualityService.generateQualityReport();
      
      return {
        overallScore: qualityReport.overallScore,
        dataCompleteness: this.calculateCompleteness(qualityReport),
        dataAccuracy: this.calculateAccuracy(qualityReport),
        dataFreshness: qualityReport.freshness.overallFreshness,
        contactValidation: qualityReport.contactValidation.verificationRate,
        crossReferenceValidation: this.calculateCrossRefValidation(qualityReport.discrepancies),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Quality check failed:', error);
      throw error;
    }
  }

  private async performPerformanceCheck(): Promise<PerformanceMetrics> {
    try {
      const response = await dataPipelineAPI.get('/api/system/metrics/performance');
      const metrics = await response.json();

      return {
        apiResponseTimes: {
          average: metrics.responseTime?.average || 0,
          p95: metrics.responseTime?.p95 || 0,
          p99: metrics.responseTime?.p99 || 0
        },
        cacheHitRate: metrics.cacheHitRate || 0,
        errorRate: metrics.errorRate || 0,
        throughput: metrics.throughput || 0,
        uptime: metrics.uptime || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Performance check failed:', error);
      // Return default metrics if check fails
      return {
        apiResponseTimes: { average: 0, p95: 0, p99: 0 },
        cacheHitRate: 0,
        errorRate: 100,
        throughput: 0,
        uptime: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async checkHealthThresholds(health: SystemHealthStatus): Promise<void> {
    if (health.status === 'critical') {
      await this.createAlert(
        'system',
        'critical',
        'System Critical',
        `System health is critical: ${health.issues.join(', ')}`,
        { health }
      );
    } else if (health.status === 'degraded') {
      await this.createAlert(
        'system',
        'high',
        'System Degraded',
        `System performance is degraded: ${health.issues.join(', ')}`,
        { health }
      );
    }
  }

  private async checkQualityThresholds(metrics: QualityMetrics): Promise<void> {
    if (metrics.overallScore < this.DEFAULT_CONFIG.alertThresholds.qualityScore) {
      await this.createAlert(
        'data_quality',
        metrics.overallScore < 70 ? 'critical' : 'high',
        'Data Quality Alert',
        `Overall data quality score has dropped to ${metrics.overallScore}%`,
        { metrics }
      );
    }

    if (metrics.dataFreshness < 85) {
      await this.createAlert(
        'data_quality',
        'medium',
        'Stale Data Alert',
        `Data freshness has dropped to ${metrics.dataFreshness}%`,
        { metrics }
      );
    }
  }

  private async checkPerformanceThresholds(metrics: PerformanceMetrics): Promise<void> {
    if (metrics.apiResponseTimes.average > this.DEFAULT_CONFIG.alertThresholds.responseTime) {
      await this.createAlert(
        'performance',
        'medium',
        'High Response Time Alert',
        `Average API response time is ${metrics.apiResponseTimes.average}ms`,
        { metrics }
      );
    }

    if (metrics.errorRate > this.DEFAULT_CONFIG.alertThresholds.errorRate) {
      await this.createAlert(
        'performance',
        'high',
        'High Error Rate Alert',
        `API error rate is ${metrics.errorRate}%`,
        { metrics }
      );
    }

    if (metrics.cacheHitRate < this.DEFAULT_CONFIG.alertThresholds.cacheHitRate) {
      await this.createAlert(
        'performance',
        'low',
        'Low Cache Hit Rate Alert',
        `Cache hit rate has dropped to ${metrics.cacheHitRate}%`,
        { metrics }
      );
    }
  }

  private async getCurrentQualityMetrics(): Promise<QualityMetrics> {
    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    if (latest && this.isRecentMetric(latest.timestamp, 4 * 60 * 60 * 1000)) {
      return latest;
    }
    return await this.performQualityCheck();
  }

  private async getCurrentPerformanceMetrics(): Promise<PerformanceMetrics> {
    const latest = this.performanceHistory[this.performanceHistory.length - 1];
    if (latest && this.isRecentMetric(latest.timestamp, 5 * 60 * 1000)) {
      return latest;
    }
    return await this.performPerformanceCheck();
  }

  private async getSystemHealth(): Promise<SystemHealthStatus> {
    return await this.performHealthCheck();
  }

  private async getDataSourceStatuses(): Promise<DataSourceStatus[]> {
    try {
      const response = await dataPipelineAPI.get('/api/system/data-sources');
      return await response.json();
    } catch {
      return [
        {
          name: 'Congress API',
          status: 'offline',
          lastSuccessfulUpdate: '1970-01-01T00:00:00Z',
          errorRate: 100,
          responseTime: 0
        }
      ];
    }
  }

  private async getRecentUpdates(): Promise<UpdateSummary[]> {
    try {
      const metrics = await dataUpdateScheduler.getUpdateMetrics();
      // Transform update metrics into summaries
      return []; // This would be populated by actual update history
    } catch {
      return [];
    }
  }

  private async checkAPIHealth(): Promise<{ allHealthy: boolean; issues: string[]; criticalIssues: number }> {
    const endpoints = [
      { name: 'Auth API', url: '/api/auth/health' },
      { name: 'Data Pipeline', url: '/api/health' },
      { name: 'AI Engine', url: '/api/ai/health' }
    ];

    const issues: string[] = [];
    let criticalIssues = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await dataPipelineAPI.get(endpoint.url);
        if (!response.ok) {
          issues.push(`${endpoint.name} is unhealthy`);
          criticalIssues++;
        }
      } catch {
        issues.push(`${endpoint.name} is unreachable`);
        criticalIssues++;
      }
    }

    return {
      allHealthy: issues.length === 0,
      issues,
      criticalIssues
    };
  }

  private async checkDataPipelineHealth(): Promise<{ healthy: boolean }> {
    try {
      const response = await dataPipelineAPI.get('/api/system/pipeline-health');
      const health = await response.json();
      return { healthy: health.status === 'healthy' };
    } catch {
      return { healthy: false };
    }
  }

  private async checkSchedulerHealth(): Promise<{ healthy: boolean }> {
    try {
      const metrics = await dataUpdateScheduler.getUpdateMetrics();
      return { healthy: metrics.successRate >= 80 };
    } catch {
      return { healthy: false };
    }
  }

  private async calculateUptime(): Promise<number> {
    try {
      const response = await dataPipelineAPI.get('/api/system/uptime');
      const data = await response.json();
      return data.uptime || 0;
    } catch {
      return 0;
    }
  }

  private calculateCompleteness(qualityReport: any): number {
    // Calculate based on missing fields in validation
    return 95; // Placeholder implementation
  }

  private calculateAccuracy(qualityReport: any): number {
    // Calculate based on validation errors
    return qualityReport.overallScore;
  }

  private calculateCrossRefValidation(discrepancies: any[]): number {
    const totalPossible = 100;
    const discrepancyPenalty = discrepancies.length * 2;
    return Math.max(0, totalPossible - discrepancyPenalty);
  }

  private isRecentMetric(timestamp: string, maxAgeMs: number): boolean {
    return Date.now() - new Date(timestamp).getTime() < maxAgeMs;
  }

  private async loadHistoricalMetrics(): Promise<void> {
    try {
      const response = await dataPipelineAPI.get('/api/system/metrics/history');
      const data = await response.json();
      
      this.metricsHistory = data.quality || [];
      this.performanceHistory = data.performance || [];
      
      console.log(`Loaded ${this.metricsHistory.length} quality metrics and ${this.performanceHistory.length} performance metrics`);
    } catch (error) {
      console.warn('Could not load historical metrics:', error instanceof Error ? error.message : String(error));
    }
  }

  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      await dataPipelineAPI.post('/api/system/alerts/notify', alert);
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }
}

export const dataMonitoringService = new DataMonitoringService();
export default dataMonitoringService;