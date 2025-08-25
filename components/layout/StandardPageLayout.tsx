'use client';

import { ReactNode } from 'react';
import { Search, Bell } from 'lucide-react';
import { CitznLogo } from '@/components/CitznLogo';
import UserMenu from '@/components/UserMenu';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface StandardPageLayoutProps {
  children: ReactNode;
  showDesktopHeader?: boolean;
  containerClassName?: string;
  contentClassName?: string;
}

export function StandardPageLayout({ 
  children, 
  showDesktopHeader = true,
  containerClassName,
  contentClassName
}: StandardPageLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Desktop Header */}
      {!isMobile && showDesktopHeader && (
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white safe-top">
          <div className="flex items-center gap-4">
            <CitznLogo size="sm" />
            <ZipDisplay showChangeButton={false} />
            <VerificationBadge size="sm" showLabel={false} />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <UserMenu />
          </div>
        </header>
      )}

      {/* Page Content */}
      <div className={cn(
        isMobile ? "flex-1 overflow-auto pt-14 page-content-mobile" : "flex-1 overflow-auto",
        contentClassName
      )}>
        <div className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
          containerClassName
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default StandardPageLayout;