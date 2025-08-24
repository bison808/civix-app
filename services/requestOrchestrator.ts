// Advanced request orchestration and rate limiting system
interface QueuedRequest {
  id: string;
  service: string;
  endpoint: string;
  method: string;
  params?: any;
  priority: number;
  timestamp: number;
  retries: number;
  maxRetries: number;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}

interface ServiceConfig {
  name: string;
  maxConcurrency: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  retryConfig: {
    attempts: number;
    backoffMs: number;
    backoffMultiplier: number;
  };
  circuit: {
    failureThreshold: number;
    resetTimeoutMs: number;
  };
}

interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

class RequestOrchestrator {
  private requestQueue: QueuedRequest[] = [];
  private activeRequests: Map<string, Set<string>> = new Map(); // service -> request IDs
  private rateLimitWindows: Map<string, number[]> = new Map(); // service -> timestamps
  private circuitStates: Map<string, CircuitState> = new Map();
  private serviceConfigs: Map<string, ServiceConfig> = new Map();
  private processing = false;

  constructor() {
    this.initializeServices();
    this.startProcessing();
  }

  private initializeServices() {
    const services: ServiceConfig[] = [
      {
        name: 'congress',
        maxConcurrency: 3,
        rateLimit: { requests: 5000, windowMs: 60 * 60 * 1000 }, // 5000/hour
        retryConfig: { attempts: 3, backoffMs: 1000, backoffMultiplier: 2 },
        circuit: { failureThreshold: 5, resetTimeoutMs: 30000 }
      },
      {
        name: 'openstates',
        maxConcurrency: 2,
        rateLimit: { requests: 1000, windowMs: 60 * 60 * 1000 }, // 1000/hour
        retryConfig: { attempts: 3, backoffMs: 1000, backoffMultiplier: 2 },
        circuit: { failureThreshold: 3, resetTimeoutMs: 60000 }
      },
      {
        name: 'california',
        maxConcurrency: 1,
        rateLimit: { requests: 100, windowMs: 60 * 1000 }, // 100/minute
        retryConfig: { attempts: 2, backoffMs: 2000, backoffMultiplier: 1.5 },
        circuit: { failureThreshold: 3, resetTimeoutMs: 120000 }
      }
    ];

    for (const service of services) {
      this.serviceConfigs.set(service.name, service);
      this.activeRequests.set(service.name, new Set());
      this.rateLimitWindows.set(service.name, []);
      this.circuitStates.set(service.name, {
        failures: 0,
        lastFailure: 0,
        state: 'closed'
      });
    }
  }

  // Main orchestration method
  async enqueueRequest<T>(
    service: string,
    endpoint: string,
    method: string = 'GET',
    params?: any,
    priority: number = 5
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: this.generateRequestId(),
        service,
        endpoint,
        method,
        params,
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: this.serviceConfigs.get(service)?.retryConfig.attempts || 3,
        resolve,
        reject
      };

      // Insert into queue maintaining priority order
      const insertIndex = this.requestQueue.findIndex(
        req => req.priority < priority || 
               (req.priority === priority && req.timestamp > request.timestamp)
      );

      if (insertIndex === -1) {
        this.requestQueue.push(request);
      } else {
        this.requestQueue.splice(insertIndex, 0, request);
      }

