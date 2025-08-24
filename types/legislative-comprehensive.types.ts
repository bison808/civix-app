/**
 * Comprehensive Legislative Types - Agent Carlos Implementation
 * EXPANSION: Complete type system for comprehensive civic engagement platform
 * 
 * Extends basic bill tracking with full legislative ecosystem:
 * - Roll Call Votes & Voting Records
 * - Committee Data & Hearing Schedules  
 * - Legislator Profiles & Contact Information
 * - Legislative Documents & Full Texts
 * - Calendar Events & Public Hearings
 * - Advanced Search & Query Types
 */

// ========================================================================================
// VOTING RECORDS & ROLL CALL VOTES
// ========================================================================================

export interface VotingRecord {
  rollCallId: number;
  billId: string;
  billNumber: string;
  billTitle: string;
  date: string;
  description: string;
  vote: 'Yea' | 'Nay' | 'Not Voting' | 'Absent';
  passed: boolean;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  chamber: 'House' | 'Senate';
  votePercentage?: number; // Calculated from yes/total
  significance: 'Critical' | 'Important' | 'Routine';
  partyLineVote?: boolean; // Whether vote followed party lines
}

export interface RollCallSummary {
  rollCallId: number;
  billId: string;
  date: string;
  description: string;
  result: 'Passed' | 'Failed';
  margin: number; // Vote margin
  chamber: 'House' | 'Senate';
  voteBreakdown: {
    yea: number;
    nay: number;
    notVoting: number;
    absent: number;
    total: number;
  };
  partyBreakdown?: {
    [party: string]: {
      yea: number;
      nay: number;
      notVoting: number;
      absent: number;
    };
  };
  keyVotes?: Array<{
    legislatorId: number;
    legislatorName: string;
    party: string;
    vote: VotingRecord['vote'];
    notable?: string; // Why this vote was notable
  }>;
}

export interface LegislatorVotingStats {
  legislatorId: number;
  legislatorName: string;
  party: string;
  district: string;
  votingPeriod: {
    startDate: string;
    endDate: string;
  };
  totalVotes: number;
  voteBreakdown: {
    yea: number;
    nay: number;
    notVoting: number;
    absent: number;
  };
  attendanceRate: number; // Percentage of votes participated in
  partyLoyaltyScore: number; // Percentage voting with party
  bipartisanScore: number; // Percentage voting across party lines
  significantVotes: VotingRecord[]; // Key votes on important legislation
  votesByTopic: Array<{
    topic: string;
    totalVotes: number;
    voteDistribution: { yea: number; nay: number; other: number };
  }>;
}

// ========================================================================================
// COMMITTEE DATA & STRUCTURES
// ========================================================================================

export interface CommitteeInfo {
  id: number;
  name: string;
  fullName?: string;
  chamber: 'House' | 'Senate';
  jurisdiction: string[]; // Policy areas committee handles
  url?: string;
  description?: string;
  meetingSchedule?: {
    regularDays: string[]; // e.g., ['Monday', 'Wednesday']
    regularTime?: string;
    location?: string;
  };
  members: Array<{
    peopleId: number;
    name: string;
    party: string;
    role: 'Chair' | 'Vice Chair' | 'Ranking Member' | 'Member';
    district?: string;
    tenure?: number; // Years on committee
    subcommittees?: string[];
  }>;
  subcommittees?: Array<{
    id: number;
    name: string;
    chair: string;
    jurisdiction: string[];
  }>;
  currentBills: string[]; // Bill IDs under committee review
  recentActions: Array<{
    date: string;
    action: string;
    billId?: string;
    description: string;
  }>;
  statistics: {
    billsConsidered: number;
    billsReported: number;
    averageMarkupTime: number; // Days from referral to markup
    successRate: number; // Percentage of bills that advance
  };
}

export interface CommitteeHearing {
  id: string;
  committeeId: number;
  committeeName: string;
  date: string;
  time: string;
  location: string;
  type: 'Markup' | 'Hearing' | 'Business Meeting' | 'Field Hearing';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  agenda: Array<{
    item: string;
    billId?: string;
    billNumber?: string;
    description: string;
    expectedDuration?: number; // Minutes
  }>;
  witnesses?: Array<{
    name: string;
    title: string;
    organization: string;
    type: 'Government' | 'Private Sector' | 'Academic' | 'Advocacy' | 'Public';
    testimony?: string; // Link to written testimony
  }>;
  documents?: Array<{
    title: string;
    url: string;
    type: 'Agenda' | 'Testimony' | 'Analysis' | 'Amendment';
  }>;
  liveStream?: {
    available: boolean;
    url?: string;
    archiveUrl?: string;
  };
  publicComment?: {
    allowed: boolean;
    registrationRequired: boolean;
    deadline?: string;
    instructions?: string;
  };
}

