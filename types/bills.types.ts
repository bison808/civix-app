export interface Bill {
  id: string;
  billNumber: string;
  title: string;
  shortTitle?: string;
  summary: string;
  fullText?: string;
  status: BillStatus;
  chamber: 'House' | 'Senate';
  introducedDate: string;
  lastActionDate: string;
  lastAction: string;
  sponsor: BillSponsor;
  cosponsors: BillSponsor[];
  committees: string[];
  subjects: string[];
  policyArea?: string;
  legislativeHistory: LegislativeAction[];
  votes?: VoteRecord[];
  relatedBills?: RelatedBill[];
  amendments?: Amendment[];
  estimatedImpact?: BillImpact;
  aiSummary?: SimplifiedBill;
  userVote?: 'like' | 'dislike' | null;
  isTracked?: boolean;
  userConnection?: {
    type: 'representative_sponsored' | 'representative_cosponsored' | 'representative_committee' | 'subject_interest';
    representativeName?: string;
    representativeTitle?: string;
    details?: string;
  };
}

export interface BillStatus {
  stage: 'Introduced' | 'Committee' | 'House' | 'Senate' | 'Conference' | 'Presidential' | 'Law' | 'Vetoed' | 'Failed';
  detail: string;
  date: string;
  lastAction?: string;
  isActive?: boolean;
}

export interface BillSponsor {
  id: string;
  name: string;
  party: string;
  state: string;
  district?: string;
}

export interface LegislativeAction {
  date: string;
  action: string;
  chamber: string;
  actionType: string;
}

export interface VoteRecord {
  chamber: 'House' | 'Senate';
  date: string;
  result: 'Passed' | 'Failed';
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  details?: VoteDetails;
}

export interface VoteDetails {
  rollCallNumber: string;
  question: string;
  voteType: string;
  requiredMajority: string;
}

export interface RelatedBill {
  id: string;
  billNumber: string;
  title: string;
  relationship: string;
}

export interface Amendment {
  id: string;
  number: string;
  sponsor: string;
  description: string;
  status: string;
  offeredDate: string;
}

export interface BillImpact {
  economicImpact?: EconomicImpact;
  socialImpact?: string[];
  affectedGroups?: string[];
  geographicScope?: string;
  implementationTimeline?: string;
}

export interface EconomicImpact {
  estimatedCost?: number;
  budgetImpact?: string;
  jobsImpact?: string;
  taxImplications?: string;
}

export interface SimplifiedBill {
  id: string;
  billId: string;
  title: string;
  simpleSummary: string;
  keyPoints: string[];
  pros: string[];
  cons: string[];
  whoItAffects: string[];
  whatItMeans: string;
  timeline: string;
  readingLevel: 'elementary' | 'middle' | 'high' | 'college';
  generatedAt: string;
}

export interface BillFilter {
  status?: string;
  chamber?: 'House' | 'Senate' | 'All';
  sponsor?: string;
  committee?: string;
  subject?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  sortBy?: 'date' | 'relevance' | 'status';
  page?: number;
  limit?: number;
}

export interface BillsResponse {
  bills: Bill[];
  total: number;
  page: number;
  pageSize: number;
  facets?: BillFacets;
}

export interface BillFacets {
  statuses: { value: string; count: number }[];
  subjects: { value: string; count: number }[];
  committees: { value: string; count: number }[];
  sponsors: { value: string; count: number }[];
}