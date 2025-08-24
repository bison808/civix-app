// Database Integration Test Suite
// Agent Morgan (Database Architecture & Data Relationships Specialist)
// Comprehensive testing of database adapter integration with authentication system

import { productionUserStore, EnhancedRateLimitUtils, EnhancedSecurityMonitor, DatabaseMigration } from './integration';
import { getDatabaseAdapter, checkDatabaseHealth } from './config';
import { SecureUser, SecurityEvent, SuspiciousActivity } from '../enhancedUserStore';
import bcrypt from 'bcryptjs';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration?: number;
  details?: any;
}

export interface TestSuite {
  suiteName: string;
  results: TestResult[];
  passed: number;
  failed: number;
  totalDuration: number;
  overallPassed: boolean;
}

export class DatabaseIntegrationTester {
  private testUser: SecureUser;
  private testEmail = 'test.morgan@citzn.com';

  constructor() {
    this.testUser = this.createTestUser();
  }

  // Run all integration tests
  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting Database Integration Test Suite...\n');

    const suites: TestSuite[] = [
      await this.testDatabaseConnection(),
      await this.testUserOperations(),
      await this.testTokenOperations(),
      await this.testRateLimiting(),
      await this.testSecurityMonitoring(),
      await this.testSessionManagement(),
      await this.testMaintenance()
    ];

    // Print summary
    const overallPassed = suites.every(suite => suite.overallPassed);
    const totalTests = suites.reduce((sum, suite) => sum + suite.results.length, 0);
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalDuration = suites.reduce((sum, suite) => sum + suite.totalDuration, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 DATABASE INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Overall: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('='.repeat(60));

    return suites;
  }

