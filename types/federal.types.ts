/**
 * Federal Representatives Enhanced Types
 * Extends base Representative interface with federal-specific data
 */

import { Representative, VotingRecord, Committee, IssueScore } from './representatives.types';

// Additional federal-specific interfaces
export interface CommitteeMembership {
  committeeId: string;
  committeeName: string;
  role: 'Chair' | 'Ranking Member' | 'Member' | 'Vice Chair';
  chamber: 'House' | 'Senate' | 'Joint';
  jurisdiction: string[];
  website?: string;
  startDate: string;
  endDate?: string;
  isSubcommittee: boolean;
  parentCommittee?: string;
}

// Enhanced federal representative with additional congressional data
export interface FederalRepresentative extends Representative {
  bioguideId: string; // Official bioguide ID from Congress
  thomasId?: string; // Legacy Thomas ID
  govtrackId?: number; // GovTrack.us ID
  opensecretId?: string; // OpenSecrets.org ID
  cspanId?: number; // C-SPAN Video Library ID
  
  // Extended committee information
  committeeMemberships: EnhancedCommittee[];
  subcommitteeMemberships: SubcommitteeAssignment[];
  leadershipPositions: LeadershipPosition[];
  
  // Voting and legislative data
  votingRecord: EnhancedVotingRecord;
  billsSponsored: BillSummary[];
  billsCosponsored: BillSummary[];
  recentVotes: Vote[];
  
  // Congressional session info
  seniorityRank?: number;
  classYear?: string; // For senators: Class I, II, or III
  nextElection: string;
  
  // Enhanced contact info
  capitalOffice: CapitalOfficeInfo;
  stateOffices: StateOfficeInfo[];
  
  // Performance metrics
  attendanceRate: number; // Percentage of votes attended
  bipartisanScore?: number; // How often votes with other party
  effectivenessScore?: number; // Legislative effectiveness
  
  // Recent activity
  recentStatements: Statement[];
  recentPressReleases: PressRelease[];
  lastUpdated: string;
}

export interface EnhancedCommittee extends Committee {
  fullName: string;
  jurisdiction: string[];
  website?: string;
  majority?: boolean; // Is representative in majority party on this committee?
  rankingMember?: boolean;
}

export interface SubcommitteeAssignment {
  id: string;
  name: string;
  parentCommittee: string;
  role: 'Chair' | 'Ranking Member' | 'Member';
  jurisdiction: string[];
}

export interface LeadershipPosition {
  position: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface EnhancedVotingRecord extends VotingRecord {
  partyUnityScore: number; // How often votes with party
  bipartisanVotes: number;
  keyVotes: KeyVote[];
  votesByCategory: VoteCategory[];
  currentSession: {
    congress: number;
    session: number;
    votesThisSession: number;
    attendance: number;
  };
}

export interface KeyVote {
  voteId: string;
  date: string;
  description: string;
  bill?: {
    id: string;
    number: string;
    title: string;
  };
  position: 'Yes' | 'No' | 'Present' | 'Not Voting';
  partyPosition: 'Yes' | 'No' | 'Split';
  result: 'Passed' | 'Failed';
  margin: string;
  significance: 'High' | 'Medium' | 'Low';
}

export interface VoteCategory {
  category: string;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  examples: string[];
}

export interface BillSummary {
  id: string;
  billNumber: string;
  title: string;
  shortTitle?: string;
  introducedDate: string;
  latestActionDate: string;
  latestAction: string;
  status: 'Introduced' | 'Committee' | 'House' | 'Senate' | 'Conference' | 'Presidential' | 'Law' | 'Vetoed' | 'Failed';
  chamber: 'House' | 'Senate';
  primarySubject: string;
  cosponsors?: number;
  relatedBills?: string[];
  summary?: string;
}

export interface Vote {
  voteId: string;
  date: string;
  time: string;
  chamber: 'House' | 'Senate';
  session: number;
  rollCall: number;
  question: string;
  description: string;
  voteType: 'Yea-Nay' | 'Voice' | 'Recorded';
  result: 'Passed' | 'Failed' | 'Agreed to' | 'Rejected';
  
  // Vote totals
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  presentVotes: number;
  notVoting: number;
  
  // Representative's vote
  position: 'Yes' | 'No' | 'Present' | 'Not Voting';
  
  // Context
  bill?: {
    id: string;
    number: string;
    title: string;
  };
  amendment?: {
    id: string;
    number: string;
    description: string;
  };
  
