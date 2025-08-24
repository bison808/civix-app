import { NextRequest, NextResponse } from 'next/server';
import { userStore, SecurityUtils, RateLimitUtils } from '@/lib/enhancedUserStore';
import { User } from '@/types/auth.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode, answer1, answer2, firstName, lastName } = body;
    
    if (!zipCode || !answer1 || !answer2) {
      return NextResponse.json(
        { success: false, error: 'ZIP code and both security answers are required' },
        { status: 400 }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Rate limiting for username recovery attempts
    const rateLimitCheck = await RateLimitUtils.checkRateLimit(
      `username_recovery:${clientIP}`,
      3, // Max 3 attempts
      60 * 60 * 1000 // Per hour
    );
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many username recovery attempts. Please try again later.',
          resetTime: rateLimitCheck.resetTime
        },
        { status: 429 }
      );
    }

    // Search for user by ZIP code and optional name
    // In a real implementation, this would be a database query
    let matchingUser: User | null = null;
    
    // Get all users (in production, this would be a filtered database query)
    const allUsers: Record<string, User> = {}; // This is a placeholder - in production, Agent Morgan would handle this
    
    // For development, we'll iterate through our in-memory store
    // This is not efficient and should be replaced with proper database queries
    for (const [email, user] of Object.entries(allUsers)) {
      if (user.zipCode === zipCode) {
        // Check if name matches (if provided)
        if (firstName && lastName) {
          const userFirstName = user.firstName?.toLowerCase();
          const userLastName = user.lastName?.toLowerCase();
          if (userFirstName === firstName.toLowerCase() && userLastName === lastName.toLowerCase()) {
            matchingUser = user;
            break;
          }
        } else {
          // If no name provided, we need security questions to match
          if (user.securityQuestion1 && user.securityAnswer1Hash && 
              user.securityQuestion2 && user.securityAnswer2Hash) {
            matchingUser = user;
            break;
          }
        }
      }
    }
    
    if (!matchingUser) {
      return NextResponse.json(
        { success: false, error: 'No account found with the provided information' },
        { status: 404 }
      );
    }

    // Verify security answers
    if (!matchingUser.securityAnswer1Hash || !matchingUser.securityAnswer2Hash) {
      return NextResponse.json(
        { success: false, error: 'Security questions are not set up for this account' },
        { status: 400 }
      );
    }

    const answer1Valid = await SecurityUtils.verifySecurityAnswer(answer1, matchingUser.securityAnswer1Hash);
    const answer2Valid = await SecurityUtils.verifySecurityAnswer(answer2, matchingUser.securityAnswer2Hash);
    
    if (!answer1Valid || !answer2Valid) {
      return NextResponse.json(
        { success: false, error: 'Security answers are incorrect' },
        { status: 401 }
      );
    }

    // Log security event
    await userStore.updateUser(matchingUser.email, {
      lastSecurityEvent: SecurityUtils.createSecurityEvent(
        'password_change', // Using closest available event type
        'Username recovered via security questions',
        clientIP,
        request.headers.get('user-agent') || undefined
      )
    });

    // Return email (masked for privacy)
    const email = matchingUser.email;
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return NextResponse.json({
      success: true,
      message: 'Username recovered successfully',
      email: maskedEmail,
      hint: `Your email starts with ${email.substring(0, 2)} and ends with ${email.substring(email.indexOf('@'))}`
    });
    
  } catch (error) {
    console.error('Username recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Username recovery failed' },
      { status: 500 }
    );
  }
}