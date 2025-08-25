'use client';

import nextDynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

// Dynamic import to prevent React Query SSR issues
const BillsPageContent = nextDynamic(
  () => import('@/components/pages/BillsPageContent').then(mod => ({ default: mod.BillsPageContent })),
  { 
    ssr: false,
    loading: () => <BillsPageLoading />
  }
);

function BillsPageLoading() {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 10000); // Show timeout after 10 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Taking longer than expected</h2>
          <p className="text-sm text-yellow-600 mb-4">
            Bills are taking a while to load. This might be due to high server load.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Legislative Bills...</p>
        <p className="text-xs text-gray-500 mt-2">Initializing data connection</p>
      </div>
    </div>
  );
}

export default function BillsPage() {
  return <BillsPageContent />;
}