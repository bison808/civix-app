'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu } from 'lucide-react';
import BillFeed from '@/components/bills/BillFeed';
import { CivixLogo } from '@/components/CivixLogo';
import UserMenu from '@/components/UserMenu';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EngagementDashboard from '@/components/engagement/EngagementDashboard';
import MobileNav from '@/components/navigation/MobileNav';
import FirstTimeUserSetup from '@/components/onboarding/FirstTimeUserSetup';
import { useAuth } from '@/contexts/AuthContext';
import { Bill } from '@/types';
import { api } from '@/services/api';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function EnhancedFeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEngagement, setShowEngagement] = useState(false);
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    loadBills();
    
    // Check if this is a first-time user
    const isFirstTime = localStorage.getItem('isFirstTimeUser');
    const hasCompletedTour = localStorage.getItem('hasCompletedTour');
    
    if (isFirstTime && !hasCompletedTour) {
      setShowFirstTimeSetup(true);
    }
  }, [user]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await api.bills.getAll();
      setBills(data);
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (billId: string, vote: 'like' | 'dislike' | null) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    await api.feedback.submitVote(billId, vote || 'like');
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, userVote: vote } : bill
    ));
  };

  const handleBillClick = (bill: Bill) => {
    router.push(`/bill/${bill.id}`);
  };

  const handleFirstTimeSetupComplete = () => {
    setShowFirstTimeSetup(false);
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col">
        {/* Mobile Navigation for small screens */}
        {isMobile && <MobileNav />}
        
        {/* Desktop Header */}
        {!isMobile && (
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white safe-top">
            <div className="flex items-center gap-4">
              <CivixLogo size="sm" />
              <ZipDisplay showChangeButton={false} />
              <VerificationBadge size="sm" showLabel={false} />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-tour="search"
              >
                <Search size={20} />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                data-tour="notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-negative rounded-full" />
              </button>
              <UserMenu />
            </div>
          </header>
        )}

        {/* Feed with Engagement Dashboard */}
        <div className={isMobile ? "flex-1 overflow-auto pt-14 pb-16" : "flex-1 overflow-auto"}>
          {/* Engagement Dashboard - Collapsible */}
          <div className="px-4 pt-4" data-tour="engagement-dashboard">
            <button
              onClick={() => setShowEngagement(!showEngagement)}
              className="w-full text-left mb-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Your Impact</span>
                <span className="text-xs text-delta">{showEngagement ? 'Hide' : 'Show'}</span>
              </div>
            </button>
            
            {showEngagement ? (
              <div className="mb-4">
                <EngagementDashboard userId={user?.anonymousId} />
              </div>
            ) : (
              <div className="mb-4">
                <EngagementDashboard userId={user?.anonymousId} compact={true} />
              </div>
            )}
          </div>
          
          {/* Bills Feed with Tour Attributes */}
          <div data-tour="bill-card">
            <BillFeed
              bills={bills}
              loading={loading}
              onVote={handleVote}
              onBillClick={handleBillClick}
              onRefresh={loadBills}
              hasMore={false}
              useEnhancedCards={true}
            />
          </div>
        </div>

        {/* Desktop Bottom Navigation Only */}
        {!isMobile && (
          <nav className="flex items-center justify-around border-t border-gray-200 bg-white safe-bottom">
            <button className="flex-1 py-3 text-delta">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-delta rounded" />
                <span className="text-xs mt-1">Feed</span>
              </div>
            </button>
            <button 
              className="flex-1 py-3 text-gray-500"
              onClick={() => router.push('/dashboard')}
            >
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-gray-300 rounded" />
                <span className="text-xs mt-1">Dashboard</span>
              </div>
            </button>
            <button 
              className="flex-1 py-3 text-gray-500"
              onClick={() => router.push('/representatives')}
            >
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-gray-300 rounded" />
                <span className="text-xs mt-1">Reps</span>
              </div>
            </button>
            <button 
              className="flex-1 py-3 text-gray-500"
              onClick={() => router.push('/settings')}
            >
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-gray-300 rounded" />
                <span className="text-xs mt-1">Settings</span>
              </div>
            </button>
          </nav>
        )}
      </div>

      {/* First-time User Setup & Tour */}
      {showFirstTimeSetup && (
        <FirstTimeUserSetup onComplete={handleFirstTimeSetupComplete} />
      )}

      {/* Add vote button tour attributes to the first bill card */}
      <style jsx global>{`
        [data-tour="bill-card"]:first-of-type .like-dislike-container {
          position: relative;
        }
        
        [data-tour="bill-card"]:first-of-type .like-dislike-container::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        
        [data-tour="bill-card"]:first-of-type .like-dislike-container {
          --tour-target: vote-buttons;
        }
      `}</style>
    </ProtectedRoute>
  );
}