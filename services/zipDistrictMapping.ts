import {
  ZipDistrictMapping,
  MultiDistrictMapping,
  RepresentativeWithDistrict,
  DistrictLookupOptions,
  CaliforniaZipCodeData,
  DistrictMappingError,
  DistrictMappingErrorResponse
} from '../types/districts.types';
import { Representative } from '../types/representatives.types';
import { geocodingService } from './geocodingService';
import { representativesService } from './representatives.service';

class ZipDistrictMappingService {
  private californiaZipData: Map<string, CaliforniaZipCodeData> = new Map();
  private districtRepresentativesCache: Map<string, RepresentativeWithDistrict[]> = new Map();
  private readonly CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.loadCaliforniaZipData();
  }

  private loadCaliforniaZipData(): void {
    // Pre-load known California ZIP code data for faster fallbacks
    // This data would typically come from a comprehensive database
    const knownZips: CaliforniaZipCodeData[] = [
      // Los Angeles area
      { zipCode: '90210', city: 'Beverly Hills', county: 'Los Angeles County', congressionalDistrict: 30 },
      { zipCode: '90211', city: 'Beverly Hills', county: 'Los Angeles County', congressionalDistrict: 30 },
      { zipCode: '90001', city: 'Los Angeles', county: 'Los Angeles County', congressionalDistrict: 44 },
      { zipCode: '91101', city: 'Pasadena', county: 'Los Angeles County', congressionalDistrict: 28 },
      
      // San Francisco area
      { zipCode: '94102', city: 'San Francisco', county: 'San Francisco County', congressionalDistrict: 11 },
      { zipCode: '94103', city: 'San Francisco', county: 'San Francisco County', congressionalDistrict: 11 },
      { zipCode: '94104', city: 'San Francisco', county: 'San Francisco County', congressionalDistrict: 11 },
      
      // San Jose area
      { zipCode: '95110', city: 'San Jose', county: 'Santa Clara County', congressionalDistrict: 16 },
      { zipCode: '95111', city: 'San Jose', county: 'Santa Clara County', congressionalDistrict: 16 },
      
      // Sacramento area
      { zipCode: '95814', city: 'Sacramento', county: 'Sacramento County', congressionalDistrict: 7 },
      { zipCode: '95815', city: 'Sacramento', county: 'Sacramento County', congressionalDistrict: 7 },
      
      // San Diego area
      { zipCode: '92101', city: 'San Diego', county: 'San Diego County', congressionalDistrict: 53 },
      { zipCode: '92102', city: 'San Diego', county: 'San Diego County', congressionalDistrict: 53 },
    ];

    knownZips.forEach(zip => {
      this.californiaZipData.set(zip.zipCode, zip);
    });
  }

  async getDistrictsForZipCode(
    zipCode: string,
    options: DistrictLookupOptions = {}
  ): Promise<ZipDistrictMapping | MultiDistrictMapping> {
    try {
      return await geocodingService.getDistrictsForZip(zipCode, options);
    } catch (error) {
      // Fallback to local data if available
      const localData = this.californiaZipData.get(zipCode);
      if (localData && options.includeFallback !== false) {
        return {
          zipCode: localData.zipCode,
          congressionalDistrict: localData.congressionalDistrict || 0,
          stateSenateDistrict: localData.stateSenateDistrict || 0,
          stateAssemblyDistrict: localData.stateAssemblyDistrict || 0,
          county: localData.county,
          city: localData.city,
          coordinates: [-119.4179, 36.7783], // California center
          accuracy: 0.7,
          source: 'fallback',
          lastUpdated: new Date().toISOString()
        } as ZipDistrictMapping;
      }
      throw error;
    }
  }

  async getRepresentativesByZipCode(
    zipCode: string,
    options: DistrictLookupOptions = {}
  ): Promise<RepresentativeWithDistrict[]> {
    const cacheKey = `${zipCode}_${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.districtRepresentativesCache.get(cacheKey);
    if (cached && options.useCache !== false) {
      return cached;
    }

    try {
      // Get district mapping
      const districtMapping = await this.getDistrictsForZipCode(zipCode, options);
      
      // Get representatives for each level of government
      const representatives: RepresentativeWithDistrict[] = [];

      // Federal representatives
      const federalReps = await this.getFederalRepresentatives(districtMapping);
      representatives.push(...federalReps);

      // State representatives
      const stateReps = await this.getStateRepresentatives(districtMapping);
      representatives.push(...stateReps);

      // Local representatives (county/city)
      const localReps = await this.getLocalRepresentatives(districtMapping);
      representatives.push(...localReps);

      // Cache the result
      this.districtRepresentativesCache.set(cacheKey, representatives);
      
      // Clean up cache periodically
      if (this.districtRepresentativesCache.size > 100) {
        this.cleanupCache();
      }

      return representatives;
    } catch (error) {
      // Fallback to existing service if district mapping fails
      try {
        const existingReps = await representativesService.getRepresentativesByZipCode(zipCode);
        return existingReps.map(rep => this.convertToDistrictRepresentative(rep, zipCode));
      } catch (fallbackError) {
        throw error; // Re-throw original error if fallback also fails
      }
    }
  }

  private async getFederalRepresentatives(
    mapping: ZipDistrictMapping | MultiDistrictMapping
  ): Promise<RepresentativeWithDistrict[]> {
    const representatives: RepresentativeWithDistrict[] = [];

    try {
      // Get existing federal representatives and enhance them
      const state = 'CA'; // Currently focused on California
      
      if ('congressionalDistrict' in mapping) {
        // Single district
        const districtReps = await representativesService.getRepresentativesByDistrict(
          state, 
          mapping.congressionalDistrict.toString()
        );
        representatives.push(...districtReps.map(rep => 
          this.convertToDistrictRepresentative(rep, mapping.zipCode, 'federal')
        ));
      } else {
        // Multi-district - get representatives for primary district
        const districtReps = await representativesService.getRepresentativesByDistrict(
          state, 
          mapping.primaryDistricts.congressional.toString()
        );
        representatives.push(...districtReps.map(rep => 
          this.convertToDistrictRepresentative(rep, mapping.zipCode, 'federal')
        ));
      }

      // Add senators (they represent the entire state)
      const senators = await representativesService.getRepresentativesByState(state);
      const senatorReps = senators.filter(rep => rep.chamber === 'Senate');
      representatives.push(...senatorReps.map(rep => 
        this.convertToDistrictRepresentative(rep, mapping.zipCode, 'federal')
      ));

    } catch (error) {
      console.warn('Failed to fetch federal representatives:', error);
    }

    return representatives;
  }

  private async getStateRepresentatives(
    mapping: ZipDistrictMapping | MultiDistrictMapping
  ): Promise<RepresentativeWithDistrict[]> {
    const representatives: RepresentativeWithDistrict[] = [];

    // This would integrate with California state legislature data
    // For now, create placeholder representatives based on district numbers
    
    const senateDistrict = 'stateSenateDistrict' in mapping 
      ? mapping.stateSenateDistrict 
      : mapping.primaryDistricts.stateSenate;
    
    const assemblyDistrict = 'stateAssemblyDistrict' in mapping 
      ? mapping.stateAssemblyDistrict 
      : mapping.primaryDistricts.stateAssembly;

    if (senateDistrict > 0) {
      representatives.push({
        id: `ca-senate-${senateDistrict}`,
        name: `State Senator (District ${senateDistrict})`,
        title: 'State Senator',
        party: 'Democrat', // Placeholder
        level: 'state',
        chamber: 'Senate',
        state: 'CA',
        district: `Senate District ${senateDistrict}`,
        districtNumber: senateDistrict,
        jurisdictions: [mapping.zipCode],
        contactInfo: {
          phone: '916-651-4000', // California State Senate
          website: 'https://www.senate.ca.gov',
          email: `district${senateDistrict}@senate.ca.gov`
        },
        termStart: '2023-01-01',
        termEnd: '2026-12-31'
      });
    }

    if (assemblyDistrict > 0) {
      representatives.push({
        id: `ca-assembly-${assemblyDistrict}`,
        name: `Assembly Member (District ${assemblyDistrict})`,
        title: 'Assembly Member',
        party: 'Democrat', // Placeholder
        level: 'state',
        chamber: 'Assembly',
        state: 'CA',
        district: `Assembly District ${assemblyDistrict}`,
        districtNumber: assemblyDistrict,
        jurisdictions: [mapping.zipCode],
        contactInfo: {
          phone: '916-319-2000', // California State Assembly
          website: 'https://www.assembly.ca.gov',
          email: `district${assemblyDistrict}@asm.ca.gov`
        },
        termStart: '2023-01-01',
        termEnd: '2024-12-31'
      });
    }

    return representatives;
  }

  private async getLocalRepresentatives(
    mapping: ZipDistrictMapping | MultiDistrictMapping
  ): Promise<RepresentativeWithDistrict[]> {
    const representatives: RepresentativeWithDistrict[] = [];

    // County representatives
    representatives.push({
      id: `county-supervisor-${mapping.county.replace(/\s+/g, '-').toLowerCase()}`,
      name: `County Supervisor`,
      title: 'County Supervisor',
      party: 'Independent',
      level: 'county',
      chamber: 'Commission',
      state: 'CA',
      district: mapping.county,
      jurisdictions: [mapping.zipCode],
      contactInfo: {
        phone: '411', // Information
        website: `https://www.${mapping.county.replace(/\s+/g, '').toLowerCase()}.gov`,
      },
      termStart: '2022-01-01',
      termEnd: '2026-01-01'
    });

    // City representatives
    if (mapping.city && mapping.city !== 'Unknown City') {
      representatives.push({
        id: `mayor-${mapping.city.replace(/\s+/g, '-').toLowerCase()}`,
        name: `Mayor of ${mapping.city}`,
        title: 'Mayor',
        party: 'Independent',
        level: 'local',
        chamber: 'Council',
        state: 'CA',
        district: mapping.city,
        jurisdictions: [mapping.zipCode],
        contactInfo: {
          phone: '311', // City services
          website: `https://www.${mapping.city.replace(/\s+/g, '').toLowerCase()}.gov`,
          email: `mayor@${mapping.city.replace(/\s+/g, '').toLowerCase()}.gov`
        },
        termStart: '2022-01-01',
        termEnd: '2026-01-01'
      });
    }

    return representatives;
  }

  private convertToDistrictRepresentative(
    rep: Representative,
    zipCode: string,
    level: 'federal' | 'state' | 'county' | 'local' = 'federal'
  ): RepresentativeWithDistrict {
    return {
      ...rep,
      level,
      districtNumber: rep.district ? (typeof rep.district === 'number' ? rep.district : parseInt(rep.district)) : undefined,
      jurisdictions: [zipCode]
    } as RepresentativeWithDistrict;
  }

  private cleanupCache(): void {
    // Simple cleanup: remove half of the oldest entries
    const entries = Array.from(this.districtRepresentativesCache.entries());
    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    
    toRemove.forEach(([key]) => {
      this.districtRepresentativesCache.delete(key);
    });
  }

  async batchProcessZipCodes(
    zipCodes: string[],
    options: DistrictLookupOptions = {}
  ): Promise<{
    zipCode: string;
    districts: ZipDistrictMapping | MultiDistrictMapping;
    representatives: RepresentativeWithDistrict[];
  }[]> {
    const results = [];

    // Process in smaller batches to avoid overwhelming the API
    const batchSize = 25;
    for (let i = 0; i < zipCodes.length; i += batchSize) {
      const batch = zipCodes.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (zipCode) => {
        try {
          const districts = await this.getDistrictsForZipCode(zipCode, options);
          const representatives = await this.getRepresentativesByZipCode(zipCode, options);
          
          return {
            zipCode,
            districts,
            representatives
          };
        } catch (error) {
          console.warn(`Failed to process ZIP code ${zipCode}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));

      // Add delay between batches
      if (i + batchSize < zipCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results as {
      zipCode: string;
      districts: ZipDistrictMapping | MultiDistrictMapping;
      representatives: RepresentativeWithDistrict[];
    }[];
  }

  // Validate if a ZIP code is in California
  async isCaliforniaZipCode(zipCode: string): Promise<boolean> {
    try {
      const mapping = await this.getDistrictsForZipCode(zipCode, { useCache: true });
      return mapping.coordinates[1] >= 32.5 && mapping.coordinates[1] <= 42.0 &&
             mapping.coordinates[0] >= -124.4 && mapping.coordinates[0] <= -114.1;
    } catch (error) {
      // Fallback to ZIP code prefix check
      return zipCode.startsWith('9') || zipCode.startsWith('8'); // CA ZIP codes
    }
  }

  // Get all ZIP codes for a specific district
  async getZipCodesForDistrict(
    districtType: 'congressional' | 'stateSenate' | 'stateAssembly',
    districtNumber: number
  ): Promise<string[]> {
    const allZipCodes = await geocodingService.getAllCaliforniaZipCodes();
    const matchingZips: string[] = [];

    // This would be more efficient with a reverse lookup index
    for (const zipCode of allZipCodes) {
      try {
        const mapping = await this.getDistrictsForZipCode(zipCode, { useCache: true });
        
        let matches = false;
        if ('congressionalDistrict' in mapping) {
          matches = (districtType === 'congressional' && mapping.congressionalDistrict === districtNumber) ||
                   (districtType === 'stateSenate' && mapping.stateSenateDistrict === districtNumber) ||
                   (districtType === 'stateAssembly' && mapping.stateAssemblyDistrict === districtNumber);
        } else {
          matches = (districtType === 'congressional' && mapping.districts.congressional.includes(districtNumber)) ||
                   (districtType === 'stateSenate' && mapping.districts.stateSenate.includes(districtNumber)) ||
                   (districtType === 'stateAssembly' && mapping.districts.stateAssembly.includes(districtNumber));
        }
        
        if (matches) {
          matchingZips.push(zipCode);
        }
      } catch (error) {
        // Skip ZIP codes that can't be processed
        continue;
      }
    }

    return matchingZips;
  }

  // Clear all caches
  clearAllCaches(): void {
    this.districtRepresentativesCache.clear();
    geocodingService.clearCache();
  }

  // Get service statistics
  getServiceStats(): {
    cacheSize: number;
    knownZipCodes: number;
    geocodingStats: any;
  } {
    return {
      cacheSize: this.districtRepresentativesCache.size,
      knownZipCodes: this.californiaZipData.size,
      geocodingStats: geocodingService.getCacheStats()
    };
  }
}

export const zipDistrictMappingService = new ZipDistrictMappingService();
export default zipDistrictMappingService;