'use client';

export const dynamic = 'force-dynamic';

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
import ContextualFeedbackPrompt from '@/components/feedback/ContextualFeedbackPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { Bill } from '@/types';
import { api } from '@/services/api';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { coverageDetectionService } from '@/services/coverageDetectionService';

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEngagement, setShowEngagement] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    loadBills();
    loadLocationData();
  }, [user]);

  const loadLocationData = async () => {
    const zipCode = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') : null;
    if (zipCode) {
      try {
        const zipResponse = await fetch('/api/auth/verify-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipCode })
        });
        const zipData = await zipResponse.json();
        
        if (zipData.valid) {
          const locationData = {
            city: zipData.city,
            state: zipData.state,
            county: zipData.county,
            zipCode,
            coordinates: [0, 0] as [number, number],
            districts: { congressional: 0 }
          };
          const coverage = coverageDetectionService.determineUserExperience(locationData);
          setLocationData(locationData);
          setCoverage(coverage);
        }
      } catch (error) {
        console.error('Failed to load location data:', error);
      }
    }
  };

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
    // Update local state
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, userVote: vote } : bill
    ));
  };

  const handleBillClick = (bill: Bill) => {
    router.push(`/bill/${bill.id}`);
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white safe-top">
            <div className="flex items-center gap-4">
              <CivixLogo size="sm" />
              <ZipDisplay showChangeButton={false} />
              <VerificationBadge size="sm" showLabel={false} />
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
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
        <div className="px-4 pt-4">
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
        
        <BillFeed
          bills={bills}
          loading={loading}
          onVote={handleVote}
          onBillClick={handleBillClick}
          onRefresh={loadBills}
          hasMore={false}
          useEnhancedCards={true}
        />

        {/* Feedback Collection at Bottom of Feed */}
        {!loading && bills.length > 0 && coverage && locationData && (
          <div className="px-4 py-6">
            <ContextualFeedbackPrompt
              context={{
                type: 'after_search',
                zipCode: locationData.zipCode,
                state: locationData.state,
                page: 'feed'
              }}
              compact
            />
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}