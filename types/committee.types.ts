export interface Committee {
  id: string;
  name: string;
  abbreviation?: string;
  chamber: 'House' | 'Senate' | 'Joint';
  jurisdiction: string;
  description?: string;
  isActive: boolean;
  establishedDate?: string;
  parentCommittee?: string; // For subcommittees
  subcommittees?: string[]; // Committee IDs of subcommittees
  website?: string;
  phone?: string;
  level: 'federal' | 'state' | 'county' | 'municipal';
  
  // Leadership
  chair?: CommitteeMember;
  vicChair?: CommitteeMember;
  rankingMember?: CommitteeMember;
  
  // Membership
  members: CommitteeMember[];
  memberCount: number;
  
  // Activity tracking
  meetingsThisYear?: number;
  billsConsidered?: number;
  lastMeetingDate?: string;
  nextMeetingDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeMember {
  representativeId: string;
  name: string;
  party: 'Democrat' | 'Republican' | 'Independent' | 'Other';
  state: string;
  district?: string;
  role: 'Chair' | 'Vice Chair' | 'Ranking Member' | 'Member';
  seniority?: number; // Years on committee
  joinedDate?: string;
  isVoting: boolean;
}

export interface CommitteeMeeting {
  id: string;
  eventId: string;
  committeeId: string;
  committeeName: string;
  
  // Meeting Details
  title: string;
  type: 'Hearing' | 'Meeting' | 'Markup' | 'Business Meeting';
  status: 'Scheduled' | 'Canceled' | 'Postponed' | 'Completed' | 'In Progress';
  date: string;
  time?: string;
  duration?: number; // minutes
  location: string;
  isPublic: boolean;
  
  // Content
  description?: string;
  agenda?: CommitteeAgendaItem[];
  witnesses?: CommitteeWitness[];
  bills?: string[]; // Bill IDs being considered
  
  // Documentation
  documents?: CommitteeDocument[];
  transcript?: string;
  recording?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CommitteeAgendaItem {
  id: string;
  order: number;
  title: string;
  description?: string;
  billId?: string;
  estimatedDuration?: number; // minutes
  type: 'Bill Discussion' | 'Hearing' | 'Administrative' | 'Vote' | 'Other';
}

export interface CommitteeWitness {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  testimony?: string;
  writtenStatement?: string;
  biography?: string;
  expertise: string[];
}

export interface CommitteeDocument {
  id: string;
  title: string;
  type: 'Report' | 'Transcript' | 'Statement' | 'Amendment' | 'Other';
  url: string;
  size?: number;
  uploadDate: string;
  author?: string;
}

export interface CommitteeVote {
  id: string;
  committeeId: string;
  meetingId: string;
  billId?: string;
  description: string;
  date: string;
  outcome: 'Passed' | 'Failed' | 'Postponed' | 'Withdrawn';
  
  // Vote breakdown
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  presentVotes: number;
  
  // Member votes
  memberVotes: CommitteeMemberVote[];
}

export interface CommitteeMemberVote {
  representativeId: string;
  name: string;
  vote: 'Yes' | 'No' | 'Present' | 'Not Voting' | 'Absent';
  note?: string;
}

export interface CommitteeFilter {
  chamber?: 'House' | 'Senate' | 'Joint' | 'All';
  level?: 'federal' | 'state' | 'county' | 'municipal' | 'All';
  jurisdiction?: string;
  hasUserRep?: boolean; // Only committees with user's representatives
  isActive?: boolean;
  searchTerm?: string;
}

export interface CommitteeListResponse {
  committees: Committee[];
  total: number;
  page: number;
  pageSize: number;
  filters?: CommitteeFilter;
}

export interface UserCommitteeInterest {
  committeeId: string;
  committeeName: string;
  reason: 'Representative Member' | 'Bill Interest' | 'User Subscribed';
  representativeId?: string; // If reason is 'Representative Member'
  billId?: string; // If reason is 'Bill Interest'
  subscriptionDate: string;
  isNotificationEnabled: boolean;
}

export interface CommitteeActivity {
  id: string;
  committeeId: string;
  committeeName: string;
  type: 'Meeting Scheduled' | 'Bill Referred' | 'Vote Held' | 'Report Released';
  title: string;
  description: string;
  date: string;
  relatedBillId?: string;
  relatedMeetingId?: string;
  importance: 'Low' | 'Medium' | 'High';
}

export interface CommitteeStats {
  totalCommittees: number;
  userRelevantCommittees: number;
  upcomingMeetings: number;
  recentActivity: number;
  billsInCommittee: number;
  representativesOnCommittees: number;
}

export interface CommitteeSchedule {
  committeeId: string;
  committeeName: string;
  upcomingMeetings: CommitteeMeeting[];
  regularMeetingSchedule?: {
    dayOfWeek: string;
    time: string;
    frequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'As Needed';
  };
}