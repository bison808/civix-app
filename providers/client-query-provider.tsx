'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// OPTIMIZED: React Query with intelligent async loading
const ReactQueryProvider = dynamic(
  () => import('./react-query-dynamic').then(mod => ({ default: mod.ReactQueryProvider })),
  { 
    ssr: false,
    loading: () => (
      <div className="react-query-loading">
        <span>Loading state management...</span>
      </div>
    )
  }
);

export function ClientQueryProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't load React Query during SSR
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  );
}