import { authAPI, apiClient } from './api/client';
import {
  User,
  LoginData,
  LoginResponse,
  RegistrationData,
  RegistrationResponse,
  ZipCodeVerification,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '../types/auth.types';

class AuthService {
  async register(data: RegistrationData): Promise<RegistrationResponse> {
    const response = await authAPI.post<RegistrationResponse>('/api/auth/register', data);
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
      this.saveUser(response.data.user);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/api/auth/login', data);
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
      this.saveUser(response.data.user);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await authAPI.post('/api/auth/logout');
    } finally {
      apiClient.clearAuthToken();
      this.clearUser();
    }
  }

  async verifyZipCode(zipCode: string): Promise<ZipCodeVerification> {
    const response = await authAPI.get<ZipCodeVerification>(`/api/auth/verify-zip/${zipCode}`);
    return response.data;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await authAPI.get<User>('/api/auth/me');
      this.saveUser(response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await authAPI.put<User>(`/api/auth/users/${userId}`, data);
    this.saveUser(response.data);
    return response.data;
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await authAPI.post<{ message: string }>('/api/auth/password-reset', data);
    return response.data;
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await authAPI.post<{ message: string }>('/api/auth/password-reset/confirm', data);
    return response.data;
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await authAPI.post<{ token: string }>('/api/auth/refresh');
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await authAPI.post<{ message: string }>('/api/auth/verify-email', { token });
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const response = await authAPI.post<{ message: string }>('/api/auth/resend-verification', { email });
    return response.data;
  }

  private saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  private clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
export default authService;