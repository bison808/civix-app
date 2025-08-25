'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, Filter, TrendingUp, Users, FileText, Vote, Calendar, MapPin, AlertCircle } from 'lucide-react';
import BillFeed from '@/components/bills/BillFeed';
import BillFilter from '@/components/bills/BillFilter';
import { CivixLogo } from '@/components/CivixLogo';
import UserMenu from '@/components/UserMenu';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';
// import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Removed - bills should be publicly accessible
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useBills, useInfiniteBills } from '@/hooks/useBills';
import { useRepresentatives } from '@/hooks/useRepresentatives';
import { Bill, Representative, FilterOptions } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

interface BillWithRepConnection extends Bill {
  connectedReps?: Representative[];
  userEngagementLevel?: 'high' | 'medium' | 'low';
  isTracked?: boolean;
  userFeedback?: any;
}

export function BillsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'tracked' | 'voted'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'engagement'>('relevance');
  
  // Hooks - make them optional to prevent authentication blocking
  const { 
    data: billsData, 
    isLoading: loading, 
    error, 
    refetch: refreshBills 
  } = useBills();
  
  const bills = Array.isArray(billsData) ? billsData : (billsData?.bills || []);
  
  // Make representatives optional for public access - use empty query when not authenticated
  const { 
    data: representativesData 
  } = useRepresentatives();
  
  const representatives = representativesData ? 
    (Array.isArray(representativesData) ? representativesData : (representativesData?.representatives || [])) :
    [];

  // Enhanced bills with representative connections
  const [enhancedBills, setEnhancedBills] = useState<BillWithRepConnection[]>([]);
  const [stats, setStats] = useState({
    totalBills: 0,
    trackedBills: 0,
    votedBills: 0,
    relevantBills: 0,
    upcomingVotes: 0
  });

  // Load and enhance bills with representative connections
  useEffect(() => {
    if (bills.length > 0 && representatives.length > 0) {
      const enhanced = bills.map(bill => ({
        ...bill,
        connectedReps: representatives.filter(rep => 
          // Connect bills to reps based on jurisdiction and committees
          (bill.chamber === 'House' && rep.title === 'Representative') ||
          (bill.chamber === 'Senate' && rep.title === 'Senator') ||
          // State level connections
          (bill.level === 'state' && rep.level === 'state')
        ),
        userEngagementLevel: calculateEngagementLevel(bill)
      }));
      
      setEnhancedBills(enhanced);
      
      // Calculate stats
      setStats({
        totalBills: bills.length,
        trackedBills: bills.filter(b => b.isTracked).length,
        votedBills: bills.filter(b => b.userVote).length,
        relevantBills: enhanced.filter(b => b.connectedReps && b.connectedReps.length > 0).length,
        upcomingVotes: bills.filter(b => b.status.stage === 'Floor Vote').length
      });
    }
  }, [bills, representatives]);

  const calculateEngagementLevel = (bill: any): 'high' | 'medium' | 'low' => {
    let score = 0;
    if (bill.userVote) score += 3;
    if (bill.isTracked) score += 2;
    if (bill.userFeedback) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  };

  const handleVote = async (billId: string, vote: 'like' | 'dislike' | null) => {
    if (!user) {
      router.push('/login?from=/bills');
      return;
    }
    
    try {
      await api.feedback.submitVote(billId, vote || 'like');
      // Update local state
      setEnhancedBills(prev => prev.map(bill => 
        bill.id === billId ? { ...bill, userVote: vote } : bill
      ));
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const handleTrackBill = async (billId: string, track: boolean) => {
    if (!user) {
      router.push('/login?from=/bills');
      return;
    }
    
    try {
      // API call to track/untrack bill
      // await api.bills.track(billId, track);
      
      setEnhancedBills(prev => prev.map(bill => 
        bill.id === billId ? { ...bill, isTracked: track } : bill
      ));
    } catch (error) {
      console.error('Failed to track bill:', error);
    }
  };

  const handleBillClick = (bill: Bill) => {
    router.push(`/bill/${bill.id}`);
  };

  const filteredAndSortedBills = enhancedBills.filter(bill => {
    // Apply view filter
    switch (activeView) {
      case 'tracked':
        return bill.isTracked;
      case 'voted':
        return bill.userVote;
      default:
        return true;
    }
  }).filter(bill => {
    // Apply search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bill.title.toLowerCase().includes(query) ||
      bill.billNumber.toLowerCase().includes(query) ||
      bill.subjects.some(subject => subject.toLowerCase().includes(query)) ||
      (bill.aiSummary?.simpleSummary || bill.summary).toLowerCase().includes(query)
    );
  });

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color,
    description,
    onClick 
  }: {
    icon: any;
    title: string;
    value: number;
    color: string;
    description?: string;
    onClick?: () => void;
  }) => (
    <Card 
      variant="default" 
      padding="sm" 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:scale-105"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  const ViewToggle = () => (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
      <button
        onClick={() => setActiveView('all')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1',
          activeView === 'all' 
            ? 'bg-white text-delta shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        All Bills ({stats.totalBills})
      </button>
      <button
        onClick={() => setActiveView('tracked')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1',
          activeView === 'tracked' 
            ? 'bg-white text-delta shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        Tracked ({stats.trackedBills})
      </button>
      <button
        onClick={() => setActiveView('voted')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1',
          activeView === 'voted' 
            ? 'bg-white text-delta shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        Voted ({stats.votedBills})
      </button>
    </div>
  );

  const RepresentativeConnectionPanel = () => (
    <Card variant="default" padding="md" className="mb-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Users size={20} />
        Your Representatives on Bills
      </h3>
      
      {representatives.slice(0, 3).map(rep => {
        const relevantBills = enhancedBills.filter(bill => 
          bill.connectedReps?.some(r => r.id === rep.id)
        ).length;
        
        return (
          <div key={rep.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-delta/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-delta">
                  {rep.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{rep.name}</p>
                <p className="text-xs text-gray-500">{rep.title} • {rep.party}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-delta">{relevantBills}</p>
              <p className="text-xs text-gray-500">bills</p>
            </div>
          </div>
        );
      })}
      
      <Button 
        variant="outline" 
        size="sm" 
        fullWidth 
        className="mt-3"
        onClick={() => router.push('/representatives')}
      >
        View All Representatives
      </Button>
    </Card>
  );

  return (
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
                {stats.upcomingVotes > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <UserMenu />
            </div>
          </header>
        )}

        {/* Main Content */}
        <div className={isMobile ? "flex-1 overflow-auto pt-14 pb-16" : "flex-1 overflow-auto"}>
          <div className="px-4 py-4">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Legislative Bills
              </h1>
              <p className="text-gray-600">
                Track bills from your representatives and stay informed about legislation that matters to you.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatCard
                icon={FileText}
                title="Total Bills"
                value={stats.totalBills}
                color="bg-blue-500"
                onClick={() => setActiveView('all')}
              />
              <StatCard
                icon={TrendingUp}
                title="Tracked"
                value={stats.trackedBills}
                color="bg-green-500"
                onClick={() => setActiveView('tracked')}
              />
              <StatCard
                icon={Vote}
                title="Voted"
                value={stats.votedBills}
                color="bg-purple-500"
                onClick={() => setActiveView('voted')}
              />
              <StatCard
                icon={Users}
                title="From Your Reps"
                value={stats.relevantBills}
                color="bg-orange-500"
              />
              <StatCard
                icon={Calendar}
                title="Upcoming Votes"
                value={stats.upcomingVotes}
                color="bg-red-500"
                description="This week"
              />
            </div>

            {/* View Toggle */}
            <ViewToggle />

            {/* Representative Connections */}
            {representatives.length > 0 && <RepresentativeConnectionPanel />}

            {/* Search and Filters */}
            <Card variant="default" padding="sm" className="mb-4">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="search"
                    placeholder="Search bills by title, number, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta focus:border-delta text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-3"
                >
                  <Filter size={20} />
                </Button>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSortBy('relevance')}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
                    sortBy === 'relevance'
                      ? 'bg-delta text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Most Relevant
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
                    sortBy === 'date'
                      ? 'bg-delta text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Recently Updated
                </button>
                <button
                  onClick={() => setSortBy('engagement')}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
                    sortBy === 'engagement'
                      ? 'bg-delta text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Most Engaged
                </button>
              </div>
            </Card>

            {/* Enhanced Bill Feed */}
            {error ? (
              <Card variant="default" padding="md" className="text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Bills
                </h3>
                <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : String(error)}</p>
                <Button onClick={() => refreshBills()}>
                  Try Again
                </Button>
              </Card>
            ) : (
              <BillFeed
                bills={filteredAndSortedBills}
                loading={loading}
                onVote={handleVote}
                onBillClick={handleBillClick}
                onRefresh={refreshBills}
                hasMore={false}
                useEnhancedCards={true}
              />
            )}
          </div>
        </div>
      </div>
  );
}