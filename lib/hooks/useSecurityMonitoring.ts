/**
 * Security Monitoring Hook - Agent Casey
 * Integrates with Tom's authentication system for real-time security tracking
 */

import { useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/services/authApi';
import type { SecurityEvent } from '@/lib/enhancedUserStore';

interface SecurityMonitoringConfig {
  enabled?: boolean;
  trackAuthentication?: boolean;
  trackNavigation?: boolean;
  trackAPIUsage?: boolean;
  sessionId?: string;
}

interface SecurityContext {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: { lat: number; lon: number };
  };
}

export function useSecurityMonitoring(config: SecurityMonitoringConfig = {}) {
  const {
    enabled = true,
    trackAuthentication = true,
    trackNavigation = true,
    trackAPIUsage = true,
    sessionId
  } = config;

  const contextRef = useRef<SecurityContext | null>(null);
  const isInitialized = useRef(false);

  // Initialize security context
  const initializeSecurityContext = useCallback(async () => {
    if (!enabled || isInitialized.current) return;

    try {
      // Get client-side security context
      const context: SecurityContext = {
        userAgent: navigator.userAgent,
        deviceInfo: getDeviceInfo()
      };

      // Get IP address and geolocation (if available)
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        context.ipAddress = ipData.ip;

        // Basic geolocation (in production, use more sophisticated service)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              context.geolocation = {
                coordinates: {
                  lat: position.coords.latitude,
                  lon: position.coords.longitude
                }
              };
            },
            () => {
              // Geolocation not available, continue without it
            },
            { timeout: 5000, enableHighAccuracy: false }
          );
        }
      } catch (error) {
        // Continue without IP/geo data if services fail
        console.warn('Could not fetch IP/geo data:', error);
      }

      contextRef.current = context;
      isInitialized.current = true;

    } catch (error) {
      console.error('Failed to initialize security context:', error);
    }
  }, [enabled]);

  // Log security event
  const logSecurityEvent = useCallback(async (
    eventType: SecurityEvent['type'],
    details?: any
  ) => {
    if (!enabled) return;

    try {
      const event: SecurityEvent = {
        type: eventType,
        timestamp: new Date().toISOString(),
        ipAddress: contextRef.current?.ipAddress,
        userAgent: contextRef.current?.userAgent,
        details: {
          ...details,
          sessionId,
          deviceInfo: contextRef.current?.deviceInfo,
          geolocation: contextRef.current?.geolocation
        }
      };

      // Send to security monitoring API
      await fetch('/api/monitoring/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [enabled, sessionId]);

  // Track authentication events
  const trackAuthenticationEvent = useCallback(async (
    eventType: 'login_attempt' | 'login_success' | 'login_failed' | 'logout' | 'session_expired',
    additionalData?: any
  ) => {
    if (!trackAuthentication) return;

    await logSecurityEvent(eventType, {
      ...additionalData,
      authenticationFlow: true,
      timestamp: new Date().toISOString()
    });
  }, [trackAuthentication, logSecurityEvent]);

  // Track navigation events for behavioral analysis
  const trackNavigationEvent = useCallback(async (
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
  ) => {
    if (!trackNavigation) return;

    await logSecurityEvent('page_access', {
      path,
      method,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }, [trackNavigation, logSecurityEvent]);

  // Track API usage for abuse detection
  const trackAPIUsage = useCallback(async (
    endpoint: string,
    method: string,
    responseTime: number,
    status: number
  ) => {
    if (!trackAPIUsage) return;

    // Special tracking for LegiScan API (quota management)
    if (endpoint.includes('legiscan')) {
      await fetch('/api/monitoring/legiscan-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestCount: 1 })
      });
    }

    await logSecurityEvent('api_request', {
      endpoint,
      method,
      responseTime,
      status,
      timestamp: new Date().toISOString()
    });
  }, [trackAPIUsage, logSecurityEvent]);

  // Track suspicious activity
  const trackSuspiciousActivity = useCallback(async (
    activityType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any
  ) => {
    if (!enabled) return;

    await logSecurityEvent('suspicious_activity', {
      activityType,
      severity,
      ...details,
      flaggedAt: new Date().toISOString()
    });
  }, [enabled, logSecurityEvent]);

  // Enhanced authentication wrapper
  const monitoredAuthAction = useCallback(async <T>(
    authAction: () => Promise<T>,
    actionType: 'login' | 'register' | 'logout' | 'password_reset'
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      await trackAuthenticationEvent(`${actionType}_attempt` as any);
      
      const result = await authAction();
      const duration = Date.now() - startTime;
      
      await trackAuthenticationEvent(`${actionType}_success` as any, { duration });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await trackAuthenticationEvent(`${actionType}_failed` as any, {
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Check for potential brute force attempts
      if (actionType === 'login' && duration < 1000) {
        await trackSuspiciousActivity('fast_login_attempt', 'medium', {
          duration,
          possibleAutomation: true
        });
      }
      
      throw error;
    }
  }, [trackAuthenticationEvent, trackSuspiciousActivity]);

  // Initialize when hook is first used
  useEffect(() => {
    if (enabled) {
      initializeSecurityContext();
    }
  }, [enabled, initializeSecurityContext]);

  // Page visibility tracking for session security
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('page_hidden', { 
          hiddenAt: new Date().toISOString(),
          currentPath: window.location.pathname
        });
      } else {
        logSecurityEvent('page_visible', { 
          visibleAt: new Date().toISOString(),
          currentPath: window.location.pathname
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, logSecurityEvent]);

  // Monitor for potentially suspicious rapid navigation
  useEffect(() => {
    if (!trackNavigation) return;

    let navigationCount = 0;
    let navigationTimer: NodeJS.Timeout;

    const handleNavigation = () => {
      navigationCount++;
      
      // Clear existing timer
      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }
      
      // Set new timer
      navigationTimer = setTimeout(() => {
        if (navigationCount > 20) { // More than 20 navigations per minute
          trackSuspiciousActivity('rapid_navigation', 'medium', {
            navigationCount,
            timeWindow: '1_minute',
            possibleBotActivity: true
          });
        }
        navigationCount = 0;
      }, 60000); // 1 minute window
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }
    };
  }, [trackNavigation, trackSuspiciousActivity]);

  return {
    // Security context
    securityContext: contextRef.current,
    isInitialized: isInitialized.current,
    
    // Event tracking functions
    logSecurityEvent,
    trackAuthenticationEvent,
    trackNavigationEvent,
    trackAPIUsage,
    trackSuspiciousActivity,
    
    // Enhanced authentication wrapper
    monitoredAuthAction,
    
    // Convenience methods for common auth operations
    monitoredLogin: (credentials: any) => 
      monitoredAuthAction(() => authApi.login(credentials), 'login'),
    
    monitoredRegister: (userData: any) => 
      monitoredAuthAction(() => authApi.register(userData), 'register'),
    
    monitoredLogout: () => 
      monitoredAuthAction(() => authApi.logout(), 'logout')
  };
}

// Helper function to get device information
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iOS|iPhone|iPad/.test(ua);
  const isTablet = /iPad|Tablet/.test(ua);
  
  if (isMobile && !isTablet) return 'Mobile';
  if (isTablet) return 'Tablet';
  return 'Desktop';
}

export default useSecurityMonitoring;