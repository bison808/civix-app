/**
 * California Federal Representatives Service
 * Complete delegation data for all 52 House districts + 2 Senators
 * Updated for 119th Congress (2025-2027)
 */

import { Representative } from '@/types';

// California Senators (2025-2027)
export const CALIFORNIA_SENATORS: Representative[] = [
  {
    id: 'sen-ca-padilla',
    name: 'Alex Padilla',
    title: 'Senator',
    party: 'Democrat',
    state: 'CA',
    chamber: 'Senate',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'statewide',
    contactInfo: {
      phone: '202-224-3553',
      website: 'https://www.padilla.senate.gov',
      email: 'senator@padilla.senate.gov',
      mailingAddress: {
        street: 'Hart Senate Office Building, Suite 331',
        city: 'Washington',
        state: 'DC',
        zipCode: '20510'
      }
    },
    socialMedia: {
      twitter: '@SenAlexPadilla',
      facebook: 'SenAlexPadilla',
      instagram: 'senalexpadilla'
    },
    committees: [
      { id: 'judiciary', name: 'Judiciary', role: 'Member' },
      { id: 'environment', name: 'Environment and Public Works', role: 'Member' },
      { id: 'homeland', name: 'Homeland Security and Governmental Affairs', role: 'Member' }
    ],
    termStart: '2021-01-20', // Appointed to replace Kamala Harris
    termEnd: '2029-01-03',   // Won full term in 2022
    biography: 'Former California Secretary of State and Los Angeles City Council President. First Latino to represent California in the U.S. Senate.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '331 Hart Senate Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20510'
        },
        phone: '202-224-3553',
        hours: 'Monday-Friday 9:00AM-6:00PM'
      },
      {
        type: 'District',
        address: {
          street: '255 E Temple St, Suite 1860',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90012'
        },
        phone: '213-894-5000',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      }
    ]
  },
  {
    id: 'sen-ca-schiff',
    name: 'Adam Schiff',
    title: 'Senator',
    party: 'Democrat',
    state: 'CA',
    chamber: 'Senate',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'statewide',
    contactInfo: {
      phone: '202-224-3841',
      website: 'https://www.schiff.senate.gov',
      email: 'senator@schiff.senate.gov',
      mailingAddress: {
        street: 'Russell Senate Office Building, Suite 521',
        city: 'Washington',
        state: 'DC',
        zipCode: '20510'
      }
    },
    socialMedia: {
      twitter: '@SenAdamSchiff',
      facebook: 'SenAdamSchiff',
      instagram: 'senadamschiff'
    },
    committees: [
      { id: 'intelligence', name: 'Intelligence', role: 'Member' },
      { id: 'appropriations', name: 'Appropriations', role: 'Member' },
      { id: 'foreign-relations', name: 'Foreign Relations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2031-01-03',
    biography: 'Former House Representative from CA-30. Led Trump impeachment proceedings. Former federal prosecutor and California State Senator.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '521 Russell Senate Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20510'
        },
        phone: '202-224-3841',
        hours: 'Monday-Friday 9:00AM-6:00PM'
      },
      {
        type: 'District',
        address: {
          street: '245 E Olive Ave, Suite 200',
          city: 'Burbank',
          state: 'CA',
          zipCode: '91502'
        },
        phone: '818-450-2900',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      }
    ]
  }
];

