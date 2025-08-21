'use client';

import { useAuth } from '@/contexts/AuthContext';

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function VerificationBadge({
  size = 'md',
  showLabel = true,
  className = '',
}: VerificationBadgeProps) {
  const { user } = useAuth();

  if (!user) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getBadgeInfo = () => {
    switch (user.verificationLevel) {
      case 'verified':
        return {
          icon: (
            <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Verified Voter',
          description: 'Identity verified, 2x influence weight',
        };
      case 'revealed':
        return {
          icon: (
            <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ),
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Public Profile',
          description: 'Identity revealed, maximum influence',
        };
      case 'anonymous':
      default:
        return {
          icon: (
            <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          ),
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Anonymous',
          description: 'Privacy protected, standard influence',
        };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`inline-flex items-center justify-center p-1 rounded-full ${badgeInfo.bgColor} ${badgeInfo.color}`}
        title={badgeInfo.description}
      >
        {badgeInfo.icon}
      </div>
      {showLabel && (
        <div>
          <span className={`font-medium ${badgeInfo.color} ${textSizeClasses[size]}`}>
            {badgeInfo.label}
          </span>
          {user.influenceWeight && user.influenceWeight > 1 && (
            <span className={`ml-1 ${textSizeClasses[size]} text-gray-500`}>
              ({user.influenceWeight}x)
            </span>
          )}
        </div>
      )}
    </div>
  );
}