'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ResponsiveLayoutProps {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  breakpoint?: number;
}

export default function ResponsiveLayout({ 
  mobile, 
  desktop, 
  breakpoint = 768 
}: ResponsiveLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${breakpoint - 1}px)`);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering null on server
  if (!mounted) {
    return null;
  }

  return <>{isMobile ? mobile : desktop}</>;
}