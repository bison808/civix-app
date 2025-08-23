'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileBillCard from '@/components/bills/MobileBillCard';
import EngagementDashboard from '@/components/engagement/EngagementDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Bill } from '@/types';
import { api } from '@/services/api';
import { RefreshCw, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileFeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEngagement, setShowEngagement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'federal' | 'state' | 'local'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBills();
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBills();
    setTimeout(() => setIsRefreshing(false), 500);
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

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const matchesSearch = !searchQuery || 
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'federal' && (bill.billNumber.includes('HR') || bill.billNumber.includes('S'))) ||
      (selectedFilter === 'state' && bill.billNumber.includes('state')) ||
      (selectedFilter === 'local' && bill.billNumber.includes('local'));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Main Content Area - Accounts for fixed header and bottom nav */}
        <div className="flex-1 pt-14 pb-16 overflow-hidden flex flex-col">
          {/* Search & Filters - Sticky */}
          <div className="sticky top-14 z-30 bg-white border-b border-gray-200">
            <div className="p-3">
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="search"
                  placeholder="Search bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-delta focus:border-delta"
                  aria-label="Search bills"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {(['all', 'federal', 'state', 'local'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      "min-h-[32px]", // Touch target
                      selectedFilter === filter
                        ? "bg-delta text-white"
                        : "bg-gray-100 text-gray-600 active:scale-95"
                    )}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Engagement Dashboard Toggle */}
            <button
              onClick={() => setShowEngagement(!showEngagement)}
              className="w-full px-3 py-2 bg-gradient-to-r from-delta/5 to-delta/10 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Your Impact Score: 85</span>
                <span className="text-xs text-delta">{showEngagement ? '▼' : '▶'}</span>
              </div>
            </button>

            {/* Expanded Engagement Dashboard */}
            {showEngagement && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <EngagementDashboard userId={user?.anonymousId} compact={true} />
              </div>
            )}
          </div>

          {/* Bills List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Pull to Refresh Indicator */}
            {isRefreshing && (
              <div className="flex justify-center py-3">
                <RefreshCw className="animate-spin text-delta" size={20} />
              </div>
            )}

            <div className="p-3 space-y-3">
              {loading ? (
                // Loading Skeletons
                <>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
                  ))}
                </>
              ) : filteredBills.length === 0 ? (
                // Empty State
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm mb-4">No bills found</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('all');
                    }}
                    className="text-delta text-sm font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                // Bills List
                <>
                  {filteredBills.map(bill => (
                    <MobileBillCard
                      key={bill.id}
                      bill={bill}
                      onVote={handleVote}
                      onClick={handleBillClick}
                    />
                  ))}
                  
                  {/* Load More */}
                  <button
                    onClick={handleRefresh}
                    className="w-full py-3 text-center text-sm text-delta font-medium"
                  >
                    Load More Bills
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}