/**
 * Enhanced User Engagement Service for CITZN Platform
 * Handles user voting, following, analytics, and personalization
 */

import { 
  UserEngagement, 
  UserBillVote, 
  UserBillFollow, 
  UserCommitteeFollow,
  UserRepresentativeInteraction,
  EngagementAnalytics,
  PersonalizedDashboard,
  PersonalizedFeed,
  Achievement,
  CivicLevel,
  TopicInterest,
  BillCategory,
  EngagementResponse
} from '@/types/engagement.types';

class EngagementService {
  private readonly STORAGE_PREFIX = 'citzn_engagement_';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  private cache = new Map<string, { data: any; timestamp: number }>();

  // ============================================================================
  // CORE USER ENGAGEMENT
  // ============================================================================

  /**
   * Initialize or get user engagement profile
   */
  async getUserEngagement(userId: string): Promise<UserEngagement> {
    const cacheKey = `engagement_${userId}`;
    const cached = this.getFromCache<UserEngagement>(cacheKey);
    if (cached) return cached;

    try {
      // In production, this would be an API call
      let engagement = this.getStoredEngagement(userId);
      
      if (!engagement) {
        engagement = this.createDefaultEngagement(userId);
        this.storeEngagement(engagement);
      }

      this.setCache(cacheKey, engagement);
      return engagement;
    } catch (error) {
      console.error('Failed to get user engagement:', error);
      return this.createDefaultEngagement(userId);
    }
  }

  /**
   * Update user engagement profile
   */
  async updateUserEngagement(userId: string, updates: Partial<UserEngagement>): Promise<UserEngagement> {
    try {
      const current = await this.getUserEngagement(userId);
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.storeEngagement(updated);
      this.clearCache(`engagement_${userId}`);

      // In production, sync with backend
      await this.syncEngagementToServer(updated);

      return updated;
    } catch (error) {
      console.error('Failed to update engagement:', error);
      throw error;
    }
  }

  // ============================================================================
  // VOTING FUNCTIONALITY
  // ============================================================================

