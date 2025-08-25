'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// PRODUCTION FIX: Use real BillsPageContent that calls LegiScan API, not placeholder data
const BillsPageContent = dynamic(
  () => import('./BillsPageContent').then(mod => ({ default: mod.BillsPageContent })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading California Legislative Bills...</p>
        </div>
      </div>
    )
  }
);

export default function BillsPageClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Bills System...</p>
        </div>
      </div>
    );
  }

  return <BillsPageContent />;
}