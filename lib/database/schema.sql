-- CITZN Platform Database Schema
-- Production-grade PostgreSQL schema for enterprise authentication system
-- Agent Morgan (Database Architecture & Data Relationships Specialist)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - Core user information with enhanced security features
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    
    -- Enhanced profile information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Email verification system
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    
    -- Password recovery system
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    
    -- Account security features
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Security questions for username recovery
    security_question_1 TEXT,
    security_answer_1_hash TEXT,
    security_question_2 TEXT,
    security_answer_2_hash TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    profile_updated_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_zip_code_check CHECK (zip_code ~ '^\d{5}(-\d{4})?$')
);

-- User sessions table - Track active sessions with device information
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Device and location information
    device_info TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Session lifecycle
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Session status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT
);

-- Password reset tokens table - Secure password recovery
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Token lifecycle
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Security tracking
    ip_address INET,
    user_agent TEXT
);

-- Email verification tokens table - Email verification system
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Token lifecycle
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Security tracking
    ip_address INET,
    user_agent TEXT
);

-- Rate limiting table - Prevent abuse and attacks
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP address or email
    
    -- Rate limiting data
    attempts INTEGER NOT NULL DEFAULT 0,
    window_start BIGINT NOT NULL, -- Unix timestamp in milliseconds
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_until BIGINT, -- Unix timestamp in milliseconds
    
    -- Metadata
    rate_limit_type VARCHAR(50) NOT NULL, -- 'login', 'password_reset', etc.
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Unique constraint for identifier and type combination
    UNIQUE(identifier, rate_limit_type)
);

-- Security events table - Comprehensive security monitoring
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow orphaned events for analysis
    email VARCHAR(255), -- Store email for reference even if user is deleted
    
    -- Event details
    event_type VARCHAR(100) NOT NULL, -- 'login', 'failed_login', 'password_change', etc.
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Context information
    ip_address INET,
    user_agent TEXT,
    details JSONB, -- Flexible storage for event-specific data
    
    -- Risk assessment
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    
    -- Processing status
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    INDEX idx_security_events_user_id (user_id),
    INDEX idx_security_events_email (email),
    INDEX idx_security_events_type (event_type),
    INDEX idx_security_events_timestamp (timestamp),
    INDEX idx_security_events_ip (ip_address),
    INDEX idx_security_events_risk_level (risk_level)
);

-- Suspicious activity table - Advanced threat detection
CREATE TABLE suspicious_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    
    -- Activity classification
    activity_type VARCHAR(100) NOT NULL, -- 'multiple_failed_logins', 'unusual_location', etc.
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Activity details
    details JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Geographic information
    location_data JSONB, -- Country, region, city if available
    
    -- Response tracking
    investigated BOOLEAN NOT NULL DEFAULT FALSE,
    investigated_at TIMESTAMP WITH TIME ZONE,
    investigated_by VARCHAR(255),
    resolution TEXT,
    
    -- Automated response
    auto_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    manual_review_required BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Indexes for performance
    INDEX idx_suspicious_activities_user_id (user_id),
    INDEX idx_suspicious_activities_email (email),
    INDEX idx_suspicious_activities_type (activity_type),
    INDEX idx_suspicious_activities_severity (severity),
    INDEX idx_suspicious_activities_timestamp (timestamp),
    INDEX idx_suspicious_activities_ip (ip_address)
);

-- User analytics table - Track user engagement and platform usage
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Analytics data
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'bill_interaction', 'representative_contact', etc.
    event_data JSONB,
    
    -- Context
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Geographic context (for regional analysis)
    zip_code VARCHAR(10),
    state VARCHAR(50),
    
    -- Indexes for analytics queries
    INDEX idx_user_analytics_user_id (user_id),
    INDEX idx_user_analytics_event_type (event_type),
    INDEX idx_user_analytics_timestamp (timestamp),
    INDEX idx_user_analytics_zip_code (zip_code),
    INDEX idx_user_analytics_state (state)
);

-- Database maintenance and optimization indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_zip_code ON users(zip_code);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login_at ON users(last_login_at);
CREATE INDEX idx_users_email_verified ON users(email_verified);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_used ON password_reset_tokens(used);

CREATE INDEX idx_email_verification_tokens_email ON email_verification_tokens(email);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
CREATE INDEX idx_email_verification_tokens_verified ON email_verification_tokens(verified);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX idx_rate_limits_type ON rate_limits(rate_limit_type);
CREATE INDEX idx_rate_limits_blocked ON rate_limits(blocked);
CREATE INDEX idx_rate_limits_updated_at ON rate_limits(updated_at);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data retention policies (commented out for manual execution)
-- Clean up expired tokens automatically
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW();
-- DELETE FROM email_verification_tokens WHERE expires_at < NOW();
-- DELETE FROM user_sessions WHERE expires_at < NOW();

-- Archive old security events (keep 2 years)
-- DELETE FROM security_events WHERE timestamp < NOW() - INTERVAL '2 years';

-- Archive old suspicious activities (keep 3 years for analysis)
-- DELETE FROM suspicious_activities WHERE timestamp < NOW() - INTERVAL '3 years' AND investigated = TRUE;

-- Performance optimization: Analyze tables for query planner
-- ANALYZE users;
-- ANALYZE user_sessions;
-- ANALYZE security_events;
-- ANALYZE suspicious_activities;

-- Security: Create application-specific database user
-- This would be done in production deployment scripts:
-- CREATE USER citzn_app WITH PASSWORD 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO citzn_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO citzn_app;