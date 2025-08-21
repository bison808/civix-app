import React from 'react';

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
    sm: { triangle: 'text-lg', text: 'text-lg', tagline: 'text-xs' },
    md: { triangle: 'text-2xl', text: 'text-2xl', tagline: 'text-sm' },
    lg: { triangle: 'text-4xl', text: 'text-4xl', tagline: 'text-base' },
    xl: { triangle: 'text-6xl', text: 'text-6xl', tagline: 'text-lg' }
  };

  const sizeConfig = sizes[size];
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <span 
          className={`${sizeConfig.triangle} text-civix-blue font-bold ${
            animated ? 'animate-pulse' : ''
          }`}
        >
          ▲
        </span>
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