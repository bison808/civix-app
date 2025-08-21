'use client';

import { useState, useEffect } from 'react';

const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('mobile');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      if (width >= breakpoints.wide) {
        setCurrentBreakpoint('wide');
      } else if (width >= breakpoints.desktop) {
        setCurrentBreakpoint('desktop');
      } else if (width >= breakpoints.tablet) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('mobile');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = currentBreakpoint === 'mobile';
  const isTablet = currentBreakpoint === 'tablet';
  const isDesktop = currentBreakpoint === 'desktop' || currentBreakpoint === 'wide';
  const isWide = currentBreakpoint === 'wide';

  const isAtLeast = (breakpoint: Breakpoint) => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  const isAtMost = (breakpoint: Breakpoint) => {
    return windowSize.width <= breakpoints[breakpoint];
  };

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isAtLeast,
    isAtMost,
  };
}