'use client';

import { useState } from 'react';
import { 
  Clock, 
  ChevronRight,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Globe,
  MapPin
} from 'lucide-react';
import { Bill } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MobileBillCardProps {
  bill: Bill;
  onVote?: (billId: string, vote: 'like' | 'dislike' | null) => Promise<void>;
  onClick?: (bill: Bill) => void;
}

export default function MobileBillCard({ bill, onVote, onClick }: MobileBillCardProps) {
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(bill.userVote || null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (vote: 'like' | 'dislike') => {
    if (isVoting) return;
    
    setIsVoting(true);
    const newVote = userVote === vote ? null : vote;
    setUserVote(newVote);
    
    try {
      await onVote?.(bill.id, newVote);
    } catch (error) {
      // Revert on error
      setUserVote(userVote);
    } finally {
      setIsVoting(false);
    }
  };

  const getUrgencyIndicator = () => {
    if (!bill.lastActionDate) return null;
    const daysSince = Math.floor((Date.now() - new Date(bill.lastActionDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 7) return { text: 'Active', color: 'bg-red-500' };
    if (daysSince < 30) return { text: 'Recent', color: 'bg-orange-500' };
    return null;
  };

  const getStatusColor = (stage: string) => {
    const colors: Record<string, string> = {
      proposed: 'text-blue-600',
      committee: 'text-yellow-600',
      floor: 'text-orange-600',
      passed: 'text-green-600',
      enacted: 'text-purple-600',
    };
    return colors[stage.toLowerCase()] || 'text-gray-600';
  };

  const urgency = getUrgencyIndicator();
  const isLocal = bill.billNumber.toLowerCase().includes('local');
  const isState = bill.billNumber.toLowerCase().includes('state');
  const LevelIcon = isLocal || isState ? MapPin : Globe;

  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-200 overflow-hidden",
        "active:scale-[0.98] transition-transform duration-150",
        urgency && "border-l-4 border-l-red-500"
      )}
      onClick={() => onClick?.(bill)}
    >
      {/* Compact Header */}
      <div className="p-3">
        {/* Status Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs">
            <LevelIcon size={12} className="text-gray-500" />
            <span className="font-medium text-gray-600">{bill.billNumber}</span>
            <span className={cn("font-semibold", getStatusColor(bill.status.stage))}>
              {bill.status.stage}
            </span>
          </div>
          {urgency && (
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", urgency.color)} />
              <span className="text-xs text-gray-600">{urgency.text}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
          {bill.title}
        </h3>

        {/* Summary - 2 lines max */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {bill.aiSummary?.simpleSummary || bill.summary}
        </p>

        {/* Topics - Horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {bill.subjects.slice(0, 5).map((subject) => (
            <span
              key={subject}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap flex-shrink-0"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={12} />
          <span>{bill.lastActionDate ? formatDate(bill.lastActionDate).split(' ')[0] : 'No date'}</span>
        </div>

        {/* Vote Buttons */}
        <div 
          className="flex items-center gap-2 like-dislike-container" 
          onClick={(e) => e.stopPropagation()}
          data-tour="vote-buttons"
        >
          <button
            onClick={() => handleVote('like')}
            disabled={isVoting}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all",
              "min-w-[60px] min-h-[32px]", // Touch target
              userVote === 'like' 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-600 active:scale-95"
            )}
            aria-label="Like this bill"
          >
            <ThumbsUp size={14} />
            <span className="text-xs font-medium">23</span>
          </button>
          
          <button
            onClick={() => handleVote('dislike')}
            disabled={isVoting}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all",
              "min-w-[60px] min-h-[32px]", // Touch target
              userVote === 'dislike' 
                ? "bg-red-100 text-red-700" 
                : "bg-gray-100 text-gray-600 active:scale-95"
            )}
            aria-label="Dislike this bill"
          >
            <ThumbsDown size={14} />
            <span className="text-xs font-medium">8</span>
          </button>

          <button
            className="p-2 text-gray-400 min-w-[32px] min-h-[32px]"
            aria-label="View details"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}