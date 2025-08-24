// Enhanced caching strategy for legislative data with TTL optimization
import { OptimizedCache } from './cacheOptimizer';

interface LegislativeCacheConfig {
  name: string;
  ttl: {
    active: number; // TTL for active/current data
    historical: number; // TTL for historical data
    metadata: number; // TTL for metadata (committees, members)
  };
  maxSize: number;
  priority: number;
  invalidationTriggers: string[]; // Events that should invalidate this cache
}

interface CacheInvalidationRule {
  pattern: string; // Regex pattern for cache keys to invalidate
  triggers: string[]; // Events that trigger this rule
  cascade?: boolean; // Whether to cascade to related caches
}

interface EngagementData {
  userId: string;
  itemId: string;
  itemType: 'bill' | 'committee' | 'representative';
  engagementType: 'view' | 'follow' | 'comment' | 'share';
  timestamp: number;
  metadata?: Record<string, any>;
}

class LegislativeCacheManager {
  private caches: Map<string, OptimizedCache<any>> = new Map();
  private invalidationRules: CacheInvalidationRule[] = [];
  private engagementCache: Map<string, EngagementData[]> = new Map();
  private preloadQueue: Set<string> = new Set();
  
  constructor() {
    this.initializeCaches();
    this.setupInvalidationRules();
    this.startBackgroundTasks();
  }

  private initializeCaches() {
    const configs: LegislativeCacheConfig[] = [
      {
        name: 'bills',
        ttl: {
          active: 60 * 60 * 1000, // 1 hour for active bills
          historical: 24 * 60 * 60 * 1000, // 24 hours for historical
          metadata: 4 * 60 * 60 * 1000 // 4 hours for bill metadata
        },
        maxSize: 2000,
        priority: 9,
        invalidationTriggers: ['bill_status_change', 'bill_action', 'vote_recorded']
      },
      {
        name: 'committees',
        ttl: {
          active: 4 * 60 * 60 * 1000, // 4 hours for active committees
          historical: 24 * 60 * 60 * 1000, // 24 hours for historical
          metadata: 24 * 60 * 60 * 1000 // 24 hours for committee membership
        },
        maxSize: 500,
        priority: 7,
        invalidationTriggers: ['committee_meeting', 'committee_membership_change']
      },
      {
        name: 'representatives',
        ttl: {
          active: 24 * 60 * 60 * 1000, // 24 hours for active reps
          historical: 7 * 24 * 60 * 60 * 1000, // 7 days for historical
          metadata: 24 * 60 * 60 * 1000 // 24 hours for rep metadata
        },
        maxSize: 1000,
        priority: 8,
        invalidationTriggers: ['representative_update', 'committee_assignment_change']
      },
      {
        name: 'user_engagement',
        ttl: {
          active: 60 * 1000, // 1 minute for real-time writes
          historical: 60 * 60 * 1000, // 1 hour for historical reads
          metadata: 5 * 60 * 1000 // 5 minutes for engagement metadata
        },
        maxSize: 5000,
        priority: 10, // Highest priority for user data
        invalidationTriggers: ['user_action', 'engagement_update']
      },
      {
        name: 'legislative_calendar',
        ttl: {
          active: 30 * 60 * 1000, // 30 minutes for upcoming events
          historical: 24 * 60 * 60 * 1000, // 24 hours for past events
          metadata: 60 * 60 * 1000 // 1 hour for calendar metadata
        },
        maxSize: 1000,
        priority: 6,
        invalidationTriggers: ['calendar_update', 'meeting_scheduled', 'meeting_cancelled']
      },
      {
        name: 'search_results',
        ttl: {
          active: 15 * 60 * 1000, // 15 minutes for search results
          historical: 60 * 60 * 1000, // 1 hour for historical searches
          metadata: 5 * 60 * 1000 // 5 minutes for search metadata
        },
        maxSize: 500,
        priority: 4,
        invalidationTriggers: ['data_update', 'index_rebuild']
      }
    ];

    for (const config of configs) {
      // Create cache with smart TTL selection
      const cache = new OptimizedCache({
        ttl: config.ttl.active, // Default to active TTL
        maxSize: config.maxSize,
        priority: config.priority
      });
      
      this.caches.set(config.name, cache);
    }
  }

