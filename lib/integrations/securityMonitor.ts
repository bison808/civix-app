// Security Monitoring Integration Interface for Agent Casey
// This file defines the interface that Agent Casey will implement for security monitoring

import { SecurityEvent, SuspiciousActivity, SecureUser } from '@/lib/enhancedUserStore';

/**
 * Security Event Types for detailed monitoring
 * Agent Casey will use these for comprehensive security analysis
 */
export interface DetailedSecurityEvent extends SecurityEvent {
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  context?: {
    previousEvents?: SecurityEvent[];
    relatedIPs?: string[];
    deviceFingerprint?: string;
    geolocation?: {
      country?: string;
      region?: string;
      city?: string;
      coordinates?: { lat: number; lon: number };
    };
  };
}

/**
 * Security Alert Types
 */
export interface SecurityAlert {
  id: string;
  type: 'account_compromise' | 'brute_force' | 'suspicious_activity' | 'data_breach' | 'anomaly_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  affectedUsers: string[]; // email addresses
  sourceIP?: string;
  recommendedActions: string[];
  autoResolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * Threat Intelligence Data
 */
export interface ThreatIntelligence {
  ipAddress: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatTypes: ('malware' | 'botnet' | 'tor' | 'proxy' | 'vpn' | 'scanner' | 'spam')[];
  lastSeen: string;
  country?: string;
  organization?: string;
  confidence: number; // 0-1
}

/**
 * Security Metrics for monitoring and reporting
 */
export interface SecurityMetrics {
  timestamp: string;
  timeWindow: number; // in milliseconds
  
  // Authentication metrics
  totalLoginAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  blockedAttempts: number;
  
  // Account security metrics
  accountsLocked: number;
  passwordResets: number;
  newRegistrations: number;
  
  // Threat metrics
  suspiciousActivities: number;
  blockedIPs: number;
  threatIntelHits: number;
  
  // Geographic metrics
  topCountries: { country: string; attempts: number }[];
  topIPs: { ip: string; attempts: number }[];
  
  // Risk metrics
  averageRiskScore: number;
  highRiskEvents: number;
  criticalAlerts: number;
}

/**
 * Security Monitor Configuration
 */
export interface SecurityMonitorConfig {
  // Real-time monitoring settings
  enabled: boolean;
  realTimeAnalysis: boolean;
  
  // Alert settings
  alertThresholds: {
    failedLoginAttempts: number;
    suspiciousActivityScore: number;
    geographicAnomalyDistance: number; // in kilometers
    timeBasedAnomalyWindow: number; // in minutes
  };
  
  // Notification settings
  notifications: {
    email?: string[];
    webhook?: string;
    slack?: string;
    sms?: string[];
  };
  
  // Threat intelligence settings
  threatIntelligence: {
    enabled: boolean;
    providers: string[];
    updateInterval: number; // in minutes
    cacheTimeout: number; // in minutes
  };
  
  // Logging and retention
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
    compressOldLogs: boolean;
  };
  
  // Rate limiting for monitoring
  rateLimiting: {
    eventsPerSecond: number;
    burstSize: number;
  };
}

/**
 * Main Security Monitor Interface for Agent Casey
 */
export interface SecurityMonitor {
  // Event Processing
  processSecurityEvent(event: SecurityEvent, context?: any): Promise<DetailedSecurityEvent>;
  analyzeEventSequence(events: SecurityEvent[]): Promise<{ riskScore: number; patterns: string[] }>;
  
  // Real-time Monitoring
  startRealTimeMonitoring(): Promise<void>;
  stopRealTimeMonitoring(): Promise<void>;
  getMonitoringStatus(): Promise<{ active: boolean; uptime: number; eventsProcessed: number }>;
  
  // Threat Detection
  detectAnomalies(user: SecureUser, context: any): Promise<SuspiciousActivity[]>;
  analyzeBehaviorPattern(email: string, timeWindow: number): Promise<{ normal: boolean; anomalies: string[] }>;
  checkThreatIntelligence(ipAddress: string): Promise<ThreatIntelligence | null>;
  
  // Risk Assessment
  calculateRiskScore(event: SecurityEvent, context?: any): Promise<number>;
  assessAccountRisk(email: string): Promise<{ riskScore: number; factors: string[] }>;
  identifyHighRiskAccounts(threshold?: number): Promise<{ email: string; riskScore: number }[]>;
  
  // Alert Management
  createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<SecurityAlert>;
  resolveAlert(alertId: string, resolvedBy: string, notes?: string): Promise<void>;
  getActiveAlerts(): Promise<SecurityAlert[]>;
  getAlertHistory(timeRange: { start: string; end: string }): Promise<SecurityAlert[]>;
  
  // Automated Response
  shouldBlockIP(ipAddress: string, reason: string): Promise<boolean>;
  shouldLockAccount(email: string, reason: string): Promise<boolean>;
  autoRemediate(alert: SecurityAlert): Promise<{ success: boolean; actions: string[] }>;
  
  // Reporting and Analytics
  generateSecurityReport(timeRange: { start: string; end: string }): Promise<{
    metrics: SecurityMetrics;
    alerts: SecurityAlert[];
    topThreats: ThreatIntelligence[];
    recommendations: string[];
  }>;
  
