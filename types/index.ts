export * from './auth.types';
export * from './representatives.types';
export * from './bills.types';
export * from './feedback.types';
export * from './districts.types';
export * from './california-state.types';
export * from './county.types';
export * from './engagement.types';
export type { 
  CommitteeMember, 
  CommitteeMeeting, 
  CommitteeAgendaItem,
  CommitteeWitness,
  CommitteeDocument,
  CommitteeVote,
  CommitteeMemberVote,
  CommitteeFilter,
  CommitteeListResponse,
  CommitteeActivity,
  CommitteeStats,
  CommitteeSchedule
} from './committee.types';

export interface PersonalImpact {
  category: 'financial' | 'healthcare' | 'education' | 'environment' | 'safety' | 'rights';
  description: string;
  effect: 'positive' | 'negative' | 'neutral';
  magnitude: 'high' | 'medium' | 'low';
  timeframe: string;
}

export interface NotificationPrefs {
  newBills: boolean;
  voteReminders: boolean;
  repUpdates: boolean;
  impactAlerts: boolean;
  method: ('push' | 'email' | 'sms')[];
}

export interface VoteRecord {
  billId: string;
  vote: 'like' | 'dislike';
  comment?: string;
  timestamp: string;
}

export interface FilterOptions {
  location: 'all' | 'federal' | 'state' | 'local';
  topics: string[];
  impact: 'all' | 'high' | 'medium' | 'low';
  status: string[];
  sortBy: 'relevance' | 'date' | 'popularity';
}