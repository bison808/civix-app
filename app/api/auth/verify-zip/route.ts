import { NextRequest, NextResponse } from 'next/server';
import { geocodingService } from '@/services/geocodingService';
import { coverageDetectionService } from '@/services/coverageDetectionService';

// ZIP code to location mapping (expanded) - Keep as fallback
const ZIP_LOCATIONS: Record<string, { city: string; state: string; county?: string }> = {
  // California - Fixed county names to include 'County' suffix
  '90210': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles County' },
  '94102': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '95060': { city: 'Santa Cruz', state: 'CA', county: 'Santa Cruz County' },
  '95062': { city: 'Santa Cruz', state: 'CA', county: 'Santa Cruz County' },
  '94301': { city: 'Palo Alto', state: 'CA', county: 'Santa Clara County' },
  '92101': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '95814': { city: 'Sacramento', state: 'CA', county: 'Sacramento County' },
  '95815': { city: 'Sacramento', state: 'CA', county: 'Sacramento County' },
  '95816': { city: 'Sacramento', state: 'CA', county: 'Sacramento County' },
  
  // Critical fixes for ZIP codes identified by Agent 35 as broken
  '93401': { city: 'San Luis Obispo', state: 'CA', county: 'San Luis Obispo County' },
  '96001': { city: 'Redding', state: 'CA', county: 'Shasta County' },
  '92252': { city: 'Palm Springs', state: 'CA', county: 'Riverside County' },
  '95014': { city: 'Cupertino', state: 'CA', county: 'Santa Clara County' },
  
  // Comprehensive California ZIP code database expansion
  // Bay Area expansion
  '94105': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94107': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94110': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94117': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94118': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94121': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94122': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94123': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94124': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94127': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94131': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94132': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94133': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  '94134': { city: 'San Francisco', state: 'CA', county: 'San Francisco County' },
  
  // Silicon Valley
  '95008': { city: 'Campbell', state: 'CA', county: 'Santa Clara County' },
  '95110': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95112': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95113': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95116': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95117': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95118': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95119': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95120': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95121': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95122': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95123': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95124': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95125': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95126': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95127': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95128': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95129': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95130': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95131': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95132': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95133': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95134': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95135': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95136': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95138': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95139': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  '95140': { city: 'San Jose', state: 'CA', county: 'Santa Clara County' },
  
  // Mountain View, Sunnyvale, Cupertino area
  '94040': { city: 'Mountain View', state: 'CA', county: 'Santa Clara County' },
  '94041': { city: 'Mountain View', state: 'CA', county: 'Santa Clara County' },
  '94043': { city: 'Mountain View', state: 'CA', county: 'Santa Clara County' },
  '94085': { city: 'Sunnyvale', state: 'CA', county: 'Santa Clara County' },
  '94086': { city: 'Sunnyvale', state: 'CA', county: 'Santa Clara County' },
  '94087': { city: 'Sunnyvale', state: 'CA', county: 'Santa Clara County' },
  '95013': { city: 'Cupertino', state: 'CA', county: 'Santa Clara County' },
  
  // East Bay
  '94501': { city: 'Alameda', state: 'CA', county: 'Alameda County' },
  '94502': { city: 'Alameda', state: 'CA', county: 'Alameda County' },
  '94536': { city: 'Fremont', state: 'CA', county: 'Alameda County' },
  '94537': { city: 'Fremont', state: 'CA', county: 'Alameda County' },
  '94538': { city: 'Fremont', state: 'CA', county: 'Alameda County' },
  '94539': { city: 'Fremont', state: 'CA', county: 'Alameda County' },
  '94540': { city: 'Fremont', state: 'CA', county: 'Alameda County' },
  '94541': { city: 'Hayward', state: 'CA', county: 'Alameda County' },
  '94542': { city: 'Hayward', state: 'CA', county: 'Alameda County' },
  '94544': { city: 'Hayward', state: 'CA', county: 'Alameda County' },
  '94545': { city: 'Hayward', state: 'CA', county: 'Alameda County' },
  '94546': { city: 'Castro Valley', state: 'CA', county: 'Alameda County' },
  '94550': { city: 'Livermore', state: 'CA', county: 'Alameda County' },
  '94551': { city: 'Livermore', state: 'CA', county: 'Alameda County' },
  '94552': { city: 'Castro Valley', state: 'CA', county: 'Alameda County' },
  '94566': { city: 'Pleasanton', state: 'CA', county: 'Alameda County' },
  '94568': { city: 'Dublin', state: 'CA', county: 'Alameda County' },
  '94577': { city: 'San Leandro', state: 'CA', county: 'Alameda County' },
  '94578': { city: 'San Leandro', state: 'CA', county: 'Alameda County' },
  '94579': { city: 'San Leandro', state: 'CA', county: 'Alameda County' },
  '94580': { city: 'San Lorenzo', state: 'CA', county: 'Alameda County' },
  '94587': { city: 'Union City', state: 'CA', county: 'Alameda County' },
  
  // Oakland
  '94601': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94602': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94603': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94605': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94606': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94607': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94608': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94609': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94610': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94611': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94612': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94618': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94619': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  '94621': { city: 'Oakland', state: 'CA', county: 'Alameda County' },
  
  // Los Angeles Metro Area
  '90001': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90002': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90003': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90004': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90005': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90006': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90007': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90008': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90010': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90011': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90012': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90013': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90014': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90015': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90016': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90017': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90018': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90019': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90020': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' },
  '90028': { city: 'Hollywood', state: 'CA', county: 'Los Angeles County' },
  '90038': { city: 'Hollywood', state: 'CA', county: 'Los Angeles County' },
  '90046': { city: 'West Hollywood', state: 'CA', county: 'Los Angeles County' },
  '90069': { city: 'West Hollywood', state: 'CA', county: 'Los Angeles County' },
  '90211': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles County' },
  '90212': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles County' },
  
  // Santa Monica, Venice
  '90401': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' },
  '90402': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' },
  '90403': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' },
  '90404': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' },
  '90405': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' },
  '90291': { city: 'Venice', state: 'CA', county: 'Los Angeles County' },
  '90292': { city: 'Marina del Rey', state: 'CA', county: 'Los Angeles County' },
  
  // Pasadena area
  '91101': { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' },
  '91103': { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' },
  '91104': { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' },
  '91105': { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' },
  '91106': { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' },
  '91107': { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' },
  '91108': { city: 'San Marino', state: 'CA', county: 'Los Angeles County' },
  
  // San Diego County
  '92102': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92103': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92104': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92105': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92106': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92107': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92108': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92109': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92110': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92111': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92113': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92114': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92115': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92116': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92117': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92118': { city: 'Coronado', state: 'CA', county: 'San Diego County' },
  '92119': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92120': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92121': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92122': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92123': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92124': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92126': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92127': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92128': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92129': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92130': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92131': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92132': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92134': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92135': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92136': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92137': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92139': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92154': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92155': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  '92173': { city: 'San Diego', state: 'CA', county: 'San Diego County' },
  
  // Orange County
  '92602': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92603': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92604': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92606': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92612': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92614': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92618': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92620': { city: 'Irvine', state: 'CA', county: 'Orange County' },
  '92660': { city: 'Newport Beach', state: 'CA', county: 'Orange County' },
  '92661': { city: 'Newport Beach', state: 'CA', county: 'Orange County' },
  '92663': { city: 'Newport Beach', state: 'CA', county: 'Orange County' },
  '92701': { city: 'Santa Ana', state: 'CA', county: 'Orange County' },
  '92702': { city: 'Santa Ana', state: 'CA', county: 'Orange County' },
  '92703': { city: 'Santa Ana', state: 'CA', county: 'Orange County' },
  '92704': { city: 'Santa Ana', state: 'CA', county: 'Orange County' },
  '92705': { city: 'Santa Ana', state: 'CA', county: 'Orange County' },
  '92801': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92802': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92804': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92805': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92806': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92807': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92808': { city: 'Anaheim', state: 'CA', county: 'Orange County' },
  '92867': { city: 'Orange', state: 'CA', county: 'Orange County' },
  '90066': { city: 'Mar Vista', state: 'CA', county: 'Los Angeles County' },
  
  // Central Valley - Fresno
  '93701': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93702': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93703': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93704': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93705': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93706': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93710': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93711': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93720': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93721': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93722': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93723': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93725': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93726': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93727': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93728': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  '93730': { city: 'Fresno', state: 'CA', county: 'Fresno County' },
  
  // North Coast - Humboldt County
  '95555': { city: 'Miranda', state: 'CA', county: 'Humboldt County' },
  '95503': { city: 'Eureka', state: 'CA', county: 'Humboldt County' },
  '95540': { city: 'Fortuna', state: 'CA', county: 'Humboldt County' },
  '95521': { city: 'Arcata', state: 'CA', county: 'Humboldt County' },
  
  // Central Coast expansion
  '93940': { city: 'Monterey', state: 'CA', county: 'Monterey County' },
  '93950': { city: 'Pebble Beach', state: 'CA', county: 'Monterey County' },
  '93953': { city: 'Seaside', state: 'CA', county: 'Monterey County' },

  // New York - Fixed county names
  '10001': { city: 'New York', state: 'NY', county: 'New York County' },
  '10013': { city: 'New York', state: 'NY', county: 'New York County' },
  '11201': { city: 'Brooklyn', state: 'NY', county: 'Kings County' },
  '14201': { city: 'Buffalo', state: 'NY', county: 'Erie County' },
  
  // Texas - Fixed county names
  '75201': { city: 'Dallas', state: 'TX', county: 'Dallas County' },
  '77001': { city: 'Houston', state: 'TX', county: 'Harris County' },
  '78701': { city: 'Austin', state: 'TX', county: 'Travis County' },
  '78210': { city: 'San Antonio', state: 'TX', county: 'Bexar County' },
  
  // Florida - Fixed county names
  '33101': { city: 'Miami', state: 'FL', county: 'Miami-Dade County' },
  '32801': { city: 'Orlando', state: 'FL', county: 'Orange County' },
  '33601': { city: 'Tampa', state: 'FL', county: 'Hillsborough County' },
  
  // Illinois - Fixed county names
  '60601': { city: 'Chicago', state: 'IL', county: 'Cook County' },
  '62701': { city: 'Springfield', state: 'IL', county: 'Sangamon County' },
  
  // Washington - Fixed county names
  '98101': { city: 'Seattle', state: 'WA', county: 'King County' },
  '98501': { city: 'Olympia', state: 'WA', county: 'Thurston County' },
  
  // Massachusetts - Boston and surrounding areas - Fixed county names
  // Downtown Boston
  '02108': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02109': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02110': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02111': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02112': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02113': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02114': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02115': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02116': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02117': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02118': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02119': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02120': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02121': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02122': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02123': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02124': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02125': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02126': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02127': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02128': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02129': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02130': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02131': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02132': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02133': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02134': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02135': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02136': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02199': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02201': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02203': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02204': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02205': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02206': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02210': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02211': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02212': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02215': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02222': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  // Cambridge/Somerville
  '02138': { city: 'Cambridge', state: 'MA', county: 'Middlesex County' },
  '02139': { city: 'Cambridge', state: 'MA', county: 'Middlesex County' },
  '02140': { city: 'Cambridge', state: 'MA', county: 'Middlesex County' },
  '02141': { city: 'Cambridge', state: 'MA', county: 'Middlesex County' },
  '02142': { city: 'Cambridge', state: 'MA', county: 'Middlesex County' },
  '02143': { city: 'Somerville', state: 'MA', county: 'Middlesex County' },
  '02144': { city: 'Somerville', state: 'MA', county: 'Middlesex County' },
  '02145': { city: 'Somerville', state: 'MA', county: 'Middlesex County' },
  // Other MA cities
  '01002': { city: 'Amherst', state: 'MA', county: 'Hampshire County' },
  '01701': { city: 'Framingham', state: 'MA', county: 'Middlesex County' },
  '01801': { city: 'Woburn', state: 'MA', county: 'Middlesex County' },
  '01901': { city: 'Lynn', state: 'MA', county: 'Essex County' },
  '02101': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02102': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02103': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02104': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02105': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02106': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  '02107': { city: 'Boston', state: 'MA', county: 'Suffolk County' },
  
  // Arizona - Fixed county names
  '85001': { city: 'Phoenix', state: 'AZ', county: 'Maricopa County' },
  '85701': { city: 'Tucson', state: 'AZ', county: 'Pima County' },
  
  // Colorado - Fixed county names
  '80202': { city: 'Denver', state: 'CO', county: 'Denver County' },
  '80301': { city: 'Boulder', state: 'CO', county: 'Boulder County' },
  
  // Pennsylvania - Fixed county names
  '19101': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia County' },
  '15201': { city: 'Pittsburgh', state: 'PA', county: 'Allegheny County' },
};

// ENHANCED FALLBACK: More accurate California ZIP mapping with consistent data format
function getRealCaliforniaCityFromZip(zip: string): { city: string; state: string; county: string } {
  const zipNum = parseInt(zip);
  
  // Northern California specific mappings with better granularity
  if (zipNum >= 94000 && zipNum <= 94999) {
    // San Francisco County
    if (zipNum >= 94100 && zipNum <= 94199) return { city: 'San Francisco', state: 'CA', county: 'San Francisco County' };
    
    // San Mateo County  
    if (zipNum >= 94010 && zipNum <= 94099) return { city: 'San Mateo', state: 'CA', county: 'San Mateo County' };
    if (zipNum >= 94200 && zipNum <= 94299) return { city: 'San Mateo', state: 'CA', county: 'San Mateo County' };
    
    // Santa Clara County (Peninsula)
    if (zipNum >= 94300 && zipNum <= 94399) return { city: 'Palo Alto', state: 'CA', county: 'Santa Clara County' };
    
    // Alameda County (East Bay)
    if (zipNum >= 94500 && zipNum <= 94599) return { city: 'Fremont', state: 'CA', county: 'Alameda County' };
    if (zipNum >= 94600 && zipNum <= 94699) return { city: 'Oakland', state: 'CA', county: 'Alameda County' };
    
    // Default Bay Area fallback
    return { city: 'Bay Area', state: 'CA', county: 'San Francisco County' };
  }
  
  // North-Central California  
  if (zipNum >= 95000 && zipNum <= 95999) {
    // Sacramento County
    if (zipNum >= 95800 && zipNum <= 95899) return { city: 'Sacramento', state: 'CA', county: 'Sacramento County' };
    
    // Santa Clara County (South Bay)
    if (zipNum >= 95000 && zipNum <= 95099) return { city: 'Santa Clara', state: 'CA', county: 'Santa Clara County' };
    if (zipNum >= 95100 && zipNum <= 95199) return { city: 'San Jose', state: 'CA', county: 'Santa Clara County' };
    
    // San Joaquin County (Central Valley)
    if (zipNum >= 95200 && zipNum <= 95299) return { city: 'Stockton', state: 'CA', county: 'San Joaquin County' };
    
    // Stanislaus County  
    if (zipNum >= 95300 && zipNum <= 95399) return { city: 'Modesto', state: 'CA', county: 'Stanislaus County' };
    
    // Humboldt County (North Coast)  
    if (zipNum >= 95500 && zipNum <= 95599) return { city: 'Eureka', state: 'CA', county: 'Humboldt County' };
    
    // Default Northern California fallback
    return { city: 'Central Valley', state: 'CA', county: 'Sacramento County' };
  }
  
  // Far Northern California
  if (zipNum >= 96000 && zipNum <= 96199) {
    return { city: 'Redding', state: 'CA', county: 'Shasta County' };
  }
  
  // Central California Coast and Valley
  if (zipNum >= 93000 && zipNum <= 93999) {
    // San Luis Obispo County
    if (zipNum >= 93400 && zipNum <= 93499) return { city: 'San Luis Obispo', state: 'CA', county: 'San Luis Obispo County' };
    
    // Santa Barbara County  
    if (zipNum >= 93100 && zipNum <= 93199) return { city: 'Santa Barbara', state: 'CA', county: 'Santa Barbara County' };
    
    // Fresno County
    if (zipNum >= 93600 && zipNum <= 93799) return { city: 'Fresno', state: 'CA', county: 'Fresno County' };
    
    // Kern County (Bakersfield area)
    if (zipNum >= 93200 && zipNum <= 93399) return { city: 'Bakersfield', state: 'CA', county: 'Kern County' };
    
    // Monterey County (Central Coast)
    if (zipNum >= 93900 && zipNum <= 93999) return { city: 'Monterey', state: 'CA', county: 'Monterey County' };
    
    // Default Central California fallback
    return { city: 'Central Valley', state: 'CA', county: 'Fresno County' };
  }
  
  // Southern California - Los Angeles County
  if (zipNum >= 90000 && zipNum <= 91999) {
    // Beverly Hills area
    if (zipNum >= 90200 && zipNum <= 90299) return { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles County' };
    
    // West LA/Santa Monica
    if (zipNum >= 90400 && zipNum <= 90499) return { city: 'Santa Monica', state: 'CA', county: 'Los Angeles County' };
    
    // Central/Downtown LA
    if (zipNum >= 90000 && zipNum <= 90199) return { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' };
    
    // Pasadena area
    if (zipNum >= 91100 && zipNum <= 91199) return { city: 'Pasadena', state: 'CA', county: 'Los Angeles County' };
    
    // Default LA County fallback  
    return { city: 'Los Angeles', state: 'CA', county: 'Los Angeles County' };
  }
  
  // Southern California - Multiple Counties
  if (zipNum >= 92000 && zipNum <= 92999) {
    // San Diego County
    if (zipNum >= 92100 && zipNum <= 92199) return { city: 'San Diego', state: 'CA', county: 'San Diego County' };
    
    // Riverside County (Desert)
    if (zipNum >= 92200 && zipNum <= 92299) return { city: 'Palm Springs', state: 'CA', county: 'Riverside County' };
    
    // Orange County (South Coast)
    if (zipNum >= 92600 && zipNum <= 92799) return { city: 'Irvine', state: 'CA', county: 'Orange County' };
    
    // Orange County (Anaheim area)
    if (zipNum >= 92800 && zipNum <= 92899) return { city: 'Anaheim', state: 'CA', county: 'Orange County' };
    
    // Default Southern California fallback
    return { city: 'Orange County', state: 'CA', county: 'Orange County' };
  }
  
  // Non-California fallback (maintain existing logic)
  if (zipNum >= 1000 && zipNum <= 2799) return { city: 'Boston', state: 'MA', county: 'Suffolk County' };
  if (zipNum >= 10000 && zipNum <= 14999) return { city: 'New York', state: 'NY', county: 'New York County' };
  if (zipNum >= 60000 && zipNum <= 62999) return { city: 'Chicago', state: 'IL', county: 'Cook County' };
  if (zipNum >= 75000 && zipNum <= 79999) return { city: 'Dallas', state: 'TX', county: 'Dallas County' };
  
  return { city: 'Unknown City', state: 'CA', county: 'Unknown County' };
}

export async function POST(request: NextRequest) {
  try {
    const { zipCode } = await request.json();
    
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid ZIP code format' },
        { status: 400 }
      );
    }
    
    const zipNum = parseInt(zipCode);
    
    // Validate ZIP code is within valid US ranges (00501-99950)
    if (zipNum <= 500 || zipNum > 99950) {
      return NextResponse.json(
        { valid: false, error: 'Invalid ZIP code - not in valid US range' },
        { status: 400 }
      );
    }
    
    // Try to get real geographic data first
    try {
      const districtMapping = await geocodingService.getDistrictsForZip(zipCode);
      const locationData = coverageDetectionService.convertDistrictMappingToLocationData(districtMapping);
      const coverage = coverageDetectionService.determineUserExperience(locationData);
      
      return NextResponse.json({
        valid: true,
        zipCode,
        city: locationData.city,
        state: locationData.state,
        county: locationData.county,
        coverage: coverage.type,
        message: coverage.message,
        showFederal: coverage.showFederal,
        showState: coverage.showState,
        showLocal: coverage.showLocal,
        collectEmail: coverage.collectEmail,
        expandMessage: coverage.expandMessage
      });
    } catch (geocodingError) {
      // Fall back to static data if geocoding fails
      const location = ZIP_LOCATIONS[zipCode] || getRealCaliforniaCityFromZip(zipCode);
      
      // If fallback returns generic "United States", it's likely invalid
      if (location.city === 'United States' && location.state === 'US') {
        return NextResponse.json(
          { valid: false, error: 'Invalid ZIP code - unknown location' },
          { status: 400 }
        );
      }
      
      // Determine coverage for fallback data
      const fallbackLocationData = {
        city: location.city,
        state: location.state,
        county: location.county || 'Unknown County',
        zipCode,
        coordinates: [0, 0] as [number, number],
        districts: { congressional: 0 }
      };
      
      const coverage = coverageDetectionService.determineUserExperience(fallbackLocationData);
      
      return NextResponse.json({
        valid: true,
        zipCode,
        ...location,
        coverage: coverage.type,
        message: coverage.message,
        showFederal: coverage.showFederal,
        showState: coverage.showState,
        showLocal: coverage.showLocal,
        collectEmail: coverage.collectEmail,
        expandMessage: coverage.expandMessage
      });
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Server error' },
      { status: 500 }
    );
  }
}