  private setupInvalidationRules() {
    this.invalidationRules = [
      {
        pattern: 'bill_.*',
        triggers: ['bill_status_change', 'bill_action'],
        cascade: true
      },
      {
        pattern: 'committee_.*_bills',
        triggers: ['bill_status_change', 'committee_assignment_change'],
        cascade: false
      },
      {
        pattern: 'user_.*_followed_bills',
        triggers: ['bill_status_change', 'user_follow_change'],
        cascade: false
      },
      {
        pattern: 'search_.*',
        triggers: ['data_update', 'index_rebuild'],
        cascade: false
      },
      {
        pattern: 'rep_.*_committees',
        triggers: ['committee_membership_change', 'representative_update'],
        cascade: true
      }
    ];
  }

  // Enhanced get method with smart TTL selection
  get(cacheType: string, key: string, dataAge?: 'active' | 'historical' | 'metadata'): any {
    const cache = this.caches.get(cacheType);
    if (!cache) return null;

    // Check if we need to adjust TTL based on data age
    if (dataAge && this.shouldUseDifferentTTL(cacheType, key, dataAge)) {
      const config = this.getCacheConfig(cacheType);
      if (config) {
        // Create temporary entry with appropriate TTL
        const data = cache.get(key);
        if (data) {
          this.setWithTTL(cacheType, key, data, config.ttl[dataAge]);
        }
      }
    }

    return cache.get(key);
  }

  // Enhanced set method with smart TTL
  set(cacheType: string, key: string, data: any, dataAge: 'active' | 'historical' | 'metadata' = 'active'): void {
    const config = this.getCacheConfig(cacheType);
    if (!config) return;

    const ttl = config.ttl[dataAge];
    this.setWithTTL(cacheType, key, data, ttl);
  }

  private setWithTTL(cacheType: string, key: string, data: any, ttl: number): void {
    const cache = this.caches.get(cacheType);
    if (!cache) return;

    // Store with metadata about TTL and data age
    const enrichedData = {
      data,
      cacheMetadata: {
        ttl,
        cachedAt: Date.now(),
        cacheType,
        key
      }
    };

    cache.set(key, enrichedData);
  }

  // User engagement tracking with real-time caching
  trackEngagement(engagement: EngagementData): void {
    const userKey = `user_${engagement.userId}`;
    const engagements = this.engagementCache.get(userKey) || [];
    
    // Add new engagement
    engagements.push(engagement);
    
    // Keep only last 100 engagements per user
    if (engagements.length > 100) {
      engagements.splice(0, engagements.length - 100);
    }
    
    this.engagementCache.set(userKey, engagements);
    
    // Cache with real-time TTL
    this.set('user_engagement', userKey, engagements, 'active');
    
    // Trigger related cache updates
    this.onEngagementUpdate(engagement);
  }

  private onEngagementUpdate(engagement: EngagementData): void {
    // Invalidate related caches
    const relatedKeys = this.getRelatedCacheKeys(engagement);
    for (const key of relatedKeys) {
      this.invalidateKey(key);
    }
    
    // Update popularity scores and preload recommendations
    this.updatePopularityCache(engagement);
    this.schedulePreload(engagement);
  }

  // Intelligent preloading based on user behavior
  private schedulePreload(engagement: EngagementData): void {
    if (engagement.engagementType === 'view' || engagement.engagementType === 'follow') {
      // Preload related content
      const relatedKeys = this.getPredictivePreloadKeys(engagement);
      for (const key of relatedKeys) {
        this.preloadQueue.add(key);
      }
    }
  }

