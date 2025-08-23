import { Representative, Committee, OfficeLocation, VotingRecord } from './representatives.types';

export interface StateRepresentative extends Representative {
  legislativeId: string;
  district: number;
  chamber: 'assembly' | 'senate' | 'executive';
  leadership: string | null;
  committees: StateCommittee[];
  billsAuthored: StateBill[];
  votingRecord: StateVotingRecord;
  districtOffices: OfficeLocation[];
  sessionYear: string;
  capitolRoom?: string;
  capitolPhone?: string;
  website?: string;
}

export interface StateCommittee extends Committee {
  type: 'standing' | 'select' | 'joint' | 'subcommittee';
  chamber: 'assembly' | 'senate' | 'joint';
  description?: string;
  meetingSchedule?: string;
}

export interface StateBill {
  id: string;
  billNumber: string;
  title: string;
  summary: string;
  status: StateBillStatus;
  introducedDate: string;
  lastActionDate: string;
  chamber: 'assembly' | 'senate';
  url: string;
  authors: string[];
  coauthors?: string[];
  subjects: string[];
  votes?: BillVote[];
}

export interface StateBillStatus {
  stage: 'introduced' | 'committee' | 'floor' | 'passed' | 'signed' | 'vetoed' | 'failed';
  description: string;
  date: string;
}

export interface BillVote {
  date: string;
  chamber: 'assembly' | 'senate';
  motion: string;
  result: 'passed' | 'failed';
  yesCount: number;
  noCount: number;
  abstainCount: number;
  notVotingCount: number;
  votes: IndividualVote[];
}

export interface IndividualVote {
  legislatorId: string;
  name: string;
  vote: 'yes' | 'no' | 'abstain' | 'not_voting';
}

export interface StateVotingRecord extends VotingRecord {
  sessionYear: string;
  partyUnityScore: number;
  bipartisanScore: number;
  keyVotes: KeyVote[];
}

export interface KeyVote {
  billId: string;
  billNumber: string;
  title: string;
  vote: 'yes' | 'no' | 'abstain' | 'not_voting';
  date: string;
  importance: 'high' | 'medium' | 'low';
}

export interface DistrictBoundary {
  district: number;
  chamber: 'assembly' | 'senate';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    name: string;
    population: number;
    demographics?: DistrictDemographics;
  };
}

export interface DistrictDemographics {
  totalPopulation: number;
  ageGroups: Record<string, number>;
  ethnicityBreakdown: Record<string, number>;
  incomeMedian: number;
  educationLevels: Record<string, number>;
}

export interface CaliforniaExecutive {
  id: string;
  name: string;
  title: 'Governor' | 'Lieutenant Governor';
  party: 'Democrat' | 'Republican' | 'Independent' | 'Other';
  termStart: string;
  termEnd: string;
  photoUrl?: string;
  biography: string;
  contactInfo: {
    phone: string;
    email?: string;
    website: string;
    mailingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  accomplishments: Accomplishment[];
  executiveOrders?: ExecutiveOrder[];
}

export interface Accomplishment {
  title: string;
  description: string;
  date: string;
  category: 'policy' | 'appointment' | 'legislation' | 'initiative';
}

export interface ExecutiveOrder {
  number: string;
  title: string;
  summary: string;
  signedDate: string;
  effectiveDate?: string;
  url: string;
  subjects: string[];
}

export interface LegislativeSession {
  year: string;
  type: 'regular' | 'special';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  billsIntroduced: number;
  billsPassed: number;
  specialFocus?: string[];
}

export interface CaliforniaApiResponse<T> {
  data: T;
  meta: {
    total?: number;
    page?: number;
    pageSize?: number;
    lastUpdated: string;
    source: string;
  };
}