  // Significance
  isKeyVote: boolean;
  partyLineVote: boolean;
  bipartisanSupport: boolean;
}

export interface CapitalOfficeInfo {
  building: string;
  room: string;
  address: string;
  phone: string;
  fax?: string;
  hours: string;
  appointments: boolean;
}

export interface StateOfficeInfo {
  city: string;
  address: string;
  phone: string;
  fax?: string;
  hours: string;
  appointments: boolean;
  servesCounties: string[];
}

export interface Statement {
  id: string;
  date: string;
  title: string;
  summary: string;
  fullText?: string;
  type: 'Floor Statement' | 'Press Statement' | 'Committee Statement' | 'Social Media';
  relatedBill?: string;
  topics: string[];
  url?: string;
}

export interface PressRelease {
  id: string;
  date: string;
  title: string;
  summary: string;
  fullText?: string;
  topics: string[];
  url: string;
}

// API response types for external services
export interface ProPublicaApiResponse {
  status: string;
  copyright: string;
  results: any[];
}

export interface CongressApiResponse {
  members?: CongressMember[];
  votes?: CongressVote[];
  bills?: CongressBill[];
}

export interface CongressMember {
  bioguideId: string;
  name: {
    first: string;
    last: string;
    middle?: string;
    suffix?: string;
  };
  party: string;
  state: string;
  district?: string;
  chamber: string;
  title: string;
  shortTitle: string;
  apiUri: string;
  phone: string;
  fax?: string;
  website: string;
  contactForm?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  
  // Office locations
  office: string;
  
  // Term info
  nextElection: string;
  termStart: string;
  termEnd: string;
  seniorityRank?: number;
  
  // Voting stats
  totalVotes: number;
  missedVotes: number;
  totalPresent: number;
  
  // Effectiveness metrics
  billsSponsoredThisSession: number;
  billsCosponsoredThisSession: number;
  committees: string[];
  subcommittees: string[];
}

export interface CongressVote {
  congress: number;
  chamber: string;
  session: number;
  rollCall: number;
  source: string;
  url: string;
  voteUri: string;
  bill?: {
    billId: string;
    number: string;
    title: string;
    latestAction: string;
  };
  amendment?: {
    number: string;
    description: string;
  };
  question: string;
  questionText: string;
  description: string;
  voteType: string;
  date: string;
  time: string;
  result: string;
  democratic: {
    yes: number;
    no: number;
    present: number;
    notVoting: number;
    majority_position: string;
  };
  republican: {
    yes: number;
    no: number;
    present: number;
    notVoting: number;
    majority_position: string;
  };
  independent: {
    yes: number;
    no: number;
    present: number;
    notVoting: number;
  };
  total: {
    yes: number;
    no: number;
    present: number;
    notVoting: number;
  };
  positions: VotePosition[];
}

export interface VotePosition {
  memberId: string;
  name: string;
  party: string;
  state: string;
  district?: string;
  votePosition: string;
}

export interface CongressBill {
  billId: string;
  billType: string;
  number: string;
  billUri: string;
  title: string;
  shortTitle?: string;
  sponsorTitle: string;
  sponsorId: string;
  sponsorName: string;
  sponsorState: string;
  sponsorParty: string;
  sponsorUri: string;
  gpoPdfUri?: string;
  congressdotgovUrl: string;
  introducedDate: string;
  activeBill: boolean;
  lastVote?: string;
  house_passage?: string;
  senate_passage?: string;
  enacted?: string;
  vetoed?: string;
  cosponsors: number;
  cosponsorsByParty: {
    D: number;
    R: number;
    I: number;
  };
  committees: string;
  committeesCodes: string[];
  subcommittee_codes: string[];
  primary_subject: string;
  summary?: string;
  summary_short?: string;
  latest_major_action_date: string;
  latest_major_action: string;
}

// Service configuration
export interface FederalRepresentativesConfig {
  propublicaApiKey?: string;
  congressApiKey?: string;
  govtrackApiUrl: string;
  cacheExpiration: number;
  enableRealTimeUpdates: boolean;
  updateInterval: number;
}

// Search and filter types
export interface FederalRepresentativeFilter {
  state?: string;
  district?: string;
  chamber?: 'House' | 'Senate';
  party?: string;
  committee?: string;
  leadership?: boolean;
  seniorityMin?: number;
  effectivenessMin?: number;
  searchTerm?: string;
}

export interface FederalRepresentativesSearchResult {
  representatives: FederalRepresentative[];
  total: number;
  page: number;
  pageSize: number;
  filters: FederalRepresentativeFilter;
}

// Bulk data types for batch operations
export interface BulkRepresentativeData {
  congress: number;
  session: number;
  lastUpdated: string;
  senators: FederalRepresentative[];
  houseMembers: FederalRepresentative[];
  totalMembers: number;
  partyBreakdown: {
    senate: { D: number; R: number; I: number };
    house: { D: number; R: number; I: number };
  };
}

// California-specific types
export interface CaliforniaFederalDelegation {
  senators: FederalRepresentative[];
  houseMembers: FederalRepresentative[];
  totalDistricts: number;
  partyBreakdown: {
    senate: { D: number; R: number; I: number };
    house: { D: number; R: number; I: number };
  };
  lastUpdated: string;
}

// Error types
export type FederalDataError = 
  | 'API_KEY_MISSING'
  | 'API_RATE_LIMITED' 
  | 'MEMBER_NOT_FOUND'
  | 'INVALID_CONGRESS'
  | 'NETWORK_ERROR'
  | 'DATA_PARSE_ERROR'
  | 'CACHE_ERROR';

export interface FederalDataErrorResponse {
  error: FederalDataError;
  message: string;
  memberId?: string;
  congress?: number;
  retryAfter?: number;
}