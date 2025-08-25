'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BillsPageContent } from '@/components/pages/BillsPageContent';
// import { NavigationTest } from '@/components/diagnostics/NavigationTest'; // Development only

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          Unable to Load Legislative Data
        </h2>
        <p className="text-sm text-red-600 mb-4">
          We encountered an issue loading the bills page. This might be a temporary connectivity issue.
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Loading Again
        </button>
      </div>
    </div>
  );
}

// Progressive Loading Skeleton - Rachel's UX Enhancement
function BillsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm" role="status" aria-live="polite">
            Loading California legislative bills...
          </p>
        </div>
      </div>
    </div>
  );
}

// Kevin's Architecture Solution: Direct import removes hydration isolation issues
// Rachel's UX: Progressive loading with skeleton screen for perceived performance
function BillsPageWithProgressiveLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Progressive loading: Show skeleton briefly, then content
    const timer = setTimeout(() => {
      setShowContent(true);
      setIsLoading(false);
    }, 200); // Brief skeleton display for perceived performance

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !showContent) {
    return <BillsPageSkeleton />;
  }

  return <BillsPageContent />;
}

export default function BillsPage() {
  return (
    <>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={(error) => {
          console.error('Bills page error:', error);
          // Add accessibility announcement for screen readers
          if (typeof document !== 'undefined') {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'assertive');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.textContent = 'Error loading bills page. Please try refreshing.';
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 3000);
          }
        }}
      >
        <BillsPageWithProgressiveLoading />
      </ErrorBoundary>
      {/* <NavigationTest /> Development only */}
    </>
  );
}