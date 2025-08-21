'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SessionTimerProps {
  showWarning?: boolean;
  warningThreshold?: number; // minutes before expiry to show warning
}

export default function SessionTimer({
  showWarning = true,
  warningThreshold = 5,
}: SessionTimerProps) {
  const { sessionExpiry, checkSession } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isWarning, setIsWarning] = useState(false);
  const [showExtendPrompt, setShowExtendPrompt] = useState(false);

  useEffect(() => {
    if (!sessionExpiry) return;

    const updateTimer = () => {
      const now = new Date();
      const expiryTime = new Date(sessionExpiry);
      const diff = expiryTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Session expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let timeString = '';
      if (hours > 0) {
        timeString = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
      } else {
        timeString = `${seconds}s`;
      }

      setTimeLeft(timeString);

      // Check if we should show warning
      const minutesLeft = diff / (1000 * 60);
      if (showWarning && minutesLeft <= warningThreshold) {
        setIsWarning(true);
        if (minutesLeft <= 1 && !showExtendPrompt) {
          setShowExtendPrompt(true);
        }
      } else {
        setIsWarning(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry, showWarning, warningThreshold, showExtendPrompt]);

  const handleExtendSession = async () => {
    await checkSession();
    setShowExtendPrompt(false);
    setIsWarning(false);
  };

  if (!sessionExpiry || !timeLeft) return null;

  return (
    <>
      {/* Session Timer Display */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isWarning
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">Session: {timeLeft}</span>
      </div>

      {/* Extension Prompt Modal */}
      {showExtendPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <svg
                className="w-6 h-6 text-yellow-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-semibold">Session Expiring Soon</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Your session will expire in less than a minute. Would you like to extend it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendPrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
              <button
                onClick={handleExtendSession}
                className="flex-1 px-4 py-2 bg-delta text-white rounded-lg hover:bg-delta-dark"
              >
                Extend Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}