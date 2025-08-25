'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NavigationTest() {
  const pathname = usePathname();
  const [clickCount, setClickCount] = useState(0);
  const [navigationVisible, setNavigationVisible] = useState(false);

  useEffect(() => {
    const checkNavigation = () => {
      const navElement = document.querySelector('.mobile-nav-critical');
      const isVisible = navElement ? window.getComputedStyle(navElement).display !== 'none' : false;
      setNavigationVisible(isVisible);
      
      console.log('NavigationTest:', {
        pathname,
        navigationElement: !!navElement,
        navigationVisible: isVisible,
        zIndex: navElement ? window.getComputedStyle(navElement).zIndex : 'none'
      });
    };

    // Check immediately and after a delay
    checkNavigation();
    const timeout = setTimeout(checkNavigation, 1000);
    
    return () => clearTimeout(timeout);
  }, [pathname]);

  const testNavClick = () => {
    setClickCount(prev => prev + 1);
    const navButtons = document.querySelectorAll('.mobile-nav-critical button');
    console.log('NavigationTest: Found', navButtons.length, 'navigation buttons');
    
    navButtons.forEach((button, index) => {
      console.log(`Button ${index}:`, {
        visible: window.getComputedStyle(button as Element).display !== 'none',
        pointerEvents: window.getComputedStyle(button as Element).pointerEvents,
        zIndex: window.getComputedStyle(button as Element).zIndex
      });
    });
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      className="fixed top-16 right-4 bg-yellow-100 p-3 rounded-lg border border-yellow-300 z-[10000] text-xs"
      style={{ fontSize: '10px', lineHeight: '1.2' }}
    >
      <div className="font-semibold mb-1">Navigation Diagnostic</div>
      <div>Page: {pathname}</div>
      <div>Nav Visible: {navigationVisible ? '✅' : '❌'}</div>
      <div>Test Clicks: {clickCount}</div>
      <button 
        onClick={testNavClick}
        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
      >
        Test Nav
      </button>
    </div>
  );
}