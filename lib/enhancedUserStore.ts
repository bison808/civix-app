// Enhanced user storage for production-grade authentication
// Prepared for database integration with Agent Morgan

export interface SecureUser {
  email: string;
  passwordHash: string;
  zipCode: string;
  createdAt: string;
  lastLoginAt?: string;
  
  // Enhanced features
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string;
  
  // Password recovery
  passwordResetToken?: string;
  passwordResetExpires?: string;
  
  // Security features
  failedLoginAttempts: number;
  accountLockedUntil?: string;
  
  // Profile information
  firstName?: string;
  lastName?: string;
  profileUpdatedAt?: string;
  
  // Security questions for username recovery
  securityQuestion1?: string;
  securityAnswer1Hash?: string;
  securityQuestion2?: string;
  securityAnswer2Hash?: string;
  
  // Session management
  activeSessions: SessionInfo[];
  
  // Monitoring hooks for Agent Casey
  lastSecurityEvent?: SecurityEvent;
  suspiciousActivity: SuspiciousActivity[];
}

export interface SessionInfo {
  sessionToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface SecurityEvent {
  type: 'login' | 'failed_login' | 'password_change' | 'account_locked' | 'password_reset' | 'email_verified';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface SuspiciousActivity {
  type: 'multiple_failed_logins' | 'unusual_location' | 'password_spray' | 'account_enumeration';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
  ipAddress?: string;
}

// Password reset token storage
export interface PasswordResetToken {
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

// Email verification token storage
export interface EmailVerificationToken {
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  verified: boolean;
}

// Rate limiting storage
export interface RateLimitInfo {
  identifier: string; // IP address or email
  attempts: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}

// Global storages (in-memory for development, prepared for database integration)
const users = new Map<string, SecureUser>();
const passwordResetTokens = new Map<string, PasswordResetToken>();
const emailVerificationTokens = new Map<string, EmailVerificationToken>();
const rateLimits = new Map<string, RateLimitInfo>();

// Database interface for Agent Morgan integration
export interface DatabaseAdapter {
  // User operations
  createUser(user: SecureUser): Promise<void>;
  getUser(email: string): Promise<SecureUser | null>;
  updateUser(email: string, updates: Partial<SecureUser>): Promise<void>;
  deleteUser(email: string): Promise<void>;
  
  // Token operations
  createPasswordResetToken(token: PasswordResetToken): Promise<void>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  deletePasswordResetToken(token: string): Promise<void>;
  
  createEmailVerificationToken(token: EmailVerificationToken): Promise<void>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | null>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  
  // Rate limiting
  getRateLimitInfo(identifier: string): Promise<RateLimitInfo | null>;
  updateRateLimitInfo(identifier: string, info: RateLimitInfo): Promise<void>;
  
  // Security monitoring (for Agent Casey)
  logSecurityEvent(email: string, event: SecurityEvent): Promise<void>;
  getSuspiciousActivity(timeWindow: number): Promise<SuspiciousActivity[]>;
}

// Monitoring interface for Agent Casey integration
export interface SecurityMonitor {
  logSecurityEvent(event: SecurityEvent): void;
  checkSuspiciousActivity(user: SecureUser, context: { ipAddress?: string; userAgent?: string }): SuspiciousActivity[];
  shouldBlockRequest(identifier: string, context: any): boolean;
  alertOnSuspiciousActivity(activity: SuspiciousActivity[]): void;
}

// In-memory implementation (will be replaced by Agent Morgan's database adapter)
class InMemoryUserStore {
  async getUser(email: string): Promise<SecureUser | null> {
    return users.get(email.toLowerCase()) || null;
  }
  
  async createUser(user: SecureUser): Promise<void> {
    users.set(user.email.toLowerCase(), user);
  }
  
  async updateUser(email: string, updates: Partial<SecureUser>): Promise<void> {
    const user = users.get(email.toLowerCase());
    if (user) {
      Object.assign(user, updates);
      users.set(email.toLowerCase(), user);
    }
  }
  
  async deleteUser(email: string): Promise<void> {
    users.delete(email.toLowerCase());
  }
  
  // Token management
  async createPasswordResetToken(token: PasswordResetToken): Promise<void> {
    passwordResetTokens.set(token.token, token);
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return passwordResetTokens.get(token) || null;
  }
  
  async deletePasswordResetToken(token: string): Promise<void> {
    passwordResetTokens.delete(token);
  }
  
  async createEmailVerificationToken(token: EmailVerificationToken): Promise<void> {
    emailVerificationTokens.set(token.token, token);
  }
  
  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
    return emailVerificationTokens.get(token) || null;
  }
  
  async deleteEmailVerificationToken(token: string): Promise<void> {
    emailVerificationTokens.delete(token);
  }
  
  // Rate limiting
  async getRateLimitInfo(identifier: string): Promise<RateLimitInfo | null> {
    return rateLimits.get(identifier) || null;
  }
  
  async updateRateLimitInfo(identifier: string, info: RateLimitInfo): Promise<void> {
    rateLimits.set(identifier, info);
  }
}

// Default in-memory store (will be replaced by Agent Morgan's implementation)
export const userStore = new InMemoryUserStore();

// Security utilities
export const SecurityUtils = {
  generateSecureToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  },
  
  hashSecurityAnswer(answer: string): Promise<string> {
    // Use bcrypt for consistency with password hashing
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(answer.toLowerCase().trim(), 12);
  },
  
  verifySecurityAnswer(answer: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(answer.toLowerCase().trim(), hash);
  },
  
  createSecurityEvent(
    type: SecurityEvent['type'],
    details?: string,
    ipAddress?: string,
    userAgent?: string
  ): SecurityEvent {
    return {
      type,
      timestamp: new Date().toISOString(),
      details,
      ipAddress,
      userAgent
    };
  }
};

// Rate limiting utilities
export const RateLimitUtils = {
  // Login rate limiting: 5 attempts per 15 minutes per IP
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
  LOGIN_MAX_ATTEMPTS: 5,
  
  // Password reset rate limiting: 3 attempts per hour per email
  PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000,
  PASSWORD_RESET_MAX_ATTEMPTS: 3,
  
  async checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remainingAttempts: number; resetTime: number }> {
    const now = Date.now();
    const rateLimitInfo = await userStore.getRateLimitInfo(identifier);
    
    if (!rateLimitInfo) {
      // First attempt
      await userStore.updateRateLimitInfo(identifier, {
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
      await userStore.updateRateLimitInfo(identifier, {
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
    
    await userStore.updateRateLimitInfo(identifier, {
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
  }
};

// Export legacy interface for backward compatibility
export { users } from './userStore';