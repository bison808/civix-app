'use client';

import nextDynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const dynamic = 'force-dynamic';

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

function BillsPageLoading() {
  const [showTimeout, setShowTimeout] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 8000); // Show timeout after 8 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Taking longer than expected</h2>
          <p className="text-sm text-yellow-600 mb-4">
            Legislative bills are taking a while to load. This might be due to high server load.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
          >
            Reload page
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading California Legislative Bills...</p>
        <p className="text-xs text-gray-500 mt-2">Connecting to legislative data...</p>
      </div>
    </div>
  );
}

const BillsPageContent = nextDynamic(
  () => import('@/components/pages/BillsPageContent').then(mod => ({ 
    default: mod.BillsPageContent 
  })),
  { 
    ssr: false,
    loading: () => <BillsPageLoading />
  }
);

export default function BillsPage() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('Bills page error:', error);
      }}
    >
      <BillsPageContent />
    </ErrorBoundary>
  );
}