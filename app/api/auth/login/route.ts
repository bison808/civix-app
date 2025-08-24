import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userStore, SecurityUtils, RateLimitUtils, SecureUser } from '@/lib/enhancedUserStore';

// Pre-populate with demo account (with hashed password)
const initializeUsers = async () => {
  const demoUser = await userStore.getUser('demo@citzn.vote');
  if (!demoUser) {
    const demoPasswordHash = await bcrypt.hash('Demo123!', 12);
    const newDemoUser: SecureUser = {
      email: 'demo@citzn.vote',
      passwordHash: demoPasswordHash,
      zipCode: '90210',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      failedLoginAttempts: 0,
      activeSessions: [],
      suspiciousActivity: []
    };
    await userStore.createUser(newDemoUser);
  }
};

export async function POST(request: NextRequest) {
  try {
    await initializeUsers();
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting for login attempts per IP
    const ipRateLimitCheck = await RateLimitUtils.checkRateLimit(
      `login_ip:${clientIP}`,
      RateLimitUtils.LOGIN_MAX_ATTEMPTS,
      RateLimitUtils.LOGIN_WINDOW_MS
    );
    
    if (!ipRateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts from this IP. Please try again later.',
          resetTime: ipRateLimitCheck.resetTime
        },
        { status: 429 }
      );
    }

    // Rate limiting for login attempts per email
    const emailRateLimitCheck = await RateLimitUtils.checkRateLimit(
      `login_email:${emailLower}`,
      RateLimitUtils.LOGIN_MAX_ATTEMPTS,
      RateLimitUtils.LOGIN_WINDOW_MS
    );
    
    if (!emailRateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts for this account. Please try again later.',
          resetTime: emailRateLimitCheck.resetTime
        },
        { status: 429 }
      );
    }

    const user = await userStore.getUser(emailLower);
    
    if (!user) {
      // Log failed attempt for non-existent user (potential account enumeration)
      const securityEvent = SecurityUtils.createSecurityEvent(
        'failed_login',
        'Login attempt for non-existent user',
        clientIP,
        userAgent
      );
      console.log('Security Event:', securityEvent);
      
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is temporarily locked due to multiple failed login attempts. Please try again later or use password reset.',
          lockedUntil: user.accountLockedUntil
        },
        { status: 423 } // 423 Locked
      );
    }

    // Verify password securely
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const maxFailedAttempts = 5;
      
      let updates: any = {
        failedLoginAttempts: failedAttempts,
        lastSecurityEvent: SecurityUtils.createSecurityEvent(
          'failed_login',
          `Failed login attempt (${failedAttempts}/${maxFailedAttempts})`,
          clientIP,
          userAgent
        )
      };

      // Lock account after max failed attempts
      if (failedAttempts >= maxFailedAttempts) {
        const lockoutDuration = 30 * 60 * 1000; // 30 minutes
        updates.accountLockedUntil = new Date(Date.now() + lockoutDuration).toISOString();
        
        updates.lastSecurityEvent = SecurityUtils.createSecurityEvent(
          'account_locked',
          `Account locked after ${failedAttempts} failed attempts`,
          clientIP,
          userAgent
        );
      }

      await userStore.updateUser(emailLower, updates);

      if (failedAttempts >= maxFailedAttempts) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Account has been locked due to multiple failed login attempts. Please use password reset or try again later.',
            lockedUntil: updates.accountLockedUntil
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts and update login time
    const sessionTimestamp = Date.now();
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomId = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const sessionToken = `session_${sessionTimestamp}_${randomId}`;
    const anonymousId = `anon_${sessionTimestamp}_${randomId}`;
    
    // Create session info
    const sessionInfo = {
      sessionToken,
      deviceInfo: userAgent,
      ipAddress: clientIP,
      userAgent,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    // Update user with successful login
    await userStore.updateUser(emailLower, {
      lastLoginAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      accountLockedUntil: undefined,
      activeSessions: [...(user.activeSessions || []), sessionInfo],
      lastSecurityEvent: SecurityUtils.createSecurityEvent(
        'login',
        'Successful login',
        clientIP,
        userAgent
      )
    });
    
    const response = {
      success: true,
      sessionToken,
      anonymousId,
      user: {
        id: `user_${emailLower.replace('@', '_').replace('.', '_')}`,
        email: user.email,
        zipCode: user.zipCode,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationLevel: user.emailVerified ? 'authenticated' : 'unverified',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    };
    
    // Set secure authentication cookies
    const res = NextResponse.json(response);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    };
    
    res.cookies.set('sessionToken', sessionToken, cookieOptions);
    res.cookies.set('anonymousId', anonymousId, cookieOptions);
    res.cookies.set('userZipCode', user.zipCode, cookieOptions);
    res.cookies.set('verificationLevel', user.emailVerified ? 'authenticated' : 'unverified', cookieOptions);
    
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}