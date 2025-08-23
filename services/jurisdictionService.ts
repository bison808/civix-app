/**
 * Jurisdiction Detection Service
 * Determines whether a ZIP code is in an incorporated city or unincorporated area
 * and provides appropriate representative filtering rules
 */

import {
  JurisdictionType,
  AreaClassification,
  JurisdictionInfo,
  JurisdictionDetectionResult,
  RepresentativeLevel,
  JurisdictionRepresentativeRules,
  IncorporatedCity,
  CensusDesignatedPlace,
  JurisdictionDetectionRules
} from '@/types/jurisdiction.types';
import { ZipDistrictMapping, MultiDistrictMapping } from '@/types/districts.types';

class JurisdictionService {
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private cache: Map<string, { result: JurisdictionDetectionResult; timestamp: number }> = new Map();
  
  // Known incorporated cities in California (this would be expanded with real data)
  private incorporatedCities: IncorporatedCity[] = [
    { name: 'Beverly Hills', county: 'Los Angeles County', zipCodes: ['90210', '90211', '90212'], governmentType: 'city' },
    { name: 'Los Angeles', county: 'Los Angeles County', zipCodes: ['90001', '90002', '90003'], governmentType: 'charter_city' },
    { name: 'San Francisco', county: 'San Francisco County', zipCodes: ['94101', '94102', '94103'], governmentType: 'charter_city' },
    { name: 'San Diego', county: 'San Diego County', zipCodes: ['92101', '92102', '92103'], governmentType: 'charter_city' },
    { name: 'Sacramento', county: 'Sacramento County', zipCodes: ['95814', '95815', '95816'], governmentType: 'charter_city' },
    { name: 'San Jose', county: 'Santa Clara County', zipCodes: ['95110', '95111', '95112'], governmentType: 'charter_city' },
    { name: 'Pasadena', county: 'Los Angeles County', zipCodes: ['91101', '91102', '91103'], governmentType: 'city' }
  ];

  // Known unincorporated areas and Census Designated Places
  private censusDesignatedPlaces: CensusDesignatedPlace[] = [
    { name: 'East Los Angeles', county: 'Los Angeles County', zipCodes: ['90022', '90023'], isUnincorporated: true, population: 120000 },
    { name: 'Altadena', county: 'Los Angeles County', zipCodes: ['91001', '91002'], isUnincorporated: true, population: 42000 },
    { name: 'West Athens', county: 'Los Angeles County', zipCodes: ['90044'], isUnincorporated: true, population: 9000 },
    { name: 'East Palo Alto', county: 'San Mateo County', zipCodes: ['94303'], isUnincorporated: true, population: 30000 },
    { name: 'Lamont', county: 'Kern County', zipCodes: ['93241'], isUnincorporated: true, population: 15000 }
  ];

  // Detection rules for when exact data isn't available
  private detectionRules: JurisdictionDetectionRules = {
    cityNamePatterns: [
      'City of',
      'Town of', 
      'Village of',
      'Municipality of'
    ],
    unincorporatedIndicators: [
      'Unincorporated',
      'CDP',
      'Census Designated Place',
      'County Area',
      'Rural'
    ],
    countyOnlyAreas: [
      // Known county-only areas (would be expanded with real data)
      'County Islands',
      'County Pocket'
    ],
    specialDistrictPatterns: [
      'Special District',
      'Water District',
      'Fire District'
    ]
  };

