import React from 'react';
import Image from 'next/image';

interface CivixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animated?: boolean;
}

export const CivixLogo: React.FC<CivixLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  animated = false 
}) => {
  const sizes = {
    sm: { logo: 32, text: 'text-lg', tagline: 'text-xs' },
    md: { logo: 48, text: 'text-2xl', tagline: 'text-sm' },
    lg: { logo: 64, text: 'text-4xl', tagline: 'text-base' },
    xl: { logo: 96, text: 'text-6xl', tagline: 'text-lg' }
  };

  const sizeConfig = sizes[size];
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <Image
          src="/civix-logo.jpeg"
          alt="CIVIX Logo"
          width={sizeConfig.logo}
          height={sizeConfig.logo}
          className={`rounded-lg object-cover ${
            animated ? 'animate-pulse' : ''
          }`}
          priority
        />
        <span className={`${sizeConfig.text} font-bold tracking-wide`}>
          CIVIX
        </span>
      </div>
      {showTagline && (
        <p className={`${sizeConfig.tagline} text-gray-600 mt-1`}>
          Be the Difference
        </p>
      )}
    </div>
  );
};

export default CivixLogo;