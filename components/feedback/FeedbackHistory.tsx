import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar, TrendingUp, Users, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  message: string;
  timestamp: string;
  upvotes: number;
  isAnonymous: boolean;
  tags: string[];
}

interface FeedbackHistoryProps {
  representativeId?: string;
  billId?: string;
  userId?: string;
  limit?: number;
  showFilters?: boolean;
}

export default function FeedbackHistory({
  representativeId,
  billId,
  userId,
  limit = 10,
  showFilters = false
}: FeedbackHistoryProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadFeedbackHistory();
  }, [representativeId, billId, userId, filter, timeFilter]);

  const loadFeedbackHistory = async () => {
    setLoading(true);
    // Mock data - would fetch from API
    const mockFeedback: FeedbackItem[] = [
      {
        id: '1',
        sentiment: 'positive',
        category: 'Responsiveness',
        message: 'Very responsive to constituent concerns. Got a detailed reply within 2 days.',
        timestamp: '2024-01-15T10:30:00Z',
        upvotes: 24,
        isAnonymous: true,
        tags: ['responsive', 'accessible']
      },
      {
        id: '2',
        sentiment: 'negative',
        category: 'Voting Record',
        message: 'Disappointed with the vote on HB-891. Does not align with community needs.',
        timestamp: '2024-01-14T15:45:00Z',
        upvotes: 18,
        isAnonymous: true,
        tags: ['voting-record', 'misaligned']
      },
      {
        id: '3',
        sentiment: 'positive',
        category: 'Community Engagement',
        message: 'Attended the town hall last week. Great to see active engagement with constituents.',
        timestamp: '2024-01-13T09:20:00Z',
        upvotes: 42,
        isAnonymous: false,
        tags: ['engagement', 'transparent']
      },
      {
        id: '4',
        sentiment: 'neutral',
        category: 'Policy Positions',
        message: 'Would like more clarity on environmental policy positions.',
        timestamp: '2024-01-12T14:00:00Z',
        upvotes: 15,
        isAnonymous: true,
        tags: ['environment', 'more-info-needed']
      },
      {
        id: '5',
        sentiment: 'positive',
        category: 'Communication',
        message: 'Regular newsletter updates are very informative. Appreciate the transparency.',
        timestamp: '2024-01-11T11:30:00Z',
        upvotes: 31,
        isAnonymous: true,
        tags: ['communication', 'transparent']
      }
    ];

    // Apply filters
    let filtered = mockFeedback;
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.sentiment === filter);
    }

    setFeedbackItems(filtered.slice(0, limit));
    setLoading(false);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return <ThumbsUp className="text-green-600" size={16} />;
      case 'negative': return <ThumbsDown className="text-red-600" size={16} />;
      case 'neutral': return <MessageSquare className="text-blue-600" size={16} />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'negative': return 'bg-red-50 border-red-200';
      case 'neutral': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  // Calculate sentiment summary
  const sentimentSummary = {
    positive: feedbackItems.filter(i => i.sentiment === 'positive').length,
    negative: feedbackItems.filter(i => i.sentiment === 'negative').length,
    neutral: feedbackItems.filter(i => i.sentiment === 'neutral').length,
    total: feedbackItems.length
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                filter === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              All ({sentimentSummary.total})
            </button>
            <button
              onClick={() => setFilter('positive')}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                filter === 'positive' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              )}
            >
              <ThumbsUp size={14} className="inline mr-1" />
              {sentimentSummary.positive}
            </button>
            <button
              onClick={() => setFilter('negative')}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                filter === 'negative' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              )}
            >
              <ThumbsDown size={14} className="inline mr-1" />
              {sentimentSummary.negative}
            </button>
            <button
              onClick={() => setFilter('neutral')}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                filter === 'neutral' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              )}
            >
              <MessageSquare size={14} className="inline mr-1" />
              {sentimentSummary.neutral}
            </button>
          </div>
          
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
      )}

      {/* Feedback Items */}
      <div className="space-y-3">
        {feedbackItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feedback found for the selected filters
          </div>
        ) : (
          feedbackItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'p-4 rounded-lg border transition-all hover:shadow-md',
                getSentimentColor(item.sentiment)
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(item.sentiment)}
                  <span className="text-sm font-medium text-gray-700">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors">
                    <TrendingUp size={14} />
                    {item.upvotes}
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{item.message}</p>
              
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white/50 text-xs rounded-full text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {feedbackItems.length >= limit && (
        <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
          Load More Feedback
        </button>
      )}
    </div>
  );
}