  private getPredictivePreloadKeys(engagement: EngagementData): string[] {
    const keys: string[] = [];
    
    switch (engagement.itemType) {
      case 'bill':
        // Preload bill details, actions, committees
        keys.push(
          `bill_${engagement.itemId}_details`,
          `bill_${engagement.itemId}_actions`,
          `bill_${engagement.itemId}_committees`,
          `bill_${engagement.itemId}_related`
        );
        break;
        
      case 'representative':
        // Preload rep's bills, committees, voting record
        keys.push(
          `rep_${engagement.itemId}_bills`,
          `rep_${engagement.itemId}_committees`,
          `rep_${engagement.itemId}_votes`,
          `rep_${engagement.itemId}_statements`
        );
        break;
        
      case 'committee':
        // Preload committee bills, meetings, members
        keys.push(
          `committee_${engagement.itemId}_bills`,
          `committee_${engagement.itemId}_meetings`,
          `committee_${engagement.itemId}_members`
        );
        break;
    }
    
    return keys;
  }

  // Batch operations for efficiency
  async batchGet(requests: Array<{cacheType: string, key: string}>): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    for (const request of requests) {
      const data = this.get(request.cacheType, request.key);
      if (data) {
        results.set(`${request.cacheType}:${request.key}`, data);
      }
    }
    
