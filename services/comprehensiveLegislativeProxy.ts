/**
 * Comprehensive Legislative Features Proxy - Agent Lisa Performance Optimization
 * 
 * CRITICAL: Dynamic loading wrapper for Agent Carlos's 1,405 lines of comprehensive features
 * - Prevents comprehensive features from loading in main bundle
 * - Loads advanced civic features only when accessed
 * - Maintains all functionality while optimizing performance
 */

import { Bill } from '@/types/bills.types';

// Lightweight interfaces for dynamic loading
export interface ComprehensiveLegislativeService {
  // Roll Call Votes
  getBillRollCallVotes(billId: string): Promise<VotingRecord[]>;
  getLegislatorVotingRecord(peopleId: number, limit?: number): Promise<VotingRecord[]>;
  
  // Committee Information  
  getCommitteeDetails(committeeId: number): Promise<CommitteeInfo>;
  getStateCommittees(stateId: string): Promise<CommitteeInfo[]>;
  getCommitteeHearings(committeeId: number, days?: number): Promise<LegislativeCalendarEvent[]>;
  
  // Legislator Profiles
  getLegislatorProfile(peopleId: number): Promise<LegislatorProfile>;
  searchLegislators(query: string, stateId?: string): Promise<LegislatorProfile[]>;
  
  // Documents & Content
  getBillDocuments(billId: string): Promise<LegislativeDocument[]>;
  getDocumentContent(docId: number, format?: string): Promise<string>;
  
  // Calendar & Events
  getLegislativeCalendar(stateId: string, days?: number): Promise<LegislativeCalendarEvent[]>;
  
  // Advanced Search
  advancedBillSearch(options: AdvancedSearchOptions): Promise<SearchResults>;
  
  // Health Status
  getHealthStatus(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }>;
}

// Lightweight type exports (full types in comprehensive module)
export interface VotingRecord {
  billId: string;
  rollCallId: number;
  date: string;
  chamber: 'House' | 'Senate';
  voteType: string;
  outcome: 'Passed' | 'Failed';
  votes: { yea: number; nay: number; absent: number };
}

export interface CommitteeInfo {
  committeeId: number;
  name: string;
  chamber: 'House' | 'Senate' | 'Joint';
  jurisdiction: string[];
  members: Array<{ peopleId: number; name: string; role: string }>;
}

export interface LegislatorProfile {
  peopleId: number;
  name: string;
  party: string;
  chamber: 'House' | 'Senate';
  district: string;
  contact: {
    email?: string;
    website?: string;
    phone?: string;
  };
}

export interface LegislativeDocument {
  docId: number;
  billId: string;
  type: string;
  version: string;
  title: string;
  downloadUrl?: string;
}

export interface LegislativeCalendarEvent {
  eventId: number;
  date: string;
  time: string;
  type: 'Committee Hearing' | 'Floor Session' | 'Markup';
  committee?: string;
  bills: Array<{ billId: string; title: string }>;
}

export interface AdvancedSearchOptions {
  query: string;
  state?: string;
  chamber?: 'House' | 'Senate' | 'Both';
  years?: number[];
  statuses?: string[];
  subjects?: string[];
}

export interface SearchResults {
  bills: Bill[];
  totalResults: number;
  page: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
}

/**
 * Dynamic Comprehensive Legislative Service Loader
 * Loads Agent Carlos's comprehensive features only when accessed
 */
class ComprehensiveLegislativeProxy {
  private comprehensiveService: ComprehensiveLegislativeService | null = null;
  private loadingPromise: Promise<ComprehensiveLegislativeService> | null = null;

