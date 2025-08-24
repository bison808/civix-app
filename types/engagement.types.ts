// Enhanced User Engagement Types for CITZN Platform

export interface UserEngagement {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  profile: UserEngagementProfile;
  preferences: EngagementPreferences;
  privacy: PrivacySettings;
}

export interface UserEngagementProfile {
  totalVotes: number;
  totalFollowedBills: number;
  totalFollowedCommittees: number;
  totalRepresentativeInteractions: number;
  firstEngagementDate: string;
  lastActivityDate: string;
  engagementScore: number;
  civicLevel: CivicLevel;
  streaks: EngagementStreaks;
  topicInterests: TopicInterest[];
  geographicInterests: GeographicScope[];
}

export interface CivicLevel {
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  nextLevelPoints: number;
  achievements: Achievement[];
}

export interface EngagementStreaks {
  currentVotingStreak: number;
  longestVotingStreak: number;
  currentActivityStreak: number;
  longestActivityStreak: number;
  lastActivityDate: string;
}

export interface TopicInterest {
  topic: string;
  category: BillCategory;
  interestLevel: 'low' | 'medium' | 'high';
  votingHistory: {
    totalVotes: number;
    supportRate: number;
  };
  lastEngagement: string;
}

export interface GeographicScope {
  level: 'federal' | 'state' | 'county' | 'municipal';
  location: string;
  interestLevel: 'low' | 'medium' | 'high';
  isUserLocation: boolean;
}

export type BillCategory = 
  | 'healthcare' 
  | 'education' 
  | 'environment' 
  | 'economy' 
  | 'defense' 
  | 'immigration' 
  | 'civil-rights' 
  | 'technology' 
  | 'infrastructure' 
  | 'social-services'
  | 'criminal-justice'
  | 'agriculture';

// User Actions & Tracking

export interface UserBillVote {
  id: string;
  userId: string;
  billId: string;
  position: 'support' | 'oppose' | 'neutral';
  confidence: 'low' | 'medium' | 'high';
  reason?: string;
  timestamp: string;
  isPublic: boolean;
  hasContactedRep: boolean;
  hasSharedBill: boolean;
  notificationsSent: string[];
}

export interface UserBillFollow {
  id: string;
  userId: string;
  billId: string;
  followType: 'watching' | 'tracking' | 'priority';
  notifications: {
    statusUpdates: boolean;
    voteScheduled: boolean;
    committeeActions: boolean;
    amendments: boolean;
  };
  startDate: string;
  lastNotified?: string;
  isActive: boolean;
}

export interface UserCommitteeFollow {
  id: string;
  userId: string;
  committeeId: string;
  committeeName: string;
  chamber: 'house' | 'senate' | 'joint';
  level: 'federal' | 'state' | 'local';
  notifications: {
    meetings: boolean;
    newBills: boolean;
    hearings: boolean;
    votes: boolean;
  };
  startDate: string;
  isActive: boolean;
}

export interface UserRepresentativeInteraction {
  id: string;
  userId: string;
  representativeId: string;
  interactionType: 'contacted' | 'responded' | 'met' | 'event';
  method?: 'phone' | 'email' | 'social' | 'in-person' | 'letter';
  billId?: string; // If interaction was about a specific bill
  subject: string;
  notes?: string;
  timestamp: string;
  responseReceived: boolean;
  responseTimestamp?: string;
  satisfaction?: 'very-unsatisfied' | 'unsatisfied' | 'neutral' | 'satisfied' | 'very-satisfied';
}

// Analytics & Insights

export interface EngagementAnalytics {
  userId: string;
  period: {
    start: string;
    end: string;
    type: 'week' | 'month' | 'quarter' | 'year';
  };
  voting: VotingAnalytics;
  following: FollowingAnalytics;
  interactions: InteractionAnalytics;
  impact: ImpactAnalytics;
  trends: TrendAnalytics;
}

export interface VotingAnalytics {
  totalVotes: number;
  votesByPosition: {
    support: number;
    oppose: number;
    neutral: number;
  };
  votesByCategory: Record<BillCategory, number>;
  votesByLevel: {
    federal: number;
    state: number;
    local: number;
  };
  averageConfidence: number;
  consistencyScore: number; // How consistent user's voting is within topics
}

export interface FollowingAnalytics {
  billsFollowed: number;
  committeesFollowed: number;
  averageFollowDuration: number; // days
  mostFollowedCategory: BillCategory;
  notificationEngagement: {
    sent: number;
    opened: number;
    acted: number;
    rate: number;
  };
}

export interface InteractionAnalytics {
  totalInteractions: number;
  byType: Record<string, number>;
  byMethod: Record<string, number>;
  responseRate: number;
  averageResponseTime: number; // hours
  satisfactionScore: number;
  representativeAlignment: RepresentativeAlignment[];
}

export interface RepresentativeAlignment {
  representativeId: string;
  representativeName: string;
  title: string;
  party: string;
  alignmentScore: number; // 0-100, based on user votes vs rep votes
  interactionCount: number;
  lastInteraction?: string;
}

