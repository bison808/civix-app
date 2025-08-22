import React, { useState } from 'react';
import { OptimizedImage } from './OptimizedImage';

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
    sm: { logo: 100, tagline: 'text-xs', text: 'text-2xl' },
    md: { logo: 150, tagline: 'text-sm', text: 'text-3xl' },
    lg: { logo: 200, tagline: 'text-base', text: 'text-4xl' },
    xl: { logo: 250, tagline: 'text-lg', text: 'text-5xl' }
  };

  const sizeConfig = sizes[size];
  
  return (
    <div className="flex flex-col items-center">
      {!imageError ? (
        <div style={{ width: sizeConfig.logo, height: sizeConfig.logo, position: 'relative' }}>
          <OptimizedImage
            src="/citzn-logo.jpeg"
            alt="CITZN"
            width={sizeConfig.logo}
            height={sizeConfig.logo}
            className={`rounded-lg object-contain ${animated ? 'animate-pulse' : ''}`}
            priority={size === 'lg' || size === 'xl'}
            sizes={`(max-width: 640px) ${sizeConfig.logo}px, (max-width: 1024px) ${sizeConfig.logo}px, ${sizeConfig.logo}px`}
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

export default CivixLogo;