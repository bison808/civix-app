import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate anonymous user credentials
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    const response = {
      success: true,
      anonymousId: `anon_${timestamp}_${randomId}`,
      sessionToken: `session_${timestamp}_${randomId}`,
      user: {
        id: `user_${timestamp}`,
        anonymousId: `anon_${timestamp}_${randomId}`,
        zipCode: body.zipCode,
        verificationLevel: 'anonymous',
        createdAt: new Date().toISOString()
      }
    };
    
    // Set cookies for authentication
    const res = NextResponse.json(response);
    res.cookies.set('anonymousId', response.anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    res.cookies.set('sessionToken', response.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}