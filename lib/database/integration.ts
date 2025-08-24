// Database Integration Layer - Replace In-Memory Store
// Agent Morgan (Database Architecture & Data Relationships Specialist)
// Seamless integration between Agent Tom's authentication system and production database

import { getDatabaseAdapter } from './config';
import { 
  SecureUser, 
  PasswordResetToken, 
  EmailVerificationToken, 
  RateLimitInfo,
  SecurityEvent,
  SuspiciousActivity,
  SessionInfo
} from '../enhancedUserStore';

// Production User Store - replaces in-memory implementation
export class DatabaseUserStore {
  private adapter = getDatabaseAdapter();

  // User Management Methods (matching Agent Tom's interface)
  async getUser(email: string): Promise<SecureUser | null> {
    try {
      return await this.adapter.getUser(email);
    } catch (error) {
      console.error('Database error in getUser:', error);
      return null;
    }
  }

  async createUser(user: SecureUser): Promise<void> {
    try {
      await this.adapter.createUser(user);
      
      // Log security event for user creation
      await this.adapter.logSecurityEvent(user.email, {
        type: 'login',
        timestamp: new Date().toISOString(),
        details: 'Account created'
      });
      
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }

  async updateUser(email: string, updates: Partial<SecureUser>): Promise<void> {
    try {
      await this.adapter.updateUser(email, updates);
      
      // Log security event for significant updates
      if (updates.passwordHash || updates.emailVerified || updates.accountLockedUntil) {
        const eventType = updates.passwordHash ? 'password_change' : 
                         updates.emailVerified ? 'email_verified' : 'account_locked';
        
        await this.adapter.logSecurityEvent(email, {
          type: eventType as SecurityEvent['type'],
          timestamp: new Date().toISOString(),
          details: 'Profile updated'
        });
      }
      
    } catch (error) {
      console.error('Database error in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(email: string): Promise<void> {
    try {
      await this.adapter.deleteUser(email);
    } catch (error) {
      console.error('Database error in deleteUser:', error);
      throw error;
    }
  }

  // Enhanced user lookup methods
  async getUserByZipCode(zipCode: string): Promise<SecureUser[]> {
    try {
      return await this.adapter.getUserByZipCode(zipCode);
    } catch (error) {
      console.error('Database error in getUserByZipCode:', error);
      return [];
    }
  }

  async searchUsersByName(firstName?: string, lastName?: string): Promise<SecureUser[]> {
    try {
      return await this.adapter.searchUsersByName(firstName, lastName);
    } catch (error) {
      console.error('Database error in searchUsersByName:', error);
      return [];
    }
  }

  // Token Management Methods
  async createPasswordResetToken(token: PasswordResetToken): Promise<void> {
    try {
      await this.adapter.createPasswordResetToken(token);
    } catch (error) {
      console.error('Database error in createPasswordResetToken:', error);
      throw error;
    }
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    try {
      return await this.adapter.getPasswordResetToken(token);
    } catch (error) {
      console.error('Database error in getPasswordResetToken:', error);
      return null;
    }
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    try {
      await this.adapter.deletePasswordResetToken(token);
    } catch (error) {
      console.error('Database error in deletePasswordResetToken:', error);
      throw error;
    }
  }

  async createEmailVerificationToken(token: EmailVerificationToken): Promise<void> {
    try {
      await this.adapter.createEmailVerificationToken(token);
    } catch (error) {
      console.error('Database error in createEmailVerificationToken:', error);
      throw error;
    }
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
    try {
      return await this.adapter.getEmailVerificationToken(token);
    } catch (error) {
      console.error('Database error in getEmailVerificationToken:', error);
      return null;
    }
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    try {
      await this.adapter.deleteEmailVerificationToken(token);
    } catch (error) {
      console.error('Database error in deleteEmailVerificationToken:', error);
      throw error;
    }
  }

  // Rate Limiting Methods
  async getRateLimitInfo(identifier: string): Promise<RateLimitInfo | null> {
    try {
      return await this.adapter.getRateLimitInfo(identifier);
    } catch (error) {
      console.error('Database error in getRateLimitInfo:', error);
      return null;
    }
  }

  async updateRateLimitInfo(identifier: string, info: RateLimitInfo): Promise<void> {
    try {
      await this.adapter.updateRateLimitInfo(identifier, info);
    } catch (error) {
      console.error('Database error in updateRateLimitInfo:', error);
      throw error;
    }
  }

  // Security Monitoring Methods (for Agent Casey integration)
  async logSecurityEvent(email: string, event: SecurityEvent): Promise<void> {
    try {
      await this.adapter.logSecurityEvent(email, event);
    } catch (error) {
      console.error('Database error in logSecurityEvent:', error);
      // Don't throw - security logging failures shouldn't break authentication flow
    }
  }

  async getSecurityEvents(email: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      return await this.adapter.getSecurityEvents(email, limit);
    } catch (error) {
      console.error('Database error in getSecurityEvents:', error);
      return [];
    }
  }

  async logSuspiciousActivity(email: string, activity: SuspiciousActivity): Promise<void> {
    try {
      await this.adapter.logSuspiciousActivity(email, activity);
    } catch (error) {
      console.error('Database error in logSuspiciousActivity:', error);
    }
  }

  async getSuspiciousActivity(timeWindow: number): Promise<SuspiciousActivity[]> {
    try {
      return await this.adapter.getSuspiciousActivity(timeWindow);
    } catch (error) {
      console.error('Database error in getSuspiciousActivity:', error);
      return [];
    }
  }

  // Session Management
  async createSession(sessionInfo: SessionInfo): Promise<void> {
    try {
      await this.adapter.createSession(sessionInfo);
    } catch (error) {
      console.error('Database error in createSession:', error);
      throw error;
    }
  }

  async getSession(sessionToken: string): Promise<any> {
    try {
      return await this.adapter.getSession(sessionToken);
    } catch (error) {
      console.error('Database error in getSession:', error);
      return null;
    }
  }

  async updateSession(sessionToken: string, updates: any): Promise<void> {
    try {
      await this.adapter.updateSession(sessionToken, updates);
    } catch (error) {
      console.error('Database error in updateSession:', error);
    }
  }

  async deleteSession(sessionToken: string): Promise<void> {
    try {
      await this.adapter.deleteSession(sessionToken);
    } catch (error) {
      console.error('Database error in deleteSession:', error);
    }
  }

  async deleteAllUserSessions(email: string): Promise<void> {
    try {
      await this.adapter.deleteAllUserSessions(email);
    } catch (error) {
      console.error('Database error in deleteAllUserSessions:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getUserCount(): Promise<number> {
    try {
      return await this.adapter.getUserCount();
    } catch (error) {
      console.error('Database error in getUserCount:', error);
      return 0;
    }
  }

  async getActiveUserCount(timeWindow: number): Promise<number> {
    try {
      return await this.adapter.getActiveUserCount(timeWindow);
    } catch (error) {
      console.error('Database error in getActiveUserCount:', error);
      return 0;
    }
  }

  // Database Health and Maintenance
  async checkHealth(): Promise<boolean> {
    try {
      const healthCheck = await this.adapter.checkConnection();
      return healthCheck.healthy;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  async performMaintenance(): Promise<void> {
    try {
      // Run cleanup operations
      await this.adapter.cleanupExpiredPasswordResetTokens();
      await this.adapter.cleanupExpiredEmailVerificationTokens();
      await this.adapter.cleanupExpiredSessions();
      await this.adapter.cleanupExpiredRateLimit();
      
      // Optimize database
      await this.adapter.optimizeDatabase();
      
      console.log('✅ Database maintenance completed successfully');
    } catch (error) {
      console.error('❌ Database maintenance failed:', error);
    }
  }
}

// Create singleton instance to replace the in-memory store
const databaseUserStore = new DatabaseUserStore();

// Enhanced Rate Limiting with Database Persistence
export const EnhancedRateLimitUtils = {
  // Login rate limiting: 5 attempts per 15 minutes per IP
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
  LOGIN_MAX_ATTEMPTS: 5,
  
  // Password reset rate limiting: 3 attempts per hour per email
  PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000,
  PASSWORD_RESET_MAX_ATTEMPTS: 3,
  
  // Enhanced rate limit check with database persistence
  async checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remainingAttempts: number; resetTime: number }> {
    try {
      const now = Date.now();
      const rateLimitInfo = await databaseUserStore.getRateLimitInfo(identifier);
      
      if (!rateLimitInfo) {
        // First attempt
        await databaseUserStore.updateRateLimitInfo(identifier, {
          identifier,
          attempts: 1,
          windowStart: now,
          blocked: false
        });
        
        return {
          allowed: true,
          remainingAttempts: maxAttempts - 1,
          resetTime: now + windowMs
        };
      }
      
      // Check if window has expired
      if (now - rateLimitInfo.windowStart > windowMs) {
        // Reset window
        await databaseUserStore.updateRateLimitInfo(identifier, {
          identifier,
          attempts: 1,
          windowStart: now,
          blocked: false
        });
        
        return {
          allowed: true,
          remainingAttempts: maxAttempts - 1,
          resetTime: now + windowMs
        };
      }
      
      // Check if blocked
      if (rateLimitInfo.blocked && rateLimitInfo.blockedUntil && now < rateLimitInfo.blockedUntil) {
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime: rateLimitInfo.blockedUntil
        };
      }
      
      // Increment attempts
      const newAttempts = rateLimitInfo.attempts + 1;
      const blocked = newAttempts >= maxAttempts;
      
      await databaseUserStore.updateRateLimitInfo(identifier, {
        ...rateLimitInfo,
        attempts: newAttempts,
        blocked,
        blockedUntil: blocked ? now + windowMs : undefined
      });
      
      return {
        allowed: !blocked,
        remainingAttempts: Math.max(0, maxAttempts - newAttempts),
        resetTime: rateLimitInfo.windowStart + windowMs
      };
      
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On database error, allow the request but log the issue
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        resetTime: Date.now() + windowMs
      };
    }
  }
};

// Enhanced Security Monitoring with Database Persistence
export const EnhancedSecurityMonitor = {
  async logSecurityEvent(email: string, event: SecurityEvent): Promise<void> {
    await databaseUserStore.logSecurityEvent(email, event);
  },

  async checkSuspiciousActivity(
    email: string, 
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<SuspiciousActivity[]> {
    try {
      // Get recent failed login attempts
      const recentEvents = await databaseUserStore.getSecurityEvents(email, 10);
      const failedLogins = recentEvents.filter(e => e.type === 'failed_login');
      
      const suspiciousActivities: SuspiciousActivity[] = [];
      
      // Check for multiple failed logins in short time
      if (failedLogins.length >= 3) {
        const activity: SuspiciousActivity = {
          type: 'multiple_failed_logins',
          severity: 'high',
          timestamp: new Date().toISOString(),
          details: `${failedLogins.length} failed login attempts detected`,
          ipAddress: context.ipAddress
        };
        
        suspiciousActivities.push(activity);
        await databaseUserStore.logSuspiciousActivity(email, activity);
      }
      
      // TODO: Add more sophisticated suspicious activity detection
      // - Unusual location detection
      // - Device fingerprinting
      // - Behavioral analysis
      
      return suspiciousActivities;
    } catch (error) {
      console.error('Suspicious activity check failed:', error);
      return [];
    }
  },

  async shouldBlockRequest(identifier: string, context: any): Promise<boolean> {
    try {
      const rateLimitInfo = await databaseUserStore.getRateLimitInfo(identifier);
      
      if (rateLimitInfo?.blocked && rateLimitInfo.blockedUntil) {
        return Date.now() < rateLimitInfo.blockedUntil;
      }
      
      return false;
    } catch (error) {
      console.error('Block request check failed:', error);
      return false;
    }
  }
};

// Database Migration Utilities
export const DatabaseMigration = {
  async runInitialSetup(): Promise<boolean> {
    try {
      const adapter = getDatabaseAdapter();
      await adapter.initialize();
      console.log('✅ Database initial setup completed');
      return true;
    } catch (error) {
      console.error('❌ Database initial setup failed:', error);
      return false;
    }
  },

  async validateIntegrity(): Promise<{ valid: boolean; issues?: string[] }> {
    try {
      const adapter = getDatabaseAdapter();
      return await adapter.validateDatabaseIntegrity();
    } catch (error: any) {
      return {
        valid: false,
        issues: [`Integrity check failed: ${error.message}`]
      };
    }
  }
};

// Export the production user store (replaces in-memory implementation)
export const productionUserStore = databaseUserStore;
export default databaseUserStore;

// Export legacy interface for backward compatibility
export { databaseUserStore as userStore };

// Health check endpoint utility
export const createHealthCheckResponse = async () => {
  const adapter = getDatabaseAdapter();
  
  try {
    const [connectionHealth, integrityCheck, userCount] = await Promise.all([
      adapter.checkConnection(),
      adapter.checkTableIntegrity(),
      adapter.getUserCount()
    ]);

    return {
      status: connectionHealth.healthy && integrityCheck.healthy ? 'healthy' : 'degraded',
      database: {
        connection: connectionHealth.healthy,
        latency: connectionHealth.latency,
        integrity: integrityCheck.healthy,
        userCount,
        timestamp: new Date().toISOString()
      },
      issues: integrityCheck.issues
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      database: {
        connection: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};