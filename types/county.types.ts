export interface County {
  name: string;
  fipsCode: string;
  population: number;
  seatCity: string;
  zipCodes: string[];
  supervisorDistricts: SupervisorDistrict[];
  electedOfficials: CountyOfficial[];
  website: string;
  contactPhone: string;
}

export interface CountyOfficial {
  id: string;
  position: 'Supervisor' | 'Sheriff' | 'District Attorney' | 'Assessor' | 'Clerk-Recorder' | 'Treasurer' | 'Auditor' | 'Tax Collector' | 'Public Defender';
  name: string;
  district?: number;
  termStart: string;
  termEnd: string;
  contactInfo: CountyContactInfo;
  party?: string;
  photoUrl?: string;
  biography?: string;
  // Name collision resolution fields
  level: 'county';
  jurisdiction: string;
  governmentType: 'county';
  jurisdictionScope: 'countywide' | 'district';
  countyName: string;
}

export interface SupervisorDistrict {
  district: number;
  supervisor: CountyOfficial;
  zipCodes: string[];
  population: number;
  boundaries?: string; // GeoJSON or description
}

export interface CountyContactInfo {
  phone: string;
  email?: string;
  website?: string;
  officeAddress?: CountyAddress;
  mailingAddress?: CountyAddress;
  fax?: string;
}

export interface CountyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  suite?: string;
}

export interface CountyInfo {
  county: County;
  zipCodeCoverage: 'full' | 'partial' | 'split';
  primaryCounty: boolean;
}

export interface SpecialDistrict {
  id: string;
  name: string;
  type: 'Water' | 'Fire' | 'School' | 'Transportation' | 'Hospital' | 'Recreation' | 'Other';
  county: string;
  zipCodes: string[];
  boardMembers: DistrictBoardMember[];
  website?: string;
  contactInfo: CountyContactInfo;
}

export interface DistrictBoardMember {
  id: string;
  name: string;
  position: 'President' | 'Vice President' | 'Director' | 'Trustee' | 'Member';
  termStart: string;
  termEnd: string;
  contactInfo: CountyContactInfo;
  district?: string;
}

export interface CountySearchResult {
  counties: County[];
  total: number;
  zipCode?: string;
}

export interface CountyFilter {
  population?: { min?: number; max?: number };
  region?: 'Northern' | 'Central' | 'Southern';
  searchTerm?: string;
}

export interface CountyDistrict {
  id: string;
  name: string;
  type: 'Supervisor' | 'School' | 'Water' | 'Fire' | 'Other';
  districtNumber: number;
  county: string;
  zipCodes: string[];
  population?: number;
  representative?: CountyOfficial;
  boundaries?: string; // GeoJSON or description
  website?: string;
  contactInfo?: CountyContactInfo;
}