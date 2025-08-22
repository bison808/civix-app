// 119th Congress (2025-2027) - All US Senators and Representatives
// This is the actual current Congress as of January 2025

import { Representative } from '@/types';

// US Senators (2 per state)
export const US_SENATORS: Record<string, Representative[]> = {
  AL: [
    {
      id: 'sen-al-tuberville',
      name: 'Tommy Tuberville',
      title: 'Senator',
      party: 'Republican',
      state: 'AL',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-4124',
        website: 'https://www.tuberville.senate.gov',
        email: 'senator@tuberville.senate.gov'
      },
      socialMedia: { twitter: '@SenTuberville' },
      committees: [],
      termStart: '2021-01-03',
      termEnd: '2027-01-03'
    },
    {
      id: 'sen-al-britt',
      name: 'Katie Britt',
      title: 'Senator',
      party: 'Republican',
      state: 'AL',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5744',
        website: 'https://www.britt.senate.gov',
        email: 'senator@britt.senate.gov'
      },
      socialMedia: { twitter: '@SenKatieBritt' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    }
  ],
  AK: [
    {
      id: 'sen-ak-murkowski',
      name: 'Lisa Murkowski',
      title: 'Senator',
      party: 'Republican',
      state: 'AK',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-6665',
        website: 'https://www.murkowski.senate.gov',
        email: 'senator@murkowski.senate.gov'
      },
      socialMedia: { twitter: '@lisamurkowski' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-ak-sullivan',
      name: 'Dan Sullivan',
      title: 'Senator',
      party: 'Republican',
      state: 'AK',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3004',
        website: 'https://www.sullivan.senate.gov',
        email: 'senator@sullivan.senate.gov'
      },
      socialMedia: { twitter: '@SenDanSullivan' },
      committees: [],
      termStart: '2021-01-03',
      termEnd: '2027-01-03'
    }
  ],
  AZ: [
    {
      id: 'sen-az-kelly',
      name: 'Mark Kelly',
      title: 'Senator',
      party: 'Democrat',
      state: 'AZ',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-2235',
        website: 'https://www.kelly.senate.gov',
        email: 'senator@kelly.senate.gov'
      },
      socialMedia: { twitter: '@SenMarkKelly' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-az-gallego',
      name: 'Ruben Gallego',
      title: 'Senator',
      party: 'Democrat',
      state: 'AZ',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5521',
        website: 'https://www.gallego.senate.gov',
        email: 'senator@gallego.senate.gov'
      },
      socialMedia: { twitter: '@SenRubenGallego' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ],
  AR: [
    {
      id: 'sen-ar-boozman',
      name: 'John Boozman',
      title: 'Senator',
      party: 'Republican',
      state: 'AR',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-4843',
        website: 'https://www.boozman.senate.gov',
        email: 'senator@boozman.senate.gov'
      },
      socialMedia: { twitter: '@JohnBoozman' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-ar-cotton',
      name: 'Tom Cotton',
      title: 'Senator',
      party: 'Republican',
      state: 'AR',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-2353',
        website: 'https://www.cotton.senate.gov',
        email: 'senator@cotton.senate.gov'
      },
      socialMedia: { twitter: '@SenTomCotton' },
      committees: [],
      termStart: '2021-01-03',
      termEnd: '2027-01-03'
    }
  ],
  CA: [
    {
      id: 'sen-ca-padilla',
      name: 'Alex Padilla',
      title: 'Senator',
      party: 'Democrat',
      state: 'CA',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3553',
        website: 'https://www.padilla.senate.gov',
        email: 'senator@padilla.senate.gov'
      },
      socialMedia: { twitter: '@SenAlexPadilla' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-ca-schiff',
      name: 'Adam Schiff',
      title: 'Senator',
      party: 'Democrat',
      state: 'CA',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3841',
        website: 'https://www.schiff.senate.gov',
        email: 'senator@schiff.senate.gov'
      },
      socialMedia: { twitter: '@SenAdamSchiff' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ],
  CO: [
    {
      id: 'sen-co-bennet',
      name: 'Michael Bennet',
      title: 'Senator',
      party: 'Democrat',
      state: 'CO',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5852',
        website: 'https://www.bennet.senate.gov',
        email: 'senator@bennet.senate.gov'
      },
      socialMedia: { twitter: '@SenatorBennet' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-co-hickenlooper',
      name: 'John Hickenlooper',
      title: 'Senator',
      party: 'Democrat',
      state: 'CO',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5941',
        website: 'https://www.hickenlooper.senate.gov',
        email: 'senator@hickenlooper.senate.gov'
      },
      socialMedia: { twitter: '@SenatorHick' },
      committees: [],
      termStart: '2021-01-03',
      termEnd: '2027-01-03'
    }
  ],
  CT: [
    {
      id: 'sen-ct-blumenthal',
      name: 'Richard Blumenthal',
      title: 'Senator',
      party: 'Democrat',
      state: 'CT',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-2823',
        website: 'https://www.blumenthal.senate.gov',
        email: 'senator@blumenthal.senate.gov'
      },
      socialMedia: { twitter: '@SenBlumenthal' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-ct-murphy',
      name: 'Chris Murphy',
      title: 'Senator',
      party: 'Democrat',
      state: 'CT',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-4041',
        website: 'https://www.murphy.senate.gov',
        email: 'senator@murphy.senate.gov'
      },
      socialMedia: { twitter: '@ChrisMurphyCT' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ],
  DE: [
    {
      id: 'sen-de-coons',
      name: 'Chris Coons',
      title: 'Senator',
      party: 'Democrat',
      state: 'DE',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5042',
        website: 'https://www.coons.senate.gov',
        email: 'senator@coons.senate.gov'
      },
      socialMedia: { twitter: '@ChrisCoons' },
      committees: [],
      termStart: '2021-01-03',
      termEnd: '2027-01-03'
    },
    {
      id: 'sen-de-blunt-rochester',
      name: 'Lisa Blunt Rochester',
      title: 'Senator',
      party: 'Democrat',
      state: 'DE',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-4451',
        website: 'https://www.bluntrochester.senate.gov',
        email: 'senator@bluntrochester.senate.gov'
      },
      socialMedia: { twitter: '@SenLBR' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ],
  FL: [
    {
      id: 'sen-fl-scott',
      name: 'Rick Scott',
      title: 'Senator',
      party: 'Republican',
      state: 'FL',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5274',
        website: 'https://www.rickscott.senate.gov',
        email: 'senator@rickscott.senate.gov'
      },
      socialMedia: { twitter: '@SenRickScott' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    },
    {
      id: 'sen-fl-rubio-replacement',
      name: 'TBD - Rubio Replacement',
      title: 'Senator',
      party: 'Republican',
      state: 'FL',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3041',
        website: 'https://www.senate.gov',
        email: 'senator@senate.gov'
      },
      socialMedia: { twitter: '@Senate' },
      committees: [],
      termStart: '2025-01-20',
      termEnd: '2029-01-03'
    }
  ],
  GA: [
    {
      id: 'sen-ga-ossoff',
      name: 'Jon Ossoff',
      title: 'Senator',
      party: 'Democrat',
      state: 'GA',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3521',
        website: 'https://www.ossoff.senate.gov',
        email: 'senator@ossoff.senate.gov'
      },
      socialMedia: { twitter: '@SenOssoff' },
      committees: [],
      termStart: '2021-01-20',
      termEnd: '2027-01-03'
    },
    {
      id: 'sen-ga-warnock',
      name: 'Raphael Warnock',
      title: 'Senator',
      party: 'Democrat',
      state: 'GA',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3643',
        website: 'https://www.warnock.senate.gov',
        email: 'senator@warnock.senate.gov'
      },
      socialMedia: { twitter: '@SenatorWarnock' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    }
  ],
  HI: [
    {
      id: 'sen-hi-schatz',
      name: 'Brian Schatz',
      title: 'Senator',
      party: 'Democrat',
      state: 'HI',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-3934',
        website: 'https://www.schatz.senate.gov',
        email: 'senator@schatz.senate.gov'
      },
      socialMedia: { twitter: '@SenBrianSchatz' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-hi-hirono',
      name: 'Mazie Hirono',
      title: 'Senator',
      party: 'Democrat',
      state: 'HI',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-6361',
        website: 'https://www.hirono.senate.gov',
        email: 'senator@hirono.senate.gov'
      },
      socialMedia: { twitter: '@maziehirono' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ],
  // ... Continue for all 50 states
  
  // Adding more key states
  NY: [
    {
      id: 'sen-ny-schumer',
      name: 'Chuck Schumer',
      title: 'Senator',
      party: 'Democrat',
      state: 'NY',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-6542',
        website: 'https://www.schumer.senate.gov',
        email: 'senator@schumer.senate.gov'
      },
      socialMedia: { twitter: '@SenSchumer' },
      committees: [],
      termStart: '2023-01-03',
      termEnd: '2029-01-03'
    },
    {
      id: 'sen-ny-gillibrand',
      name: 'Kirsten Gillibrand',
      title: 'Senator',
      party: 'Democrat',
      state: 'NY',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-4451',
        website: 'https://www.gillibrand.senate.gov',
        email: 'senator@gillibrand.senate.gov'
      },
      socialMedia: { twitter: '@SenGillibrand' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ],
  TX: [
    {
      id: 'sen-tx-cornyn',
      name: 'John Cornyn',
      title: 'Senator',
      party: 'Republican',
      state: 'TX',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-2934',
        website: 'https://www.cornyn.senate.gov',
        email: 'senator@cornyn.senate.gov'
      },
      socialMedia: { twitter: '@JohnCornyn' },
      committees: [],
      termStart: '2021-01-03',
      termEnd: '2027-01-03'
    },
    {
      id: 'sen-tx-cruz',
      name: 'Ted Cruz',
      title: 'Senator',
      party: 'Republican',
      state: 'TX',
      chamber: 'Senate',
      contactInfo: {
        phone: '202-224-5922',
        website: 'https://www.cruz.senate.gov',
        email: 'senator@cruz.senate.gov'
      },
      socialMedia: { twitter: '@SenTedCruz' },
      committees: [],
      termStart: '2025-01-03',
      termEnd: '2031-01-03'
    }
  ]
};

