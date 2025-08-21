export interface User {
  id: string;
  email: string;
  name: string;
  zipCode: string;
  district?: string;
  state?: string;
  preferences?: UserPreferences;
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