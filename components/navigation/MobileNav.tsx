'use client';

import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavProps {
  className?: string;
}

export default function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show navigation on landing, register, or onboarding pages
  const hideNavRoutes = ['/', '/register', '/onboarding', '/login'];
  if (hideNavRoutes.includes(pathname)) {
    return null;
  }

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems = [
    { 
      icon: Home, 
      label: 'Feed', 
      path: '/feed',
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
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      badge: null 
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Header Bar - Fixed at top */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[9999]",
        "h-14 bg-white border-b border-gray-200",
        "flex items-center justify-between px-4 safe-top",
        "md:hidden",
        className
      )}
      style={{ zIndex: 9999 }}>
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-bold text-lg text-delta">CITZN</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999]", // Maximum z-index
        "h-16 bg-white border-t border-gray-200",
        "flex items-center justify-around safe-bottom",
        "md:hidden" // Only show on mobile
      )}
      style={{ display: 'flex !important', zIndex: 9999 }} // Force inline styles
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center",
                "py-2 px-1 relative transition-colors",
                "min-h-[44px] min-w-[44px]", // Ensure minimum touch target size
                active ? "text-delta" : "text-gray-500"
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
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
            <span className="font-bold text-xl text-delta">CITZN</span>
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
                    router.push(item.path);
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
                  router.push('/help');
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
                  logout();
                  setIsMenuOpen(false);
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
    </>
  );
}