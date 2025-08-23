'use client';

import dynamic from 'next/dynamic';

// Dynamically import the QueryProvider to avoid SSR issues
export const ClientQueryProvider = dynamic(
  () => import('./query-provider').then(mod => mod.QueryProvider),
  {
    ssr: false,
  }
);