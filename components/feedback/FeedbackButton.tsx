'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import LikeDislike from './LikeDislike';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps {
  billId: string;
  initialLikes?: number;
  initialDislikes?: number;
  userVote?: 'like' | 'dislike' | null;
  onFeedback?: (billId: string, vote: 'like' | 'dislike' | null, comment?: string) => Promise<void>;
  showComment?: boolean;
  className?: string;
}

export default function FeedbackButton({
  billId,
  initialLikes = 0,
  initialDislikes = 0,
  userVote = null,
  onFeedback,
  showComment = true,
  className,
}: FeedbackButtonProps) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [currentVote, setCurrentVote] = useState<'like' | 'dislike' | null>(userVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (voteBillId: string, vote: 'like' | 'dislike' | null) => {
    setCurrentVote(vote);
    if (onFeedback && !showComment) {
      await onFeedback(voteBillId, vote);
    }
  };

  const handleSubmitWithComment = async () => {
    if (!onFeedback || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onFeedback(billId, currentVote, comment.trim() || undefined);
      setShowCommentBox(false);
      setComment('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-4">
        <LikeDislike
          billId={billId}
          initialLikes={initialLikes}
          initialDislikes={initialDislikes}
          userVote={currentVote}
          onVote={handleVote}
          showCounts={true}
        />
        
        {showComment && (
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300',
              showCommentBox && 'bg-gray-100'
            )}
            aria-label="Add comment"
            aria-expanded={showCommentBox}
          >
            {showCommentBox ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <MessageSquare size={20} className="text-gray-600" />
            )}
          </button>
        )}
      </div>

      {showCommentBox && (
        <div className={cn(
          'absolute top-full mt-2 left-0 right-0 z-10',
          'bg-white border border-gray-200 rounded-lg shadow-lg p-4',
          'animate-slide-up'
        )}>
          <label htmlFor={`comment-${billId}`} className="block text-sm font-medium text-gray-700 mb-2">
            Tell us why (optional)
          </label>
          <textarea
            id={`comment-${billId}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-delta focus:border-delta',
              'resize-none'
            )}
            rows={3}
            placeholder="Share your thoughts..."
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {comment.length}/500
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommentBox(false);
                  setComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitWithComment}
                disabled={!currentVote || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}