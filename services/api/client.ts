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

interface FetchClient {
  baseURL: string;
  get: (path: string, options?: RequestInit) => Promise<Response>;
  post: (path: string, data?: any, options?: RequestInit) => Promise<Response>;
  put: (path: string, data?: any, options?: RequestInit) => Promise<Response>;
  patch: (path: string, data?: any, options?: RequestInit) => Promise<Response>;
  delete: (path: string, options?: RequestInit) => Promise<Response>;
}

class APIClient {
  private authClient: FetchClient;
  private aiEngineClient: FetchClient;
  private dataPipelineClient: FetchClient;
  private communicationsClient: FetchClient;

  constructor() {
    this.authClient = this.createClient(API_ENDPOINTS.AUTH);
    this.aiEngineClient = this.createClient(API_ENDPOINTS.AI_ENGINE);
    this.dataPipelineClient = this.createClient(API_ENDPOINTS.DATA_PIPELINE);
    this.communicationsClient = this.createClient(API_ENDPOINTS.COMMUNICATIONS);
  }

  private createClient(baseURL: string): FetchClient {
    const makeRequest = async (
      method: string,
      path: string,
      data?: any,
      options?: RequestInit
    ): Promise<Response> => {
      const url = `${baseURL}${path}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      // Merge with options headers if provided
      if (options?.headers) {
        Object.assign(headers, options.headers);
      }

      const config: RequestInit = {
        method,
        headers,
        ...options,
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const status = response.status;
          let errorMessage = 'An unexpected error occurred';
          
          try {
            const errorData = await response.json() as APIError;
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If response isn't JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }

          if (status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              window.location.href = '/onboarding';
            }
            throw new Error('Session expired. Please log in again.');
          }

          if (status === 403) {
            throw new Error('You do not have permission to perform this action.');
          }

          if (status === 404) {
            throw new Error('The requested resource was not found.');
          }

          if (status === 429) {
            throw new Error('Too many requests. Please try again later.');
          }

          if (status >= 500) {
            throw new Error('Server error. Please try again later.');
          }

          throw new Error(errorMessage);
        }

        return response;
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new Error('Network error. Please check your connection.');
        }
        throw error;
      }
    };

    return {
      baseURL,
      get: (path: string, options?: RequestInit) => 
        makeRequest('GET', path, undefined, options),
      post: (path: string, data?: any, options?: RequestInit) => 
        makeRequest('POST', path, data, options),
      put: (path: string, data?: any, options?: RequestInit) => 
        makeRequest('PUT', path, data, options),
      patch: (path: string, data?: any, options?: RequestInit) => 
        makeRequest('PATCH', path, data, options),
      delete: (path: string, options?: RequestInit) => 
        makeRequest('DELETE', path, undefined, options),
    };
  }

  public getAuthClient(): FetchClient {
    return this.authClient;
  }

  public getAIEngineClient(): FetchClient {
    return this.aiEngineClient;
  }

  public getDataPipelineClient(): FetchClient {
    return this.dataPipelineClient;
  }

  public getCommunicationsClient(): FetchClient {
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