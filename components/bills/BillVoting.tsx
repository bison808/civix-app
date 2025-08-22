'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Users, TrendingUp, Share2, Phone } from 'lucide-react';
import { voteManager } from '@/services/voteManager';
import { cn } from '@/lib/utils';

interface BillVotingProps {
  billId: string;
  billTitle: string;
  onContactRep?: () => void;
  onShare?: () => void;
  className?: string;
}

export default function BillVoting({ 
  billId, 
  billTitle,
  onContactRep,
  onShare,
  className 
}: BillVotingProps) {
  const [userVote, setUserVote] = useState<'support' | 'oppose' | null>(null);
  const [stats, setStats] = useState({
    totalVotes: 0,
    supportPercentage: 0,
    opposePercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadVoteData();
  }, [billId]);

  const loadVoteData = async () => {
    const vote = voteManager.getVote(billId);
    if (vote) {
      setUserVote(vote.vote);
    }

    const voteStats = await voteManager.getVoteStats(billId);
    setStats({
      totalVotes: voteStats.totalVotes,
      supportPercentage: voteStats.supportPercentage,
      opposePercentage: voteStats.opposePercentage
    });
  };

  const handleVote = async (vote: 'support' | 'oppose') => {
    setLoading(true);
    
    // Toggle vote if clicking the same option
    const newVote = userVote === vote ? null : vote;
    setUserVote(newVote);
    
    // Record the vote
    voteManager.recordVote(billId, newVote);
    
    // Update stats (simulate immediate feedback)
    if (newVote) {
      setStats(prev => ({
        ...prev,
        totalVotes: userVote ? prev.totalVotes : prev.totalVotes + 1
      }));
    }
    
    // Show feedback
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
    
    setLoading(false);
  };

  const handleContactRep = () => {
    voteManager.markContacted(billId);
    if (onContactRep) onContactRep();
  };

  const handleShare = () => {
    voteManager.markShared(billId);
    if (onShare) onShare();
  };

  const undecidedPercentage = Math.max(0, 100 - stats.supportPercentage - stats.opposePercentage);

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4 space-y-4", className)}>
      {/* Vote Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleVote('support')}
          disabled={loading}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all",
            "border-2",
            userVote === 'support' 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400"
          )}
        >
          <ThumbsUp className="w-5 h-5" />
          <span className="font-medium">Support</span>
        </button>

        <button
          onClick={() => handleVote('oppose')}
          disabled={loading}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all",
            "border-2",
            userVote === 'oppose' 
              ? "bg-red-50 border-red-500 text-red-700" 
              : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400"
          )}
        >
          <ThumbsDown className="w-5 h-5" />
          <span className="font-medium">Oppose</span>
        </button>
      </div>

      {/* Community Sentiment */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Community Sentiment
          </span>
          <span>{stats.totalVotes.toLocaleString()} votes</span>
        </div>

        {/* Sentiment Bar */}
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            {stats.supportPercentage > 0 && (
              <div 
                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                style={{ width: `${stats.supportPercentage}%` }}
              >
                {stats.supportPercentage >= 10 && `${stats.supportPercentage}%`}
              </div>
            )}
            {undecidedPercentage > 0 && (
              <div 
                className="bg-gray-300 flex items-center justify-center text-gray-600 text-xs"
                style={{ width: `${undecidedPercentage}%` }}
              >
                {undecidedPercentage >= 10 && `${undecidedPercentage}%`}
              </div>
            )}
            {stats.opposePercentage > 0 && (
              <div 
                className="bg-red-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                style={{ width: `${stats.opposePercentage}%` }}
              >
                {stats.opposePercentage >= 10 && `${stats.opposePercentage}%`}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Support
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
            Undecided
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            Oppose
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {userVote && (
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleContactRep}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            Contact Rep
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      )}

      {/* Feedback Message */}
      {showFeedback && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm animate-fadeIn">
          {userVote ? 'Vote recorded!' : 'Vote removed'}
        </div>
      )}
    </div>
  );
}