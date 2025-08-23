export interface Representative {
  id: string;
  name: string;
  title: string;
  party: 'Democrat' | 'Republican' | 'Independent' | 'Other';
  chamber: 'House' | 'Senate' | 'Local' | 'assembly' | 'senate' | 'executive';
  state: string;
  district?: string | number;
  photoUrl?: string;
  contactInfo: ContactInfo;
  socialMedia?: SocialMediaLinks;
  committees?: Committee[];
  scorecard?: Scorecard;
  biography?: string;
  termStart: string;
  termEnd: string;
  officeLocations?: OfficeLocation[];
  // Name collision resolution fields
  level: 'federal' | 'state' | 'county' | 'municipal';
  jurisdiction: string;
  governmentType: 'city' | 'county' | 'state' | 'federal' | 'district' | 'special';
  jurisdictionScope?: 'citywide' | 'countywide' | 'statewide' | 'national' | 'district';
}

export interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
  mailingAddress?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface SocialMediaLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface Committee {
  id: string;
  name: string;
  role: 'Chair' | 'Vice Chair' | 'Member';
  subcommittees?: string[];
}

export interface Scorecard {
  overallScore: number;
  votingRecord: VotingRecord;
  sponsoredBills: number;
  cosponseredBills: number;
  missedVotes: number;
  totalVotes: number;
  topIssues: IssueScore[];
  lastUpdated: string;
}

export interface VotingRecord {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  presentVotes: number;
  notVoting: number;
}

export interface IssueScore {
  issue: string;
  score: number;
  totalVotes: number;
  alignmentWithConstituents?: number;
}

export interface OfficeLocation {
  type: 'District' | 'Washington DC';
  address: Address;
  phone: string;
  hours?: string;
}

export interface RepresentativeFilter {
  chamber?: 'House' | 'Senate' | 'All';
  party?: string;
  state?: string;
  searchTerm?: string;
}

export interface RepresentativesResponse {
  representatives: Representative[];
  total: number;
  page: number;
  pageSize: number;
}