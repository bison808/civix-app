import React, { useState } from 'react';
import Image from 'next/image';

interface CitznLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animated?: boolean;
}

export const CitznLogo: React.FC<CitznLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  animated = false 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizes = {
    sm: { logo: 100, container: 110, tagline: 'text-xs', text: 'text-2xl' },
    md: { logo: 150, container: 160, tagline: 'text-sm', text: 'text-3xl' },
    lg: { logo: 200, container: 210, tagline: 'text-base', text: 'text-4xl' },
    xl: { logo: 250, container: 260, tagline: 'text-lg', text: 'text-5xl' }
  };

  const sizeConfig = sizes[size];
  
  return (
    <div className="flex flex-col items-center">
      {!imageError ? (
        <div 
          className="relative flex items-center justify-center overflow-visible"
          style={{ 
            width: sizeConfig.container,
            height: sizeConfig.logo,
            padding: '5px'
          }}
        >
          <Image
            src="/citzn-logo-optimized.webp"
            alt="CITZN"
            width={sizeConfig.logo}
            height={sizeConfig.logo}
            className={`${animated ? 'animate-pulse' : ''}`}
            style={{ 
              maxWidth: 'none',
              width: `${sizeConfig.logo}px`,
              height: `${sizeConfig.logo}px`,
              objectFit: 'contain',
              marginLeft: '5px' // Add left margin to compensate for cutoff
            }}
            priority={size === 'lg' || size === 'xl'}
            onError={() => setImageError(true)}
          />
        </div>
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
          CITZN
        </div>
      )}
      {showTagline && (
        <p className={`${sizeConfig.tagline} text-gray-600 mt-2`}>
          Directing Democracy
        </p>
      )}
    </div>
  );
};

export default CitznLogo;