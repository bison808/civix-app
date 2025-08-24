/**
 * Resilient API Client
 * Agent 54: System Stability & External Dependencies Integration Specialist
 * 
 * Comprehensive resilience infrastructure with circuit breakers, retries,
 * caching, and graceful degradation for all external dependencies.
 */

// Types and Interfaces
export interface RetryPolicy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryableErrors: string[];
  retryableStatusCodes: number[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  minimumRequests: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  keyGenerator?: (url: string, options?: any) => string;
}

export interface ResilientApiConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  retryPolicy: RetryPolicy;
  circuitBreaker: CircuitBreakerConfig;
  cache: CacheConfig;
  healthCheck?: {
    endpoint: string;
    interval: number;
  };
  fallbackStrategies: FallbackStrategy[];
}

export interface FallbackStrategy {
  name: string;
  condition: (error: any) => boolean;
  handler: (originalParams: any) => Promise<any>;
  priority: number;
}

export interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  skipCache?: boolean;
  skipCircuitBreaker?: boolean;
  customRetryPolicy?: Partial<RetryPolicy>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  fromCache: boolean;
  source: 'api' | 'fallback' | 'cache';
  responseTime: number;
  retryAttempts: number;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: any;
  isRetryable: boolean;
  failureType: 'network' | 'timeout' | 'auth' | 'rate_limit' | 'server' | 'client';
  source: string;
}

// Circuit Breaker States
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

