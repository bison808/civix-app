import { ZipDistrictMapping, MultiDistrictMapping } from '../types/districts.types';

export interface CoverageLevel {
  type: 'full_coverage' | 'federal_only' | 'not_supported';
  showFederal: boolean;
  showState: boolean;
  showLocal: boolean;
  message: string;
  collectEmail?: boolean;
  expandMessage?: string;
}

export interface LocationData {
  city: string;
  state: string;
  county: string;
  zipCode: string;
  coordinates: [number, number];
  districts: {
    congressional: number;
    stateSenate?: number;
    stateAssembly?: number;
  };
}

class CoverageDetectionService {
  // States with full political data coverage (Phase 1: only CA)
  private fullCoverageStates = new Set(['CA', 'California']);

  // States with federal-only coverage (all other US states)
  private federalOnlyStates = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 
    'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 
    'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 
    'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC' // Washington D.C.
  ]);

  determineUserExperience(locationData: LocationData): CoverageLevel {
    const state = this.normalizeState(locationData.state);

    if (this.fullCoverageStates.has(state)) {
      return {
        type: 'full_coverage',
        showFederal: true,
        showState: true,
        showLocal: true,
        message: `Complete political information for ${locationData.city}, ${state}`
      };
    }

    if (this.federalOnlyStates.has(state) || this.isUSState(state)) {
      return {
        type: 'federal_only',
        showFederal: true,
        showState: false,
        showLocal: false,
        message: `Federal representatives for ${locationData.city}, ${this.getStateName(state)}`,
        collectEmail: true,
        expandMessage: `We're working to add ${this.getStateName(state)} state and local data - join the waitlist!`
      };
    }

    return {
      type: 'not_supported',
      showFederal: false,
      showState: false,
      showLocal: false,
      message: 'Location not supported',
      collectEmail: true,
      expandMessage: 'Help us expand to your area - let us know where you\'d like to see coverage!'
    };
  }

  private normalizeState(state: string): string {
    // Handle full state names to abbreviations
    const stateMapping: Record<string, string> = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY', 'Washington DC': 'DC', 'District of Columbia': 'DC'
    };

    return stateMapping[state] || state.toUpperCase();
  }

  private getStateName(stateCode: string): string {
    const stateNames: Record<string, string> = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington D.C.'
    };

    return stateNames[stateCode] || stateCode;
  }

  private isUSState(state: string): boolean {
    const normalizedState = this.normalizeState(state);
    return this.fullCoverageStates.has(normalizedState) || 
           this.federalOnlyStates.has(normalizedState);
  }

  // Convert district mapping to location data format
  convertDistrictMappingToLocationData(mapping: ZipDistrictMapping | MultiDistrictMapping): LocationData {
    const isMultiDistrict = 'districts' in mapping;
    
    return {
      city: mapping.city,
      state: mapping.state,
      county: mapping.county,
      zipCode: mapping.zipCode,
      coordinates: mapping.coordinates,
      districts: {
        congressional: isMultiDistrict 
          ? mapping.primaryDistricts.congressional 
          : mapping.congressionalDistrict,
        stateSenate: isMultiDistrict 
          ? mapping.primaryDistricts.stateSenate 
          : mapping.stateSenateDistrict,
        stateAssembly: isMultiDistrict 
          ? mapping.primaryDistricts.stateAssembly 
          : mapping.stateAssemblyDistrict
      }
    };
  }

  // Process ZIP code and determine coverage
  async processZipCode(
    zipCode: string,
    geocodingService: any
  ): Promise<{
    locationData: LocationData;
    coverage: CoverageLevel;
  }> {
    try {
      // Get real geographic data from geocoding service
      const mapping = await geocodingService.getDistrictsForZip(zipCode);
      const locationData = this.convertDistrictMappingToLocationData(mapping);
      const coverage = this.determineUserExperience(locationData);

      return { locationData, coverage };
    } catch (error) {
      throw new Error(`Failed to process ZIP code ${zipCode}: ${error}`);
    }
  }

  // Get states that need Phase 2 expansion
  getFederalOnlyStates(): string[] {
    return Array.from(this.federalOnlyStates)
      .map(code => this.getStateName(code))
      .sort();
  }

  // Check if a state has full coverage
  hasFullCoverage(state: string): boolean {
    return this.fullCoverageStates.has(this.normalizeState(state));
  }

  // Get coverage statistics
  getCoverageStats(): {
    fullCoverageStates: number;
    federalOnlyStates: number;
    totalSupportedStates: number;
  } {
    return {
      fullCoverageStates: this.fullCoverageStates.size,
      federalOnlyStates: this.federalOnlyStates.size,
      totalSupportedStates: this.fullCoverageStates.size + this.federalOnlyStates.size
    };
  }
}

export const coverageDetectionService = new CoverageDetectionService();
export default coverageDetectionService;