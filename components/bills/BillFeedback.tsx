import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark, TrendingUp, Users } from 'lucide-react';
import Button from '@/components/core/Button';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import { cn } from '@/lib/utils';

interface BillFeedbackProps {
  billId: string;
  billTitle: string;
  currentVote?: 'like' | 'dislike' | null;
  likes: number;
  dislikes: number;
  onVote: (vote: 'like' | 'dislike') => void;
  onShare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  showCommunityStats?: boolean;
}

export default function BillFeedback({
  billId,
  billTitle,
  currentVote,
  likes,
  dislikes,
  onVote,
  onShare,
  onSave,
  isSaved = false,
  showCommunityStats = true
}: BillFeedbackProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = likes + dislikes;
  const likePercentage = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 0;
  const dislikePercentage = totalVotes > 0 ? Math.round((dislikes / totalVotes) * 100) : 0;

  const handleVote = async (vote: 'like' | 'dislike') => {
    setIsVoting(true);
    await onVote(vote);
    setIsVoting(false);
    
    // Show feedback form after voting
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    // Handle feedback submission
    console.log('Feedback submitted:', feedbackData);
    setShowFeedbackForm(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Voting Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleVote('like')}
            disabled={isVoting}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium',
              currentVote === 'like'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            )}
          >
            <ThumbsUp size={20} />
            <span>Support</span>
            <span className="font-bold">{likes.toLocaleString()}</span>
          </button>
          
          <button
            onClick={() => handleVote('dislike')}
            disabled={isVoting}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium',
              currentVote === 'dislike'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            )}
          >
            <ThumbsDown size={20} />
            <span>Oppose</span>
            <span className="font-bold">{dislikes.toLocaleString()}</span>
          </button>
        </div>

        {/* Community Sentiment Bar */}
        {showCommunityStats && totalVotes > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users size={14} />
                Community Sentiment
              </span>
              <span>{totalVotes.toLocaleString()} votes</span>
            </div>
            
            <div className="flex h-8 rounded-full overflow-hidden bg-gray-200">
              {likePercentage > 0 && (
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-sm font-medium transition-all"
                  style={{ width: `${likePercentage}%` }}
                >
                  {likePercentage > 10 && `${likePercentage}%`}
                </div>
              )}
              {dislikePercentage > 0 && (
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-sm font-medium transition-all"
                  style={{ width: `${dislikePercentage}%` }}
                >
                  {dislikePercentage > 10 && `${dislikePercentage}%`}
                </div>
              )}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{likePercentage}% Support</span>
              <span>{dislikePercentage}% Oppose</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageSquare size={16} />
            <span>Add Comment</span>
          </button>
          
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                isSaved
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>

        {/* Trending Indicator */}
        {totalVotes > 100 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
            <TrendingUp className="text-purple-600" size={16} />
            <span className="text-sm text-purple-700 font-medium">
              Trending in your district
            </span>
          </div>
        )}
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          targetId={billId}
          targetType="bill"
          targetName={billTitle}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setShowFeedbackForm(false)}
          initialSentiment={currentVote === 'like' ? 'positive' : currentVote === 'dislike' ? 'negative' : 'neutral'}
        />
      )}
    </>
  );
}