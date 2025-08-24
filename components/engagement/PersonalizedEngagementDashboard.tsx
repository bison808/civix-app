'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  Eye,
  Phone,
  Share2,
  Award,
  Target,
  Activity,
  Bell,
  Clock,
  BarChart3,
  Heart,
  MessageSquare,
  Calendar,
  Filter,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { 
  UserEngagement,
  UserBillVote, 
  UserBillFollow,
  EngagementAnalytics,
  PersonalizedDashboard,
  Achievement
} from '@/types';
import { engagementService } from '@/services/engagementService';
import { cn } from '@/lib/utils';
import Card from '@/components/core/Card';
import { useRouter } from 'next/navigation';

interface PersonalizedEngagementDashboardProps {
  userId: string;
  compact?: boolean;
  className?: string;
}

export default function PersonalizedEngagementDashboard({ 
  userId, 
  compact = false,
  className 
}: PersonalizedEngagementDashboardProps) {
  const router = useRouter();
  
  // State
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [analytics, setAnalytics] = useState<EngagementAnalytics | null>(null);
  const [recentVotes, setRecentVotes] = useState<UserBillVote[]>([]);
  const [followedBills, setFollowedBills] = useState<UserBillFollow[]>([]);
  const [dashboard, setDashboard] = useState<PersonalizedDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'votes' | 'following' | 'achievements'>('overview');

  useEffect(() => {
    loadEngagementData();
  }, [userId]);

  const loadEngagementData = async () => {
    setLoading(true);
    try {
      // Load all engagement data in parallel
      const [
        engagementData,
        analyticsData,
        votesData,
        followsData,
        dashboardData
      ] = await Promise.all([
        engagementService.getUserEngagement(userId),
        engagementService.getEngagementAnalytics(userId),
        engagementService.getUserVotes(userId, { limit: 5 }),
        engagementService.getFollowedBills(userId),
        engagementService.getPersonalizedDashboard(userId)
      ]);

      setEngagement(engagementData);
      setAnalytics(analyticsData);
      setRecentVotes(votesData);
      setFollowedBills(followsData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCivicLevelInfo = (level: string) => {
    const levels = {
      bronze: { color: 'text-amber-600 bg-amber-50', icon: '🥉', name: 'Bronze Citizen' },
      silver: { color: 'text-gray-600 bg-gray-50', icon: '🥈', name: 'Silver Citizen' },
      gold: { color: 'text-yellow-600 bg-yellow-50', icon: '🥇', name: 'Gold Citizen' },
      platinum: { color: 'text-purple-600 bg-purple-50', icon: '💎', name: 'Platinum Citizen' },
      diamond: { color: 'text-blue-600 bg-blue-50', icon: '💠', name: 'Diamond Citizen' }
    };
    return levels[level as keyof typeof levels] || levels.bronze;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-48 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!engagement || !analytics) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load engagement data</p>
      </div>
    );
  }

  const civicLevel = getCivicLevelInfo(engagement.profile.civicLevel.level);

  // Compact version for sidebar or overview
  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Civic Score Card */}
        <Card variant="default" padding="sm" className="bg-gradient-to-br from-delta/5 to-delta/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Activity size={20} className="text-delta" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Civic Impact Score</p>
                <p className="text-2xl font-bold text-delta">{engagement.profile.engagementScore}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn('px-2 py-1 rounded text-xs font-medium', civicLevel.color)}>
                {civicLevel.icon} {civicLevel.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">#{analytics.impact.communityRank}</p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-lg font-bold text-green-600">{analytics.voting.totalVotes}</p>
            <p className="text-xs text-gray-600">Votes</p>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-lg font-bold text-purple-600">{analytics.following.billsFollowed}</p>
            <p className="text-xs text-gray-600">Following</p>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-lg font-bold text-blue-600">{analytics.interactions.totalInteractions}</p>
            <p className="text-xs text-gray-600">Contacts</p>
          </div>
        </div>

        {/* Recent Activity Preview */}
        <Card variant="default" padding="sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
            <button 
              onClick={() => setActiveTab('votes')}
              className="text-xs text-delta hover:text-delta/80"
            >
              View All
            </button>
          </div>
          <div className="space-y-1">
            {recentVotes.slice(0, 3).map((vote, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {vote.position === 'support' ? (
                  <ThumbsUp className="w-3 h-3 text-green-500" />
                ) : vote.position === 'oppose' ? (
                  <ThumbsDown className="w-3 h-3 text-red-500" />
                ) : (
                  <Target className="w-3 h-3 text-gray-500" />
                )}
                <span className="text-gray-600 truncate">Voted on {vote.billId}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Full dashboard
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-delta to-delta/80 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Civic Engagement</h2>
            <p className="text-white/80">Track your impact on democracy and stay informed</p>
          </div>
          <div className="text-right">
            <div className={cn(
              'px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm',
              'flex items-center gap-2 text-sm font-medium'
            )}>
              <span>{civicLevel.icon}</span>
              <span>{civicLevel.name}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{engagement.profile.engagementScore}</div>
            <div className="text-sm text-white/80">Civic Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">#{analytics.impact.communityRank}</div>
            <div className="text-sm text-white/80">Community Rank</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{engagement.profile.streaks.currentVotingStreak}</div>
            <div className="text-sm text-white/80">Vote Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{formatNumber(analytics.impact.influenceMetrics.communityEngagement)}</div>
            <div className="text-sm text-white/80">Influence</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'votes', label: 'Your Votes', icon: ThumbsUp },
          { key: 'following', label: 'Following', icon: Eye },
          { key: 'achievements', label: 'Achievements', icon: Award },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium',
              activeTab === key 
                ? 'bg-white text-delta shadow-sm' 
                : 'text-gray-600 hover:text-delta hover:bg-white/50'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voting Activity */}
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Voting Activity</h3>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Votes Cast</span>
                <span className="font-bold text-xl">{analytics.voting.totalVotes}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Support</span>
                  <span className="text-green-600">{analytics.voting.votesByPosition.support}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(analytics.voting.votesByPosition.support / analytics.voting.totalVotes) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Oppose</span>
                  <span className="text-red-600">{analytics.voting.votesByPosition.oppose}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(analytics.voting.votesByPosition.oppose / analytics.voting.totalVotes) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Engagement Trends */}
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Engagement Trends</h3>
              <BarChart3 className="text-blue-500" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600">Bills Following</span>
                </div>
                <span className="font-bold">{analytics.following.billsFollowed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Reps Contacted</span>
                </div>
                <span className="font-bold">{analytics.interactions.totalInteractions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Community Alignment</span>
                </div>
                <span className="font-bold">{Math.round(analytics.interactions.satisfactionScore * 20)}%</span>
              </div>
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card variant="default" padding="md" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Achievements</h3>
              <Award className="text-yellow-500" size={20} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {engagement.profile.civicLevel.achievements.slice(0, 3).map((achievement, idx) => (
                <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-sm">{achievement.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  <div className="text-xs text-yellow-600 mt-2">
                    +{achievement.pointsAwarded} points
                  </div>
                </div>
              ))}
              
              {/* Next Achievement */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-sm text-gray-600">Next Goal</span>
                </div>
                <p className="text-xs text-gray-500">Vote on 5 more bills</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-delta h-2 rounded-full w-3/5" />
                </div>
                <div className="text-xs text-gray-500 mt-1">3/5 complete</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'votes' && (
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Voting History</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select className="text-sm border rounded px-2 py-1">
                <option>All Time</option>
                <option>This Month</option>
                <option>This Week</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            {recentVotes.map((vote, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {vote.position === 'support' ? (
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                  ) : vote.position === 'oppose' ? (
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                  ) : (
                    <Target className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium">{vote.position.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">Bill {vote.billId}</p>
                    {vote.reason && (
                      <p className="text-xs text-gray-500 italic">"{vote.reason}"</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {vote.hasContactedRep && <Phone className="w-3 h-3 text-blue-500" />}
                    {vote.hasSharedBill && <Share2 className="w-3 h-3 text-green-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'following' && (
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bills You're Following</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bell className="w-4 h-4" />
              {followedBills.length} active
            </div>
          </div>
          
          <div className="space-y-3">
            {followedBills.map((follow, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Bill {follow.billId}</p>
                    <p className="text-sm text-gray-600 capitalize">{follow.followType} updates</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Since {new Date(follow.startDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-purple-600">
                    {follow.notifications.statusUpdates && <Bell className="w-3 h-3" />}
                    {follow.notifications.voteScheduled && <Calendar className="w-3 h-3" />}
                    Notifications on
                  </div>
                </div>
              </div>
            ))}
            
            {followedBills.length === 0 && (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">You're not following any bills yet</p>
                <button 
                  onClick={() => router.push('/feed')}
                  className="mt-2 text-delta hover:text-delta/80 text-sm font-medium"
                >
                  Browse Bills to Follow
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Level Progress */}
          <Card variant="default" padding="md">
            <div className="text-center">
              <div className={cn('w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl', civicLevel.color)}>
                {civicLevel.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{civicLevel.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {engagement.profile.civicLevel.points} / {engagement.profile.civicLevel.nextLevelPoints} points
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-delta h-3 rounded-full transition-all"
                  style={{ 
                    width: `${(engagement.profile.civicLevel.points / engagement.profile.civicLevel.nextLevelPoints) * 100}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {engagement.profile.civicLevel.nextLevelPoints - engagement.profile.civicLevel.points} points to next level
              </p>
            </div>
          </Card>

          {/* All Achievements */}
          <Card variant="default" padding="md">
            <h3 className="text-lg font-semibold mb-4">All Achievements</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {engagement.profile.civicLevel.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-600 font-medium">+{achievement.pointsAwarded}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}