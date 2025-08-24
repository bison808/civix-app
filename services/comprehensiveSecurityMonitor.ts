/**
 * Comprehensive Security Monitor - Agent Casey Implementation
 * Enterprise-grade security monitoring for CITZN democratic engagement platform
 * 
 * Integrates with:
 * - Tom's Authentication System (authApi.ts)
 * - Morgan's Vercel Postgres Database
 * - Mike's LegiScan API Client
 * - Existing performance monitoring infrastructure
 */

import { 
  SecurityMonitor,
  SecurityDashboard,
  DetailedSecurityEvent,
  SecurityAlert,
  ThreatIntelligence,
  SecurityMetrics,
  SecurityMonitorConfig
} from '@/lib/integrations/securityMonitor';
import { 
  SecurityEvent, 
  SuspiciousActivity, 
  SecureUser,
  SessionInfo
} from '@/lib/enhancedUserStore';
import { VercelPostgresDatabaseAdapter } from '@/lib/database/vercelPostgresAdapter';
import { apiMonitor } from '@/lib/api-monitor';
import { performanceMonitor } from '@/utils/performanceMonitor';

// Security Risk Scoring Constants
const RISK_FACTORS = {
  FAILED_LOGIN: 15,
  SUSPICIOUS_IP: 25,
  GEOGRAPHIC_ANOMALY: 20,
  TIME_ANOMALY: 15,
  BRUTE_FORCE: 40,
  MULTIPLE_ACCOUNTS: 30,
  API_ABUSE: 35,
  LEGISCAN_QUOTA_ABUSE: 50
};

const THREAT_LEVELS = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
  CRITICAL: 1.0
};

export class ComprehensiveSecurityMonitor implements SecurityMonitor, SecurityDashboard {
  private config: SecurityMonitorConfig;
  private dbAdapter: VercelPostgresDatabaseAdapter;
  private activeAlerts: Map<string, SecurityAlert> = new Map();
  private threatIntelCache: Map<string, ThreatIntelligence> = new Map();
  private isMonitoring: boolean = false;
  private monitoringStartTime: number = 0;
  private eventsProcessed: number = 0;
  private processingErrors: number = 0;
  
  // Rate limiting for LegiScan API monitoring
  private legiScanQuotaTracking = {
    monthlyLimit: 30000,
    currentUsage: 0,
    dailyUsage: new Map<string, number>(), // date -> usage count
    hourlyUsage: new Map<string, number>(), // hour -> usage count
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  };

  constructor(
    config: SecurityMonitorConfig,
    dbAdapter: VercelPostgresDatabaseAdapter
  ) {
    this.config = config;
    this.dbAdapter = dbAdapter;
    this.initializeQuotaTracking();
  }

  // =============================================================================
  // CORE SECURITY MONITORING METHODS
  // =============================================================================

