/**
 * Integrated Representatives Service
 * Combines federal representatives with existing representatives service
 * Provides unified interface for all representative data
 */

import { Representative } from '@/types/representatives.types';
import { FederalRepresentative } from '@/types/federal.types';
import { representativesService } from './representatives.service';
import { federalRepresentativesService } from './federalRepresentatives.service';
import { zipDistrictMappingService } from './zipDistrictMapping';
import { getCaliforniaFederalReps } from './californiaFederalReps';

interface UnifiedRepresentativeResult {
  federal: FederalRepresentative[];
  state: Representative[];
  local: Representative[];
  total: number;
  breakdown: {
    federal: number;
    state: number;
    local: number;
  };
}

interface RepresentativeSearchOptions {
  includeVotingRecords?: boolean;
  includeBillData?: boolean;
  includeCommitteeInfo?: boolean;
  cacheResults?: boolean;
}

class IntegratedRepresentativesService {
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Get all representatives for a ZIP code (federal, state, and local)
   */
  async getAllRepresentativesByZipCode(
    zipCode: string,
    options: RepresentativeSearchOptions = {}
  ): Promise<UnifiedRepresentativeResult> {
    const cacheKey = `unified-${zipCode}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached && options.cacheResults !== false) {
      return cached;
    }

    try {
      // Get all representative types in parallel
      const [federalReps, stateLocalReps] = await Promise.all([
        this.getFederalRepresentatives(zipCode, options),
        this.getStateAndLocalRepresentatives(zipCode)
      ]);

      const result: UnifiedRepresentativeResult = {
        federal: federalReps,
        state: stateLocalReps.state,
        local: stateLocalReps.local,
        total: federalReps.length + stateLocalReps.state.length + stateLocalReps.local.length,
        breakdown: {
          federal: federalReps.length,
          state: stateLocalReps.state.length,
          local: stateLocalReps.local.length
        }
      };

      if (options.cacheResults !== false) {
        this.setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Error getting unified representatives:', error);
      
      // Return empty result on error
      return {
        federal: [],
        state: [],
        local: [],
        total: 0,
        breakdown: { federal: 0, state: 0, local: 0 }
      };
    }
  }

  /**
   * Get only federal representatives (Senators + House Rep)
   */
  async getFederalRepresentatives(
    zipCode: string,
    options: RepresentativeSearchOptions = {}
  ): Promise<FederalRepresentative[]> {
    try {
      // Use California-specific service for enhanced data
      if (this.isCaliforniaZipCode(zipCode)) {
        const reps = await federalRepresentativesService.getCaliforniaFederalRepsByZip(zipCode);
        
        // Enhance with additional data if requested
        if (options.includeVotingRecords || options.includeBillData) {
          return await this.enhanceFederalReps(reps, options);
        }
        
        return reps;
      }

      // Fallback to basic federal representatives for non-CA ZIP codes
      const basicReps = await representativesService.getRepresentativesByZipCode(zipCode);
      const federalReps = basicReps.filter(rep => 
        rep.chamber === 'House' || rep.chamber === 'Senate'
      );

      // Convert to FederalRepresentative format
      return federalReps.map(rep => this.convertToFederalRep(rep));
    } catch (error) {
      console.error('Error getting federal representatives:', error);
      return [];
    }
  }

  /**
   * Get state and local representatives
   */
  async getStateAndLocalRepresentatives(zipCode: string): Promise<{
    state: Representative[];
    local: Representative[];
  }> {
    try {
      // Use existing ZIP district mapping service
      const allReps = await zipDistrictMappingService.getRepresentativesByZipCode(zipCode);
      
      const stateReps = allReps.filter(rep => rep.level === 'state');
      const localReps = allReps.filter(rep => rep.level === 'county' || rep.level === 'local');

      return {
        state: stateReps.map(rep => this.convertDistrictRepToStandard(rep)),
        local: localReps.map(rep => this.convertDistrictRepToStandard(rep))
      };
    } catch (error) {
      console.error('Error getting state/local representatives:', error);
      return { state: [], local: [] };
    }
  }

  /**
   * Search across all representative levels
   */
  async searchAllRepresentatives(
    searchTerm: string,
    filters?: {
      level?: 'federal' | 'state' | 'local' | 'all';
      party?: string;
      state?: string;
      chamber?: string;
    }
  ): Promise<{
    federal: FederalRepresentative[];
    state: Representative[];
    local: Representative[];
    total: number;
  }> {
    const results = {
      federal: [] as FederalRepresentative[],
      state: [] as Representative[],
      local: [] as Representative[],
      total: 0
    };

    try {
      const promises = [];

      // Search federal representatives
      if (!filters?.level || filters.level === 'federal' || filters.level === 'all') {
        promises.push(
          federalRepresentativesService.searchFederalRepresentatives({
            searchTerm,
            party: filters?.party,
            chamber: filters?.chamber as any
          }).then(reps => {
            results.federal = reps;
          })
        );
      }

      // Search state/local representatives through existing service
      if (!filters?.level || filters.level === 'state' || filters.level === 'local' || filters.level === 'all') {
        promises.push(
          representativesService.searchRepresentatives(searchTerm).then(reps => {
            reps.forEach(rep => {
              // Categorize by level (this would need to be enhanced with level data)
              if (rep.chamber === 'House' || rep.chamber === 'Senate') {
                // Skip federal reps if already handled
                return;
              } else {
                // Assume state/local based on title or other indicators
                if (this.isStateRepresentative(rep)) {
                  results.state.push(rep);
                } else {
                  results.local.push(rep);
                }
              }
            });
          })
        );
      }

      await Promise.all(promises);
      results.total = results.federal.length + results.state.length + results.local.length;

      return results;
    } catch (error) {
      console.error('Error searching all representatives:', error);
      return results;
    }
  }

  /**
   * Get representative details with enhanced data
   */
  async getRepresentativeDetails(
    id: string,
    type: 'federal' | 'state' | 'local'
  ): Promise<FederalRepresentative | Representative | null> {
    try {
      if (type === 'federal') {
        // Try bioguide ID first
        return await federalRepresentativesService.getRepresentativeByBioguideId(id);
      } else {
        // Use existing service for state/local
        return await representativesService.getRepresentativeById(id);
      }
    } catch (error) {
      console.error('Error getting representative details:', error);
      return null;
    }
  }

  /**
   * Get voting records for a representative
   */
  async getRepresentativeVotingRecord(
    bioguideId: string
  ): Promise<any> {
    try {
      return await federalRepresentativesService.getVotingRecord(bioguideId);
    } catch (error) {
      console.error('Error getting voting record:', error);
      return null;
    }
  }

  /**
   * Get bills sponsored by a representative
   */
  async getRepresentativeBills(
    bioguideId: string,
    type: 'sponsored' | 'cosponsored' = 'sponsored'
  ): Promise<any[]> {
    try {
      if (type === 'sponsored') {
        return await federalRepresentativesService.getSponsoredBills(bioguideId);
      } else {
        // Would implement cosponsored bills endpoint
        return [];
      }
    } catch (error) {
      console.error('Error getting representative bills:', error);
      return [];
    }
  }

  /**
   * Get comprehensive representative profile
   */
  async getComprehensiveProfile(
    zipCode: string,
    representativeId: string
  ): Promise<{
    representative: FederalRepresentative | Representative;
    votingRecord?: any;
    sponsoredBills?: any[];
    cosponsoredBills?: any[];
    recentVotes?: any[];
    committees?: any[];
    district?: any;
  } | null> {
    try {
      // Get basic representative data
      const allReps = await this.getAllRepresentativesByZipCode(zipCode);
      const rep = [...allReps.federal, ...allReps.state, ...allReps.local]
        .find(r => r.id === representativeId);

      if (!rep) {
        return null;
      }

      const profile: any = {
        representative: rep
      };

      // If federal representative, get enhanced data
      if ('bioguideId' in rep && typeof rep.bioguideId === 'string') {
        const [votingRecord, sponsoredBills, recentVotes] = await Promise.all([
          this.getRepresentativeVotingRecord(rep.bioguideId),
          this.getRepresentativeBills(rep.bioguideId, 'sponsored'),
          federalRepresentativesService.getRecentVotes(rep.bioguideId)
        ]);

        profile.votingRecord = votingRecord;
        profile.sponsoredBills = sponsoredBills;
        profile.recentVotes = recentVotes;
        profile.committees = (rep as any).committeeMemberships || [];
      }

      // Get district information
      if (rep.district) {
        profile.district = await zipDistrictMappingService.getDistrictsForZipCode(zipCode);
      }

      return profile;
    } catch (error) {
      console.error('Error getting comprehensive profile:', error);
      return null;
    }
  }

  /**
   * Refresh all cached data
   */
  async refreshAllData(): Promise<void> {
    this.cache.clear();
    await Promise.all([
      federalRepresentativesService.refreshAllData(),
      zipDistrictMappingService.clearAllCaches()
    ]);
    console.log('All representative data refreshed');
  }

  // Private helper methods

  private async enhanceFederalReps(
    reps: FederalRepresentative[],
    options: RepresentativeSearchOptions
  ): Promise<FederalRepresentative[]> {
    const enhanced = [];

    for (const rep of reps) {
      const enhancedRep = { ...rep };

      if (options.includeVotingRecords && rep.bioguideId) {
        const votingRecord = await federalRepresentativesService.getVotingRecord(rep.bioguideId);
        if (votingRecord) {
          enhancedRep.votingRecord = votingRecord;
        }
      }

      if (options.includeBillData && rep.bioguideId) {
        const [sponsored, recent] = await Promise.all([
          federalRepresentativesService.getSponsoredBills(rep.bioguideId),
          federalRepresentativesService.getRecentVotes(rep.bioguideId)
        ]);

        if (sponsored) enhancedRep.billsSponsored = sponsored;
        if (recent) enhancedRep.recentVotes = recent;
      }

      enhanced.push(enhancedRep);
    }

    return enhanced;
  }

  private convertToFederalRep(rep: Representative): FederalRepresentative {
    return {
      ...rep,
      bioguideId: this.deriveBioguideId(rep),
      committeeMemberships: rep.committees?.map(c => ({
        ...c,
        fullName: c.name,
        jurisdiction: [],
        majority: true
      })) || [],
      subcommitteeMemberships: [],
      leadershipPositions: [],
      votingRecord: {
        totalVotes: 0,
        yesVotes: 0,
        noVotes: 0,
        abstentions: 0,
        presentVotes: 0,
        notVoting: 0,
        partyUnityScore: 85,
        bipartisanVotes: 0,
        keyVotes: [],
        votesByCategory: [],
        currentSession: {
          congress: 119,
          session: 1,
          votesThisSession: 0,
          attendance: 95
        }
      },
      billsSponsored: [],
      billsCosponsored: [],
      recentVotes: [],
      nextElection: new Date(rep.termEnd).getFullYear().toString(),
      attendanceRate: 95,
      capitalOffice: {
        building: 'Capitol Building',
        room: 'TBD',
        address: 'Washington, DC 20515',
        phone: rep.contactInfo.phone,
        hours: 'Monday-Friday 9:00AM-5:00PM',
        appointments: true
      },
      stateOffices: [],
      recentStatements: [],
      recentPressReleases: [],
      lastUpdated: new Date().toISOString()
    };
  }

  private convertDistrictRepToStandard(rep: any): Representative {
    return {
      id: rep.id,
      name: rep.name,
      title: rep.title,
      party: rep.party,
      chamber: rep.chamber,
      state: rep.state,
      district: rep.district,
      contactInfo: rep.contactInfo,
      socialMedia: rep.socialMedia,
      committees: rep.committees || [],
      termStart: rep.termStart,
      termEnd: rep.termEnd,
      biography: rep.biography,
      level: rep.level || this.inferLevel(rep),
      jurisdiction: rep.jurisdiction || this.inferJurisdiction(rep),
      governmentType: rep.governmentType || this.inferGovernmentType(rep),
      jurisdictionScope: rep.jurisdictionScope || this.inferJurisdictionScope(rep)
    };
  }

  private deriveBioguideId(rep: Representative): string {
    // Simple derivation - in production would use lookup table
    const lastName = rep.name.split(' ').pop()?.substring(0, 6).toUpperCase() || '';
    const firstName = rep.name.split(' ')[0]?.substring(0, 2).toUpperCase() || '';
    return `${lastName}${firstName}01`;
  }

  private isCaliforniaZipCode(zipCode: string): boolean {
    const zipNum = parseInt(zipCode);
    return zipNum >= 90000 && zipNum <= 96199;
  }

  private isStateRepresentative(rep: Representative): boolean {
    return rep.title?.toLowerCase().includes('state') ||
           rep.title?.toLowerCase().includes('assembly') ||
           rep.title?.toLowerCase().includes('senator');
  }

  private inferLevel(rep: any): 'federal' | 'state' | 'county' | 'municipal' {
    if (rep.chamber === 'House' || rep.chamber === 'Senate') {
      return 'federal';
    }
    if (rep.chamber === 'assembly' || rep.chamber === 'senate') {
      return 'state';
    }
    if (rep.title?.toLowerCase().includes('county') || rep.title?.toLowerCase().includes('supervisor')) {
      return 'county';
    }
    if (rep.title?.toLowerCase().includes('mayor') || rep.title?.toLowerCase().includes('city')) {
      return 'municipal';
    }
    return 'state'; // default fallback
  }

  private inferJurisdiction(rep: any): string {
    if (rep.level === 'federal' || this.inferLevel(rep) === 'federal') {
      return `${rep.state} - District ${rep.district || 'At Large'}`;
    }
    if (rep.level === 'state' || this.inferLevel(rep) === 'state') {
      return `${rep.state} - ${rep.chamber === 'assembly' ? 'Assembly' : 'Senate'} District ${rep.district}`;
    }
    if (rep.level === 'county' || this.inferLevel(rep) === 'county') {
      return `${rep.state} County`;
    }
    return `${rep.state}`;
  }

  private inferGovernmentType(rep: any): 'city' | 'county' | 'state' | 'federal' | 'district' | 'special' {
    const level = rep.level || this.inferLevel(rep);
    switch (level) {
      case 'federal': return 'federal';
      case 'state': return 'state';
      case 'county': return 'county';
      case 'municipal': return 'city';
      default: return 'state';
    }
  }

  private inferJurisdictionScope(rep: any): 'citywide' | 'countywide' | 'statewide' | 'national' | 'district' | undefined {
    const level = rep.level || this.inferLevel(rep);
    if (level === 'federal') {
      return rep.district ? 'district' : 'national';
    }
    if (level === 'state') {
      return rep.district ? 'district' : 'statewide';
    }
    if (level === 'county') {
      return rep.district ? 'district' : 'countywide';
    }
    if (level === 'municipal') {
      return rep.district ? 'district' : 'citywide';
    }
    return 'district';
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

export const integratedRepresentativesService = new IntegratedRepresentativesService();
export default integratedRepresentativesService;