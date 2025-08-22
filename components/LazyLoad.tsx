'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

interface LoadingComponentProps {
  message?: string;
}

const LoadingComponent = ({ message = 'Loading...' }: LoadingComponentProps) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-delta"></div>
    <span className="ml-3 text-gray-600">{message}</span>
  </div>
);

export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  loadingMessage?: string
) => {
  return dynamic(importFunc, {
    loading: () => <LoadingComponent message={loadingMessage} />,
    ssr: true,
  });
};

// Pre-configured lazy loaded components
export const LazyBillCard = dynamic(
  () => import('./bills/BillCard'),
  {
    loading: () => <LoadingComponent message="Loading bill..." />,
    ssr: true,
  }
);

export const LazyRepresentativeCard = dynamic(
  () => import('./representatives/RepresentativeCard'),
  {
    loading: () => <LoadingComponent message="Loading representative..." />,
    ssr: true,
  }
);

export const LazyContactRepresentative = dynamic(
  () => import('./representatives/ContactRepresentative'),
  {
    loading: () => <LoadingComponent message="Loading contact form..." />,
    ssr: true,
  }
);

export const LazyDataTransparencyModal = dynamic(
  () => import('../src/components/privacy/DataTransparencyModal'),
  {
    loading: () => <LoadingComponent message="Loading privacy settings..." />,
    ssr: true,
  }
);

// Intersection Observer wrapper for viewport-based lazy loading
interface LazyWrapperProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

import { useEffect, useRef, useState } from 'react';

export const LazyWrapper = ({ 
  children, 
  threshold = 0.1, 
  rootMargin = '50px',
  fallback = <LoadingComponent />
}: LazyWrapperProps) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isInView ? children : fallback}
    </div>
  );
};