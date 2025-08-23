// School District API Service - California School Districts and Board Members
import { Representative } from '../types/representatives.types';

export interface SchoolBoardMember {
  id: string;
  name: string;
  district?: string;
  trusteeArea?: number;
  termStart: string;
  termEnd: string;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
  };
  biography?: string;
  committees?: string[];
}

export interface SchoolDistrict {
  id: string;
  name: string;
  shortName: string;
  type: 'Elementary' | 'High School' | 'Unified' | 'Community College' | 'K-8';
  county: string;
  counties: string[]; // Some districts span multiple counties
  superintendentName: string;
  superintendentEmail?: string;
  boardMembers: SchoolBoardMember[];
  website: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  enrollment?: number;
  schools?: number;
  grades: string;
  zipCodes: string[];
  foundedYear?: number;
  lastElection?: string;
  nextElection?: string;
}

export interface CommunityCollegeDistrict {
  id: string;
  name: string;
  chancellor: string;
  boardMembers: SchoolBoardMember[];
  colleges: string[];
  website: string;
  phone: string;
  zipCodes: string[];
  counties: string[];
}

// Major California School Districts
const CALIFORNIA_SCHOOL_DISTRICTS: Record<string, SchoolDistrict> = {
  'lausd': {
    id: 'lausd',
    name: 'Los Angeles Unified School District',
    shortName: 'LAUSD',
    type: 'Unified',
    county: 'Los Angeles',
    counties: ['Los Angeles'],
    superintendentName: 'Alberto M. Carvalho',
    superintendentEmail: 'superintendent@lausd.net',
    boardMembers: [
      {
        id: 'lausd-board-1',
        name: 'George McKenna III',
        trusteeArea: 1,
        termStart: '2014-07-01',
        termEnd: '2026-06-30',
        contactInfo: {
          email: 'george.mckenna@lausd.net',
          phone: '(213) 241-7000',
          website: 'https://achieve.lausd.net/domain/32'
        },
        biography: 'Educator and former principal with over 40 years of experience in public education.',
        committees: ['Budget and Finance', 'Facilities']
      },
      {
        id: 'lausd-board-2', 
        name: 'Mónica García',
        trusteeArea: 2,
        termStart: '2015-07-01',
        termEnd: '2026-06-30',
        contactInfo: {
          email: 'monica.garcia@lausd.net',
          phone: '(213) 241-7000'
        }
      },
      {
        id: 'lausd-board-3',
        name: 'Scott M. Schmerelson',
        trusteeArea: 3,
        termStart: '2015-07-01',
        termEnd: '2026-06-30',
        contactInfo: {
          email: 'scott.schmerelson@lausd.net',
          phone: '(213) 241-7000'
        }
      },
      {
        id: 'lausd-board-4',
        name: 'Nick Melvoin',
        trusteeArea: 4,
        termStart: '2017-07-01',
        termEnd: '2028-06-30',
        contactInfo: {
          email: 'nick.melvoin@lausd.net',
          phone: '(213) 241-7000'
        }
      },
      {
        id: 'lausd-board-5',
        name: 'Jackie Goldberg',
        trusteeArea: 5,
        termStart: '2019-07-01',
        termEnd: '2026-06-30',
        contactInfo: {
          email: 'jackie.goldberg@lausd.net',
          phone: '(213) 241-7000'
        }
      },
      {
        id: 'lausd-board-6',
        name: 'Kelly Gonez',
        trusteeArea: 6,
        termStart: '2017-07-01',
        termEnd: '2028-06-30',
        contactInfo: {
          email: 'kelly.gonez@lausd.net',
          phone: '(213) 241-7000'
        }
      },
      {
        id: 'lausd-board-7',
        name: 'Tanya Ortiz Franklin',
        trusteeArea: 7,
        termStart: '2019-07-01',
        termEnd: '2026-06-30',
        contactInfo: {
          email: 'tanya.ortizfranklin@lausd.net',
          phone: '(213) 241-7000'
        }
      }
    ],
    website: 'https://lausd.net',
    phone: '(213) 241-1000',
    address: {
      street: '333 S Beaudry Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90017'
    },
    enrollment: 600000,
    schools: 1400,
    grades: 'K-12',
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021', '90022', '90023', '90024', '90025', '90026', '90027', '90028', '90029', '90031', '90032', '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90041', '90042', '90043', '90044', '90045', '90046', '90047', '90048', '90049', '90056', '90057', '90058', '90059', '90061', '90062', '90063', '90064', '90065', '90066', '90068', '90069', '90210', '90211', '90212', '90230', '90272', '90291', '90292', '90293', '91040', '91042'],
    foundedYear: 1961,
    lastElection: '2023-03-07',
    nextElection: '2027-03-02'
  },
  'sdusd': {
    id: 'sdusd',
    name: 'San Diego Unified School District',
    shortName: 'SDUSD',
    type: 'Unified',
    county: 'San Diego',
    counties: ['San Diego'],
    superintendentName: 'Lamont Jackson',
    boardMembers: [
      {
        id: 'sdusd-board-a',
        name: 'Shana Hazan',
        district: 'Sub-district A',
        termStart: '2018-12-11',
        termEnd: '2026-12-31',
        contactInfo: {
          email: 'shazan@sandi.net',
          phone: '(619) 725-8000'
        }
      },
      {
        id: 'sdusd-board-b',
        name: 'Cody Petterson',
        district: 'Sub-district B',
        termStart: '2020-12-08',
        termEnd: '2024-12-31',
        contactInfo: {
          email: 'cpetterson@sandi.net',
          phone: '(619) 725-8000'
        }
      },
      {
        id: 'sdusd-board-c',
        name: 'Sabrina Bazzo',
        district: 'Sub-district C',
        termStart: '2018-12-11',
        termEnd: '2026-12-31',
        contactInfo: {
          email: 'sbazzo@sandi.net',
          phone: '(619) 725-8000'
        }
      },
      {
        id: 'sdusd-board-d',
        name: 'Lamont Jackson',
        district: 'Sub-district D',
        termStart: '2020-12-08',
        termEnd: '2024-12-31',
        contactInfo: {
          email: 'ljackson@sandi.net',
          phone: '(619) 725-8000'
        }
      },
      {
        id: 'sdusd-board-e',
        name: 'Paulette Donnellon',
        district: 'Sub-district E',
        termStart: '2022-12-06',
        termEnd: '2026-12-31',
        contactInfo: {
          email: 'pdonnellon@sandi.net',
          phone: '(619) 725-8000'
        }
      }
    ],
    website: 'https://www.sandiegounified.org',
    phone: '(619) 725-8000',
    address: {
      street: '4100 Normal St',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92103'
    },
    enrollment: 95000,
    schools: 220,
    grades: 'K-12',
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92113', '92114', '92115', '92116', '92117', '92119', '92120', '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131', '92132', '92134', '92135', '92139', '92154', '92173'],
    foundedYear: 1854,
    lastElection: '2022-11-08',
    nextElection: '2024-11-05'
  },
  'sjusd': {
    id: 'sjusd',
    name: 'San José Unified School District',
    shortName: 'SJUSD',
    type: 'Unified',
    county: 'Santa Clara',
    counties: ['Santa Clara'],
    superintendentName: 'Jennifer Sakanagi',
    boardMembers: [
      {
        id: 'sjusd-board-1',
        name: 'Pam Foley',
        trusteeArea: 1,
        termStart: '2018-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'pfoley@sjusd.org',
          phone: '(408) 423-2000'
        }
      },
      {
        id: 'sjusd-board-2',
        name: 'Teresa Castellanos',
        trusteeArea: 2,
        termStart: '2020-12-01',
        termEnd: '2024-11-30',
        contactInfo: {
          email: 'tcastellanos@sjusd.org',
          phone: '(408) 423-2000'
        }
      },
      {
        id: 'sjusd-board-3',
        name: 'Sergio Jimenez',
        trusteeArea: 3,
        termStart: '2022-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'sjimenez@sjusd.org',
          phone: '(408) 423-2000'
        }
      },
      {
        id: 'sjusd-board-4',
        name: 'Linda Chavez',
        trusteeArea: 4,
        termStart: '2020-12-01',
        termEnd: '2024-11-30',
        contactInfo: {
          email: 'lchavez@sjusd.org',
          phone: '(408) 423-2000'
        }
      },
      {
        id: 'sjusd-board-5',
        name: 'Vincent Matthews',
        trusteeArea: 5,
        termStart: '2022-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'vmatthews@sjusd.org',
          phone: '(408) 423-2000'
        }
      }
    ],
    website: 'https://www.sjusd.org',
    phone: '(408) 423-2000',
    address: {
      street: '855 Lenzen Ave',
      city: 'San José',
      state: 'CA',
      zipCode: '95126'
    },
    enrollment: 28000,
    schools: 50,
    grades: 'K-12',
    zipCodes: ['95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138', '95139'],
    foundedYear: 1865
  },
  'sfusd': {
    id: 'sfusd',
    name: 'San Francisco Unified School District',
    shortName: 'SFUSD',
    type: 'Unified',
    county: 'San Francisco',
    counties: ['San Francisco'],
    superintendentName: 'Matt Wayne',
    boardMembers: [
      {
        id: 'sfusd-board-1',
        name: 'Lainie Motamedi',
        district: 'District 1',
        termStart: '2023-01-08',
        termEnd: '2027-01-07',
        contactInfo: {
          email: 'motamedil@sfusd.edu',
          phone: '(415) 241-6427'
        }
      },
      {
        id: 'sfusd-board-2',
        name: 'Lisa Weissman-Ward',
        district: 'District 2',
        termStart: '2023-01-08',
        termEnd: '2027-01-07',
        contactInfo: {
          email: 'weissmanwardl@sfusd.edu',
          phone: '(415) 241-6427'
        }
      },
      {
        id: 'sfusd-board-3',
        name: 'Ann Hsu',
        district: 'District 3',
        termStart: '2023-01-08',
        termEnd: '2027-01-07',
        contactInfo: {
          email: 'hsua@sfusd.edu',
          phone: '(415) 241-6427'
        }
      },
      {
        id: 'sfusd-board-4',
        name: 'Matt Alexander',
        district: 'District 4',
        termStart: '2021-01-10',
        termEnd: '2025-01-09',
        contactInfo: {
          email: 'alexanderm@sfusd.edu',
          phone: '(415) 241-6427'
        }
      },
      {
        id: 'sfusd-board-5',
        name: 'Kevine Boggess',
        district: 'District 5',
        termStart: '2021-01-10',
        termEnd: '2025-01-09',
        contactInfo: {
          email: 'boggessk@sfusd.edu',
          phone: '(415) 241-6427'
        }
      },
      {
        id: 'sfusd-board-6',
        name: 'Alison Collins',
        district: 'District 6',
        termStart: '2021-01-10',
        termEnd: '2025-01-09',
        contactInfo: {
          email: 'collinsa@sfusd.edu',
          phone: '(415) 241-6427'
        }
      },
      {
        id: 'sfusd-board-7',
        name: 'Mark Sanchez',
        district: 'District 7',
        termStart: '2021-01-10',
        termEnd: '2025-01-09',
        contactInfo: {
          email: 'sanchezm@sfusd.edu',
          phone: '(415) 241-6427'
        }
      }
    ],
    website: 'https://www.sfusd.edu',
    phone: '(415) 241-6000',
    address: {
      street: '555 Franklin St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    enrollment: 46000,
    schools: 130,
    grades: 'PK-12',
    zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94121', '94122', '94123', '94124', '94127', '94129', '94130', '94131', '94132', '94133', '94134', '94158'],
    foundedYear: 1851
  },
  'fusd': {
    id: 'fusd',
    name: 'Fresno Unified School District',
    shortName: 'FUSD',
    type: 'Unified',
    county: 'Fresno',
    counties: ['Fresno'],
    superintendentName: 'Robert G. Nelson',
    boardMembers: [
      {
        id: 'fusd-board-1',
        name: 'Elizabeth Jonasson Rosas',
        trusteeArea: 1,
        termStart: '2018-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'elizabeth.rosas@fresnounified.org',
          phone: '(559) 457-3000'
        }
      },
      {
        id: 'fusd-board-2',
        name: 'Terry Slatic',
        trusteeArea: 2,
        termStart: '2018-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'terry.slatic@fresnounified.org',
          phone: '(559) 457-3000'
        }
      },
      {
        id: 'fusd-board-3',
        name: 'Claudia Cazares',
        trusteeArea: 3,
        termStart: '2020-12-01',
        termEnd: '2024-11-30',
        contactInfo: {
          email: 'claudia.cazares@fresnounified.org',
          phone: '(559) 457-3000'
        }
      },
      {
        id: 'fusd-board-4',
        name: 'Veva Islas',
        trusteeArea: 4,
        termStart: '2020-12-01',
        termEnd: '2024-11-30',
        contactInfo: {
          email: 'veva.islas@fresnounified.org',
          phone: '(559) 457-3000'
        }
      },
      {
        id: 'fusd-board-5',
        name: 'Genoveva Islas',
        trusteeArea: 5,
        termStart: '2022-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'genoveva.islas@fresnounified.org',
          phone: '(559) 457-3000'
        }
      },
      {
        id: 'fusd-board-6',
        name: 'Nasreen Johnson',
        trusteeArea: 6,
        termStart: '2020-12-01',
        termEnd: '2024-11-30',
        contactInfo: {
          email: 'nasreen.johnson@fresnounified.org',
          phone: '(559) 457-3000'
        }
      },
      {
        id: 'fusd-board-7',
        name: 'Keshia Thomas',
        trusteeArea: 7,
        termStart: '2022-12-01',
        termEnd: '2026-11-30',
        contactInfo: {
          email: 'keshia.thomas@fresnounified.org',
          phone: '(559) 457-3000'
        }
      }
    ],
    website: 'https://www.fresnounified.org',
    phone: '(559) 457-3000',
    address: {
      street: '2309 Tulare St',
      city: 'Fresno',
      state: 'CA',
      zipCode: '93721'
    },
    enrollment: 70000,
    schools: 104,
    grades: 'PK-12',
    zipCodes: ['93650', '93701', '93702', '93703', '93704', '93705', '93706', '93710', '93711', '93712', '93714', '93720', '93721', '93722', '93723', '93724', '93725', '93726', '93727', '93728', '93729', '93730'],
    foundedYear: 1957
  }
};