export interface ImpactAnalytics {
  civicScore: number;
  communityRank: number;
  influenceMetrics: {
    billsInfluenced: number; // Bills where user's early engagement matched outcome
    representativesReached: number;
    communityEngagement: number; // Users influenced by this user's activity
  };
  achievements: Achievement[];
  milestones: Milestone[];
}

export interface TrendAnalytics {
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  topicShifts: TopicTrend[];
  activityPattern: ActivityPattern;
  predictionScore: number; // Likelihood of continued engagement
}

export interface TopicTrend {
  category: BillCategory;
  trend: 'growing' | 'stable' | 'declining';
  changePercent: number;
  timeframe: 'week' | 'month' | 'quarter';
}

export interface ActivityPattern {
  preferredDays: string[];
  preferredTimes: string[];
  sessionDuration: number;
  peakEngagementPeriod: string;
}

// Gamification & Achievements

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'voting' | 'following' | 'interaction' | 'influence' | 'consistency';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  pointsAwarded: number;
  unlockedAt: string;
  isRare: boolean;
  progress?: {
    current: number;
    required: number;
  };
}

export interface Milestone {
  id: string;
  type: 'votes' | 'bills-followed' | 'reps-contacted' | 'streak' | 'influence';
  threshold: number;
  name: string;
  description: string;
  reachedAt: string;
  celebrationShown: boolean;
}

// Preferences & Settings

export interface EngagementPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  personalization: PersonalizationPreferences;
  gamification: GamificationPreferences;
}

export interface NotificationPreferences {
  channels: ('push' | 'email' | 'sms')[];
  frequency: 'immediate' | 'daily' | 'weekly';
  billUpdates: boolean;
  committeeUpdates: boolean;
  representativeUpdates: boolean;
  achievementUpdates: boolean;
  communityUpdates: boolean;
  reminderVoting: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'community' | 'private';
  votingVisibility: 'public' | 'anonymous' | 'private';
  shareAchievements: boolean;
  shareInteractions: boolean;
  dataRetention: '1year' | '2years' | '5years' | 'indefinite';
  analyticsOptOut: boolean;
}

export interface PersonalizationPreferences {
  autoFollowBills: boolean;
  autoFollowCommittees: boolean;
  smartRecommendations: boolean;
  trendingAlerts: boolean;
  representativeMatching: boolean;
  contentFiltering: {
    hidePartisan: boolean;
    hideComplexBills: boolean;
    hideInactiveBills: boolean;
  };
}

export interface GamificationPreferences {
  showAchievements: boolean;
  showCivicScore: boolean;
  showCommunityRank: boolean;
  showStreaks: boolean;
  competitiveMode: boolean;
  celebrationAnimations: boolean;
}

export interface PrivacySettings {
  anonymousMode: boolean;
  dataSharing: {
    analytics: boolean;
    research: boolean;
    improvements: boolean;
  };
  retention: {
    votes: 'session' | '30days' | '1year' | 'indefinite';
    interactions: 'session' | '30days' | '1year' | 'indefinite';
    analytics: 'session' | '30days' | '1year' | 'indefinite';
  };
}

// Dashboard & Feeds

export interface PersonalizedDashboard {
  userId: string;
  sections: DashboardSection[];
  lastUpdated: string;
  preferences: DashboardPreferences;
}

export interface DashboardSection {
  id: string;
  type: 'bills-following' | 'recent-votes' | 'committee-updates' | 'representative-activity' | 'achievements' | 'trending' | 'recommendations';
  title: string;
  priority: number;
  isVisible: boolean;
  data: any; // Flexible data structure
  lastUpdated: string;
}

export interface DashboardPreferences {
  layout: 'compact' | 'detailed' | 'cards';
  sectionsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  showTooltips: boolean;
  darkMode: boolean;
}

export interface PersonalizedFeed {
  userId: string;
  items: FeedItem[];
  filters: FeedFilters;
  sort: FeedSort;
  lastUpdated: string;
}

export interface FeedItem {
  id: string;
  type: 'bill-update' | 'committee-meeting' | 'representative-vote' | 'achievement' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  title: string;
  summary: string;
  actionable: boolean;
  actions: FeedAction[];
  data: any;
  engagement: {
    viewed: boolean;
    clicked: boolean;
    acted: boolean;
    timestamp?: string;
  };
}

export interface FeedAction {
  type: 'vote' | 'follow' | 'contact' | 'share' | 'learn-more';
  label: string;
  url?: string;
  data?: any;
}

export interface FeedFilters {
  levels: ('federal' | 'state' | 'local')[];
  categories: BillCategory[];
  statuses: string[];
  timeframe: 'today' | 'week' | 'month' | 'all';
  priority: ('low' | 'medium' | 'high' | 'urgent')[];
  actionable: boolean;
}

export interface FeedSort {
  field: 'timestamp' | 'priority' | 'relevance' | 'engagement';
  direction: 'asc' | 'desc';
}

// API Response Types

export interface EngagementResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
  message?: string;
}

export interface BulkEngagementUpdate {
  userId: string;
  updates: {
    votes?: Partial<UserBillVote>[];
    follows?: Partial<UserBillFollow>[];
    interactions?: Partial<UserRepresentativeInteraction>[];
  };
  timestamp: string;
}