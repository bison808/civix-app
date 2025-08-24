// Database Configuration and Integration Setup
// Agent Morgan (Database Architecture & Data Relationships Specialist)
// Production-grade database configuration for CITZN platform

import { DatabaseConfig } from '../integrations/databaseAdapter';
import { createVercelPostgresAdapter, VercelPostgresDatabaseAdapter } from './vercelPostgresAdapter';

// Database configuration with environment-specific settings
export const getDatabaseConfig = (): DatabaseConfig => {
  // Validate required environment variables
  const requiredEnvVars = [
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL', 
    'POSTGRES_URL_NO_SSL',
    'POSTGRES_URL_NON_POOLING'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missingVars.join(', ')}\n` +
      'Please configure Vercel Postgres environment variables.'
    );
  }

  return {
    // Connection settings (derived from Vercel Postgres environment)
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'verceldb',
    username: process.env.POSTGRES_USER || 'default',
    password: process.env.POSTGRES_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production',
    
    // Connection pool settings optimized for serverless
    minConnections: 1,
    maxConnections: process.env.NODE_ENV === 'production' ? 20 : 5,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 600000, // 10 minutes
    
    // Database-specific settings
    schema: 'public',
    timezone: 'UTC',
    charset: 'utf8',
    
    // Migration settings
    migrationsPath: './lib/database/migrations',
    autoMigrate: false, // Manual migration control for production safety
    
    // Logging settings
    logging: process.env.NODE_ENV === 'development',
    logLevel: (process.env.DATABASE_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    
    // Backup settings
    backupEnabled: process.env.NODE_ENV === 'production',
    backupSchedule: '0 2 * * *', // Daily at 2 AM UTC
    backupRetentionDays: 30
  };
};

// Singleton database adapter instance
let databaseAdapter: VercelPostgresDatabaseAdapter | null = null;

// Get or create database adapter instance
export const getDatabaseAdapter = (): VercelPostgresDatabaseAdapter => {
  if (!databaseAdapter) {
    const config = getDatabaseConfig();
    databaseAdapter = createVercelPostgresAdapter(config);
    
    // Initialize the adapter
    databaseAdapter.initialize().catch(error => {
      console.error('❌ Failed to initialize database adapter:', error);
    });
  }
  
  return databaseAdapter;
};

// Database connection health check
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
  details: {
    connection: boolean;
    integrity: boolean;
    performance: any;
  };
}> => {
  try {
    const adapter = getDatabaseAdapter();
    
    // Check connection
    const connectionCheck = await adapter.checkConnection();
    
    // Check table integrity
    const integrityCheck = await adapter.checkTableIntegrity();
    
    // Get performance metrics
    const performanceMetrics = await adapter.getPerformanceMetrics();
    
    const overall = connectionCheck.healthy && integrityCheck.healthy;
    
    return {
      healthy: overall,
      latency: connectionCheck.latency,
      error: connectionCheck.error || (integrityCheck.issues?.join('; ')),
      details: {
        connection: connectionCheck.healthy,
        integrity: integrityCheck.healthy,
        performance: performanceMetrics
      }
    };
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
      details: {
        connection: false,
        integrity: false,
        performance: null
      }
    };
  }
};

// Database maintenance utilities
export const performDatabaseMaintenance = async (): Promise<{
  success: boolean;
  results: {
    expiredTokensCleanup: number;
    expiredSessionsCleanup: number;
    rateLimitCleanup: number;
    optimizationCompleted: boolean;
  };
  errors?: string[];
}> => {
  const adapter = getDatabaseAdapter();
  const errors: string[] = [];
  const results = {
    expiredTokensCleanup: 0,
    expiredSessionsCleanup: 0,
    rateLimitCleanup: 0,
    optimizationCompleted: false
  };
  
  try {
    // Cleanup expired tokens
    try {
      results.expiredTokensCleanup = await adapter.cleanupExpiredPasswordResetTokens();
      results.expiredTokensCleanup += await adapter.cleanupExpiredEmailVerificationTokens();
    } catch (error: any) {
      errors.push(`Token cleanup failed: ${error.message}`);
    }
    
    // Cleanup expired sessions
    try {
      results.expiredSessionsCleanup = await adapter.cleanupExpiredSessions();
    } catch (error: any) {
      errors.push(`Session cleanup failed: ${error.message}`);
    }
    
    // Cleanup rate limits
    try {
      results.rateLimitCleanup = await adapter.cleanupExpiredRateLimit();
    } catch (error: any) {
      errors.push(`Rate limit cleanup failed: ${error.message}`);
    }
    
    // Optimize database
    try {
      await adapter.optimizeDatabase();
      results.optimizationCompleted = true;
    } catch (error: any) {
      errors.push(`Database optimization failed: ${error.message}`);
    }
    
    return {
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: any) {
    return {
      success: false,
      results,
      errors: [`Maintenance failed: ${error.message}`]
    };
  }
};

// Environment validation for production deployment
export const validateEnvironment = (): {
  valid: boolean;
  issues: string[];
  warnings: string[];
} => {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check required environment variables
  const requiredVars = [
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NO_SSL', 
    'POSTGRES_URL_NON_POOLING'
  ];
  
  const missingRequired = requiredVars.filter(varName => !process.env[varName]);
  if (missingRequired.length > 0) {
    issues.push(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }
  
  // Check optional but recommended variables
  const recommendedVars = [
    'DATABASE_LOG_LEVEL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);
  if (missingRecommended.length > 0) {
    warnings.push(`Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }
  
  // Validate URLs
  if (process.env.POSTGRES_URL && !process.env.POSTGRES_URL.startsWith('postgres://')) {
    issues.push('POSTGRES_URL must be a valid PostgreSQL connection string');
  }
  
  // Check production settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_SECRET) {
      issues.push('NEXTAUTH_SECRET is required in production');
    }
    
    if (!process.env.NEXTAUTH_URL) {
      warnings.push('NEXTAUTH_URL should be set in production');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
};

// Migration utilities (for future use)
export const runMigrations = async (): Promise<{
  success: boolean;
  migrationsRun: string[];
  errors?: string[];
}> => {
  // This would implement a proper migration system
  // For now, it's a placeholder for future enhancement
  
  const adapter = getDatabaseAdapter();
  
  try {
    // Check if tables exist and create schema if needed
    await adapter.initialize();
    
    return {
      success: true,
      migrationsRun: ['initial_schema']
    };
  } catch (error: any) {
    return {
      success: false,
      migrationsRun: [],
      errors: [`Migration failed: ${error.message}`]
    };
  }
};

// Database backup utilities
export const performBackup = async (): Promise<{
  success: boolean;
  backupId?: string;
  error?: string;
}> => {
  try {
    const adapter = getDatabaseAdapter();
    const backupId = await adapter.backupUserData();
    
    return {
      success: true,
      backupId
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Export types for use in other modules
export type { DatabaseConfig } from '../integrations/databaseAdapter';
export type { VercelPostgresDatabaseAdapter } from './vercelPostgresAdapter';

// Export default configured adapter
export default getDatabaseAdapter;