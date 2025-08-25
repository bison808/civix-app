'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic import with SSR disabled to prevent context errors - using simple version temporarily
const BillsPageContent = dynamic(
  () => import('./BillsPageContent.simple').then(mod => ({ default: mod.BillsPageContentSimple })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bills...</p>
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