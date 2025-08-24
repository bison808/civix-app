'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar,
  Users,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Bill } from '@/types';
import { useBillEngagement } from '@/hooks/useEngagement';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import Card from '@/components/core/Card';
import EnhancedBillEngagement from './EnhancedBillEngagement';

interface BillCardWithEngagementProps {
  bill: Bill;
  priority?: 'high' | 'medium' | 'low';
  showEngagement?: boolean;
  compact?: boolean;
  className?: string;
  onContactRep?: (bill: Bill) => void;
  onShare?: (bill: Bill) => void;
}

export default function BillCardWithEngagement({ 
  bill, 
  priority = 'medium',
  showEngagement = true,
  compact = false,
  className,
  onContactRep,
  onShare
}: BillCardWithEngagementProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  const engagement = useBillEngagement(user?.id || '', bill.id);

  const getStatusInfo = (stage: string) => {
    const statusMap = {
      'Introduced': { color: 'text-blue-600 bg-blue-50', icon: BookOpen, urgency: 'low' },
      'Committee': { color: 'text-yellow-600 bg-yellow-50', icon: Users, urgency: 'medium' },
      'House': { color: 'text-orange-600 bg-orange-50', icon: AlertTriangle, urgency: 'high' },
      'Senate': { color: 'text-orange-600 bg-orange-50', icon: AlertTriangle, urgency: 'high' },
      'Presidential': { color: 'text-purple-600 bg-purple-50', icon: Clock, urgency: 'high' },
      'Law': { color: 'text-green-600 bg-green-50', icon: CheckCircle, urgency: 'completed' },
      'Vetoed': { color: 'text-red-600 bg-red-50', icon: XCircle, urgency: 'completed' },
      'Failed': { color: 'text-gray-600 bg-gray-50', icon: XCircle, urgency: 'completed' }
    };
    
    return statusMap[stage as keyof typeof statusMap] || statusMap.Introduced;
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  const statusInfo = getStatusInfo(bill.status.stage);
  const StatusIcon = statusInfo.icon;

  const handleContactRep = () => {
    if (onContactRep) {
      onContactRep(bill);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(bill);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Compact version for lists
  if (compact) {
    return (
      <Card 
        variant="default" 
        padding="sm" 
        className={cn(
          'cursor-pointer hover:shadow-md transition-all duration-200',
          getPriorityBorder(priority),
          className
        )}
        onClick={() => router.push(`/bill/${bill.id}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-gray-600">{bill.billNumber}</span>
              <div className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1', statusInfo.color)}>
                <StatusIcon className="w-3 h-3" />
                {bill.status.stage}
              </div>
            </div>
            
            <h3 className="font-semibold text-sm leading-tight mb-1">
              {truncateText(bill.title, 80)}
            </h3>
            
            <p className="text-xs text-gray-600 mb-2">
              {truncateText(bill.summary, 120)}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(bill.lastActionDate)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {bill.sponsor.name}
              </div>
            </div>
          </div>

          {/* Engagement Actions */}
          {showEngagement && user && (
            <div className="flex flex-col items-end gap-2">
              <EnhancedBillEngagement
                bill={bill}
                userId={user.id}
                compact={true}
                showCommunityStats={false}
                onContactRep={handleContactRep}
                onShare={handleShare}
              />
              
              {/* Engagement indicators */}
              <div className="flex items-center gap-1 text-xs">
                {engagement.userVote && (
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    engagement.userVote.position === 'support' ? 'bg-green-500' :
                    engagement.userVote.position === 'oppose' ? 'bg-red-500' : 'bg-gray-500'
                  )} />
                )}
                {engagement.isFollowing && (
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Full card version
  return (
    <Card 
      variant="default" 
      padding="md" 
      className={cn(
        'transition-all duration-200 hover:shadow-lg',
        getPriorityBorder(priority),
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {bill.billNumber}
            </span>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2',
              statusInfo.color
            )}>
              <StatusIcon className="w-4 h-4" />
              {bill.status.stage}
            </div>
            {priority === 'high' && (
              <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                High Priority
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
            {bill.title}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {expanded ? bill.summary : truncateText(bill.summary, 200)}
            {bill.summary.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 text-delta hover:text-delta/80 font-medium text-sm"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => router.push(`/bill/${bill.id}`)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="View details"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Share bill"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bill Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-gray-200 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Sponsor</p>
          <p className="text-sm font-medium">{bill.sponsor.name}</p>
          <p className="text-xs text-gray-500">{bill.sponsor.party} - {bill.sponsor.state}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Introduced</p>
          <p className="text-sm font-medium">{formatDate(bill.introducedDate)}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Last Action</p>
          <p className="text-sm font-medium">{formatDate(bill.lastActionDate)}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Chamber</p>
          <p className="text-sm font-medium">{bill.chamber}</p>
        </div>
      </div>

      {/* Subjects/Topics */}
      {bill.subjects && bill.subjects.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Topics</p>
          <div className="flex flex-wrap gap-2">
            {bill.subjects.slice(0, 4).map((subject, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {subject}
              </span>
            ))}
            {bill.subjects.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{bill.subjects.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Engagement Section */}
      {showEngagement && user && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <EnhancedBillEngagement
            bill={bill}
            userId={user.id}
            onContactRep={handleContactRep}
            onShare={handleShare}
            showCommunityStats={true}
          />
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Legislative History */}
          {bill.legislativeHistory && bill.legislativeHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Actions</h4>
              <div className="space-y-2">
                {bill.legislativeHistory.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="text-xs text-gray-500 w-20 flex-shrink-0">
                      {formatDate(action.date)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">{action.action}</p>
                      <p className="text-xs text-gray-500">{action.chamber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Committees */}
          {bill.committees && bill.committees.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Committees</h4>
              <div className="flex flex-wrap gap-2">
                {bill.committees.map((committee, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {committee}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => router.push(`/bill/${bill.id}`)}
          className="flex-1 bg-delta text-white py-2 px-4 rounded-lg hover:bg-delta/90 transition-colors text-sm font-medium"
        >
          View Full Details
        </button>
        
        {showEngagement && user && engagement.userVote && (
          <button
            onClick={handleContactRep}
            className="bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Contact Rep
          </button>
        )}
      </div>
    </Card>
  );
}