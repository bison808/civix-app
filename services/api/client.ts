import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';

const API_ENDPOINTS = {
  AUTH: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3003',
  AI_ENGINE: process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:3002',
  DATA_PIPELINE: process.env.NEXT_PUBLIC_DATA_PIPELINE_URL || 'http://localhost:3001',
  COMMUNICATIONS: process.env.NEXT_PUBLIC_COMMUNICATIONS_URL || 'http://localhost:3005',
};

interface APIError {
  message: string;
  statusCode?: number;
  details?: any;
}

class APIClient {
  private authClient: AxiosInstance;
  private aiEngineClient: AxiosInstance;
  private dataPipelineClient: AxiosInstance;
  private communicationsClient: AxiosInstance;

  constructor() {
    this.authClient = this.createClient(API_ENDPOINTS.AUTH);
    this.aiEngineClient = this.createClient(API_ENDPOINTS.AI_ENGINE);
    this.dataPipelineClient = this.createClient(API_ENDPOINTS.DATA_PIPELINE);
    this.communicationsClient = this.createClient(API_ENDPOINTS.COMMUNICATIONS);
  }

  private createClient(baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<APIError>) => {
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              window.location.href = '/onboarding';
            }
            return Promise.reject(new Error('Session expired. Please log in again.'));
          }

          if (status === 403) {
            return Promise.reject(new Error('You do not have permission to perform this action.'));
          }

          if (status === 404) {
            return Promise.reject(new Error('The requested resource was not found.'));
          }

          if (status === 429) {
            return Promise.reject(new Error('Too many requests. Please try again later.'));
          }

          if (status >= 500) {
            return Promise.reject(new Error('Server error. Please try again later.'));
          }

          const errorMessage = data?.message || 'An unexpected error occurred';
          return Promise.reject(new Error(errorMessage));
        }

        if (error.request) {
          return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        return Promise.reject(new Error('An unexpected error occurred'));
      }
    );

    return client;
  }

  public getAuthClient(): AxiosInstance {
    return this.authClient;
  }

  public getAIEngineClient(): AxiosInstance {
    return this.aiEngineClient;
  }

  public getDataPipelineClient(): AxiosInstance {
    return this.dataPipelineClient;
  }

  public getCommunicationsClient(): AxiosInstance {
    return this.communicationsClient;
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }
}

export const apiClient = new APIClient();

export const authAPI = apiClient.getAuthClient();
export const aiEngineAPI = apiClient.getAIEngineClient();
export const dataPipelineAPI = apiClient.getDataPipelineClient();
export const communicationsAPI = apiClient.getCommunicationsClient();

export default apiClient;