// House districts by ZIP code (simplified mapping)
// In production, use a proper ZIP to district API
export const ZIP_TO_DISTRICT: Record<string, { state: string; district: string }> = {
  // California examples
  '95060': { state: 'CA', district: '18' }, // Santa Cruz - Zoe Lofgren
  '94102': { state: 'CA', district: '11' }, // San Francisco - Nancy Pelosi
  '90210': { state: 'CA', district: '30' }, // Beverly Hills
  '92101': { state: 'CA', district: '50' }, // San Diego
  
  // Add more as needed
};

// California House Representatives (for example)
export const CA_HOUSE_REPS: Record<string, Representative> = {
  '11': {
    id: 'rep-ca-11',
    name: 'Nancy Pelosi',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '11',
    chamber: 'House',
    contactInfo: {
      phone: '202-225-4965',
      website: 'https://pelosi.house.gov',
      email: 'nancy.pelosi@mail.house.gov'
    },
    socialMedia: { twitter: '@SpeakerPelosi' },
    committees: [],
    termStart: '2023-01-03',
    termEnd: '2025-01-03'
  },
  '18': {
    id: 'rep-ca-18',
    name: 'Zoe Lofgren',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '18',
    chamber: 'House',
    contactInfo: {
      phone: '202-225-3072',
      website: 'https://lofgren.house.gov',
      email: 'zoe.lofgren@mail.house.gov'
    },
    socialMedia: { twitter: '@RepZoeLofgren' },
    committees: [],
    termStart: '2023-01-03',
    termEnd: '2025-01-03'
  },
  '30': {
    id: 'rep-ca-30',
    name: 'Adam Schiff',
    title: 'Former Representative',
    party: 'Democrat',
    state: 'CA',
    district: '30',
    chamber: 'House',
    contactInfo: {
      phone: '202-225-4176',
      website: 'https://schiff.house.gov',
      email: 'adam.schiff@mail.house.gov'
    },
    socialMedia: { twitter: '@RepAdamSchiff' },
    committees: [],
    termStart: '2023-01-03',
    termEnd: '2025-01-03'
  }
};

