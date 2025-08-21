'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ZipDisplayProps {
  showChangeButton?: boolean;
  className?: string;
}

export default function ZipDisplay({
  showChangeButton = true,
  className = '',
}: ZipDisplayProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!user || !user.zipCode) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
        </svg>
        <span className="text-sm text-gray-500">No location set</span>
        {showChangeButton && (
          <button
            onClick={() => router.push('/verify')}
            className="text-sm text-delta hover:underline"
          >
            Set Location
          </button>
        )}
      </div>
    );
  }

  const displayLocation = user.location
    ? `${user.location.city}, ${user.location.state}`
    : user.zipCode;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="relative inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {displayLocation}
        </span>
        <span className="text-xs text-gray-500">
          {user.zipCode}
        </span>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
            <div className="font-medium mb-1">Your Location</div>
            {user.location && (
              <>
                <div>{user.location.city}, {user.location.state}</div>
                {user.location.county && (
                  <div className="text-gray-300">{user.location.county}</div>
                )}
              </>
            )}
            <div className="text-gray-300">ZIP: {user.zipCode}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

      {showChangeButton && (
        <button
          onClick={() => router.push('/verify')}
          className="text-sm text-delta hover:underline"
          aria-label="Change location"
        >
          Change
        </button>
      )}
    </div>
  );
}