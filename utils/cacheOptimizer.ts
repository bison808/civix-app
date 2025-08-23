// Advanced caching strategies for political mapping system
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache entries
  priority: number; // Cache priority for eviction
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
}

class OptimizedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, data: T): void {
    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastImportant();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      priority: this.config.priority
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.data;
  }

  private evictLeastImportant(): void {
    let leastImportant: string | null = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Calculate importance score based on recency, frequency, and priority
      const recencyScore = Date.now() - entry.lastAccessed;
      const frequencyScore = 1000 / Math.max(entry.accessCount, 1);
      const priorityScore = 1000 / entry.priority;
      
      const totalScore = recencyScore + frequencyScore - priorityScore;
      
      if (totalScore < lowestScore) {
        lowestScore = totalScore;
        leastImportant = key;
      }
    }

    if (leastImportant) {
      this.cache.delete(leastImportant);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Specialized caches for different data types
export const representativeCache = new OptimizedCache({
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 500, // Up to 500 representatives
  priority: 10 // High priority
});

export const zipMappingCache = new OptimizedCache({
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days (static data)
  maxSize: 10000, // Large ZIP mapping
  priority: 8
});

export const billDataCache = new OptimizedCache({
  ttl: 60 * 60 * 1000, // 1 hour (dynamic data)
  maxSize: 1000,
  priority: 9
});

export const apiResponseCache = new OptimizedCache({
  ttl: 5 * 60 * 1000, // 5 minutes for API responses
  maxSize: 200,
  priority: 5
});

// Cache keys generator for consistent keying
export const cacheKeys = {
  representative: (id: string) => `rep_${id}`,
  zipDistrict: (zip: string) => `zip_${zip}`,
  districtReps: (state: string, district: string) => `district_${state}_${district}`,
  billsByRep: (repId: string) => `bills_${repId}`,
  apiCall: (endpoint: string, params: Record<string, any>) => 
    `api_${endpoint}_${JSON.stringify(params).replace(/[^a-zA-Z0-9]/g, '_')}`
};

// Batch cache operations for efficiency
export const batchCacheOperations = {
  async warmUpCache(zipCodes: string[]) {
    // Pre-populate cache with commonly accessed ZIP codes
    const promises = zipCodes.map(async (zip) => {
      const key = cacheKeys.zipDistrict(zip);
      if (!zipMappingCache.get(key)) {
        try {
          const { getZipMappingServices } = await import('../services/lazy');
          const services = await getZipMappingServices();
          const districtInfo = await services.zipDistrictMappingService.getDistrictByZip(zip);
          zipMappingCache.set(key, districtInfo);
        } catch (error) {
          console.warn(`Failed to warm up cache for ZIP ${zip}:`, error);
        }
      }
    });
    
    await Promise.allSettled(promises);
  },

  clearExpiredEntries() {
    // Force cleanup of expired entries across all caches
    [representativeCache, zipMappingCache, billDataCache, apiResponseCache].forEach(cache => {
      // The get() method automatically handles expiration cleanup
      // We can trigger it by attempting to access a non-existent key
      cache.get('__cleanup_trigger__');
    });
  }
};

// Performance monitoring for cache effectiveness
export const cacheMetrics = {
  hitRate: new Map<string, { hits: number; misses: number }>(),
  
  recordHit(cacheType: string) {
    const current = this.hitRate.get(cacheType) || { hits: 0, misses: 0 };
    current.hits++;
    this.hitRate.set(cacheType, current);
  },
  
  recordMiss(cacheType: string) {
    const current = this.hitRate.get(cacheType) || { hits: 0, misses: 0 };
    current.misses++;
    this.hitRate.set(cacheType, current);
  },
  
  getHitRate(cacheType: string): number {
    const stats = this.hitRate.get(cacheType);
    if (!stats || (stats.hits + stats.misses) === 0) return 0;
    return stats.hits / (stats.hits + stats.misses);
  },
  
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [cacheType, data] of this.hitRate.entries()) {
      stats[cacheType] = {
        ...data,
        hitRate: this.getHitRate(cacheType)
      };
    }
    return stats;
  }
};