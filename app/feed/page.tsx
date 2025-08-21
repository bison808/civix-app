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
import { useAuth } from '@/contexts/AuthContext';
import { Bill } from '@/types';
import { api } from '@/services/api';

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

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
        {/* Header */}
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

      {/* Feed */}
      <div className="flex-1 overflow-auto">
        <BillFeed
          bills={bills}
          loading={loading}
          onVote={handleVote}
          onBillClick={handleBillClick}
          onRefresh={loadBills}
          hasMore={false}
        />
      </div>

      {/* Bottom Navigation */}
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
      </div>
    </ProtectedRoute>
  );
}