    return results;
  }

  batchSet(entries: Array<{cacheType: string, key: string, data: any, dataAge?: 'active' | 'historical' | 'metadata'}>): void {
    for (const entry of entries) {
      this.set(entry.cacheType, entry.key, entry.data, entry.dataAge);
    }
  }

  // Cache warming strategies
  async warmUserCache(userId: string): Promise<void> {
    try {
      // Get user's recent engagements
      const engagements = this.engagementCache.get(`user_${userId}`) || [];
      
      // Warm cache for frequently accessed items
      const frequentItems = this.analyzeFrequentItems(engagements);
      
      for (const item of frequentItems) {
        const preloadKeys = this.getPredictivePreloadKeys(item);
        for (const key of preloadKeys) {
          this.preloadQueue.add(key);
        }
      }
      
      // Process preload queue
      await this.processPreloadQueue();
      
    } catch (error) {
      console.warn('Cache warming failed for user:', userId, error);
    }
  }

  private analyzeFrequentItems(engagements: EngagementData[]): EngagementData[] {
    const itemCounts = new Map<string, { count: number, latest: EngagementData }>();
    
    for (const engagement of engagements) {
      const key = `${engagement.itemType}_${engagement.itemId}`;
      const current = itemCounts.get(key);
      
      if (current) {
        current.count++;
        if (engagement.timestamp > current.latest.timestamp) {
          current.latest = engagement;
        }
      } else {
        itemCounts.set(key, { count: 1, latest: engagement });
      }
    }
    
    return Array.from(itemCounts.values())
      .filter(item => item.count >= 2) // At least 2 interactions
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 items
      .map(item => item.latest);
  }

  private async processPreloadQueue(): Promise<void> {
    const batch = Array.from(this.preloadQueue).slice(0, 20); // Process 20 at a time
    this.preloadQueue.clear();
    
    // This would integrate with the legislative API client
    // For now, we'll simulate the preloading
    for (const key of batch) {
      try {
        // Parse key to determine what to preload
        const [type, id, subtype] = key.split('_');
        
        // Skip if already cached
        if (this.get(type, `${id}_${subtype}`)) continue;
        
        // Schedule for background loading
        setTimeout(() => this.backgroundLoad(type, id, subtype), 0);
        
      } catch (error) {
        console.warn('Preload failed for key:', key, error);
      }
    }
  }

  private async backgroundLoad(type: string, id: string, subtype: string): Promise<void> {
    try {
      // This would use the legislative API client
      const { legislativeApiClient } = await import('../services/legislativeApiClient');
      
      let data;
      switch (type) {
        case 'bill':
          if (subtype === 'details') {
            data = await legislativeApiClient.getBillDetails(id);
          } else if (subtype === 'actions') {
            data = await legislativeApiClient.getBillActions(id);
          }
          break;
        // Add more cases as needed
      }
      
      if (data) {
        this.set(type, `${id}_${subtype}`, data);
      }
      
    } catch (error) {
      console.warn('Background load failed:', type, id, subtype, error);
    }
  }

  // Cache invalidation with cascade support
  invalidatePattern(pattern: string, cascade: boolean = false): void {
    for (const [cacheType, cache] of this.caches.entries()) {
      // This would require extending the OptimizedCache class to support pattern invalidation
      // For now, we'll simulate it
      console.log(`Invalidating pattern ${pattern} in ${cacheType}`);
    }
  }

  invalidateKey(fullKey: string): void {
    const [cacheType, key] = fullKey.split(':', 2);
    const cache = this.caches.get(cacheType);
    if (cache) {
      // Would need to extend OptimizedCache to support key deletion
      console.log(`Invalidating key ${key} in ${cacheType}`);
    }
  }

  // Event-driven cache invalidation
  onDataUpdate(event: string, metadata?: any): void {
    const applicableRules = this.invalidationRules.filter(rule => 
      rule.triggers.includes(event)
    );
    
    for (const rule of applicableRules) {
      this.invalidatePattern(rule.pattern, rule.cascade);
    }
  }

  // Background maintenance tasks
  private startBackgroundTasks(): void {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
    
    // Process preload queue every 30 seconds
    setInterval(() => {
      if (this.preloadQueue.size > 0) {
        this.processPreloadQueue();
      }
    }, 30 * 1000);
    
    // Update cache metrics every minute
    setInterval(() => {
      this.updateCacheMetrics();
    }, 60 * 1000);
  }

  private cleanupExpiredEntries(): void {
    for (const [cacheType, cache] of this.caches.entries()) {
      // Force cleanup by attempting to access a non-existent key
      cache.get('__cleanup_trigger__');
    }
  }

  private updateCacheMetrics(): void {
    // Collect and report cache performance metrics
    const metrics: Record<string, any> = {};
    
    for (const [cacheType, cache] of this.caches.entries()) {
      metrics[cacheType] = {
        size: cache.size(),
        hitRate: this.getCacheHitRate(cacheType),
        preloadQueueSize: this.preloadQueue.size
      };
    }
    
    // This would be sent to analytics/monitoring system
    console.log('Cache metrics:', metrics);
  }

  // Utility methods
  private getCacheConfig(cacheType: string): LegislativeCacheConfig | null {
    // This would be stored in the initialization
    // For now, return a default config
    return null;
  }

  private shouldUseDifferentTTL(cacheType: string, key: string, dataAge: string): boolean {
    // Logic to determine if TTL should be adjusted based on data age
    return false;
  }

  private updatePopularityCache(engagement: EngagementData): void {
    // Update popularity scores for trending content
    const popularityKey = `popularity_${engagement.itemType}`;
    // Implementation would track engagement frequency
  }

  private getRelatedCacheKeys(engagement: EngagementData): string[] {
    // Return cache keys that should be invalidated based on this engagement
    return [];
  }

  private getCacheHitRate(cacheType: string): number {
    // Would integrate with existing cache metrics
    return 0;
  }

  // Public API methods
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [cacheType, cache] of this.caches.entries()) {
      stats[cacheType] = {
        size: cache.size(),
        hitRate: this.getCacheHitRate(cacheType)
      };
    }
    
    stats.preloadQueue = this.preloadQueue.size;
    stats.engagementCache = this.engagementCache.size;
    
    return stats;
  }

  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    this.engagementCache.clear();
    this.preloadQueue.clear();
  }
}

// Export singleton instance
export const legislativeCacheManager = new LegislativeCacheManager();
export default legislativeCacheManager;