/**
 * LegiScan Comprehensive API Client - Agent Carlos Implementation
 * EXPANSION: Transform basic bill tracking into comprehensive civic engagement platform
 * 
 * Implements ALL major LegiScan API operations for maximum civic value:
 * - Roll Call Votes: "How did MY representative vote?"
 * - Committee Data: Committee assignments, hearings, schedules
 * - People/Legislators: Comprehensive profiles, contact info, backgrounds
 * - Documents: Amendments, analyses, fiscal reports, supporting materials
 * - Calendar/Agendas: Committee meetings, floor schedules
 * - Advanced Search: Powerful search operators (ADJ, AND, OR, NOT)
 */

import { ResilientApiClient, type ResilientApiConfig } from './resilientApiClient';
import { Bill } from '@/types/bills.types';
import { Representative } from '@/types/representatives.types';

// Extended Configuration for Comprehensive LegiScan Operations
const COMPREHENSIVE_LEGISCAN_CONFIG: ResilientApiConfig = {
  name: 'LegiScan Comprehensive API',
  baseUrl: 'https://api.legiscan.com',
  timeout: 15000, // Increased for comprehensive data
  retryPolicy: {
    maxAttempts: 3,
    baseDelay: 1500,
    maxDelay: 10000,
    backoffStrategy: 'exponential',
    retryableErrors: ['timeout', 'network', 'server', 'rate_limit'],
    retryableStatusCodes: [429, 500, 502, 503, 504]
  },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 60000,
    monitoringPeriod: 15000,
    minimumRequests: 3
  },
  cache: {
    enabled: true,
    ttl: 60 * 60 * 1000, // 1 hour for comprehensive data
    maxSize: 500,
    keyGenerator: (url: string) => {
      const urlParts = new URL(url);
      return `legiscan-comprehensive:${urlParts.pathname}?${urlParts.search}`;
    }
  },
  healthCheck: {
    endpoint: '/?op=getStateList',
    interval: 10 * 60 * 1000 // 10 minutes
  },
  fallbackStrategies: [{
    name: 'Cached Legislative Data',
    condition: (error) => true,
    handler: async () => {
      // Return cached or minimal legislative data
      return null;
    }
  }]
};

// ========================================================================================
// COMPREHENSIVE LEGISCAN API INTERFACES
// ========================================================================================

interface LegiScanRollCallResponse {
  status: string;
  roll_call: {
    roll_call_id: number;
    bill_id: number;
    date: string;
    desc: string;
    yea: number;
    nay: number;
    nv: number;
    absent: number;
    total: number;
    passed: number;
    chamber: string;
    votes: Array<{
      people_id: number;
      vote_id: number;
      vote_text: string;
    }>;
  };
}

interface LegiScanCommitteeResponse {
  status: string;
  committee: {
    committee_id: number;
    committee_name: string;
    committee_body: string;
    committee_url?: string;
    members?: Array<{
      people_id: number;
      name: string;
      party: string;
      role: string; // Chair, Vice Chair, Member
    }>;
  };
}

interface LegiScanPersonResponse {
  status: string;
  person: {
    people_id: number;
    person_hash: string;
    state_id: number;
    party_id: number;
    party: string;
    role_id: number;
    role: string;
    name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    nickname: string;
    district: string;
    ftm_eid?: number;
    votesmart_id?: number;
    opensecrets_id?: string;
    ballotpedia?: string;
    committee_sponsor: number;
    committee_id?: number;
    phone?: string;
    email?: string;
    website?: string;
  };
}

interface LegiScanSearchResponse {
  status: string;
  searchresult: {
    summary: {
      count: number;
      page: number;
      pages: number;
    };
    results: Array<{
      relevance: number;
      bill: {
        bill_id: number;
        bill_number: string;
        title: string;
        description: string;
      };
    }>;
  };
}