  async processSecurityEvent(event: SecurityEvent, context?: any): Promise<DetailedSecurityEvent> {
    const startTime = Date.now();
    
    try {
      // Calculate risk score for the event
      const riskScore = await this.calculateRiskScore(event, context);
      
      // Determine severity based on risk score and event type
      const severity = this.determineSeverity(riskScore, event.type);
      
      // Enhance event with context and analysis
      const detailedEvent: DetailedSecurityEvent = {
        ...event,
        severity,
        riskScore,
        context: await this.enrichEventContext(event, context)
      };

      // Log the detailed event to database
      await this.logSecurityEvent(detailedEvent);
      
      // Check if this event should trigger an alert
      if (severity === 'high' || severity === 'critical') {
        await this.evaluateForAlert(detailedEvent);
      }

      // Track API usage if this is an API-related event
      if (event.type === 'api_request' && context?.endpoint?.includes('legiscan')) {
        await this.trackLegiScanUsage(1);
      }

      this.eventsProcessed++;
      
      // Performance tracking
      performanceMonitor.recordMetric('security_event_processing', Date.now() - startTime, {
        eventType: event.type,
        severity,
        riskScore
      });

      return detailedEvent;
      
    } catch (error) {
      this.processingErrors++;
      console.error('Failed to process security event:', error);
      
      // Return basic enhanced event even if processing fails
      return {
        ...event,
        severity: 'medium',
        riskScore: 50,
        context: { processingError: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async analyzeEventSequence(events: SecurityEvent[]): Promise<{ riskScore: number; patterns: string[] }> {
    const patterns: string[] = [];
    let totalRisk = 0;
    
    if (events.length === 0) return { riskScore: 0, patterns: [] };
    
    // Analyze temporal patterns
    const timeSpans = events.slice(1).map((event, i) => 
      new Date(event.timestamp).getTime() - new Date(events[i].timestamp).getTime()
    );
    
    const avgTimeSpan = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;
    
    // Detect rapid-fire attempts (potential automation)
    if (avgTimeSpan < 5000) { // Less than 5 seconds between attempts
      patterns.push('rapid_sequence');
      totalRisk += RISK_FACTORS.BRUTE_FORCE;
    }
    
    // Analyze IP diversity
    const uniqueIPs = new Set(events.map(e => e.ipAddress).filter(Boolean));
    if (uniqueIPs.size > 1) {
      patterns.push('multiple_ips');
      totalRisk += RISK_FACTORS.SUSPICIOUS_IP * (uniqueIPs.size - 1);
    }
    
    // Analyze failure patterns
    const loginEvents = events.filter(e => e.type === 'login_failed');
    if (loginEvents.length > 5) {
      patterns.push('brute_force_login');
      totalRisk += RISK_FACTORS.BRUTE_FORCE;
    }
    
    // Analyze geographic diversity
    const geoLocations = events
      .map(e => e.details?.geolocation)
      .filter(Boolean)
      .filter((geo, i, arr) => arr.findIndex(g => g?.country === geo?.country) === i);
    
    if (geoLocations.length > 2) {
      patterns.push('geographic_spread');
      totalRisk += RISK_FACTORS.GEOGRAPHIC_ANOMALY * geoLocations.length;
    }
    
    // Time-based anomaly detection
    const hours = events.map(e => new Date(e.timestamp).getHours());
    const uniqueHours = new Set(hours);
    if (uniqueHours.size > 12 && events.length > 10) {
      patterns.push('continuous_activity');
      totalRisk += RISK_FACTORS.TIME_ANOMALY;
    }
    
    const riskScore = Math.min(100, totalRisk / events.length);
    return { riskScore, patterns };
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    console.log('🛡️ Starting comprehensive security monitoring...');
    this.isMonitoring = true;
    this.monitoringStartTime = Date.now();
    
    // Start periodic tasks
    this.startThreatIntelligenceUpdates();
    this.startQuotaMonitoring();
    this.startPerformanceTracking();
    this.startAlertManagement();
    
    console.log('✅ Real-time security monitoring active');
  }

  async stopRealTimeMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;
    
    console.log('🛡️ Stopping security monitoring...');
    this.isMonitoring = false;
    
    console.log('✅ Security monitoring stopped');
  }

  async getMonitoringStatus(): Promise<{ active: boolean; uptime: number; eventsProcessed: number }> {
    const uptime = this.isMonitoring ? Date.now() - this.monitoringStartTime : 0;
    return {
      active: this.isMonitoring,
      uptime,
      eventsProcessed: this.eventsProcessed
    };
  }

  // =============================================================================
  // THREAT DETECTION AND ANALYSIS
  // =============================================================================

  async detectAnomalies(user: SecureUser, context: any): Promise<SuspiciousActivity[]> {
    const anomalies: SuspiciousActivity[] = [];
    const now = new Date().toISOString();
    
    // Geographic anomaly detection
    if (context.ipAddress && context.geolocation) {
      const recentLogins = await this.dbAdapter.getSecurityEvents(user.email, 10);
      const recentGeoEvents = recentLogins
        .filter(e => e.details?.geolocation)
        .slice(0, 5); // Last 5 geo events
      
      if (recentGeoEvents.length > 0) {
        const lastLocation = recentGeoEvents[0].details?.geolocation;
        if (lastLocation && context.geolocation.coordinates && lastLocation.coordinates) {
          const distance = this.calculateDistance(
            lastLocation.coordinates,
            context.geolocation.coordinates
          );
          
          if (distance > this.config.alertThresholds.geographicAnomalyDistance) {
            anomalies.push({
              type: 'geographic_anomaly',
              severity: distance > 5000 ? 'high' : 'medium',
              timestamp: now,
              details: `Login from ${context.geolocation.city}, ${context.geolocation.country} - ${Math.round(distance)}km from last location`,
              ipAddress: context.ipAddress
            });
          }
        }
      }
    }
    
    // Time-based anomaly detection
    const currentHour = new Date().getHours();
    const recentLoginTimes = await this.getUserLoginPattern(user.email);
    const normalHours = recentLoginTimes.filter(h => Math.abs(h - currentHour) <= 2);
    
    if (normalHours.length === 0 && recentLoginTimes.length > 5) {
      anomalies.push({
        type: 'time_anomaly',
        severity: 'medium',
        timestamp: now,
        details: `Login at unusual time: ${currentHour}:00 (normal pattern: ${recentLoginTimes.join(', ')})`,
        ipAddress: context.ipAddress
      });
    }
    
    // Device anomaly detection
    if (context.userAgent) {
      const deviceFingerprint = this.generateDeviceFingerprint(context.userAgent, context.deviceInfo);
      const knownDevices = user.activeSessions?.map(s => 
        this.generateDeviceFingerprint(s.userAgent, s.deviceInfo)
      ) || [];
      
      if (!knownDevices.includes(deviceFingerprint)) {
        anomalies.push({
          type: 'device_anomaly',
          severity: 'medium',
          timestamp: now,
          details: `Login from new device: ${this.extractDeviceInfo(context.userAgent)}`,
          ipAddress: context.ipAddress
        });
      }
    }
    
    // API usage anomaly detection
    if (context.endpoint?.includes('legiscan')) {
      const hourlyUsage = this.legiScanQuotaTracking.hourlyUsage;
      const currentHourKey = `${new Date().getHours()}`;
      const currentHourUsage = hourlyUsage.get(currentHourKey) || 0;
      
      if (currentHourUsage > 100) { // Suspicious high usage per hour
        anomalies.push({
          type: 'api_abuse',
          severity: 'high',
          timestamp: now,
          details: `Excessive LegiScan API usage: ${currentHourUsage} requests this hour`,
          ipAddress: context.ipAddress
        });
      }
    }
    
    return anomalies;
  }

  async analyzeBehaviorPattern(email: string, timeWindow: number): Promise<{ normal: boolean; anomalies: string[] }> {
    const windowStart = new Date(Date.now() - timeWindow).toISOString();
    const events = await this.dbAdapter.getSecurityEventsByTimeRange(windowStart, new Date().toISOString());
    const userEvents = events.filter(e => e.details?.email === email);
    
    const anomalies: string[] = [];
    
    if (userEvents.length === 0) {
      return { normal: true, anomalies: [] };
    }
    
    // Analyze login frequency
    const loginEvents = userEvents.filter(e => e.type === 'login_attempt' || e.type === 'login_success');
    const avgLoginsPerHour = loginEvents.length / (timeWindow / (60 * 60 * 1000));
    
    if (avgLoginsPerHour > 5) {
      anomalies.push('high_login_frequency');
    }
    
    // Analyze failure rate
    const failedLogins = userEvents.filter(e => e.type === 'login_failed').length;
    const successfulLogins = userEvents.filter(e => e.type === 'login_success').length;
    const failureRate = failedLogins / (failedLogins + successfulLogins || 1);
    
    if (failureRate > 0.3) {
      anomalies.push('high_failure_rate');
    }
    
    // Analyze IP diversity
    const uniqueIPs = new Set(userEvents.map(e => e.ipAddress).filter(Boolean));
    if (uniqueIPs.size > 3) {
      anomalies.push('multiple_ip_usage');
    }
    
    return {
      normal: anomalies.length === 0,
      anomalies
    };
  }

  async checkThreatIntelligence(ipAddress: string): Promise<ThreatIntelligence | null> {
    // Check cache first
    const cached = this.threatIntelCache.get(ipAddress);
    if (cached && Date.now() - new Date(cached.lastSeen).getTime() < 60 * 60 * 1000) {
      return cached;
    }
    
    try {
      // In production, integrate with threat intelligence providers
      // For now, implement basic threat detection
      const threat = await this.basicThreatCheck(ipAddress);
      
      if (threat) {
        this.threatIntelCache.set(ipAddress, threat);
      }
      
      return threat;
      
    } catch (error) {
      console.error('Threat intelligence check failed:', error);
      return null;
    }
  }

  // =============================================================================
  // RISK ASSESSMENT
  // =============================================================================

  async calculateRiskScore(event: SecurityEvent, context?: any): Promise<number> {
    let riskScore = 0;
    
    // Base risk by event type
    const baseRisks: Record<string, number> = {
      'login_failed': 15,
      'login_success': 5,
      'password_reset': 10,
      'account_locked': 30,
      'session_hijack': 80,
      'api_abuse': 40,
      'suspicious_activity': 25,
      'data_breach': 90,
      'unauthorized_access': 70
    };
    
    riskScore += baseRisks[event.type] || 10;
    
    // IP-based risk assessment
    if (event.ipAddress) {
      const threatInfo = await this.checkThreatIntelligence(event.ipAddress);
      if (threatInfo) {
        riskScore += threatInfo.threatLevel === 'critical' ? 40 :
                     threatInfo.threatLevel === 'high' ? 30 :
                     threatInfo.threatLevel === 'medium' ? 20 : 10;
      }
    }
    
    // Geographic risk (high risk countries)
    if (context?.geolocation?.country) {
      const highRiskCountries = ['CN', 'RU', 'KP', 'IR', 'XX']; // Including unknown
      if (highRiskCountries.includes(context.geolocation.country)) {
        riskScore += 25;
      }
    }
    
    // Time-based risk (unusual hours)
    const hour = new Date(event.timestamp).getHours();
    if (hour < 6 || hour > 22) { // Outside normal hours
      riskScore += 10;
    }
    
    // User history risk
    if (context?.userHistory) {
      const recentFailures = context.userHistory.recentFailures || 0;
      riskScore += Math.min(recentFailures * 5, 30);
    }
    
    // LegiScan quota abuse risk
    if (context?.endpoint?.includes('legiscan')) {
      const dailyUsage = this.getDailyLegiScanUsage();
      const quotaPercentage = dailyUsage / (this.legiScanQuotaTracking.monthlyLimit / 30);
      
      if (quotaPercentage > 0.8) {
        riskScore += 30; // High risk if approaching daily quota
      } else if (quotaPercentage > 0.5) {
        riskScore += 15;
      }
    }
    
    return Math.min(100, riskScore);
  }

  async assessAccountRisk(email: string): Promise<{ riskScore: number; factors: string[] }> {
    const factors: string[] = [];
    let riskScore = 0;
    
    try {
      const user = await this.dbAdapter.getUser(email);
      if (!user) {
        return { riskScore: 0, factors: ['account_not_found'] };
      }
      
      // Failed login attempts
      if (user.failedLoginAttempts > 0) {
        factors.push(`${user.failedLoginAttempts} failed login attempts`);
        riskScore += user.failedLoginAttempts * 10;
      }
      
      // Account locked
      if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        factors.push('account_currently_locked');
        riskScore += 40;
      }
      
      // Recent suspicious activity
      const suspiciousActivity = user.suspiciousActivity || [];
      const recentSuspicious = suspiciousActivity.filter(
        activity => new Date(activity.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );
      
      if (recentSuspicious.length > 0) {
        factors.push(`${recentSuspicious.length} suspicious activities in 24h`);
        riskScore += recentSuspicious.length * 15;
      }
      
      // Multiple active sessions from different IPs
      const activeSessions = user.activeSessions || [];
      const uniqueIPs = new Set(activeSessions.map(s => s.ipAddress).filter(Boolean));
      
      if (uniqueIPs.size > 3) {
        factors.push(`${uniqueIPs.size} different IP addresses`);
        riskScore += (uniqueIPs.size - 3) * 10;
      }
      
      // Old account with no recent activity
      if (user.lastLoginAt) {
        const daysSinceLogin = (Date.now() - new Date(user.lastLoginAt).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceLogin > 90) {
          factors.push('inactive_account');
          riskScore += 20;
        }
      }
      
      return {
        riskScore: Math.min(100, riskScore),
        factors
      };
      
    } catch (error) {
      console.error('Failed to assess account risk:', error);
      return {
        riskScore: 50, // Default medium risk on error
        factors: ['assessment_error']
      };
    }
  }

  async identifyHighRiskAccounts(threshold: number = 70): Promise<{ email: string; riskScore: number }[]> {
    const highRiskAccounts: { email: string; riskScore: number }[] = [];
    
    try {
      // Get accounts with recent suspicious activity
      const recentActivities = await this.dbAdapter.getSuspiciousActivity(7 * 24 * 60 * 60 * 1000); // Last 7 days
      const suspiciousEmails = new Set(
        recentActivities
          .filter(activity => activity.severity === 'high' || activity.severity === 'critical')
          .map(activity => activity.details?.email)
          .filter(Boolean)
      );
      
      // Assess risk for each suspicious account
      for (const email of suspiciousEmails) {
        const risk = await this.assessAccountRisk(email);
        if (risk.riskScore >= threshold) {
          highRiskAccounts.push({ email, riskScore: risk.riskScore });
        }
      }
      
      return highRiskAccounts.sort((a, b) => b.riskScore - a.riskScore);
      
    } catch (error) {
      console.error('Failed to identify high-risk accounts:', error);
      return [];
    }
  }

  // =============================================================================
  // LEGISCAN API MONITORING (CRITICAL - 30K MONTHLY LIMIT)
  // =============================================================================

  async trackLegiScanUsage(requestCount: number = 1): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    const hourKey = `${today}-${currentHour}`;
    
    // Update counters
    this.legiScanQuotaTracking.currentUsage += requestCount;
    this.legiScanQuotaTracking.dailyUsage.set(today, 
      (this.legiScanQuotaTracking.dailyUsage.get(today) || 0) + requestCount);
    this.legiScanQuotaTracking.hourlyUsage.set(hourKey,
      (this.legiScanQuotaTracking.hourlyUsage.get(hourKey) || 0) + requestCount);
    
    // Check for quota alerts
    await this.checkLegiScanQuotaAlerts();
    
    // Performance tracking
    performanceMonitor.recordMetric('legiscan_api_usage', requestCount, {
      monthlyUsage: this.legiScanQuotaTracking.currentUsage,
      dailyUsage: this.legiScanQuotaTracking.dailyUsage.get(today) || 0,
      quotaPercentage: (this.legiScanQuotaTracking.currentUsage / this.legiScanQuotaTracking.monthlyLimit) * 100
    });
  }

  async getLegiScanUsageMetrics(): Promise<{
    monthlyUsage: number;
    monthlyLimit: number;
    quotaPercentage: number;
    dailyUsage: number;
    projectedMonthlyUsage: number;
    daysUntilReset: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = this.legiScanQuotaTracking.dailyUsage.get(today) || 0;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const projectedMonthlyUsage = (this.legiScanQuotaTracking.currentUsage / dayOfMonth) * daysInMonth;
    const daysUntilReset = (this.legiScanQuotaTracking.resetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    
    return {
      monthlyUsage: this.legiScanQuotaTracking.currentUsage,
      monthlyLimit: this.legiScanQuotaTracking.monthlyLimit,
      quotaPercentage: (this.legiScanQuotaTracking.currentUsage / this.legiScanQuotaTracking.monthlyLimit) * 100,
      dailyUsage,
      projectedMonthlyUsage: Math.round(projectedMonthlyUsage),
      daysUntilReset: Math.ceil(daysUntilReset)
    };
  }

  private async checkLegiScanQuotaAlerts(): Promise<void> {
    const metrics = await this.getLegiScanUsageMetrics();
    
    // Critical alert at 95%
    if (metrics.quotaPercentage >= 95) {
      await this.createAlert({
        type: 'anomaly_detection',
        severity: 'critical',
        description: `LegiScan API usage at ${metrics.quotaPercentage.toFixed(1)}% - IMMEDIATE ACTION REQUIRED`,
        affectedUsers: ['system'],
        recommendedActions: [
          'Implement emergency rate limiting',
          'Enable aggressive caching',
          'Consider upgrading to paid tier',
          'Temporarily disable non-essential LegiScan features'
        ]
      });
    }
    // High alert at 85%
    else if (metrics.quotaPercentage >= 85) {
      await this.createAlert({
        type: 'anomaly_detection',
        severity: 'high',
        description: `LegiScan API usage at ${metrics.quotaPercentage.toFixed(1)}% - Action needed soon`,
        affectedUsers: ['system'],
        recommendedActions: [
          'Enable more aggressive caching',
          'Optimize API usage patterns',
          'Review high-usage features'
        ]
      });
    }
    // Medium alert at 70%
    else if (metrics.quotaPercentage >= 70) {
      await this.createAlert({
        type: 'anomaly_detection',
        severity: 'medium',
        description: `LegiScan API usage at ${metrics.quotaPercentage.toFixed(1)}% - Monitor closely`,
        affectedUsers: ['system'],
        recommendedActions: [
          'Monitor usage patterns',
          'Prepare caching strategies',
          'Review quota optimization'
        ]
      });
    }
  }

  private getDailyLegiScanUsage(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.legiScanQuotaTracking.dailyUsage.get(today) || 0;
  }

  private initializeQuotaTracking(): void {
    // Reset monthly tracking if needed
    const now = new Date();
    if (now >= this.legiScanQuotaTracking.resetDate) {
      this.legiScanQuotaTracking.currentUsage = 0;
      this.legiScanQuotaTracking.resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    // Clean old daily/hourly data (keep last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    for (const [date] of this.legiScanQuotaTracking.dailyUsage.entries()) {
      if (date < sevenDaysAgo) {
        this.legiScanQuotaTracking.dailyUsage.delete(date);
      }
    }
  }

  // =============================================================================
  // ALERT MANAGEMENT
  // =============================================================================

  async createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<SecurityAlert> {
    const fullAlert: SecurityAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    this.activeAlerts.set(fullAlert.id, fullAlert);
    
    // Send notifications based on severity
    await this.sendNotification(
      'security_alert',
      `Security Alert: ${fullAlert.description}`,
      fullAlert.severity
    );
    
    // Log alert creation
    console.log(`🚨 Security Alert Created: [${fullAlert.severity.toUpperCase()}] ${fullAlert.description}`);
    
    return fullAlert;
  }

  async resolveAlert(alertId: string, resolvedBy: string, notes?: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return;
    
    alert.autoResolved = false;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;
    
    if (notes) {
      alert.recommendedActions.push(`Resolution notes: ${notes}`);
    }
    
    console.log(`✅ Security Alert Resolved: ${alertId} by ${resolvedBy}`);
  }

  async getActiveAlerts(): Promise<SecurityAlert[]> {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolvedAt);
  }

  async getAlertHistory(timeRange: { start: string; end: string }): Promise<SecurityAlert[]> {
    const startTime = new Date(timeRange.start).getTime();
    const endTime = new Date(timeRange.end).getTime();
    
    return Array.from(this.activeAlerts.values()).filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime >= startTime && alertTime <= endTime;
    });
  }

