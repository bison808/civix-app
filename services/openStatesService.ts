// OpenStates Service - Fetches real state legislator data
import { Representative } from '@/types';

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
        termEnd: '2025-01-01'
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
  getLocalOfficials(city: string, state: string): Representative[] {
    // For local officials, we'll return mock data since there's no comprehensive free API
    // In production, you'd integrate with local government websites or APIs
    return [
      {
        id: `mayor-${city}`,
        name: `Mayor of ${city}`,
        title: 'Mayor',
        party: 'Independent' as any,
        state: state,
        district: city,
        chamber: 'House' as any,
        contactInfo: {
          phone: '311',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}.gov`,
          email: `mayor@${city.toLowerCase().replace(/\s+/g, '')}.gov`
        },
        socialMedia: {},
        termStart: '2022-01-01',
        termEnd: '2026-01-01'
      },
      {
        id: `council-${city}-1`,
        name: `City Council District 1`,
        title: 'City Council Member',
        party: 'Democrat' as any,
        state: state,
        district: 'District 1',
        chamber: 'House' as any,
        contactInfo: {
          phone: '311',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}.gov/council`,
          email: `council@${city.toLowerCase().replace(/\s+/g, '')}.gov`
        },
        socialMedia: {},
        termStart: '2023-01-01',
        termEnd: '2025-01-01'
      }
    ];
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