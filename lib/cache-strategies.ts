// Advanced caching strategies for civic platform
import { QueryClient } from '@tanstack/react-query';

// Cache configuration for different types of civic data
export const CIVIC_CACHE_CONFIG = {
  // Congressional bills - update frequently during active sessions
  bills: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 30 * 60 * 1000, // 30 minutes during active sessions
    refetchIntervalInBackground: false,
    retry: 3,
  },
  
  // Bill details - more stable, can cache longer
  billDetails: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    retry: 3,
  },
  
  // Representatives - rarely change, cache aggressively
  representatives: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
    retry: 2,
  },
  
  // Representative details - stable data
  representativeDetails: {
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 3 * 24 * 60 * 60 * 1000, // 3 days
    refetchOnWindowFocus: false,
    retry: 2,
  },
  
  // Voting records - historical data, cache long-term
  votingRecords: {
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    refetchOnWindowFocus: false,
    retry: 1,
  },
  
  // User preferences - frequently accessed, cache aggressively
  userPreferences: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
    retry: 2,
  },
  
  // Location/ZIP data - very stable
  locationData: {
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    refetchOnWindowFocus: false,
    retry: 1,
  },
  
  // Search results - short-lived but important for UX
  searchResults: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  },
} as const;

// Create optimized query client for civic data
export function createCivicQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default conservative settings
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // Offline-first approach for civic data
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  });
}

// Smart cache invalidation for civic data
export class CivicCacheManager {
  constructor(private queryClient: QueryClient) {}

  // Invalidate bill-related caches when new data arrives
  async invalidateBillCaches(billId?: string) {
    const promises = [
      this.queryClient.invalidateQueries({ queryKey: ['bills'] }),
      this.queryClient.invalidateQueries({ queryKey: ['bills', 'trending'] }),
      this.queryClient.invalidateQueries({ queryKey: ['bills', 'recent'] }),
    ];

    if (billId) {
      promises.push(
        this.queryClient.invalidateQueries({ queryKey: ['bill', billId] }),
        this.queryClient.invalidateQueries({ queryKey: ['bill', billId, 'votes'] }),
        this.queryClient.invalidateQueries({ queryKey: ['bill', billId, 'amendments'] })
      );
    }

    await Promise.all(promises);
  }

  // Invalidate representative data
  async invalidateRepresentativeCaches(repId?: string) {
    const promises = [
      this.queryClient.invalidateQueries({ queryKey: ['representatives'] }),
    ];

    if (repId) {
      promises.push(
        this.queryClient.invalidateQueries({ queryKey: ['representative', repId] }),
        this.queryClient.invalidateQueries({ queryKey: ['representative', repId, 'bills'] }),
        this.queryClient.invalidateQueries({ queryKey: ['representative', repId, 'votes'] })
      );
    }

    await Promise.all(promises);
  }

  // Pre-fetch critical civic data
  async prefetchCriticalData(userLocation?: { state: string; district?: string }) {
    const prefetchPromises = [];

    // Prefetch trending bills
    prefetchPromises.push(
      this.queryClient.prefetchQuery({
        queryKey: ['bills', 'trending'],
        queryFn: () => fetch('/api/bills?trending=true').then(res => res.json()),
        ...CIVIC_CACHE_CONFIG.bills,
      })
    );

    // Prefetch user's representatives if location known
    if (userLocation) {
      prefetchPromises.push(
        this.queryClient.prefetchQuery({
          queryKey: ['representatives', 'user'],
          queryFn: () => fetch(`/api/representatives?state=${userLocation.state}&district=${userLocation.district}`).then(res => res.json()),
          ...CIVIC_CACHE_CONFIG.representatives,
        })
      );
    }

    await Promise.allSettled(prefetchPromises);
  }

  // Clean up stale civic data
  async cleanupStaleData() {
    // Remove expired entries
    this.queryClient.getQueryCache().clear();
    
    // Garbage collect old data
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        const lastUpdated = query.state.dataUpdatedAt;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        return Date.now() - lastUpdated > maxAge;
      },
    });
  }

  // Warm cache with user-specific data
  async warmCacheForUser(userPreferences: {
    zipCode?: string;
    followedRepresentatives?: string[];
    interestedSubjects?: string[];
  }) {
    const promises = [];

    // Cache user's local representatives
    if (userPreferences.zipCode) {
      promises.push(
        this.queryClient.prefetchQuery({
          queryKey: ['representatives', 'local', userPreferences.zipCode],
          queryFn: () => fetch(`/api/representatives/by-zip/${userPreferences.zipCode}`).then(res => res.json()),
          ...CIVIC_CACHE_CONFIG.representatives,
        })
      );
    }

    // Cache followed representatives
    if (userPreferences.followedRepresentatives?.length) {
      userPreferences.followedRepresentatives.forEach(repId => {
        promises.push(
          this.queryClient.prefetchQuery({
            queryKey: ['representative', repId],
            queryFn: () => fetch(`/api/representatives/${repId}`).then(res => res.json()),
            ...CIVIC_CACHE_CONFIG.representativeDetails,
          })
        );
      });
    }

    // Cache bills by user interests
    if (userPreferences.interestedSubjects?.length) {
      userPreferences.interestedSubjects.forEach(subject => {
        promises.push(
          this.queryClient.prefetchQuery({
            queryKey: ['bills', 'by-subject', subject],
            queryFn: () => fetch(`/api/bills?subject=${encodeURIComponent(subject)}`).then(res => res.json()),
            ...CIVIC_CACHE_CONFIG.bills,
          })
        );
      });
    }

    await Promise.allSettled(promises);
  }
}

// Background sync for offline civic data
export class CivicBackgroundSync {
  private syncQueue: Array<{ type: string; data: any }> = [];

  constructor(private queryClient: QueryClient) {
    this.setupBackgroundSync();
  }

  private setupBackgroundSync() {
    // Register service worker sync events
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Listen for background sync events
        this.queryClient.getQueryCache().subscribe(event => {
          if (event.type === 'updated' && event.query.state.status === 'error') {
            // Queue failed requests for background sync
            this.queueForSync({
              type: 'retry-query',
              data: {
                queryKey: event.query.queryKey,
                variables: event.query.options,
              }
            });
          }
        });
      });
    }
  }

  private queueForSync(item: { type: string; data: any }) {
    this.syncQueue.push(item);
    
    // Trigger background sync if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        return (registration as any).sync?.register('civic-data-sync');
      }).catch(console.error);
    }
  }

  // Process sync queue when online
  async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      
      try {
        if (item?.type === 'retry-query') {
          await this.queryClient.invalidateQueries({
            queryKey: item.data.queryKey
          });
        }
      } catch (error) {
        console.error('Background sync failed:', error);
        // Re-queue if still failing
        if (item) this.syncQueue.unshift(item);
        break;
      }
    }
  }
}

// Preload critical resources for better performance
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    '/citzn-logo.jpeg',
    '/civix-logo.jpeg',
    '/manifest.json',
    '/offline.html',
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = url.endsWith('.jpeg') ? 'image' : 'fetch';
    if (url.endsWith('.jpeg')) {
      link.type = 'image/jpeg';
    }
    document.head.appendChild(link);
  });
};