  // Continue in next part...
  
  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async enrichEventContext(event: SecurityEvent, context?: any): Promise<any> {
    const enrichedContext: any = { ...context };
    
    // Add geolocation if we have IP
    if (event.ipAddress && !enrichedContext.geolocation) {
      enrichedContext.geolocation = await this.getGeolocation(event.ipAddress);
    }
    
    // Add threat intelligence
    if (event.ipAddress) {
      enrichedContext.threatIntel = await this.checkThreatIntelligence(event.ipAddress);
    }
    
    // Add device fingerprinting
    if (event.userAgent) {
      enrichedContext.deviceFingerprint = this.generateDeviceFingerprint(event.userAgent, context?.deviceInfo);
    }
    
    return enrichedContext;
  }

  private determineSeverity(riskScore: number, eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical events regardless of score
    const criticalEvents = ['data_breach', 'session_hijack', 'unauthorized_access'];
    if (criticalEvents.includes(eventType)) return 'critical';
    
    // Risk score-based severity
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  private async evaluateForAlert(event: DetailedSecurityEvent): Promise<void> {
    // Create alerts for high-risk events
    if (event.severity === 'critical' || (event.severity === 'high' && event.riskScore > 70)) {
      await this.createAlert({
        type: 'suspicious_activity',
        severity: event.severity,
        description: `High-risk security event detected: ${event.type}`,
        affectedUsers: event.details?.email ? [event.details.email] : [],
        sourceIP: event.ipAddress,
        recommendedActions: this.getRecommendedActions(event)
      });
    }
  }

  private getRecommendedActions(event: DetailedSecurityEvent): string[] {
    const actions: string[] = [];
    
    if (event.type === 'login_failed' && event.riskScore > 50) {
      actions.push('Consider temporarily locking account');
      actions.push('Notify user of suspicious activity');
    }
    
    if (event.context?.threatIntel?.threatLevel === 'high') {
      actions.push('Block IP address immediately');
      actions.push('Review all sessions from this IP');
    }
    
    if (event.type === 'api_abuse') {
      actions.push('Rate limit the source');
      actions.push('Review API access patterns');
    }
    
    return actions.length > 0 ? actions : ['Monitor situation closely'];
  }

  // More implementation continues...

  async sendNotification(type: string, message: string, severity: string): Promise<void> {
    // Implementation for notifications (email, webhook, etc.)
    console.log(`📨 Security Notification [${severity.toUpperCase()}]: ${message}`);
  }

  async logSecurityEvent(event: DetailedSecurityEvent): Promise<void> {
    try {
      // Log to database if email is available
      if (event.details?.email) {
        await this.dbAdapter.logSecurityEvent(event.details.email, event);
      }
      
      // Also log to console for development
      console.log(`🛡️ Security Event: [${event.severity}] ${event.type} - Risk: ${event.riskScore}`);
      
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async basicThreatCheck(ipAddress: string): Promise<ThreatIntelligence | null> {
    // Basic threat intelligence (in production, use real TI providers)
    const knownThreats = [
      '192.168.1.1', // Private IP (should be flagged in production)
      '127.0.0.1'     // Localhost
    ];
    
    if (knownThreats.includes(ipAddress)) {
      return {
        ipAddress,
        threatLevel: 'low',
        threatTypes: ['scanner'],
        lastSeen: new Date().toISOString(),
        confidence: 0.7
      };
    }
    
    return null;
  }

  private async getGeolocation(ipAddress: string): Promise<any> {
    // Placeholder geolocation lookup
    // In production, integrate with MaxMind GeoIP or similar
    return {
      country: 'US',
      region: 'California',
      city: 'San Francisco',
      coordinates: { lat: 37.7749, lon: -122.4194 }
    };
  }

  private generateDeviceFingerprint(userAgent?: string, deviceInfo?: any): string {
    if (!userAgent) return 'unknown';
    
    // Simple fingerprinting based on User-Agent
    const ua = userAgent.toLowerCase();
    const browser = ua.includes('chrome') ? 'chrome' : 
                   ua.includes('firefox') ? 'firefox' : 
                   ua.includes('safari') ? 'safari' : 'unknown';
    const os = ua.includes('windows') ? 'windows' : 
              ua.includes('mac') ? 'mac' : 
              ua.includes('linux') ? 'linux' : 'unknown';
    
    return `${browser}-${os}`;
  }

  private extractDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown device';
    
    const ua = userAgent;
    if (ua.includes('Mobile')) return 'Mobile device';
    if (ua.includes('Tablet')) return 'Tablet';
    return 'Desktop computer';
  }

  private calculateDistance(coord1: { lat: number; lon: number }, coord2: { lat: number; lon: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private async getUserLoginPattern(email: string): Promise<number[]> {
    try {
      const events = await this.dbAdapter.getSecurityEvents(email, 50);
      const loginEvents = events.filter(e => e.type === 'login_success');
      return loginEvents.map(e => new Date(e.timestamp).getHours());
    } catch (error) {
      return [];
    }
  }

  private startThreatIntelligenceUpdates(): void {
    if (!this.config.threatIntelligence.enabled) return;
    
    setInterval(async () => {
      try {
        await this.updateThreatIntelligence();
      } catch (error) {
        console.error('Threat intelligence update failed:', error);
      }
    }, this.config.threatIntelligence.updateInterval * 60 * 1000);
  }

  private startQuotaMonitoring(): void {
    // Monitor LegiScan quota every 10 minutes
    setInterval(async () => {
      await this.checkLegiScanQuotaAlerts();
    }, 10 * 60 * 1000);
  }

  private startPerformanceTracking(): void {
    // Track security monitoring performance every minute
    setInterval(() => {
      const metrics = {
        eventsProcessed: this.eventsProcessed,
        processingErrors: this.processingErrors,
        activeAlerts: this.activeAlerts.size,
        cacheSize: this.threatIntelCache.size
      };
      
      performanceMonitor.recordMetric('security_monitor_performance', 1, metrics);
    }, 60 * 1000);
  }

  private startAlertManagement(): void {
    // Auto-resolve old alerts every hour
    setInterval(async () => {
      const alerts = await this.getActiveAlerts();
      const oldAlerts = alerts.filter(alert => {
        const alertAge = Date.now() - new Date(alert.timestamp).getTime();
        return alertAge > 24 * 60 * 60 * 1000; // 24 hours
      });
      
      for (const alert of oldAlerts) {
        if (alert.severity === 'low' || alert.severity === 'medium') {
          alert.autoResolved = true;
          alert.resolvedAt = new Date().toISOString();
          alert.resolvedBy = 'system_auto_resolution';
        }
      }
    }, 60 * 60 * 1000);
  }

  async updateThreatIntelligence(): Promise<{ updated: number; errors: number }> {
    // Placeholder for threat intelligence updates
    return { updated: 0, errors: 0 };
  }

  async healthCheck(): Promise<any> {
    const components = {
      eventProcessor: this.isMonitoring,
      threatIntel: this.config.threatIntelligence.enabled,
      alertSystem: true,
      database: false
    };
    
    try {
      const dbHealth = await this.dbAdapter.checkConnection();
      components.database = dbHealth.healthy;
    } catch (error) {
      components.database = false;
    }
    
    const metrics = {
      eventsPerSecond: this.eventsProcessed / ((Date.now() - this.monitoringStartTime) / 1000 || 1),
      averageProcessingTime: 0, // Would need to track this
      errorRate: this.processingErrors / (this.eventsProcessed || 1)
    };
    
    return {
      healthy: Object.values(components).every(Boolean),
      components,
      metrics
    };
  }

  // Dashboard methods implementation placeholder
  async getRealTimeMetrics(): Promise<any> {
    const activeAlerts = await this.getActiveAlerts();
    return {
      activeThreats: activeAlerts.filter(a => a.type === 'suspicious_activity').length,
      blockedAttempts: 0, // Would track this
      suspiciousIPs: this.threatIntelCache.size,
      alertsToday: activeAlerts.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.timestamp).toDateString() === today;
      }).length
    };
  }

  // Additional dashboard methods would be implemented here...
  async getLoginActivityChart(timeRange: { start: string; end: string }): Promise<any> {
    return { labels: [], successful: [], failed: [], blocked: [] };
  }

  async getThreatLevelChart(): Promise<any> {
    return { low: 0, medium: 0, high: 0, critical: 0 };
  }

  async getGeographicThreatMap(): Promise<any> {
    return [];
  }

  async getSecuritySummary(): Promise<any> {
    return {
      totalUsers: 0,
      activeUsers: 0,
      lockedAccounts: 0,
      recentAlerts: [],
      riskDistribution: [],
      uptime: this.isMonitoring ? Date.now() - this.monitoringStartTime : 0
    };
  }

  // Placeholder implementations for remaining interface methods
  async shouldBlockIP(ipAddress: string, reason: string): Promise<boolean> { return false; }
  async shouldLockAccount(email: string, reason: string): Promise<boolean> { return false; }
  async autoRemediate(alert: SecurityAlert): Promise<{ success: boolean; actions: string[] }> { 
    return { success: false, actions: [] }; 
  }
  async generateSecurityReport(timeRange: { start: string; end: string }): Promise<any> {
    return { metrics: {}, alerts: [], topThreats: [], recommendations: [] };
  }
  async getMetrics(timeWindow: number): Promise<SecurityMetrics> {
    return {} as SecurityMetrics;
  }
  async exportSecurityData(format: 'json' | 'csv' | 'pdf', timeRange?: { start: string; end: string }): Promise<string> {
    return '';
  }
}

export default ComprehensiveSecurityMonitor;