// ========================================================================================
// LEGISLATOR PROFILES & INFORMATION
// ========================================================================================

export interface LegislatorProfile {
  peopleId: number;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nickname?: string;
  party: string;
  role: string; // Representative, Senator, etc.
  district: string;
  state: string;
  imageUrl?: string;
  biography?: string;
  electedDate?: string;
  termEnd?: string;
  contact: {
    capitalOffice?: {
      phone?: string;
      fax?: string;
      address?: string;
      room?: string;
    };
    districtOffices?: Array<{
      city: string;
      phone?: string;
      address?: string;
      hours?: string;
    }>;
    email?: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  externalIds: {
    voteSmartId?: number;
    openSecretsId?: string;
    ballotpediaSlug?: string;
    fecId?: string;
  };
  committees: Array<{
    committeeId: number;
    committeeName: string;
    role: string;
    ranking?: number; // Seniority ranking
  }>;
  leadership?: Array<{
    title: string;
    organization: string;
    startDate?: string;
    endDate?: string;
  }>;
  caucuses?: string[]; // Caucus memberships
  votingRecord?: LegislatorVotingStats;
  sponsoredBills: string[]; // Bill IDs
  cosponsoredBills: string[]; // Bill IDs
  legislativeInterests: string[]; // Policy areas of focus
  performance: {
    billsSponsored: number;
    billsPassed: number;
    amendmentsOffered: number;
    successRate: number;
    bipartisanSupport: number; // Percentage of bills with bipartisan cosponsors
  };
}

export interface LegislatorConnectionToUser {
  legislator: LegislatorProfile;
  connectionType: 'Direct Representative' | 'State Representative' | 'Committee Chair' | 'Issue Advocate';
  relevanceScore: number; // 0-100 based on user's interests and location
  whyRelevant: string; // Explanation of connection
  recentActivity: Array<{
    date: string;
    action: string;
    billId?: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
  }>;
}

// ========================================================================================
// LEGISLATIVE DOCUMENTS & FULL TEXTS
// ========================================================================================

export interface LegislativeDocument {
  id: number; // Added for component compatibility
  docId: number;
  billId: string;
  documentType: 'Bill Text' | 'Amendment' | 'Analysis' | 'Fiscal Note' | 'Committee Report' | 'Floor Summary' | 'Veto Message' | 'Enrolled Bill';
  type: 'Bill Text' | 'Amendment' | 'Analysis' | 'Fiscal Note' | 'Committee Report' | 'Floor Summary' | 'Veto Message' | 'Enrolled Bill'; // Alias for documentType
  version?: string; // Introduced, Amended, Engrossed, etc.
  date: string;
  title: string;
  description?: string;
  mimeType: string;
  size: number; // Alias for fileSize
  fileSize: number;
  url: string;
  stateUrl?: string;
  downloadable: boolean;
  searchable: boolean;
  excerpt?: string; // First 500 characters of text
  pages?: number; // Number of pages in document
  summary?: string; // Document summary
  language: string; // Document language
  format?: string; // Document format (pdf, html, etc)
  metadata: {
    author?: string;
    source: string;
    language: string;
    encoding?: string;
    checksum?: string;
  };
  access: {
    public: boolean;
    requiresAuthentication: boolean;
    restrictedReason?: string;
  };
}

export interface BillTextVersion {
  versionId: string;
  version: 'Introduced' | 'Amended' | 'Committee Substitute' | 'Engrossed' | 'Enrolled' | 'Chaptered';
  date: string;
  chamber: 'House' | 'Senate' | 'Both';
  status: 'Current' | 'Superseded' | 'Historical';
  changes?: Array<{
    type: 'Added' | 'Deleted' | 'Modified';
    section: string;
    description: string;
    lineNumber?: number;
  }>;
  fullText?: string;
  summary?: string;
  significantChanges?: string[];
  download: {
    pdf: string;
    html: string;
    txt?: string;
  };
}

export interface DocumentAnalysis {
  documentId: number;
  analysisType: 'Policy Analysis' | 'Fiscal Impact' | 'Legal Analysis' | 'Stakeholder Impact' | 'Implementation Analysis';
  analyzedBy: string; // Organization or individual
  date: string;
  keyFindings: string[];
  recommendations?: string[];
  impactAssessment: {
    fiscal?: {
      cost: number | string;
      revenue?: number | string;
      budgetImpact: 'Positive' | 'Negative' | 'Neutral';
      timeline: string;
    };
    stakeholders?: Array<{
      group: string;
      impact: 'Positive' | 'Negative' | 'Mixed' | 'Neutral';
      description: string;
    }>;
    implementation?: {
      complexity: 'Low' | 'Medium' | 'High';
      timeline: string;
      requirements: string[];
      challenges: string[];
    };
  };
  fullAnalysisUrl?: string;
}

// ========================================================================================
// CALENDAR EVENTS & HEARINGS
// ========================================================================================

export interface LegislativeCalendarEvent {
  eventId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'Committee Hearing' | 'Floor Vote' | 'Public Hearing' | 'Markup Session' | 'Joint Session' | 'Special Event';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed';
  title: string;
  description: string;
  chamber?: 'House' | 'Senate' | 'Both';
  location: {
    room: string;
    building?: string;
    address?: string;
    virtualLink?: string;
  };
  committee?: {
    id: number;
    name: string;
    chair: string;
  };
  bills: Array<{
    billId: string;
    billNumber: string;
    title: string;
    action: 'Hearing' | 'Markup' | 'Vote' | 'Discussion';
    priority: 'High' | 'Medium' | 'Low';
  }>;
  participants?: Array<{
    name: string;
    role: 'Chair' | 'Member' | 'Witness' | 'Staff' | 'Public';
    party?: string;
    organization?: string;
  }>;
  witnesses?: Array<{
    name: string;
    title: string;
    organization: string;
    type: 'Government' | 'Private Sector' | 'Academic' | 'Advocacy' | 'Public';
    testimony?: string; // Link to written testimony
  }>;
  publicAccess: {
    openToPublic: boolean;
    registrationRequired: boolean;
    broadcastAvailable: boolean;
    streamUrl?: string;
    archiveUrl?: string;
    webcastUrl?: string; // Alternative webcast URL
  };
  documents?: Array<{
    title: string;
    type: string;
    url: string;
    releaseDate: string;
  }>;
  relatedEvents?: string[]; // IDs of related calendar events
}

export interface PersonalizedCalendar {
  userId: string;
  events: LegislativeCalendarEvent[];
  filters: {
    followedCommittees: number[];
    interestedBills: string[];
    trackedLegislators: number[];
    policyAreas: string[];
    eventTypes: LegislativeCalendarEvent['type'][];
  };
  notifications: {
    enabled: boolean;
    advanceNotice: number; // Days before event
    notificationTypes: ('Email' | 'SMS' | 'Push' | 'Browser')[];
  };
  upcomingHighlights: Array<{
    event: LegislativeCalendarEvent;
    whyRelevant: string;
    relevanceScore: number;
    actionSuggestions: string[];
  }>;
}

// ========================================================================================
// ADVANCED SEARCH & QUERY TYPES
// ========================================================================================

export interface AdvancedSearchOptions {
  query: string;
  searchOperators?: {
    type: 'AND' | 'OR' | 'NOT' | 'ADJ' | 'PHRASE';
    terms: string[];
  }[];
  filters: {
    state?: string;
    years?: number[];
    chambers?: ('House' | 'Senate')[];
    billTypes?: string[];
    statuses?: string[];
    subjects?: string[];
    sponsors?: string[];
    committees?: number[];
    dateRange?: {
      start: string;
      end: string;
      type: 'Introduced' | 'Last Action' | 'Signed' | 'Any';
    };
  };
  pagination: {
    page: number;
    pageSize: number;
    sortBy?: 'Relevance' | 'Date' | 'Title' | 'Status';
    sortOrder?: 'Ascending' | 'Descending';
  };
  includeContent?: {
    billText: boolean;
    amendments: boolean;
    analyses: boolean;
    votes: boolean;
    documents: boolean;
  };
}

export interface SearchResult {
  resultId: string;
  relevanceScore: number;
  matchType: 'Title' | 'Summary' | 'Full Text' | 'Amendment' | 'Analysis';
  bill: {
    id: string;
    number: string;
    title: string;
    summary: string;
    status: string;
    lastAction: string;
  };
  highlights?: Array<{
    field: string;
    text: string;
    matchedTerms: string[];
  }>;
  context?: string; // Surrounding text where match was found
}

export interface SearchResults {
  query: string;
  executionTime: number; // Milliseconds
  total: number;
  page: number;
  pageSize: number;
  results: SearchResult[];
  facets?: {
    statuses: Array<{ value: string; count: number }>;
    subjects: Array<{ value: string; count: number }>;
    years: Array<{ value: number; count: number }>;
    sponsors: Array<{ value: string; count: number }>;
    committees: Array<{ value: string; count: number }>;
  };
  suggestedSearches?: string[];
  relatedQueries?: string[];
}

export interface SavedSearch {
  searchId: string;
  userId: string;
  name: string;
  description?: string;
  query: AdvancedSearchOptions;
  createdDate: string;
  lastRunDate?: string;
  resultCount?: number;
  notifications: {
    enabled: boolean;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'When New Results';
    email?: string;
  };
  tags?: string[];
  isPublic?: boolean;
}

// ========================================================================================
// COMPREHENSIVE CIVIC ENGAGEMENT FEATURES
// ========================================================================================

export interface CivicEngagementAction {
  actionId: string;
  type: 'Contact Representative' | 'Attend Hearing' | 'Submit Comment' | 'Register to Vote' | 'Join Caucus' | 'Follow Bill';
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRequired: number; // Minutes
  impact: 'Low' | 'Medium' | 'High';
  deadline?: string;
  instructions: string[];
  requiredInfo?: string[];
  contacts?: Array<{
    type: 'Phone' | 'Email' | 'Website' | 'Address';
    value: string;
    label: string;
  }>;
  relatedBill?: string;
  relatedCommittee?: number;
  relatedLegislator?: number;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  completedDate?: string;
  userNotes?: string;
}

export interface UserLegislativeProfile {
  userId: string;
  location: {
    zipCode: string;
    district: string;
    state: string;
    county?: string;
  };
  representatives: {
    federal: number[];
    state: number[];
    local: number[];
  };
  interests: {
    policyAreas: string[];
    committees: number[];
    issues: string[];
    bills: string[];
  };
  engagement: {
    level: 'Passive' | 'Active' | 'Advocate';
    actionsCompleted: number;
    hearingsAttended: number;
    billsFollowed: number;
    contactsMade: number;
  };
  notifications: {
    billUpdates: boolean;
    hearingAlerts: boolean;
    voteAlerts: boolean;
    representativeNews: boolean;
    frequency: 'Immediate' | 'Daily' | 'Weekly';
    channels: ('Email' | 'SMS' | 'Push')[];
  };
  preferences: {
    complexity: 'Simple' | 'Detailed' | 'Expert';
    language: string;
    accessibility: {
      screenReader: boolean;
      largeText: boolean;
      highContrast: boolean;
    };
  };
}

// ========================================================================================
// INTEGRATION TYPES - Connecting to existing system
// ========================================================================================

import { Bill } from './bills.types';
import { Representative } from './representatives.types';

export interface ComprehensiveBill extends Bill {
  rollCallVotes?: RollCallSummary[];
  committeeActivity?: Array<{
    committeeId: number;
    committeeName: string;
    action: string;
    date: string;
    status: string;
  }>;
  documents?: LegislativeDocument[];
  textVersions?: BillTextVersion[];
  analyses?: DocumentAnalysis[];
  stakeholderPositions?: Array<{
    organization: string;
    position: 'Support' | 'Oppose' | 'Neutral' | 'Amend';
    statement?: string;
    date: string;
  }>;
  mediaAttention?: Array<{
    source: string;
    title: string;
    url: string;
    date: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
  }>;
  userActions?: CivicEngagementAction[];
}

export interface EnhancedRepresentative extends Representative {
  legislatorProfile?: LegislatorProfile;
  votingRecord?: LegislatorVotingStats;
  committees?: CommitteeInfo[];
  upcomingEvents?: LegislativeCalendarEvent[];
  recentActivity?: Array<{
    date: string;
    type: 'Bill' | 'Vote' | 'Committee' | 'Statement';
    description: string;
    billId?: string;
    significance: 'High' | 'Medium' | 'Low';
  }>;
  connectionToUser?: LegislatorConnectionToUser;
}

// ========================================================================================
// API RESPONSE TYPES
// ========================================================================================

export interface ComprehensiveApiResponse<T> {
  data: T;
  metadata: {
    requestId: string;
    timestamp: string;
    source: 'LegiScan' | 'Cache' | 'Fallback';
    responseTime: number;
    rateLimit?: {
      remaining: number;
      reset: string;
    };
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  warnings?: string[];
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

// ========================================================================================
// EXPORT ALL TYPES
// ========================================================================================

// Re-export existing types for convenience
export type { Bill, BillStatus, BillSponsor } from './bills.types';
export type { Representative } from './representatives.types';

// Export comprehensive legislative types
export * from './bills.types';
export * from './representatives.types';