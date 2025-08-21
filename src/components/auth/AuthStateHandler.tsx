'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthStateHandlerProps {
  children: React.ReactNode;
}

export default function AuthStateHandler({ children }: AuthStateHandlerProps) {
  const { user, loading, error, sessionExpiry } = useAuth();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
      
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Session expiry warning
  useEffect(() => {
    if (!sessionExpiry) return;

    const checkExpiry = () => {
      const now = new Date();
      const timeLeft = sessionExpiry.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeLeft > 0 && timeLeft <= fiveMinutes) {
        setErrorMessage('Your session will expire soon. Please save your work.');
        setShowError(true);
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionExpiry]);

  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-delta text-white px-4 py-2 text-center text-sm">
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading your session...
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {showError && errorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slideIn">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setShowError(false)}
                className="ml-3 text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {typeof window !== 'undefined' && !navigator.onLine && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                You're offline
              </span>
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
}