'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg"></div>
  </div>
);

// Aggressive code splitting for heavy components
// These components will only load when needed

// Feed Components
export const LazyBillFeed = dynamic(
  () => import('./bills/BillFeed'),
  { 
    loading: () => <LoadingFallback />,
    ssr: false // Disable SSR for feed to reduce initial bundle
  }
);

export const LazyEngagementDashboard = dynamic(
  () => import('./engagement/EngagementDashboard'),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
);

// Representatives Components - Commented out until components are created
// export const LazyRepresentativesList = dynamic(
//   () => import('./representatives/RepresentativesList'),
//   {
//     loading: () => <LoadingFallback />,
//     ssr: false
//   }
// );

// export const LazyRepresentativeProfile = dynamic(
//   () => import('./representatives/RepresentativeProfile'),
//   {
//     loading: () => <LoadingFallback />,
//     ssr: false
//   }
// );

// Settings Components - Commented out until components are created
// export const LazyPrivacySettings = dynamic(
//   () => import('./settings/PrivacySettings'),
//   {
//     loading: () => <LoadingFallback />,
//     ssr: false
//   }
// );

// export const LazyNotificationSettings = dynamic(
//   () => import('./settings/NotificationSettings'),
//   {
//     loading: () => <LoadingFallback />,
//     ssr: false
//   }
// );

// Modal Components (only load when opened)
export const LazyDataTransparencyModal = dynamic(
  () => import('../src/components/privacy/DataTransparencyModal'),
  {
    loading: () => null,
    ssr: false
  }
);

// Impact Visualization (heavy component) - Commented out until component is created
// export const LazyImpactVisualization = dynamic(
//   () => import('./impact/ImpactVisualization'),
//   {
//     loading: () => <LoadingFallback />,
//     ssr: false
//   }
// );

// Onboarding Components
export const LazyOnboardingFlow = dynamic(
  () => import('./onboarding/OnboardingFlow'),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
);

// Prefetch critical components for better UX
export const prefetchComponents = () => {
  if (typeof window !== 'undefined') {
    // Prefetch after initial load
    setTimeout(() => {
      import('./bills/BillFeed');
      // import('./representatives/RepresentativesList');
    }, 2000);
  }
};