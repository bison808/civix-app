'use client';

import { CitznLogo } from '@/components/CitznLogo';
import { cn } from '@/lib/utils';

interface StandardPageHeaderProps {
  title: string;
  description?: string;
  showLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg';
  className?: string;
  centered?: boolean;
}

export function StandardPageHeader({ 
  title, 
  description, 
  showLogo = false,
  logoSize = 'md',
  className,
  centered = true
}: StandardPageHeaderProps) {
  return (
    <div className={cn(
      'mb-8',
      centered && 'text-center',
      className
    )}>
      {showLogo && (
        <div className="mx-auto mb-4">
          <CitznLogo size={logoSize} />
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

export default StandardPageHeader;