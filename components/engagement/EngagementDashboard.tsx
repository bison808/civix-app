'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  BarChart3,
  Award,
  Target,
  Activity
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface EngagementStats {
  totalVotes: number;
  agreementRate: number;
  billsTracked: number;
  representativeAlignment: number;
  communityRank: number;
  impactScore: number;
}

interface EngagementDashboardProps {
  userId?: string;
  compact?: boolean;
}

export default function EngagementDashboard({ userId, compact = false }: EngagementDashboardProps) {
  const [stats, setStats] = useState<EngagementStats>({
    totalVotes: 47,
    agreementRate: 73,
    billsTracked: 12,
    representativeAlignment: 68,
    communityRank: 234,
    impactScore: 85,
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'vote', bill: 'HR 1234', action: 'supported', time: '2 hours ago' },
    { type: 'align', rep: 'Sen. Smith', percentage: 82, time: '1 day ago' },
    { type: 'milestone', achievement: 'Active Citizen', time: '3 days ago' },
  ]);

  const getAlignmentColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getImpactLevel = (score: number) => {
    if (score >= 90) return { label: 'High Impact', color: 'text-purple-600' };
    if (score >= 70) return { label: 'Growing Impact', color: 'text-blue-600' };
    if (score >= 50) return { label: 'Building Impact', color: 'text-green-600' };
    return { label: 'Getting Started', color: 'text-gray-600' };
  };

  if (compact) {
    // Compact view for embedding in other pages
    return (
      <Card variant="default" padding="sm" className="bg-gradient-to-br from-delta/5 to-delta/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Activity size={20} className="text-delta" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Your Impact Score</p>
              <p className="text-2xl font-bold text-delta">{stats.impactScore}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">{stats.totalVotes} votes cast</p>
            <p className="text-sm font-medium text-gray-900">
              {stats.agreementRate}% community alignment
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Impact Score */}
      <Card variant="default" padding="md" className="bg-gradient-to-br from-delta/5 to-delta/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Civic Impact</h3>
            <Award size={24} className="text-delta" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-delta mb-1">{stats.impactScore}</div>
              <p className="text-xs text-gray-600">Impact Score</p>
              <p className={cn('text-xs font-medium mt-1', getImpactLevel(stats.impactScore).color)}>
                {getImpactLevel(stats.impactScore).label}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">#{stats.communityRank}</div>
              <p className="text-xs text-gray-600">Community Rank</p>
              <p className="text-xs text-green-600 font-medium mt-1">↑ 12 this week</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Alignment Metrics */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Alignment & Agreement</h3>
        
        <div className="space-y-3">
          {/* Community Agreement */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">Community Agreement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${stats.agreementRate}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.agreementRate}%</span>
            </div>
          </div>

          {/* Representative Alignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">Rep Alignment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-500',
                    stats.representativeAlignment >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                  )}
                  style={{ width: `${stats.representativeAlignment}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.representativeAlignment}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="default" padding="sm" className="text-center">
          <ThumbsUp size={20} className="text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{stats.totalVotes}</p>
          <p className="text-xs text-gray-600">Votes Cast</p>
        </Card>

        <Card variant="default" padding="sm" className="text-center">
          <BarChart3 size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{stats.billsTracked}</p>
          <p className="text-xs text-gray-600">Bills Tracked</p>
        </Card>

        <Card variant="default" padding="sm" className="text-center">
          <TrendingUp size={20} className="text-purple-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-600">Streaks</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                {activity.type === 'vote' && <ThumbsUp size={14} className="text-green-500" />}
                {activity.type === 'align' && <Target size={14} className="text-blue-500" />}
                {activity.type === 'milestone' && <Award size={14} className="text-purple-500" />}
                <span className="text-sm text-gray-700">
                  {activity.type === 'vote' && `Voted on ${activity.bill}`}
                  {activity.type === 'align' && `${activity.percentage}% aligned with ${activity.rep}`}
                  {activity.type === 'milestone' && `Earned "${activity.achievement}"`}
                </span>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements Preview */}
      <Card variant="default" padding="md" className="bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Next Achievement</h3>
            <p className="text-xs text-gray-600 mt-1">Vote on 3 more bills to unlock "Engaged Citizen"</p>
          </div>
          <div className="relative">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#8b5cf6"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - 0.7)}`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">70%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}