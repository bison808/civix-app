/**
 * Custom hooks for user engagement functionality
 * Provides easy access to voting, following, and analytics features
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  UserEngagement, 
  UserBillVote, 
  UserBillFollow,
  EngagementAnalytics,
  PersonalizedDashboard
} from '@/types';
import { engagementService } from '@/services/engagementService';

/**
 * Main engagement hook - provides comprehensive user engagement data
 */
export function useEngagement(userId: string) {
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [analytics, setAnalytics] = useState<EngagementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEngagement = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [engagementData, analyticsData] = await Promise.all([
        engagementService.getUserEngagement(userId),
        engagementService.getEngagementAnalytics(userId)
      ]);
      
      setEngagement(engagementData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load engagement data');
      console.error('Failed to load engagement:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEngagement();
  }, [loadEngagement]);

  const refresh = useCallback(() => {
    loadEngagement();
  }, [loadEngagement]);

  return {
    engagement,
    analytics,
    loading,
    error,
    refresh
  };
}

/**
 * Hook for managing user votes on bills
 */
export function useBillVoting(userId: string, billId?: string) {
  const [userVote, setUserVote] = useState<UserBillVote | null>(null);
  const [allVotes, setAllVotes] = useState<UserBillVote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's vote for specific bill
  useEffect(() => {
    if (userId && billId) {
      loadBillVote();
    }
  }, [userId, billId]);

  // Load all user votes
  useEffect(() => {
    if (userId) {
      loadAllVotes();
    }
  }, [userId]);

  const loadBillVote = async () => {
    if (!billId) return;
    
    try {
      const vote = await engagementService.getUserBillVote(userId, billId);
      setUserVote(vote);
    } catch (err) {
      console.error('Failed to load bill vote:', err);
    }
  };

  const loadAllVotes = async () => {
    try {
      const votes = await engagementService.getUserVotes(userId);
      setAllVotes(votes);
    } catch (err) {
      console.error('Failed to load all votes:', err);
    }
  };

  const vote = useCallback(async (
    targetBillId: string,
    position: 'support' | 'oppose' | 'neutral',
    options?: {
      confidence?: 'low' | 'medium' | 'high';
      reason?: string;
      isPublic?: boolean;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newVote = await engagementService.recordBillVote(
        userId, 
        targetBillId, 
        position, 
        options
      );

      // Update state
      if (targetBillId === billId) {
        setUserVote(newVote);
      }
      
      // Refresh all votes
      await loadAllVotes();
      
      return newVote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record vote';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, billId]);

  const removeVote = useCallback(async (targetBillId: string) => {
    setLoading(true);
    setError(null);

    try {
      await engagementService.updateBillVote(userId, targetBillId, null);
      
      // Update state
      if (targetBillId === billId) {
        setUserVote(null);
      }
      
      // Refresh all votes
      await loadAllVotes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove vote';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, billId]);

  const updateVote = useCallback(async (
    targetBillId: string, 
    position: 'support' | 'oppose' | 'neutral' | null
  ) => {
    if (position === null) {
      return removeVote(targetBillId);
    }
    return vote(targetBillId, position);
  }, [vote, removeVote]);

  return {
    userVote,
    allVotes,
    loading,
    error,
    vote,
    removeVote,
    updateVote,
    refresh: loadAllVotes
  };
}

/**
 * Hook for managing bill following
 */
export function useBillFollowing(userId: string) {
  const [followedBills, setFollowedBills] = useState<UserBillFollow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadFollowedBills();
    }
  }, [userId]);

  const loadFollowedBills = async () => {
    try {
      const bills = await engagementService.getFollowedBills(userId);
      setFollowedBills(bills);
    } catch (err) {
      console.error('Failed to load followed bills:', err);
    }
  };

  const followBill = useCallback(async (
    billId: string, 
    followType: 'watching' | 'tracking' | 'priority' = 'watching'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const follow = await engagementService.followBill(userId, billId, followType);
      
      // Update state
      setFollowedBills(prev => {
        const existing = prev.find(f => f.billId === billId);
        if (existing) {
          return prev.map(f => f.billId === billId ? follow : f);
        }
        return [...prev, follow];
      });
      
      return follow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to follow bill';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const unfollowBill = useCallback(async (billId: string) => {
    setLoading(true);
    setError(null);

    try {
      await engagementService.unfollowBill(userId, billId);
      
      // Update state
      setFollowedBills(prev => prev.filter(f => f.billId !== billId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unfollow bill';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const isFollowing = useCallback((billId: string) => {
    return followedBills.some(f => f.billId === billId && f.isActive);
  }, [followedBills]);

  const getFollowStatus = useCallback((billId: string) => {
    return followedBills.find(f => f.billId === billId && f.isActive) || null;
  }, [followedBills]);

  return {
    followedBills,
    loading,
    error,
    followBill,
    unfollowBill,
    isFollowing,
    getFollowStatus,
    refresh: loadFollowedBills
  };
}

/**
 * Hook for civic score and gamification
 */
export function useCivicScore(userId: string) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCivicData();
    }
  }, [userId]);

  const loadCivicData = async () => {
    setLoading(true);
    try {
      const [scoreData, levelData] = await Promise.all([
        engagementService.getCivicScore(userId),
        engagementService.getCivicLevel(userId)
      ]);
      
      setScore(scoreData);
      setLevel(levelData);
      setAchievements(levelData.achievements || []);
    } catch (err) {
      console.error('Failed to load civic data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(() => {
    loadCivicData();
  }, []);

  return {
    score,
    level,
    achievements,
    loading,
    refresh
  };
}

/**
 * Hook for personalized dashboard
 */
export function usePersonalizedDashboard(userId: string) {
  const [dashboard, setDashboard] = useState<PersonalizedDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadDashboard();
    }
  }, [userId]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dashboardData = await engagementService.getPersonalizedDashboard(userId);
      setDashboard(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(() => {
    loadDashboard();
  }, []);

  return {
    dashboard,
    loading,
    error,
    refresh
  };
}

/**
 * Hook for bill recommendations
 */
export function useBillRecommendations(userId: string, limit: number = 10) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId, limit]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const recs = await engagementService.getBillRecommendations(userId, limit);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(() => {
    loadRecommendations();
  }, []);

  return {
    recommendations,
    loading,
    error,
    refresh
  };
}

