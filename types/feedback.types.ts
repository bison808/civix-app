export interface Feedback {
  id: string;
  userId: string;
  billId?: string;
  representativeId?: string;
  type: FeedbackType;
  category: FeedbackCategory;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  location?: {
    zipCode: string;
    district?: string;
    state?: string;
  };
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  responses?: FeedbackResponse[];
  votes?: FeedbackVote[];
  aggregationId?: string;
}

export type FeedbackType = 'bill' | 'representative' | 'issue' | 'general' | 'suggestion';
export type FeedbackCategory = 'support' | 'oppose' | 'question' | 'concern' | 'suggestion' | 'complaint' | 'praise';
export type FeedbackStatus = 'pending' | 'reviewed' | 'acknowledged' | 'responded' | 'resolved' | 'archived';

export interface FeedbackResponse {
  id: string;
  responderId: string;
  responderName: string;
  responderRole: string;
  content: string;
  createdAt: string;
}

export interface FeedbackVote {
  userId: string;
  voteType: 'up' | 'down';
  createdAt: string;
}

export interface FeedbackSubmission {
  type: FeedbackType;
  category: FeedbackCategory;
  content: string;
  billId?: string;
  representativeId?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface FeedbackAggregation {
  id: string;
  topic: string;
  billId?: string;
  representativeId?: string;
  period: {
    start: string;
    end: string;
  };
  totalFeedback: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categoryBreakdown: Record<FeedbackCategory, number>;
  topKeywords: KeywordFrequency[];
  demographicBreakdown?: DemographicBreakdown;
  trendData?: TrendPoint[];
  insights?: string[];
  generatedAt: string;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface DemographicBreakdown {
  byDistrict: Record<string, number>;
  byState: Record<string, number>;
  byZipCode?: Record<string, number>;
}

export interface TrendPoint {
  date: string;
  count: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface FeedbackFilter {
  type?: FeedbackType;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  billId?: string;
  representativeId?: string;
  userId?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  sortBy?: 'date' | 'votes' | 'urgency';
  page?: number;
  limit?: number;
}

export interface FeedbackResponse {
  feedback: Feedback[];
  total: number;
  page: number;
  pageSize: number;
  aggregations?: FeedbackAggregation[];
}

export interface FeedbackStats {
  totalFeedback: number;
  todaysFeedback: number;
  weeklyTrend: number;
  averageSentiment: number;
  topIssues: { issue: string; count: number }[];
  responseRate: number;
  averageResponseTime: number;
}