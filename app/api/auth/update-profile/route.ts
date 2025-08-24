import { NextRequest, NextResponse } from 'next/server';
import { userStore, SecurityUtils } from '@/lib/enhancedUserStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, zipCode } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    const user = await userStore.getUser(emailLower);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate ZIP code if provided
    if (zipCode) {
      const zipRegex = /^\d{5}$/;
      if (!zipRegex.test(zipCode)) {
        return NextResponse.json(
          { success: false, error: 'ZIP code must be 5 digits' },
          { status: 400 }
        );
      }
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Prepare updates
    const updates: any = {
      profileUpdatedAt: new Date().toISOString(),
      lastSecurityEvent: SecurityUtils.createSecurityEvent(
        'password_change', // Using closest available event type
        'Profile updated',
        clientIP,
        request.headers.get('user-agent') || undefined
      )
    };

    // Only update provided fields
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (zipCode !== undefined) updates.zipCode = zipCode;

    // Update user profile
    await userStore.updateUser(emailLower, updates);

    // Get updated user for response
    const updatedUser = await userStore.getUser(emailLower);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        zipCode: updatedUser!.zipCode,
        profileUpdatedAt: updatedUser!.profileUpdatedAt
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Profile update failed' },
      { status: 500 }
    );
  }
}