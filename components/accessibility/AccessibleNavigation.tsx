'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccessibleNavigationProps {
  children: React.ReactNode;
}

export default function AccessibleNavigation({ children }: AccessibleNavigationProps) {
  const router = useRouter();
  const [announceText, setAnnounceText] = useState('');

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Skip to main content (Alt + M)
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView();
          setAnnounceText('Skipped to main content');
        }
      }

      // Skip to navigation (Alt + N)
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        const navigation = document.querySelector('nav[role="navigation"]');
        if (navigation) {
          (navigation as HTMLElement).focus();
          navigation.scrollIntoView();
          setAnnounceText('Skipped to navigation');
        }
      }

      // Quick search (Alt + S)
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
          (searchInput as HTMLElement).focus();
          setAnnounceText('Focused search input');
        }
      }

      // Navigate to Bills (Alt + B)
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        router.push('/bills');
        setAnnounceText('Navigating to Bills page');
      }

      // Navigate to Dashboard (Alt + D)
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        router.push('/dashboard');
        setAnnounceText('Navigating to Dashboard');
      }

      // Navigate to Committees (Alt + C)
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        router.push('/committees');
        setAnnounceText('Navigating to Committees');
      }

      // Navigate to Representatives (Alt + R)
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        router.push('/representatives');
        setAnnounceText('Navigating to Representatives');
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [router]);

  // Clear announcement after a delay
  useEffect(() => {
    if (announceText) {
      const timer = setTimeout(() => setAnnounceText(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announceText]);

  return (
    <>
      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-2 left-2 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:relative focus:z-auto"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="absolute top-2 left-32 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:relative focus:z-auto"
        >
          Skip to navigation
        </a>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="sr-only" role="region" aria-label="Keyboard shortcuts">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Alt + M: Skip to main content</li>
          <li>Alt + N: Skip to navigation</li>
          <li>Alt + S: Focus search</li>
          <li>Alt + B: Go to Bills page</li>
          <li>Alt + D: Go to Dashboard</li>
          <li>Alt + C: Go to Committees</li>
          <li>Alt + R: Go to Representatives</li>
        </ul>
      </div>

      {/* Live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceText}
      </div>

      {children}
    </>
  );
}