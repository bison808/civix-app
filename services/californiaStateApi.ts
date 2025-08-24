import { 
  StateRepresentative, 
  CaliforniaExecutive, 
  DistrictBoundary, 
  StateBill,
  StateCommittee,
  LegislativeSession,
  CaliforniaApiResponse 
} from '../types/california-state.types';
import { 
  REAL_CA_ASSEMBLY_MEMBERS,
  REAL_CA_SENATE_MEMBERS,
  REAL_CA_COMMITTEES,
  getAssemblyMemberByDistrict,
  getSenateMemberByDistrict,
  validateCaliforniaLegislativeData
} from './realCaliforniaLegislativeData';

class CaliforniaStateApi {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours cache
  
  // Base URLs for various CA government APIs
  private LEGISLATURE_API_BASE = 'https://leginfo.legislature.ca.gov/faces/rest';
  private SECRETARY_OF_STATE_BASE = 'https://www.sos.ca.gov/api';
  private CA_GOV_BASE = 'https://www.ca.gov/api';
  private REDISTRICTING_API = 'https://api.wedrawthelines.ca.gov';

  // Get all California Assembly members (80 districts)
  async getAssemblyMembers(): Promise<StateRepresentative[]> {
    const cacheKey = 'ca-assembly-all';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // EMERGENCY FIX: Use real California Assembly data
      // This replaces ALL placeholder data with verified real representatives
      const realMembers = [...REAL_CA_ASSEMBLY_MEMBERS];
      
      // Validate data integrity before returning
      const validation = validateCaliforniaLegislativeData();
      if (!validation.isValid) {
        console.error('❌ CRITICAL: Placeholder data violations detected:', validation.violations);
        throw new Error(`EMERGENCY DATA VALIDATION FAILED: ${validation.violations.join(', ')}`);
      }
      
      this.setCache(cacheKey, realMembers);
      return realMembers;
    } catch (error) {
      console.error('Failed to fetch Assembly members:', error);
      return [];
    }
  }

  // Get all California Senate members (40 districts)
  async getSenateMembers(): Promise<StateRepresentative[]> {
    const cacheKey = 'ca-senate-all';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // EMERGENCY FIX: Use real California Senate data
      // This replaces ALL placeholder data with verified real senators
      const realMembers = [...REAL_CA_SENATE_MEMBERS];
      
      // Validate data integrity before returning
      const validation = validateCaliforniaLegislativeData();
      if (!validation.isValid) {
        console.error('❌ CRITICAL: Placeholder data violations detected:', validation.violations);
        throw new Error(`EMERGENCY DATA VALIDATION FAILED: ${validation.violations.join(', ')}`);
      }
      
      this.setCache(cacheKey, realMembers);
      return realMembers;
    } catch (error) {
      console.error('Failed to fetch Senate members:', error);
      return [];
    }
  }

  // Get California Governor
  async getGovernor(): Promise<CaliforniaExecutive | null> {
    const cacheKey = 'ca-governor';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const governor: CaliforniaExecutive = {
        id: 'ca-gov-newsom',
        name: 'Gavin Newsom',
        title: 'Governor',
        party: 'Democrat',
        termStart: '2019-01-07',
        termEnd: '2027-01-04',
        photoUrl: 'https://www.gov.ca.gov/wp-content/uploads/2019/01/Newsom-Official-Portrait-2019.jpg',
        biography: 'Gavin Christopher Newsom is an American politician and businessman serving as the 40th governor of California since 2019. A member of the Democratic Party, he served as the 49th lieutenant governor of California from 2011 to 2019 and the 42nd mayor of San Francisco from 2004 to 2011.',
        contactInfo: {
          phone: '916-445-2841',
          email: 'govpress@gov.ca.gov',
          website: 'https://www.gov.ca.gov',
          mailingAddress: {
            street: '1303 10th Street, Suite 1173',
            city: 'Sacramento',
            state: 'CA',
            zipCode: '95814'
          }
        },
        socialMedia: {
          twitter: 'GavinNewsom',
          facebook: 'GavinNewsom',
          instagram: 'gavinnewsom',
          youtube: 'GavinNewsomCA'
        },
        accomplishments: [
          {
            title: 'Climate Action Leadership',
            description: 'Led California\'s aggressive climate action initiatives including carbon neutrality by 2045',
            date: '2019-09-20',
            category: 'policy'
          },
          {
            title: 'COVID-19 Response',
            description: 'Implemented comprehensive pandemic response measures to protect California residents',
            date: '2020-03-15',
            category: 'policy'
          },
          {
            title: 'Housing First Initiative',
            description: 'Launched comprehensive housing and homelessness strategy with $12 billion investment',
            date: '2021-07-01',
            category: 'initiative'
          }
        ],
        executiveOrders: await this.getExecutiveOrders()
      };
      
      this.setCache(cacheKey, governor);
      return governor;
    } catch (error) {
      console.error('Failed to fetch Governor data:', error);
      return null;
    }
  }

  // Get California Lieutenant Governor
  async getLieutenantGovernor(): Promise<CaliforniaExecutive | null> {
    const cacheKey = 'ca-lt-governor';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const ltGovernor: CaliforniaExecutive = {
        id: 'ca-ltgov-kounalakis',
        name: 'Eleni Kounalakis',
        title: 'Lieutenant Governor',
        party: 'Democrat',
        termStart: '2019-01-07',
        termEnd: '2027-01-04',
        photoUrl: 'https://ltg.ca.gov/images/ltgov-headshot.jpg',
        biography: 'Eleni Kounalakis is an American politician, businesswoman, and former diplomat serving as the 50th lieutenant governor of California since 2019. She is the first woman elected to the position.',
        contactInfo: {
          phone: '916-445-8994',
          website: 'https://ltg.ca.gov',
          mailingAddress: {
            street: '1303 10th Street, Suite 1173',
            city: 'Sacramento',
            state: 'CA',
            zipCode: '95814'
          }
        },
        socialMedia: {
          twitter: 'EleniForCA',
          facebook: 'EleniKounalakis'
        },
        accomplishments: [
          {
            title: 'International Trade Leadership',
            description: 'Led California\'s international trade and diplomatic initiatives',
            date: '2019-01-07',
            category: 'initiative'
          },
          {
            title: 'Women\'s Rights Advocacy',
            description: 'Championed women\'s economic empowerment and reproductive rights',
            date: '2020-01-01',
            category: 'policy'
          }
        ]
      };
      
      this.setCache(cacheKey, ltGovernor);
      return ltGovernor;
    } catch (error) {
      console.error('Failed to fetch Lieutenant Governor data:', error);
      return null;
    }
  }

  // Get district boundaries for Assembly or Senate district
  async getDistrictBoundaries(district: number, chamber: 'assembly' | 'senate'): Promise<DistrictBoundary | null> {
    const cacheKey = `district-boundary-${chamber}-${district}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // This would call the California redistricting API
      // EMERGENCY FIX: Return basic structure while API integration is developed
      const boundary: DistrictBoundary = {
        district,
        chamber,
        geometry: {
          type: 'Polygon',
          coordinates: [[]] // Basic structure - coordinates need API integration
        },
        properties: {
          name: `${chamber === 'assembly' ? 'Assembly' : 'Senate'} District ${district}`,
          population: chamber === 'assembly' ? 465674 : 931348, // Approximate based on 2020 census
          demographics: {
            totalPopulation: chamber === 'assembly' ? 465674 : 931348,
            ageGroups: {},
            ethnicityBreakdown: {},
            incomeMedian: 0,
            educationLevels: {}
          }
        }
      };
      
      this.setCache(cacheKey, boundary);
      return boundary;
    } catch (error) {
      console.error('Failed to fetch district boundaries:', error);
      return null;
    }
  }

  // Get Assembly member by district - REAL DATA ONLY
  private async getAssemblyMemberByDistrict(district: number): Promise<StateRepresentative | null> {
    try {
      // EMERGENCY FIX: Return real California Assembly member data
      const realMember = getAssemblyMemberByDistrict(district);
      
      if (!realMember) {
        console.warn(`⚠️ No Assembly member found for district ${district} - data may be incomplete`);
        return null;
      }
      
      // Validate the returned data doesn't contain placeholders
      if (realMember.name.includes('Assembly Member District') || 
          realMember.name.includes('Placeholder') ||
          realMember.contactInfo.phone === '555-555-5555') {
        console.error(`❌ CRITICAL: Placeholder data detected for Assembly district ${district}: ${realMember.name}`);
        throw new Error(`PLACEHOLDER DATA VIOLATION in Assembly district ${district}`);
      }
      
      return realMember;
    } catch (error) {
      console.error(`Failed to fetch Assembly member for district ${district}:`, error);
      return null;
    }
  }

  // Get Senate member by district - REAL DATA ONLY
  private async getSenateMemberByDistrict(district: number): Promise<StateRepresentative | null> {
    try {
      // EMERGENCY FIX: Return real California Senate member data
      const realMember = getSenateMemberByDistrict(district);
      
      if (!realMember) {
        console.warn(`⚠️ No Senate member found for district ${district} - data may be incomplete`);
        return null;
      }
      
      // Validate the returned data doesn't contain placeholders
      if (realMember.name.includes('Senator District') || 
          realMember.name.includes('Placeholder') ||
          realMember.contactInfo.phone === '555-555-5555') {
        console.error(`❌ CRITICAL: Placeholder data detected for Senate district ${district}: ${realMember.name}`);
        throw new Error(`PLACEHOLDER DATA VIOLATION in Senate district ${district}`);
      }
      
      return realMember;
    } catch (error) {
      console.error(`Failed to fetch Senate member for district ${district}:`, error);
      return null;
    }
  }

  // Get current legislative session
  async getCurrentLegislativeSession(): Promise<LegislativeSession> {
    return {
      year: '2024-2025',
      type: 'regular',
      startDate: '2024-12-02',
      endDate: '2025-08-31',
      status: 'active',
      billsIntroduced: 0,
      billsPassed: 0,
      specialFocus: ['Housing Crisis', 'Climate Change', 'Healthcare Access', 'Economic Recovery']
    };
  }

  // Get executive orders (for Governor)
  private async getExecutiveOrders() {
    // This would fetch from the Governor's office API
    return [];
  }

  // Fetch data from OpenStates API
  private async fetchFromOpenStates(chamber: 'assembly' | 'senate'): Promise<any[]> {
    try {
      const chamberId = chamber === 'assembly' ? 'lower' : 'upper';
      // API call would go here
      return [];
    } catch (error) {
      console.error('Failed to fetch from OpenStates:', error);
      return [];
    }
  }

  // Fetch data from CA Legislature API
  private async fetchFromLegislature(chamber: 'assembly' | 'senate'): Promise<any[]> {
    try {
      // API call would go here
      return [];
    } catch (error) {
      console.error('Failed to fetch from Legislature API:', error);
      return [];
    }
  }

  // Find district by ZIP code
  async findDistrictByZip(zipCode: string): Promise<{ assembly: number; senate: number } | null> {
    const cacheKey = `zip-to-district-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // AGENT SARAH FIX: Use comprehensive California district boundary service
      const { californiaDistrictBoundaryService } = await import('./californiaDistrictBoundaryService');
      const districtData = await californiaDistrictBoundaryService.getDistrictsForZipCode(zipCode);
      
      const result = {
        assembly: districtData.assemblyDistrict,
        senate: districtData.senateDistrict
      };

      console.log(`✅ ZIP ${zipCode} mapped to Assembly District ${result.assembly}, Senate District ${result.senate} (accuracy: ${districtData.accuracy})`);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to find district by ZIP:', error);
      return null;
    }
  }

  // Get all committees for a chamber - REAL DATA ONLY
  async getCommittees(chamber?: 'assembly' | 'senate' | 'joint'): Promise<StateCommittee[]> {
    const cacheKey = `committees-${chamber || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // EMERGENCY FIX: Use real California committee data
      let committees = [...REAL_CA_COMMITTEES];
      
      // Filter by chamber if specified
      if (chamber) {
        committees = committees.filter(c => c.chamber === chamber);
      }
      
      // Validate committee data
      for (const committee of committees) {
        if (committee.name.includes('Generic') || 
            committee.name.includes('Placeholder')) {
          console.error(`❌ CRITICAL: Placeholder committee data detected: ${committee.name}`);
          throw new Error(`PLACEHOLDER COMMITTEE DATA VIOLATION: ${committee.name}`);
        }
      }
      
      this.setCache(cacheKey, committees);
      return committees;
    } catch (error) {
      console.error('Failed to fetch committees:', error);
      return [];
    }
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

export const californiaStateApi = new CaliforniaStateApi();
export default californiaStateApi;