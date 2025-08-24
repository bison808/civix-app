export interface ZipDistrictMapping {
  zipCode: string;
  congressionalDistrict: number;
  stateSenateDistrict: number;
  stateAssemblyDistrict: number;
  county: string;
  city: string;
  state: string;
  coordinates: [number, number]; // [longitude, latitude]
  accuracy: number; // Geocodio accuracy score (0-1)
  source: 'geocodio' | 'cache' | 'fallback' | 'fallback_with_municipal';
  lastUpdated: string;
}

export interface MultiDistrictMapping {
  zipCode: string;
  districts: {
    congressional: number[];
    stateSenate: number[];
    stateAssembly: number[];
  };
  primaryDistricts: {
    congressional: number;
    stateSenate: number;
    stateAssembly: number;
  };
  county: string;
  city: string;
  state: string;
  coordinates: [number, number];
  accuracy: number;
  source: 'geocodio' | 'cache' | 'fallback' | 'fallback_with_municipal';
  lastUpdated: string;
}

export interface GeocodioResponse {
  results: GeocodioResult[];
}

export interface GeocodioResult {
  location: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  accuracy_type: string;
  source: string;
  formatted_address: string;
  address_components: {
    number?: string;
    predirectional?: string;
    street?: string;
    suffix?: string;
    postdirectional?: string;
    formatted_street?: string;
    city: string;
    county: string;
    state: string;
    zip: string;
    country: string;
  };
  fields: {
    congressional_districts?: CongressionalDistrictField[];
    state_legislative_districts?: {
      house?: StateLegislativeDistrict[];
      senate?: StateLegislativeDistrict[];
    };
    county?: {
      name: string;
      fips: string;
    };
  };
}

export interface CongressionalDistrictField {
  district_number: number;
  congress_years: string;
  congress_numbers: number[];
  proportion: number;
}

export interface StateLegislativeDistrict {
  district_number: string;
  name: string;
  proportion: number;
}

export interface DistrictCacheEntry {
  zipCode: string;
  mapping: ZipDistrictMapping | MultiDistrictMapping;
  expiresAt: number;
}

export interface BatchProcessingResult {
  processed: number;
  successful: number;
  failed: number;
  errors: {
    zipCode: string;
    error: string;
  }[];
  results: ZipDistrictMapping[];
}

export interface GeocodingServiceConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  batchSize: number;
  cacheExpiration: number; // in milliseconds
}

export interface DistrictLookupOptions {
  useCache?: boolean;
  allowMultiDistrict?: boolean;
  includeFallback?: boolean;
  maxAge?: number; // in milliseconds
}

export interface CaliforniaZipCodeData {
  zipCode: string;
  city: string;
  county: string;
  congressionalDistrict?: number;
  stateSenateDistrict?: number;
  stateAssemblyDistrict?: number;
}

// Extended Representative interface with district information
export interface RepresentativeWithDistrict {
  id: string;
  name: string;
  title: string;
  party: 'Democrat' | 'Republican' | 'Independent' | 'Other';
  level: 'federal' | 'state' | 'county' | 'local';
  chamber: 'House' | 'Senate' | 'Assembly' | 'Council' | 'Commission';
  state: string;
  district: string;
  districtNumber?: number;
  jurisdictions: string[]; // ZIP codes this representative serves
  photoUrl?: string;
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
    mailingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  termStart: string;
  termEnd: string;
  biography?: string;
}

// Error types
export type DistrictMappingError = 
  | 'ZIP_NOT_FOUND'
  | 'INVALID_ZIP_FORMAT'
  | 'API_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_API_KEY'
  | 'UNKNOWN_ERROR';

export interface DistrictMappingErrorResponse {
  error: DistrictMappingError;
  message: string;
  zipCode?: string;
  retryAfter?: number;
}