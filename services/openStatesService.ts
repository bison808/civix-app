// OpenStates Service - Fetches real state legislator data
import { Representative } from '@/types';
import { StateRepresentative, StateBill, StateCommittee, LegislativeSession, CaliforniaExecutive } from '../types/california-state.types';
import { civicInfoService } from './civicInfoService';

// State abbreviation mapping
const STATE_ABBREV: Record<string, string> = {
  'Alabama': 'al', 'Alaska': 'ak', 'Arizona': 'az', 'Arkansas': 'ar', 'California': 'ca',
  'Colorado': 'co', 'Connecticut': 'ct', 'Delaware': 'de', 'Florida': 'fl', 'Georgia': 'ga',
  'Hawaii': 'hi', 'Idaho': 'id', 'Illinois': 'il', 'Indiana': 'in', 'Iowa': 'ia',
  'Kansas': 'ks', 'Kentucky': 'ky', 'Louisiana': 'la', 'Maine': 'me', 'Maryland': 'md',
  'Massachusetts': 'ma', 'Michigan': 'mi', 'Minnesota': 'mn', 'Mississippi': 'ms', 'Missouri': 'mo',
  'Montana': 'mt', 'Nebraska': 'ne', 'Nevada': 'nv', 'New Hampshire': 'nh', 'New Jersey': 'nj',
  'New Mexico': 'nm', 'New York': 'ny', 'North Carolina': 'nc', 'North Dakota': 'nd', 'Ohio': 'oh',
  'Oklahoma': 'ok', 'Oregon': 'or', 'Pennsylvania': 'pa', 'Rhode Island': 'ri', 'South Carolina': 'sc',
  'South Dakota': 'sd', 'Tennessee': 'tn', 'Texas': 'tx', 'Utah': 'ut', 'Vermont': 'vt',
  'Virginia': 'va', 'Washington': 'wa', 'West Virginia': 'wv', 'Wisconsin': 'wi', 'Wyoming': 'wy',
  // Also map abbreviations to themselves
  'AL': 'al', 'AK': 'ak', 'AZ': 'az', 'AR': 'ar', 'CA': 'ca', 'CO': 'co', 'CT': 'ct',
  'DE': 'de', 'FL': 'fl', 'GA': 'ga', 'HI': 'hi', 'ID': 'id', 'IL': 'il', 'IN': 'in',
  'IA': 'ia', 'KS': 'ks', 'KY': 'ky', 'LA': 'la', 'ME': 'me', 'MD': 'md', 'MA': 'ma',
  'MI': 'mi', 'MN': 'mn', 'MS': 'ms', 'MO': 'mo', 'MT': 'mt', 'NE': 'ne', 'NV': 'nv',
  'NH': 'nh', 'NJ': 'nj', 'NM': 'nm', 'NY': 'ny', 'NC': 'nc', 'ND': 'nd', 'OH': 'oh',
  'OK': 'ok', 'OR': 'or', 'PA': 'pa', 'RI': 'ri', 'SC': 'sc', 'SD': 'sd', 'TN': 'tn',
  'TX': 'tx', 'UT': 'ut', 'VT': 'vt', 'VA': 'va', 'WA': 'wa', 'WV': 'wv', 'WI': 'wi', 'WY': 'wy'
};

