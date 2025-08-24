'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Calendar, TrendingUp, BarChart3, Filter } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import { Bill } from '@/types';
import { cn } from '@/lib/utils';

interface UserVote {
  billId: string;
  vote: 'like' | 'dislike';
  timestamp: string;
  bill: Bill;
}

interface UserVoteHistoryProps {
  userId?: string;
  className?: string;
}

export default function UserVoteHistory({ userId, className }: UserVoteHistoryProps) {
  const [votes, setVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [voteFilter, setVoteFilter] = useState<'all' | 'like' | 'dislike'>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockVotes: UserVote[] = [
      {
        billId: '1',
        vote: 'like',
        timestamp: '2025-01-20T10:00:00Z',
        bill: {
          id: '1',
          billNumber: 'HR 123',
          title: 'Clean Energy Infrastructure Act',
          summary: 'Invests in renewable energy infrastructure',
          status: { stage: 'Committee', detail: 'Referred to committee', date: '2025-01-15' },
          chamber: 'House',
          introducedDate: '2025-01-10',
          lastActionDate: '2025-01-15',
          lastAction: 'Referred to committee',
          sponsor: { id: '1', name: 'Rep. Smith', party: 'Democrat', state: 'CA' },
          cosponsors: [],
          committees: ['Energy and Commerce'],
          subjects: ['energy', 'environment'],
          legislativeHistory: []
        } as Bill
      },
      {
        billId: '2',
        vote: 'dislike',
        timestamp: '2025-01-18T14:30:00Z',
        bill: {
          id: '2',
          billNumber: 'S 456',
          title: 'Digital Privacy Protection Act',
          summary: 'Strengthens consumer data privacy rights',
          status: { stage: 'House', detail: 'Scheduled for vote', date: '2025-01-20' },
          chamber: 'Senate',
          introducedDate: '2025-01-12',
          lastActionDate: '2025-01-20',
          lastAction: 'Scheduled for vote',
          sponsor: { id: '2', name: 'Sen. Johnson', party: 'Republican', state: 'TX' },
          cosponsors: [],
          committees: ['Judiciary'],
          subjects: ['technology', 'privacy'],
          legislativeHistory: []
        } as Bill
      }
    ];
    
    setVotes(mockVotes);
    setLoading(false);
  }, [userId]);

  const filteredVotes = votes.filter(vote => {
    // Time filter
    const voteDate = new Date(vote.timestamp);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - voteDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (timeFilter === 'week' && daysDiff > 7) return false;
    if (timeFilter === 'month' && daysDiff > 30) return false;
    
    // Vote filter
    if (voteFilter !== 'all' && vote.vote !== voteFilter) return false;
    
    return true;
  });

  const voteStats = {
    total: votes.length,
    likes: votes.filter(v => v.vote === 'like').length,
    dislikes: votes.filter(v => v.vote === 'dislike').length,
    thisWeek: votes.filter(v => {
      const voteDate = new Date(v.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return voteDate >= weekAgo;
    }).length
  };

  if (loading) {
    return (
      <Card variant="default" padding="md" className={className}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 size={20} />
          Your Vote History
        </h3>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{voteStats.total}</p>
          <p className="text-xs text-gray-600">Total Votes</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{voteStats.likes}</p>
          <p className="text-xs text-gray-600">Support</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{voteStats.dislikes}</p>
          <p className="text-xs text-gray-600">Oppose</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{voteStats.thisWeek}</p>
          <p className="text-xs text-gray-600">This Week</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTimeFilter('all')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              timeFilter === 'all' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              timeFilter === 'month' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              timeFilter === 'week' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            This Week
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setVoteFilter('all')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              voteFilter === 'all' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            All Votes
          </button>
          <button
            onClick={() => setVoteFilter('like')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              voteFilter === 'like' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            Support
          </button>
          <button
            onClick={() => setVoteFilter('dislike')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              voteFilter === 'dislike' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            Oppose
          </button>
        </div>
      </div>

      {/* Vote History List */}
      <div className="space-y-3">
        {filteredVotes.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No votes found for the selected filters</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => {
                setTimeFilter('all');
                setVoteFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredVotes.map((vote) => (
            <div key={`${vote.billId}-${vote.timestamp}`} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {vote.bill.billNumber}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      vote.vote === 'like' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}>
                      {vote.vote === 'like' ? (
                        <><ThumbsUp size={12} /> Support</>
                      ) : (
                        <><ThumbsDown size={12} /> Oppose</>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {vote.bill.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {vote.bill.summary}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(vote.timestamp).toLocaleDateString()}
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full",
                      vote.bill.status.stage === 'Law' && "bg-green-100 text-green-700",
                      vote.bill.status.stage === 'Committee' && "bg-blue-100 text-blue-700",
                      vote.bill.status.stage === 'House' && "bg-yellow-100 text-yellow-700"
                    )}>
                      {vote.bill.status.stage}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredVotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Your civic engagement helps shape democracy
          </p>
        </div>
      )}
    </Card>
  );
}