/**
 * Combined hook for bill engagement (voting + following)
 */
export function useBillEngagement(userId: string, billId: string) {
  const voting = useBillVoting(userId, billId);
  const following = useBillFollowing(userId);

  const toggleVote = useCallback(async (position: 'support' | 'oppose' | 'neutral') => {
    const currentPosition = voting.userVote?.position;
    
    if (currentPosition === position) {
      // Remove vote if clicking same position
      return voting.removeVote(billId);
    } else {
      // Add new vote
      return voting.vote(billId, position);
    }
  }, [voting, billId]);

  const toggleFollow = useCallback(async () => {
    const isCurrentlyFollowing = following.isFollowing(billId);
    
    if (isCurrentlyFollowing) {
      return following.unfollowBill(billId);
    } else {
      return following.followBill(billId, 'watching');
    }
  }, [following, billId]);

  return {
    // Voting
    userVote: voting.userVote,
    vote: voting.vote,
    removeVote: voting.removeVote,
    toggleVote,
    
    // Following
    followStatus: following.getFollowStatus(billId),
    isFollowing: following.isFollowing(billId),
    followBill: following.followBill,
    unfollowBill: following.unfollowBill,
    toggleFollow,
    
    // Combined state
    loading: voting.loading || following.loading,
    error: voting.error || following.error,
    
    // Refresh
    refresh: () => {
      voting.refresh();
      following.refresh();
    }
  };
}

/**
 * Hook for analytics insights
 */
export function useEngagementInsights(userId: string) {
  const [insights, setInsights] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadInsights();
    }
  }, [userId]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const analytics = await engagementService.getEngagementAnalytics(userId);
      
      // Process insights
      const insights = {
        votingTrend: analytics.trends.engagementTrend,
        topCategories: Object.entries(analytics.voting.votesByCategory || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3),
        engagementStreak: analytics.trends.activityPattern,
        influenceScore: analytics.impact.influenceMetrics.communityEngagement,
        representativeAlignment: analytics.interactions.representativeAlignment
      };
      
      setInsights(insights);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    loading,
    refresh: loadInsights
  };
}