'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic import with SSR disabled to prevent context errors
const CommitteesPageContent = dynamic(
  () => import('./CommitteesPageContent').then(mod => ({ default: mod.CommitteesPageContent })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Committees...</p>
        </div>
      </div>
    )
  }
);

export default function CommitteesPageClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Committees System...</p>
        </div>
      </div>
    );
  }

  return <CommitteesPageContent />;
}