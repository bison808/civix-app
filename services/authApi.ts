// Auth API Service - Connects to Agent 3 Auth Backend
import { realDataService } from './realDataService';

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3003';
const USE_REAL_DATA = true;

export interface RegisterRequest {
  zipCode: string;
  acceptTerms: boolean;
  optionalIdentity?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  privacySettings?: {
    dataRetentionDays?: number;
    allowAnalytics?: boolean;
    allowPublicProfile?: boolean;
  };
}

export interface RegisterResponse {
  success: boolean;
  anonymousId: string;
  sessionToken: string;
}

export interface VerifyZipResponse {
  valid: boolean;
  city?: string;
  state?: string;
  county?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  sessionToken: string;
  anonymousId: string;
  userId?: string;
  verificationStatus?: 'anonymous' | 'verified' | 'revealed';
}

export interface SessionValidation {
  valid: boolean;
  anonymousId?: string;
  userId?: string;
  verificationStatus?: string;
}

class AuthApiService {
  private async fetchWithError(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async verifyZipCode(zipCode: string): Promise<VerifyZipResponse> {
    // For now, do client-side validation and mock city/state lookup
    // In production, this would call a real ZIP code verification API
    const isValid = /^\d{5}$/.test(zipCode);
    
    if (!isValid) {
      return { valid: false };
    }
    
    // Try to use real data if enabled
    if (USE_REAL_DATA) {
      try {
        const realLocation = await realDataService.getLocationFromZip(zipCode);
        if (realLocation) {
          return {
            valid: true,
            ...realLocation
          };
        }
      } catch (error) {
        console.error('Failed to fetch real location data:', error);
      }
    }

    // Mock city/state data for common ZIP codes (matches our representative mapping)
    const zipData: Record<string, { city: string; state: string; county: string }> = {
      // California ZIP codes (90xxx-96xxx)
      '90210': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles County' },
      '90024': { city: 'West Los Angeles', state: 'CA', county: 'Los Angeles County' },
      '91501': { city: 'Burbank', state: 'CA', county: 'Los Angeles County' },
      '92101': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
      '93101': { city: 'Santa Barbara', state: 'CA', county: 'Santa Barbara County' },
      '94102': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
      '95110': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
      '95060': { city: 'Santa Cruz', state: 'CA', county: 'Santa Cruz County' },
      
      // Texas ZIP codes (75xxx-79xxx)
      '75001': { city: 'Addison', state: 'TX', county: 'Dallas County' },
      '75201': { city: 'Dallas', state: 'TX', county: 'Dallas County' },
      '76101': { city: 'Fort Worth', state: 'TX', county: 'Tarrant County' },
      '77001': { city: 'Houston', state: 'TX', county: 'Harris County' },
      '78701': { city: 'Austin', state: 'TX', county: 'Travis County' },
      '79101': { city: 'Amarillo', state: 'TX', county: 'Potter County' },
      
      // New York ZIP codes (10xxx-14xxx)
      '10001': { city: 'New York', state: 'NY', county: 'New York County' },
      '10002': { city: 'New York', state: 'NY', county: 'New York County' },
      '11201': { city: 'Brooklyn', state: 'NY', county: 'Kings County' },
      '12201': { city: 'Albany', state: 'NY', county: 'Albany County' },
      '13201': { city: 'Syracuse', state: 'NY', county: 'Onondaga County' },
      '14201': { city: 'Buffalo', state: 'NY', county: 'Erie County' },
      
      // Other popular ZIP codes
      '60601': { city: 'Chicago', state: 'IL', county: 'Cook County' },
      '33139': { city: 'Miami Beach', state: 'FL', county: 'Miami-Dade County' },
      '98101': { city: 'Seattle', state: 'WA', county: 'King County' },
      '02101': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
      '20001': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
      '80201': { city: 'Denver', state: 'CO', county: 'Denver County' },
      '85001': { city: 'Phoenix', state: 'AZ', county: 'Maricopa County' },
    };

    // For unknown ZIP codes, try to guess state based on ZIP code ranges
    let defaultData = { city: 'Your City', state: 'ST', county: 'Your County' };
    
    if (!zipData[zipCode]) {
      const zipNum = parseInt(zipCode);
      if (zipNum >= 90000 && zipNum <= 96999) {
        defaultData = { city: 'Unknown City', state: 'CA', county: 'California' };
      } else if (zipNum >= 75000 && zipNum <= 79999) {
        defaultData = { city: 'Unknown City', state: 'TX', county: 'Texas' };
      } else if (zipNum >= 10000 && zipNum <= 14999) {
        defaultData = { city: 'Unknown City', state: 'NY', county: 'New York' };
      } else if (zipNum >= 60000 && zipNum <= 62999) {
        defaultData = { city: 'Unknown City', state: 'IL', county: 'Illinois' };
      } else if (zipNum >= 33000 && zipNum <= 34999) {
        defaultData = { city: 'Unknown City', state: 'FL', county: 'Florida' };
      }
    }
    
    const data = zipData[zipCode] || defaultData;

    return {
      valid: true,
      ...data
    };
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // For demo/production without backend, create mock registration
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate unique IDs for the session
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      
      // Return successful mock registration
      return {
        success: true,
        anonymousId: `anon_${timestamp}_${randomId}`,
        sessionToken: `session_${timestamp}_${randomId}`,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        anonymousId: '',
        sessionToken: '',
      };
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    // Since the backend uses anonymous registration, we'll simulate login
    // by creating a new anonymous session or retrieving an existing one
    const storedSession = this.getStoredSession();
    
    if (storedSession && storedSession.email === data.email) {
      // Return existing session
      return {
        success: true,
        sessionToken: storedSession.sessionToken,
        anonymousId: storedSession.anonymousId,
        verificationStatus: storedSession.verificationStatus || 'anonymous',
      };
    }

    // Create new anonymous session with email attached
    const registerData: RegisterRequest = {
      zipCode: localStorage.getItem('userZipCode') || '00000',
      acceptTerms: true,
      optionalIdentity: {
        email: data.email,
      },
    };

    const response = await this.register(registerData);
    
    // Store session with email for future "login"
    this.storeSession({
      ...response,
      email: data.email,
      verificationStatus: 'anonymous',
    });

    return {
      success: response.success,
      sessionToken: response.sessionToken,
      anonymousId: response.anonymousId,
      verificationStatus: 'anonymous',
    };
  }

  async validateSession(sessionToken: string): Promise<SessionValidation> {
    // For demo/production without backend, always validate sessions as valid
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Always return valid for existing sessions
      return {
        valid: true,
        verificationStatus: 'anonymous',
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return {
        valid: false,
        verificationStatus: 'anonymous',
      };
    }
  }

  async verifyVoter(anonymousId: string, data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) {
    return this.fetchWithError(`${AUTH_API_URL}/verify-voter`, {
      method: 'POST',
      body: JSON.stringify({
        anonymousId,
        ...data,
      }),
    });
  }

  async updatePrivacySettings(anonymousId: string, settings: any) {
    return this.fetchWithError(`${AUTH_API_URL}/update-privacy-settings`, {
      method: 'PUT',
      body: JSON.stringify({
        anonymousId,
        settings,
      }),
    });
  }

  async requestDataDeletion(anonymousId: string) {
    return this.fetchWithError(`${AUTH_API_URL}/request-deletion`, {
      method: 'POST',
      body: JSON.stringify({ anonymousId }),
    });
  }

  async logout() {
    // Clear local storage
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('anonymousId');
    localStorage.removeItem('userSession');
    sessionStorage.clear();
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'sessionToken=; path=/; max-age=0';
      document.cookie = 'anonymousId=; path=/; max-age=0';
      document.cookie = 'verificationLevel=; path=/; max-age=0';
      document.cookie = 'userZipCode=; path=/; max-age=0';
    }
  }