      // Start processing if not already running
      if (!this.processing) {
        this.startProcessing();
      }
    });
  }

  private async startProcessing() {
    this.processing = true;

    while (this.requestQueue.length > 0) {
      await this.processNextBatch();
      await this.wait(10); // Small delay between batches
    }

    this.processing = false;
  }

  private async processNextBatch() {
    const readyRequests = this.getReadyRequests();
    
    if (readyRequests.length === 0) {
      await this.wait(100); // Wait before checking again
      return;
    }

    // Execute requests concurrently
    const promises = readyRequests.map(request => this.executeRequest(request));
    await Promise.allSettled(promises);
  }

  private getReadyRequests(): QueuedRequest[] {
    const readyRequests: QueuedRequest[] = [];
    const serviceCounts = new Map<string, number>();

    for (let i = this.requestQueue.length - 1; i >= 0; i--) {
      const request = this.requestQueue[i];
      const config = this.serviceConfigs.get(request.service);
      
      if (!config) continue;

      // Check circuit breaker
      if (!this.isServiceAvailable(request.service)) continue;

      // Check concurrency limits
      const currentCount = serviceCounts.get(request.service) || 0;
      const activeCount = this.activeRequests.get(request.service)?.size || 0;
      
      if (currentCount + activeCount >= config.maxConcurrency) continue;

      // Check rate limits
      if (!this.canMakeRequest(request.service)) continue;

      // This request is ready
      readyRequests.push(request);
      serviceCounts.set(request.service, currentCount + 1);
      
      // Remove from queue
      this.requestQueue.splice(i, 1);

      // Limit batch size
      if (readyRequests.length >= 10) break;
    }

    return readyRequests;
  }

  private async executeRequest(request: QueuedRequest) {
    const activeSet = this.activeRequests.get(request.service);
    activeSet?.add(request.id);

    try {
      // Record rate limit usage
      this.recordRateLimitUsage(request.service);
      
      // Execute the actual request
      const result = await this.makeHttpRequest(request);
      
      // Success - reset circuit breaker failures
      this.onRequestSuccess(request.service);
      
      request.resolve(result);

    } catch (error) {
      // Handle failure
      this.onRequestFailure(request.service);
      
      // Check if we should retry
      if (this.shouldRetry(request, error)) {
        request.retries++;
        
        // Calculate backoff delay
        const config = this.serviceConfigs.get(request.service)!;
        const delay = config.retryConfig.backoffMs * 
                     Math.pow(config.retryConfig.backoffMultiplier, request.retries - 1);
        
        // Re-queue with delay
        setTimeout(() => {
          this.requestQueue.unshift(request);
        }, delay);
        
      } else {
        request.reject(error);
      }
    } finally {
      activeSet?.delete(request.id);
    }
  }

  private async makeHttpRequest(request: QueuedRequest): Promise<any> {
    const config = this.serviceConfigs.get(request.service);
    if (!config) {
      throw new Error(`Unknown service: ${request.service}`);
    }

    // Build URL and make request
    // This would integrate with the legislativeApiClient
    const { legislativeApiClient } = await import('./legislativeApiClient');
    
    return legislativeApiClient.request(request.service, {
      endpoint: request.endpoint,
      method: request.method as any,
      params: request.params,
      priority: request.priority
    });
  }

  // Circuit breaker logic
  private isServiceAvailable(service: string): boolean {
    const circuit = this.circuitStates.get(service);
    const config = this.serviceConfigs.get(service);
    
    if (!circuit || !config) return false;

    const now = Date.now();

    switch (circuit.state) {
      case 'closed':
        return true;
      
      case 'open':
        if (now - circuit.lastFailure > config.circuit.resetTimeoutMs) {
          circuit.state = 'half-open';
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return false;
    }
  }

  private onRequestSuccess(service: string) {
    const circuit = this.circuitStates.get(service);
    if (circuit) {
      circuit.failures = 0;
      circuit.state = 'closed';
    }
  }

  private onRequestFailure(service: string) {
    const circuit = this.circuitStates.get(service);
    const config = this.serviceConfigs.get(service);
    
    if (circuit && config) {
      circuit.failures++;
      circuit.lastFailure = Date.now();
      
      if (circuit.failures >= config.circuit.failureThreshold) {
        circuit.state = 'open';
      }
    }
  }

  // Rate limiting
  private canMakeRequest(service: string): boolean {
    const config = this.serviceConfigs.get(service);
    const window = this.rateLimitWindows.get(service);
    
    if (!config || !window) return false;

    const now = Date.now();
    const windowStart = now - config.rateLimit.windowMs;
    
    // Clean old entries
    const activeRequests = window.filter(timestamp => timestamp > windowStart);
    this.rateLimitWindows.set(service, activeRequests);
    
    return activeRequests.length < config.rateLimit.requests;
  }

  private recordRateLimitUsage(service: string) {
    const window = this.rateLimitWindows.get(service);
    window?.push(Date.now());
  }

  // Retry logic
  private shouldRetry(request: QueuedRequest, error: any): boolean {
    if (request.retries >= request.maxRetries) return false;
    
    // Don't retry 4xx errors (except 429 - rate limit)
    if (error.message?.includes('HTTP 4') && !error.message.includes('429')) {
      return false;
    }
    
    // Retry on network errors, timeouts, 5xx errors, rate limits
    const retryableErrors = [
      'timeout',
      'network',
      'HTTP 5',
      '429',
      'ECONNRESET',
      'ETIMEDOUT'
    ];
    
    return retryableErrors.some(pattern => 
      error.message?.toLowerCase().includes(pattern.toLowerCase()) ||
      error.name?.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Utility methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Monitoring and analytics
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [service, config] of this.serviceConfigs.entries()) {
      const circuit = this.circuitStates.get(service)!;
      const window = this.rateLimitWindows.get(service)!;
      const active = this.activeRequests.get(service)!;
      
      stats[service] = {
        config: {
          maxConcurrency: config.maxConcurrency,
          rateLimit: config.rateLimit
        },
        circuit: {
          state: circuit.state,
          failures: circuit.failures,
          available: this.isServiceAvailable(service)
        },
        usage: {
          activeRequests: active.size,
          recentRequests: window.length,
          rateLimitUtilization: window.length / config.rateLimit.requests
        }
      };
    }
    
    stats.queue = {
      pending: this.requestQueue.length,
      processing: this.processing
    };
    
    return stats;
  }

  // Priority adjustment for critical requests
  adjustPriority(requestId: string, newPriority: number) {
    const requestIndex = this.requestQueue.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      const request = this.requestQueue[requestIndex];
      request.priority = newPriority;
      
      // Re-sort the queue
      this.requestQueue.splice(requestIndex, 1);
      
      const insertIndex = this.requestQueue.findIndex(
        req => req.priority < newPriority
      );
      
      if (insertIndex === -1) {
        this.requestQueue.push(request);
      } else {
        this.requestQueue.splice(insertIndex, 0, request);
      }
    }
  }

  // Emergency circuit breaker override
  forceCircuitState(service: string, state: 'open' | 'closed' | 'half-open') {
    const circuit = this.circuitStates.get(service);
    if (circuit) {
      circuit.state = state;
      if (state === 'closed') {
        circuit.failures = 0;
      }
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.processing = false;
    
    // Wait for active requests to complete
    while (true) {
      const hasActive = Array.from(this.activeRequests.values())
        .some(set => set.size > 0);
      
      if (!hasActive) break;
      
      await this.wait(100);
    }
    
    // Reject remaining queued requests
    for (const request of this.requestQueue) {
      request.reject(new Error('System shutting down'));
    }
    
    this.requestQueue.length = 0;
  }
}

// Export singleton instance
export const requestOrchestrator = new RequestOrchestrator();
export default requestOrchestrator;