  // Test database connection and health
  private async testDatabaseConnection(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Database Connection',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('🔌 Testing Database Connection...');

    // Test 1: Basic connection
    suite.results.push(await this.runTest('Basic Connection', async () => {
      const adapter = getDatabaseAdapter();
      const health = await adapter.checkConnection();
      if (!health.healthy) {
        throw new Error(health.error || 'Connection unhealthy');
      }
      return { latency: health.latency };
    }));

    // Test 2: Database health check
    suite.results.push(await this.runTest('Health Check', async () => {
      const health = await checkDatabaseHealth();
      if (!health.healthy) {
        throw new Error(health.error || 'Health check failed');
      }
      return { 
        latency: health.latency,
        connection: health.details.connection,
        integrity: health.details.integrity
      };
    }));

    // Test 3: Database initialization
    suite.results.push(await this.runTest('Database Initialization', async () => {
      const success = await DatabaseMigration.runInitialSetup();
      if (!success) {
        throw new Error('Database initialization failed');
      }
      return { initialized: true };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Test user CRUD operations
  private async testUserOperations(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'User Operations',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('👤 Testing User Operations...');

    // Cleanup any existing test user
    try {
      await productionUserStore.deleteUser(this.testEmail);
    } catch (e) {
      // Ignore if user doesn't exist
    }

    // Test 1: Create user
    suite.results.push(await this.runTest('Create User', async () => {
      await productionUserStore.createUser(this.testUser);
      return { email: this.testUser.email };
    }));

    // Test 2: Get user
    suite.results.push(await this.runTest('Get User', async () => {
      const user = await productionUserStore.getUser(this.testEmail);
      if (!user) {
        throw new Error('User not found after creation');
      }
      if (user.email !== this.testEmail) {
        throw new Error('Email mismatch');
      }
      return { 
        email: user.email,
        zipCode: user.zipCode,
        emailVerified: user.emailVerified
      };
    }));

    // Test 3: Update user
    suite.results.push(await this.runTest('Update User', async () => {
      await productionUserStore.updateUser(this.testEmail, {
        firstName: 'Updated',
        emailVerified: true
      });
      
      const updatedUser = await productionUserStore.getUser(this.testEmail);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      if (updatedUser.firstName !== 'Updated' || !updatedUser.emailVerified) {
        throw new Error('Update did not persist');
      }
      return {
        firstName: updatedUser.firstName,
        emailVerified: updatedUser.emailVerified
      };
    }));

    // Test 4: Search users by ZIP code
    suite.results.push(await this.runTest('Search by ZIP Code', async () => {
      const users = await productionUserStore.getUserByZipCode('95110');
      const foundUser = users.find(u => u.email === this.testEmail);
      if (!foundUser) {
        throw new Error('User not found by ZIP code search');
      }
      return { foundUsers: users.length, zipCode: '95110' };
    }));

    // Test 5: Search users by name
    suite.results.push(await this.runTest('Search by Name', async () => {
      const users = await productionUserStore.searchUsersByName('Updated');
      const foundUser = users.find(u => u.email === this.testEmail);
      if (!foundUser) {
        throw new Error('User not found by name search');
      }
      return { foundUsers: users.length, searchTerm: 'Updated' };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Test token operations (password reset, email verification)
  private async testTokenOperations(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Token Operations',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('🎫 Testing Token Operations...');

    const resetToken = 'test-reset-token-' + Date.now();
    const verificationToken = 'test-verification-token-' + Date.now();

    // Test 1: Create password reset token
    suite.results.push(await this.runTest('Create Password Reset Token', async () => {
      const token = {
        email: this.testEmail,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        used: false
      };
      
      await productionUserStore.createPasswordResetToken(token);
      return { token: resetToken };
    }));

    // Test 2: Get password reset token
    suite.results.push(await this.runTest('Get Password Reset Token', async () => {
      const token = await productionUserStore.getPasswordResetToken(resetToken);
      if (!token) {
        throw new Error('Token not found');
      }
      if (token.email !== this.testEmail || token.used) {
        throw new Error('Token data incorrect');
      }
      return { email: token.email, used: token.used };
    }));

    // Test 3: Create email verification token
    suite.results.push(await this.runTest('Create Email Verification Token', async () => {
      const token = {
        email: this.testEmail,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        verified: false
      };
      
      await productionUserStore.createEmailVerificationToken(token);
      return { token: verificationToken };
    }));

    // Test 4: Get email verification token
    suite.results.push(await this.runTest('Get Email Verification Token', async () => {
      const token = await productionUserStore.getEmailVerificationToken(verificationToken);
      if (!token) {
        throw new Error('Token not found');
      }
      if (token.email !== this.testEmail || token.verified) {
        throw new Error('Token data incorrect');
      }
      return { email: token.email, verified: token.verified };
    }));

    // Test 5: Delete tokens
    suite.results.push(await this.runTest('Delete Tokens', async () => {
      await productionUserStore.deletePasswordResetToken(resetToken);
      await productionUserStore.deleteEmailVerificationToken(verificationToken);
      
      const deletedReset = await productionUserStore.getPasswordResetToken(resetToken);
      const deletedVerification = await productionUserStore.getEmailVerificationToken(verificationToken);
      
      if (deletedReset || deletedVerification) {
        throw new Error('Tokens not properly deleted');
      }
      return { deleted: true };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Test rate limiting functionality
  private async testRateLimiting(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Rate Limiting',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('⏱️  Testing Rate Limiting...');

    const testIP = '192.168.1.100';

    // Test 1: First attempt should be allowed
    suite.results.push(await this.runTest('First Attempt Allowed', async () => {
      const result = await EnhancedRateLimitUtils.checkRateLimit(
        testIP,
        3,
        60000 // 1 minute window
      );
      
      if (!result.allowed) {
        throw new Error('First attempt should be allowed');
      }
      if (result.remainingAttempts !== 2) {
        throw new Error(`Expected 2 remaining attempts, got ${result.remainingAttempts}`);
      }
      return { 
        allowed: result.allowed,
        remainingAttempts: result.remainingAttempts
      };
    }));

    // Test 2: Multiple attempts within limit
    suite.results.push(await this.runTest('Multiple Attempts Within Limit', async () => {
      // Second attempt
      const result2 = await EnhancedRateLimitUtils.checkRateLimit(testIP, 3, 60000);
      if (!result2.allowed || result2.remainingAttempts !== 1) {
        throw new Error('Second attempt failed');
      }
      
      // Third attempt (should still be allowed)
      const result3 = await EnhancedRateLimitUtils.checkRateLimit(testIP, 3, 60000);
      if (!result3.allowed || result3.remainingAttempts !== 0) {
        throw new Error('Third attempt failed');
      }
      
      return { attempts: 3, lastAllowed: result3.allowed };
    }));

    // Test 3: Exceeding rate limit
    suite.results.push(await this.runTest('Rate Limit Exceeded', async () => {
      const result = await EnhancedRateLimitUtils.checkRateLimit(testIP, 3, 60000);
      
      if (result.allowed) {
        throw new Error('Fourth attempt should be blocked');
      }
      if (result.remainingAttempts !== 0) {
        throw new Error('Should have 0 remaining attempts');
      }
      
      return { 
        blocked: !result.allowed,
        remainingAttempts: result.remainingAttempts
      };
    }));

    // Test 4: Different IP should not be affected
    suite.results.push(await this.runTest('Different IP Not Affected', async () => {
      const differentIP = '192.168.1.101';
      const result = await EnhancedRateLimitUtils.checkRateLimit(differentIP, 3, 60000);
      
      if (!result.allowed) {
        throw new Error('Different IP should not be rate limited');
      }
      
      return { 
        differentIP,
        allowed: result.allowed,
        remainingAttempts: result.remainingAttempts
      };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Test security monitoring functionality
  private async testSecurityMonitoring(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Security Monitoring',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('🛡️  Testing Security Monitoring...');

    // Test 1: Log security event
    suite.results.push(await this.runTest('Log Security Event', async () => {
      const event: SecurityEvent = {
        type: 'login',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        userAgent: 'Test Agent',
        details: 'Test login event'
      };
      
      await productionUserStore.logSecurityEvent(this.testEmail, event);
      return { eventType: event.type, timestamp: event.timestamp };
    }));

    // Test 2: Get security events
    suite.results.push(await this.runTest('Get Security Events', async () => {
      const events = await productionUserStore.getSecurityEvents(this.testEmail, 10);
      
      if (events.length === 0) {
        throw new Error('No security events found');
      }
      
      const loginEvent = events.find(e => e.type === 'login');
      if (!loginEvent) {
        throw new Error('Login event not found');
      }
      
      return { 
        totalEvents: events.length,
        hasLoginEvent: !!loginEvent
      };
    }));

    // Test 3: Log suspicious activity
    suite.results.push(await this.runTest('Log Suspicious Activity', async () => {
      const activity: SuspiciousActivity = {
        type: 'multiple_failed_logins',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        details: 'Test suspicious activity',
        ipAddress: '192.168.1.100'
      };
      
      await productionUserStore.logSuspiciousActivity(this.testEmail, activity);
      return { activityType: activity.type, severity: activity.severity };
    }));

    // Test 4: Enhanced security monitoring
    suite.results.push(await this.runTest('Enhanced Security Monitoring', async () => {
      // Create multiple failed login events to trigger suspicious activity detection
      for (let i = 0; i < 3; i++) {
        await productionUserStore.logSecurityEvent(this.testEmail, {
          type: 'failed_login',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Test Agent'
        });
      }
      
      const suspiciousActivities = await EnhancedSecurityMonitor.checkSuspiciousActivity(
        this.testEmail,
        { ipAddress: '192.168.1.100', userAgent: 'Test Agent' }
      );
      
      if (suspiciousActivities.length === 0) {
        throw new Error('Expected suspicious activity to be detected');
      }
      
      return { 
        detectedActivities: suspiciousActivities.length,
        activityTypes: suspiciousActivities.map(a => a.type)
      };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Test session management
  private async testSessionManagement(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Session Management',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('📱 Testing Session Management...');

    const sessionToken = 'test-session-' + Date.now();

    // Test 1: Create session
    suite.results.push(await this.runTest('Create Session', async () => {
      const sessionInfo = {
        sessionToken,
        deviceInfo: 'Test Device',
        ipAddress: '192.168.1.100',
        userAgent: 'Test Agent',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      };
      
      await productionUserStore.createSession(sessionInfo);
      return { sessionToken };
    }));

    // Test 2: Get session
    suite.results.push(await this.runTest('Get Session', async () => {
      const session = await productionUserStore.getSession(sessionToken);
      
      if (!session) {
        throw new Error('Session not found');
      }
      if (session.sessionToken !== sessionToken) {
        throw new Error('Session token mismatch');
      }
      
      return { 
        sessionToken: session.sessionToken,
        deviceInfo: session.deviceInfo
      };
    }));

    // Test 3: Update session
    suite.results.push(await this.runTest('Update Session', async () => {
      await productionUserStore.updateSession(sessionToken, {
        lastActiveAt: new Date().toISOString()
      });
      
      // Verify update worked
      const session = await productionUserStore.getSession(sessionToken);
      if (!session) {
        throw new Error('Session not found after update');
      }
      
      return { updated: true };
    }));

    // Test 4: Delete session
    suite.results.push(await this.runTest('Delete Session', async () => {
      await productionUserStore.deleteSession(sessionToken);
      
      // Should not be able to get session after deletion
      const deletedSession = await productionUserStore.getSession(sessionToken);
      if (deletedSession) {
        throw new Error('Session still exists after deletion');
      }
      
      return { deleted: true };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Test database maintenance operations
  private async testMaintenance(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Database Maintenance',
      results: [],
      passed: 0,
      failed: 0,
      totalDuration: 0,
      overallPassed: false
    };

    console.log('🔧 Testing Database Maintenance...');

    // Test 1: Database integrity check
    suite.results.push(await this.runTest('Database Integrity Check', async () => {
      const integrity = await DatabaseMigration.validateIntegrity();
      return { 
        valid: integrity.valid,
        issues: integrity.issues?.length || 0
      };
    }));

    // Test 2: User count analytics
    suite.results.push(await this.runTest('User Count Analytics', async () => {
      const userCount = await productionUserStore.getUserCount();
      if (userCount < 1) {
        throw new Error('Expected at least one user (test user)');
      }
      return { userCount };
    }));

    // Test 3: Active user count
    suite.results.push(await this.runTest('Active User Count', async () => {
      const activeCount = await productionUserStore.getActiveUserCount(86400000); // 24 hours
      return { activeCount };
    }));

    // Test 4: Database health check
    suite.results.push(await this.runTest('Database Health Check', async () => {
      const isHealthy = await productionUserStore.checkHealth();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }
      return { healthy: isHealthy };
    }));

    // Test 5: Maintenance operations
    suite.results.push(await this.runTest('Maintenance Operations', async () => {
      await productionUserStore.performMaintenance();
      return { maintenanceCompleted: true };
    }));

    // Cleanup test user
    suite.results.push(await this.runTest('Cleanup Test User', async () => {
      await productionUserStore.deleteUser(this.testEmail);
      
      // Verify deletion
      const deletedUser = await productionUserStore.getUser(this.testEmail);
      if (deletedUser) {
        throw new Error('Test user not properly deleted');
      }
      
      return { cleaned: true };
    }));

    this.calculateSuiteResults(suite);
    return suite;
  }

  // Helper method to run individual tests
  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ ${testName} (${duration}ms)`);
      return {
        testName,
        passed: true,
        duration,
        details: result
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      console.log(`  ❌ ${testName} (${duration}ms) - ${error.message}`);
      return {
        testName,
        passed: false,
        duration,
        error: error.message
      };
    }
  }

  // Calculate suite results
  private calculateSuiteResults(suite: TestSuite): void {
    suite.passed = suite.results.filter(r => r.passed).length;
    suite.failed = suite.results.filter(r => !r.passed).length;
    suite.totalDuration = suite.results.reduce((sum, r) => sum + (r.duration || 0), 0);
    suite.overallPassed = suite.failed === 0;
    
    console.log(`  📊 Suite Results: ${suite.passed}/${suite.results.length} passed (${suite.totalDuration.toFixed(2)}ms)\n`);
  }

  // Create test user
  private createTestUser(): SecureUser {
    return {
      email: this.testEmail,
      passwordHash: bcrypt.hashSync('TestPassword123!', 12),
      zipCode: '95110',
      firstName: 'Test',
      lastName: 'Morgan',
      emailVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      activeSessions: [],
      suspiciousActivity: []
    };
  }
}

// Export test runner function
export const runDatabaseIntegrationTests = async (): Promise<TestSuite[]> => {
  const tester = new DatabaseIntegrationTester();
  return await tester.runAllTests();
};