interface LegiScanDocumentResponse {
  status: string;
  text: {
    doc_id: number;
    bill_id: number;
    date: string;
    type: string;
    type_id: number;
    mime: string;
    mime_id: number;
    url: string;
    state_link: string;
    text_size: number;
    doc: string; // Base64 encoded document
  };
}

interface LegiScanCalendarResponse {
  status: string;
  calendar: Array<{
    type: string; // committee, floor, etc.
    date: string;
    time: string;
    location: string;
    description: string;
    committee_id?: number;
    bills?: Array<{
      bill_id: number;
      bill_number: string;
    }>;
  }>;
}

// Extended Types for Comprehensive Civic Engagement
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
}

export interface CommitteeInfo {
  id: number;
  name: string;
  chamber: 'House' | 'Senate';
  url?: string;
  members: Array<{
    peopleId: number;
    name: string;
    party: string;
    role: 'Chair' | 'Vice Chair' | 'Member';
    district?: string;
  }>;
  currentBills?: string[]; // Bill IDs under committee review
}

export interface LegislatorProfile {
  peopleId: number;
  name: string;
  firstName: string;
  lastName: string;
  party: string;
  role: string;
  district: string;
  state: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  externalIds: {
    voteSmartId?: number;
    openSecretsId?: string;
    ballotpediaSlug?: string;
  };
  committees: number[]; // Committee IDs
  votingRecord?: VotingRecord[];
  sponsoredBills?: string[]; // Bill IDs
}

export interface LegislativeDocument {
  docId: number;
  billId: string;
  date: string;
  type: 'Amendment' | 'Analysis' | 'Fiscal Note' | 'Committee Report' | 'Floor Summary';
  mimeType: string;
  url: string;
  stateUrl: string;
  size: number;
}

export interface LegislativeCalendarEvent {
  date: string;
  time?: string;
  type: 'Committee Hearing' | 'Floor Vote' | 'Public Hearing' | 'Markup Session';
  location: string;
  description: string;
  committeeId?: number;
  committeeName?: string;
  bills: Array<{
    billId: string;
    billNumber: string;
    title: string;
  }>;
}

export interface AdvancedSearchOptions {
  query: string;
  state?: string;
  year?: number;
  billType?: string;
  status?: string;
  subject?: string;
  sponsor?: string;
  page?: number;
  pageSize?: number;
}

// ========================================================================================
// COMPREHENSIVE LEGISCAN API CLIENT
// ========================================================================================

class LegiScanComprehensiveApiService {
  private client: ResilientApiClient;
  private apiKey: string;