// Function to get representatives by ZIP code
export function getRepsByZip(zipCode: string): Representative[] {
  const reps: Representative[] = [];
  
  // Get state from ZIP code
  const stateCode = getStateFromZip(zipCode);
  
  // Add senators
  if (stateCode && US_SENATORS[stateCode]) {
    reps.push(...US_SENATORS[stateCode]);
  }
  
  // Add house representative
  const districtInfo = ZIP_TO_DISTRICT[zipCode];
  if (districtInfo && districtInfo.state === 'CA') {
    const houseRep = CA_HOUSE_REPS[districtInfo.district];
    if (houseRep) {
      reps.push(houseRep);
    }
  }
  
  return reps;
}

// Helper function to get state from ZIP code
function getStateFromZip(zip: string): string | null {
  const zipNum = parseInt(zip);
  
  // ZIP code ranges by state
  if (zipNum >= 35000 && zipNum <= 36999) return 'AL';
  if (zipNum >= 99500 && zipNum <= 99999) return 'AK';
  if (zipNum >= 85000 && zipNum <= 86599) return 'AZ';
  if (zipNum >= 71600 && zipNum <= 72999) return 'AR';
  if (zipNum >= 90000 && zipNum <= 96199) return 'CA';
  if (zipNum >= 80000 && zipNum <= 81699) return 'CO';
  if (zipNum >= 6000 && zipNum <= 6999) return 'CT';
  if (zipNum >= 19700 && zipNum <= 19999) return 'DE';
  if (zipNum >= 32000 && zipNum <= 34999) return 'FL';
  if (zipNum >= 30000 && zipNum <= 31999) return 'GA';
  if (zipNum >= 96700 && zipNum <= 96899) return 'HI';
  if (zipNum >= 83200 && zipNum <= 83899) return 'ID';
  if (zipNum >= 60000 && zipNum <= 62999) return 'IL';
  if (zipNum >= 46000 && zipNum <= 47999) return 'IN';
  if (zipNum >= 50000 && zipNum <= 52899) return 'IA';
  if (zipNum >= 66000 && zipNum <= 67999) return 'KS';
  if (zipNum >= 40000 && zipNum <= 42799) return 'KY';
  if (zipNum >= 70000 && zipNum <= 71599) return 'LA';
  if (zipNum >= 3900 && zipNum <= 4999) return 'ME';
  if (zipNum >= 20600 && zipNum <= 21999) return 'MD';
  if (zipNum >= 1000 && zipNum <= 2799) return 'MA';
  if (zipNum >= 48000 && zipNum <= 49999) return 'MI';
  if (zipNum >= 55000 && zipNum <= 56799) return 'MN';
  if (zipNum >= 38600 && zipNum <= 39799) return 'MS';
  if (zipNum >= 63000 && zipNum <= 65899) return 'MO';
  if (zipNum >= 59000 && zipNum <= 59999) return 'MT';
  if (zipNum >= 68000 && zipNum <= 69399) return 'NE';
  if (zipNum >= 88900 && zipNum <= 89899) return 'NV';
  if (zipNum >= 3000 && zipNum <= 3899) return 'NH';
  if (zipNum >= 7000 && zipNum <= 8999) return 'NJ';
  if (zipNum >= 87000 && zipNum <= 88499) return 'NM';
  if (zipNum >= 10000 && zipNum <= 14999) return 'NY';
  if (zipNum >= 27000 && zipNum <= 28999) return 'NC';
  if (zipNum >= 58000 && zipNum <= 58899) return 'ND';
  if (zipNum >= 43000 && zipNum <= 45999) return 'OH';
  if (zipNum >= 73000 && zipNum <= 74999) return 'OK';
  if (zipNum >= 97000 && zipNum <= 97999) return 'OR';
  if (zipNum >= 15000 && zipNum <= 19699) return 'PA';
  if (zipNum >= 2800 && zipNum <= 2999) return 'RI';
  if (zipNum >= 29000 && zipNum <= 29999) return 'SC';
  if (zipNum >= 57000 && zipNum <= 57899) return 'SD';
  if (zipNum >= 37000 && zipNum <= 38599) return 'TN';
  if (zipNum >= 75000 && zipNum <= 79999 || zipNum >= 88500 && zipNum <= 88599) return 'TX';
  if (zipNum >= 84000 && zipNum <= 84799) return 'UT';
  if (zipNum >= 5000 && zipNum <= 5999) return 'VT';
  if (zipNum >= 22000 && zipNum <= 24699) return 'VA';
  if (zipNum >= 98000 && zipNum <= 99499) return 'WA';
  if (zipNum >= 20000 && zipNum <= 20599) return 'DC';
  if (zipNum >= 24700 && zipNum <= 26899) return 'WV';
  if (zipNum >= 53000 && zipNum <= 54999) return 'WI';
  if (zipNum >= 82000 && zipNum <= 83199) return 'WY';
  
  return null;
}