  // Helper methods for session management
  private storeSession(session: any) {
    localStorage.setItem('userSession', JSON.stringify(session));
    localStorage.setItem('sessionToken', session.sessionToken);
    localStorage.setItem('anonymousId', session.anonymousId);
    
    // Also store in cookies for middleware - use consistent settings
    if (typeof document !== 'undefined') {
      const isSecure = window.location.protocol === 'https:';
      const cookieOptions = `path=/; max-age=86400; samesite=lax${isSecure ? '; secure' : ''}`;
      
      document.cookie = `sessionToken=${session.sessionToken}; ${cookieOptions}`;
      document.cookie = `anonymousId=${session.anonymousId}; ${cookieOptions}`;
      document.cookie = `verificationLevel=anonymous; ${cookieOptions}`;
      
      // Store ZIP code from localStorage to cookie
      const zipCode = localStorage.getItem('userZipCode');
      if (zipCode) {
        document.cookie = `userZipCode=${zipCode}; ${cookieOptions}`;
      }
    }
  }

  private getStoredSession() {
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) return null;
    
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  getSessionToken(): string | null {
    // Check both localStorage and cookies for better sync
    const localToken = localStorage.getItem('sessionToken');
    const cookieToken = this.getCookie('sessionToken');
    
    // If they don't match, clear everything to prevent loops
    if (localToken && cookieToken && localToken !== cookieToken) {
      this.clearAllAuth();
      return null;
    }
    
    return localToken || cookieToken;
  }

  getAnonymousId(): string | null {
    // Check both localStorage and cookies for better sync
    const localId = localStorage.getItem('anonymousId');
    const cookieId = this.getCookie('anonymousId');
    
    // If they don't match, clear everything to prevent loops
    if (localId && cookieId && localId !== cookieId) {
      this.clearAllAuth();
      return null;
    }
    
    return localId || cookieId;
  }

  // Helper method to read cookies
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  }

  // Helper method to clear all auth data
  private clearAllAuth(): void {
    // Clear localStorage
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('anonymousId');
    localStorage.removeItem('userSession');
    localStorage.removeItem('userZipCode');
    localStorage.removeItem('userLocation');
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'sessionToken=; path=/; max-age=0';
      document.cookie = 'anonymousId=; path=/; max-age=0';
      document.cookie = 'verificationLevel=; path=/; max-age=0';
      document.cookie = 'userZipCode=; path=/; max-age=0';
    }
  }

  // New method to check if user is authenticated according to middleware
  isAuthenticatedForMiddleware(): boolean {
    const sessionToken = this.getCookie('sessionToken');
    const anonymousId = this.getCookie('anonymousId');
    const zipCode = this.getCookie('userZipCode');
    
    return !!(sessionToken && anonymousId && zipCode);
  }
}

export const authApi = new AuthApiService();