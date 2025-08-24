// Cache Management Service for Enhanced Bill Tracking
// Provides unified caching across all bill-related services

interface CacheConfig {
  duration: number; // in milliseconds
  maxSize: number;  // maximum number of entries
  prefix: string;   // cache key prefix
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

class CacheManagerService {
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map();
  private configs: Map<string, CacheConfig> = new Map();

  // Default cache configurations
  private defaultConfigs: { [key: string]: CacheConfig } = {
    bills: {
      duration: 15 * 60 * 1000, // 15 minutes
      maxSize: 500,
      prefix: 'bills_'
    },
    representatives: {
      duration: 30 * 60 * 1000, // 30 minutes
      maxSize: 200,
      prefix: 'reps_'
    },
    bill_tracking: {
      duration: 5 * 60 * 1000, // 5 minutes for real-time tracking
      maxSize: 100,
      prefix: 'tracking_'
    },
    personalized: {
      duration: 10 * 60 * 1000, // 10 minutes for personalized content
      maxSize: 50,
      prefix: 'personal_'
    }
  };

  constructor() {
    // Initialize default caches
    Object.entries(this.defaultConfigs).forEach(([name, config]) => {
      this.createCache(name, config);
    });
  }

  // Create a new cache with configuration
  createCache(name: string, config: CacheConfig): void {
    this.caches.set(name, new Map());
    this.configs.set(name, config);
  }

  // Get data from cache
  get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches.get(cacheName);
    const config = this.configs.get(cacheName);
    
    if (!cache || !config) {
      console.warn(`Cache ${cacheName} not found`);
      return null;
    }

    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > config.duration) {
      cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data as T;
  }

  // Set data in cache
  set<T>(cacheName: string, key: string, data: T): void {
    const cache = this.caches.get(cacheName);
    const config = this.configs.get(cacheName);
    
    if (!cache || !config) {
      console.warn(`Cache ${cacheName} not found`);
      return;
    }

    const now = Date.now();
    
    // Check if cache is full
    if (cache.size >= config.maxSize) {
      this.evictLeastUsed(cacheName);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    };

    cache.set(key, entry);
  }

  // Check if key exists and is valid
  has(cacheName: string, key: string): boolean {
    const cached = this.get(cacheName, key);
    return cached !== null;
  }

  // Remove specific key from cache
  delete(cacheName: string, key: string): boolean {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;
    
    return cache.delete(key);
  }

  // Clear entire cache
  clear(cacheName: string): void {
    const cache = this.caches.get(cacheName);
    if (cache) {
      cache.clear();
    }
  }

  // Clear all caches
  clearAll(): void {
    this.caches.forEach(cache => cache.clear());
  }

  // Evict least recently used entries when cache is full
  private evictLeastUsed(cacheName: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache || cache.size === 0) return;

    let oldestKey = '';
    let oldestAccess = Date.now();

