'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/authApi';

export type VerificationLevel = 'anonymous' | 'verified' | 'revealed';

export interface User {
  anonymousId: string;
  sessionToken: string;
  verificationLevel: VerificationLevel;
  zipCode?: string;
  location?: {
    city: string;
    state: string;
    county?: string;
  };
  email?: string;
  firstName?: string;
  lastName?: string;
  influenceWeight?: number;
  privacySettings?: {
    allowAnalytics: boolean;
    allowPublicProfile: boolean;
    dataRetentionDays: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verifyVoter: (data: any) => Promise<boolean>;
  updatePrivacySettings: (settings: any) => Promise<boolean>;
  checkSession: () => Promise<void>;
  sessionExpiry: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Check and restore session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Session expiry timer
  useEffect(() => {
    if (!sessionExpiry) return;

    const checkExpiry = () => {
      const now = new Date();
      const timeLeft = sessionExpiry.getTime() - now.getTime();

      if (timeLeft <= 0) {
        // Session expired
        logout();
        router.push('/login');
      } else if (timeLeft <= SESSION_WARNING_TIME) {
        // Show warning (could trigger a notification)
        console.log('Session expiring soon');
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionExpiry, router]);

  const checkSession = useCallback(async () => {
    setLoading(true);
    
    try {
      const sessionToken = authApi.getSessionToken();
      const anonymousId = authApi.getAnonymousId();
      
      if (!sessionToken || !anonymousId) {
        // Check if there's user data in localStorage from recent registration
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            const userLocation = typeof window !== 'undefined' ? localStorage.getItem('userLocation') : null;
            const location = userLocation ? JSON.parse(userLocation) : null;
            
            // Set user from localStorage data
            setUser({
              anonymousId: userData.id || 'temp-' + Date.now(),
              sessionToken: 'temp-session',
              verificationLevel: 'anonymous',
              zipCode: userData.zipCode || localStorage.getItem('userZipCode') || undefined,
              location: location,
              email: userData.email,
              firstName: userData.name?.split(' ')[0],
              lastName: userData.name?.split(' ')[1]
            });
            
            // Set session expiry
            const expiryTime = new Date(Date.now() + SESSION_DURATION);
            setSessionExpiry(expiryTime);
          } catch (e) {
            console.error('Failed to parse stored user:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      // Also verify that middleware-required data is available
      if (!authApi.isAuthenticatedForMiddleware()) {
        console.log('Session exists but middleware requirements not met, clearing...');
        authApi.logout();
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate session with backend
      const validation = await authApi.validateSession(sessionToken);
      
      if (validation.valid) {
        const storedSession = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
        const userData = storedSession ? JSON.parse(storedSession) : {};
        
        const userLocation = typeof window !== 'undefined' ? localStorage.getItem('userLocation') : null;
        const location = userLocation ? JSON.parse(userLocation) : null;
        
        // Also check for user data stored during registration
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const registrationData = storedUser ? JSON.parse(storedUser) : {};
        
        setUser({
          anonymousId: anonymousId,
          sessionToken: sessionToken,
          verificationLevel: validation.verificationStatus as VerificationLevel || 'anonymous',
          zipCode: typeof window !== 'undefined' ? localStorage.getItem('userZipCode') || undefined : undefined,
          location: location,
          email: registrationData.email || userData.email,
          firstName: registrationData.name?.split(' ')[0] || userData.firstName,
          lastName: registrationData.name?.split(' ')[1] || userData.lastName,
          ...userData
        });

        // Set session expiry
        const expiryTime = new Date(Date.now() + SESSION_DURATION);
        setSessionExpiry(expiryTime);
      } else {
        // Invalid session
        authApi.logout();
        setUser(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success) {
        const userLocation = typeof window !== 'undefined' ? localStorage.getItem('userLocation') : null;
        const location = userLocation ? JSON.parse(userLocation) : null;
        
        setUser({
          anonymousId: response.anonymousId,
          sessionToken: response.sessionToken,
          verificationLevel: response.verificationStatus as VerificationLevel || 'anonymous',
          email: email,
          zipCode: typeof window !== 'undefined' ? localStorage.getItem('userZipCode') || undefined : undefined,
          location: location,
        });

        // Set session expiry
        const expiryTime = new Date(Date.now() + SESSION_DURATION);
        setSessionExpiry(expiryTime);
        
        return true;
      }
      
      setError('Invalid credentials');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    }
  }, []);

  const register = useCallback(async (data: any): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApi.register(data);
      
      if (response.success) {
        const userLocation = typeof window !== 'undefined' ? localStorage.getItem('userLocation') : null;
        const location = userLocation ? JSON.parse(userLocation) : null;
        
        setUser({
          anonymousId: response.anonymousId,
          sessionToken: response.sessionToken,
          verificationLevel: 'anonymous',
          zipCode: data.zipCode,
          location: location,
          email: data.optionalIdentity?.email,
          firstName: data.optionalIdentity?.firstName,
          lastName: data.optionalIdentity?.lastName,
          privacySettings: data.privacySettings,
        });

        // Set session expiry
        const expiryTime = new Date(Date.now() + SESSION_DURATION);
        setSessionExpiry(expiryTime);
        
        return true;
      }
      
      setError('Registration failed');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setSessionExpiry(null);
    router.push('/');
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const verifyVoter = useCallback(async (data: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await authApi.verifyVoter(user.anonymousId, data);
      
      if (response.verified) {
        updateUser({
          verificationLevel: 'verified',
          influenceWeight: response.influenceWeight,
        });
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      return false;
    }
  }, [user, updateUser]);

  const updatePrivacySettings = useCallback(async (settings: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await authApi.updatePrivacySettings(user.anonymousId, settings);
      
      updateUser({
        privacySettings: settings,
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  }, [user, updateUser]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    verifyVoter,
    updatePrivacySettings,
    checkSession,
    sessionExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}