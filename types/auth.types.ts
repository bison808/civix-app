export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  zipCode: string;
  district?: string;
  state?: string;
  preferences?: UserPreferences;
  securityQuestion1?: string;
  securityQuestion2?: string;
  securityAnswer1Hash?: string;
  securityAnswer2Hash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  smsUpdates?: boolean;
  topicInterests?: string[];
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  zipCode: string;
  preferences?: UserPreferences;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegistrationResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ZipCodeVerification {
  zipCode: string;
  isValid: boolean;
  state?: string;
  city?: string;
  district?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

// Enhanced Authentication Types for Anonymous Registration
export interface RegisterRequest {
  email?: string;
  password?: string;
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
  user?: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SessionValidation {
  valid: boolean;
  anonymousId?: string;
  userId?: string;
  verificationStatus?: 'anonymous' | 'verified' | 'revealed';
}

export interface AnonymousUser {
  anonymousId: string;
  zipCode: string;
  sessionToken: string;
  verificationStatus: 'anonymous' | 'verified' | 'revealed';
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
  createdAt: string;
  updatedAt: string;
}