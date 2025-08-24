import { NextRequest, NextResponse } from 'next/server';
import { userStore, SecurityUtils, RateLimitUtils } from '@/lib/enhancedUserStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    
    // Rate limiting for password reset requests
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const rateLimitCheck = await RateLimitUtils.checkRateLimit(
      `password_reset:${emailLower}`,
      RateLimitUtils.PASSWORD_RESET_MAX_ATTEMPTS,
      RateLimitUtils.PASSWORD_RESET_WINDOW_MS
    );
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many password reset attempts. Please try again later.',
          resetTime: rateLimitCheck.resetTime
        },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await userStore.getUser(emailLower);
    
    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (user) {
      // Generate secure password reset token
      const resetToken = SecurityUtils.generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      
      // Store password reset token
      await userStore.createPasswordResetToken({
        email: emailLower,
        token: resetToken,
        expiresAt,
        createdAt: new Date().toISOString(),
        used: false
      });
      
      // Update user with reset token
      await userStore.updateUser(emailLower, {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
        lastSecurityEvent: SecurityUtils.createSecurityEvent(
          'password_reset',
          'Password reset requested',
          clientIP,
          request.headers.get('user-agent') || undefined
        )
      });
      
      // In production, this would send an actual email
      // For now, we'll log the reset token (Agent Morgan will implement email service)
      console.log(`Password reset for ${emailLower}: ${resetToken}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Always return success response (prevents email enumeration)
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Password reset request failed' },
      { status: 500 }
    );
  }
}