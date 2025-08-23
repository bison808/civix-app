/**
 * Federal Representatives Service
 * Comprehensive service for managing federal representative data
 * Integrates with Congress.gov, ProPublica, and other federal data sources
 */

import { 
  FederalRepresentative, 
  CaliforniaFederalDelegation, 
  FederalRepresentativeFilter,
  EnhancedVotingRecord,
  Vote,
  BillSummary,
  CongressMember,
  ProPublicaApiResponse,
  FederalDataError,
  FederalDataErrorResponse
} from '@/types/federal.types';
import { Representative } from '@/types/representatives.types';
import { representativesService } from './representatives.service';
import { congressApi } from './congressApi';
import { CALIFORNIA_SENATORS, CALIFORNIA_HOUSE_REPS, getCaliforniaFederalReps } from './californiaFederalReps';

class FederalRepresentativesService {
  private readonly PROPUBLICA_API_BASE = 'https://api.propublica.org/congress/v1';
  private readonly CONGRESS_API_BASE = 'https://api.congress.gov/v3';
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private propublicaApiKey: string;
  private congressApiKey: string;

  constructor() {
    this.propublicaApiKey = process.env.PROPUBLICA_API_KEY || '';
    this.congressApiKey = process.env.CONGRESS_API_KEY || '';
  }