// California Community College Districts
const CALIFORNIA_CC_DISTRICTS: Record<string, CommunityCollegeDistrict> = {
  'laccd': {
    id: 'laccd',
    name: 'Los Angeles Community College District',
    chancellor: 'Francisco C. Rodriguez',
    boardMembers: [
      {
        id: 'laccd-board-1',
        name: 'Nichelle Henderson',
        trusteeArea: 1,
        termStart: '2019-12-01',
        termEnd: '2023-11-30',
        contactInfo: {
          email: 'hendersn@laccd.edu',
          phone: '(213) 891-2000'
        }
      },
      {
        id: 'laccd-board-2',
        name: 'David Vela',
        trusteeArea: 2,
        termStart: '2021-12-01',
        termEnd: '2025-11-30',
        contactInfo: {
          email: 'velad@laccd.edu',
          phone: '(213) 891-2000'
        }
      },
      {
        id: 'laccd-board-3',
        name: 'Gabriel Buelna',
        trusteeArea: 3,
        termStart: '2019-12-01',
        termEnd: '2023-11-30',
        contactInfo: {
          email: 'buelang@laccd.edu',
          phone: '(213) 891-2000'
        }
      },
      {
        id: 'laccd-board-4',
        name: 'George J. Matta',
        trusteeArea: 4,
        termStart: '2021-12-01',
        termEnd: '2025-11-30',
        contactInfo: {
          email: 'mattag@laccd.edu',
          phone: '(213) 891-2000'
        }
      },
      {
        id: 'laccd-board-5',
        name: 'Andra Hoffman',
        trusteeArea: 5,
        termStart: '2017-12-01',
        termEnd: '2025-11-30',
        contactInfo: {
          email: 'hoffmana@laccd.edu',
          phone: '(213) 891-2000'
        }
      },
      {
        id: 'laccd-board-6',
        name: 'Robert Garber',
        trusteeArea: 6,
        termStart: '2019-12-01',
        termEnd: '2023-11-30',
        contactInfo: {
          email: 'garberr@laccd.edu',
          phone: '(213) 891-2000'
        }
      },
      {
        id: 'laccd-board-7',
        name: 'Steven F. Veres',
        trusteeArea: 7,
        termStart: '2021-12-01',
        termEnd: '2025-11-30',
        contactInfo: {
          email: 'veress@laccd.edu',
          phone: '(213) 891-2000'
        }
      }
    ],
    colleges: [
      'Los Angeles City College',
      'East Los Angeles College',
      'Los Angeles Harbor College',
      'Los Angeles Mission College',
      'Los Angeles Pierce College',
      'Los Angeles Southwest College',
      'Los Angeles Trade-Technical College',
      'Los Angeles Valley College',
      'West Los Angeles College'
    ],
    website: 'https://www.laccd.edu',
    phone: '(213) 891-2000',
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021', '90022', '90023', '90024', '90025', '90026', '90027', '90028', '90029', '90031', '90032', '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90040', '90041', '90042', '90043', '90044', '90045', '90046', '90047', '90048', '90049'],
    counties: ['Los Angeles']
  }
};

