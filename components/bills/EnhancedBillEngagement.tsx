'use client';

import { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Heart,
  HeartOff,
  Users, 
  Share2, 
  Phone,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Bill, UserBillVote, UserBillFollow } from '@/types';
import { engagementService } from '@/services/engagementService';
import { cn } from '@/lib/utils';
import Card from '@/components/core/Card';

interface EnhancedBillEngagementProps {
  bill: Bill;
  userId: string;
  onContactRep?: () => void;
  onShare?: () => void;
  showCommunityStats?: boolean;
  compact?: boolean;
  className?: string;
}

export default function EnhancedBillEngagement({ 
  bill, 
  userId,
  onContactRep,
  onShare,
  showCommunityStats = true,
  compact = false,
  className 
}: EnhancedBillEngagementProps) {
  // State management
  const [userVote, setUserVote] = useState<UserBillVote | null>(null);
  const [userFollow, setUserFollow] = useState<UserBillFollow | null>(null);
  const [communityStats, setCommunityStats] = useState({
    totalVotes: 0,
    supportPercentage: 0,
    opposePercentage: 0,
    neutralPercentage: 0,
    totalFollowing: 0
  });
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadEngagementData();
  }, [bill.id, userId]);

  const loadEngagementData = async () => {
    try {
      // Load user's current vote
      const vote = await engagementService.getUserBillVote(userId, bill.id);
      setUserVote(vote);

      // Load user's follow status
      const follows = await engagementService.getFollowedBills(userId);
      const follow = follows.find(f => f.billId === bill.id);
      setUserFollow(follow || null);

      // Load community stats (mock for now)
      setCommunityStats({
        totalVotes: Math.floor(Math.random() * 1000) + 100,
        supportPercentage: Math.floor(Math.random() * 40) + 30,
        opposePercentage: Math.floor(Math.random() * 30) + 20,
        neutralPercentage: Math.floor(Math.random() * 20) + 10,
        totalFollowing: Math.floor(Math.random() * 200) + 50
      });
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    }
  };

  const handleVote = async (position: 'support' | 'oppose' | 'neutral') => {
    setLoading(true);
    
    try {
      // Toggle vote if clicking the same position
      const newPosition = userVote?.position === position ? null : position;
      
      if (newPosition) {
        const vote = await engagementService.recordBillVote(userId, bill.id, newPosition, {
          confidence: 'medium',
          isPublic: true
        });
        setUserVote(vote);
        setShowFeedback(`Vote recorded: ${newPosition}`);
      } else {
        // Remove vote
        await engagementService.updateBillVote(userId, bill.id, null);
        setUserVote(null);
        setShowFeedback('Vote removed');
      }

      // Update community stats optimistically
      setCommunityStats(prev => ({
        ...prev,
        totalVotes: newPosition && !userVote ? prev.totalVotes + 1 : 
                   !newPosition && userVote ? Math.max(0, prev.totalVotes - 1) : prev.totalVotes
      }));

    } catch (error) {
      console.error('Failed to record vote:', error);
      setShowFeedback('Failed to record vote');
    } finally {
      setLoading(false);
      setTimeout(() => setShowFeedback(''), 3000);
    }
  };

  const handleFollow = async () => {
    setLoading(true);
    
    try {
      if (userFollow) {
        // Unfollow
        await engagementService.unfollowBill(userId, bill.id);
        setUserFollow(null);
        setShowFeedback('Unfollowed bill');
        setCommunityStats(prev => ({
          ...prev,
          totalFollowing: Math.max(0, prev.totalFollowing - 1)
        }));
      } else {
        // Follow
        const follow = await engagementService.followBill(userId, bill.id, 'watching');
        setUserFollow(follow);
        setShowFeedback('Following bill updates');
        setCommunityStats(prev => ({
          ...prev,
          totalFollowing: prev.totalFollowing + 1
        }));
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      setShowFeedback('Failed to update follow status');
    } finally {
      setLoading(false);
      setTimeout(() => setShowFeedback(''), 3000);
    }
  };

  const handleContactRep = async () => {
    if (onContactRep) {
      onContactRep();
      
      // Record interaction
      if (userVote) {
        try {
          await engagementService.recordRepresentativeInteraction(
            userId,
            'user-rep-id', // Would be actual rep ID
            'contacted',
            {
              method: 'email',
              billId: bill.id,
              subject: `Regarding ${bill.billNumber}: ${bill.title}`,
              notes: `User contacted representative about their ${userVote.position} position on this bill`
            }
          );
        } catch (error) {
          console.error('Failed to record interaction:', error);
        }
      }
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
    }
    
    // Mark as shared in user's vote record
    if (userVote) {
      // Update the vote to mark as shared
      // This would be handled by the service
      setShowFeedback('Bill shared!');
      setTimeout(() => setShowFeedback(''), 2000);
    }
  };

  // Compact version for bill cards
  if (compact) {
    return (
      <div className={cn("flex items-center justify-between gap-3", className)}>
        {/* Vote buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => handleVote('support')}
            disabled={loading}
            className={cn(
              "p-2 rounded-lg border transition-all",
              userVote?.position === 'support' 
                ? "bg-green-50 border-green-500 text-green-700" 
                : "border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-400"
            )}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleVote('oppose')}
            disabled={loading}
            className={cn(
              "p-2 rounded-lg border transition-all",
              userVote?.position === 'oppose' 
                ? "bg-red-50 border-red-500 text-red-700" 
                : "border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-400"
            )}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>

        {/* Follow button */}
        <button
          onClick={handleFollow}
          disabled={loading}
          className={cn(
            "p-2 rounded-lg border transition-all",
            userFollow 
              ? "bg-purple-50 border-purple-500 text-purple-700" 
              : "border-gray-300 text-gray-600 hover:bg-purple-50 hover:border-purple-400"
          )}
        >
          {userFollow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Community stats (mini) */}
        {showCommunityStats && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{communityStats.totalVotes}</span>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
            {showFeedback}
          </div>
        )}
      </div>
    );
  }

  // Full engagement component
  return (
    <Card variant="default" padding="md" className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Your Position</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {userFollow && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
              <Eye className="w-3 h-3" />
              <span>Following</span>
            </div>
          )}
          {userVote && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Voted {new Date(userVote.timestamp).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Voting Section */}
      <div className="space-y-3">
        {/* Vote Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleVote('support')}
            disabled={loading}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all border-2",
              userVote?.position === 'support' 
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
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all border-2",
              userVote?.position === 'oppose' 
                ? "bg-red-50 border-red-500 text-red-700" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400"
            )}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="font-medium">Oppose</span>
          </button>

          <button
            onClick={() => handleVote('neutral')}
            disabled={loading}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all border-2",
              userVote?.position === 'neutral' 
                ? "bg-gray-50 border-gray-500 text-gray-700" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            )}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Neutral</span>
          </button>
        </div>

        {/* Vote confidence (if voted) */}
        {userVote && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Confidence: {userVote.confidence}</span>
            {userVote.reason && (
              <span className="italic">"{userVote.reason}"</span>
            )}
          </div>
        )}
      </div>

      {/* Community Sentiment */}
      {showCommunityStats && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              Community Sentiment
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{communityStats.totalVotes.toLocaleString()} votes</span>
              <span>{communityStats.totalFollowing} following</span>
            </div>
          </div>

          {/* Sentiment Bar */}
          <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              {communityStats.supportPercentage > 0 && (
                <div 
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${communityStats.supportPercentage}%` }}
                >
                  {communityStats.supportPercentage >= 15 && `${communityStats.supportPercentage}%`}
                </div>
              )}
              {communityStats.neutralPercentage > 0 && (
                <div 
                  className="bg-gray-400 flex items-center justify-center text-white text-xs"
                  style={{ width: `${communityStats.neutralPercentage}%` }}
                >
                  {communityStats.neutralPercentage >= 15 && `${communityStats.neutralPercentage}%`}
                </div>
              )}
              {communityStats.opposePercentage > 0 && (
                <div 
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${communityStats.opposePercentage}%` }}
                >
                  {communityStats.opposePercentage >= 15 && `${communityStats.opposePercentage}%`}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Support ({communityStats.supportPercentage}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Neutral ({communityStats.neutralPercentage}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Oppose ({communityStats.opposePercentage}%)
            </span>
          </div>
        </div>
      )}

      {/* Follow and Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        {/* Follow Button */}
        <button
          onClick={handleFollow}
          disabled={loading}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all border",
            userFollow 
              ? "bg-purple-50 border-purple-500 text-purple-700 hover:bg-purple-100" 
              : "bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-400"
          )}
        >
          {userFollow ? (
            <>
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Following</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="text-sm font-medium">Follow Updates</span>
            </>
          )}
        </button>

        {/* Action Buttons (show if user has voted) */}
        {userVote && (
          <>
            <button
              onClick={handleContactRep}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              Contact Rep
            </button>
            
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share Position
            </button>
          </>
        )}
      </div>

      {/* Follow Settings (expanded) */}
      {userFollow && expanded && (
        <div className="bg-purple-50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium text-purple-900">Notification Settings</h4>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs">
              <input 
                type="checkbox" 
                checked={userFollow.notifications.statusUpdates}
                className="rounded"
                onChange={() => {/* Handle notification setting change */}}
              />
              Status updates
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input 
                type="checkbox" 
                checked={userFollow.notifications.voteScheduled}
                className="rounded"
                onChange={() => {/* Handle notification setting change */}}
              />
              Voting scheduled
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input 
                type="checkbox" 
                checked={userFollow.notifications.committeeActions}
                className="rounded"
                onChange={() => {/* Handle notification setting change */}}
              />
              Committee actions
            </label>
          </div>
        </div>
      )}

      {/* Show Settings Toggle */}
      {userFollow && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
        >
          {expanded ? 'Hide Settings' : 'Notification Settings'}
        </button>
      )}

      {/* Feedback Toast */}
      {showFeedback && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up">
          {showFeedback}
        </div>
      )}
    </Card>
  );
}