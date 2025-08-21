import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);
  const sizes = {
    sm: { logo: 80, tagline: 'text-xs', text: 'text-2xl' },
    md: { logo: 120, tagline: 'text-sm', text: 'text-3xl' },
    lg: { logo: 160, tagline: 'text-base', text: 'text-4xl' },
    xl: { logo: 200, tagline: 'text-lg', text: 'text-5xl' }
  };

  const sizeConfig = sizes[size];
  
  return (
    <div className="flex flex-col items-center">
      {!imageError ? (
        <Image
          src="/civix-logo.jpeg"
          alt="CIVIX"
          width={sizeConfig.logo}
          height={sizeConfig.logo}
          className={`rounded-lg object-contain ${
            animated ? 'animate-pulse' : ''
          }`}
          priority
          onError={() => setImageError(true)}
          unoptimized={true}
        />
      ) : (
        <div 
          className={`${sizeConfig.text} font-bold text-delta ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ 
            width: sizeConfig.logo, 
            height: sizeConfig.logo,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          CIVIX
        </div>
      )}
      {showTagline && (
        <p className={`${sizeConfig.tagline} text-gray-600 mt-2`}>
          Learn & Influence
        </p>
      )}
    </div>
  );
};

export default CivixLogo;