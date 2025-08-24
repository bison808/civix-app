// Database Integration Interface for Agent Morgan
// This file defines the interface that Agent Morgan will implement for database operations

import { 
  SecureUser, 
  PasswordResetToken, 
  EmailVerificationToken, 
  RateLimitInfo, 
  SecurityEvent, 
  SuspiciousActivity 
} from '@/lib/enhancedUserStore';

/**
 * Database Adapter Interface for Agent Morgan
 * 
 * Agent Morgan will implement this interface to provide database persistence
 * for all authentication and user management operations.
 */
export interface DatabaseAdapter {
  // User Management Operations
  createUser(user: SecureUser): Promise<void>;
  getUser(email: string): Promise<SecureUser | null>;
  updateUser(email: string, updates: Partial<SecureUser>): Promise<void>;
  deleteUser(email: string): Promise<void>;
  getUserByZipCode(zipCode: string): Promise<SecureUser[]>;
  searchUsersByName(firstName?: string, lastName?: string): Promise<SecureUser[]>;
  
  // Authentication Token Operations
  createPasswordResetToken(token: PasswordResetToken): Promise<void>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  updatePasswordResetToken(token: string, updates: Partial<PasswordResetToken>): Promise<void>;
  deletePasswordResetToken(token: string): Promise<void>;
  cleanupExpiredPasswordResetTokens(): Promise<number>; // Returns count of deleted tokens
  
  createEmailVerificationToken(token: EmailVerificationToken): Promise<void>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | null>;
  updateEmailVerificationToken(token: string, updates: Partial<EmailVerificationToken>): Promise<void>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  cleanupExpiredEmailVerificationTokens(): Promise<number>;
  
  // Rate Limiting Operations
  getRateLimitInfo(identifier: string): Promise<RateLimitInfo | null>;
  updateRateLimitInfo(identifier: string, info: RateLimitInfo): Promise<void>;
  deleteRateLimitInfo(identifier: string): Promise<void>;
  cleanupExpiredRateLimit(): Promise<number>;
  
  // Security Event Logging (for Agent Casey integration)
  logSecurityEvent(email: string, event: SecurityEvent): Promise<void>;
  getSecurityEvents(email: string, limit?: number, offset?: number): Promise<SecurityEvent[]>;
  getSecurityEventsByTimeRange(startTime: string, endTime: string): Promise<SecurityEvent[]>;
  getSecurityEventsByType(eventType: SecurityEvent['type'], timeRange?: { start: string; end: string }): Promise<SecurityEvent[]>;
  
  // Suspicious Activity Tracking
  logSuspiciousActivity(email: string, activity: SuspiciousActivity): Promise<void>;
  getSuspiciousActivity(timeWindow: number): Promise<SuspiciousActivity[]>; // timeWindow in milliseconds
  getSuspiciousActivityByEmail(email: string): Promise<SuspiciousActivity[]>;
  getSuspiciousActivityByIP(ipAddress: string): Promise<SuspiciousActivity[]>;
  
  // Session Management
  createSession(sessionInfo: any): Promise<void>;
  getSession(sessionToken: string): Promise<any>;
  updateSession(sessionToken: string, updates: any): Promise<void>;
  deleteSession(sessionToken: string): Promise<void>;
  deleteAllUserSessions(email: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
  
  // Analytics and Reporting (for Agent Casey)
  getUserCount(): Promise<number>;
  getActiveUserCount(timeWindow: number): Promise<number>;
  getRegistrationStats(timeRange: { start: string; end: string }): Promise<{ date: string; count: number }[]>;
  getLoginStats(timeRange: { start: string; end: string }): Promise<{ date: string; count: number }[]>;
  getSecurityEventStats(): Promise<{ eventType: string; count: number }[]>;
  
  // Data Integrity and Maintenance
  validateDatabaseIntegrity(): Promise<{ healthy: boolean; issues?: string[] }>;
  optimizeDatabase(): Promise<void>;
  backupUserData(): Promise<string>; // Returns backup identifier
  
  // Transaction Support (for complex operations)
  beginTransaction(): Promise<any>;
  commitTransaction(transaction: any): Promise<void>;
  rollbackTransaction(transaction: any): Promise<void>;
}

/**
 * Configuration for Database Adapter
 * Agent Morgan will use this configuration to set up the database connection
 */
export interface DatabaseConfig {
  // Database connection settings
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  
  // Connection pool settings
  minConnections?: number;
  maxConnections?: number;
  acquireTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  
  // Database-specific settings
  schema?: string;
  timezone?: string;
  charset?: string;
  
  // Migration settings
  migrationsPath?: string;
  autoMigrate?: boolean;
  
  // Logging settings
  logging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  // Backup settings
  backupEnabled?: boolean;
  backupSchedule?: string; // Cron expression
  backupRetentionDays?: number;
}

/**
 * Database Migration Interface
 * Agent Morgan will implement this for database schema management
 */
export interface DatabaseMigration {
  version: string;
  description: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

/**
 * Database Health Check Interface
 * Agent Morgan will implement this for monitoring database health
 */
export interface DatabaseHealthCheck {
  checkConnection(): Promise<{ healthy: boolean; latency?: number; error?: string }>;
  checkTableIntegrity(): Promise<{ healthy: boolean; issues?: string[] }>;
  getConnectionPoolStatus(): Promise<{ active: number; idle: number; total: number }>;
  getDatabaseSize(): Promise<{ sizeInBytes: number; tables: { [tableName: string]: number } }>;
  getPerformanceMetrics(): Promise<{
    queryTime: { avg: number; p95: number; p99: number };
    connectionTime: { avg: number; p95: number; p99: number };
    errorRate: number;
  }>;
}

/**
 * Example implementation placeholder for Agent Morgan
 * This shows the structure that Agent Morgan should follow
 */
export class PostgreSQLDatabaseAdapter implements DatabaseAdapter {
  constructor(private config: DatabaseConfig) {
    // Agent Morgan will initialize the database connection here
  }
  
  async createUser(user: SecureUser): Promise<void> {
    throw new Error('Implementation required by Agent Morgan');
  }
  
  async getUser(email: string): Promise<SecureUser | null> {
    throw new Error('Implementation required by Agent Morgan');
  }
  
  async updateUser(email: string, updates: Partial<SecureUser>): Promise<void> {
    throw new Error('Implementation required by Agent Morgan');
  }
  
  // ... All other methods need to be implemented by Agent Morgan
  // This is a placeholder to show the expected structure
  
  [key: string]: any; // Allow for additional methods
}

/**
 * Factory function for creating database adapters
 * Agent Morgan will implement this to return the appropriate adapter
 */
export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
  // Agent Morgan will implement this factory function
  throw new Error('Database adapter factory must be implemented by Agent Morgan');
}

// Export types for Agent Morgan to use
export type {
  SecureUser,
  PasswordResetToken,
  EmailVerificationToken,
  RateLimitInfo,
  SecurityEvent,
  SuspiciousActivity
} from '@/lib/enhancedUserStore';