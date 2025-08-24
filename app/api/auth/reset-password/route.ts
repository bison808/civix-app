import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userStore, SecurityUtils } from '@/lib/enhancedUserStore';

// Password validation (same as registration)
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
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Get reset token info
    const resetTokenInfo = await userStore.getPasswordResetToken(token);
    
    if (!resetTokenInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    if (resetTokenInfo.used) {
      return NextResponse.json(
        { success: false, error: 'Reset token has already been used' },
        { status: 400 }
      );
    }
    
    if (SecurityUtils.isTokenExpired(resetTokenInfo.expiresAt)) {
      // Clean up expired token
      await userStore.deletePasswordResetToken(token);
      
      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Get user
    const user = await userStore.getUser(resetTokenInfo.email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Update user with new password and clear reset token
    await userStore.updateUser(resetTokenInfo.email, {
      passwordHash: newPasswordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      failedLoginAttempts: 0, // Reset failed attempts on password change
      accountLockedUntil: undefined, // Unlock account if it was locked
      lastSecurityEvent: SecurityUtils.createSecurityEvent(
        'password_change',
        'Password changed via reset token',
        clientIP,
        request.headers.get('user-agent') || undefined
      )
    });

    // Mark token as used
    await userStore.updateRateLimitInfo(token, {
      identifier: token,
      attempts: 1,
      windowStart: Date.now(),
      blocked: true // Block the token from being used again
    });

    // Delete the reset token
    await userStore.deletePasswordResetToken(token);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Password reset failed' },
      { status: 500 }
    );
  }
}