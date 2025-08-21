'use client';

import { Calendar, Users, TrendingUp, ChevronRight } from 'lucide-react';
import Card from '@/components/core/Card';
import LikeDislike from '@/components/feedback/LikeDislike';
import { Bill } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BillCardProps {
  bill: Bill;
  onVote?: (billId: string, vote: 'like' | 'dislike' | null) => Promise<void>;
  onClick?: (bill: Bill) => void;
  compact?: boolean;
}

export default function BillCard({ bill, onVote, onClick, compact = false }: BillCardProps) {
  const getStatusColor = (status: Bill['status']) => {
    const colors = {
      proposed: 'bg-blue-100 text-blue-700',
      committee: 'bg-yellow-100 text-yellow-700',
      floor: 'bg-orange-100 text-orange-700',
      passed: 'bg-green-100 text-green-700',
      enacted: 'bg-purple-100 text-purple-700',
    };
    return (colors as any)[status.stage.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getImpactIcon = () => {
    // Simplified - no impacts data available
    return null;
  };

  return (
    <Card
      variant="default"
      padding={compact ? 'sm' : 'md'}
      className={cn(
        'cursor-pointer hover:shadow-md transition-all duration-200',
        'hover:border-delta/30'
      )}
      onClick={() => onClick?.(bill)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">{bill.billNumber}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(bill.status))}>
                {bill.status.stage}
              </span>
              {getImpactIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {bill.title}
            </h3>
          </div>
          <ChevronRight className="text-gray-400 mt-1" size={20} />
        </div>

        {/* Simplified Summary */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {bill.aiSummary?.simpleSummary || bill.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {bill.subjects.slice(0, 3).map((subject) => (
            <span
              key={subject}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
            >
              {subject}
            </span>
          ))}
          {bill.subjects.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500">
              +{bill.subjects.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {bill.lastActionDate && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Last Action: {formatDate(bill.lastActionDate)}</span>
              </div>
            )}
            {/* Representatives would be loaded separately */}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <LikeDislike
              billId={bill.id}
              initialLikes={0}
              initialDislikes={0}
              userVote={bill.userVote}
              onVote={onVote}
              size="sm"
              showCounts={!compact}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}