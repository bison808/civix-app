'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, TrendingUp, Vote, Calendar, Search, AlertCircle } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function BillsPageContentSimple() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'tracked' | 'voted'>('all');

  // Placeholder data for basic functionality
  const bills = [
    {
      id: '1',
      billNumber: 'H.R. 1234',
      title: 'Infrastructure Investment and Jobs Act',
      summary: 'A bill to invest in American infrastructure and create jobs.',
      status: { stage: 'Committee Review' },
      chamber: 'House',
      subjects: ['Infrastructure', 'Transportation', 'Jobs'],
      aiSummary: { simpleSummary: 'This bill focuses on improving roads, bridges, and creating employment opportunities.' },
      isTracked: false,
      userVote: null
    },
    {
      id: '2', 
      billNumber: 'S. 5678',
      title: 'Healthcare Accessibility Act',
      summary: 'A bill to improve healthcare access for all Americans.',
      status: { stage: 'Floor Vote' },
      chamber: 'Senate',
      subjects: ['Healthcare', 'Insurance', 'Access'],
      aiSummary: { simpleSummary: 'This bill aims to make healthcare more affordable and accessible.' },
      isTracked: true,
      userVote: 'like'
    }
  ];

  const stats = {
    totalBills: bills.length,
    trackedBills: bills.filter(b => b.isTracked).length,
    votedBills: bills.filter(b => b.userVote).length,
    relevantBills: bills.length,
    upcomingVotes: bills.filter(b => b.status.stage === 'Floor Vote').length
  };

  const filteredBills = bills.filter(bill => {
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
      bill.aiSummary.simpleSummary.toLowerCase().includes(query)
    );
  });

  const handleVote = async (billId: string, vote: 'like' | 'dislike' | null) => {
    if (!user) {
      router.push('/login?from=/bills');
      return;
    }
    
    // Placeholder - would call actual API
    console.log(`Vote ${vote} for bill ${billId}`);
  };

  const handleTrackBill = async (billId: string, track: boolean) => {
    if (!user) {
      router.push('/login?from=/bills');
      return;
    }
    
    // Placeholder - would call actual API
    console.log(`${track ? 'Track' : 'Untrack'} bill ${billId}`);
  };

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
            ? 'bg-white text-blue-600 shadow-sm' 
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
            ? 'bg-white text-blue-600 shadow-sm' 
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
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        Voted ({stats.votedBills})
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Legislative Bills
            </h1>
            <p className="text-gray-600">
              Track bills from Congress and stay informed about legislation that matters to you.
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
              icon={FileText}
              title="Relevant"
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

          {/* Search */}
          <Card variant="default" padding="sm" className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="search"
                  placeholder="Search bills by title, number, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Bills List */}
          <div className="space-y-4">
            {filteredBills.length === 0 ? (
              <Card variant="default" padding="lg" className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bills Found</h3>
                <p className="text-gray-600">
                  {searchQuery || activeView !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No bills are currently available.'
                  }
                </p>
                {(searchQuery || activeView !== 'all') && (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveView('all');
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </Card>
            ) : (
              filteredBills.map((bill) => (
                <Card key={bill.id} variant="default" padding="md" className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {bill.billNumber}
                            </span>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              bill.status.stage === 'Floor Vote' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            )}>
                              {bill.status.stage}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {bill.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-3">
                            {bill.aiSummary?.simpleSummary || bill.summary}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {bill.subjects.map((subject, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              variant={bill.userVote === 'like' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleVote(bill.id, bill.userVote === 'like' ? null : 'like')}
                            >
                              👍 {bill.userVote === 'like' ? 'Liked' : 'Like'}
                            </Button>
                            
                            <Button
                              variant={bill.userVote === 'dislike' ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleVote(bill.id, bill.userVote === 'dislike' ? null : 'dislike')}
                            >
                              👎 {bill.userVote === 'dislike' ? 'Disliked' : 'Dislike'}
                            </Button>
                            
                            <Button
                              variant={bill.isTracked ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handleTrackBill(bill.id, !bill.isTracked)}
                            >
                              {bill.isTracked ? '★ Tracked' : '☆ Track'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* API Notice */}
          <div className="mt-8">
            <Card variant="default" padding="md" className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Development Note</span>
              </div>
              <p className="text-sm text-blue-700">
                This is a simplified view showing sample data. Full bill features with real-time data from Congress will be available when connected to the API.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}