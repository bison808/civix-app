import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userStore, SecurityUtils, SecureUser } from '@/lib/enhancedUserStore';

// Password validation
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, zipCode } = body;
    
    // Input validation
    if (!email || !password || !zipCode) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and ZIP code required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Validate ZIP code (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      return NextResponse.json(
        { success: false, error: 'ZIP code must be 5 digits' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await userStore.getUser(emailLower);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Account already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password securely
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Create secure user record with enhanced features
    const newUser: SecureUser = {
      email: emailLower,
      passwordHash,
      zipCode,
      createdAt: new Date().toISOString(),
      emailVerified: false, // Start as unverified
      failedLoginAttempts: 0,
      activeSessions: [],
      suspiciousActivity: [],
      lastSecurityEvent: SecurityUtils.createSecurityEvent(
        'login', // Using closest available event type for registration
        'Account created',
        clientIP,
        request.headers.get('user-agent') || undefined
      )
    };

    await userStore.createUser(newUser);
    
    // Generate secure session tokens
    const timestamp = Date.now();
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomId = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const sessionToken = `session_${timestamp}_${randomId}`;
    const anonymousId = `anon_${timestamp}_${randomId}`;
    
    const response = {
      success: true,
      sessionToken,
      anonymousId,
      user: {
        id: `user_${emailLower.replace('@', '_').replace('.', '_')}`,
        email: emailLower,
        zipCode: zipCode,
        verificationLevel: 'authenticated',
        createdAt: newUser.createdAt
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
    res.cookies.set('userZipCode', zipCode, cookieOptions);
    res.cookies.set('verificationLevel', 'authenticated', cookieOptions);
    
    return res;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}