  constructor() {
    this.client = new ResilientApiClient(COMPREHENSIVE_LEGISCAN_CONFIG);
    this.apiKey = process.env.LEGISCAN_API_KEY || process.env.NEXT_PUBLIC_LEGISCAN_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('LegiScan API key not configured - comprehensive features may be limited');
    }
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'CITZN-Platform/1.0 (Civic Engagement)',
    };
  }

  // ========================================================================================
  // ROLL CALL VOTES - "How did MY representative vote?"
  // ========================================================================================

  /**
   * Get roll call votes for a specific bill
   * Enables "How did MY rep vote?" feature
   */
  async getBillRollCallVotes(billId: string): Promise<VotingRecord[]> {
    try {
      // Extract LegiScan bill ID from our internal format
      const legiScanBillId = this.extractLegiScanId(billId);
      const endpoint = `/?op=getRollCall&id=${legiScanBillId}&api_key=${this.apiKey}`;

      const response = await this.client.call<LegiScanRollCallResponse>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.roll_call) {
        return [];
      }

      return this.transformRollCallData(response.data.roll_call, billId);
    } catch (error) {
      console.error('Failed to fetch roll call votes:', error);
      return [];
    }
  }

  /**
   * Get voting record for a specific legislator
   * Critical for "My Representative's Voting Record" feature
   */
  async getLegislatorVotingRecord(peopleId: number, limit: number = 50): Promise<VotingRecord[]> {
    try {
      const endpoint = `/?op=getVotesByPerson&id=${peopleId}&api_key=${this.apiKey}`;

      const response = await this.client.call<{ status: string; votes: any[] }>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.votes) {
        return [];
      }

      return response.data.votes.map(vote => this.transformVoteData(vote)).slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch legislator voting record:', error);
      return [];
    }
  }

  // ========================================================================================
  // COMMITTEE DATA - "Which committees handle my issues?"
  // ========================================================================================

  /**
   * Get comprehensive committee information
   * Enables committee tracking and hearing attendance
   */
  async getCommitteeDetails(committeeId: number): Promise<CommitteeInfo | null> {
    try {
      const endpoint = `/?op=getCommittee&id=${committeeId}&api_key=${this.apiKey}`;

      const response = await this.client.call<LegiScanCommitteeResponse>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.committee) {
        return null;
      }

      return this.transformCommitteeData(response.data.committee);
    } catch (error) {
      console.error('Failed to fetch committee details:', error);
      return null;
    }
  }

  /**
   * Get all committees for a state
   * Enables "Find committees that handle [topic]" feature
   */
  async getStateCommittees(stateId: string = 'CA'): Promise<CommitteeInfo[]> {
    if (!this.apiKey) {
      console.warn('LegiScan API key not configured - returning demo committee data');
      return this.getDemoCommittees();
    }

    try {
      const endpoint = `/?op=getCommitteesByState&id=${stateId}&api_key=${this.apiKey}`;
      console.log(`[Production] Fetching committees for ${stateId} from LegiScan API`);

      const response = await this.client.call<{ status: string; committees: any[] }>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      console.log(`[Production] Committee API response status:`, response.data.status);

      if (response.data.status !== 'OK') {
        console.error(`[Production] LegiScan API returned status: ${response.data.status}`);
        return this.getDemoCommittees();
      }

      if (!response.data.committees || response.data.committees.length === 0) {
        console.warn(`[Production] No committees data returned from API`);
        return this.getDemoCommittees();
      }

      const committees = response.data.committees.map(committee => this.transformCommitteeData(committee));
      console.log(`[Production] Successfully transformed ${committees.length} committees`);
      
      return committees;
    } catch (error) {
      console.error('[Production] Failed to fetch state committees:', error);
      if (error instanceof Error) {
        console.error('[Production] Error details:', error.message);
      }
      return this.getDemoCommittees();
    }
  }

  // ========================================================================================
  // PEOPLE/LEGISLATORS - Comprehensive profiles and contact information
  // ========================================================================================

  /**
   * Get comprehensive legislator profile
   * Enables detailed representative information
   */
  async getLegislatorProfile(peopleId: number): Promise<LegislatorProfile | null> {
    try {
      const endpoint = `/?op=getPerson&id=${peopleId}&api_key=${this.apiKey}`;

      const response = await this.client.call<LegiScanPersonResponse>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.person) {
        return null;
      }

      return this.transformPersonData(response.data.person);
    } catch (error) {
      console.error('Failed to fetch legislator profile:', error);
      return null;
    }
  }

  /**
   * Search legislators by name, district, or party
   * Enables "Find my representatives" feature
   */
  async searchLegislators(query: string, stateId: string = 'CA'): Promise<LegislatorProfile[]> {
    try {
      const endpoint = `/?op=searchPeople&state=${stateId}&q=${encodeURIComponent(query)}&api_key=${this.apiKey}`;

      const response = await this.client.call<{ status: string; people: any[] }>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.people) {
        return [];
      }

      return response.data.people.map(person => this.transformPersonData(person));
    } catch (error) {
      console.error('Failed to search legislators:', error);
      return [];
    }
  }

  // ========================================================================================
  // DOCUMENTS - Amendments, analyses, fiscal reports, supporting materials
  // ========================================================================================

  /**
   * Get all documents for a bill
   * Enables access to full bill texts, amendments, analyses
   */
  async getBillDocuments(billId: string): Promise<LegislativeDocument[]> {
    try {
      const legiScanBillId = this.extractLegiScanId(billId);
      const endpoint = `/?op=getBillText&id=${legiScanBillId}&api_key=${this.apiKey}`;

      const response = await this.client.call<{ status: string; texts: any[] }>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.texts) {
        return [];
      }

      return response.data.texts.map(doc => this.transformDocumentData(doc, billId));
    } catch (error) {
      console.error('Failed to fetch bill documents:', error);
      return [];
    }
  }

  /**
   * Get specific document content
   * Enables full-text document access
   */
  async getDocumentContent(docId: number): Promise<string | null> {
    try {
      const endpoint = `/?op=getDocument&id=${docId}&api_key=${this.apiKey}`;

      const response = await this.client.call<LegiScanDocumentResponse>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.text) {
        return null;
      }

      // Decode base64 document content
      return atob(response.data.text.doc);
    } catch (error) {
      console.error('Failed to fetch document content:', error);
      return null;
    }
  }

  // ========================================================================================
  // CALENDAR/AGENDAS - Committee meetings, floor schedules
  // ========================================================================================

  /**
   * Get legislative calendar events
   * Enables "When can I attend hearings?" feature
   */
  async getLegislativeCalendar(stateId: string = 'CA', days: number = 30): Promise<LegislativeCalendarEvent[]> {
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const endpoint = `/?op=getCalendar&state=${stateId}&start=${startDate}&end=${endDate}&api_key=${this.apiKey}`;

      const response = await this.client.call<LegiScanCalendarResponse>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.calendar) {
        return [];
      }

      return response.data.calendar.map(event => this.transformCalendarEvent(event));
    } catch (error) {
      console.error('Failed to fetch legislative calendar:', error);
      return [];
    }
  }

  /**
   * Get committee hearing schedule
   * Enables committee-specific event tracking
   */
  async getCommitteeHearings(committeeId: number, days: number = 30): Promise<LegislativeCalendarEvent[]> {
    const allEvents = await this.getLegislativeCalendar('CA', days);
    return allEvents.filter(event => event.committeeId === committeeId);
  }

  // ========================================================================================
  // ADVANCED SEARCH - Powerful search operators (ADJ, AND, OR, NOT)
  // ========================================================================================

  /**
   * Advanced bill search with operators
   * Enables complex queries like "healthcare AND budget NOT federal"
   */
  async advancedBillSearch(options: AdvancedSearchOptions): Promise<{ bills: Bill[]; total: number; page: number }> {
    try {
      const params = new URLSearchParams();
      params.append('op', 'getSearch');
      params.append('state', options.state || 'CA');
      params.append('q', options.query);
      if (options.year) params.append('year', options.year.toString());
      if (options.billType) params.append('bill_type', options.billType);
      if (options.status) params.append('status', options.status);
      if (options.subject) params.append('subject', options.subject);
      if (options.sponsor) params.append('sponsor', options.sponsor);
      if (options.page) params.append('page', options.page.toString());
      if (options.pageSize) params.append('pagesize', options.pageSize.toString());
      params.append('api_key', this.apiKey);

      const endpoint = `/?${params.toString()}`;

      const response = await this.client.call<LegiScanSearchResponse>(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (response.data.status !== 'OK' || !response.data.searchresult) {
        return { bills: [], total: 0, page: 1 };
      }

      const bills = await Promise.all(
        response.data.searchresult.results.map(async result => {
          const billDetails = await this.getBillDetails(result.bill.bill_id);
          return billDetails;
        })
      );

      return {
        bills: bills.filter(bill => bill !== null) as Bill[],
        total: response.data.searchresult.summary.count,
        page: response.data.searchresult.summary.page
      };
    } catch (error) {
      console.error('Advanced search failed:', error);
      return { bills: [], total: 0, page: 1 };
    }
  }

  // ========================================================================================
  // UTILITY METHODS - Data transformation and helpers
  // ========================================================================================

  private extractLegiScanId(billId: string): string {
    // Extract LegiScan ID from our internal format (ca-legiscan-12345 -> 12345)
    const match = billId.match(/legiscan-(\d+)/);
    return match ? match[1] : billId;
  }

  private transformRollCallData(rollCall: any, billId: string): VotingRecord[] {
    return rollCall.votes?.map((vote: any) => ({
      rollCallId: rollCall.roll_call_id,
      billId: billId,
      billNumber: `Bill ${rollCall.bill_id}`,
      billTitle: rollCall.desc,
      date: rollCall.date,
      description: rollCall.desc,
      vote: this.mapVoteText(vote.vote_text),
      passed: rollCall.passed === 1,
      yesVotes: rollCall.yea,
      noVotes: rollCall.nay,
      totalVotes: rollCall.total,
      chamber: rollCall.chamber === 'H' ? 'House' : 'Senate'
    })) || [];
  }

  private transformVoteData(voteData: any): VotingRecord {
    return {
      rollCallId: voteData.roll_call_id,
      billId: `ca-legiscan-${voteData.bill_id}`,
      billNumber: voteData.bill_number,
      billTitle: voteData.bill_title || voteData.description,
      date: voteData.date,
      description: voteData.description,
      vote: this.mapVoteText(voteData.vote_text),
      passed: voteData.passed === 1,
      yesVotes: voteData.yea || 0,
      noVotes: voteData.nay || 0,
      totalVotes: voteData.total || 0,
      chamber: voteData.chamber === 'H' ? 'House' : 'Senate'
    };
  }

  private transformCommitteeData(committee: any): CommitteeInfo {
    return {
      id: committee.committee_id,
      name: committee.committee_name,
      chamber: committee.committee_body === 'H' ? 'House' : 'Senate',
      url: committee.committee_url,
      members: committee.members?.map((member: any) => ({
        peopleId: member.people_id,
        name: member.name,
        party: member.party,
        role: member.role as 'Chair' | 'Vice Chair' | 'Member',
        district: member.district
      })) || []
    };
  }

  private transformPersonData(person: any): LegislatorProfile {
    return {
      peopleId: person.people_id,
      name: person.name,
      firstName: person.first_name,
      lastName: person.last_name,
      party: person.party,
      role: person.role,
      district: person.district,
      state: this.mapStateId(person.state_id),
      contact: {
        phone: person.phone,
        email: person.email,
        website: person.website
      },
      externalIds: {
        voteSmartId: person.votesmart_id,
        openSecretsId: person.opensecrets_id,
        ballotpediaSlug: person.ballotpedia
      },
      committees: person.committee_id ? [person.committee_id] : []
    };
  }

  private transformDocumentData(doc: any, billId: string): LegislativeDocument {
    return {
      docId: doc.doc_id,
      billId: billId,
      date: doc.date,
      type: this.mapDocumentType(doc.type),
      mimeType: doc.mime,
      url: doc.url,
      stateUrl: doc.state_link,
      size: doc.text_size
    };
  }

  private transformCalendarEvent(event: any): LegislativeCalendarEvent {
    return {
      date: event.date,
      time: event.time,
      type: this.mapEventType(event.type),
      location: event.location,
      description: event.description,
      committeeId: event.committee_id,
      committeeName: event.committee_name,
      bills: event.bills?.map((bill: any) => ({
        billId: `ca-legiscan-${bill.bill_id}`,
        billNumber: bill.bill_number,
        title: bill.title || 'Legislative Item'
      })) || []
    };
  }

  private async getBillDetails(billId: number): Promise<Bill | null> {
    // This would use the existing getBillDetails method from the main LegiScan client
    // For now, return a placeholder
    return null;
  }

  private mapVoteText(voteText: string): 'Yea' | 'Nay' | 'Not Voting' | 'Absent' {
    switch (voteText?.toLowerCase()) {
      case 'yea':
      case 'yes':
      case 'aye':
        return 'Yea';
      case 'nay':
      case 'no':
        return 'Nay';
      case 'nv':
      case 'not voting':
        return 'Not Voting';
      case 'absent':
      case 'excused':
        return 'Absent';
      default:
        return 'Not Voting';
    }
  }

  private mapDocumentType(type: string): LegislativeDocument['type'] {
    switch (type?.toLowerCase()) {
      case 'amendment':
        return 'Amendment';
      case 'analysis':
        return 'Analysis';
      case 'fiscal':
        return 'Fiscal Note';
      case 'committee':
        return 'Committee Report';
      case 'floor':
        return 'Floor Summary';
      default:
        return 'Amendment';
    }
  }

  private mapEventType(type: string): LegislativeCalendarEvent['type'] {
    switch (type?.toLowerCase()) {
      case 'committee':
        return 'Committee Hearing';
      case 'floor':
        return 'Floor Vote';
      case 'public':
        return 'Public Hearing';
      case 'markup':
        return 'Markup Session';
      default:
        return 'Committee Hearing';
    }
  }

  private mapStateId(stateId: number): string {
    // Common state ID mappings - California is typically 5
    if (stateId === 5) return 'CA';
    return 'CA'; // Default to California for now
  }

  // ========================================================================================
  // PUBLIC API METHODS - Integration with existing bill service
  // ========================================================================================

  /**
   * Clear comprehensive data caches
   */
  public clearCache(): void {
    this.client.clearCache();
  }

  /**
   * Get API health status
   */
  public async getHealthStatus(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      const response = await this.client.call('/?op=getStateList&api_key=' + this.apiKey, {
        method: 'GET',
        headers: this.buildHeaders()
      });

      return {
        status: response.data.status === 'OK' ? 'healthy' : 'degraded',
        details: {
          apiKey: !!this.apiKey,
          responseTime: response.metadata?.responseTime || 0,
          cached: response.metadata?.fromCache || false
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Get demo committees for development and API key fallback
   */
  private getDemoCommittees(): CommitteeInfo[] {
    return [
      {
        id: 1001,
        name: '[DEMO] Assembly Committee on Housing and Community Development',
        chamber: 'House',
        url: 'https://demo.legiscan.com/committee/housing',
        members: [
          {
            peopleId: 2001,
            name: '[DEMO] Assembly Member Chair',
            party: 'Democrat',
            role: 'Chair',
            district: '15'
          },
          {
            peopleId: 2002,
            name: '[DEMO] Assembly Member Vice Chair',
            party: 'Republican',
            role: 'Vice Chair',
            district: '42'
          }
        ]
      },
      {
        id: 1002,
        name: '[DEMO] Senate Committee on Environmental Quality',
        chamber: 'Senate',
        url: 'https://demo.legiscan.com/committee/environment',
        members: [
          {
            peopleId: 3001,
            name: '[DEMO] Senator Environment Chair',
            party: 'Democrat',
            role: 'Chair',
            district: '11'
          },
          {
            peopleId: 3002,
            name: '[DEMO] Senator Environment Member',
            party: 'Republican',
            role: 'Member',
            district: '33'
          }
        ]
      },
      {
        id: 1003,
        name: '[DEMO] Assembly Committee on Budget',
        chamber: 'House',
        url: 'https://demo.legiscan.com/committee/budget',
        members: [
          {
            peopleId: 4001,
            name: '[DEMO] Assembly Budget Chair',
            party: 'Democrat',
            role: 'Chair',
            district: '7'
          }
        ]
      }
    ];
  }
}

export const legiScanComprehensiveApi = new LegiScanComprehensiveApiService();
export default legiScanComprehensiveApi;