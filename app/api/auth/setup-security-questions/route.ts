import { NextRequest, NextResponse } from 'next/server';
import { userStore, SecurityUtils } from '@/lib/enhancedUserStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, question1, answer1, question2, answer2 } = body;
    
    if (!email || !question1 || !answer1 || !question2 || !answer2) {
      return NextResponse.json(
        { success: false, error: 'All security questions and answers are required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    
    // Check if user exists
    const user = await userStore.getUser(emailLower);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash security answers
    const answer1Hash = await SecurityUtils.hashSecurityAnswer(answer1);
    const answer2Hash = await SecurityUtils.hashSecurityAnswer(answer2);
    
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Update user with security questions
    await userStore.updateUser(emailLower, {
      securityQuestion1: question1,
      securityAnswer1Hash: answer1Hash,
      securityQuestion2: question2,
      securityAnswer2Hash: answer2Hash,
      lastSecurityEvent: SecurityUtils.createSecurityEvent(
        'password_change', // Using closest available event type
        'Security questions set up',
        clientIP,
        request.headers.get('user-agent') || undefined
      )
    });

    return NextResponse.json({
      success: true,
      message: 'Security questions have been set up successfully.'
    });
    
  } catch (error) {
    console.error('Setup security questions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set up security questions' },
      { status: 500 }
    );
  }
}