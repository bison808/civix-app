'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('[SW] Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_UPDATED') {
          console.log('[SW] Cache updated for:', event.data.url);
        }
      });

      // Precache critical resources
      if (registration.active) {
        registration.active.postMessage({
          action: 'cacheUrls',
          urls: [
            '/',
            '/feed',
            '/representatives',
            '/api/bills',
            '/citzn-logo.jpeg'
          ]
        });
      }

    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  };

  const showUpdateNotification = () => {
    // Simple notification for now - in production, use a proper toast library
    if (confirm('New version available! Reload to update?')) {
      window.location.reload();
    }
  };

  return null;
}

// Hook for service worker functionality
export function useServiceWorker() {
  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  };

  const clearCache = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ action: 'clearCache' });
        }
      });
    }
  };

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return {
    updateServiceWorker,
    clearCache,
    isOnline
  };
}