export class OpenStatesService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours cache for state data
  private OPENSTATES_API_KEY = process.env.NEXT_PUBLIC_OPENSTATES_API_KEY;
  private BASE_API_URL = 'https://openstates.org/graphql';
  private LEGISLATURE_BASE_URL = 'https://leginfo.legislature.ca.gov/faces/rest';

  // Fetch state legislators from OpenStates CSV data
  async getStateLegislators(state: string): Promise<Representative[]> {
    const stateAbbrev = STATE_ABBREV[state] || STATE_ABBREV[state.toUpperCase()] || state.toLowerCase();
    const cacheKey = `state-legislators-${stateAbbrev}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Fetch CSV data from OpenStates
      const url = `https://data.openstates.org/people/current/${stateAbbrev}.csv`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch state legislators for ${state}`);
        return [];
      }

      const csvText = await response.text();
      const legislators = this.parseCSV(csvText, state);
      
      this.setCache(cacheKey, legislators);
      return legislators;
    } catch (error) {
      console.error('Failed to fetch state legislators:', error);
      return [];
    }
  }

  // Get California Assembly Members (80 districts)
  async getCaliforniaAssemblyMembers(): Promise<StateRepresentative[]> {
    const cacheKey = 'ca-assembly-members';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const legislators = await this.getEnhancedCaliforniaLegislators('assembly');
      this.setCache(cacheKey, legislators);
      return legislators;
    } catch (error) {
      console.error('Failed to fetch CA Assembly members:', error);
      return [];
    }
  }

  // Get California Senate Members (40 districts)
  async getCaliforniaSenateMembers(): Promise<StateRepresentative[]> {
    const cacheKey = 'ca-senate-members';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const legislators = await this.getEnhancedCaliforniaLegislators('senate');
      this.setCache(cacheKey, legislators);
      return legislators;
    } catch (error) {
      console.error('Failed to fetch CA Senate members:', error);
      return [];
    }
  }

  // Get California Governor and Lieutenant Governor
  async getCaliforniaExecutives(): Promise<CaliforniaExecutive[]> {
    const cacheKey = 'ca-executives';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const executives: CaliforniaExecutive[] = [
        {
          id: 'ca-gov-newsom',
          name: 'Gavin Newsom',
          title: 'Governor',
          party: 'Democrat',
          termStart: '2019-01-07',
          termEnd: '2027-01-04',
          photoUrl: 'https://www.gov.ca.gov/wp-content/uploads/2019/01/Newsom-Official-Portrait-2019.jpg',
          biography: 'Gavin Christopher Newsom is an American politician and businessman serving as the 40th governor of California since 2019.',
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
            instagram: 'gavinnewsom'
          },
          accomplishments: [],
          executiveOrders: []
        },
        {
          id: 'ca-ltgov-kounalakis',
          name: 'Eleni Kounalakis',
          title: 'Lieutenant Governor',
          party: 'Democrat',
          termStart: '2019-01-07',
          termEnd: '2027-01-04',
          photoUrl: 'https://ltg.ca.gov/images/ltgov-headshot.jpg',
          biography: 'Eleni Kounalakis is an American politician, businesswoman, and former diplomat serving as the 50th lieutenant governor of California since 2019.',
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
          accomplishments: []
        }
      ];
      
      this.setCache(cacheKey, executives);
      return executives;
    } catch (error) {
      console.error('Failed to fetch CA executives:', error);
      return [];
    }
  }

  // Parse CSV data into Representative format
  private parseCSV(csvText: string, state: string): Representative[] {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const representatives: Representative[] = [];

    // Find column indices
    const indices = {
      name: headers.indexOf('name'),
      party: headers.indexOf('current_party'),
      district: headers.indexOf('current_district'),
      chamber: headers.indexOf('current_chamber'),
      email: headers.indexOf('email'),
      image: headers.indexOf('image'),
      voice: headers.indexOf('capitol_voice'),
      address: headers.indexOf('capitol_address'),
      twitter: headers.indexOf('twitter'),
      facebook: headers.indexOf('facebook')
    };

    // Parse each legislator
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const fields = this.parseCSVLine(lines[i]);
      if (fields.length < headers.length) continue;

      const chamber = fields[indices.chamber];
      const chamberTitle = chamber === 'upper' ? 'State Senator' : 'State Representative';
      
      const partyName = fields[indices.party] || 'Unknown';
      const normalizedParty = partyName.includes('Democrat') ? 'Democrat' : 
                            partyName.includes('Republican') ? 'Republican' :
                            partyName.includes('Independent') ? 'Independent' : 'Other';
      
      const rep: Representative = {
        id: `state-${state}-${i}`,
        name: fields[indices.name] || 'Unknown',
        title: chamberTitle,
        party: normalizedParty as any,
        state: state.toUpperCase(),
        district: fields[indices.district] || 'Unknown',
        chamber: 'House' as any, // Default to House for state legislators
        contactInfo: {
          email: fields[indices.email] || '',
          phone: fields[indices.voice] || '',
          website: ''
        },
        socialMedia: {
          twitter: fields[indices.twitter] || undefined,
          facebook: fields[indices.facebook] || undefined
        },
        photoUrl: fields[indices.image] || undefined,
        termStart: '2023-01-01', // Default values
        termEnd: '2025-01-01',
        level: 'state',
        jurisdiction: state,
        governmentType: 'state',
        jurisdictionScope: 'district'
      };

      representatives.push(rep);
    }

    return representatives;
  }

  // Parse a single CSV line handling quoted fields
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result;
  }

  // Get local government officials (mayors, city council)
  async getLocalOfficials(city: string, state: string): Promise<Representative[]> {
    // Use the civic info service to get real local officials
    return await civicInfoService.getLocalOfficials(city, state);
  }

  // Enhanced method to get California legislators with detailed information
  private async getEnhancedCaliforniaLegislators(chamber: 'assembly' | 'senate'): Promise<StateRepresentative[]> {
    const csvUrl = `https://data.openstates.org/people/current/ca.csv`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CA ${chamber} data`);
    }

    const csvText = await response.text();
    const allLegislators = this.parseEnhancedCSV(csvText, chamber);
    
    // Filter by chamber and enhance with additional data
    const chamberId = chamber === 'assembly' ? 'lower' : 'upper';
    const filtered = allLegislators.filter(leg => leg.chamber === chamber);
    
    // Add district office information for each legislator
    for (const legislator of filtered) {
      legislator.districtOffices = await this.getDistrictOffices(legislator.district, chamber);
      legislator.committees = await this.getCommitteeAssignments(legislator.legislativeId);
    }
    
    return filtered;
  }

  // Enhanced CSV parser for California-specific data
  private parseEnhancedCSV(csvText: string, targetChamber: 'assembly' | 'senate'): StateRepresentative[] {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const legislators: StateRepresentative[] = [];

    // Find column indices
    const indices = {
      name: headers.indexOf('name'),
      party: headers.indexOf('current_party'),
      district: headers.indexOf('current_district'),
      chamber: headers.indexOf('current_chamber'),
      email: headers.indexOf('email'),
      image: headers.indexOf('image'),
      voice: headers.indexOf('capitol_voice'),
      address: headers.indexOf('capitol_address'),
      twitter: headers.indexOf('twitter'),
      facebook: headers.indexOf('facebook'),
      id: headers.indexOf('id')
    };

    // Parse each legislator
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const fields = this.parseCSVLine(lines[i]);
      if (fields.length < headers.length) continue;

      const chamber = fields[indices.chamber];
      const chamberType = chamber === 'upper' ? 'senate' : 'assembly';
      
      // Skip if not the target chamber
      if (chamberType !== targetChamber) continue;
      
      const partyName = fields[indices.party] || 'Unknown';
      const normalizedParty = partyName.includes('Democrat') ? 'Democrat' : 
                            partyName.includes('Republican') ? 'Republican' :
                            partyName.includes('Independent') ? 'Independent' : 'Other';
      
      const district = parseInt(fields[indices.district]) || 0;
      const legislativeId = fields[indices.id] || `ca-${chamberType}-${district}`;
      
      const rep: StateRepresentative = {
        id: `state-ca-${chamberType}-${district}`,
        legislativeId,
        name: fields[indices.name] || 'Unknown',
        title: chamberType === 'senate' ? 'State Senator' : 'Assembly Member',
        party: normalizedParty as any,
        chamber: chamberType,
        state: 'CA',
        district,
        leadership: null, // Will be populated separately
        committees: [], // Will be populated separately
        billsAuthored: [], // Will be populated separately
        votingRecord: {
          totalVotes: 0,
          yesVotes: 0,
          noVotes: 0,
          abstentions: 0,
          presentVotes: 0,
          notVoting: 0,
          sessionYear: '2024-2025',
          partyUnityScore: 0,
          bipartisanScore: 0,
          keyVotes: []
        },
        districtOffices: [], // Will be populated separately
        sessionYear: '2024-2025',
        contactInfo: {
          phone: fields[indices.voice] || '',
          email: fields[indices.email] || '',
          website: ''
        },
        socialMedia: {
          twitter: fields[indices.twitter] || undefined,
          facebook: fields[indices.facebook] || undefined
        },
        photoUrl: fields[indices.image] || undefined,
        termStart: '2023-01-01',
        termEnd: '2025-01-01',
        level: 'state',
        jurisdiction: 'California',
        governmentType: 'state',
        jurisdictionScope: 'district'
      };

      legislators.push(rep);
    }

    return legislators;
  }

  // Get district offices for a legislator
  private async getDistrictOffices(district: number, chamber: 'assembly' | 'senate'): Promise<any[]> {
    // This would typically call the CA Legislature API or scrape official websites
    // For now, return placeholder data
    return [
      {
        type: 'District',
        address: {
          street: `District ${district} Office`,
          city: 'Various',
          state: 'CA',
          zipCode: '00000'
        },
        phone: '000-000-0000',
        hours: 'Monday-Friday 9AM-5PM'
      }
    ];
  }

  // Get committee assignments
  private async getCommitteeAssignments(legislativeId: string): Promise<any[]> {
    // This would call the CA Legislature API for committee data
    // For now, return placeholder data
    return [];
  }

  // Get current legislative session info
  async getCurrentSession(): Promise<LegislativeSession> {
    return {
      year: '2024-2025',
      type: 'regular',
      startDate: '2024-12-02',
      endDate: '2025-08-31',
      status: 'active',
      billsIntroduced: 0,
      billsPassed: 0,
      specialFocus: ['Housing', 'Climate Change', 'Healthcare']
    };
  }

  // Get bills authored by a legislator
  async getLegislatorBills(legislativeId: string, sessionYear?: string): Promise<StateBill[]> {
    const session = sessionYear || '2024-2025';
    const cacheKey = `bills-${legislativeId}-${session}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // This would call the CA Legislature API
      // For now, return empty array
      const bills: StateBill[] = [];
      this.setCache(cacheKey, bills);
      return bills;
    } catch (error) {
      console.error('Failed to fetch legislator bills:', error);
      return [];
    }
  }

  // Get district by ZIP code for California
  async getDistrictByZip(zipCode: string): Promise<{ assembly: number; senate: number } | null> {
    const cacheKey = `district-zip-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // This would call the CA redistricting API or similar service
      // For now, return null to indicate no data
      return null;
    } catch (error) {
      console.error('Failed to get district by ZIP:', error);
      return null;
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

export const openStatesService = new OpenStatesService();