export class SchoolDistrictApi {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days cache

  // Get all school districts serving a ZIP code
  async getSchoolDistrictsForZip(zipCode: string): Promise<SchoolDistrict[]> {
    const cacheKey = `school-districts-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const districts: SchoolDistrict[] = [];

    // Check unified districts first
    for (const [key, district] of Object.entries(CALIFORNIA_SCHOOL_DISTRICTS)) {
      if (district.zipCodes.includes(zipCode)) {
        districts.push(district);
      }
    }

    this.setCache(cacheKey, districts);
    return districts;
  }

  // Get community college districts for a ZIP code
  async getCommunityCollegeDistrictsForZip(zipCode: string): Promise<CommunityCollegeDistrict[]> {
    const cacheKey = `cc-districts-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const districts: CommunityCollegeDistrict[] = [];

    for (const [key, district] of Object.entries(CALIFORNIA_CC_DISTRICTS)) {
      if (district.zipCodes.includes(zipCode)) {
        districts.push(district);
      }
    }

    this.setCache(cacheKey, districts);
    return districts;
  }

  // Get school district by ID
  async getSchoolDistrictById(districtId: string): Promise<SchoolDistrict | null> {
    return CALIFORNIA_SCHOOL_DISTRICTS[districtId] || null;
  }

  // Get school board member by ID
  async getSchoolBoardMemberById(districtId: string, memberId: string): Promise<SchoolBoardMember | null> {
    const district = CALIFORNIA_SCHOOL_DISTRICTS[districtId];
    if (!district) return null;

    return district.boardMembers.find(member => member.id === memberId) || null;
  }

