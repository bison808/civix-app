// Optimized API client with intelligent caching and batching
import { 
  apiResponseCache, 
  cacheKeys, 
  cacheMetrics 
} from '../utils/cacheOptimizer';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTTL?: number;
  timeout?: number;
}

interface BatchRequest {
  endpoint: string;
  options?: ApiRequestOptions;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}

class OptimizedApiClient {
  private baseUrl: string;
  private batchQueue: BatchRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // 50ms batch window

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = method === 'GET',
      cacheTTL = 5 * 60 * 1000, // 5 minutes default
      timeout = 10000
    } = options;

    // Generate cache key
    const cacheKey = cacheKeys.apiCall(endpoint, { method, ...body });

    // Try cache first for GET requests
    if (cache && method === 'GET') {
      const cachedData = apiResponseCache.get(cacheKey);
      if (cachedData) {
        cacheMetrics.recordHit('api');
        return cachedData as T;
      }
      cacheMetrics.recordMiss('api');
    }

    // For GET requests that can be batched, use batch processing
    if (method === 'GET' && this.canBatch(endpoint)) {
      return this.batchRequest<T>(endpoint, options);
    }

    // Make the request
    const response = await this.makeRequest(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout)
    });

    const data = await response.json();

    // Cache successful GET responses
    if (cache && method === 'GET' && response.ok) {
      apiResponseCache.set(cacheKey, data);
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return data as T;
  }

  private async batchRequest<T>(
    endpoint: string, 
    options: ApiRequestOptions
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to batch queue
      this.batchQueue.push({
        endpoint,
        options,
        resolve,
        reject
      });

      // Set up batch processing if not already scheduled
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.BATCH_DELAY);
      }
    });
  }

  private async processBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue.length = 0;
    this.batchTimeout = null;

    if (batch.length === 0) return;

    // Group by similar endpoints for batch processing
    const groups = this.groupBatchRequests(batch);

    for (const group of groups) {
      try {
        if (group.length === 1) {
          // Single request
          const { endpoint, options, resolve, reject } = group[0];
          try {
            const data = await this.makeRequest(endpoint, {
              method: options?.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {})
              }
            }).then(r => r.json());
            resolve(data);
          } catch (error) {
            reject(error);
          }
        } else {
          // Batch request
          await this.processBatchGroup(group);
        }
      } catch (error) {
        // Reject all requests in the group
        group.forEach(({ reject }) => reject(error));
      }
    }
  }

  private groupBatchRequests(batch: BatchRequest[]): BatchRequest[][] {
    // Simple grouping by endpoint prefix for now
    const groups: Record<string, BatchRequest[]> = {};
    
    for (const request of batch) {
      const prefix = request.endpoint.split('/')[1] || 'default';
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(request);
    }
    
    return Object.values(groups);
  }

  private async processBatchGroup(group: BatchRequest[]) {
    // For representative data, we can batch multiple requests
    if (group[0].endpoint.includes('/representatives/')) {
      const ids = group.map(req => req.endpoint.split('/').pop()).filter(Boolean);
      
      try {
        const batchEndpoint = `/representatives/batch?ids=${ids.join(',')}`;
        const response = await this.makeRequest(batchEndpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const batchData = await response.json();
        
        // Resolve individual requests
        group.forEach(({ endpoint, resolve }) => {
          const id = endpoint.split('/').pop();
          const data = batchData.find((item: any) => item.id === id);
          resolve(data);
        });
      } catch (error) {
        // Fall back to individual requests
        for (const request of group) {
          try {
            const data = await this.makeRequest(request.endpoint, {
              method: request.options?.method || 'GET'
            }).then(r => r.json());
            request.resolve(data);
          } catch (err) {
            request.reject(err);
          }
        }
      }
    } else {
      // Process individually if no batch endpoint available
      for (const request of group) {
        try {
          const data = await this.makeRequest(request.endpoint, {
            method: request.options?.method || 'GET'
          }).then(r => r.json());
          request.resolve(data);
        } catch (error) {
          request.reject(error);
        }
      }
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    return fetch(url, options);
  }

  private canBatch(endpoint: string): boolean {
    // Define which endpoints can be batched
    const batchablePatterns = [
      '/representatives/',
      '/bills/',
      '/districts/'
    ];
    
    return batchablePatterns.some(pattern => endpoint.includes(pattern));
  }

  // Specialized methods for political mapping
  async getRepresentative(id: string) {
    return this.request(`/representatives/${id}`, { cache: true, cacheTTL: 24 * 60 * 60 * 1000 });
  }

  async getRepresentativesByZip(zipCode: string) {
    return this.request(`/representatives?zip=${zipCode}`, { cache: true, cacheTTL: 24 * 60 * 60 * 1000 });
  }

  async getDistrictByZip(zipCode: string) {
    return this.request(`/districts?zip=${zipCode}`, { cache: true, cacheTTL: 7 * 24 * 60 * 60 * 1000 });
  }

  async getBills(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bills?${query}`, { cache: true, cacheTTL: 60 * 60 * 1000 });
  }

  // Cache management
  clearCache() {
    apiResponseCache.clear();
  }

  getCacheStats() {
    return {
      cacheSize: apiResponseCache.size(),
      hitRate: cacheMetrics.getHitRate('api'),
      allStats: cacheMetrics.getAllStats()
    };
  }
}

// Export singleton instance
export const optimizedApiClient = new OptimizedApiClient();
export default optimizedApiClient;