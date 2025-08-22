interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  storage: 'memory' | 'localStorage' | 'sessionStorage';
  compress?: boolean;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Cache configurations for different data types
  private cacheConfigs: Record<string, CacheConfig> = {
    bills: { ttl: 30 * 60 * 1000, storage: 'localStorage', compress: true }, // 30 min
    representatives: { ttl: 60 * 60 * 1000, storage: 'localStorage', compress: true }, // 1 hour
    user: { ttl: 5 * 60 * 1000, storage: 'sessionStorage', compress: false }, // 5 min
    zipCode: { ttl: 24 * 60 * 60 * 1000, storage: 'localStorage', compress: false }, // 24 hours
    api: { ttl: 5 * 60 * 1000, storage: 'memory', compress: false } // 5 min
  };

  constructor() {
    // Clean up expired cache on initialization
    if (typeof window !== 'undefined') {
      this.cleanupExpiredCache();
    }
  }

  // Get cache entry
  get<T>(key: string, config?: CacheConfig): T | null {
    const cacheConfig = config || this.getCacheConfig(key);
    
    if (cacheConfig.storage === 'memory') {
      return this.getFromMemory<T>(key);
    } else {
      return this.getFromStorage<T>(key, cacheConfig.storage);
    }
  }

  // Set cache entry
  set<T>(key: string, data: T, config?: CacheConfig, etag?: string): void {
    const cacheConfig = config || this.getCacheConfig(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      etag
    };

    if (cacheConfig.storage === 'memory') {
      this.setInMemory(key, entry);
    } else {
      this.setInStorage(key, entry, cacheConfig);
    }
  }

  // Check if cache is valid
  isValid(key: string, etag?: string): boolean {
    const config = this.getCacheConfig(key);
    const entry = this.getRawEntry(key, config);
    
    if (!entry) return false;
    
    // Check TTL
    const age = Date.now() - entry.timestamp;
    if (age > config.ttl) return false;
    
    // Check ETag if provided
    if (etag && entry.etag && entry.etag !== etag) return false;
    
    return true;
  }

  // Clear specific cache
  clear(key: string): void {
    const config = this.getCacheConfig(key);
    
    if (config.storage === 'memory') {
      this.memoryCache.delete(key);
    } else if (typeof window !== 'undefined') {
      const storage = config.storage === 'localStorage' ? localStorage : sessionStorage;
      storage.removeItem(`cache_${key}`);
    }
  }

  // Clear all cache
  clearAll(): void {
    this.memoryCache.clear();
    
    if (typeof window !== 'undefined') {
      // Clear localStorage cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage cache
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }

  // Private methods
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    const config = this.getCacheConfig(key);
    const age = Date.now() - entry.timestamp;
    
    if (age > config.ttl) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private getFromStorage<T>(key: string, storageType: 'localStorage' | 'sessionStorage'): T | null {
    if (typeof window === 'undefined') return null;
    
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    const cached = storage.getItem(`cache_${key}`);
    
    if (!cached) return null;
    
    try {
      const entry: CacheEntry<T> = JSON.parse(cached);
      const config = this.getCacheConfig(key);
      const age = Date.now() - entry.timestamp;
      
      if (age > config.ttl) {
        storage.removeItem(`cache_${key}`);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Cache parse error:', error);
      storage.removeItem(`cache_${key}`);
      return null;
    }
  }

  private setInMemory(key: string, entry: CacheEntry<any>): void {
    this.memoryCache.set(key, entry);
    
    // Limit memory cache size
    if (this.memoryCache.size > 100) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey !== undefined) {
        this.memoryCache.delete(firstKey);
      }
    }
  }

  private setInStorage(key: string, entry: CacheEntry<any>, config: CacheConfig): void {
    if (typeof window === 'undefined') return;
    
    const storage = config.storage === 'localStorage' ? localStorage : sessionStorage;
    
    try {
      const data = config.compress ? this.compress(entry) : JSON.stringify(entry);
      storage.setItem(`cache_${key}`, data);
    } catch (error) {
      console.error('Cache storage error:', error);
      // If quota exceeded, clear old cache
      this.cleanupExpiredCache();
    }
  }

  private getRawEntry(key: string, config: CacheConfig): CacheEntry<any> | null {
    if (config.storage === 'memory') {
      return this.memoryCache.get(key) || null;
    }
    
    if (typeof window === 'undefined') return null;
    
    const storage = config.storage === 'localStorage' ? localStorage : sessionStorage;
    const cached = storage.getItem(`cache_${key}`);
    
    if (!cached) return null;
    
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  private getCacheConfig(key: string): CacheConfig {
    // Determine cache type from key
    const type = key.split('_')[0];
    return this.cacheConfigs[type] || {
      ttl: this.defaultTTL,
      storage: 'memory',
      compress: false
    };
  }

  private compress(data: any): string {
    // Simple compression by removing whitespace from JSON
    return JSON.stringify(data).replace(/\s+/g, ' ');
  }

  private cleanupExpiredCache(): void {
    if (typeof window === 'undefined') return;
    
    const storages = [localStorage, sessionStorage];
    
    storages.forEach(storage => {
      Object.keys(storage).forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const entry = JSON.parse(storage.getItem(key) || '{}');
            const type = key.replace('cache_', '').split('_')[0];
            const config = this.cacheConfigs[type];
            
            if (config && entry.timestamp) {
              const age = Date.now() - entry.timestamp;
              if (age > config.ttl) {
                storage.removeItem(key);
              }
            }
          } catch {
            // Remove corrupted cache
            storage.removeItem(key);
          }
        }
      });
    });
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// React hook for cache
export function useCache<T>(key: string, fetcher: () => Promise<T>, options?: {
  ttl?: number;
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}) {
  const cached = cacheManager.get<T>(key);
  
  if (cached) {
    return { data: cached, loading: false, error: null };
  }
  
  // Fetch and cache
  fetcher().then(data => {
    cacheManager.set(key, data, options ? {
      ttl: options.ttl || 5 * 60 * 1000,
      storage: options.storage || 'memory',
      compress: false
    } : undefined);
  });
  
  return { data: null, loading: true, error: null };
}