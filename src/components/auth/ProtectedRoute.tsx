'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
  requireZipCode?: boolean;
  fallbackUrl?: string;
}

export default function ProtectedRoute({
  children,
  requireVerified = false,
  requireZipCode = true,
  fallbackUrl = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated
    if (!user) {
      router.push(fallbackUrl);
      return;
    }

    // Check ZIP code requirement
    if (requireZipCode && !user.zipCode) {
      router.push('/verify');
      return;
    }

    // Check verification requirement
    if (requireVerified && user.verificationLevel === 'anonymous') {
      router.push('/settings?prompt=verify');
      return;
    }
  }, [user, loading, requireVerified, requireZipCode, router, fallbackUrl]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-delta"></div>
      </div>
    );
  }

  // Don't render children until authentication is verified
  if (!user) {
    return null;
  }

  if (requireZipCode && !user.zipCode) {
    return null;
  }

  if (requireVerified && user.verificationLevel === 'anonymous') {
    return null;
  }

  return <>{children}</>;
}