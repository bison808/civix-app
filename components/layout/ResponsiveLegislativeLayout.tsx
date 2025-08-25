'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface ResponsiveLegislativeLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  mobileHeader?: React.ReactNode;
  className?: string;
}

export default function ResponsiveLegislativeLayout({
  children,
  sidebar,
  header,
  mobileHeader,
  className
}: ResponsiveLegislativeLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Mobile Header */}
      {isMobile && mobileHeader && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          {mobileHeader}
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && header && (
        <div className="bg-white border-b border-gray-200">
          {header}
        </div>
      )}

      <div className={cn(
        "flex",
        isMobile ? "flex-col pt-14 page-content-mobile" : "min-h-screen"
      )}>
        {/* Sidebar - Hidden on mobile, collapsible on tablet */}
        {sidebar && !isMobile && (
          <aside className={cn(
            "bg-white border-r border-gray-200 overflow-y-auto",
            isTablet ? "w-64" : "w-80",
            "flex-shrink-0"
          )}>
            <div className="p-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className={cn(
            "max-w-full",
            isMobile ? "px-4 py-4" : "px-6 py-8",
            !sidebar && "max-w-7xl mx-auto"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar/Bottom Sheet */}
      {isMobile && sidebar && (
        <div className="hidden" id="mobile-sidebar">
          {/* This would be triggered by a button to show sidebar content in a modal/bottom sheet */}
          {sidebar}
        </div>
      )}
    </div>
  );
}