    // Find least recently accessed entry
    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats(cacheName: string): {
    size: number;
    maxSize: number;
    duration: number;
    entries: Array<{ key: string; accessCount: number; age: number }>;
  } | null {
    const cache = this.caches.get(cacheName);
    const config = this.configs.get(cacheName);
    
    if (!cache || !config) return null;

    const now = Date.now();
    const entries = Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      accessCount: entry.accessCount,
      age: now - entry.timestamp
    }));

    return {
      size: cache.size,
      maxSize: config.maxSize,
      duration: config.duration,
      entries
    };
  }

  // Clean up expired entries across all caches
  cleanup(): void {
    const now = Date.now();
    
    this.caches.forEach((cache, cacheName) => {
      const config = this.configs.get(cacheName);
      if (!config) return;

      const keysToDelete: string[] = [];
      
      cache.forEach((entry, key) => {
        if (now - entry.timestamp > config.duration) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => cache.delete(key));
    });
  }

  // Preload data into cache
  async preload<T>(
    cacheName: string, 
    key: string, 
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check if already cached
    const cached = this.get<T>(cacheName, key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    try {
      const data = await fetcher();
      this.set(cacheName, key, data);
      return data;
    } catch (error) {
      console.error(`Error preloading cache ${cacheName}:${key}:`, error);
      throw error;
    }
  }

  // Batch operations
  setMany<T>(cacheName: string, entries: Array<{ key: string; data: T }>): void {
    entries.forEach(({ key, data }) => {
      this.set(cacheName, key, data);
    });
  }

  getMany<T>(cacheName: string, keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(cacheName, key)
    }));
  }

  // Session storage integration for persistence across browser sessions
  saveToSession(cacheName: string): void {
    if (typeof window === 'undefined') return;

    try {
      const cache = this.caches.get(cacheName);
      const config = this.configs.get(cacheName);
      
      if (!cache || !config) return;

      const cacheData = {
        entries: Array.from(cache.entries()),
        config
      };

      sessionStorage.setItem(
        `cache_${config.prefix}${cacheName}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.warn(`Failed to save cache ${cacheName} to session storage:`, error);
    }
  }

  loadFromSession(cacheName: string): void {
    if (typeof window === 'undefined') return;

    try {
      const config = this.configs.get(cacheName);
      if (!config) return;

      const saved = sessionStorage.getItem(`cache_${config.prefix}${cacheName}`);
      if (!saved) return;

      const cacheData = JSON.parse(saved);
      const now = Date.now();

      // Filter out expired entries
      const validEntries = cacheData.entries.filter(
        ([_, entry]: [string, CacheEntry<any>]) => 
          now - entry.timestamp <= config.duration
      );

      // Restore valid entries
      const cache = new Map<string, CacheEntry<any>>(validEntries);
      this.caches.set(cacheName, cache);
    } catch (error) {
      console.warn(`Failed to load cache ${cacheName} from session storage:`, error);
    }
  }

  // Auto-cleanup scheduler
  private cleanupInterval: NodeJS.Timeout | null = null;

  startAutoCleanup(intervalMs: number = 5 * 60 * 1000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Cache service specialized for bills
export class BillsCacheService {
  private cacheManager = new CacheManagerService();

  constructor() {
    // Start auto-cleanup
    this.cacheManager.startAutoCleanup();
    
    // Load persisted caches
    if (typeof window !== 'undefined') {
      this.cacheManager.loadFromSession('bills');
      this.cacheManager.loadFromSession('bill_tracking');
      this.cacheManager.loadFromSession('personalized');
    }
  }

  // Bills caching methods
  getBills(key: string) {
    return this.cacheManager.get('bills', key);
  }

  setBills(key: string, bills: any) {
    this.cacheManager.set('bills', key, bills);
  }

  // Representative activity caching
  getRepresentativeActivity(repId: string) {
    return this.cacheManager.get('representatives', repId);
  }

  setRepresentativeActivity(repId: string, activity: any) {
    this.cacheManager.set('representatives', repId, activity);
  }

  // Bill tracking caching
  getBillTracking(billId: string) {
    return this.cacheManager.get('bill_tracking', billId);
  }

  setBillTracking(billId: string, tracking: any) {
    this.cacheManager.set('bill_tracking', billId, tracking);
  }

  // Personalized bills caching
  getPersonalizedBills(userId: string) {
    return this.cacheManager.get('personalized', userId);
  }

  setPersonalizedBills(userId: string, bills: any) {
    this.cacheManager.set('personalized', userId, bills);
  }

  // Utility methods
  clearAllCaches() {
    this.cacheManager.clearAll();
  }

  getStats() {
    return {
      bills: this.cacheManager.getStats('bills'),
      representatives: this.cacheManager.getStats('representatives'),
      tracking: this.cacheManager.getStats('bill_tracking'),
      personalized: this.cacheManager.getStats('personalized')
    };
  }

  // Persist important caches
  persist() {
    this.cacheManager.saveToSession('bills');
    this.cacheManager.saveToSession('bill_tracking');
    this.cacheManager.saveToSession('personalized');
  }
}

export const cacheManagerService = new CacheManagerService();
export const billsCacheService = new BillsCacheService();

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    billsCacheService.persist();
  });
}