// Circuit Breaker Class
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private requestCount: number = 0;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config: CircuitBreakerConfig) {
    this.name = name;
    this.config = config;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        console.log(`Circuit breaker for ${this.name} transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker for ${this.name} is OPEN. Calls are blocked.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.requestCount++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
      this.failureCount = 0;
      console.log(`Circuit breaker for ${this.name} recovered to CLOSED`);
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.requestCount++;
    this.lastFailureTime = Date.now();

    if (this.requestCount >= this.config.minimumRequests &&
        this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      console.warn(`Circuit breaker for ${this.name} opened due to ${this.failureCount} failures`);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      requestCount: this.requestCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.requestCount = 0;
    this.lastFailureTime = 0;
  }
}

// Cache Implementation
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    if (!this.config.enabled) return;

    const ttl = customTtl || this.config.ttl;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Cleanup if cache is getting too large
    if (this.cache.size > this.config.maxSize) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove oldest entries
    if (this.cache.size > this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = this.cache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Main Resilient API Client
export class ResilientApiClient {
  private config: ResilientApiConfig;
  private circuitBreaker: CircuitBreaker;
  private cache: ApiCache;
  private healthCheckInterval?: NodeJS.Timeout;
  private isHealthy: boolean = true;

  constructor(config: ResilientApiConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker(config.name, config.circuitBreaker);
    this.cache = new ApiCache(config.cache);

    if (config.healthCheck) {
      this.startHealthMonitoring();
    }
  }

  async call<T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const fullUrl = `${this.config.baseUrl}${endpoint}`;
    const cacheKey = this.generateCacheKey(fullUrl, options);

    // Check cache first (unless skipped)
    if (!options.skipCache) {
      const cached = this.cache.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${this.config.name}: ${endpoint}`);
        return {
          ...cached,
          fromCache: true,
          source: 'cache' as const
        };
      }
    }

    let lastError: ApiError | null = null;
    const retryPolicy = { ...this.config.retryPolicy, ...options.customRetryPolicy };

    // Attempt the API call with retries
    for (let attempt = 0; attempt < retryPolicy.maxAttempts; attempt++) {
      try {
        // Use circuit breaker (unless skipped)
        const apiCall = async () => {
          return await this.executeHttpRequest<T>(fullUrl, options);
        };

        const result = options.skipCircuitBreaker ? 
          await apiCall() : 
          await this.circuitBreaker.execute(apiCall);

        // Cache successful response
        if (!options.skipCache && result.status >= 200 && result.status < 300) {
          this.cache.set(cacheKey, result);
        }

        return {
          ...result,
          fromCache: false,
          source: 'api' as const,
          responseTime: Date.now() - startTime,
          retryAttempts: attempt
        };

      } catch (error) {
        lastError = this.normalizeError(error, this.config.name);
        
        console.warn(`${this.config.name} attempt ${attempt + 1} failed:`, lastError.message);

        // Don't retry if it's not retryable
        if (!this.isRetryableError(lastError, retryPolicy)) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === retryPolicy.maxAttempts - 1) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateRetryDelay(attempt, retryPolicy);
        console.log(`Retrying ${this.config.name} in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    // Try fallback strategies if primary API failed
    console.warn(`${this.config.name} exhausted retries. Trying fallback strategies...`);
    for (const strategy of this.config.fallbackStrategies) {
      if (strategy.condition(lastError)) {
        try {
          const fallbackResult = await strategy.handler({ endpoint, options });
          
          if (fallbackResult) {
            console.log(`${this.config.name} fallback '${strategy.name}' succeeded`);
            return {
              data: fallbackResult,
              status: 200,
              statusText: 'OK (Fallback)',
              headers: {},
              fromCache: false,
              source: 'fallback' as const,
              responseTime: Date.now() - startTime,
              retryAttempts: retryPolicy.maxAttempts
            };
          }
        } catch (fallbackError) {
          console.warn(`${this.config.name} fallback '${strategy.name}' failed:`, fallbackError);
        }
      }
    }

    // All attempts and fallbacks failed
    console.error(`${this.config.name} completely failed for ${endpoint}`);
    throw lastError;
  }

  private async executeHttpRequest<T>(url: string, options: ApiCallOptions): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = options.timeout || this.config.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Convert headers to object
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let data: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text() as unknown as T;
      } else {
        data = await response.blob() as unknown as T;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        fromCache: false,
        source: 'api' as const,
        responseTime: 0, // Will be set by caller
        retryAttempts: 0 // Will be set by caller
      };

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private normalizeError(error: any, source: string): ApiError {
    const apiError = new Error(error.message || 'Unknown error') as ApiError;
    apiError.source = source;
    apiError.isRetryable = false;
    apiError.failureType = 'network';

    if (error.name === 'AbortError') {
      apiError.failureType = 'timeout';
      apiError.isRetryable = true;
    } else if (error.message?.includes('HTTP 4')) {
      apiError.failureType = 'client';
      apiError.status = parseInt(error.message.match(/\d+/)?.[0] || '400');
      apiError.isRetryable = apiError.status === 429; // Only retry rate limits
    } else if (error.message?.includes('HTTP 5')) {
      apiError.failureType = 'server';
      apiError.status = parseInt(error.message.match(/\d+/)?.[0] || '500');
      apiError.isRetryable = true;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      apiError.failureType = 'network';
      apiError.isRetryable = true;
    }

    return apiError;
  }

  private isRetryableError(error: ApiError, retryPolicy: RetryPolicy): boolean {
    if (!error.isRetryable) return false;

    if (error.status && !retryPolicy.retryableStatusCodes.includes(error.status)) {
      return false;
    }

    return retryPolicy.retryableErrors.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private calculateRetryDelay(attempt: number, retryPolicy: RetryPolicy): number {
    let delay = retryPolicy.baseDelay;

    switch (retryPolicy.backoffStrategy) {
      case 'exponential':
        delay = Math.min(
          retryPolicy.baseDelay * Math.pow(2, attempt),
          retryPolicy.maxDelay
        );
        break;
      case 'linear':
        delay = Math.min(
          retryPolicy.baseDelay * (attempt + 1),
          retryPolicy.maxDelay
        );
        break;
      case 'fixed':
      default:
        delay = retryPolicy.baseDelay;
        break;
    }

    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  private generateCacheKey(url: string, options: ApiCallOptions): string {
    if (this.config.cache.keyGenerator) {
      return this.config.cache.keyGenerator(url, options);
    }
    
    const keyParts = [url];
    if (options.method && options.method !== 'GET') {
      keyParts.push(options.method);
    }
    if (options.body) {
      keyParts.push(JSON.stringify(options.body));
    }
    
    return keyParts.join('|');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private startHealthMonitoring(): void {
    if (!this.config.healthCheck) return;

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.call(this.config.healthCheck!.endpoint, {
          timeout: 5000,
          skipCache: true,
          skipCircuitBreaker: true
        });
        this.isHealthy = true;
      } catch (error) {
        this.isHealthy = false;
        console.warn(`Health check failed for ${this.config.name}:`, error);
      }
    }, this.config.healthCheck.interval);
  }

  // Public methods for monitoring and management
  getHealth(): boolean {
    return this.isHealthy;
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  getCircuitBreakerStats() {
    return this.circuitBreaker.getStats();
  }

  getCacheStats() {
    return {
      size: this.cache.size(),
      enabled: this.config.cache.enabled,
      maxSize: this.config.cache.maxSize
    };
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  clearCache(): void {
    this.cache.clear();
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Pre-configured clients for external dependencies
export const createCongressApiClient = (): ResilientApiClient => {
  return new ResilientApiClient({
    name: 'Congress API',
    baseUrl: process.env.NEXT_PUBLIC_CONGRESS_API_BASE_URL || 'https://api.congress.gov/v3',
    timeout: 8000,
    retryPolicy: {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      backoffStrategy: 'exponential',
      retryableErrors: ['timeout', 'network', 'server'],
      retryableStatusCodes: [429, 500, 502, 503, 504]
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 10000,
      minimumRequests: 3
    },
    cache: {
      enabled: true,
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 100
    },
    fallbackStrategies: [{
      name: 'Local Congress Data',
      condition: (error) => true, // Always try fallback
      handler: async ({ endpoint }) => {
        // Return local congress data
        const { congressApi } = await import('./congressApi');
        if (endpoint.includes('/bill')) {
          return await congressApi.fetchRecentBills(20, 0);
        }
        return null;
      },
      priority: 1
    }]
  });
};

export const createGeoCodingApiClient = (): ResilientApiClient => {
  return new ResilientApiClient({
    name: 'Geocodio API',
    baseUrl: 'https://api.geocod.io/v1.7',
    timeout: 5000,
    retryPolicy: {
      maxAttempts: 2,
      baseDelay: 500,
      maxDelay: 2000,
      backoffStrategy: 'exponential',
      retryableErrors: ['timeout', 'network'],
      retryableStatusCodes: [429, 500, 502, 503]
    },
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 5000,
      minimumRequests: 2
    },
    cache: {
      enabled: true,
      ttl: 24 * 60 * 60 * 1000, // 24 hours for geocoding
      maxSize: 500
    },
    fallbackStrategies: [{
      name: 'Fallback Geocoding',
      condition: (error) => true,
      handler: async ({ endpoint, options }) => {
        // Use fallback geocoding service
        const { geocodingService } = await import('./geocodingService');
        const zipMatch = endpoint.match(/q=(\d{5})/);
        if (zipMatch) {
          return await geocodingService.getDistrictsForZip(zipMatch[1], { 
            includeFallback: true 
          });
        }
        return null;
      },
      priority: 1
    }]
  });
};

export const createOpenStatesApiClient = (): ResilientApiClient => {
  return new ResilientApiClient({
    name: 'OpenStates API',
    baseUrl: 'https://data.openstates.org',
    timeout: 10000,
    retryPolicy: {
      maxAttempts: 2,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffStrategy: 'exponential',
      retryableErrors: ['timeout', 'network'],
      retryableStatusCodes: [429, 500, 502, 503]
    },
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 10000,
      minimumRequests: 2
    },
    cache: {
      enabled: true,
      ttl: 4 * 60 * 60 * 1000, // 4 hours
      maxSize: 50
    },
    fallbackStrategies: [{
      name: 'Cached State Data',
      condition: (error) => true,
      handler: async () => {
        // Return cached or minimal state data
        return [];
      },
      priority: 1
    }]
  });
};