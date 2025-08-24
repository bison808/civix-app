/**
 * LegiScan API Monitor - Agent Casey Implementation
 * CRITICAL: 30,000 monthly quota management and quality tracking
 * 
 * Features:
 * - Real-time quota tracking and alerting
 * - Request quality monitoring
 * - Automatic rate limiting
 * - Data quality validation
 * - Performance optimization recommendations
 * - Emergency quota protection
 */

import { performanceMonitor } from '@/utils/performanceMonitor';

export interface LegiScanQuotaStatus {
  monthlyLimit: 30000;
  currentUsage: number;
  dailyUsage: number;
  projectedMonthlyUsage: number;
  quotaPercentage: number;
  daysUntilReset: number;
  rateStatus: 'normal' | 'throttled' | 'critical' | 'blocked';
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface LegiScanRequestMetric {
  endpoint: string;
  timestamp: string;
  responseTime: number;
  status: number;
  dataQuality: number; // 0-100 score
  cached: boolean;
  quotaUsed: number;
  error?: string;
  retryCount?: number;
}

export interface LegiScanQualityMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  averageDataQuality: number;
  cacheHitRate: number;
  errorBreakdown: Record<string, number>;
  topEndpoints: Array<{ endpoint: string; count: number; avgTime: number }>;
  qualityTrends: {
    improving: boolean;
    stable: boolean;
    declining: boolean;
  };
}

export class LegiScanMonitor {
  private quotaTracking = {
    monthlyLimit: 30000,
    currentUsage: 0,
    dailyUsage: new Map<string, number>(),
    hourlyUsage: new Map<string, number>(),
    resetDate: new Date()
  };

  private requestMetrics: LegiScanRequestMetric[] = [];
  private qualityThresholds = {
    minDataQuality: 85,
    maxResponseTime: 5000,
    maxErrorRate: 0.05,
    quotaWarningPercent: 70,
    quotaCriticalPercent: 90,
    quotaEmergencyPercent: 95
  };

  private rateLimitingEnabled = false;
  private isMonitoring = false;
  private monitoringStartTime = 0;

  constructor() {
    this.initializeQuotaTracking();
    this.startMonitoring();
  }

  // =============================================================================
  // QUOTA MANAGEMENT - CRITICAL FOR 30K LIMIT
  // =============================================================================

  async trackRequest(
    endpoint: string,
    quotaUsed: number = 1,
    metadata: {
      responseTime?: number;
      status?: number;
      dataQuality?: number;
      cached?: boolean;
      error?: string;
      retryCount?: number;
    } = {}
  ): Promise<{ allowed: boolean; reason?: string }> {
    
    // Check if request should be blocked due to quota
    const quotaCheck = this.checkQuotaAllowance(quotaUsed);
    if (!quotaCheck.allowed) {
      return quotaCheck;
    }

    // Record the request
    const timestamp = new Date().toISOString();
    const today = timestamp.split('T')[0];
    const hour = new Date().getHours();
    const hourKey = `${today}-${hour}`;

    // Update quota tracking
    this.quotaTracking.currentUsage += quotaUsed;
    this.quotaTracking.dailyUsage.set(today, 
      (this.quotaTracking.dailyUsage.get(today) || 0) + quotaUsed);
    this.quotaTracking.hourlyUsage.set(hourKey,
      (this.quotaTracking.hourlyUsage.get(hourKey) || 0) + quotaUsed);

    // Record detailed metrics
    const requestMetric: LegiScanRequestMetric = {
      endpoint,
      timestamp,
      responseTime: metadata.responseTime || 0,
      status: metadata.status || 200,
      dataQuality: metadata.dataQuality || 100,
      cached: metadata.cached || false,
      quotaUsed,
      error: metadata.error,
      retryCount: metadata.retryCount || 0
    };

    this.requestMetrics.push(requestMetric);

    // Keep only recent metrics (last 7 days or 1000 requests)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.requestMetrics = this.requestMetrics
      .filter(m => new Date(m.timestamp).getTime() > sevenDaysAgo)
      .slice(-1000);

    // Check for alerts after recording
    await this.checkQuotaAlerts();

    // Performance tracking
    performanceMonitor.recordMetric('legiscan_api_request', quotaUsed, {
      endpoint,
      quotaPercentage: this.getQuotaPercentage(),
      responseTime: metadata.responseTime,
      dataQuality: metadata.dataQuality,
      cached: metadata.cached
    });

    return { allowed: true };
  }