  /**
   * Detect jurisdiction type for a given ZIP code and district mapping
   */
  async detectJurisdiction(
    zipCode: string,
    districtMapping?: ZipDistrictMapping | MultiDistrictMapping
  ): Promise<JurisdictionDetectionResult> {
    const cacheKey = `jurisdiction-${zipCode}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    let result: JurisdictionDetectionResult;

    try {
      // Step 1: Check if ZIP code is in a known incorporated city
      const incorporatedCity = this.findIncorporatedCity(zipCode);
      if (incorporatedCity) {
        result = this.createIncorporatedCityResult(incorporatedCity, 'database');
      } else {
        // Step 2: Check if ZIP code is in a known unincorporated area/CDP
        const cdp = this.findCensusDesignatedPlace(zipCode);
        if (cdp) {
          result = this.createUnincorporatedAreaResult(cdp, 'database');
        } else {
          // Step 3: Use district mapping data and inference rules
          result = await this.inferJurisdictionFromMapping(zipCode, districtMapping);
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error detecting jurisdiction for ZIP', zipCode, error);
      
      // Fallback to basic county-level detection
      return this.createFallbackResult(zipCode, districtMapping);
    }
  }

  /**
   * Get representative filtering rules based on jurisdiction
   */
  getRepresentativeRules(jurisdiction: JurisdictionDetectionResult): JurisdictionRepresentativeRules {
    const { jurisdiction: info } = jurisdiction;
    
    const applicableLevels: RepresentativeLevel[] = [
      {
        level: 'federal',
        applicable: true,
        reason: 'All areas have federal representatives'
      },
      {
        level: 'state',
        applicable: true,
        reason: 'All areas have state representatives'
      },
      {
        level: 'county',
        applicable: true,
        reason: 'All areas are within county jurisdiction'
      },
      {
        level: 'municipal',
        applicable: info.hasLocalRepresentatives,
        reason: info.hasLocalRepresentatives 
          ? `${info.name} is an incorporated city with local government`
          : `${info.name} is unincorporated and governed at the county level`
      }
    ];

    const excludedLevels: string[] = [];
    const specialRules: string[] = [];

    if (!info.hasLocalRepresentatives) {
      excludedLevels.push('municipal');
      specialRules.push('Display county-level representatives only for local government');
      specialRules.push(`Show message: "This is an unincorporated area of ${info.county}"`);
    }

    if (info.type === 'special_district') {
      specialRules.push('May have additional special district representatives');
    }

    return {
      zipCode: jurisdiction.jurisdiction.name, // This should be zipCode, but keeping the structure
      jurisdiction: info,
      applicableLevels,
      excludedLevels,
      specialRules
    };
  }

  /**
   * Get user-friendly description of the area type
   */
  getAreaDescription(jurisdiction: JurisdictionDetectionResult): {
    title: string;
    description: string;
    governmentStructure: string;
    representatives: string;
  } {
    const { jurisdiction: info } = jurisdiction;

    switch (info.type) {
      case 'incorporated_city':
        return {
          title: `City of ${info.name}`,
          description: `${info.name} is an incorporated city in ${info.county}.`,
          governmentStructure: 'This city has its own local government with a mayor and city council.',
          representatives: 'You have representatives at the city, county, state, and federal levels.'
        };

      case 'unincorporated_area':
        return {
          title: `${info.name}`,
          description: `${info.name} is an unincorporated area in ${info.county}.`,
          governmentStructure: 'This area is governed directly by the county government.',
          representatives: 'You have representatives at the county, state, and federal levels. There are no city-level representatives.'
        };

      case 'census_designated_place':
        return {
          title: `${info.name} (Unincorporated)`,
          description: `${info.name} is a census designated place in ${info.county}.`,
          governmentStructure: 'This community is unincorporated and governed by the county.',
          representatives: 'You have representatives at the county, state, and federal levels.'
        };

      case 'special_district':
        return {
          title: `${info.name} (Special District)`,
          description: `${info.name} is a special district in ${info.county}.`,
          governmentStructure: 'This area has specialized local governance for specific services.',
          representatives: 'You may have special district representatives in addition to county, state, and federal representatives.'
        };

      default:
        return {
          title: info.name,
          description: `Area in ${info.county}.`,
          governmentStructure: 'Government structure varies.',
          representatives: 'Representative structure may vary.'
        };
    }
  }

  // Private helper methods

  private findIncorporatedCity(zipCode: string): IncorporatedCity | null {
    return this.incorporatedCities.find(city => 
      city.zipCodes.includes(zipCode)
    ) || null;
  }

  private findCensusDesignatedPlace(zipCode: string): CensusDesignatedPlace | null {
    return this.censusDesignatedPlaces.find(cdp => 
      cdp.zipCodes.includes(zipCode)
    ) || null;
  }

  private createIncorporatedCityResult(
    city: IncorporatedCity,
    source: 'database' | 'geocodio' | 'inference' | 'fallback'
  ): JurisdictionDetectionResult {
    return {
      jurisdiction: {
        type: 'incorporated_city',
        classification: 'city',
        name: city.name,
        county: city.county,
        incorporationStatus: 'incorporated',
        governmentLevel: ['federal', 'state', 'county', 'municipal'],
        hasLocalRepresentatives: true,
        localGovernmentType: 'city_council',
        description: `Incorporated ${city.governmentType} with full municipal services`
      },
      confidence: source === 'database' ? 1.0 : 0.8,
      source,
      lastUpdated: new Date().toISOString()
    };
  }

  private createUnincorporatedAreaResult(
    area: CensusDesignatedPlace,
    source: 'database' | 'geocodio' | 'inference' | 'fallback'
  ): JurisdictionDetectionResult {
    return {
      jurisdiction: {
        type: 'census_designated_place',
        classification: 'unincorporated_county',
        name: area.name,
        county: area.county,
        incorporationStatus: 'unincorporated',
        governmentLevel: ['federal', 'state', 'county'],
        hasLocalRepresentatives: false,
        localGovernmentType: 'none',
        description: `Unincorporated community governed by ${area.county}`
      },
      confidence: source === 'database' ? 1.0 : 0.7,
      source,
      lastUpdated: new Date().toISOString()
    };
  }

  private async inferJurisdictionFromMapping(
    zipCode: string,
    mapping?: ZipDistrictMapping | MultiDistrictMapping
  ): Promise<JurisdictionDetectionResult> {
    if (!mapping) {
      return this.createFallbackResult(zipCode);
    }

    const cityName = mapping.city;
    const countyName = mapping.county;

    // Check if city name indicates incorporation status
    const isIncorporatedIndicator = this.detectionRules.cityNamePatterns.some(pattern =>
      cityName.includes(pattern)
    );

    const isUnincorporatedIndicator = this.detectionRules.unincorporatedIndicators.some(indicator =>
      cityName.includes(indicator)
    );

    // If we have clear indicators, use them
    if (isIncorporatedIndicator) {
      return {
        jurisdiction: {
          type: 'incorporated_city',
          classification: 'city',
          name: cityName.replace(/^(City of |Town of |Village of |Municipality of )/, ''),
          county: countyName,
          incorporationStatus: 'incorporated',
          governmentLevel: ['federal', 'state', 'county', 'municipal'],
          hasLocalRepresentatives: true,
          localGovernmentType: 'city_council',
          description: `Likely incorporated city based on naming pattern`
        },
        confidence: 0.7,
        source: 'inference',
        lastUpdated: new Date().toISOString()
      };
    }

    if (isUnincorporatedIndicator || cityName === 'Unknown City' || cityName.includes('County')) {
      return {
        jurisdiction: {
          type: 'unincorporated_area',
          classification: 'unincorporated_county',
          name: cityName === 'Unknown City' ? `Unincorporated ${countyName}` : cityName,
          county: countyName,
          incorporationStatus: 'unincorporated',
          governmentLevel: ['federal', 'state', 'county'],
          hasLocalRepresentatives: false,
          localGovernmentType: 'none',
          description: `Unincorporated area in ${countyName}`
        },
        confidence: 0.6,
        source: 'inference',
        lastUpdated: new Date().toISOString()
      };
    }

    // Default to incorporated city if we have a specific city name
    if (cityName && cityName !== 'Unknown City' && !cityName.includes('County')) {
      return {
        jurisdiction: {
          type: 'incorporated_city',
          classification: 'city',
          name: cityName,
          county: countyName,
          incorporationStatus: 'incorporated',
          governmentLevel: ['federal', 'state', 'county', 'municipal'],
          hasLocalRepresentatives: true,
          localGovernmentType: 'city_council',
          description: `Likely incorporated city`
        },
        confidence: 0.5, // Lower confidence for assumption
        source: 'inference',
        lastUpdated: new Date().toISOString()
      };
    }

    // Fallback to county-level
    return this.createFallbackResult(zipCode, mapping);
  }

  private createFallbackResult(
    zipCode: string,
    mapping?: ZipDistrictMapping | MultiDistrictMapping
  ): JurisdictionDetectionResult {
    const countyName = mapping?.county || 'Unknown County';
    
    return {
      jurisdiction: {
        type: 'unincorporated_area',
        classification: 'unincorporated_county',
        name: `Unincorporated ${countyName}`,
        county: countyName,
        incorporationStatus: 'unincorporated',
        governmentLevel: ['federal', 'state', 'county'],
        hasLocalRepresentatives: false,
        localGovernmentType: 'none',
        description: `Area in ${countyName} (jurisdiction unknown)`
      },
      confidence: 0.3,
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: string[];
  } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Add known incorporated city (for testing or data updates)
   */
  addIncorporatedCity(city: IncorporatedCity): void {
    this.incorporatedCities.push(city);
  }

  /**
   * Add known unincorporated area (for testing or data updates)
   */
  addCensusDesignatedPlace(cdp: CensusDesignatedPlace): void {
    this.censusDesignatedPlaces.push(cdp);
  }
}

export const jurisdictionService = new JurisdictionService();
export default jurisdictionService;