  /**
   * Lazy load comprehensive features when first accessed
   */
  private async loadComprehensiveService(): Promise<ComprehensiveLegislativeService> {
    if (this.comprehensiveService) {
      return this.comprehensiveService;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    console.log('🔄 Loading comprehensive legislative features (1,405 lines)...');
    
    this.loadingPromise = this.performDynamicImport();
    this.comprehensiveService = await this.loadingPromise;
    this.loadingPromise = null;

    console.log('✅ Comprehensive legislative features loaded successfully');
    return this.comprehensiveService;
  }

  /**
   * Dynamic import with error handling
   */
  private async performDynamicImport(): Promise<ComprehensiveLegislativeService> {
    try {
      // Dynamic import prevents main bundle bloat
      const [comprehensiveApiModule, comprehensiveHooksModule] = await Promise.all([
        import('./legiScanComprehensiveApi'),
        import('../hooks/useComprehensiveLegislative')
      ]);

      console.log('📦 Comprehensive API and hooks modules loaded');

      // Create service instance from dynamically loaded modules
      const comprehensiveApi = comprehensiveApiModule.legiScanComprehensiveApi;
      
      return {
        // Roll Call Votes
        async getBillRollCallVotes(billId: string) {
          return comprehensiveApi.getBillRollCallVotes(billId);
        },
        
        async getLegislatorVotingRecord(peopleId: number, limit?: number) {
          return comprehensiveApi.getLegislatorVotingRecord(peopleId, limit);
        },
        
        // Committee Information
        async getCommitteeDetails(committeeId: number) {
          return comprehensiveApi.getCommitteeDetails(committeeId);
        },
        
        async getStateCommittees(stateId: string) {
          return comprehensiveApi.getStateCommittees(stateId);
        },
        
        async getCommitteeHearings(committeeId: number, days?: number) {
          return comprehensiveApi.getCommitteeHearings(committeeId, days);
        },
        
        // Legislator Profiles
        async getLegislatorProfile(peopleId: number) {
          return comprehensiveApi.getLegislatorProfile(peopleId);
        },
        
        async searchLegislators(query: string, stateId?: string) {
          return comprehensiveApi.searchLegislators(query, stateId);
        },
        
        // Documents & Content
        async getBillDocuments(billId: string) {
          return comprehensiveApi.getBillDocuments(billId);
        },
        
        async getDocumentContent(docId: number, format?: string) {
          return comprehensiveApi.getDocumentContent(docId, format);
        },
        
        // Calendar & Events
        async getLegislativeCalendar(stateId: string, days?: number) {
          return comprehensiveApi.getLegislativeCalendar(stateId, days);
        },
        
        // Advanced Search
        async advancedBillSearch(options: AdvancedSearchOptions) {
          return comprehensiveApi.advancedBillSearch(options);
        }
      };

    } catch (error) {
      console.error('❌ Failed to load comprehensive legislative features:', error);
      throw new Error('Comprehensive legislative features temporarily unavailable. Please try again.');
    }
  }

  // Public API methods with lazy loading
  async getBillRollCallVotes(billId: string): Promise<VotingRecord[]> {
    const service = await this.loadComprehensiveService();
    return service.getBillRollCallVotes(billId);
  }

  async getLegislatorVotingRecord(peopleId: number, limit = 50): Promise<VotingRecord[]> {
    const service = await this.loadComprehensiveService();
    return service.getLegislatorVotingRecord(peopleId, limit);
  }

  async getCommitteeDetails(committeeId: number): Promise<CommitteeInfo> {
    const service = await this.loadComprehensiveService();
    return service.getCommitteeDetails(committeeId);
  }

  async getStateCommittees(stateId: string): Promise<CommitteeInfo[]> {
    const service = await this.loadComprehensiveService();
    return service.getStateCommittees(stateId);
  }

  async getCommitteeHearings(committeeId: number, days = 30): Promise<LegislativeCalendarEvent[]> {
    const service = await this.loadComprehensiveService();
    return service.getCommitteeHearings(committeeId, days);
  }

  async getLegislatorProfile(peopleId: number): Promise<LegislatorProfile> {
    const service = await this.loadComprehensiveService();
    return service.getLegislatorProfile(peopleId);
  }

  async searchLegislators(query: string, stateId = 'CA'): Promise<LegislatorProfile[]> {
    const service = await this.loadComprehensiveService();
    return service.searchLegislators(query, stateId);
  }

  async getBillDocuments(billId: string): Promise<LegislativeDocument[]> {
    const service = await this.loadComprehensiveService();
    return service.getBillDocuments(billId);
  }

  async getDocumentContent(docId: number, format = 'text'): Promise<string> {
    const service = await this.loadComprehensiveService();
    return service.getDocumentContent(docId, format);
  }

  async getLegislativeCalendar(stateId: string, days = 14): Promise<LegislativeCalendarEvent[]> {
    const service = await this.loadComprehensiveService();
    return service.getLegislativeCalendar(stateId, days);
  }

  async advancedBillSearch(options: AdvancedSearchOptions): Promise<SearchResults> {
    const service = await this.loadComprehensiveService();
    return service.advancedBillSearch(options);
  }

  /**
   * Preload comprehensive features for anticipated usage
   */
  async preloadComprehensiveFeatures(): Promise<void> {
    try {
      await this.loadComprehensiveService();
      console.log('🚀 Comprehensive features preloaded successfully');
    } catch (error) {
      console.warn('⚠️ Failed to preload comprehensive features:', error);
    }
  }

  /**
   * Check if comprehensive features are loaded
   */
  isComprehensiveFeaturesLoaded(): boolean {
    return this.comprehensiveService !== null;
  }
}

// Singleton instance for application-wide use
export const comprehensiveLegislativeService = new ComprehensiveLegislativeProxy();

// Export class for testing
export { ComprehensiveLegislativeProxy };