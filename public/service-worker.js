// Service Worker for CITZN Platform
// Version: 1.1.0 - Production Ready

const CACHE_NAME = 'citzn-v1-1';
const DYNAMIC_CACHE = 'citzn-dynamic-v1-1';
const OFFLINE_URL = '/offline.html';

// Critical assets to cache immediately for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/feed',
  '/representatives',
  '/offline.html',
  '/manifest.json',
  '/citzn-logo.jpeg',
  '/civix-logo.jpeg'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/bills',
  '/api/representatives'
];

// Cache strategies
const CACHE_STRATEGIES = {
  'api': 'networkFirst',      // Try network first, fall back to cache
  'static': 'cacheFirst',      // Try cache first, fall back to network
  'image': 'cacheFirst',       // Images from cache first
  'default': 'staleWhileRevalidate' // Return cache while fetching
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing CITZN v1.1.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching critical assets for offline');
        // Cache critical URLs with error handling
        return Promise.allSettled(
          STATIC_CACHE_URLS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return Promise.resolve();
            })
          )
        );
      })
      .then(() => {
        console.log('[Service Worker] Installation complete, taking control');
        self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] Installation failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Determine strategy based on request type
  let strategy = CACHE_STRATEGIES.default;
  
  if (url.pathname.startsWith('/api/')) {
    strategy = CACHE_STRATEGIES.api;
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    strategy = CACHE_STRATEGIES.image;
  } else if (url.pathname.startsWith('/_next/static/')) {
    strategy = CACHE_STRATEGIES.static;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Handle different caching strategies
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'networkFirst':
      return networkFirst(request);
    case 'cacheFirst':
      return cacheFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

// Network first strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache on network failure
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) return offlineResponse;
    }
    
    throw error;
  }
}

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) return offlineResponse;
    }
    
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    // Update cache in background
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    return null;
  });
  
  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  if (event.data.action === 'cacheUrls' && event.data.urls) {
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-votes') {
    event.waitUntil(syncVotes());
  }
});

async function syncVotes() {
  // Get pending votes from IndexedDB
  // Send them to server when online
  console.log('[Service Worker] Syncing offline votes...');
}