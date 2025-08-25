import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import nextDynamic from 'next/dynamic';

// Kevin's Architecture + Rachel's UX: Client-only component with skeleton  
const CommitteesPageContent = nextDynamic(
  () => import('@/components/pages/CommitteesPageContent').then(mod => ({ 
    default: mod.CommitteesPageContent 
  })),
  { 
    ssr: false,
    loading: () => null // Skeleton handled by Suspense
  }
);

export const dynamic = 'force-dynamic';

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          Unable to Load Committee Data
        </h2>
        <p className="text-sm text-red-600 mb-4">
          We encountered an issue loading the committees page. This might be a temporary connectivity issue.
        </p>
        <div className="space-y-2">
          <button 
            onClick={resetErrorBoundary}
            className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Loading Again
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="block w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Progressive Loading Skeleton - Rachel's UX Enhancement
function CommitteesPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded-lg w-80 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm" role="status" aria-live="polite">
            Loading California legislative committees...
          </p>
        </div>
      </div>
    </div>
  );
}

// Kevin's Architecture Fix: Direct imports instead of dynamic imports

export default function CommitteesPage() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('Committees page error:', error);
        // Add accessibility announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.textContent = 'Error loading committees page. Please try refreshing.';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 3000);
      }}
    >
      <Suspense fallback={<CommitteesPageSkeleton />}>
        <CommitteesPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}