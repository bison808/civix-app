import { openStatesService } from './openStatesService';
import { californiaStateApi } from './californiaStateApi';
import { 
  StateRepresentative, 
  CaliforniaExecutive,
  StateCommittee,
  LegislativeSession,
  StateBill,
  DistrictBoundary
} from '../types/california-state.types';

class IntegratedCaliforniaStateService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours cache

  // Get all California state representatives (Assembly + Senate + Executives)
  async getAllCaliforniaRepresentatives(): Promise<{
    assembly: StateRepresentative[];
    senate: StateRepresentative[];
    executives: CaliforniaExecutive[];
    total: number;
  }> {
    const cacheKey = 'all-ca-representatives';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [assemblyMembers, senateMembers, executives] = await Promise.all([
        this.getAssemblyMembers(),
        this.getSenateMembers(), 
        this.getExecutives()
      ]);

      const result = {
        assembly: assemblyMembers,
        senate: senateMembers,
        executives,
        total: assemblyMembers.length + senateMembers.length + executives.length
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to fetch all CA representatives:', error);
      return {
        assembly: [],
        senate: [],
        executives: [],
        total: 0
      };
    }
  }

  // Get California Assembly Members (80 districts) with enhanced data
  async getAssemblyMembers(): Promise<StateRepresentative[]> {
    const cacheKey = 'enhanced-assembly-members';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get data from both OpenStates and CA State API
      const [openStatesData, stateApiData] = await Promise.all([
        openStatesService.getCaliforniaAssemblyMembers(),
        californiaStateApi.getAssemblyMembers()
      ]);

      // Merge and enhance the data
      const enhancedMembers = this.mergeRepresentativeData(openStatesData, stateApiData);
      
      // Add additional enhancements
      for (const member of enhancedMembers) {
        member.committees = await this.getCommitteeAssignments(member.legislativeId);
        member.billsAuthored = await this.getBillsAuthored(member.legislativeId);
        member.districtOffices = await this.getDistrictOffices(member.district, 'assembly');
      }

      this.setCache(cacheKey, enhancedMembers);
      return enhancedMembers;
    } catch (error) {
      console.error('Failed to fetch Assembly members:', error);
      return [];
    }
  }

  // Get California Senate Members (40 districts) with enhanced data
  async getSenateMembers(): Promise<StateRepresentative[]> {
    const cacheKey = 'enhanced-senate-members';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get data from both OpenStates and CA State API
      const [openStatesData, stateApiData] = await Promise.all([
        openStatesService.getCaliforniaSenateMembers(),
        californiaStateApi.getSenateMembers()
      ]);

      // Merge and enhance the data
      const enhancedMembers = this.mergeRepresentativeData(openStatesData, stateApiData);
      
      // Add additional enhancements
      for (const member of enhancedMembers) {
        member.committees = await this.getCommitteeAssignments(member.legislativeId);
        member.billsAuthored = await this.getBillsAuthored(member.legislativeId);
        member.districtOffices = await this.getDistrictOffices(member.district, 'senate');
      }

      this.setCache(cacheKey, enhancedMembers);
      return enhancedMembers;
    } catch (error) {
      console.error('Failed to fetch Senate members:', error);
      return [];
    }
  }

  // Get Governor and Lieutenant Governor
  async getExecutives(): Promise<CaliforniaExecutive[]> {
    const cacheKey = 'ca-executives-enhanced';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [governor, ltGovernor] = await Promise.all([
        californiaStateApi.getGovernor(),
        californiaStateApi.getLieutenantGovernor()
      ]);

      const executives = [governor, ltGovernor].filter(Boolean) as CaliforniaExecutive[];
      this.setCache(cacheKey, executives);
      return executives;
    } catch (error) {
      console.error('Failed to fetch executives:', error);
      return [];
    }
  }

  // Get representatives by ZIP code
  async getRepresentativesByZip(zipCode: string): Promise<{
    assembly: StateRepresentative | null;
    senate: StateRepresentative | null;
    executives: CaliforniaExecutive[];
  }> {
    const cacheKey = `reps-by-zip-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Find districts for this ZIP code
      const districts = await californiaStateApi.findDistrictByZip(zipCode);
      
      if (!districts) {
        return {
          assembly: null,
          senate: null,
          executives: []
        };
      }

      const [assemblyMembers, senateMembers, executives] = await Promise.all([
        this.getAssemblyMembers(),
        this.getSenateMembers(),
        this.getExecutives()
      ]);

      const result = {
        assembly: assemblyMembers.find(rep => rep.district === districts.assembly) || null,
        senate: senateMembers.find(rep => rep.district === districts.senate) || null,
        executives
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get representatives by ZIP:', error);
      return {
        assembly: null,
        senate: null,
        executives: []
      };
    }
  }

  // Get representative by ID
  async getRepresentativeById(id: string): Promise<StateRepresentative | CaliforniaExecutive | null> {
    try {
      const allReps = await this.getAllCaliforniaRepresentatives();
      
      // Search in all categories
      const found = [
        ...allReps.assembly,
        ...allReps.senate,
        ...allReps.executives
      ].find(rep => rep.id === id);

      return found || null;
    } catch (error) {
      console.error('Failed to get representative by ID:', error);
      return null;
    }
  }

  // Get current legislative session
  async getCurrentSession(): Promise<LegislativeSession> {
    return await californiaStateApi.getCurrentLegislativeSession();
  }

  // Get district boundaries
  async getDistrictBoundaries(district: number, chamber: 'assembly' | 'senate'): Promise<DistrictBoundary | null> {
    return await californiaStateApi.getDistrictBoundaries(district, chamber);
  }

  // Get all committees
  async getCommittees(chamber?: 'assembly' | 'senate' | 'joint'): Promise<StateCommittee[]> {
    return await californiaStateApi.getCommittees(chamber);
  }

  // Search representatives
  async searchRepresentatives(query: string): Promise<StateRepresentative[]> {
    const cacheKey = `search-${query.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const allReps = await this.getAllCaliforniaRepresentatives();
      const searchResults = [
        ...allReps.assembly,
        ...allReps.senate
      ].filter(rep => 
        rep.name.toLowerCase().includes(query.toLowerCase()) ||
        rep.district.toString().includes(query) ||
        rep.party.toLowerCase().includes(query.toLowerCase())
      );

      this.setCache(cacheKey, searchResults);
      return searchResults;
    } catch (error) {
      console.error('Failed to search representatives:', error);
      return [];
    }
  }

  // Get leadership positions
  async getLeadershipPositions(): Promise<{ [key: string]: StateRepresentative }> {
    const cacheKey = 'leadership-positions';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const allReps = await this.getAllCaliforniaRepresentatives();
      const leadership: { [key: string]: StateRepresentative } = {};

      // Find leaders in both chambers
      [...allReps.assembly, ...allReps.senate].forEach(rep => {
        if (rep.leadership) {
          leadership[`${rep.chamber}-${rep.leadership.toLowerCase().replace(/\s+/g, '-')}`] = rep;
        }
      });

      this.setCache(cacheKey, leadership);
      return leadership;
    } catch (error) {
      console.error('Failed to get leadership positions:', error);
      return {};
    }
  }

  // Private helper methods

  // Merge representative data from multiple sources
  private mergeRepresentativeData(
    openStatesData: StateRepresentative[], 
    stateApiData: StateRepresentative[]
  ): StateRepresentative[] {
    const merged: StateRepresentative[] = [];
    const districtMap = new Map<number, StateRepresentative>();

    // Start with OpenStates data as base
    openStatesData.forEach(rep => {
      districtMap.set(rep.district, rep);
    });

    // Enhance with State API data
    stateApiData.forEach(rep => {
      const existing = districtMap.get(rep.district);
      if (existing) {
        // Merge the data, preferring non-empty values
        districtMap.set(rep.district, {
          ...existing,
          ...rep,
          contactInfo: {
            ...existing.contactInfo,
            ...rep.contactInfo
          },
          socialMedia: {
            ...existing.socialMedia,
            ...rep.socialMedia
          }
        });
      } else {
        districtMap.set(rep.district, rep);
      }
    });

    return Array.from(districtMap.values()).sort((a, b) => a.district - b.district);
  }

  // Get committee assignments for a legislator
  private async getCommitteeAssignments(legislativeId: string): Promise<StateCommittee[]> {
    // This would call the CA Legislature API for committee assignments
    // For now, return empty array
    return [];
  }

  // Get bills authored by a legislator
  private async getBillsAuthored(legislativeId: string): Promise<StateBill[]> {
    // This would call the CA Legislature API for authored bills
    // For now, return empty array
    return [];
  }

  // Get district offices
  private async getDistrictOffices(district: number, chamber: 'assembly' | 'senate'): Promise<any[]> {
    // This would fetch from the official CA Legislature directory
    // For now, return placeholder
    return [{
      type: 'District',
      address: {
        street: `${chamber === 'assembly' ? 'Assembly' : 'Senate'} District ${district} Office`,
        city: 'Various Locations',
        state: 'CA',
        zipCode: '00000'
      },
      phone: '000-000-0000',
      hours: 'Monday-Friday 9AM-5PM'
    }];
  }

  // Cache helpers
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export const integratedCaliforniaStateService = new IntegratedCaliforniaStateService();
export default integratedCaliforniaStateService;