'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Crown, 
  Landmark, 
  Building2, 
  Home, 
  Users,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  ChevronLeft,
  Search
} from 'lucide-react';
import Button from '@/components/core/Button';
import { CivixLogo } from '@/components/CivixLogo';
import UserMenu from '@/components/UserMenu';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';

interface ResponsivePoliticalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
  breadcrumbs?: { label: string; href?: string; current?: boolean }[];
  sidebarContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

const GOVERNMENT_LEVEL_SHORTCUTS = [
  { id: 'federal', label: 'Federal', icon: Crown, color: 'text-purple-600', count: 0 },
  { id: 'state', label: 'State', icon: Landmark, color: 'text-green-600', count: 0 },
  { id: 'county', label: 'County', icon: Building2, color: 'text-blue-600', count: 0 },
  { id: 'local', label: 'Local', icon: Home, color: 'text-orange-600', count: 0 }
];

export default function ResponsivePoliticalLayout({
  children,
  title = 'Your Representatives',
  subtitle,
  showBreadcrumbs = false,
  breadcrumbs = [],
  sidebarContent,
  headerActions,
  className = ''
}: ResponsivePoliticalLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Focus management for accessibility
  useEffect(() => {
    if (sidebarOpen) {
      const firstFocusableElement = document.querySelector('[data-sidebar-focus]') as HTMLElement;
      firstFocusableElement?.focus();
    }
  }, [sidebarOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSidebarOpen(false);
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (sidebarOpen || showSearch) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [sidebarOpen, showSearch]);

  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Mobile Header */}
      {isMobile && (
        <header 
          className="bg-white border-b border-gray-200 sticky top-0 z-50"
          role="banner"
        >
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="p-2"
              >
                <Menu size={20} />
              </Button>
              <CivixLogo size="sm" />
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search representatives"
                className="p-2"
              >
                <Search size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Notifications"
                className="p-2 relative"
              >
                <Bell size={18} />
                <span 
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  aria-label="New notifications"
                />
              </Button>
              <UserMenu />
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div 
              className="px-4 py-3 border-t border-gray-200 bg-white"
              role="search"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search representatives..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  aria-label="Search representatives by name or district"
                />
              </div>
            </div>
          )}

          {/* Mobile Quick Nav */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {GOVERNMENT_LEVEL_SHORTCUTS.map((level) => {
                const Icon = level.icon;
                return (
                  <button
                    key={level.id}
                    className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 flex-shrink-0"
                    aria-label={`Filter by ${level.label} representatives`}
                  >
                    <Icon size={14} className={level.color} />
                    <span>{level.label}</span>
                    {level.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-xs rounded-full">
                        {level.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <header 
          className="bg-white border-b border-gray-200 sticky top-0 z-40"
          role="banner"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <CivixLogo size="sm" />
                <ZipDisplay showChangeButton={false} />
                <VerificationBadge size="sm" showLabel={false} />
                
                {/* Desktop Quick Government Level Nav */}
                <nav 
                  className="hidden lg:flex items-center gap-2"
                  role="navigation"
                  aria-label="Government level navigation"
                >
                  {GOVERNMENT_LEVEL_SHORTCUTS.map((level) => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label={`View ${level.label} representatives`}
                      >
                        <Icon size={16} className={level.color} />
                        <span className="font-medium">{level.label}</span>
                        {level.count > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-xs rounded-full">
                            {level.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="flex items-center gap-2">
                {headerActions}
                <Button 
                  variant="ghost" 
                  size="sm"
                  aria-label="Help and support"
                >
                  <HelpCircle size={20} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span 
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                    aria-label="New notifications"
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <nav 
          className="bg-white border-b border-gray-200 px-4 py-2"
          aria-label="Breadcrumb navigation"
        >
          <ol className="max-w-7xl mx-auto flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronLeft size={16} className="text-gray-400 mx-1 rotate-180" />
                )}
                {crumb.current ? (
                  <span 
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <a 
                    href={crumb.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {crumb.label}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Title Section */}
      {(title || subtitle) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        {(sidebarContent || (isMobile && sidebarOpen)) && (
          <aside 
            className={cn(
              'bg-white border-r border-gray-200 flex-shrink-0 z-40',
              isMobile 
                ? 'fixed left-0 top-0 h-full w-80 transform transition-transform duration-200 ease-in-out'
                : 'w-80',
              isMobile && sidebarOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''
            )}
            role="complementary"
            aria-label="Sidebar navigation"
          >
            {isMobile && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation menu"
                  data-sidebar-focus
                >
                  <X size={20} />
                </Button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto"
          role="main"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      <div 
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        id="announcements"
      />
    </div>
  );
}