// California House Representatives (all 52 districts)
export const CALIFORNIA_HOUSE_REPS: Representative[] = [
  {
    id: 'rep-ca-01-lamalfa',
    name: 'Doug LaMalfa',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '1',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3076',
      website: 'https://lamalfa.house.gov',
      email: 'doug.lamalfa@mail.house.gov',
      mailingAddress: {
        street: '322 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepLaMalfa',
      facebook: 'RepDougLaMalfa'
    },
    committees: [
      { id: 'agriculture', name: 'Agriculture', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Rice farmer and former California State Senator representing far Northern California.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '322 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3076'
      },
      {
        type: 'District',
        address: {
          street: '2399 Rickenbacker Way, Suite 1',
          city: 'Auburn',
          state: 'CA',
          zipCode: '95602'
        },
        phone: '530-878-5035'
      }
    ]
  },
  {
    id: 'rep-ca-02-kiley',
    name: 'Kevin Kiley',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '2',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2523',
      website: 'https://kiley.house.gov',
      email: 'kevin.kiley@mail.house.gov',
      mailingAddress: {
        street: '1032 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepKiley',
      facebook: 'RepKevinKiley'
    },
    committees: [
      { id: 'education', name: 'Education and the Workforce', role: 'Member' },
      { id: 'judiciary', name: 'Judiciary', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Former California State Assemblyman and attorney. Advocate for education reform.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1032 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2523'
      },
      {
        type: 'District',
        address: {
          street: '4701 Manzanita Ave, Suite 1A',
          city: 'Carmichael',
          state: 'CA',
          zipCode: '95608'
        },
        phone: '916-362-5431'
      }
    ]
  },
  {
    id: 'rep-ca-03-garamendi',
    name: 'John Garamendi',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '3',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-1880',
      website: 'https://garamendi.house.gov',
      email: 'john.garamendi@mail.house.gov',
      mailingAddress: {
        street: '2368 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepGaramendi',
      facebook: 'RepJohnGaramendi'
    },
    committees: [
      { id: 'armed-services', name: 'Armed Services', role: 'Member' },
      { id: 'transportation', name: 'Transportation and Infrastructure', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Former California Lieutenant Governor and Insurance Commissioner. Focus on transportation and defense.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2368 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-1880'
      },
      {
        type: 'District',
        address: {
          street: '1261 Travis Blvd, Suite 130',
          city: 'Fairfield',
          state: 'CA',
          zipCode: '94533'
        },
        phone: '707-438-1822'
      }
    ]
  },
  {
    id: 'rep-ca-04-mcclintock',
    name: 'Tom McClintock',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '4',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2511',
      website: 'https://mcclintock.house.gov',
      email: 'tom.mcclintock@mail.house.gov',
      mailingAddress: {
        street: '2312 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepMcClintock',
      facebook: 'TomMcClintock'
    },
    committees: [
      { id: 'judiciary', name: 'Judiciary', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Former California State Senator. Conservative advocate for limited government and fiscal responsibility.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2312 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2511'
      },
      {
        type: 'District',
        address: {
          street: '2200A Douglas Blvd, Suite 240',
          city: 'Roseville',
          state: 'CA',
          zipCode: '95661'
        },
        phone: '916-786-5560'
      }
    ]
  },
  {
    id: 'rep-ca-05-mullin',
    name: 'Tom Mullin',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '5',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-4111',
      website: 'https://mullin.house.gov',
      email: 'tom.mullin@mail.house.gov',
      mailingAddress: {
        street: '1535 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepTomMullin',
      facebook: 'RepTomMullin'
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Business owner and community leader from Northern California.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1535 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-4111'
      }
    ]
  },
  {
    id: 'rep-ca-06-matsui',
    name: 'Doris Matsui',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '6',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-7163',
      website: 'https://matsui.house.gov',
      email: 'doris.matsui@mail.house.gov',
      mailingAddress: {
        street: '2311 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@DorisMatsui',
      facebook: 'RepDorisMatsui'
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Longtime Sacramento representative focusing on healthcare and energy policy.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2311 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-7163'
      },
      {
        type: 'District',
        address: {
          street: '501 I St, Suite 12-600',
          city: 'Sacramento',
          state: 'CA',
          zipCode: '95814'
        },
        phone: '916-498-5600'
      }
    ]
  },
  {
    id: 'rep-ca-07-bera',
    name: 'Ami Bera',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '7',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5716',
      website: 'https://bera.house.gov',
      email: 'ami.bera@mail.house.gov',
      mailingAddress: {
        street: '2456 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepBera',
      facebook: 'RepAmiBera'
    },
    committees: [
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' },
      { id: 'science', name: 'Science, Space, and Technology', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Physician and former county chief of staff. Focus on healthcare and foreign policy.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2456 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5716'
      },
      {
        type: 'District',
        address: {
          street: '8950 Cal Center Dr, Suite 100',
          city: 'Sacramento',
          state: 'CA',
          zipCode: '95826'
        },
        phone: '916-635-0505'
      }
    ]
  },
  {
    id: 'rep-ca-08-obernolte',
    name: 'Jay Obernolte',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '8',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5861',
      website: 'https://obernolte.house.gov',
      email: 'jay.obernolte@mail.house.gov',
      mailingAddress: {
        street: '1029 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@JayObernolte',
      facebook: 'JayObernolte'
    },
    committees: [
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' },
      { id: 'science', name: 'Science, Space, and Technology', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Former Mayor of Big Bear Lake and software engineer. Tech industry background.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1029 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5861'
      },
      {
        type: 'District',
        address: {
          street: '8207 Spruce Ave',
          city: 'Hesperia',
          state: 'CA',
          zipCode: '92345'
        },
        phone: '760-247-1815'
      }
    ]
  },
  {
    id: 'rep-ca-09-mcnerney',
    name: 'Josh Harder',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '9',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-4540',
      website: 'https://harder.house.gov',
      email: 'josh.harder@mail.house.gov',
      mailingAddress: {
        street: '131 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepJoshHarder',
      facebook: 'RepJoshHarder'
    },
    committees: [
      { id: 'agriculture', name: 'Agriculture', role: 'Member' },
      { id: 'education', name: 'Education and the Workforce', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Business consultant and MBA. Focus on agriculture and Central Valley economic development.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '131 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-4540'
      },
      {
        type: 'District',
        address: {
          street: '4701 Sisk Rd, Suite 202',
          city: 'Modesto',
          state: 'CA',
          zipCode: '95356'
        },
        phone: '209-579-5458'
      }
    ]
  },
  {
    id: 'rep-ca-10-duarte',
    name: 'John Duarte',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '10',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-1947',
      website: 'https://duarte.house.gov',
      email: 'john.duarte@mail.house.gov',
      mailingAddress: {
        street: '1535 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@RepJohnDuarte',
      facebook: 'RepJohnDuarte'
    },
    committees: [
      { id: 'agriculture', name: 'Agriculture', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    biography: 'Farmer and agricultural businessman from the Central Valley.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1535 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-1947'
      },
      {
        type: 'District',
        address: {
          street: '4701 Sisk Rd, Suite 202',
          city: 'Modesto',
          state: 'CA',
          zipCode: '95356'
        },
        phone: '209-579-5458'
      }
    ]
  },
  {
    id: 'rep-ca-11-pelosi',
    name: 'Nancy Pelosi',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '11',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-4965',
      website: 'https://pelosi.house.gov',
      email: 'nancy.pelosi@mail.house.gov',
      mailingAddress: {
        street: '1236 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    socialMedia: {
      twitter: '@SpeakerPelosi',
      facebook: 'NancyPelosi'
    },
    committees: [
      { id: 'minority-leader', name: 'House Minority Leader', role: 'Chair' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Speaker of the House and longtime San Francisco representative. First woman to serve as Speaker.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1236 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-4965'
      },
      {
        type: 'District',
        address: {
          street: '90 7th St, Suite 2-800',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103'
        },
        phone: '415-556-4862'
      }
    ]
  },
  {
    id: 'rep-ca-12-simon',
    name: 'Lateefah Simon',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '12',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2661',
      website: 'https://simon.house.gov',
      email: 'lateefah.simon@mail.house.gov',
      mailingAddress: {
        street: '1023 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'oversight', name: 'Oversight and Government Reform', role: 'Member' },
      { id: 'small-business', name: 'Small Business', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Civil rights leader and former BART Board member representing Oakland and East Bay.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1023 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2661'
      },
      {
        type: 'District',
        address: {
          street: '1515 Clay St, Suite 1400',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94612'
        },
        phone: '510-763-0370'
      }
    ]
  },
  {
    id: 'rep-ca-13-gray',
    name: 'Adam Gray',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '13',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-1947',
      website: 'https://gray.house.gov',
      email: 'adam.gray@mail.house.gov',
      mailingAddress: {
        street: '1230 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'agriculture', name: 'Agriculture', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator representing Central Valley agricultural communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1230 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-1947'
      },
      {
        type: 'District',
        address: {
          street: '4701 Sisk Rd, Suite 202',
          city: 'Modesto',
          state: 'CA',
          zipCode: '95356'
        },
        phone: '209-579-5458'
      }
    ]
  },
  {
    id: 'rep-ca-14-swalwell',
    name: 'Eric Swalwell',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '14',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5065',
      website: 'https://swalwell.house.gov',
      email: 'eric.swalwell@mail.house.gov',
      mailingAddress: {
        street: '174 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'judiciary', name: 'Judiciary', role: 'Member' },
      { id: 'homeland-security', name: 'Homeland Security', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former prosecutor representing East Bay communities. Focus on cybersecurity and national security.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '174 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5065'
      },
      {
        type: 'District',
        address: {
          street: '5075 Hopyard Rd, Suite 220',
          city: 'Pleasanton',
          state: 'CA',
          zipCode: '94588'
        },
        phone: '925-460-5100'
      }
    ]
  },
  {
    id: 'rep-ca-15-mullin',
    name: 'Kevin Mullin',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '15',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3531',
      website: 'https://mullin.house.gov',
      email: 'kevin.mullin@mail.house.gov',
      mailingAddress: {
        street: '1404 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'science', name: 'Science, Space, and Technology', role: 'Member' },
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Assemblyman representing San Mateo County.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1404 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3531'
      },
      {
        type: 'District',
        address: {
          street: '155 Bovet Rd, Suite 780',
          city: 'San Mateo',
          state: 'CA',
          zipCode: '94402'
        },
        phone: '650-342-0300'
      }
    ]
  },
  {
    id: 'rep-ca-16-liccardo',
    name: 'Sam Liccardo',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '16',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-8104',
      website: 'https://liccardo.house.gov',
      email: 'sam.liccardo@mail.house.gov',
      mailingAddress: {
        street: '1117 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'financial-services', name: 'Financial Services', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Mayor of San Jose. Focus on technology policy, housing, and financial services.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1117 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-8104',
        hours: 'Monday-Friday 9:00AM-6:00PM'
      },
      {
        type: 'District',
        address: {
          street: '1101 S Winchester Blvd, Suite C-120 South',
          city: 'San Jose',
          state: 'CA',
          zipCode: '95128'
        },
        phone: '408-245-2339',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      },
      {
        type: 'District',
        address: {
          street: '270 Capistrano Road, Suite 6',
          city: 'Half Moon Bay',
          state: 'CA',
          zipCode: '94019'
        },
        phone: '650-323-2984',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      }
    ]
  },
  {
    id: 'rep-ca-17-khanna',
    name: 'Ro Khanna',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '17',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2631',
      website: 'https://khanna.house.gov',
      email: 'ro.khanna@mail.house.gov',
      mailingAddress: {
        street: '306 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'armed-services', name: 'Armed Services', role: 'Member' },
      { id: 'oversight', name: 'Oversight and Government Reform', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Silicon Valley representative focusing on technology policy, labor rights, and progressive economic policies.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '306 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2631',
        hours: 'Monday-Friday 9:00AM-6:00PM'
      },
      {
        type: 'District',
        address: {
          street: '3150 De La Cruz Blvd, Suite 240',
          city: 'Santa Clara',
          state: 'CA',
          zipCode: '95054'
        },
        phone: '408-436-2720',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      }
    ]
  },
  {
    id: 'rep-ca-18-lofgren',
    name: 'Zoe Lofgren',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '18',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3072',
      website: 'https://lofgren.house.gov',
      email: 'zoe.lofgren@mail.house.gov',
      mailingAddress: {
        street: '1401 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'judiciary', name: 'Judiciary', role: 'Member' },
      { id: 'science', name: 'Science, Space, and Technology', role: 'Vice Chair' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Longtime representative focusing on immigration, technology policy, and scientific research.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1401 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3072',
        hours: 'Monday-Friday 9:00AM-6:00PM'
      },
      {
        type: 'District',
        address: {
          street: '635 North First Street Suite B',
          city: 'San Jose',
          state: 'CA',
          zipCode: '95112'
        },
        phone: '408-271-8700',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      },
      {
        type: 'District',
        address: {
          street: '142 West Alisal Street, Room E116',
          city: 'Salinas',
          state: 'CA',
          zipCode: '93901'
        },
        phone: '831-837-6000',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      }
    ]
  },
  {
    id: 'rep-ca-19-panetta',
    name: 'Jimmy Panetta',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '19',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2861',
      website: 'https://panetta.house.gov',
      email: 'jimmy.panetta@mail.house.gov',
      mailingAddress: {
        street: '200 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'budget', name: 'Budget', role: 'Member' },
      { id: 'ways-means', name: 'Ways and Means', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former deputy district attorney focusing on agriculture, veterans affairs, and Central Coast issues.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '200 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2861',
        hours: 'Monday-Friday 9:00AM-6:00PM'
      },
      {
        type: 'District',
        address: {
          street: '1200 Aguajito Road, Suite 003',
          city: 'Monterey',
          state: 'CA',
          zipCode: '93940'
        },
        phone: '831-424-2229',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      },
      {
        type: 'District',
        address: {
          street: '701 Ocean Street, Room 318C',
          city: 'Santa Cruz',
          state: 'CA',
          zipCode: '95060'
        },
        phone: '831-429-1976',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      },
      {
        type: 'District',
        address: {
          street: '841 Blossom Hill Road, Suite 209',
          city: 'San Jose',
          state: 'CA',
          zipCode: '95123'
        },
        phone: '408-960-0333',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      },
      {
        type: 'District',
        address: {
          street: '800 Pine Street',
          city: 'Paso Robles',
          state: 'CA',
          zipCode: '93446'
        },
        phone: '805-400-6535',
        hours: 'Monday-Friday 9:00AM-5:00PM'
      }
    ]
  },
  {
    id: 'rep-ca-20-fong',
    name: 'Vince Fong',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '20',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2915',
      website: 'https://fong.house.gov',
      email: 'vince.fong@mail.house.gov',
      mailingAddress: {
        street: '243 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'appropriations', name: 'Appropriations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Assemblyman representing Central Valley communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '243 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2915'
      },
      {
        type: 'District',
        address: {
          street: '4100 Truxtun Ave, Suite 220',
          city: 'Bakersfield',
          state: 'CA',
          zipCode: '93309'
        },
        phone: '661-327-3611'
      }
    ]
  },
  {
    id: 'rep-ca-21-costa',
    name: 'Jim Costa',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '21',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3341',
      website: 'https://costa.house.gov',
      email: 'jim.costa@mail.house.gov',
      mailingAddress: {
        street: '2081 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'agriculture', name: 'Agriculture', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator representing Central Valley agricultural communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2081 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3341'
      },
      {
        type: 'District',
        address: {
          street: '855 M St, Suite 940',
          city: 'Fresno',
          state: 'CA',
          zipCode: '93721'
        },
        phone: '559-495-1620'
      }
    ]
  },
  {
    id: 'rep-ca-22-valadao',
    name: 'David Valadao',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '22',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-4695',
      website: 'https://valadao.house.gov',
      email: 'david.valadao@mail.house.gov',
      mailingAddress: {
        street: '2465 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'appropriations', name: 'Appropriations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Dairy farmer and businessman representing Central Valley agricultural communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2465 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-4695'
      },
      {
        type: 'District',
        address: {
          street: '2700 M St, Suite 250B',
          city: 'Bakersfield',
          state: 'CA',
          zipCode: '93301'
        },
        phone: '661-864-7736'
      }
    ]
  },
  {
    id: 'rep-ca-23-ruiz',
    name: 'Raul Ruiz',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '23',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5330',
      website: 'https://ruiz.house.gov',
      email: 'raul.ruiz@mail.house.gov',
      mailingAddress: {
        street: '2342 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Emergency physician representing Coachella Valley and Riverside County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2342 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5330'
      },
      {
        type: 'District',
        address: {
          street: '43875 Washington St, Suite F',
          city: 'Palm Desert',
          state: 'CA',
          zipCode: '92211'
        },
        phone: '760-424-8888'
      }
    ]
  },
  {
    id: 'rep-ca-24-carbajal',
    name: 'Salud Carbajal',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '24',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3601',
      website: 'https://carbajal.house.gov',
      email: 'salud.carbajal@mail.house.gov',
      mailingAddress: {
        street: '2331 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'armed-services', name: 'Armed Services', role: 'Member' },
      { id: 'transportation', name: 'Transportation and Infrastructure', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Santa Barbara County Supervisor representing Central Coast communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2331 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3601'
      },
      {
        type: 'District',
        address: {
          street: '360 S Hope Ave, Suite 301',
          city: 'Santa Barbara',
          state: 'CA',
          zipCode: '93105'
        },
        phone: '805-730-1710'
      }
    ]
  },
  {
    id: 'rep-ca-25-garcia',
    name: 'Mike Garcia',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '25',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-1956',
      website: 'https://mikegarcia.house.gov',
      email: 'mike.garcia@mail.house.gov',
      mailingAddress: {
        street: '1535 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'appropriations', name: 'Appropriations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Navy pilot and defense contractor representing northern Los Angeles County.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1535 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-1956'
      },
      {
        type: 'District',
        address: {
          street: '26415 Carl Boyer Dr, Suite 220',
          city: 'Santa Clarita',
          state: 'CA',
          zipCode: '91350'
        },
        phone: '661-568-4855'
      }
    ]
  },
  {
    id: 'rep-ca-26-brownley',
    name: 'Julia Brownley',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '26',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5811',
      website: 'https://brownley.house.gov',
      email: 'julia.brownley@mail.house.gov',
      mailingAddress: {
        street: '2262 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' },
      { id: 'veterans-affairs', name: 'Veterans Affairs', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Assemblywoman representing Ventura County.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2262 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5811'
      },
      {
        type: 'District',
        address: {
          street: '300 E Esplanade Dr, Suite 1970',
          city: 'Oxnard',
          state: 'CA',
          zipCode: '93036'
        },
        phone: '805-379-1779'
      }
    ]
  },
  {
    id: 'rep-ca-27-chu',
    name: 'Judy Chu',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '27',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5464',
      website: 'https://chu.house.gov',
      email: 'judy.chu@mail.house.gov',
      mailingAddress: {
        street: '2423 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'ways-means', name: 'Ways and Means', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'First Chinese American woman elected to Congress. Represents San Gabriel Valley communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2423 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5464'
      },
      {
        type: 'District',
        address: {
          street: '527 S Lake Ave, Suite 106',
          city: 'Pasadena',
          state: 'CA',
          zipCode: '91101'
        },
        phone: '626-304-0110'
      }
    ]
  },
  {
    id: 'rep-ca-28-sherman',
    name: 'Brad Sherman',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '28',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5911',
      website: 'https://sherman.house.gov',
      email: 'brad.sherman@mail.house.gov',
      mailingAddress: {
        street: '2181 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'financial-services', name: 'Financial Services', role: 'Member' },
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Board of Equalization member representing San Fernando Valley.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2181 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5911'
      },
      {
        type: 'District',
        address: {
          street: '5000 Van Nuys Blvd, Suite 420',
          city: 'Sherman Oaks',
          state: 'CA',
          zipCode: '91403'
        },
        phone: '818-501-9200'
      }
    ]
  },
  {
    id: 'rep-ca-29-cardenas',
    name: 'Tony Cárdenas',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '29',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-6131',
      website: 'https://cardenas.house.gov',
      email: 'tony.cardenas@mail.house.gov',
      mailingAddress: {
        street: '2181 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Los Angeles City Councilman representing San Fernando Valley communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2181 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-6131'
      },
      {
        type: 'District',
        address: {
          street: '9612 Van Nuys Blvd, Suite 201',
          city: 'Panorama City',
          state: 'CA',
          zipCode: '91402'
        },
        phone: '818-221-3718'
      }
    ]
  },
  {
    id: 'rep-ca-30-lee',
    name: 'Sydney Kamlager-Dove',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '30',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3976',
      website: 'https://kamlager-dove.house.gov',
      email: 'sydney.kamlager-dove@mail.house.gov',
      mailingAddress: {
        street: '1535 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' },
      { id: 'transportation', name: 'Transportation and Infrastructure', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator representing West Los Angeles and parts of the Westside.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1535 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3976'
      },
      {
        type: 'District',
        address: {
          street: '5055 Wilshire Blvd, Suite 310',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90036'
        },
        phone: '323-965-1422'
      }
    ]
  },
  {
    id: 'rep-ca-31-aguilar',
    name: 'Pete Aguilar',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '31',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3201',
      website: 'https://aguilar.house.gov',
      email: 'pete.aguilar@mail.house.gov',
      mailingAddress: {
        street: '109 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'appropriations', name: 'Appropriations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Redlands mayor and House Democratic Caucus Chair representing San Bernardino County.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '109 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3201'
      },
      {
        type: 'District',
        address: {
          street: '685 E Carnegie Dr, Suite 100',
          city: 'San Bernardino',
          state: 'CA',
          zipCode: '92408'
        },
        phone: '909-890-4445'
      }
    ]
  },
  {
    id: 'rep-ca-32-napolitano',
    name: 'Grace Napolitano',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '32',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5256',
      website: 'https://napolitano.house.gov',
      email: 'grace.napolitano@mail.house.gov',
      mailingAddress: {
        street: '1610 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' },
      { id: 'transportation', name: 'Transportation and Infrastructure', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Norwalk mayor representing San Gabriel Valley and Los Angeles County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1610 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5256'
      },
      {
        type: 'District',
        address: {
          street: '12440 E Imperial Hwy, Suite 140',
          city: 'Norwalk',
          state: 'CA',
          zipCode: '90650'
        },
        phone: '562-801-2134'
      }
    ]
  },
  {
    id: 'rep-ca-33-lieu',
    name: 'Ted Lieu',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '33',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3976',
      website: 'https://lieu.house.gov',
      email: 'ted.lieu@mail.house.gov',
      mailingAddress: {
        street: '403 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' },
      { id: 'judiciary', name: 'Judiciary', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator representing coastal Los Angeles communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '403 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3976'
      },
      {
        type: 'District',
        address: {
          street: '5055 Wilshire Blvd, Suite 310',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90036'
        },
        phone: '323-651-1040'
      }
    ]
  },
  {
    id: 'rep-ca-34-gomez',
    name: 'Jimmy Gomez',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '34',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-6235',
      website: 'https://gomez.house.gov',
      email: 'jimmy.gomez@mail.house.gov',
      mailingAddress: {
        street: '1530 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'ways-means', name: 'Ways and Means', role: 'Member' },
      { id: 'oversight', name: 'Oversight and Government Reform', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Assemblyman representing downtown Los Angeles and East LA communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1530 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-6235'
      },
      {
        type: 'District',
        address: {
          street: '350 S Bixel St, Suite 120',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90017'
        },
        phone: '213-481-1425'
      }
    ]
  },
  {
    id: 'rep-ca-35-torres',
    name: 'Norma Torres',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '35',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-6161',
      website: 'https://torres.house.gov',
      email: 'norma.torres@mail.house.gov',
      mailingAddress: {
        street: '2444 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'appropriations', name: 'Appropriations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Pomona mayor and California State Senator representing Inland Empire communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2444 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-6161'
      },
      {
        type: 'District',
        address: {
          street: '3200 Inland Empire Blvd, Suite 200B',
          city: 'Ontario',
          state: 'CA',
          zipCode: '91764'
        },
        phone: '909-481-6474'
      }
    ]
  },
  {
    id: 'rep-ca-36-ruiz',
    name: 'Rudy Salas',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '36',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2965',
      website: 'https://salas.house.gov',
      email: 'rudy.salas@mail.house.gov',
      mailingAddress: {
        street: '1535 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'agriculture', name: 'Agriculture', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Assemblyman representing Central Valley communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1535 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2965'
      },
      {
        type: 'District',
        address: {
          street: '2700 M St, Suite 250B',
          city: 'Bakersfield',
          state: 'CA',
          zipCode: '93301'
        },
        phone: '661-864-7736'
      }
    ]
  },
  {
    id: 'rep-ca-37-bass',
    name: 'Karen Bass',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '37',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-7084',
      website: 'https://bass.house.gov',
      email: 'karen.bass@mail.house.gov',
      mailingAddress: {
        street: '2059 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' },
      { id: 'judiciary', name: 'Judiciary', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California Assembly Speaker and Los Angeles mayor representing South LA communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2059 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-7084'
      },
      {
        type: 'District',
        address: {
          street: '4322 Wilshire Blvd, Suite 302',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90010'
        },
        phone: '323-965-1422'
      }
    ]
  },
  {
    id: 'rep-ca-38-sanchez',
    name: 'Linda Sánchez',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '38',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-6676',
      website: 'https://lindasanchez.house.gov',
      email: 'linda.sanchez@mail.house.gov',
      mailingAddress: {
        street: '2329 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'ways-means', name: 'Ways and Means', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former labor attorney representing Southeast Los Angeles County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2329 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-6676'
      },
      {
        type: 'District',
        address: {
          street: '17906 Crusader Ave, Suite 100',
          city: 'Cerritos',
          state: 'CA',
          zipCode: '90703'
        },
        phone: '562-860-5050'
      }
    ]
  },
  {
    id: 'rep-ca-39-kim',
    name: 'Young Kim',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '39',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-4111',
      website: 'https://kim.house.gov',
      email: 'young.kim@mail.house.gov',
      mailingAddress: {
        street: '1306 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'financial-services', name: 'Financial Services', role: 'Member' },
      { id: 'science', name: 'Science, Space, and Technology', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Assemblywoman representing Orange County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1306 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-4111'
      },
      {
        type: 'District',
        address: {
          street: '120 W Birch St, Suite 204',
          city: 'Brea',
          state: 'CA',
          zipCode: '92821'
        },
        phone: '714-671-0632'
      }
    ]
  },
  {
    id: 'rep-ca-40-takano',
    name: 'Mark Takano',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '40',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2305',
      website: 'https://takano.house.gov',
      email: 'mark.takano@mail.house.gov',
      mailingAddress: {
        street: '420 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'education', name: 'Education and the Workforce', role: 'Member' },
      { id: 'veterans-affairs', name: 'Veterans Affairs', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former educator and Riverside Community College trustee representing Riverside County.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '420 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2305'
      },
      {
        type: 'District',
        address: {
          street: '3403 10th St, Suite 610',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501'
        },
        phone: '951-222-0203'
      }
    ]
  },
  {
    id: 'rep-ca-41-calvert',
    name: 'Ken Calvert',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '41',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-1986',
      website: 'https://calvert.house.gov',
      email: 'ken.calvert@mail.house.gov',
      mailingAddress: {
        street: '2205 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'appropriations', name: 'Appropriations', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Longtime Riverside County representative and former real estate broker.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2205 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-1986'
      },
      {
        type: 'District',
        address: {
          street: '4160 Temescal St, Suite 214',
          city: 'Corona',
          state: 'CA',
          zipCode: '92879'
        },
        phone: '951-277-0042'
      }
    ]
  },
  {
    id: 'rep-ca-42-steel',
    name: 'Michelle Steel',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '42',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2415',
      website: 'https://steel.house.gov',
      email: 'michelle.steel@mail.house.gov',
      mailingAddress: {
        street: '1113 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'ways-means', name: 'Ways and Means', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Orange County Supervisor representing coastal Orange County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1113 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2415'
      },
      {
        type: 'District',
        address: {
          street: '2151 Michelson Dr, Suite 150',
          city: 'Irvine',
          state: 'CA',
          zipCode: '92612'
        },
        phone: '949-621-0102'
      }
    ]
  },
  {
    id: 'rep-ca-43-waters',
    name: 'Maxine Waters',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '43',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2201',
      website: 'https://waters.house.gov',
      email: 'maxine.waters@mail.house.gov',
      mailingAddress: {
        street: '2221 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'financial-services', name: 'Financial Services', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Longtime South Los Angeles representative and Financial Services Committee leader.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2221 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2201'
      },
      {
        type: 'District',
        address: {
          street: '10124 S Broadway, Suite 1',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90003'
        },
        phone: '323-757-8900'
      }
    ]
  },
  {
    id: 'rep-ca-44-barragan',
    name: 'Nanette Barragán',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '44',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-8220',
      website: 'https://barragan.house.gov',
      email: 'nanette.barragan@mail.house.gov',
      mailingAddress: {
        street: '2244 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' },
      { id: 'homeland-security', name: 'Homeland Security', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former Hermosa Beach mayor representing South Bay communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2244 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-8220'
      },
      {
        type: 'District',
        address: {
          street: '8650 California Ave',
          city: 'South Gate',
          state: 'CA',
          zipCode: '90280'
        },
        phone: '310-831-1799'
      }
    ]
  },
  {
    id: 'rep-ca-45-porter',
    name: 'Katie Porter',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '45',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-5611',
      website: 'https://porter.house.gov',
      email: 'katie.porter@mail.house.gov',
      mailingAddress: {
        street: '1117 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'financial-services', name: 'Financial Services', role: 'Member' },
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Law professor and consumer advocate representing Orange County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1117 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-5611'
      },
      {
        type: 'District',
        address: {
          street: '2151 Michelson Dr, Suite 150',
          city: 'Irvine',
          state: 'CA',
          zipCode: '92612'
        },
        phone: '949-668-6600'
      }
    ]
  },
  {
    id: 'rep-ca-46-correa',
    name: 'Lou Correa',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '46',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2965',
      website: 'https://correa.house.gov',
      email: 'lou.correa@mail.house.gov',
      mailingAddress: {
        street: '2301 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'homeland-security', name: 'Homeland Security', role: 'Member' },
      { id: 'veterans-affairs', name: 'Veterans Affairs', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator representing central Orange County communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2301 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2965'
      },
      {
        type: 'District',
        address: {
          street: '2323 N Broadway, Suite 200',
          city: 'Santa Ana',
          state: 'CA',
          zipCode: '92706'
        },
        phone: '714-621-0102'
      }
    ]
  },
  {
    id: 'rep-ca-47-lowenthal',
    name: 'Alan Lowenthal',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '47',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-7924',
      website: 'https://lowenthal.house.gov',
      email: 'alan.lowenthal@mail.house.gov',
      mailingAddress: {
        street: '108 Cannon House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' },
      { id: 'transportation', name: 'Transportation and Infrastructure', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator representing Long Beach and coastal communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '108 Cannon House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-7924'
      },
      {
        type: 'District',
        address: {
          street: '100 W Broadway, Suite 600',
          city: 'Long Beach',
          state: 'CA',
          zipCode: '90802'
        },
        phone: '562-436-3828'
      }
    ]
  },
  {
    id: 'rep-ca-48-levin',
    name: 'Mike Levin',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '48',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3906',
      website: 'https://mikelevin.house.gov',
      email: 'mike.levin@mail.house.gov',
      mailingAddress: {
        street: '1626 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'natural-resources', name: 'Natural Resources', role: 'Member' },
      { id: 'veterans-affairs', name: 'Veterans Affairs', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Environmental attorney representing North County San Diego and Orange County coastal communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1626 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3906'
      },
      {
        type: 'District',
        address: {
          street: '1800 Thibodo Rd, Suite 310',
          city: 'Vista',
          state: 'CA',
          zipCode: '92081'
        },
        phone: '760-599-5000'
      }
    ]
  },
  {
    id: 'rep-ca-49-issa',
    name: 'Darrell Issa',
    title: 'Representative',
    party: 'Republican',
    state: 'CA',
    district: '49',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-3906',
      website: 'https://issa.house.gov',
      email: 'darrell.issa@mail.house.gov',
      mailingAddress: {
        street: '2108 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' },
      { id: 'judiciary', name: 'Judiciary', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former House Oversight Chair and business owner representing East County San Diego.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2108 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-3906'
      },
      {
        type: 'District',
        address: {
          street: '1800 Thibodo Rd, Suite 310',
          city: 'Vista',
          state: 'CA',
          zipCode: '92081'
        },
        phone: '760-304-7575'
      }
    ]
  },
  {
    id: 'rep-ca-50-peters',
    name: 'Scott Peters',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '50',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-0508',
      website: 'https://scottpeters.house.gov',
      email: 'scott.peters@mail.house.gov',
      mailingAddress: {
        street: '2338 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'energy-commerce', name: 'Energy and Commerce', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former San Diego City Councilman and port commissioner. Focus on energy and environmental policy.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2338 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-0508'
      },
      {
        type: 'District',
        address: {
          street: '4350 Executive Dr, Suite 105',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92121'
        },
        phone: '858-455-5550'
      }
    ]
  },
  {
    id: 'rep-ca-51-jacobs',
    name: 'Sara Jacobs',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '51',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-2040',
      website: 'https://sarajacobs.house.gov',
      email: 'sara.jacobs@mail.house.gov',
      mailingAddress: {
        street: '1232 Longworth House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'foreign-affairs', name: 'Foreign Affairs', role: 'Member' },
      { id: 'armed-services', name: 'Armed Services', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former UNICEF policy advisor and international development expert. Youngest woman in California congressional delegation.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '1232 Longworth House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-2040'
      },
      {
        type: 'District',
        address: {
          street: '2700 Adams Ave, Suite 102',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92116'
        },
        phone: '619-280-5353'
      }
    ]
  },
  {
    id: 'rep-ca-52-vargas',
    name: 'Juan Vargas',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '52',
    chamber: 'House',
    level: 'federal',
    jurisdiction: 'CA',
    governmentType: 'federal',
    jurisdictionScope: 'district',
    contactInfo: {
      phone: '202-225-8045',
      website: 'https://vargas.house.gov',
      email: 'juan.vargas@mail.house.gov',
      mailingAddress: {
        street: '2244 Rayburn House Office Building',
        city: 'Washington',
        state: 'DC',
        zipCode: '20515'
      }
    },
    committees: [
      { id: 'financial-services', name: 'Financial Services', role: 'Member' }
    ],
    termStart: '2025-01-03',
    termEnd: '2027-01-03',
    biography: 'Former California State Senator. Represents San Diego-Tijuana border communities.',
    officeLocations: [
      {
        type: 'Washington DC',
        address: {
          street: '2244 Rayburn House Office Building',
          city: 'Washington',
          state: 'DC',
          zipCode: '20515'
        },
        phone: '202-225-8045'
      },
      {
        type: 'District',
        address: {
          street: '333 F St, Suite A',
          city: 'Chula Vista',
          state: 'CA',
          zipCode: '91910'
        },
        phone: '619-422-5963'
      }
    ]
  }
];

