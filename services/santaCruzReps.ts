// Actual federal representatives for Santa Cruz County (ZIP 95060)
import { Representative } from '@/types';

export const santaCruzFederalReps: Representative[] = [
  {
    id: 'sen-ca-padilla',
    name: 'Alex Padilla',
    title: 'Senator',
    party: 'Democrat',
    state: 'CA',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@padilla.senate.gov',
      phone: '202-224-3553',
      website: 'https://padilla.senate.gov'
    },
    socialMedia: {
      twitter: '@SenAlexPadilla',
      facebook: 'SenatorAlexPadilla'
    },
    committees: [
      { id: 'c1', name: 'Environment and Public Works', role: 'Member' },
      { id: 'c2', name: 'Judiciary', role: 'Member' },
      { id: 'c3', name: 'Homeland Security', role: 'Member' }
    ],
    biography: undefined,
    termStart: '2021-01-20',
    termEnd: '2029-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'California',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  },
  {
    id: 'sen-ca-schiff',
    name: 'Adam Schiff',
    title: 'Senator',
    party: 'Democrat',
    state: 'CA',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@schiff.senate.gov',
      phone: '202-224-3841',
      website: 'https://schiff.senate.gov'
    },
    socialMedia: {
      twitter: '@SenAdamSchiff',
      facebook: 'SenatorAdamSchiff'
    },
    committees: [],
    biography: undefined,
    termStart: '2025-01-03',
    termEnd: '2031-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'California',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  },
  {
    id: 'rep-ca-18',
    name: 'Zoe Lofgren',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '18',
    chamber: 'House',
    contactInfo: {
      email: 'zoe.lofgren@mail.house.gov',
      phone: '202-225-3072',
      website: 'https://lofgren.house.gov'
    },
    socialMedia: {
      twitter: '@RepZoeLofgren',
      facebook: 'RepZoeLofgren'
    },
    committees: [
      { id: 'c4', name: 'House Judiciary Committee', role: 'Member' },
      { id: 'c5', name: 'House Administration Committee', role: 'Member' as const }
    ],
    biography: 'Representative for California\'s 18th district, which includes Santa Cruz County',
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    officeLocations: [
      {
        type: 'District' as const,
        address: {
          street: '900 Front Street, Suite 100',
          city: 'Santa Cruz',
          state: 'CA',
          zipCode: '95060'
        },
        phone: '831-429-1976'
      }
    ],
    level: 'federal',
    jurisdiction: 'California',
    governmentType: 'federal',
    jurisdictionScope: 'district'
  }
];

// State legislators for Santa Cruz
export const santaCruzStateReps: Representative[] = [
  {
    id: 'state-sen-17',
    name: 'John Laird',
    title: 'State Senator',
    party: 'Democrat',
    state: 'CA',
    district: '17',
    chamber: 'State Senate' as any,
    contactInfo: {
      email: 'senator.laird@senate.ca.gov',
      phone: '831-425-0401',
      website: 'https://sd17.senate.ca.gov'
    },
    socialMedia: {
      twitter: '@SenJohnLaird',
      facebook: 'SenatorJohnLaird'
    },
    committees: [],
    biography: 'California State Senator for District 17, covering Santa Cruz County',
    termStart: '2020-12-07',
    termEnd: '2024-12-02',
    officeLocations: [
      {
        type: 'District' as const,
        address: {
          street: '701 Ocean Street, Room 318A',
          city: 'Santa Cruz',
          state: 'CA',
          zipCode: '95060'
        },
        phone: '831-425-0401'
      }
    ],
    level: 'state',
    jurisdiction: 'California',
    governmentType: 'state',
    jurisdictionScope: 'district'
  },
  {
    id: 'state-asm-29',
    name: 'Robert Rivas',
    title: 'Assembly Speaker',
    party: 'Democrat',
    state: 'CA',
    district: '29',
    chamber: 'State Assembly' as any,
    contactInfo: {
      email: 'assemblymember.rivas@assembly.ca.gov',
      phone: '831-759-8676',
      website: 'https://a29.asmdc.org'
    },
    socialMedia: {
      twitter: '@AsmRobertRivas',
      facebook: 'AsmRobertRivas'
    },
    committees: [],
    biography: 'Speaker of the California State Assembly, representing District 29 including parts of Santa Cruz County',
    termStart: '2023-06-30',
    termEnd: '2024-11-30',
    officeLocations: undefined,
    level: 'state',
    jurisdiction: 'California',
    governmentType: 'state',
    jurisdictionScope: 'district'
  }
];

// Local officials for Santa Cruz
export const santaCruzLocalReps: Representative[] = [
  {
    id: 'mayor-santa-cruz',
    name: 'Fred Keeley',
    title: 'Mayor',
    party: 'Democrat',
    state: 'CA',
    district: 'Santa Cruz',
    chamber: 'Local' as any,
    contactInfo: {
      email: 'citycouncil@santacruzcity.com',
      phone: '831-420-5020',
      website: 'https://www.cityofsantacruz.com'
    },
    socialMedia: {
      twitter: '@CityofSantaCruz',
      facebook: 'cityofsantacruz'
    },
    committees: [],
    biography: 'Mayor of Santa Cruz',
    termStart: '2024-12-10',
    termEnd: '2026-12-01',
    officeLocations: [
      {
        type: 'District' as const,
        address: {
          street: '809 Center Street',
          city: 'Santa Cruz',
          state: 'CA',
          zipCode: '95060'
        },
        phone: '831-420-5020'
      }
    ],
    level: 'municipal',
    jurisdiction: 'Santa Cruz',
    governmentType: 'city',
    jurisdictionScope: 'citywide'
  }
];