  getQuotaStatus(): LegiScanQuotaStatus {
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = this.quotaTracking.dailyUsage.get(today) || 0;
    const quotaPercentage = (this.quotaTracking.currentUsage / this.quotaTracking.monthlyLimit) * 100;
    
    // Calculate projected usage based on current daily rate
    const dayOfMonth = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const projectedMonthlyUsage = Math.round((this.quotaTracking.currentUsage / dayOfMonth) * daysInMonth);
    
    const daysUntilReset = Math.ceil(
      (this.quotaTracking.resetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    // Determine rate status and alert level
    let rateStatus: LegiScanQuotaStatus['rateStatus'] = 'normal';
    let alertLevel: LegiScanQuotaStatus['alertLevel'] = 'low';

    if (quotaPercentage >= this.qualityThresholds.quotaEmergencyPercent) {
      rateStatus = 'blocked';
      alertLevel = 'critical';
    } else if (quotaPercentage >= this.qualityThresholds.quotaCriticalPercent) {
      rateStatus = 'critical';
      alertLevel = 'critical';
    } else if (quotaPercentage >= this.qualityThresholds.quotaWarningPercent) {
      rateStatus = 'throttled';
      alertLevel = quotaPercentage >= 85 ? 'high' : 'medium';
    }

    return {
      monthlyLimit: this.quotaTracking.monthlyLimit,
      currentUsage: this.quotaTracking.currentUsage,
      dailyUsage,
      projectedMonthlyUsage,
      quotaPercentage,
      daysUntilReset,
      rateStatus,
      alertLevel
    };
  }

  // =============================================================================
  // DATA QUALITY MONITORING
  // =============================================================================

  async validateResponseQuality(
    endpoint: string,
    response: any,
    responseTime: number
  ): Promise<{ quality: number; issues: string[] }> {
    const issues: string[] = [];
    let qualityScore = 100;

    // Response time validation
    if (responseTime > this.qualityThresholds.maxResponseTime) {
      qualityScore -= 20;
      issues.push(`Slow response: ${responseTime}ms (threshold: ${this.qualityThresholds.maxResponseTime}ms)`);
    }

    // Data completeness validation
    if (!response) {
      qualityScore -= 50;
      issues.push('Empty response received');
      return { quality: qualityScore, issues };
    }

    // LegiScan specific validations
    if (endpoint.includes('getMasterList')) {
      if (!response.masterlist || Object.keys(response.masterlist).length === 0) {
        qualityScore -= 30;
        issues.push('Empty masterlist in getMasterList response');
      }
    } else if (endpoint.includes('getBill')) {
      if (!response.bill || !response.bill.title) {
        qualityScore -= 25;
        issues.push('Missing bill title in getBill response');
      }
      if (!response.bill.description) {
        qualityScore -= 15;
        issues.push('Missing bill description');
      }
    } else if (endpoint.includes('getSession')) {
      if (!response.sessions || response.sessions.length === 0) {
        qualityScore -= 30;
        issues.push('Empty sessions array in getSession response');
      }
    }

    // API status validation
    if (response.status && response.status !== 'OK') {
      qualityScore -= 40;
      issues.push(`API returned error status: ${response.status}`);
    }

    // Data freshness validation (if timestamp available)
    if (response.timestamp) {
      const dataAge = Date.now() - new Date(response.timestamp).getTime();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (dataAge > maxAge) {
        qualityScore -= 10;
        issues.push('Data appears stale (>30 days old)');
      }
    }

    return {
      quality: Math.max(0, qualityScore),
      issues
    };
  }

  getQualityMetrics(): LegiScanQualityMetrics {
    const recentMetrics = this.requestMetrics.filter(
      m => new Date(m.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        averageDataQuality: 0,
        cacheHitRate: 0,
        errorBreakdown: {},
        topEndpoints: [],
        qualityTrends: { improving: false, stable: true, declining: false }
      };
    }

    const successfulRequests = recentMetrics.filter(m => m.status >= 200 && m.status < 300);
    const cachedRequests = recentMetrics.filter(m => m.cached);
    
    // Calculate endpoint statistics
    const endpointStats = new Map<string, { count: number; totalTime: number; totalQuality: number }>();
    
    recentMetrics.forEach(metric => {
      const stats = endpointStats.get(metric.endpoint) || { count: 0, totalTime: 0, totalQuality: 0 };
      stats.count++;
      stats.totalTime += metric.responseTime;
      stats.totalQuality += metric.dataQuality;
      endpointStats.set(metric.endpoint, stats);
    });

    const topEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgTime: Math.round(stats.totalTime / stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate error breakdown
    const errorBreakdown: Record<string, number> = {};
    recentMetrics.filter(m => m.error).forEach(m => {
      const errorKey = m.error || 'unknown';
      errorBreakdown[errorKey] = (errorBreakdown[errorKey] || 0) + 1;
    });

    // Calculate quality trends (compare last 12h vs previous 12h)
    const last12h = recentMetrics.filter(m => 
      new Date(m.timestamp).getTime() > Date.now() - 12 * 60 * 60 * 1000
    );
    const prev12h = recentMetrics.filter(m => {
      const time = new Date(m.timestamp).getTime();
      return time <= Date.now() - 12 * 60 * 60 * 1000 && 
             time > Date.now() - 24 * 60 * 60 * 1000;
    });

    const last12hQuality = last12h.reduce((sum, m) => sum + m.dataQuality, 0) / (last12h.length || 1);
    const prev12hQuality = prev12h.reduce((sum, m) => sum + m.dataQuality, 0) / (prev12h.length || 1);
    
    const qualityDiff = last12hQuality - prev12hQuality;
    const qualityTrends = {
      improving: qualityDiff > 5,
      stable: Math.abs(qualityDiff) <= 5,
      declining: qualityDiff < -5
    };

    return {
      totalRequests: recentMetrics.length,
      successRate: successfulRequests.length / recentMetrics.length,
      averageResponseTime: Math.round(recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length),
      averageDataQuality: Math.round(recentMetrics.reduce((sum, m) => sum + m.dataQuality, 0) / recentMetrics.length),
      cacheHitRate: cachedRequests.length / recentMetrics.length,
      errorBreakdown,
      topEndpoints,
      qualityTrends
    };
  }

  // =============================================================================
  // RATE LIMITING AND QUOTA PROTECTION
  // =============================================================================

  private checkQuotaAllowance(requestedQuota: number): { allowed: boolean; reason?: string } {
    const quotaStatus = this.getQuotaStatus();
    
    // Block if we're in emergency mode (95%+)
    if (quotaStatus.quotaPercentage >= this.qualityThresholds.quotaEmergencyPercent) {
      return {
        allowed: false,
        reason: `Emergency quota protection: ${quotaStatus.quotaPercentage.toFixed(1)}% used`
      };
    }

    // Check if this request would push us over the limit
    if (this.quotaTracking.currentUsage + requestedQuota > this.quotaTracking.monthlyLimit) {
      return {
        allowed: false,
        reason: 'Request would exceed monthly quota limit'
      };
    }

    // Throttle if in critical mode (90%+)
    if (quotaStatus.quotaPercentage >= this.qualityThresholds.quotaCriticalPercent) {
      const hourlyUsage = this.getHourlyUsage();
      const maxHourlyAllowed = Math.floor((this.quotaTracking.monthlyLimit * 0.05) / 24); // 5% per day max
      
      if (hourlyUsage >= maxHourlyAllowed) {
        return {
          allowed: false,
          reason: `Hourly rate limit exceeded in critical mode: ${hourlyUsage}/${maxHourlyAllowed}`
        };
      }
    }

    return { allowed: true };
  }

  private async checkQuotaAlerts(): Promise<void> {
    const status = this.getQuotaStatus();
    
    // Critical alert at 95%
    if (status.alertLevel === 'critical') {
      await this.sendQuotaAlert('CRITICAL', 
        `LegiScan quota at ${status.quotaPercentage.toFixed(1)}% - Emergency mode active`,
        [
          'All non-essential requests blocked',
          'Consider upgrading to paid tier immediately',
          'Review quota usage patterns',
          'Enable maximum caching strategies'
        ]
      );
    }
    // High alert at 85%+
    else if (status.alertLevel === 'high') {
      await this.sendQuotaAlert('HIGH',
        `LegiScan quota at ${status.quotaPercentage.toFixed(1)}% - Critical threshold reached`,
        [
          'Implement aggressive caching',
          'Rate limiting now active',
          'Review high-usage endpoints',
          'Prepare for potential upgrade'
        ]
      );
    }
    // Medium alert at 70%+
    else if (status.alertLevel === 'medium') {
      await this.sendQuotaAlert('MEDIUM',
        `LegiScan quota at ${status.quotaPercentage.toFixed(1)}% - Warning threshold`,
        [
          'Monitor usage closely',
          'Enable enhanced caching',
          'Optimize API call patterns'
        ]
      );
    }
  }

  private async sendQuotaAlert(
    level: string,
    message: string,
    recommendations: string[]
  ): Promise<void> {
    console.log(`🚨 LegiScan Quota Alert [${level}]: ${message}`);
    recommendations.forEach(rec => console.log(`  - ${rec}`));

    // In production, this would send notifications via email, Slack, etc.
    // For now, we'll just log and track the alert
    performanceMonitor.recordMetric('legiscan_quota_alert', 1, {
      level,
      message,
      quotaPercentage: this.getQuotaPercentage(),
      timestamp: new Date().toISOString()
    });
  }

  // =============================================================================
  // OPTIMIZATION RECOMMENDATIONS
  // =============================================================================

  generateOptimizationRecommendations(): {
    priority: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const quotaStatus = this.getQuotaStatus();
    const qualityMetrics = this.getQualityMetrics();
    
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Quota-based recommendations
    if (quotaStatus.quotaPercentage >= 95) {
      priority = 'critical';
      recommendations.push('🚨 EMERGENCY: Stop all non-essential LegiScan requests');
      recommendations.push('🚨 EMERGENCY: Upgrade to paid tier immediately');
      recommendations.push('🚨 EMERGENCY: Enable maximum cache TTL (24 hours)');
    } else if (quotaStatus.quotaPercentage >= 85) {
      priority = 'high';
      recommendations.push('🔥 Enable aggressive response caching');
      recommendations.push('🔥 Implement request batching where possible');
      recommendations.push('🔥 Consider upgrading to paid tier');
    } else if (quotaStatus.quotaPercentage >= 70) {
      priority = 'medium';
      recommendations.push('⚠️ Increase cache TTL for static data');
      recommendations.push('⚠️ Review and optimize high-frequency endpoints');
    }

    // Performance-based recommendations
    if (qualityMetrics.averageResponseTime > 3000) {
      priority = Math.max(priority, 'medium') as any;
      recommendations.push('🐌 LegiScan response times are slow - implement timeout handling');
    }

    if (qualityMetrics.successRate < 0.95) {
      priority = Math.max(priority, 'medium') as any;
      recommendations.push('❌ High error rate detected - implement better error handling');
    }

    if (qualityMetrics.cacheHitRate < 0.5) {
      recommendations.push('📦 Low cache hit rate - review caching strategy');
    }

    // Data quality recommendations
    if (qualityMetrics.averageDataQuality < this.qualityThresholds.minDataQuality) {
      recommendations.push('📊 Data quality issues detected - review validation logic');
    }

    // Endpoint optimization
    const topEndpoint = qualityMetrics.topEndpoints[0];
    if (topEndpoint && topEndpoint.count > qualityMetrics.totalRequests * 0.3) {
      recommendations.push(`🎯 ${topEndpoint.endpoint} accounts for ${Math.round(topEndpoint.count / qualityMetrics.totalRequests * 100)}% of requests - consider optimization`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ LegiScan usage is optimized - continue monitoring');
    }

    return { priority, recommendations };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private initializeQuotaTracking(): void {
    // Set reset date to first of next month
    const now = new Date();
    this.quotaTracking.resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Clean up old data
    this.cleanupOldTrackingData();
  }

  private cleanupOldTrackingData(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Clean daily usage data
    for (const [date] of this.quotaTracking.dailyUsage.entries()) {
      if (date < sevenDaysAgo) {
        this.quotaTracking.dailyUsage.delete(date);
      }
    }
    
    // Clean hourly usage data (keep last 48 hours)
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    for (const [hourKey] of this.quotaTracking.hourlyUsage.entries()) {
      const [date, hour] = hourKey.split('-');
      const hourTime = new Date(date).getTime() + parseInt(hour) * 60 * 60 * 1000;
      if (hourTime < fortyEightHoursAgo) {
        this.quotaTracking.hourlyUsage.delete(hourKey);
      }
    }
  }

  private getQuotaPercentage(): number {
    return (this.quotaTracking.currentUsage / this.quotaTracking.monthlyLimit) * 100;
  }

  private getHourlyUsage(): number {
    const now = new Date();
    const hourKey = `${now.toISOString().split('T')[0]}-${now.getHours()}`;
    return this.quotaTracking.hourlyUsage.get(hourKey) || 0;
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringStartTime = Date.now();
    
    // Periodic cleanup and monitoring
    setInterval(() => {
      this.cleanupOldTrackingData();
    }, 60 * 60 * 1000); // Every hour

    console.log('✅ LegiScan monitoring started');
  }

  // Public API methods
  getMetrics() {
    return {
      quota: this.getQuotaStatus(),
      quality: this.getQualityMetrics(),
      recommendations: this.generateOptimizationRecommendations(),
      uptime: Date.now() - this.monitoringStartTime
    };
  }

  async resetMonthlyQuota(): Promise<void> {
    // This would typically be called automatically on the first of each month
    this.quotaTracking.currentUsage = 0;
    this.quotaTracking.dailyUsage.clear();
    this.quotaTracking.hourlyUsage.clear();
    
    const now = new Date();
    this.quotaTracking.resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    console.log('✅ LegiScan monthly quota reset');
  }
}

// Export singleton instance
export const legiScanMonitor = new LegiScanMonitor();
export default LegiScanMonitor;