  /**
   * Record user vote on a bill
   */
  async recordBillVote(
    userId: string, 
    billId: string, 
    position: 'support' | 'oppose' | 'neutral',
    options: {
      confidence?: 'low' | 'medium' | 'high';
      reason?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<UserBillVote> {
    try {
      const vote: UserBillVote = {
        id: this.generateId(),
        userId,
        billId,
        position,
        confidence: options.confidence || 'medium',
        reason: options.reason,
        timestamp: new Date().toISOString(),
        isPublic: options.isPublic ?? true,
        hasContactedRep: false,
        hasSharedBill: false,
        notificationsSent: []
      };

      // Store vote
      this.storeUserVote(vote);

      // Update engagement profile
      await this.updateEngagementAfterVote(userId, billId, position);

      // Update analytics
      await this.updateVotingAnalytics(userId, vote);

      return vote;
    } catch (error) {
      console.error('Failed to record vote:', error);
      throw error;
    }
  }

  /**
   * Get user's vote for a specific bill
   */
  async getUserBillVote(userId: string, billId: string): Promise<UserBillVote | null> {
    try {
      const votes = this.getStoredVotes(userId);
      return votes.find(v => v.billId === billId) || null;
    } catch (error) {
      console.error('Failed to get bill vote:', error);
      return null;
    }
  }

  /**
   * Get all user votes with filtering
   */
  async getUserVotes(userId: string, filters: {
    position?: 'support' | 'oppose' | 'neutral';
    category?: BillCategory;
    timeframe?: string;
    limit?: number;
  } = {}): Promise<UserBillVote[]> {
    try {
      let votes = this.getStoredVotes(userId);

      // Apply filters
      if (filters.position) {
        votes = votes.filter(v => v.position === filters.position);
      }

      if (filters.timeframe) {
        const cutoff = this.getTimeframeCutoff(filters.timeframe);
        votes = votes.filter(v => new Date(v.timestamp) >= cutoff);
      }

      // Sort by timestamp (newest first)
      votes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (filters.limit) {
        votes = votes.slice(0, filters.limit);
      }

      return votes;
    } catch (error) {
      console.error('Failed to get user votes:', error);
      return [];
    }
  }

  /**
   * Remove/change user vote
   */
  async updateBillVote(userId: string, billId: string, position: 'support' | 'oppose' | 'neutral' | null): Promise<boolean> {
    try {
      const votes = this.getStoredVotes(userId);
      const existingIndex = votes.findIndex(v => v.billId === billId);

      if (position === null) {
        // Remove vote
        if (existingIndex >= 0) {
          votes.splice(existingIndex, 1);
          this.storeUserVotes(userId, votes);
          await this.updateEngagementAfterVoteRemoval(userId, billId);
          return true;
        }
      } else {
        // Update existing vote
        if (existingIndex >= 0) {
          votes[existingIndex] = {
            ...votes[existingIndex],
            position,
            timestamp: new Date().toISOString()
          };
          this.storeUserVotes(userId, votes);
          await this.updateEngagementAfterVote(userId, billId, position);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to update vote:', error);
      return false;
    }
  }

  // ============================================================================
  // FOLLOWING FUNCTIONALITY
  // ============================================================================

  /**
   * Follow a bill
   */
  async followBill(userId: string, billId: string, followType: 'watching' | 'tracking' | 'priority' = 'watching'): Promise<UserBillFollow> {
    try {
      const follow: UserBillFollow = {
        id: this.generateId(),
        userId,
        billId,
        followType,
        notifications: {
          statusUpdates: true,
          voteScheduled: followType === 'priority',
          committeeActions: followType !== 'watching',
          amendments: followType === 'priority'
        },
        startDate: new Date().toISOString(),
        isActive: true
      };

      this.storeBillFollow(follow);
      await this.updateEngagementAfterFollow(userId, 'bill');

      return follow;
    } catch (error) {
      console.error('Failed to follow bill:', error);
      throw error;
    }
  }

  /**
   * Unfollow a bill
   */
  async unfollowBill(userId: string, billId: string): Promise<boolean> {
    try {
      const follows = this.getStoredBillFollows(userId);
      const updated = follows.filter(f => f.billId !== billId);
      
      if (updated.length !== follows.length) {
        this.storeBillFollows(userId, updated);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unfollow bill:', error);
      return false;
    }
  }

  /**
   * Get user's followed bills
   */
  async getFollowedBills(userId: string): Promise<UserBillFollow[]> {
    try {
      return this.getStoredBillFollows(userId).filter(f => f.isActive);
    } catch (error) {
      console.error('Failed to get followed bills:', error);
      return [];
    }
  }

  /**
   * Follow a committee
   */
  async followCommittee(userId: string, committeeId: string, committeeName: string, chamber: 'house' | 'senate' | 'joint', level: 'federal' | 'state' | 'local'): Promise<UserCommitteeFollow> {
    try {
      const follow: UserCommitteeFollow = {
        id: this.generateId(),
        userId,
        committeeId,
        committeeName,
        chamber,
        level,
        notifications: {
          meetings: true,
          newBills: true,
          hearings: true,
          votes: false
        },
        startDate: new Date().toISOString(),
        isActive: true
      };

      this.storeCommitteeFollow(follow);
      await this.updateEngagementAfterFollow(userId, 'committee');

      return follow;
    } catch (error) {
      console.error('Failed to follow committee:', error);
      throw error;
    }
  }

  /**
   * Get user's followed committees
   */
  async getFollowedCommittees(userId: string): Promise<UserCommitteeFollow[]> {
    try {
      return this.getStoredCommitteeFollows(userId).filter(f => f.isActive);
    } catch (error) {
      console.error('Failed to get followed committees:', error);
      return [];
    }
  }

  // ============================================================================
  // REPRESENTATIVE INTERACTIONS
  // ============================================================================

  /**
   * Record interaction with representative
   */
  async recordRepresentativeInteraction(
    userId: string,
    representativeId: string,
    interactionType: 'contacted' | 'responded' | 'met' | 'event',
    details: {
      method?: 'phone' | 'email' | 'social' | 'in-person' | 'letter';
      billId?: string;
      subject: string;
      notes?: string;
    }
  ): Promise<UserRepresentativeInteraction> {
    try {
      const interaction: UserRepresentativeInteraction = {
        id: this.generateId(),
        userId,
        representativeId,
        interactionType,
        method: details.method,
        billId: details.billId,
        subject: details.subject,
        notes: details.notes,
        timestamp: new Date().toISOString(),
        responseReceived: false
      };

      this.storeRepInteraction(interaction);
      await this.updateEngagementAfterInteraction(userId);

      // If related to a bill, mark vote as having contacted rep
      if (details.billId) {
        await this.markVoteAsContacted(userId, details.billId);
      }

      return interaction;
    } catch (error) {
      console.error('Failed to record interaction:', error);
      throw error;
    }
  }

  /**
   * Get representative interactions
   */
  async getRepresentativeInteractions(userId: string, representativeId?: string): Promise<UserRepresentativeInteraction[]> {
    try {
      let interactions = this.getStoredRepInteractions(userId);
      
      if (representativeId) {
        interactions = interactions.filter(i => i.representativeId === representativeId);
      }

      return interactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get interactions:', error);
      return [];
    }
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Get comprehensive engagement analytics
   */
  async getEngagementAnalytics(userId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<EngagementAnalytics> {
    try {
      const votes = await this.getUserVotes(userId, { timeframe: period });
      const follows = await this.getFollowedBills(userId);
      const interactions = await this.getRepresentativeInteractions(userId);
      const engagement = await this.getUserEngagement(userId);

      return {
        userId,
        period: {
          start: this.getTimeframeCutoff(period).toISOString(),
          end: new Date().toISOString(),
          type: period
        },
        voting: this.calculateVotingAnalytics(votes),
        following: this.calculateFollowingAnalytics(follows),
        interactions: this.calculateInteractionAnalytics(interactions),
        impact: this.calculateImpactAnalytics(engagement, votes, interactions),
        trends: this.calculateTrendAnalytics(votes, follows, interactions)
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Get civic score
   */
  async getCivicScore(userId: string): Promise<number> {
    try {
      const engagement = await this.getUserEngagement(userId);
      return engagement.profile.engagementScore;
    } catch (error) {
      console.error('Failed to get civic score:', error);
      return 0;
    }
  }

  /**
   * Get civic level and achievements
   */
  async getCivicLevel(userId: string): Promise<CivicLevel> {
    try {
      const engagement = await this.getUserEngagement(userId);
      return engagement.profile.civicLevel;
    } catch (error) {
      console.error('Failed to get civic level:', error);
      return {
        level: 'bronze',
        points: 0,
        nextLevelPoints: 100,
        achievements: []
      };
    }
  }

  // ============================================================================
  // PERSONALIZATION & RECOMMENDATIONS
  // ============================================================================

  /**
   * Get personalized dashboard
   */
  async getPersonalizedDashboard(userId: string): Promise<PersonalizedDashboard> {
    try {
      const engagement = await this.getUserEngagement(userId);
      const analytics = await this.getEngagementAnalytics(userId);
      
      const sections = await this.buildDashboardSections(userId, engagement, analytics);

      return {
        userId,
        sections,
        lastUpdated: new Date().toISOString(),
        preferences: engagement.preferences?.personalization ? {
          layout: 'cards',
          sectionsPerPage: 6,
          autoRefresh: true,
          refreshInterval: 30,
          showTooltips: true,
          darkMode: false
        } : this.getDefaultDashboardPreferences()
      };
    } catch (error) {
      console.error('Failed to get personalized dashboard:', error);
      throw error;
    }
  }

  /**
   * Get personalized bill recommendations
   */
  async getBillRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const engagement = await this.getUserEngagement(userId);
      const votes = await this.getUserVotes(userId, { limit: 50 });
      
      // Analyze user's topic interests and voting patterns
      const topicInterests = this.analyzeTopicInterests(votes);
      
      // In production, this would query the bills API with personalized filters
      return this.generateMockRecommendations(userId, topicInterests, limit);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private createDefaultEngagement(userId: string): UserEngagement {
    return {
      id: this.generateId(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        totalVotes: 0,
        totalFollowedBills: 0,
        totalFollowedCommittees: 0,
        totalRepresentativeInteractions: 0,
        firstEngagementDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        engagementScore: 0,
        civicLevel: {
          level: 'bronze',
          points: 0,
          nextLevelPoints: 100,
          achievements: []
        },
        streaks: {
          currentVotingStreak: 0,
          longestVotingStreak: 0,
          currentActivityStreak: 1,
          longestActivityStreak: 1,
          lastActivityDate: new Date().toISOString()
        },
        topicInterests: [],
        geographicInterests: [
          {
            level: 'federal',
            location: 'United States',
            interestLevel: 'medium',
            isUserLocation: true
          }
        ]
      },
      preferences: {
        notifications: {
          channels: ['push'],
          frequency: 'daily',
          billUpdates: true,
          committeeUpdates: true,
          representativeUpdates: true,
          achievementUpdates: true,
          communityUpdates: false,
          reminderVoting: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          }
        },
        privacy: {
          profileVisibility: 'community',
          votingVisibility: 'anonymous',
          shareAchievements: true,
          shareInteractions: false,
          dataRetention: '2years',
          analyticsOptOut: false
        },
        personalization: {
          autoFollowBills: false,
          autoFollowCommittees: false,
          smartRecommendations: true,
          trendingAlerts: true,
          representativeMatching: true,
          contentFiltering: {
            hidePartisan: false,
            hideComplexBills: false,
            hideInactiveBills: true
          }
        },
        gamification: {
          showAchievements: true,
          showCivicScore: true,
          showCommunityRank: true,
          showStreaks: true,
          competitiveMode: false,
          celebrationAnimations: true
        }
      },
      privacy: {
        anonymousMode: false,
        dataSharing: {
          analytics: true,
          research: false,
          improvements: true
        },
        retention: {
          votes: '1year',
          interactions: '1year',
          analytics: '1year'
        }
      }
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  }

  // Storage methods (localStorage-based, would be API calls in production)
  private getStorageKey(type: string, userId?: string): string {
    return userId ? `${this.STORAGE_PREFIX}${type}_${userId}` : `${this.STORAGE_PREFIX}${type}`;
  }

  private getStoredEngagement(userId: string): UserEngagement | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(this.getStorageKey('profile', userId));
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private storeEngagement(engagement: UserEngagement): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey('profile', engagement.userId), JSON.stringify(engagement));
    } catch (error) {
      console.error('Failed to store engagement:', error);
    }
  }

  private getStoredVotes(userId: string): UserBillVote[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.getStorageKey('votes', userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeUserVote(vote: UserBillVote): void {
    const votes = this.getStoredVotes(vote.userId);
    const existingIndex = votes.findIndex(v => v.billId === vote.billId);
    
    if (existingIndex >= 0) {
      votes[existingIndex] = vote;
    } else {
      votes.push(vote);
    }

    this.storeUserVotes(vote.userId, votes);
  }

  private storeUserVotes(userId: string, votes: UserBillVote[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey('votes', userId), JSON.stringify(votes));
    } catch (error) {
      console.error('Failed to store votes:', error);
    }
  }

  // Similar storage methods for follows and interactions...
  private getStoredBillFollows(userId: string): UserBillFollow[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.getStorageKey('bill_follows', userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeBillFollow(follow: UserBillFollow): void {
    const follows = this.getStoredBillFollows(follow.userId);
    const existingIndex = follows.findIndex(f => f.billId === follow.billId);
    
    if (existingIndex >= 0) {
      follows[existingIndex] = follow;
    } else {
      follows.push(follow);
    }

    this.storeBillFollows(follow.userId, follows);
  }

  private storeBillFollows(userId: string, follows: UserBillFollow[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey('bill_follows', userId), JSON.stringify(follows));
    } catch (error) {
      console.error('Failed to store follows:', error);
    }
  }

  private getStoredCommitteeFollows(userId: string): UserCommitteeFollow[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.getStorageKey('committee_follows', userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeCommitteeFollow(follow: UserCommitteeFollow): void {
    const follows = this.getStoredCommitteeFollows(follow.userId);
    follows.push(follow);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getStorageKey('committee_follows', follow.userId), JSON.stringify(follows));
      } catch (error) {
        console.error('Failed to store committee follows:', error);
      }
    }
  }

  private getStoredRepInteractions(userId: string): UserRepresentativeInteraction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.getStorageKey('rep_interactions', userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeRepInteraction(interaction: UserRepresentativeInteraction): void {
    const interactions = this.getStoredRepInteractions(interaction.userId);
    interactions.push(interaction);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getStorageKey('rep_interactions', interaction.userId), JSON.stringify(interactions));
      } catch (error) {
        console.error('Failed to store interactions:', error);
      }
    }
  }

  // Cache methods
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  // Analytics calculation methods (simplified versions)
  private calculateVotingAnalytics(votes: UserBillVote[]): any {
    const support = votes.filter(v => v.position === 'support').length;
    const oppose = votes.filter(v => v.position === 'oppose').length;
    const neutral = votes.filter(v => v.position === 'neutral').length;
    
    return {
      totalVotes: votes.length,
      votesByPosition: { support, oppose, neutral },
      votesByCategory: {},
      votesByLevel: { federal: votes.length, state: 0, local: 0 },
      averageConfidence: 0.7,
      consistencyScore: 0.8
    };
  }

  private calculateFollowingAnalytics(follows: UserBillFollow[]): any {
    return {
      billsFollowed: follows.length,
      committeesFollowed: 0,
      averageFollowDuration: 14,
      mostFollowedCategory: 'healthcare' as BillCategory,
      notificationEngagement: {
        sent: 10,
        opened: 8,
        acted: 5,
        rate: 0.5
      }
    };
  }

  private calculateInteractionAnalytics(interactions: UserRepresentativeInteraction[]): any {
    return {
      totalInteractions: interactions.length,
      byType: {},
      byMethod: {},
      responseRate: 0.6,
      averageResponseTime: 48,
      satisfactionScore: 3.5,
      representativeAlignment: []
    };
  }

  private calculateImpactAnalytics(engagement: UserEngagement, votes: UserBillVote[], interactions: UserRepresentativeInteraction[]): any {
    return {
      civicScore: engagement.profile.engagementScore,
      communityRank: Math.floor(Math.random() * 1000) + 100,
      influenceMetrics: {
        billsInfluenced: Math.floor(votes.length * 0.1),
        representativesReached: new Set(interactions.map(i => i.representativeId)).size,
        communityEngagement: Math.floor(votes.length * 0.05)
      },
      achievements: engagement.profile.civicLevel.achievements,
      milestones: []
    };
  }

  private calculateTrendAnalytics(votes: UserBillVote[], follows: UserBillFollow[], interactions: UserRepresentativeInteraction[]): any {
    return {
      engagementTrend: 'increasing' as const,
      topicShifts: [],
      activityPattern: {
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        preferredTimes: ['09:00', '18:00'],
        sessionDuration: 15,
        peakEngagementPeriod: 'evening'
      },
      predictionScore: 0.75
    };
  }

  private analyzeTopicInterests(votes: UserBillVote[]): TopicInterest[] {
    // Simplified topic analysis
    return [
      {
        topic: 'Healthcare',
        category: 'healthcare' as BillCategory,
        interestLevel: 'high' as const,
        votingHistory: { totalVotes: votes.length, supportRate: 0.7 },
        lastEngagement: new Date().toISOString()
      }
    ];
  }

  private generateMockRecommendations(userId: string, topics: TopicInterest[], limit: number): any[] {
    // Mock recommendation generation
    return Array.from({ length: limit }, (_, i) => ({
      billId: `rec_${userId}_${i}`,
      relevanceScore: Math.random(),
      reason: 'Based on your voting history'
    }));
  }

  // Update methods after user actions
  private async updateEngagementAfterVote(userId: string, billId: string, position: string): Promise<void> {
    try {
      const engagement = await this.getUserEngagement(userId);
      const updatedProfile = {
        ...engagement.profile,
        totalVotes: engagement.profile.totalVotes + 1,
        lastActivityDate: new Date().toISOString(),
        engagementScore: this.calculateNewEngagementScore(engagement.profile)
      };

      await this.updateUserEngagement(userId, { profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update engagement after vote:', error);
    }
  }

  private async updateEngagementAfterFollow(userId: string, type: 'bill' | 'committee'): Promise<void> {
    try {
      const engagement = await this.getUserEngagement(userId);
      const updatedProfile = {
        ...engagement.profile,
        totalFollowedBills: type === 'bill' ? engagement.profile.totalFollowedBills + 1 : engagement.profile.totalFollowedBills,
        totalFollowedCommittees: type === 'committee' ? engagement.profile.totalFollowedCommittees + 1 : engagement.profile.totalFollowedCommittees,
        lastActivityDate: new Date().toISOString()
      };

      await this.updateUserEngagement(userId, { profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update engagement after follow:', error);
    }
  }

  private async updateEngagementAfterInteraction(userId: string): Promise<void> {
    try {
      const engagement = await this.getUserEngagement(userId);
      const updatedProfile = {
        ...engagement.profile,
        totalRepresentativeInteractions: engagement.profile.totalRepresentativeInteractions + 1,
        lastActivityDate: new Date().toISOString(),
        engagementScore: this.calculateNewEngagementScore(engagement.profile)
      };

      await this.updateUserEngagement(userId, { profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update engagement after interaction:', error);
    }
  }

  private async updateEngagementAfterVoteRemoval(userId: string, billId: string): Promise<void> {
    try {
      const engagement = await this.getUserEngagement(userId);
      const updatedProfile = {
        ...engagement.profile,
        totalVotes: Math.max(0, engagement.profile.totalVotes - 1),
        lastActivityDate: new Date().toISOString()
      };

      await this.updateUserEngagement(userId, { profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update engagement after vote removal:', error);
    }
  }

  private calculateNewEngagementScore(profile: any): number {
    // Simplified scoring algorithm
    let score = 0;
    score += profile.totalVotes * 10;
    score += profile.totalFollowedBills * 5;
    score += profile.totalFollowedCommittees * 8;
    score += profile.totalRepresentativeInteractions * 15;
    
    return Math.min(score, 1000); // Cap at 1000
  }

  private async markVoteAsContacted(userId: string, billId: string): Promise<void> {
    try {
      const votes = this.getStoredVotes(userId);
      const voteIndex = votes.findIndex(v => v.billId === billId);
      
      if (voteIndex >= 0) {
        votes[voteIndex].hasContactedRep = true;
        this.storeUserVotes(userId, votes);
      }
    } catch (error) {
      console.error('Failed to mark vote as contacted:', error);
    }
  }

  private async buildDashboardSections(userId: string, engagement: UserEngagement, analytics: EngagementAnalytics): Promise<any[]> {
    return [
      {
        id: 'recent-votes',
        type: 'recent-votes',
        title: 'Your Recent Votes',
        priority: 1,
        isVisible: true,
        data: await this.getUserVotes(userId, { limit: 5 }),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bills-following',
        type: 'bills-following',
        title: 'Bills You\'re Following',
        priority: 2,
        isVisible: true,
        data: await this.getFollowedBills(userId),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'achievements',
        type: 'achievements',
        title: 'Your Achievements',
        priority: 3,
        isVisible: true,
        data: engagement.profile.civicLevel.achievements,
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  private getDefaultDashboardPreferences(): any {
    return {
      layout: 'cards',
      sectionsPerPage: 6,
      autoRefresh: true,
      refreshInterval: 30,
      showTooltips: true,
      darkMode: false
    };
  }

  private async syncEngagementToServer(engagement: UserEngagement): Promise<void> {
    // In production, this would make an API call to sync data
    console.log('Syncing engagement to server:', engagement.userId);
  }

  private async updateVotingAnalytics(userId: string, vote: UserBillVote): Promise<void> {
    // Update voting analytics after each vote
    console.log('Updating voting analytics for:', userId, vote.billId);
  }
}

// Export singleton instance
export const engagementService = new EngagementService();