/**
 * Production Logger - Agent Casey Implementation
 * Enterprise-grade logging standards for CITZN platform
 * 
 * Features:
 * - Structured JSON logging
 * - Log level management
 * - Security-aware log filtering
 * - Performance logging
 * - Error tracking and correlation
 * - Audit trail logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 'system' | 'security' | 'performance' | 'api' | 'database' | 'user' | 'audit';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  errorCode?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: LogContext;
  correlationId?: string;
  environment: string;
  service: string;
  version: string;
}

class ProductionLogger {
  private serviceName: string;
  private version: string;
  private environment: string;
  private minLogLevel: LogLevel;
  private sensitiveFields = new Set([
    'password', 'token', 'secret', 'key', 'authorization', 'cookie',
    'ssn', 'credit_card', 'email', 'phone', 'address'
  ]);

  constructor() {
    this.serviceName = 'citzn-platform';
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
    this.minLogLevel = this.getMinLogLevel();
  }

  // =============================================================================
  // CORE LOGGING METHODS
  // =============================================================================

  debug(message: string, context?: LogContext, category: LogCategory = 'system'): void {
    this.log('debug', category, message, context);
  }

  info(message: string, context?: LogContext, category: LogCategory = 'system'): void {
    this.log('info', category, message, context);
  }

  warn(message: string, context?: LogContext, category: LogCategory = 'system'): void {
    this.log('warn', category, message, context);
  }

  error(message: string, context?: LogContext, category: LogCategory = 'system'): void {
    this.log('error', category, message, context);
  }

  critical(message: string, context?: LogContext, category: LogCategory = 'system'): void {
    this.log('critical', category, message, context);
  }

  // =============================================================================
  // SPECIALIZED LOGGING METHODS
  // =============================================================================

  // Security event logging
  logSecurityEvent(
    eventType: string,
    message: string,
    context: LogContext,
    severity: LogLevel = 'warn'
  ): void {
    this.log(severity, 'security', `Security Event [${eventType}]: ${message}`, {
      ...context,
      securityEvent: true,
      eventType
    });
  }

  // Performance logging
  logPerformance(
    operation: string,
    duration: number,
    context?: LogContext,
    threshold?: number
  ): void {
    const level: LogLevel = threshold && duration > threshold ? 'warn' : 'info';
    
    this.log(level, 'performance', `Performance [${operation}]: ${duration}ms`, {
      ...context,
      performanceMetric: true,
      operation,
      duration,
      threshold
    });
  }

  // API request/response logging
  logApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext
  ): void {
    const level: LogLevel = 
      statusCode >= 500 ? 'error' :
      statusCode >= 400 ? 'warn' :
      responseTime > 5000 ? 'warn' : 'info';

    this.log(level, 'api', `API ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`, {
      ...context,
      method,
      endpoint,
      statusCode,
      responseTime,
      apiRequest: true
    });
  }

  // Database operation logging
  logDatabaseOperation(
    operation: string,
    table?: string,
    duration?: number,
    context?: LogContext,
    error?: Error
  ): void {
    const level: LogLevel = error ? 'error' : (duration && duration > 1000) ? 'warn' : 'debug';
    
    const message = error ? 
      `Database Error [${operation}]: ${error.message}` :
      `Database [${operation}]${table ? ` on ${table}` : ''}${duration ? ` - ${duration}ms` : ''}`;

    this.log(level, 'database', message, {
      ...context,
      databaseOperation: true,
      operation,
      table,
      duration,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  // User action logging
  logUserAction(
    userId: string,
    action: string,
    resource?: string,
    context?: LogContext
  ): void {
    this.log('info', 'user', `User Action [${action}]${resource ? ` on ${resource}` : ''}`, {
      ...context,
      userId,
      userAction: true,
      action,
      resource
    });
  }

  // Audit trail logging
  logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    outcome: 'success' | 'failure',
    context?: LogContext
  ): void {
    this.log('info', 'audit', `Audit [${outcome.toUpperCase()}]: ${action} on ${resource}`, {
      ...context,
      userId,
      auditEvent: true,
      action,
      resource,
      outcome
    });
  }

  // Error logging with correlation
  logError(
    error: Error,
    context?: LogContext,
    category: LogCategory = 'system',
    correlationId?: string
  ): void {
    this.log('error', category, `Error: ${error.message}`, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      correlationId
    });
  }

  // Critical system alerts
  logCriticalAlert(
    alertType: string,
    message: string,
    context?: LogContext
  ): void {
    this.log('critical', 'system', `CRITICAL ALERT [${alertType}]: ${message}`, {
      ...context,
      criticalAlert: true,
      alertType,
      requiresImmedateAttention: true
    });
  }

  // =============================================================================
  // LEGISCAN SPECIFIC LOGGING
  // =============================================================================

  logLegiScanQuotaAlert(
    quotaPercentage: number,
    alertLevel: string,
    context?: LogContext
  ): void {
    const level: LogLevel = 
      alertLevel === 'critical' ? 'critical' :
      alertLevel === 'high' ? 'error' :
      alertLevel === 'medium' ? 'warn' : 'info';

    this.log(level, 'api', `LegiScan Quota Alert: ${quotaPercentage.toFixed(1)}% used (${alertLevel})`, {
      ...context,
      legiScanQuota: true,
      quotaPercentage,
      alertLevel
    });
  }

  logLegiScanApiCall(
    endpoint: string,
    quotaUsed: number,
    responseTime: number,
    dataQuality: number,
    context?: LogContext
  ): void {
    const level: LogLevel = 
      dataQuality < 70 ? 'warn' :
      responseTime > 5000 ? 'warn' : 'debug';

    this.log(level, 'api', `LegiScan API: ${endpoint} (quota: ${quotaUsed}, quality: ${dataQuality}%, ${responseTime}ms)`, {
      ...context,
      legiScanApi: true,
      endpoint,
      quotaUsed,
      responseTime,
      dataQuality
    });
  }

  // =============================================================================
  // AUTHENTICATION LOGGING
  // =============================================================================

  logAuthenticationAttempt(
    email: string,
    outcome: 'success' | 'failure',
    reason?: string,
    context?: LogContext
  ): void {
    const level: LogLevel = outcome === 'failure' ? 'warn' : 'info';
    const maskedEmail = this.maskSensitiveData(email, 'email');
    
    this.log(level, 'security', `Authentication [${outcome.toUpperCase()}]: ${maskedEmail}${reason ? ` - ${reason}` : ''}`, {
      ...context,
      authentication: true,
      email: maskedEmail,
      outcome,
      reason
    });
  }

  logSessionEvent(
    sessionId: string,
    event: 'created' | 'renewed' | 'expired' | 'terminated',
    context?: LogContext
  ): void {
    this.log('info', 'security', `Session [${event.toUpperCase()}]: ${sessionId.substring(0, 8)}...`, {
      ...context,
      sessionEvent: true,
      sessionId: sessionId.substring(0, 8) + '...', // Partial session ID for security
      event
    });
  }

  // =============================================================================
  // CORE LOGGING IMPLEMENTATION
  // =============================================================================

  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: LogContext
  ): void {
    // Check if we should log at this level
    if (!this.shouldLog(level)) return;

    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context: context ? this.sanitizeContext(context) : undefined,
      correlationId: context?.requestId || this.generateCorrelationId(),
      environment: this.environment,
      service: this.serviceName,
      version: this.version
    };

    // Output log based on environment
    if (this.environment === 'development') {
      this.outputDevelopmentLog(logEntry);
    } else {
      this.outputProductionLog(logEntry);
    }

    // Send to external services in production
    if (this.environment === 'production') {
      this.sendToExternalLogging(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    };

    return levels[level] >= levels[this.minLogLevel];
  }

  private getMinLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];
    
    if (envLevel && validLevels.includes(envLevel)) {
      return envLevel;
    }
    
    // Default based on environment
    return this.environment === 'development' ? 'debug' : 'info';
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    
    // Remove or mask sensitive data
    Object.keys(sanitized).forEach(key => {
      if (this.sensitiveFields.has(key.toLowerCase())) {
        if (key.toLowerCase() === 'email') {
          sanitized[key] = this.maskSensitiveData(sanitized[key], 'email');
        } else {
          sanitized[key] = '[REDACTED]';
        }
      }
    });
    
    // Sanitize metadata
    if (sanitized.metadata) {
      sanitized.metadata = this.sanitizeMetadata(sanitized.metadata);
    }
    
    return sanitized;
  }

  private maskSensitiveData(value: any, type: string): string {
    if (typeof value !== 'string') return '[REDACTED]';
    
    switch (type) {
      case 'email':
        const [local, domain] = value.split('@');
        if (local && domain) {
          const maskedLocal = local.substring(0, 2) + '*'.repeat(Math.max(0, local.length - 2));
          return `${maskedLocal}@${domain}`;
        }
        return '[REDACTED_EMAIL]';
      default:
        return '[REDACTED]';
    }
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (this.sensitiveFields.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  private outputDevelopmentLog(logEntry: LogEntry): void {
    const colors = {
      debug: '\x1b[36m',    // Cyan
      info: '\x1b[32m',     // Green  
      warn: '\x1b[33m',     // Yellow
      error: '\x1b[31m',    // Red
      critical: '\x1b[35m'  // Magenta
    };
    
    const reset = '\x1b[0m';
    const color = colors[logEntry.level] || '';
    
    const timestamp = logEntry.timestamp;
    const level = logEntry.level.toUpperCase().padEnd(8);
    const category = `[${logEntry.category.toUpperCase()}]`.padEnd(12);
    
    console.log(`${color}${timestamp} ${level}${category}${reset} ${logEntry.message}`);
    
    if (logEntry.context && Object.keys(logEntry.context).length > 0) {
      console.log(`${color}Context:${reset}`, JSON.stringify(logEntry.context, null, 2));
    }
  }

  private outputProductionLog(logEntry: LogEntry): void {
    // Structured JSON logging for production
    console.log(JSON.stringify(logEntry));
  }

  private sendToExternalLogging(logEntry: LogEntry): void {
    // In production, send to external logging services
    // This could be DataDog, CloudWatch, Splunk, etc.
    
    // For critical and error logs, also send alerts
    if (logEntry.level === 'critical' || logEntry.level === 'error') {
      this.sendAlert(logEntry);
    }
  }

  private sendAlert(logEntry: LogEntry): void {
    // Send alerts for critical issues
    // This could be PagerDuty, Slack, email notifications, etc.
    
    // For now, just log that an alert should be sent
    if (logEntry.level === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${logEntry.message}`);
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Create child logger with default context
  child(defaultContext: LogContext): ProductionLogger {
    const childLogger = new ProductionLogger();
    
    // Override log method to include default context
    const originalLog = childLogger.log.bind(childLogger);
    (childLogger as any).log = (
      level: LogLevel,
      category: LogCategory,
      message: string,
      context?: LogContext
    ) => {
      originalLog(level, category, message, { ...defaultContext, ...context });
    };
    
    return childLogger;
  }

  // Flush logs (for testing or graceful shutdown)
  flush(): Promise<void> {
    return new Promise(resolve => {
      // In production, this would flush any buffered logs
      setTimeout(resolve, 100);
    });
  }

  // Get current log configuration
  getConfig(): {
    serviceName: string;
    version: string;
    environment: string;
    minLogLevel: LogLevel;
  } {
    return {
      serviceName: this.serviceName,
      version: this.version,
      environment: this.environment,
      minLogLevel: this.minLogLevel
    };
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export class for testing or custom instances
export { ProductionLogger };

// Convenience exports
export const loggers = {
  security: (message: string, context?: LogContext) => logger.logSecurityEvent('general', message, context || {}),
  performance: (operation: string, duration: number, context?: LogContext) => logger.logPerformance(operation, duration, context),
  api: (method: string, endpoint: string, status: number, time: number, context?: LogContext) => 
    logger.logApiRequest(method, endpoint, status, time, context),
  database: (operation: string, table?: string, duration?: number, context?: LogContext, error?: Error) =>
    logger.logDatabaseOperation(operation, table, duration, context, error),
  audit: (userId: string, action: string, resource: string, outcome: 'success' | 'failure', context?: LogContext) =>
    logger.logAuditEvent(userId, action, resource, outcome, context)
};

export default logger;