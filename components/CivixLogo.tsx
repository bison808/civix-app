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
    sm: { logo: 80, tagline: 'text-xs' },
    md: { logo: 120, tagline: 'text-sm' },
    lg: { logo: 160, tagline: 'text-base' },
    xl: { logo: 200, tagline: 'text-lg' }
  };

  const sizeConfig = sizes[size];
  
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/civix-logo.jpeg"
        alt="CIVIX"
        width={sizeConfig.logo}
        height={sizeConfig.logo}
        className={`rounded-lg object-contain ${
          animated ? 'animate-pulse' : ''
        }`}
        priority
      />
      {showTagline && (
        <p className={`${sizeConfig.tagline} text-gray-600 mt-2`}>
          Learn & Influence
        </p>
      )}
    </div>
  );
};

export default CivixLogo;