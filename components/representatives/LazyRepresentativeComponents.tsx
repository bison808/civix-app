'use client';
import { lazy, Suspense } from 'react';
import { RepresentativeCardSkeleton } from './RepresentativeCardSkeleton';

// Lazy load heavy representative components
const RepresentativeProfile = lazy(() => import('./RepresentativeProfile'));
const RepresentativeScorecard = lazy(() => import('./RepresentativeScorecard'));
const ContactRepresentative = lazy(() => import('./ContactRepresentative'));

// Wrapper components with error boundaries and loading states
interface LazyComponentProps {
  fallback?: React.ComponentType;
  children: React.ReactNode;
}

const LazyComponentWrapper: React.FC<LazyComponentProps> = ({ 
  fallback: Fallback = RepresentativeCardSkeleton,
  children 
}) => (
  <Suspense fallback={<Fallback />}>
    {children}
  </Suspense>
);

// Lazy Representative Profile with optimized loading
export const LazyRepresentativeProfile: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <RepresentativeProfile {...props} />
  </LazyComponentWrapper>
);

// Lazy Representative Scorecard
export const LazyRepresentativeScorecard: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <RepresentativeScorecard {...props} />
  </LazyComponentWrapper>
);

// Lazy Contact Representative
export const LazyContactRepresentative: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <ContactRepresentative {...props} />
  </LazyComponentWrapper>
);

// Preload components for better UX
export const preloadRepresentativeComponents = () => {
  // Preload after user interaction or on hover
  import('./RepresentativeProfile');
  import('./RepresentativeScorecard');
  import('./ContactRepresentative');
};