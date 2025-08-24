'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ThumbsUp, ThumbsDown, Phone, Share2, Calendar, Filter, TrendingUp } from 'lucide-react';
import { voteManager } from '@/services/voteManager';
import { api } from '@/services/api';
import { Bill } from '@/types';
import EngagementDashboard from '@/components/engagement/EngagementDashboard';
import { cn } from '@/lib/utils';

interface VoteWithBill {
  billId: string;
  vote: 'support' | 'oppose';
  timestamp: string;
  hasContacted: boolean;
  hasShared: boolean;
  bill?: Bill;
}

export default function MyVotesPage() {
  const router = useRouter();
  const [votes, setVotes] = useState<VoteWithBill[]>([]);
  const [filteredVotes, setFilteredVotes] = useState<VoteWithBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'support' | 'oppose' | 'contacted'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  useEffect(() => {
    loadVotes();
  }, []);

  useEffect(() => {
    filterAndSortVotes();
  }, [votes, filter, sortBy]);

  const loadVotes = async () => {
    setLoading(true);
    try {
      const userVotes = voteManager.getAllVotes();
      
      // Fetch bill details for each vote
      const votesWithBills: VoteWithBill[] = await Promise.all(
        userVotes
          .filter(vote => vote.vote !== null)
          .map(async (vote) => {
            try {
              const bill = await api.bills.getById(vote.billId);
              return { 
                billId: vote.billId,
                vote: vote.vote as 'support' | 'oppose',
                timestamp: vote.timestamp,
                hasContacted: vote.hasContacted,
                hasShared: vote.hasShared,
                bill 
              };
            } catch (error) {
              console.error(`Failed to load bill ${vote.billId}:`, error);
              return {
                billId: vote.billId,
                vote: vote.vote as 'support' | 'oppose',
                timestamp: vote.timestamp,
                hasContacted: vote.hasContacted,
                hasShared: vote.hasShared
              };
            }
          })
      );
      
      setVotes(votesWithBills);
    } catch (error) {
      console.error('Failed to load votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVotes = () => {
    let filtered = [...votes];
    
    // Apply filter
    switch (filter) {
      case 'support':
        filtered = filtered.filter(v => v.vote === 'support');
        break;
      case 'oppose':
        filtered = filtered.filter(v => v.vote === 'oppose');
        break;
      case 'contacted':
        filtered = filtered.filter(v => v.hasContacted);
        break;
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredVotes(filtered);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleBillClick = (billId: string) => {
    router.push(`/bill/${billId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-lg font-semibold">My Voting History</h1>
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
          <TrendingUp size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{votes.length}</span>
        </div>
      </header>

      {/* Engagement Dashboard */}
      <div className="px-4 pt-4">
        <EngagementDashboard />
      </div>

      {/* Filters */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex gap-2">
          {(['all', 'support', 'oppose', 'contacted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize",
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
              )}
            >
              {f === 'contacted' ? 'Contacted Rep' : f}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredVotes.length} of {votes.length} votes
          </span>
          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'oldest' : 'recent')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {sortBy === 'recent' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Votes List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : filteredVotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ThumbsUp size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 font-medium mb-2">
              {filter === 'all' 
                ? "You haven't voted on any bills yet"
                : `No ${filter} votes found`}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Start by voting on bills in your feed to make your voice heard
            </p>
            <button
              onClick={() => router.push('/feed')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Bills
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVotes.map((vote) => (
              <div
                key={vote.billId}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBillClick(vote.billId)}
              >
                {/* Vote Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded",
                        vote.vote === 'support' 
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      )}>
                        {vote.vote === 'support' ? (
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} /> Support
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ThumbsDown size={12} /> Oppose
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(vote.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bill Info */}
                {vote.bill ? (
                  <>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {vote.bill.billNumber}: {vote.bill.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {vote.bill.summary}
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Bill ID: {vote.billId}
                  </div>
                )}

                {/* Action Status */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    vote.hasContacted ? "text-green-600" : "text-gray-400"
                  )}>
                    <Phone size={14} />
                    {vote.hasContacted ? 'Contacted Rep' : 'Not Contacted'}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    vote.hasShared ? "text-blue-600" : "text-gray-400"
                  )}>
                    <Share2 size={14} />
                    {vote.hasShared ? 'Shared' : 'Not Shared'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}