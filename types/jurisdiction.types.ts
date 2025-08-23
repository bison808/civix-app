/**
 * Jurisdiction Type Definitions
 * Defines the different types of jurisdictions and their characteristics
 */

export type JurisdictionType = 
  | 'incorporated_city'
  | 'unincorporated_area'
  | 'census_designated_place'
  | 'special_district';

export type AreaClassification = 
  | 'city'
  | 'unincorporated_county'
  | 'cdp'
  | 'special';

export interface JurisdictionInfo {
  type: JurisdictionType;
  classification: AreaClassification;
  name: string;
  county: string;
  incorporationStatus: 'incorporated' | 'unincorporated' | 'special';
  governmentLevel: ('federal' | 'state' | 'county' | 'municipal')[];
  hasLocalRepresentatives: boolean;
  localGovernmentType?: 'city_council' | 'county_board' | 'special_district' | 'none';
  description: string;
}

export interface JurisdictionDetectionResult {
  jurisdiction: JurisdictionInfo;
  confidence: number; // 0-1 confidence score
  source: 'database' | 'geocodio' | 'inference' | 'fallback';
  lastUpdated: string;
}

export interface RepresentativeLevel {
  level: 'federal' | 'state' | 'county' | 'municipal';
  applicable: boolean;
  reason?: string;
}

export interface JurisdictionRepresentativeRules {
  zipCode: string;
  jurisdiction: JurisdictionInfo;
  applicableLevels: RepresentativeLevel[];
  excludedLevels: string[];
  specialRules?: string[];
}

// Known incorporated cities in California (sample data)
export interface IncorporatedCity {
  name: string;
  county: string;
  zipCodes: string[];
  incorporationDate?: string;
  governmentType: 'city' | 'town' | 'charter_city';
}

// Census Designated Places (unincorporated communities with names)
export interface CensusDesignatedPlace {
  name: string;
  county: string;
  zipCodes: string[];
  population?: number;
  isUnincorporated: true;
}

// Fallback rules for jurisdiction detection when data is incomplete
export interface JurisdictionDetectionRules {
  cityNamePatterns: string[];
  unincorporatedIndicators: string[];
  countyOnlyAreas: string[];
  specialDistrictPatterns: string[];
}