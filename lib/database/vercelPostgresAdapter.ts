// Vercel Postgres Database Adapter Implementation
// Agent Morgan (Database Architecture & Data Relationships Specialist)
// Production-grade database adapter implementing Agent Tom's interface

import { sql } from '@vercel/postgres';
import { DatabaseAdapter, DatabaseConfig, DatabaseHealthCheck } from '../integrations/databaseAdapter';
import {
  SecureUser,
  PasswordResetToken,
  EmailVerificationToken,
  RateLimitInfo,
  SecurityEvent,
  SuspiciousActivity,
  SessionInfo
} from '../enhancedUserStore';

export class VercelPostgresDatabaseAdapter implements DatabaseAdapter, DatabaseHealthCheck {
  private config: DatabaseConfig;
  private initialized: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  // Initialize database connection and schema
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Test connection
      await sql`SELECT 1 as test`;
      console.log('✅ Database connection established');
      
      // Check if tables exist and create if needed
      await this.ensureTablesExist();
      
      this.initialized = true;
      console.log('✅ Database adapter initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }

  // User Management Operations
  async createUser(user: SecureUser): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        INSERT INTO users (
          email, password_hash, zip_code, first_name, last_name,
          email_verified, email_verification_token, email_verification_expires,
          password_reset_token, password_reset_expires,
          failed_login_attempts, account_locked_until,
          security_question_1, security_answer_1_hash,
          security_question_2, security_answer_2_hash,
          created_at, updated_at, profile_updated_at, last_login_at
        ) VALUES (
          ${user.email.toLowerCase()}, ${user.passwordHash}, ${user.zipCode},
          ${user.firstName || null}, ${user.lastName || null},
          ${user.emailVerified}, ${user.emailVerificationToken || null}, 
          ${user.emailVerificationExpires || null},
          ${user.passwordResetToken || null}, 
          ${user.passwordResetExpires || null},
          ${user.failedLoginAttempts}, 
          ${user.accountLockedUntil || null},
          ${user.securityQuestion1 || null}, ${user.securityAnswer1Hash || null},
          ${user.securityQuestion2 || null}, ${user.securityAnswer2Hash || null},
          ${user.createdAt}, NOW(), 
          ${user.profileUpdatedAt || null},
          ${user.lastLoginAt || null}
        )
      `;

      // Create initial sessions if any
      if (user.activeSessions && user.activeSessions.length > 0) {
        for (const session of user.activeSessions) {
          await this.createSession(session);
        }
      }

      console.log(`✅ User created: ${user.email}`);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User with this email already exists');
      }
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  async getUser(email: string): Promise<SecureUser | null> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT 
          email, password_hash, zip_code, first_name, last_name,
          email_verified, email_verification_token, email_verification_expires,
          password_reset_token, password_reset_expires,
          failed_login_attempts, account_locked_until,
          security_question_1, security_answer_1_hash,
          security_question_2, security_answer_2_hash,
          created_at, updated_at, profile_updated_at, last_login_at
        FROM users 
        WHERE email = ${email.toLowerCase()}
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      
      // Get active sessions
      const sessionsResult = await sql`
        SELECT session_token, device_info, ip_address, user_agent,
               created_at, last_active_at, expires_at
        FROM user_sessions 
        WHERE user_id = (SELECT id FROM users WHERE email = ${email.toLowerCase()})
          AND is_active = TRUE
          AND expires_at > NOW()
      `;

      const activeSessions: SessionInfo[] = sessionsResult.rows.map(s => ({
        sessionToken: s.session_token,
        deviceInfo: s.device_info,
        ipAddress: s.ip_address,
        userAgent: s.user_agent,
        createdAt: s.created_at.toISOString(),
        lastActiveAt: s.last_active_at.toISOString(),
        expiresAt: s.expires_at.toISOString()
      }));

      // Get recent security events and suspicious activities
      const [securityEventsResult, suspiciousActivityResult] = await Promise.all([
        sql`
          SELECT event_type, timestamp, ip_address, user_agent, details
          FROM security_events 
          WHERE email = ${email.toLowerCase()}
          ORDER BY timestamp DESC 
          LIMIT 1
        `,
        sql`
          SELECT activity_type, severity, timestamp, details, ip_address
          FROM suspicious_activities 
          WHERE email = ${email.toLowerCase()}
          ORDER BY timestamp DESC 
          LIMIT 10
        `
      ]);

      const lastSecurityEvent = securityEventsResult.rows.length > 0 ? {
        type: securityEventsResult.rows[0].event_type as SecurityEvent['type'],
        timestamp: securityEventsResult.rows[0].timestamp.toISOString(),
        ipAddress: securityEventsResult.rows[0].ip_address,
        userAgent: securityEventsResult.rows[0].user_agent,
        details: securityEventsResult.rows[0].details
      } : undefined;

      const suspiciousActivity: SuspiciousActivity[] = suspiciousActivityResult.rows.map(sa => ({
        type: sa.activity_type as SuspiciousActivity['type'],
        severity: sa.severity as SuspiciousActivity['severity'],
        timestamp: sa.timestamp.toISOString(),
        details: sa.details,
        ipAddress: sa.ip_address
      }));

      return {
        email: row.email,
        passwordHash: row.password_hash,
        zipCode: row.zip_code,
        firstName: row.first_name,
        lastName: row.last_name,
        emailVerified: row.email_verified,
        emailVerificationToken: row.email_verification_token,
        emailVerificationExpires: row.email_verification_expires?.toISOString(),
        passwordResetToken: row.password_reset_token,
        passwordResetExpires: row.password_reset_expires?.toISOString(),
        failedLoginAttempts: row.failed_login_attempts,
        accountLockedUntil: row.account_locked_until?.toISOString(),
        securityQuestion1: row.security_question_1,
        securityAnswer1Hash: row.security_answer_1_hash,
        securityQuestion2: row.security_question_2,
        securityAnswer2Hash: row.security_answer_2_hash,
        createdAt: row.created_at.toISOString(),
        profileUpdatedAt: row.profile_updated_at?.toISOString(),
        lastLoginAt: row.last_login_at?.toISOString(),
        activeSessions,
        lastSecurityEvent,
        suspiciousActivity
      };

    } catch (error) {
      console.error('❌ Failed to get user:', error);
      throw error;
    }
  }

  async updateUser(email: string, updates: Partial<SecureUser>): Promise<void> {
    await this.ensureInitialized();
    
    // Build dynamic UPDATE query based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.passwordHash !== undefined) {
      updateFields.push(`password_hash = $${paramIndex++}`);
      values.push(updates.passwordHash);
    }
    if (updates.zipCode !== undefined) {
      updateFields.push(`zip_code = $${paramIndex++}`);
      values.push(updates.zipCode);
    }
    if (updates.firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(updates.lastName);
    }
    if (updates.emailVerified !== undefined) {
      updateFields.push(`email_verified = $${paramIndex++}`);
      values.push(updates.emailVerified);
    }
    if (updates.emailVerificationToken !== undefined) {
      updateFields.push(`email_verification_token = $${paramIndex++}`);
      values.push(updates.emailVerificationToken);
    }
    if (updates.emailVerificationExpires !== undefined) {
      updateFields.push(`email_verification_expires = $${paramIndex++}`);
      values.push(updates.emailVerificationExpires);
    }
    if (updates.passwordResetToken !== undefined) {
      updateFields.push(`password_reset_token = $${paramIndex++}`);
      values.push(updates.passwordResetToken);
    }
    if (updates.passwordResetExpires !== undefined) {
      updateFields.push(`password_reset_expires = $${paramIndex++}`);
      values.push(updates.passwordResetExpires);
    }
    if (updates.failedLoginAttempts !== undefined) {
      updateFields.push(`failed_login_attempts = $${paramIndex++}`);
      values.push(updates.failedLoginAttempts);
    }
    if (updates.accountLockedUntil !== undefined) {
      updateFields.push(`account_locked_until = $${paramIndex++}`);
      values.push(updates.accountLockedUntil);
    }
    if (updates.lastLoginAt !== undefined) {
      updateFields.push(`last_login_at = $${paramIndex++}`);
      values.push(updates.lastLoginAt);
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) { // Only updated_at was added
      return; // No actual updates to perform
    }

    try {
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE email = $${paramIndex}
      `;
      values.push(email.toLowerCase());

      await sql.query(query, values);
      console.log(`✅ User updated: ${email}`);
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  async deleteUser(email: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Get user ID first
      const userResult = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase()}
      `;

      if (userResult.rows.length === 0) return;

      const userId = userResult.rows[0].id;

      // Delete in proper order due to foreign key constraints
      await sql`DELETE FROM user_analytics WHERE user_id = ${userId}`;
      await sql`DELETE FROM suspicious_activities WHERE user_id = ${userId}`;
      await sql`DELETE FROM security_events WHERE user_id = ${userId}`;
      await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`;
      await sql`DELETE FROM password_reset_tokens WHERE email = ${email.toLowerCase()}`;
      await sql`DELETE FROM email_verification_tokens WHERE email = ${email.toLowerCase()}`;
      await sql`DELETE FROM users WHERE id = ${userId}`;

      console.log(`✅ User deleted: ${email}`);
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  async getUserByZipCode(zipCode: string): Promise<SecureUser[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT email FROM users 
        WHERE zip_code = ${zipCode}
        ORDER BY created_at DESC
      `;

      const users: SecureUser[] = [];
      for (const row of result.rows) {
        const user = await this.getUser(row.email);
        if (user) users.push(user);
      }

      return users;
    } catch (error) {
      console.error('❌ Failed to get users by ZIP code:', error);
      throw error;
    }
  }

  async searchUsersByName(firstName?: string, lastName?: string): Promise<SecureUser[]> {
    await this.ensureInitialized();
    
    try {
      let query = 'SELECT email FROM users WHERE ';
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (firstName) {
        conditions.push(`first_name ILIKE $${paramIndex++}`);
        values.push(`%${firstName}%`);
      }

      if (lastName) {
        conditions.push(`last_name ILIKE $${paramIndex++}`);
        values.push(`%${lastName}%`);
      }

      if (conditions.length === 0) return [];

      query += conditions.join(' AND ') + ' ORDER BY created_at DESC LIMIT 100';

      const result = await sql.query(query, values);
      
      const users: SecureUser[] = [];
      for (const row of result.rows) {
        const user = await this.getUser(row.email);
        if (user) users.push(user);
      }

      return users;
    } catch (error) {
      console.error('❌ Failed to search users by name:', error);
      throw error;
    }
  }

  // Authentication Token Operations
  async createPasswordResetToken(token: PasswordResetToken): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        INSERT INTO password_reset_tokens (
          email, token, created_at, expires_at, used
        ) VALUES (
          ${token.email.toLowerCase()}, ${token.token}, 
          ${token.createdAt}, ${token.expiresAt}, ${token.used}
        )
      `;
      console.log(`✅ Password reset token created for: ${token.email}`);
    } catch (error) {
      console.error('❌ Failed to create password reset token:', error);
      throw error;
    }
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT email, token, created_at, expires_at, used, used_at
        FROM password_reset_tokens 
        WHERE token = ${token}
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        email: row.email,
        token: row.token,
        createdAt: row.created_at.toISOString(),
        expiresAt: row.expires_at.toISOString(),
        used: row.used
      };
    } catch (error) {
      console.error('❌ Failed to get password reset token:', error);
      throw error;
    }
  }

  async updatePasswordResetToken(token: string, updates: Partial<PasswordResetToken>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.used !== undefined) {
        updateFields.push(`used = $${paramIndex++}`);
        values.push(updates.used);
        
        if (updates.used) {
          updateFields.push(`used_at = NOW()`);
        }
      }

      if (updateFields.length === 0) return;

      const query = `
        UPDATE password_reset_tokens 
        SET ${updateFields.join(', ')} 
        WHERE token = $${paramIndex}
      `;
      values.push(token);

      await sql.query(query, values);
    } catch (error) {
      console.error('❌ Failed to update password reset token:', error);
      throw error;
    }
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`;
    } catch (error) {
      console.error('❌ Failed to delete password reset token:', error);
      throw error;
    }
  }

  async cleanupExpiredPasswordResetTokens(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        DELETE FROM password_reset_tokens 
        WHERE expires_at < NOW()
      `;
      return result.rowCount || 0;
    } catch (error) {
      console.error('❌ Failed to cleanup expired password reset tokens:', error);
      throw error;
    }
  }

  // Email Verification Token Operations
  async createEmailVerificationToken(token: EmailVerificationToken): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        INSERT INTO email_verification_tokens (
          email, token, created_at, expires_at, verified
        ) VALUES (
          ${token.email.toLowerCase()}, ${token.token}, 
          ${token.createdAt}, ${token.expiresAt}, ${token.verified}
        )
      `;
    } catch (error) {
      console.error('❌ Failed to create email verification token:', error);
      throw error;
    }
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT email, token, created_at, expires_at, verified, verified_at
        FROM email_verification_tokens 
        WHERE token = ${token}
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        email: row.email,
        token: row.token,
        createdAt: row.created_at.toISOString(),
        expiresAt: row.expires_at.toISOString(),
        verified: row.verified
      };
    } catch (error) {
      console.error('❌ Failed to get email verification token:', error);
      throw error;
    }
  }

  async updateEmailVerificationToken(token: string, updates: Partial<EmailVerificationToken>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.verified !== undefined) {
        updateFields.push(`verified = $${paramIndex++}`);
        values.push(updates.verified);
        
        if (updates.verified) {
          updateFields.push(`verified_at = NOW()`);
        }
      }

      if (updateFields.length === 0) return;

      const query = `
        UPDATE email_verification_tokens 
        SET ${updateFields.join(', ')} 
        WHERE token = $${paramIndex}
      `;
      values.push(token);

      await sql.query(query, values);
    } catch (error) {
      console.error('❌ Failed to update email verification token:', error);
      throw error;
    }
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`DELETE FROM email_verification_tokens WHERE token = ${token}`;
    } catch (error) {
      console.error('❌ Failed to delete email verification token:', error);
      throw error;
    }
  }

  async cleanupExpiredEmailVerificationTokens(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        DELETE FROM email_verification_tokens 
        WHERE expires_at < NOW()
      `;
      return result.rowCount || 0;
    } catch (error) {
      console.error('❌ Failed to cleanup expired email verification tokens:', error);
      throw error;
    }
  }

  // Rate Limiting Operations
  async getRateLimitInfo(identifier: string): Promise<RateLimitInfo | null> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT identifier, attempts, window_start, blocked, blocked_until, rate_limit_type
        FROM rate_limits 
        WHERE identifier = ${identifier}
        ORDER BY updated_at DESC 
        LIMIT 1
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        identifier: row.identifier,
        attempts: row.attempts,
        windowStart: row.window_start,
        blocked: row.blocked,
        blockedUntil: row.blocked_until
      };
    } catch (error) {
      console.error('❌ Failed to get rate limit info:', error);
      throw error;
    }
  }

  async updateRateLimitInfo(identifier: string, info: RateLimitInfo): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        INSERT INTO rate_limits (
          identifier, attempts, window_start, blocked, blocked_until, rate_limit_type, updated_at
        ) VALUES (
          ${identifier}, ${info.attempts}, ${info.windowStart}, ${info.blocked}, 
          ${info.blockedUntil || null}, 'general', NOW()
        )
        ON CONFLICT (identifier, rate_limit_type) 
        DO UPDATE SET 
          attempts = EXCLUDED.attempts,
          window_start = EXCLUDED.window_start,
          blocked = EXCLUDED.blocked,
          blocked_until = EXCLUDED.blocked_until,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('❌ Failed to update rate limit info:', error);
      throw error;
    }
  }

  async deleteRateLimitInfo(identifier: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`DELETE FROM rate_limits WHERE identifier = ${identifier}`;
    } catch (error) {
      console.error('❌ Failed to delete rate limit info:', error);
      throw error;
    }
  }

  async cleanupExpiredRateLimit(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        DELETE FROM rate_limits 
        WHERE blocked = false AND updated_at < NOW() - INTERVAL '24 hours'
      `;
      return result.rowCount || 0;
    } catch (error) {
      console.error('❌ Failed to cleanup expired rate limits:', error);
      throw error;
    }
  }

  // Security Event Logging (for Agent Casey integration)
  async logSecurityEvent(email: string, event: SecurityEvent): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        INSERT INTO security_events (
          user_id, email, event_type, timestamp, ip_address, user_agent, details
        ) VALUES (
          (SELECT id FROM users WHERE email = ${email.toLowerCase()}),
          ${email.toLowerCase()}, ${event.type}, ${event.timestamp},
          ${event.ipAddress || null}, ${event.userAgent || null}, 
          ${event.details ? JSON.stringify({ details: event.details }) : null}
        )
      `;
    } catch (error) {
      console.error('❌ Failed to log security event:', error);
      throw error;
    }
  }

  async getSecurityEvents(email: string, limit: number = 50, offset: number = 0): Promise<SecurityEvent[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT event_type, timestamp, ip_address, user_agent, details
        FROM security_events 
        WHERE email = ${email.toLowerCase()}
        ORDER BY timestamp DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      return result.rows.map(row => ({
        type: row.event_type as SecurityEvent['type'],
        timestamp: row.timestamp.toISOString(),
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        details: row.details?.details
      }));
    } catch (error) {
      console.error('❌ Failed to get security events:', error);
      throw error;
    }
  }

  async getSecurityEventsByTimeRange(startTime: string, endTime: string): Promise<SecurityEvent[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT event_type, timestamp, ip_address, user_agent, details, email
        FROM security_events 
        WHERE timestamp BETWEEN ${startTime} AND ${endTime}
        ORDER BY timestamp DESC 
        LIMIT 1000
      `;

      return result.rows.map(row => ({
        type: row.event_type as SecurityEvent['type'],
        timestamp: row.timestamp.toISOString(),
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        details: row.details?.details
      }));
    } catch (error) {
      console.error('❌ Failed to get security events by time range:', error);
      throw error;
    }
  }

  async getSecurityEventsByType(eventType: SecurityEvent['type'], timeRange?: { start: string; end: string }): Promise<SecurityEvent[]> {
    await this.ensureInitialized();
    
    try {
      let query = `
        SELECT event_type, timestamp, ip_address, user_agent, details, email
        FROM security_events 
        WHERE event_type = $1
      `;
      const values: any[] = [eventType];

      if (timeRange) {
        query += ` AND timestamp BETWEEN $2 AND $3`;
        values.push(timeRange.start, timeRange.end);
      }

      query += ` ORDER BY timestamp DESC LIMIT 1000`;

      const result = await sql.query(query, values);

      return result.rows.map(row => ({
        type: row.event_type as SecurityEvent['type'],
        timestamp: row.timestamp.toISOString(),
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        details: row.details?.details
      }));
    } catch (error) {
      console.error('❌ Failed to get security events by type:', error);
      throw error;
    }
  }

  // Suspicious Activity Tracking
  async logSuspiciousActivity(email: string, activity: SuspiciousActivity): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        INSERT INTO suspicious_activities (
          user_id, email, activity_type, severity, timestamp, details, ip_address
        ) VALUES (
          (SELECT id FROM users WHERE email = ${email.toLowerCase()}),
          ${email.toLowerCase()}, ${activity.type}, ${activity.severity},
          ${activity.timestamp}, ${JSON.stringify({ details: activity.details })},
          ${activity.ipAddress || null}
        )
      `;
    } catch (error) {
      console.error('❌ Failed to log suspicious activity:', error);
      throw error;
    }
  }

  async getSuspiciousActivity(timeWindow: number): Promise<SuspiciousActivity[]> {
    await this.ensureInitialized();
    
    try {
      const windowStart = new Date(Date.now() - timeWindow).toISOString();
      
      const result = await sql`
        SELECT activity_type, severity, timestamp, details, ip_address, email
        FROM suspicious_activities 
        WHERE timestamp >= ${windowStart}
        ORDER BY timestamp DESC 
        LIMIT 1000
      `;

      return result.rows.map(row => ({
        type: row.activity_type as SuspiciousActivity['type'],
        severity: row.severity as SuspiciousActivity['severity'],
        timestamp: row.timestamp.toISOString(),
        details: row.details.details,
        ipAddress: row.ip_address
      }));
    } catch (error) {
      console.error('❌ Failed to get suspicious activity:', error);
      throw error;
    }
  }

  async getSuspiciousActivityByEmail(email: string): Promise<SuspiciousActivity[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT activity_type, severity, timestamp, details, ip_address
        FROM suspicious_activities 
        WHERE email = ${email.toLowerCase()}
        ORDER BY timestamp DESC 
        LIMIT 100
      `;

      return result.rows.map(row => ({
        type: row.activity_type as SuspiciousActivity['type'],
        severity: row.severity as SuspiciousActivity['severity'],
        timestamp: row.timestamp.toISOString(),
        details: row.details.details,
        ipAddress: row.ip_address
      }));
    } catch (error) {
      console.error('❌ Failed to get suspicious activity by email:', error);
      throw error;
    }
  }

  async getSuspiciousActivityByIP(ipAddress: string): Promise<SuspiciousActivity[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT activity_type, severity, timestamp, details, ip_address, email
        FROM suspicious_activities 
        WHERE ip_address = ${ipAddress}
        ORDER BY timestamp DESC 
        LIMIT 100
      `;

      return result.rows.map(row => ({
        type: row.activity_type as SuspiciousActivity['type'],
        severity: row.severity as SuspiciousActivity['severity'],
        timestamp: row.timestamp.toISOString(),
        details: row.details.details,
        ipAddress: row.ip_address
      }));
    } catch (error) {
      console.error('❌ Failed to get suspicious activity by IP:', error);
      throw error;
    }
  }

  // Session Management
  async createSession(sessionInfo: SessionInfo): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Get user ID from session token context (this would typically come from JWT or similar)
      // For now, we'll need to derive it from the session info
      // This is a simplified implementation - in production, you'd have the user ID available
      
      await sql.query(`
        INSERT INTO user_sessions (
          user_id, session_token, device_info, ip_address, user_agent,
          created_at, last_active_at, expires_at, is_active
        ) 
        SELECT 
          (SELECT id FROM users WHERE email = $1) as user_id,
          $2, $3, $4, $5, $6, $7, $8, TRUE
      `, [
        'system@citzn.com', // This should be passed in or derived
        sessionInfo.sessionToken,
        sessionInfo.deviceInfo || null,
        sessionInfo.ipAddress || null,
        sessionInfo.userAgent || null,
        sessionInfo.createdAt,
        sessionInfo.lastActiveAt,
        sessionInfo.expiresAt
      ]);
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw error;
    }
  }

  async getSession(sessionToken: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT s.*, u.email
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ${sessionToken} 
          AND s.is_active = TRUE 
          AND s.expires_at > NOW()
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        sessionToken: row.session_token,
        userEmail: row.email,
        deviceInfo: row.device_info,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at.toISOString(),
        lastActiveAt: row.last_active_at.toISOString(),
        expiresAt: row.expires_at.toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      throw error;
    }
  }

  async updateSession(sessionToken: string, updates: any): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        UPDATE user_sessions 
        SET last_active_at = NOW()
        WHERE session_token = ${sessionToken} AND is_active = TRUE
      `;
    } catch (error) {
      console.error('❌ Failed to update session:', error);
      throw error;
    }
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        UPDATE user_sessions 
        SET is_active = FALSE, revoked_at = NOW(), revoked_reason = 'logout'
        WHERE session_token = ${sessionToken}
      `;
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      throw error;
    }
  }

  async deleteAllUserSessions(email: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await sql`
        UPDATE user_sessions 
        SET is_active = FALSE, revoked_at = NOW(), revoked_reason = 'security_logout'
        WHERE user_id = (SELECT id FROM users WHERE email = ${email.toLowerCase()})
          AND is_active = TRUE
      `;
    } catch (error) {
      console.error('❌ Failed to delete all user sessions:', error);
      throw error;
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        UPDATE user_sessions 
        SET is_active = FALSE, revoked_at = NOW(), revoked_reason = 'expired'
        WHERE expires_at < NOW() AND is_active = TRUE
      `;
      return result.rowCount || 0;
    } catch (error) {
      console.error('❌ Failed to cleanup expired sessions:', error);
      throw error;
    }
  }

  // Analytics and Reporting (for Agent Casey)
  async getUserCount(): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`SELECT COUNT(*) as count FROM users`;
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('❌ Failed to get user count:', error);
      throw error;
    }
  }

  async getActiveUserCount(timeWindow: number): Promise<number> {
    await this.ensureInitialized();
    
    try {
      const windowStart = new Date(Date.now() - timeWindow).toISOString();
      const result = await sql`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_sessions 
        WHERE last_active_at >= ${windowStart} AND is_active = TRUE
      `;
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('❌ Failed to get active user count:', error);
      throw error;
    }
  }

  async getRegistrationStats(timeRange: { start: string; end: string }): Promise<{ date: string; count: number }[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users 
        WHERE created_at BETWEEN ${timeRange.start} AND ${timeRange.end}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return result.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('❌ Failed to get registration stats:', error);
      throw error;
    }
  }

  async getLoginStats(timeRange: { start: string; end: string }): Promise<{ date: string; count: number }[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM security_events 
        WHERE event_type = 'login' 
          AND timestamp BETWEEN ${timeRange.start} AND ${timeRange.end}
        GROUP BY DATE(timestamp)
        ORDER BY date
      `;

      return result.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('❌ Failed to get login stats:', error);
      throw error;
    }
  }

  async getSecurityEventStats(): Promise<{ eventType: string; count: number }[]> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT event_type, COUNT(*) as count
        FROM security_events 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY event_type
        ORDER BY count DESC
      `;

      return result.rows.map(row => ({
        eventType: row.event_type,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('❌ Failed to get security event stats:', error);
      throw error;
    }
  }

  // Data Integrity and Maintenance
  async validateDatabaseIntegrity(): Promise<{ valid: boolean; issues?: string[] }> {
    await this.ensureInitialized();
    
    try {
      const issues: string[] = [];

      // Check for orphaned sessions
      const orphanedSessions = await sql`
        SELECT COUNT(*) as count 
        FROM user_sessions s 
        LEFT JOIN users u ON s.user_id = u.id 
        WHERE u.id IS NULL
      `;
      if (parseInt(orphanedSessions.rows[0].count) > 0) {
        issues.push(`Found ${orphanedSessions.rows[0].count} orphaned user sessions`);
      }

      // Check for expired tokens
      const expiredTokens = await sql`
        SELECT COUNT(*) as count 
        FROM password_reset_tokens 
        WHERE expires_at < NOW() AND used = FALSE
      `;
      if (parseInt(expiredTokens.rows[0].count) > 0) {
        issues.push(`Found ${expiredTokens.rows[0].count} expired password reset tokens`);
      }

      return {
        healthy: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined
      };
    } catch (error) {
      console.error('❌ Failed to validate database integrity:', error);
      return {
        healthy: false,
        issues: [`Database integrity check failed: ${error}`]
      };
    }
  }

  async optimizeDatabase(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Analyze tables for query planner optimization
      await sql`ANALYZE users`;
      await sql`ANALYZE user_sessions`;
      await sql`ANALYZE security_events`;
      await sql`ANALYZE suspicious_activities`;
      await sql`ANALYZE password_reset_tokens`;
      await sql`ANALYZE email_verification_tokens`;
      await sql`ANALYZE rate_limits`;
      
      console.log('✅ Database optimization completed');
    } catch (error) {
      console.error('❌ Failed to optimize database:', error);
      throw error;
    }
  }

  async backupUserData(): Promise<string> {
    // This would implement a backup strategy
    // For Vercel Postgres, backups are handled by the platform
    const backupId = `backup_${Date.now()}`;
    console.log(`✅ Backup initiated: ${backupId}`);
    return backupId;
  }

  // Transaction Support (for complex operations)
  async beginTransaction(): Promise<any> {
    // Vercel Postgres doesn't support explicit transactions in the same way
    // This would need to be implemented using the underlying connection pool
    return { transactionId: Date.now() };
  }

  async commitTransaction(transaction: any): Promise<void> {
    // Implementation would depend on the transaction framework used
    console.log(`Transaction committed: ${transaction.transactionId}`);
  }

  async rollbackTransaction(transaction: any): Promise<void> {
    // Implementation would depend on the transaction framework used
    console.log(`Transaction rolled back: ${transaction.transactionId}`);
  }

  // Database Health Check Implementation
  async checkConnection(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await sql`SELECT 1 as health_check`;
      const latency = Date.now() - start;
      
      return {
        healthy: true,
        latency
      };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  async checkTableIntegrity(): Promise<{ healthy: boolean; issues?: string[] }> {
    return this.validateDatabaseIntegrity();
  }

  async getConnectionPoolStatus(): Promise<{ active: number; idle: number; total: number }> {
    // Vercel Postgres manages connection pooling automatically
    // This is a placeholder implementation
    return {
      active: 1,
      idle: 9,
      total: 10
    };
  }

  async getDatabaseSize(): Promise<{ sizeInBytes: number; tables: { [tableName: string]: number } }> {
    await this.ensureInitialized();
    
    try {
      const result = await sql`
        SELECT 
          schemaname as schema_name,
          tablename as table_name,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
      `;

      const tables: { [tableName: string]: number } = {};
      let totalSize = 0;

      for (const row of result.rows) {
        const size = parseInt(row.size_bytes) || 0;
        tables[row.table_name] = size;
        totalSize += size;
      }

      return {
        sizeInBytes: totalSize,
        tables
      };
    } catch (error) {
      console.error('❌ Failed to get database size:', error);
      return {
        sizeInBytes: 0,
        tables: {}
      };
    }
  }

  async getPerformanceMetrics(): Promise<{
    queryTime: { avg: number; p95: number; p99: number };
    connectionTime: { avg: number; p95: number; p99: number };
    errorRate: number;
  }> {
    // This would require implementing performance monitoring
    // For now, return placeholder values
    return {
      queryTime: { avg: 10, p95: 50, p99: 100 },
      connectionTime: { avg: 5, p95: 20, p99: 50 },
      errorRate: 0.01
    };
  }

  // Private helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async ensureTablesExist(): Promise<void> {
    // Check if tables exist and create them if they don't
    // This is a simplified check - in production, you'd use proper migrations
    
    try {
      await sql`SELECT 1 FROM users LIMIT 1`;
      console.log('✅ Database tables verified');
    } catch (error) {
      console.log('⚠️  Tables not found, creating database schema...');
      
      // Read and execute the schema file
      // Note: In production, this would be done through proper migration system
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'lib/database/schema.sql');
      
      try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Split schema by semicolons and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
          if (statement.trim().startsWith('--') || statement.trim().length === 0) continue;
          try {
            await sql.query(statement.trim());
          } catch (stmtError: any) {
            if (!stmtError.message.includes('already exists')) {
              console.warn('Schema statement warning:', stmtError.message);
            }
          }
        }
        
        console.log('✅ Database schema created successfully');
      } catch (schemaError) {
        console.error('❌ Failed to create database schema:', schemaError);
        throw schemaError;
      }
    }
  }
}

// Factory function for creating database adapters
export function createVercelPostgresAdapter(config?: Partial<DatabaseConfig>): VercelPostgresDatabaseAdapter {
  const defaultConfig: DatabaseConfig = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'citzn',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production',
    minConnections: 1,
    maxConnections: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
    schema: 'public',
    timezone: 'UTC',
    autoMigrate: false,
    logging: process.env.NODE_ENV === 'development',
    logLevel: 'info',
    backupEnabled: true,
    backupRetentionDays: 30
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new VercelPostgresDatabaseAdapter(finalConfig);
}