  /**
   * Get all California federal representatives (2 Senators + 52 House members)
   */
  async getCaliforniaFederalDelegation(): Promise<CaliforniaFederalDelegation> {
    const cacheKey = 'ca-federal-delegation';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Get enhanced data for senators and house members
      const [enhancedSenators, enhancedHouseMembers] = await Promise.all([
        this.enhanceRepresentatives(CALIFORNIA_SENATORS),
        this.enhanceRepresentatives(CALIFORNIA_HOUSE_REPS)
      ]);

      const delegation: CaliforniaFederalDelegation = {
        senators: enhancedSenators,
        houseMembers: enhancedHouseMembers,
        totalDistricts: 52,
        partyBreakdown: {
          senate: this.calculatePartyBreakdown(enhancedSenators),
          house: this.calculatePartyBreakdown(enhancedHouseMembers)
        },
        lastUpdated: new Date().toISOString()
      };

      this.setCache(cacheKey, delegation);
      return delegation;
    } catch (error) {
      console.error('Error fetching California federal delegation:', error);
      
      // Return basic data without enhancements as fallback
      return {
        senators: this.convertToFederalReps(CALIFORNIA_SENATORS),
        houseMembers: this.convertToFederalReps(CALIFORNIA_HOUSE_REPS),
        totalDistricts: 52,
        partyBreakdown: {
          senate: this.calculatePartyBreakdown(CALIFORNIA_SENATORS),
          house: this.calculatePartyBreakdown(CALIFORNIA_HOUSE_REPS)
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get California federal representatives by ZIP code
   */
  async getCaliforniaFederalRepsByZip(zipCode: string): Promise<FederalRepresentative[]> {
    const basicReps = getCaliforniaFederalReps(zipCode);
    return this.enhanceRepresentatives(basicReps);
  }

  /**
   * Get representative by bioguide ID
   */
  async getRepresentativeByBioguideId(bioguideId: string): Promise<FederalRepresentative | null> {
    const cacheKey = `bioguide-${bioguideId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Try ProPublica API first
      const propublicaData = await this.fetchFromProPublica(`/119/house/members/${bioguideId}.json`);
      
      if (propublicaData?.results?.[0]) {
        const enhanced = await this.convertProPublicaToFederal(propublicaData.results[0]);
        this.setCache(cacheKey, enhanced);
        return enhanced;
      }

      // Fallback to Congress.gov API
      const congressData = await this.fetchFromCongressApi(`/member/${bioguideId}`);
      
      if (congressData) {
        const enhanced = await this.convertCongressApiToFederal(congressData);
        this.setCache(cacheKey, enhanced);
        return enhanced;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching representative ${bioguideId}:`, error);
      return null;
    }
  }

  /**
   * Get voting record for a representative
   */
  async getVotingRecord(bioguideId: string, congress: number = 119): Promise<EnhancedVotingRecord | null> {
    const cacheKey = `voting-record-${bioguideId}-${congress}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Fetch from ProPublica API
      const votingData = await this.fetchFromProPublica(
        `/119/house/members/${bioguideId}/votes.json`
      );

      if (votingData?.results?.[0]) {
        const record = this.parseVotingRecord(votingData.results[0]);
        this.setCache(cacheKey, record);
        return record;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching voting record for ${bioguideId}:`, error);
      return null;
    }
  }

  /**
   * Get bills sponsored by a representative
   */
  async getSponsoredBills(bioguideId: string, congress: number = 119): Promise<BillSummary[]> {
    const cacheKey = `sponsored-bills-${bioguideId}-${congress}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const billsData = await this.fetchFromProPublica(
        `/119/house/members/${bioguideId}/bills/introduced.json`
      );

      if (billsData?.results?.[0]?.bills) {
        const bills = billsData.results[0].bills.map(this.convertToBillSummary);
        this.setCache(cacheKey, bills);
        return bills;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching sponsored bills for ${bioguideId}:`, error);
      return [];
    }
  }

  /**
   * Get recent votes for a representative
   */
  async getRecentVotes(bioguideId: string, limit: number = 20): Promise<Vote[]> {
    const cacheKey = `recent-votes-${bioguideId}-${limit}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const votesData = await this.fetchFromProPublica(
        `/119/house/members/${bioguideId}/votes.json`
      );

      if (votesData?.results?.[0]?.votes) {
        const votes = votesData.results[0].votes
          .slice(0, limit)
          .map(this.convertToVote);
        
        this.setCache(cacheKey, votes);
        return votes;
      }

      return [];
    } catch (error) {
      console.error(`Error fetching recent votes for ${bioguideId}:`, error);
      return [];
    }
  }

  /**
   * Search federal representatives
   */
  async searchFederalRepresentatives(
    filter: FederalRepresentativeFilter
  ): Promise<FederalRepresentative[]> {
    const delegation = await this.getCaliforniaFederalDelegation();
    let results = [...delegation.senators, ...delegation.houseMembers];

    // Apply filters
    if (filter.chamber) {
      results = results.filter(rep => rep.chamber === filter.chamber);
    }

    if (filter.party) {
      results = results.filter(rep => 
        rep.party.toLowerCase() === filter.party!.toLowerCase()
      );
    }

    if (filter.district) {
      results = results.filter(rep => rep.district === filter.district);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      results = results.filter(rep =>
        rep.name.toLowerCase().includes(term) ||
        rep.title.toLowerCase().includes(term) ||
        rep.biography?.toLowerCase().includes(term)
      );
    }

    return results;
  }

  /**
   * Get committee assignments for a representative
   */
  async getCommitteeAssignments(bioguideId: string) {
    try {
      const memberData = await this.fetchFromProPublica(`/119/house/members/${bioguideId}.json`);
      
      if (memberData?.results?.[0]) {
        const member = memberData.results[0];
        return {
          committees: member.committees || [],
          subcommittees: member.subcommittees || [],
          leadershipRoles: member.leadership_roles || []
        };
      }

      return { committees: [], subcommittees: [], leadershipRoles: [] };
    } catch (error) {
      console.error(`Error fetching committee assignments for ${bioguideId}:`, error);
      return { committees: [], subcommittees: [], leadershipRoles: [] };
    }
  }

  /**
   * Refresh all cached data
   */
  async refreshAllData(): Promise<void> {
    this.cache.clear();
    
    // Pre-load California delegation data
    await this.getCaliforniaFederalDelegation();
    
    console.log('Federal representatives data refreshed');
  }

  // Private methods
  
  private async enhanceRepresentatives(basicReps: Representative[]): Promise<FederalRepresentative[]> {
    const enhanced: FederalRepresentative[] = [];
    
    for (const rep of basicReps) {
      try {
        const federalRep = await this.enhanceSingleRepresentative(rep);
        enhanced.push(federalRep);
      } catch (error) {
        console.warn(`Failed to enhance representative ${rep.id}:`, error);
        // Use basic conversion as fallback
        enhanced.push(this.convertToFederalRep(rep));
      }
    }

    return enhanced;
  }

  private async enhanceSingleRepresentative(rep: Representative): Promise<FederalRepresentative> {
    // Start with basic conversion
    const federalRep = this.convertToFederalRep(rep);

    try {
      // Try to get bioguide ID from existing data or derive it
      const bioguideId = this.deriveBioguideId(rep);
      
      if (bioguideId) {
        // Fetch enhanced data from APIs
        const [votingRecord, committees] = await Promise.all([
          this.getVotingRecord(bioguideId),
          this.getCommitteeAssignments(bioguideId)
        ]);

        if (votingRecord) {
          federalRep.votingRecord = votingRecord;
        }

        if (committees) {
          federalRep.committeeMemberships = committees.committees;
          federalRep.subcommitteeMemberships = committees.subcommittees;
          federalRep.leadershipPositions = committees.leadershipRoles;
        }
      }
    } catch (error) {
      console.warn(`Failed to enhance data for ${rep.name}:`, error);
    }

    return federalRep;
  }

  private convertToFederalRep(rep: Representative): FederalRepresentative {
    return {
      ...rep,
      bioguideId: this.deriveBioguideId(rep),
      committeeMemberships: rep.committees?.map(c => ({
        ...c,
        fullName: c.name,
        jurisdiction: [],
        majority: true // Default assumption
      })) || [],
      subcommitteeMemberships: [],
      leadershipPositions: [],
      votingRecord: this.createDefaultVotingRecord(),
      billsSponsored: [],
      billsCosponsored: [],
      recentVotes: [],
      nextElection: this.calculateNextElection(rep.termEnd),
      attendanceRate: 95, // Default assumption
      capitalOffice: {
        building: 'Capitol Building',
        room: 'TBD',
        address: 'Washington, DC 20515',
        phone: rep.contactInfo.phone,
        hours: 'Monday-Friday 9:00AM-5:00PM',
        appointments: true
      },
      stateOffices: rep.officeLocations?.filter(office => office.type === 'District').map(office => ({
        city: office.address.city,
        address: `${office.address.street}, ${office.address.city}, ${office.address.state} ${office.address.zipCode}`,
        phone: office.phone,
        hours: office.hours || 'Monday-Friday 9:00AM-5:00PM',
        appointments: true,
        servesCounties: []
      })) || [],
      recentStatements: [],
      recentPressReleases: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private convertToFederalReps(reps: Representative[]): FederalRepresentative[] {
    return reps.map(rep => this.convertToFederalRep(rep));
  }

  private deriveBioguideId(rep: Representative): string {
    // Try to derive from existing ID or create a reasonable guess
    if (rep.id.includes('bioguide')) {
      return rep.id.replace('bioguide-', '');
    }
    
    // Create bioguide-style ID from name (this would need real mapping)
    const lastName = rep.name.split(' ').pop()?.substring(0, 6).toUpperCase() || '';
    const firstName = rep.name.split(' ')[0]?.substring(0, 2).toUpperCase() || '';
    return `${lastName}${firstName}01`; // This is a guess - real implementation would use lookup table
  }

  private createDefaultVotingRecord(): EnhancedVotingRecord {
    return {
      totalVotes: 0,
      yesVotes: 0,
      noVotes: 0,
      abstentions: 0,
      presentVotes: 0,
      notVoting: 0,
      partyUnityScore: 85, // Default assumption
      bipartisanVotes: 0,
      keyVotes: [],
      votesByCategory: [],
      currentSession: {
        congress: 119,
        session: 1,
        votesThisSession: 0,
        attendance: 95
      }
    };
  }

  private calculatePartyBreakdown(representatives: Representative[]) {
    return representatives.reduce((breakdown, rep) => {
      const party = rep.party.charAt(0); // D, R, I
      if (party === 'D') breakdown.D++;
      else if (party === 'R') breakdown.R++;
      else breakdown.I++;
      return breakdown;
    }, { D: 0, R: 0, I: 0 });
  }

  private calculateNextElection(termEnd: string): string {
    // House members are elected every 2 years, Senators every 6
    const termEndDate = new Date(termEnd);
    return termEndDate.getFullYear().toString();
  }

  private async fetchFromProPublica(endpoint: string): Promise<ProPublicaApiResponse | null> {
    if (!this.propublicaApiKey) {
      console.warn('ProPublica API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.PROPUBLICA_API_BASE}${endpoint}`, {
        headers: {
          'X-API-Key': this.propublicaApiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`ProPublica API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ProPublica API fetch error:', error);
      return null;
    }
  }

  private async fetchFromCongressApi(endpoint: string): Promise<any> {
    if (!this.congressApiKey) {
      console.warn('Congress API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.CONGRESS_API_BASE}${endpoint}?api_key=${this.congressApiKey}&format=json`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Congress API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Congress API fetch error:', error);
      return null;
    }
  }

  private parseVotingRecord(apiData: any): EnhancedVotingRecord {
    return {
      totalVotes: apiData.total_votes || 0,
      yesVotes: apiData.total_yes || 0,
      noVotes: apiData.total_no || 0,
      abstentions: apiData.total_present || 0,
      presentVotes: apiData.total_present || 0,
      notVoting: apiData.missed_votes || 0,
      partyUnityScore: apiData.votes_with_party_pct || 0,
      bipartisanVotes: apiData.votes_against_party_pct || 0,
      keyVotes: [],
      votesByCategory: [],
      currentSession: {
        congress: 119,
        session: 1,
        votesThisSession: apiData.total_votes || 0,
        attendance: ((apiData.total_votes - apiData.missed_votes) / apiData.total_votes * 100) || 95
      }
    };
  }

  private convertToBillSummary = (billData: any): BillSummary => {
    return {
      id: billData.bill_id,
      billNumber: billData.number,
      title: billData.title,
      shortTitle: billData.short_title,
      introducedDate: billData.introduced_date,
      latestActionDate: billData.latest_major_action_date,
      latestAction: billData.latest_major_action,
      status: this.mapBillStatus(billData.latest_major_action),
      chamber: billData.bill_type?.startsWith('h') ? 'House' : 'Senate',
      primarySubject: billData.primary_subject,
      cosponsors: billData.cosponsors,
      summary: billData.summary
    };
  }

  private convertToVote = (voteData: any): Vote => {
    return {
      voteId: voteData.vote_id,
      date: voteData.date,
      time: voteData.time,
      chamber: voteData.chamber,
      session: voteData.session,
      rollCall: voteData.roll_call,
      question: voteData.question,
      description: voteData.description,
      voteType: voteData.vote_type,
      result: voteData.result,
      totalVotes: voteData.total_yes + voteData.total_no + voteData.total_present + voteData.total_not_voting,
      yesVotes: voteData.total_yes,
      noVotes: voteData.total_no,
      presentVotes: voteData.total_present,
      notVoting: voteData.total_not_voting,
      position: voteData.member_vote_position,
      bill: voteData.bill ? {
        id: voteData.bill.bill_id,
        number: voteData.bill.number,
        title: voteData.bill.title
      } : undefined,
      isKeyVote: false, // Would need additional logic
      partyLineVote: false, // Would need additional logic
      bipartisanSupport: false // Would need additional logic
    };
  }

  private mapBillStatus(latestAction: string): BillSummary['status'] {
    if (latestAction?.includes('Became Public Law')) return 'Law';
    if (latestAction?.includes('Passed House')) return 'House';
    if (latestAction?.includes('Passed Senate')) return 'Senate';
    if (latestAction?.includes('Committee')) return 'Committee';
    if (latestAction?.includes('Introduced')) return 'Introduced';
    return 'Committee';
  }

  private async convertProPublicaToFederal(propublicaData: any): Promise<FederalRepresentative> {
    // Convert ProPublica API response to FederalRepresentative
    // This would be a comprehensive conversion based on their API structure
    throw new Error('ProPublica conversion not implemented yet');
  }

  private async convertCongressApiToFederal(congressData: any): Promise<FederalRepresentative> {
    // Convert Congress.gov API response to FederalRepresentative
    // This would be a comprehensive conversion based on their API structure
    throw new Error('Congress API conversion not implemented yet');
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const federalRepresentativesService = new FederalRepresentativesService();
export default federalRepresentativesService;