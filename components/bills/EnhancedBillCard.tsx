'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Heart,
  Shield,
  Briefcase,
  Home,
  Globe,
  MapPin
} from 'lucide-react';
import Card from '@/components/core/Card';
import LikeDislike from '@/components/feedback/LikeDislike';
import { Bill } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface EnhancedBillCardProps {
  bill: Bill;
  onVote?: (billId: string, vote: 'like' | 'dislike' | null) => Promise<void>;
  onClick?: (bill: Bill) => void;
  compact?: boolean;
}

export default function EnhancedBillCard({ bill, onVote, onClick, compact = false }: EnhancedBillCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine bill urgency based on dates
  const getUrgencyLevel = () => {
    if (!bill.lastActionDate) return null;
    const daysSinceAction = Math.floor((Date.now() - new Date(bill.lastActionDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceAction < 7) return { level: 'urgent', label: 'Active This Week', color: 'text-red-600 bg-red-50' };
    if (daysSinceAction < 30) return { level: 'recent', label: 'Recent Activity', color: 'text-orange-600 bg-orange-50' };
    if (daysSinceAction < 90) return { level: 'normal', label: null, color: null };
    return { level: 'stale', label: 'No Recent Activity', color: 'text-gray-500 bg-gray-50' };
  };

  // Determine impact categories from subjects
  const getImpactCategories = () => {
    const categories = [];
    const subjects = bill.subjects.join(' ').toLowerCase();
    
    if (subjects.includes('health') || subjects.includes('medicare') || subjects.includes('medicaid')) {
      categories.push({ icon: Heart, label: 'Healthcare', color: 'text-red-500' });
    }
    if (subjects.includes('tax') || subjects.includes('budget') || subjects.includes('economic')) {
      categories.push({ icon: DollarSign, label: 'Economic', color: 'text-green-500' });
    }
    if (subjects.includes('defense') || subjects.includes('security') || subjects.includes('military')) {
      categories.push({ icon: Shield, label: 'Defense', color: 'text-blue-500' });
    }
    if (subjects.includes('education') || subjects.includes('school')) {
      categories.push({ icon: Briefcase, label: 'Education', color: 'text-purple-500' });
    }
    if (subjects.includes('housing') || subjects.includes('infrastructure')) {
      categories.push({ icon: Home, label: 'Infrastructure', color: 'text-indigo-500' });
    }
    if (subjects.includes('climate') || subjects.includes('environment')) {
      categories.push({ icon: Globe, label: 'Environment', color: 'text-green-600' });
    }
    
    return categories.slice(0, 3);
  };

  // Generate quick take bullet points from summary
  const getQuickTakes = () => {
    const summary = bill.aiSummary?.simpleSummary || bill.summary;
    const sentences = summary.split('. ').filter(s => s.length > 20);
    return sentences.slice(0, 3).map(s => {
      // Clean and truncate
      let cleaned = s.replace(/^[^a-zA-Z]+/, '').trim();
      if (cleaned.length > 80) {
        cleaned = cleaned.substring(0, 77) + '...';
      }
      return cleaned;
    });
  };

  const getStatusColor = (status: Bill['status']) => {
    const colors = {
      proposed: 'bg-blue-100 text-blue-700 border-blue-200',
      committee: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      floor: 'bg-orange-100 text-orange-700 border-orange-200',
      passed: 'bg-green-100 text-green-700 border-green-200',
      enacted: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (colors as any)[status.stage.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getLevelIcon = () => {
    const location = bill.billNumber.toLowerCase();
    if (location.includes('hr') || location.includes('s')) {
      return { icon: Globe, label: 'Federal', color: 'text-blue-600' };
    }
    if (location.includes('state')) {
      return { icon: MapPin, label: 'State', color: 'text-purple-600' };
    }
    return { icon: MapPin, label: 'Local', color: 'text-green-600' };
  };

  const urgency = getUrgencyLevel();
  const impacts = getImpactCategories();
  const quickTakes = getQuickTakes();
  const level = getLevelIcon();

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        'overflow-hidden cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:border-delta/40',
        'active:scale-[0.98]', // Mobile touch feedback
        urgency?.level === 'urgent' && 'ring-2 ring-red-100'
      )}
      onClick={(e) => {
        if (!expanded) {
          onClick?.(bill);
        }
      }}
    >
      {/* Urgency Banner */}
      {urgency?.label && (
        <div className={cn('px-4 py-1.5 text-xs font-medium flex items-center gap-1', urgency.color)}>
          <Clock size={12} />
          {urgency.label}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Bill Number & Status Row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1">
                <level.icon size={14} className={level.color} />
                <span className="text-xs font-semibold text-gray-600">{bill.billNumber}</span>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', getStatusColor(bill.status))}>
                {bill.status.stage}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
              {bill.title}
            </h3>
          </div>
          
          {/* Expand/Navigate Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Impact Badges */}
        {impacts.length > 0 && (
          <div className="flex gap-3">
            {impacts.map((impact, idx) => {
              const Icon = impact.icon;
              return (
                <div key={idx} className="flex items-center gap-1">
                  <Icon size={16} className={impact.color} />
                  <span className="text-xs text-gray-600">{impact.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Takes - Always Visible */}
        <div className="space-y-1.5 py-2 border-y border-gray-100">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={14} className="text-delta" />
            <span className="text-xs font-semibold text-delta">Quick Take</span>
          </div>
          {quickTakes.map((take, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-gray-400 text-xs mt-0.5">•</span>
              <span className="text-sm text-gray-700 leading-relaxed">{take}</span>
            </div>
          ))}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
            {/* Full Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Full Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {bill.aiSummary?.simpleSummary || bill.summary}
              </p>
            </div>

            {/* Topics */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Topics</h4>
              <div className="flex flex-wrap gap-1.5">
                {bill.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* View Full Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(bill);
              }}
              className="w-full py-2 bg-delta text-white rounded-lg text-sm font-medium hover:bg-delta/90 transition-colors"
            >
              View Full Details
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {bill.lastActionDate && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(bill.lastActionDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>12 reps involved</span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <LikeDislike
              billId={bill.id}
              initialLikes={Math.floor(Math.random() * 100)}
              initialDislikes={Math.floor(Math.random() * 50)}
              userVote={bill.userVote}
              onVote={onVote}
              size="sm"
              showCounts={true}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}