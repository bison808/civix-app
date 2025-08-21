'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

interface LikeDislikeProps {
  billId: string;
  initialLikes?: number;
  initialDislikes?: number;
  userVote?: 'like' | 'dislike' | null;
  onVote?: (billId: string, vote: 'like' | 'dislike' | null) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showCounts?: boolean;
  animated?: boolean;
}

export default function LikeDislike({
  billId,
  initialLikes = 0,
  initialDislikes = 0,
  userVote = null,
  onVote,
  size = 'md',
  showCounts = true,
  animated = true,
}: LikeDislikeProps) {
  const [vote, setVote] = useState<'like' | 'dislike' | null>(userVote);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    sm: { icon: 16, text: 'text-sm', padding: 'px-3 py-1.5' },
    md: { icon: 20, text: 'text-base', padding: 'px-4 py-2' },
    lg: { icon: 24, text: 'text-lg', padding: 'px-5 py-2.5' },
  };

  const handleVote = async (newVote: 'like' | 'dislike') => {
    if (isAnimating) return;

    const previousVote = vote;
    let updatedVote: 'like' | 'dislike' | null = newVote;

    // Toggle off if clicking the same vote
    if (vote === newVote) {
      updatedVote = null;
    }

    // Update counts
    if (previousVote === 'like') setLikes(prev => prev - 1);
    if (previousVote === 'dislike') setDislikes(prev => prev - 1);
    if (updatedVote === 'like') setLikes(prev => prev + 1);
    if (updatedVote === 'dislike') setDislikes(prev => prev + 1);

    setVote(updatedVote);

    if (animated) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Call the onVote callback
    if (onVote) {
      try {
        await onVote(billId, updatedVote);
      } catch (error) {
        // Revert on error
        setVote(previousVote);
        if (previousVote === 'like') setLikes(prev => prev + 1);
        if (previousVote === 'dislike') setDislikes(prev => prev + 1);
        if (updatedVote === 'like') setLikes(prev => prev - 1);
        if (updatedVote === 'dislike') setDislikes(prev => prev - 1);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('like')}
        className={cn(
          'flex items-center gap-2 rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          sizes[size].padding,
          vote === 'like'
            ? 'bg-positive text-white hover:bg-positive/90 focus:ring-positive'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-positive focus:ring-gray-300',
          isAnimating && vote === 'like' && 'animate-pulse-once scale-110'
        )}
        aria-label={`Like this bill${showCounts ? ` (${formatNumber(likes)} likes)` : ''}`}
        aria-pressed={vote === 'like'}
      >
        <ThumbsUp size={sizes[size].icon} />
        {showCounts && (
          <span className={cn('font-medium', sizes[size].text)}>
            {formatNumber(likes)}
          </span>
        )}
      </button>

      <button
        onClick={() => handleVote('dislike')}
        className={cn(
          'flex items-center gap-2 rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          sizes[size].padding,
          vote === 'dislike'
            ? 'bg-negative text-white hover:bg-negative/90 focus:ring-negative'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-negative focus:ring-gray-300',
          isAnimating && vote === 'dislike' && 'animate-pulse-once scale-110'
        )}
        aria-label={`Dislike this bill${showCounts ? ` (${formatNumber(dislikes)} dislikes)` : ''}`}
        aria-pressed={vote === 'dislike'}
      >
        <ThumbsDown size={sizes[size].icon} />
        {showCounts && (
          <span className={cn('font-medium', sizes[size].text)}>
            {formatNumber(dislikes)}
          </span>
        )}
      </button>
    </div>
  );
}