  // Convert school board members to Representative format for consistency
  async getSchoolBoardRepresentatives(zipCode: string): Promise<Representative[]> {
    const representatives: Representative[] = [];
    const districts = await this.getSchoolDistrictsForZip(zipCode);

    for (const district of districts) {
      for (const member of district.boardMembers) {
        representatives.push(this.convertSchoolBoardMemberToRepresentative(member, district));
      }
    }

    // Also get community college board members
    const ccDistricts = await this.getCommunityCollegeDistrictsForZip(zipCode);
    for (const ccDistrict of ccDistricts) {
      for (const member of ccDistrict.boardMembers) {
        representatives.push(this.convertCCBoardMemberToRepresentative(member, ccDistrict));
      }
    }

    return representatives;
  }

  // Helper to convert SchoolBoardMember to Representative
  private convertSchoolBoardMemberToRepresentative(member: SchoolBoardMember, district: SchoolDistrict): Representative {
    return {
      id: member.id,
      name: member.name,
      title: `${district.shortName} Board Member`,
      party: 'Nonpartisan' as any,
      chamber: 'House' as any, // Default for local officials
      state: 'CA',
      district: member.district || `Trustee Area ${member.trusteeArea}` || district.name,
      photoUrl: undefined,
      contactInfo: {
        phone: member.contactInfo.phone || district.phone,
        email: member.contactInfo.email,
        website: member.contactInfo.website || district.website
      },
      socialMedia: {},
      committees: member.committees?.map(c => ({ id: c, name: c, role: 'Member' as any })),
      biography: member.biography,
      termStart: member.termStart,
      termEnd: member.termEnd,
      level: 'municipal',
      jurisdiction: district.name,
      governmentType: 'special',
      jurisdictionScope: 'district'
    };
  }