  getMetrics(timeWindow: number): Promise<SecurityMetrics>;
  exportSecurityData(format: 'json' | 'csv' | 'pdf', timeRange?: { start: string; end: string }): Promise<string>;
  
  // Integration Methods
  sendNotification(type: string, message: string, severity: string): Promise<void>;
  logSecurityEvent(event: DetailedSecurityEvent): Promise<void>;
  updateThreatIntelligence(): Promise<{ updated: number; errors: number }>;
  
  // Health Check
  healthCheck(): Promise<{
    healthy: boolean;
    components: {
      eventProcessor: boolean;
      threatIntel: boolean;
      alertSystem: boolean;
      database: boolean;
    };
    metrics: {
      eventsPerSecond: number;
      averageProcessingTime: number;
      errorRate: number;
    };
  }>;
}

/**
 * Security Dashboard Interface
 * Agent Casey will implement this for the security dashboard
 */
export interface SecurityDashboard {
  // Real-time data
  getRealTimeMetrics(): Promise<{
    activeThreats: number;
    blockedAttempts: number;
    suspiciousIPs: number;
    alertsToday: number;
  }>;
  
  // Chart data
  getLoginActivityChart(timeRange: { start: string; end: string }): Promise<{
    labels: string[];
    successful: number[];
    failed: number[];
    blocked: number[];
  }>;
  
  getThreatLevelChart(): Promise<{
    low: number;
    medium: number;
    high: number;
    critical: number;
  }>;
  
  getGeographicThreatMap(): Promise<{
    country: string;
    threatLevel: number;
    incidents: number;
    coordinates: { lat: number; lon: number };
  }[]>;
  
  // Summary data
  getSecuritySummary(): Promise<{
    totalUsers: number;
    activeUsers: number;
    lockedAccounts: number;
    recentAlerts: SecurityAlert[];
    riskDistribution: { level: string; count: number }[];
    uptime: number;
  }>;
}

/**
 * Implementation example for Agent Casey
 * This shows the structure that Agent Casey should follow
 */
export class ComprehensiveSecurityMonitor implements SecurityMonitor {
  constructor(private config: SecurityMonitorConfig) {
    // Agent Casey will initialize monitoring systems here
  }
  
  async processSecurityEvent(event: SecurityEvent, context?: any): Promise<DetailedSecurityEvent> {
    throw new Error('Implementation required by Agent Casey');
  }
  
  async analyzeEventSequence(events: SecurityEvent[]): Promise<{ riskScore: number; patterns: string[] }> {
    throw new Error('Implementation required by Agent Casey');
  }
  
  async startRealTimeMonitoring(): Promise<void> {
    throw new Error('Implementation required by Agent Casey');
  }
  
  // ... All other methods need to be implemented by Agent Casey
  
  [key: string]: any; // Allow for additional methods
}

/**
 * Factory function for creating security monitors
 * Agent Casey will implement this to return the appropriate monitor
 */
export function createSecurityMonitor(config: SecurityMonitorConfig): SecurityMonitor {
  // Agent Casey will implement this factory function
  throw new Error('Security monitor factory must be implemented by Agent Casey');
}

/**
 * Utility functions for security analysis
 * Agent Casey can use these as helpers
 */
export const SecurityAnalysisUtils = {
  // IP address analysis
  isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
      /^127\./, /^169\.254\./, /^::1$/, /^fe80::/
    ];
    return privateRanges.some(range => range.test(ip));
  },
  
  // Geographic distance calculation
  calculateDistance(coord1: { lat: number; lon: number }, coord2: { lat: number; lon: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
  
  // Time-based anomaly detection
  detectTimeAnomalies(events: { timestamp: string }[], normalPattern: { hour: number; frequency: number }[]): boolean {
    const eventsByHour = events.reduce((acc, event) => {
      const hour = new Date(event.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.entries(eventsByHour).some(([hour, count]) => {
      const normal = normalPattern.find(p => p.hour === parseInt(hour));
      return !normal || count > normal.frequency * 3; // 3x normal is anomalous
    });
  },
  
  // Password pattern analysis
  analyzePasswordPatterns(attempts: string[]): { pattern?: string; dictionary: boolean; bruteForce: boolean } {
    const sequential = attempts.some((attempt, i, arr) => 
      i > 0 && attempt.charCodeAt(attempt.length - 1) === arr[i - 1].charCodeAt(arr[i - 1].length - 1) + 1
    );
    
    const commonPasswords = ['password', '123456', 'admin', 'password123', 'qwerty'];
    const dictionary = attempts.some(attempt => 
      commonPasswords.some(common => attempt.toLowerCase().includes(common.toLowerCase()))
    );
    
    const bruteForce = attempts.length > 10 && new Set(attempts).size / attempts.length < 0.8;
    
    return { pattern: sequential ? 'sequential' : undefined, dictionary, bruteForce };
  }
};

// Export types for Agent Casey to use
export type {
  SecurityEvent,
  SuspiciousActivity,
  SecureUser
} from '@/lib/enhancedUserStore';