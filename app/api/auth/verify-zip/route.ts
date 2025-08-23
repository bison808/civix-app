import { NextRequest, NextResponse } from 'next/server';

// ZIP code to location mapping (expanded)
const ZIP_LOCATIONS: Record<string, { city: string; state: string; county?: string }> = {
  // California
  '90210': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
  '94102': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '95060': { city: 'Santa Cruz', state: 'CA', county: 'Santa Cruz' },
  '95062': { city: 'Santa Cruz', state: 'CA', county: 'Santa Cruz' },
  '94301': { city: 'Palo Alto', state: 'CA', county: 'Santa Clara' },
  '92101': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '95814': { city: 'Sacramento', state: 'CA', county: 'Sacramento' },
  '95815': { city: 'Sacramento', state: 'CA', county: 'Sacramento' },
  '95816': { city: 'Sacramento', state: 'CA', county: 'Sacramento' },
  
  // New York
  '10001': { city: 'New York', state: 'NY', county: 'New York' },
  '10013': { city: 'New York', state: 'NY', county: 'New York' },
  '11201': { city: 'Brooklyn', state: 'NY', county: 'Kings' },
  '14201': { city: 'Buffalo', state: 'NY', county: 'Erie' },
  
  // Texas
  '75201': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '77001': { city: 'Houston', state: 'TX', county: 'Harris' },
  '78701': { city: 'Austin', state: 'TX', county: 'Travis' },
  '78210': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  
  // Florida
  '33101': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '32801': { city: 'Orlando', state: 'FL', county: 'Orange' },
  '33601': { city: 'Tampa', state: 'FL', county: 'Hillsborough' },
  
  // Illinois
  '60601': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '62701': { city: 'Springfield', state: 'IL', county: 'Sangamon' },
  
  // Washington
  '98101': { city: 'Seattle', state: 'WA', county: 'King' },
  '98501': { city: 'Olympia', state: 'WA', county: 'Thurston' },
  
  // Massachusetts - Boston and surrounding areas
  // Downtown Boston
  '02108': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02109': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02110': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02111': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02112': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02113': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02114': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02115': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02116': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02117': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02118': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02119': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02120': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02121': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02122': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02123': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02124': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02125': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02126': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02127': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02128': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02129': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02130': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02131': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02132': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02133': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02134': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02135': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02136': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02199': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02201': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02203': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02204': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02205': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02206': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02210': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02211': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02212': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02215': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02222': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  // Cambridge/Somerville
  '02138': { city: 'Cambridge', state: 'MA', county: 'Middlesex' },
  '02139': { city: 'Cambridge', state: 'MA', county: 'Middlesex' },
  '02140': { city: 'Cambridge', state: 'MA', county: 'Middlesex' },
  '02141': { city: 'Cambridge', state: 'MA', county: 'Middlesex' },
  '02142': { city: 'Cambridge', state: 'MA', county: 'Middlesex' },
  '02143': { city: 'Somerville', state: 'MA', county: 'Middlesex' },
  '02144': { city: 'Somerville', state: 'MA', county: 'Middlesex' },
  '02145': { city: 'Somerville', state: 'MA', county: 'Middlesex' },
  // Other MA cities
  '01002': { city: 'Amherst', state: 'MA', county: 'Hampshire' },
  '01701': { city: 'Framingham', state: 'MA', county: 'Middlesex' },
  '01801': { city: 'Woburn', state: 'MA', county: 'Middlesex' },
  '01901': { city: 'Lynn', state: 'MA', county: 'Essex' },
  '02101': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02102': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02103': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02104': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02105': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02106': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02107': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  
  // Arizona
  '85001': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85701': { city: 'Tucson', state: 'AZ', county: 'Pima' },
  
  // Colorado
  '80202': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80301': { city: 'Boulder', state: 'CO', county: 'Boulder' },
  
  // Pennsylvania
  '19101': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '15201': { city: 'Pittsburgh', state: 'PA', county: 'Allegheny' },
};

// Fallback state detection from ZIP code ranges
function getStateFromZip(zip: string): { city: string; state: string } {
  const zipNum = parseInt(zip);
  
  if (zipNum >= 1000 && zipNum <= 2799) return { city: 'Boston area', state: 'MA' };
  if (zipNum >= 2800 && zipNum <= 2999) return { city: 'Providence area', state: 'RI' };
  if (zipNum >= 3000 && zipNum <= 3899) return { city: 'Manchester area', state: 'NH' };
  if (zipNum >= 5000 && zipNum <= 5999) return { city: 'Burlington area', state: 'VT' };
  if (zipNum >= 6000 && zipNum <= 6999) return { city: 'Hartford area', state: 'CT' };
  if (zipNum >= 10000 && zipNum <= 14999) return { city: 'New York area', state: 'NY' };
  if (zipNum >= 19100 && zipNum <= 19699) return { city: 'Philadelphia area', state: 'PA' };
  if (zipNum >= 20000 && zipNum <= 20599) return { city: 'Washington area', state: 'DC' };
  if (zipNum >= 30000 && zipNum <= 31999) return { city: 'Atlanta area', state: 'GA' };
  if (zipNum >= 32000 && zipNum <= 34999) return { city: 'Florida area', state: 'FL' };
  if (zipNum >= 60000 && zipNum <= 62999) return { city: 'Chicago area', state: 'IL' };
  if (zipNum >= 70000 && zipNum <= 71599) return { city: 'New Orleans area', state: 'LA' };
  if (zipNum >= 75000 && zipNum <= 79999) return { city: 'Texas area', state: 'TX' };
  if (zipNum >= 80000 && zipNum <= 81699) return { city: 'Denver area', state: 'CO' };
  if (zipNum >= 85000 && zipNum <= 86599) return { city: 'Phoenix area', state: 'AZ' };
  if (zipNum >= 90000 && zipNum <= 96199) return { city: 'Los Angeles area', state: 'CA' };
  if (zipNum >= 97000 && zipNum <= 97999) return { city: 'Portland area', state: 'OR' };
  if (zipNum >= 98000 && zipNum <= 99499) return { city: 'Seattle area', state: 'WA' };
  
  return { city: 'United States', state: 'US' };
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
    
    // Check if we have exact location data
    const location = ZIP_LOCATIONS[zipCode] || getStateFromZip(zipCode);
    
    // If fallback returns generic "United States", it's likely invalid
    if (location.city === 'United States' && location.state === 'US') {
      return NextResponse.json(
        { valid: false, error: 'Invalid ZIP code - unknown location' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      zipCode,
      ...location
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Server error' },
      { status: 500 }
    );
  }
}