  // Helper to convert Community College Board Member to Representative
  private convertCCBoardMemberToRepresentative(member: SchoolBoardMember, district: CommunityCollegeDistrict): Representative {
    return {
      id: member.id,
      name: member.name,
      title: 'Community College Board Member',
      party: 'Nonpartisan' as any,
      chamber: 'House' as any,
      state: 'CA',
      district: member.district || `Trustee Area ${member.trusteeArea}` || district.name,
      photoUrl: undefined,
      contactInfo: {
        phone: member.contactInfo.phone || district.phone,
        email: member.contactInfo.email,
        website: member.contactInfo.website || district.website
      },
      socialMedia: {},
      committees: member.committees?.map(c => ({ id: c, name: c, role: 'Member' as any })),
      biography: member.biography,
      termStart: member.termStart,
      termEnd: member.termEnd,
      level: 'municipal',
      jurisdiction: district.name,
      governmentType: 'special',
      jurisdictionScope: 'district'
    };
  }

  // Get all districts in a county
  async getDistrictsByCounty(county: string): Promise<SchoolDistrict[]> {
    const cacheKey = `districts-county-${county}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const districts = Object.values(CALIFORNIA_SCHOOL_DISTRICTS)
      .filter(district => district.counties.includes(county));

    this.setCache(cacheKey, districts);
    return districts;
  }

  // Search districts by name
  async searchDistricts(query: string): Promise<SchoolDistrict[]> {
    const allDistricts = Object.values(CALIFORNIA_SCHOOL_DISTRICTS);
    const lowerQuery = query.toLowerCase();

    return allDistricts.filter(district => 
      district.name.toLowerCase().includes(lowerQuery) ||
      district.shortName.toLowerCase().includes(lowerQuery)
    );
  }

  // Get district statistics
  async getDistrictStats(): Promise<{
    totalDistricts: number;
    totalEnrollment: number;
    totalSchools: number;
    byType: Record<string, number>;
    byCounty: Record<string, number>;
  }> {
    const districts = Object.values(CALIFORNIA_SCHOOL_DISTRICTS);
    
    const stats = {
      totalDistricts: districts.length,
      totalEnrollment: districts.reduce((sum, d) => sum + (d.enrollment || 0), 0),
      totalSchools: districts.reduce((sum, d) => sum + (d.schools || 0), 0),
      byType: {} as Record<string, number>,
      byCounty: {} as Record<string, number>
    };

    // Count by type
    districts.forEach(district => {
      stats.byType[district.type] = (stats.byType[district.type] || 0) + 1;
    });

    // Count by county
    districts.forEach(district => {
      district.counties.forEach(county => {
        stats.byCounty[county] = (stats.byCounty[county] || 0) + 1;
      });
    });

    return stats;
  }

  // Cache helpers
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export const schoolDistrictApi = new SchoolDistrictApi();