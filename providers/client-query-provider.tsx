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
  const [enableQuery, setEnableQuery] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Enable React Query after initial page load to prevent main bundle bloat
    const timer = setTimeout(() => {
      setEnableQuery(true);
    }, 100); // Small delay for performance optimization
    
    return () => clearTimeout(timer);
  }, []);

  // Don't load React Query during SSR or initial render
  if (!isClient || !enableQuery) {
    return <>{children}</>;
  }

  return (
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  );
}