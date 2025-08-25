'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Users, 
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  BarChart3,
  HelpCircle,
  ChevronRight,
  MapPin,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';
import UserMenu from '@/components/UserMenu';
import CommitteeNotificationCenter from '@/components/notifications/CommitteeNotificationCenter';
import committeeNotificationService from '@/services/committee-notifications.service';

interface MobileNavProps {
  className?: string;
}

export default function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Load notifications immediately without hydration delay
  useEffect(() => {
    // Load notification count
    const loadNotificationCount = () => {
      const unread = committeeNotificationService.getUnreadNotifications();
      setNotificationCount(unread.length);
    };
    
    loadNotificationCount();
    
    // Set up polling for new notifications
    const interval = setInterval(loadNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close menu on route change with error handling
  useEffect(() => {
    try {
      setIsMenuOpen(false);
    } catch (error) {
      console.warn('Error closing menu on route change:', error);
    }
  }, [pathname]);

  // Prevent body scroll when menu is open with cleanup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    } catch (error) {
      console.warn('Error managing body scroll:', error);
    }
    
    return () => {
      try {
        document.body.style.overflow = 'unset';
      } catch (error) {
        console.warn('Error resetting body scroll:', error);
      }
    };
  }, [isMenuOpen]);

  const navItems = [
    { 
      icon: FileText, 
      label: 'Bills', 
      path: '/bills',
      badge: null 
    },
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/dashboard',
      badge: null 
    },
    { 
      icon: Users, 
      label: 'Reps', 
      path: '/representatives',
      badge: null 
    },
    { 
      icon: Building, 
      label: 'Committees', 
      path: '/committees',
      badge: null 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      badge: null 
    },
  ];

  const isActive = useCallback((path: string) => {
    try {
      return pathname === path;
    } catch (error) {
      console.warn('Error checking active path:', error);
      return false;
    }
  }, [pathname]);

  const handleNavigation = useCallback((path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location for critical navigation
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    }
  }, [router]);

  const handleMenuToggle = useCallback(() => {
    try {
      setIsMenuOpen(prev => !prev);
    } catch (error) {
      console.warn('Error toggling menu:', error);
    }
  }, []);

  // Don't show navigation on landing, register, or onboarding pages
  const shouldHideNav = pathname === '/' || 
                        pathname === '/register' || 
                        pathname.startsWith('/onboarding') || 
                        pathname === '/login';
  
  // Don't render on pages that shouldn't show navigation
  if (shouldHideNav) {
    return null;
  }

  // Fallback rendering for critical navigation if component encounters issues
  if (!navItems || navItems.length === 0) {
    console.warn('Navigation items not available, rendering fallback navigation');
    return (
      <nav className="mobile-nav-critical flex items-center justify-center md:hidden">
        <p className="text-sm text-gray-500">Navigation loading...</p>
      </nav>
    );
  }

  return (
    <>
      {/* Mobile Header Bar - Fixed at top */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[9999]",
        "h-14 bg-white border-b border-gray-200",
        "flex items-center justify-between pl-1 pr-4 safe-top",
        "md:hidden",
        className
      )}
      style={{ zIndex: 9999 }}>
        {/* Left Side - Logo, ZIP, Verification */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleMenuToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img 
            src="/citzn-logo-new.webp" 
            alt="CITZN" 
            className="h-6 w-auto flex-shrink-0 ml-1"
            width="auto"
            height="24"
          />
          <div className="h-4 w-px bg-gray-300" />
          <ZipDisplay showChangeButton={false} />
          <VerificationBadge size="sm" showLabel={false} />
        </div>

        {/* Right Side - Search, Notifications, User */}
        <div className="flex items-center gap-1">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          <UserMenu />
        </div>
      </header>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <nav 
        className={cn(
          "mobile-nav-critical", // Critical CSS class with !important rules
          "flex items-center justify-around safe-bottom",
          "md:hidden", // Only show on mobile
          "shadow-lg" // Add shadow for better visual separation
        )}
        style={{ 
          display: 'flex !important', 
          zIndex: 9999,
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          backgroundColor: 'white',
          borderTop: '1px solid rgb(229 231 235)',
          pointerEvents: 'auto',
          height: '4rem',
          width: '100%'
        } as React.CSSProperties}
        role="navigation"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigation(item.path);
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center",
                "py-2 px-1 relative transition-all duration-150",
                "min-h-[44px] min-w-[44px]", // Ensure minimum touch target size
                "cursor-pointer touch-manipulation",
                "hover:bg-delta/5 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-delta focus:ring-opacity-50",
                active ? "text-delta font-medium" : "text-gray-500 hover:text-gray-700"
              )}
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.1)',
                pointerEvents: 'auto'
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              type="button"
            >
              <Icon size={22} />
              <span className={cn(
                "text-xs mt-1",
                active ? "font-medium" : "font-normal"
              )}>
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute top-1 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Slide-out Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw]",
        "bg-white shadow-2xl transform transition-transform duration-300",
        "md:hidden",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Menu Header */}
        <div className="p-4 border-b border-gray-200 safe-top">
          <div className="flex items-center justify-between mb-4">
            <img 
              src="/citzn-logo-new.webp" 
              alt="CITZN" 
              className="h-8 w-auto"
              width="auto"
              height="32"
            />
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-delta/20 rounded-full flex items-center justify-center">
                <User size={20} className="text-delta" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.anonymousId ? 'Anonymous User' : 'Verified User'}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {user.anonymousId?.slice(0, 8)}...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    handleNavigation(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                    "transition-colors text-left",
                    "min-h-[48px]", // Ensure minimum touch target
                    active 
                      ? "bg-delta/10 text-delta font-medium" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <Icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              );
            })}
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <button
                onClick={() => {
                  handleNavigation('/help');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 min-h-[48px]"
              >
                <HelpCircle size={20} />
                <span className="flex-1">Help & Support</span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
              
              <button
                onClick={() => {
                  try {
                    logout();
                    setIsMenuOpen(false);
                  } catch (error) {
                    console.error('Error during logout:', error);
                    setIsMenuOpen(false);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600 min-h-[48px]"
              >
                <LogOut size={20} />
                <span className="flex-1">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Footer */}
        <div className="p-4 border-t border-gray-200 safe-bottom">
          <p className="text-xs text-center text-gray-500">
            CITZN v1.0.0 • Directing Democracy
          </p>
        </div>
      </div>

      {/* Committee Notification Center */}
      <CommitteeNotificationCenter
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          // Refresh notification count after closing
          const unread = committeeNotificationService.getUnreadNotifications();
          setNotificationCount(unread.length);
        }}
      />
    </>
  );
}