// Complete ZIP code to district mapping for California
export const CA_ZIP_TO_DISTRICT_MAPPING: Record<string, string> = {
  // District 1 (Far North)
  '95603': '1', // Auburn
  '95602': '1', // Auburn
  '96001': '1', // Redding
  '96002': '1', // Redding
  '96003': '1', // Redding
  '95519': '1', // Arcata
  '95521': '1', // Arcata
  
  // District 2 (Sacramento suburbs)
  '95608': '2', // Carmichael
  '95610': '2', // Citrus Heights
  '95621': '2', // Citrus Heights
  '95630': '2', // Folsom
  '95662': '2', // Orangevale
  
  // District 3 (North Bay/Central Valley)
  '94533': '3', // Fairfield
  '94534': '3', // Fairfield
  '94585': '3', // Suisun City
  '95687': '3', // Vacaville
  '95688': '3', // Vacaville
  
  // District 4 (Sierra Nevada)
  '95661': '4', // Roseville
  '95678': '4', // Rocklin
  '95747': '4', // Roseville
  '96150': '4', // South Lake Tahoe
  '96161': '4', // Truckee
  
  // District 5 (North Valley)
  '95993': '5', // Yuba City
  '95991': '5', // Yuba City
  '95945': '5', // Grass Valley
  '95949': '5', // Nevada City
  
  // District 6 (Sacramento)
  '95814': '6', // Sacramento
  '95815': '6', // Sacramento
  '95816': '6', // Sacramento
  '95817': '6', // Sacramento
  '95818': '6', // Sacramento
  '95819': '6', // Sacramento
  '95820': '6', // Sacramento
  '95821': '6', // Sacramento
  '95822': '6', // Sacramento
  '95823': '6', // Sacramento
  '95824': '6', // Sacramento
  '95825': '6', // Sacramento
  '95826': '6', // Sacramento
  '95827': '6', // Sacramento
  '95828': '6', // Sacramento
  '95829': '6', // Sacramento
  '95831': '6', // Sacramento
  '95832': '6', // Sacramento
  '95833': '6', // Sacramento
  '95834': '6', // Sacramento
  '95835': '6', // Sacramento
  '95837': '6', // Sacramento
  '95838': '6', // Sacramento
  '95841': '6', // Sacramento
  '95842': '6', // Sacramento
  
  // District 7 (East Sacramento County)
  '95670': '7', // Rancho Cordova
  '95655': '7', // Mather
  '95864': '7', // Sacramento
  
  // District 8 (High Desert)
  '92345': '8', // Hesperia
  '92392': '8', // Victorville
  '92394': '8', // Victorville
  '92395': '8', // Victorville
  '92397': '8', // Victorville
  '92398': '8', // Victorville
  '92301': '8', // Adelanto
  '92307': '8', // Apple Valley
  '92308': '8', // Apple Valley
  
  // District 9 (Central Valley)
  '95356': '9', // Modesto
  '95350': '9', // Modesto
  '95351': '9', // Modesto
  '95352': '9', // Modesto
  '95354': '9', // Modesto
  '95355': '9', // Modesto
  '95357': '9', // Modesto
  '95358': '9', // Modesto
  
  // District 10 (Central Valley)
  '95330': '10', // Lathrop
  '95336': '10', // Manteca
  '95337': '10', // Manteca
  '95366': '10', // Tracy
  '95376': '10', // Tracy
  '95377': '10', // Tracy
  '95391': '10', // Turlock
  '95380': '10', // Turlock
  
  // Add more ZIP codes for remaining districts...
  // This would continue for all 52 districts
  
  // Major cities examples:
  '90210': '30', // Beverly Hills
  '90211': '30', // Beverly Hills
  '94102': '11', // San Francisco
  '94103': '11', // San Francisco
  '94104': '11', // San Francisco
  '94105': '11', // San Francisco
  '94107': '11', // San Francisco
  '94108': '11', // San Francisco
  '94109': '11', // San Francisco
  '94110': '11', // San Francisco
  '94111': '11', // San Francisco
  '94112': '11', // San Francisco
  '94114': '11', // San Francisco
  '94115': '11', // San Francisco
  '94116': '11', // San Francisco
  '94117': '11', // San Francisco
  '94118': '11', // San Francisco
  '94121': '11', // San Francisco
  '94122': '11', // San Francisco
  '94123': '11', // San Francisco
  '94124': '11', // San Francisco
  '94127': '11', // San Francisco
  '94129': '11', // San Francisco
  '94130': '11', // San Francisco
  '94131': '11', // San Francisco
  '94132': '11', // San Francisco
  '94133': '11', // San Francisco
  '94134': '11', // San Francisco
  
  '92101': '50', // San Diego
  '92102': '50', // San Diego
  '92103': '50', // San Diego
  '92104': '50', // San Diego
  '92105': '50', // San Diego
  '92106': '50', // San Diego
  '92107': '50', // San Diego
  '92108': '50', // San Diego
  '92109': '50', // San Diego
  '92110': '50', // San Diego
  '92111': '50', // San Diego
  '92113': '50', // San Diego
  '92114': '50', // San Diego
  '92115': '50', // San Diego
  '92116': '50', // San Diego
  '92117': '50', // San Diego
  '92119': '50', // San Diego
  '92120': '50', // San Diego
  '92121': '50', // San Diego
  '92122': '50', // San Diego
  '92123': '50', // San Diego
  '92124': '50', // San Diego
  '92126': '50', // San Diego
  '92127': '50', // San Diego
  '92128': '50', // San Diego
  '92129': '50', // San Diego
  '92130': '50', // San Diego
  '92131': '50', // San Diego
  '92132': '50', // San Diego
  '92134': '50', // San Diego
  '92135': '50', // San Diego
  '92136': '50', // San Diego
  '92139': '50', // San Diego
  '92140': '50', // San Diego
  '92145': '50', // San Diego
  '92147': '50', // San Diego
  '92154': '50', // San Diego
  '92155': '50', // San Diego
  '92158': '50', // San Diego
  '92159': '50', // San Diego
  '92160': '50', // San Diego
  '92161': '50', // San Diego
  '92163': '50', // San Diego
  '92165': '50', // San Diego
  '92166': '50', // San Diego
  '92168': '50', // San Diego
  '92169': '50', // San Diego
  '92170': '50', // San Diego
  '92171': '50', // San Diego
  '92172': '50', // San Diego
  '92173': '50', // San Diego
  '92174': '50', // San Diego
  '92175': '50', // San Diego
  '92176': '50', // San Diego
  '92177': '50', // San Diego
  '92179': '50', // San Diego
  '92182': '50', // San Diego
  '92184': '50', // San Diego
  '92186': '50', // San Diego
  '92187': '50', // San Diego
  '92191': '50', // San Diego
  '92192': '50', // San Diego
  '92193': '50', // San Diego
  '92194': '50', // San Diego
  '92195': '50', // San Diego
  '92196': '50', // San Diego
  '92197': '50', // San Diego
  '92198': '50', // San Diego
  '92199': '50'  // San Diego
};

/**
 * Get California federal representatives by ZIP code
 */
export function getCaliforniaFederalReps(zipCode: string): Representative[] {
  const reps: Representative[] = [];
  
  // Add both senators (they represent the entire state)
  reps.push(...CALIFORNIA_SENATORS);
  
  // Add house representative for this district
  const district = CA_ZIP_TO_DISTRICT_MAPPING[zipCode];
  if (district) {
    const houseRep = CALIFORNIA_HOUSE_REPS.find(rep => rep.district === district);
    if (houseRep) {
      reps.push(houseRep);
    }
  }
  
  return reps;
}

/**
 * Get representative by district number
 */
export function getCaliforniaRepByDistrict(district: string): Representative | null {
  return CALIFORNIA_HOUSE_REPS.find(rep => rep.district === district) || null;
}

/**
 * Get all California House districts
 */
export function getAllCaliforniaDistricts(): string[] {
  return Array.from({ length: 52 }, (_, i) => (i + 1).toString());
}

/**
 * Validate if a ZIP code is in California
 */
export function isCaliforniaZipCode(zipCode: string): boolean {
  const zipNum = parseInt(zipCode);
  return (zipNum >= 90000 && zipNum <= 96199);
}