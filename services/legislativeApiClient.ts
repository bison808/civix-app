// Unified Legislative API Client with intelligent orchestration
import { apiResponseCache, cacheKeys, cacheMetrics } from '../utils/cacheOptimizer';

interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}

interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  headers?: Record<string, string>;
  priority: number; // 1-10, higher = more important
  cacheTTL?: number;
  retries?: number;
}

interface BatchedRequest extends ApiRequest {
  resolve: (data: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface RateLimiter {
  requests: number[];
  limit: number;
  windowMs: number;
}

class LegislativeApiClient {
  private configs: Map<string, ApiConfig> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private batchQueue: BatchedRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_WINDOW = 100; // 100ms batch window
  private readonly MAX_BATCH_SIZE = 10;

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // Congress API configuration
    this.configs.set('congress', {
      baseUrl: 'https://api.congress.gov/v3',
      apiKey: process.env.CONGRESS_API_KEY,
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimit: { requests: 5000, windowMs: 60 * 60 * 1000 } // 5000/hour
    });

    // OpenStates API configuration
    this.configs.set('openstates', {
      baseUrl: 'https://openstates.org/api/v3',
      apiKey: process.env.OPENSTATES_API_KEY,
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimit: { requests: 1000, windowMs: 60 * 60 * 1000 } // 1000/hour
    });

    // California State API
    this.configs.set('california', {
      baseUrl: 'https://leginfo.legislature.ca.gov/faces/billSearchClient.xhtml',
      timeout: 12000,
      retryAttempts: 2,
      retryDelay: 2000,
      rateLimit: { requests: 100, windowMs: 60 * 1000 } // 100/minute
    });

    // Initialize rate limiters
    for (const [service, config] of this.configs.entries()) {
      this.rateLimiters.set(service, {
        requests: [],
        limit: config.rateLimit.requests,
        windowMs: config.rateLimit.windowMs
      });
    }
  }

  // Primary API orchestration method
  async request<T>(
    service: string,
    request: Omit<ApiRequest, 'priority'> & { priority?: number }
  ): Promise<T> {
    const fullRequest: ApiRequest = {
      priority: 5, // Default priority
      cacheTTL: this.getDefaultCacheTTL(request.endpoint),
      ...request
    };

    // Check cache first for GET requests
    if (fullRequest.method === 'GET') {
      const cacheKey = this.generateCacheKey(service, fullRequest);
      const cached = apiResponseCache.get(cacheKey);
      if (cached) {
        cacheMetrics.recordHit(`${service}_legislative`);
        return cached as T;
      }
      cacheMetrics.recordMiss(`${service}_legislative`);
    }

    // Check if this request can be batched
    if (this.canBatch(fullRequest)) {
      return this.enqueueBatchRequest<T>(service, fullRequest);
    }

    // Execute single request
    return this.executeRequest<T>(service, fullRequest);
  }

  // Batched request handling
  private enqueueBatchRequest<T>(service: string, request: ApiRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchedRequest: BatchedRequest = {
        ...request,
        resolve,
        reject,
        timestamp: Date.now()
      };

      // Insert into queue maintaining priority order
      const insertIndex = this.batchQueue.findIndex(
        req => req.priority < request.priority
      );
      
      if (insertIndex === -1) {
        this.batchQueue.push(batchedRequest);
      } else {
        this.batchQueue.splice(insertIndex, 0, batchedRequest);
      }

      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch(service);
        }, this.BATCH_WINDOW);
      }

      // Process immediately if batch is full
      if (this.batchQueue.length >= this.MAX_BATCH_SIZE) {
        if (this.batchTimer) {
          clearTimeout(this.batchTimer);
          this.batchTimer = null;
        }
        this.processBatch(service);
      }
    });
  }

  // Process batched requests
  private async processBatch(service: string) {
    const batch = this.batchQueue.splice(0, this.MAX_BATCH_SIZE);
    this.batchTimer = null;

    if (batch.length === 0) return;

    // Group similar requests for efficient batching
    const groups = this.groupBatchRequests(batch);

    for (const group of groups) {
      if (group.length === 1) {
        // Single request
        const request = group[0];
        try {
          const result = await this.executeRequest(service, request);
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      } else {
        // Batch request
        await this.executeBatchGroup(service, group);
      }
    }

    // Continue processing if more requests in queue
    if (this.batchQueue.length > 0) {
      this.batchTimer = setTimeout(() => {
        this.processBatch(service);
      }, this.BATCH_WINDOW);
    }
  }

  // Execute single request with retry logic
  private async executeRequest<T>(
    service: string,
    request: ApiRequest,
    attempt: number = 1
  ): Promise<T> {
    const config = this.configs.get(service);
    if (!config) {
      throw new Error(`Unknown service: ${service}`);
    }

    // Rate limiting check
    await this.checkRateLimit(service);

    const url = this.buildUrl(config.baseUrl, request.endpoint, request.params);
    const headers = this.buildHeaders(config, request.headers);

    try {
      const response = await this.makeHttpRequest(url, {
        method: request.method,
        headers,
        body: request.method !== 'GET' ? JSON.stringify(request.params) : undefined,
        signal: AbortSignal.timeout(config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET responses
      if (request.method === 'GET' && request.cacheTTL) {
        const cacheKey = this.generateCacheKey(service, request);
        apiResponseCache.set(cacheKey, data);
      }

      return data as T;

    } catch (error) {
      const shouldRetry = this.shouldRetry(error, attempt, config.retryAttempts);
      
      if (shouldRetry) {
        const delay = this.calculateRetryDelay(attempt, config.retryDelay);
        await this.wait(delay);
        return this.executeRequest<T>(service, request, attempt + 1);
      }

      throw error;
    }
  }

  // Specialized methods for different legislative data types

  // Bills API methods
  async getBills(params: {
    congress?: number;
    chamber?: 'house' | 'senate';
    status?: string;
    subject?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any> {
    return this.request('congress', {
      endpoint: '/bill',
      method: 'GET',
      params,
      priority: 7
    });
  }

  async getBillDetails(billId: string): Promise<any> {
    return this.request('congress', {
      endpoint: `/bill/${billId}`,
      method: 'GET',
      priority: 8,
      cacheTTL: 60 * 60 * 1000 // 1 hour for active bills
    });
  }

  async getBillActions(billId: string): Promise<any> {
    return this.request('congress', {
      endpoint: `/bill/${billId}/actions`,
      method: 'GET',
      priority: 6
    });
  }

  async getBillCommittees(billId: string): Promise<any> {
    return this.request('congress', {
      endpoint: `/bill/${billId}/committees`,
      method: 'GET',
      priority: 6
    });
  }

  // Committee API methods
  async getCommittees(chamber?: 'house' | 'senate'): Promise<any> {
    return this.request('congress', {
      endpoint: '/committee',
      method: 'GET',
      params: chamber ? { chamber } : undefined,
      priority: 5,
      cacheTTL: 4 * 60 * 60 * 1000 // 4 hours
    });
  }

  async getCommitteeDetails(committeeCode: string): Promise<any> {
    return this.request('congress', {
      endpoint: `/committee/${committeeCode}`,
      method: 'GET',
      priority: 6,
      cacheTTL: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  async getCommitteeBills(committeeCode: string): Promise<any> {
    return this.request('congress', {
      endpoint: `/committee/${committeeCode}/bills`,
      method: 'GET',
      priority: 5
    });
  }

  // State-level API methods (California example)
  async getStateBills(state: string = 'ca', params: any = {}): Promise<any> {
    return this.request('openstates', {
      endpoint: `/bills`,
      method: 'GET',
      params: { jurisdiction: state, ...params },
      priority: 6
    });
  }

  async getStateLegislators(state: string = 'ca'): Promise<any> {
    return this.request('openstates', {
      endpoint: `/people`,
      method: 'GET',
      params: { jurisdiction: state },
      priority: 5,
      cacheTTL: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Utility methods
  private async checkRateLimit(service: string): Promise<void> {
    const rateLimiter = this.rateLimiters.get(service);
    if (!rateLimiter) return;

    const now = Date.now();
    const windowStart = now - rateLimiter.windowMs;
    
    // Remove old requests outside the window
    rateLimiter.requests = rateLimiter.requests.filter(
      timestamp => timestamp > windowStart
    );

    if (rateLimiter.requests.length >= rateLimiter.limit) {
      const oldestRequest = rateLimiter.requests[0];
      const waitTime = rateLimiter.windowMs - (now - oldestRequest);
      await this.wait(waitTime);
      return this.checkRateLimit(service); // Recheck after waiting
    }

    rateLimiter.requests.push(now);
  }

  private shouldRetry(error: any, attempt: number, maxAttempts: number): boolean {
    if (attempt >= maxAttempts) return false;

    // Retry on network errors, timeouts, and 5xx status codes
    if (error.name === 'AbortError') return true;
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    if (error.message.includes('HTTP 5')) return true;
    if (error.message.includes('timeout')) return true;

    return false;
  }

  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // 0-1s jitter
    return delay + jitter;
  }

  private canBatch(request: ApiRequest): boolean {
    // Define which requests can be batched
    const batchablePatterns = [
      '/bill/',
      '/committee/',
      '/member/'
    ];

    return request.method === 'GET' && 
           batchablePatterns.some(pattern => request.endpoint.includes(pattern));
  }

  private groupBatchRequests(batch: BatchedRequest[]): BatchedRequest[][] {
    const groups: Record<string, BatchedRequest[]> = {};
    
    for (const request of batch) {
      const groupKey = this.getGroupKey(request);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(request);
    }
    
    return Object.values(groups);
  }

  private async executeBatchGroup(service: string, group: BatchedRequest[]) {
    // For now, process individually with concurrent execution
    // Future: implement true batch endpoints
    const promises = group.map(async request => {
      try {
        const result = await this.executeRequest(service, request);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    });

    await Promise.allSettled(promises);
  }

  private getGroupKey(request: ApiRequest): string {
    const endpointParts = request.endpoint.split('/');
    return endpointParts.slice(0, 2).join('/'); // Group by first two path segments
  }

  private generateCacheKey(service: string, request: ApiRequest): string {
    return cacheKeys.apiCall(
      `${service}:${request.endpoint}`,
      { method: request.method, ...request.params }
    );
  }

  private getDefaultCacheTTL(endpoint: string): number {
    if (endpoint.includes('/bill/')) return 60 * 60 * 1000; // 1 hour
    if (endpoint.includes('/committee/')) return 4 * 60 * 60 * 1000; // 4 hours
    if (endpoint.includes('/member/')) return 24 * 60 * 60 * 1000; // 24 hours
    return 15 * 60 * 1000; // 15 minutes default
  }

  private buildUrl(baseUrl: string, endpoint: string, params?: Record<string, any>): string {
    let url = `${baseUrl}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      url += `?${searchParams.toString()}`;
    }
    return url;
  }

  private buildHeaders(config: ApiConfig, additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    return headers;
  }

  private async makeHttpRequest(url: string, options: RequestInit): Promise<Response> {
    return fetch(url, options);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Performance monitoring and cache management
  getCacheStats() {
    return {
      cacheSize: apiResponseCache.size(),
      allStats: cacheMetrics.getAllStats()
    };
  }

  clearCache() {
    apiResponseCache.clear();
  }

  // Service status check
  async healthCheck(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};
    
    for (const [service, config] of this.configs.entries()) {
      try {
        const response = await fetch(`${config.baseUrl}/health`, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        status[service] = response.ok;
      } catch {
        status[service] = false;
      }
    }
    
    return status;
  }
}

// Export singleton instance
export const legislativeApiClient = new LegislativeApiClient();
export default legislativeApiClient;