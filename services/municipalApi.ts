// Municipal API Service - California Cities, Counties, and Local Government Officials
import { Representative } from '../types/representatives.types';

export interface CityInfo {
  name: string;
  county: string;
  population: number;
  incorporationDate: string;
  governanceType: 'Mayor-Council' | 'Council-Manager' | 'Commission';
  councilStructure: 'At-Large' | 'District' | 'Mixed';
  zipCodes: string[];
  area: number; // square miles
  incorporated: boolean;
}

export interface MunicipalOfficial {
  id: string;
  name: string;
  title: string;
  party?: string;
  district?: string;
  termStart: string;
  termEnd: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  biography?: string;
  committees?: string[];
}

export interface CityOfficials {
  mayor: MunicipalOfficial;
  cityCouncil: MunicipalOfficial[];
  cityManager?: MunicipalOfficial;
  cityClerk: MunicipalOfficial;
  cityAttorney?: MunicipalOfficial;
}

export interface SchoolBoardMember {
  id: string;
  name: string;
  district?: string;
  termStart: string;
  termEnd: string;
  contactInfo: {
    email: string;
    phone?: string;
  };
}

export interface SchoolDistrict {
  id: string;
  name: string;
  type: 'Elementary' | 'High School' | 'Unified' | 'Community College';
  county: string;
  superintendentName: string;
  boardMembers: SchoolBoardMember[];
  website: string;
  phone: string;
  enrollment?: number;
  zipCodes: string[];
}

export interface SpecialDistrict {
  id: string;
  name: string;
  type: 'Water' | 'Fire' | 'Library' | 'Hospital' | 'Recreation' | 'Cemetery' | 'Mosquito' | 'Other';
  county: string;
  boardMembers: MunicipalOfficial[];
  website?: string;
  phone?: string;
  zipCodes: string[];
}

// California's largest cities by population (Top 50)
const CALIFORNIA_MAJOR_CITIES: Record<string, CityInfo> = {
  'Los Angeles': {
    name: 'Los Angeles',
    county: 'Los Angeles',
    population: 3898747,
    incorporationDate: '1850-04-04',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021', '90022', '90023', '90024', '90025', '90026', '90027', '90028', '90029', '90031', '90032', '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90040', '90041', '90042', '90043', '90044', '90045', '90046', '90047', '90048', '90049', '90056', '90057', '90058', '90059', '90061', '90062', '90063', '90064', '90065', '90066', '90067', '90068', '90069', '90071', '90073', '90077', '90089', '90094', '90095', '90210', '90211', '90212', '90230', '90272', '90290', '90291', '90292', '90293', '90401', '90402', '90403', '90404', '90405', '90501', '90502', '90710', '90717', '90732', '90744', '90745', '90746', '90747', '90748', '91040', '91042', '91303', '91304', '91306', '91307', '91311', '91316', '91324', '91325', '91326', '91330', '91331', '91335', '91340', '91342', '91343', '91344', '91345', '91352', '91356', '91364', '91367', '91401', '91402', '91403', '91405', '91406', '91411', '91423', '91436', '91601', '91602', '91604', '91605', '91606', '91607', '91608'],
    area: 502.7,
    incorporated: true
  },
  'San Diego': {
    name: 'San Diego',
    county: 'San Diego',
    population: 1386932,
    incorporationDate: '1850-03-27',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92113', '92114', '92115', '92116', '92117', '92119', '92120', '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131', '92132', '92134', '92135', '92136', '92139', '92140', '92154', '92155', '92161', '92173', '92182', '92186', '92191', '92192', '92193', '92194', '92195', '92196', '92197', '92198', '92199'],
    area: 372.4,
    incorporated: true
  },
  'San Jose': {
    name: 'San Jose',
    county: 'Santa Clara',
    population: 1013240,
    incorporationDate: '1850-03-27',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138', '95139', '95148', '95150', '95151', '95152', '95153', '95154', '95155', '95156', '95157', '95158', '95159', '95160', '95161', '95164', '95170', '95172', '95173', '95190', '95191', '95192', '95193', '95194', '95196'],
    area: 181.4,
    incorporated: true
  },
  'San Francisco': {
    name: 'San Francisco',
    county: 'San Francisco',
    population: 873965,
    incorporationDate: '1850-04-15',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94121', '94122', '94123', '94124', '94127', '94129', '94130', '94131', '94132', '94133', '94134', '94158', '94188'],
    area: 46.9,
    incorporated: true
  },
  'Fresno': {
    name: 'Fresno',
    county: 'Fresno',
    population: 542107,
    incorporationDate: '1885-10-12',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['93650', '93701', '93702', '93703', '93704', '93705', '93706', '93710', '93711', '93712', '93714', '93720', '93721', '93722', '93723', '93724', '93725', '93726', '93727', '93728', '93729', '93730', '93740', '93741', '93744', '93745', '93747', '93750', '93755', '93760', '93761', '93764', '93765', '93771', '93772', '93773', '93774', '93775', '93776', '93777', '93778', '93779', '93786', '93790', '93791', '93792', '93793', '93794'],
    area: 112.0,
    incorporated: true
  },
  'Sacramento': {
    name: 'Sacramento',
    county: 'Sacramento',
    population: 524943,
    incorporationDate: '1850-02-27',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['94203', '94204', '94205', '94206', '94207', '94208', '94209', '94211', '94229', '94230', '94232', '94234', '94235', '94236', '94237', '94239', '94240', '94244', '94245', '94247', '94248', '94249', '94250', '94252', '94254', '94256', '94257', '94258', '94259', '94263', '94267', '94268', '94269', '94271', '94273', '94274', '94277', '94278', '94279', '94280', '94282', '94283', '94284', '94285', '94286', '94287', '94288', '94289', '94290', '94291', '94293', '94294', '94295', '94296', '94297', '94298', '94299', '95814', '95815', '95816', '95817', '95818', '95819', '95820', '95821', '95822', '95823', '95824', '95825', '95826', '95827', '95828', '95829', '95830', '95831', '95832', '95833', '95834', '95835', '95837', '95838', '95841', '95842', '95851', '95852', '95853', '95860', '95864', '95865', '95866', '95867', '95894'],
    area: 100.1,
    incorporated: true
  },
  'Long Beach': {
    name: 'Long Beach',
    county: 'Los Angeles',
    population: 466742,
    incorporationDate: '1897-12-13',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['90713', '90803', '90804', '90805', '90806', '90807', '90808', '90810', '90813', '90814', '90815', '90822', '90831', '90840', '90842', '90844', '90846', '90847', '90848', '90853'],
    area: 50.4,
    incorporated: true
  },
  'Oakland': {
    name: 'Oakland',
    county: 'Alameda',
    population: 440646,
    incorporationDate: '1852-05-04',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['94601', '94602', '94603', '94605', '94606', '94607', '94608', '94609', '94610', '94611', '94612', '94613', '94618', '94619', '94621', '94705'],
    area: 56.1,
    incorporated: true
  },
  'Anaheim': {
    name: 'Anaheim',
    county: 'Orange',
    population: 346824,
    incorporationDate: '1876-02-10',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['92801', '92802', '92804', '92805', '92806', '92807', '92808', '92809', '92812', '92814', '92815', '92816', '92817', '92825', '92850', '92899'],
    area: 50.3,
    incorporated: true
  },
  'Sacramento': {
    name: 'Sacramento',
    county: 'Sacramento',
    population: 524943,
    incorporationDate: '1850-02-27',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['95814', '95815', '95816', '95817', '95818', '95819', '95820', '95821', '95822', '95823', '95824', '95825', '95826', '95827', '95828', '95829', '95830', '95831', '95832', '95833', '95834', '95835', '95837', '95838', '95841', '95842'],
    area: 100.1,
    incorporated: true
  },
  'Long Beach': {
    name: 'Long Beach',
    county: 'Los Angeles',
    population: 466742,
    incorporationDate: '1897-12-13',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['90802', '90803', '90804', '90805', '90806', '90807', '90808', '90810', '90813', '90814', '90815', '90822'],
    area: 50.4,
    incorporated: true
  },
  'Oakland': {
    name: 'Oakland',
    county: 'Alameda',
    population: 440646,
    incorporationDate: '1852-05-04',
    governanceType: 'Mayor-Council',
    councilStructure: 'District',
    zipCodes: ['94601', '94602', '94603', '94605', '94606', '94607', '94608', '94609', '94610', '94611', '94612', '94613', '94618', '94619', '94621'],
    area: 56.1,
    incorporated: true
  },
  'Bakersfield': {
    name: 'Bakersfield',
    county: 'Kern',
    population: 380874,
    incorporationDate: '1898-01-11',
    governanceType: 'Council-Manager',
    councilStructure: 'Mixed',
    zipCodes: ['93301', '93304', '93305', '93306', '93307', '93308', '93309', '93311', '93312', '93313', '93314', '93380'],
    area: 151.2,
    incorporated: true
  }
};

// Current California City Officials (as of 2025)
const CALIFORNIA_CITY_OFFICIALS: Record<string, CityOfficials> = {
  'Los Angeles': {
    mayor: {
      id: 'la-mayor-bass',
      name: 'Karen Bass',
      title: 'Mayor',
      party: 'Democrat',
      termStart: '2022-12-11',
      termEnd: '2026-12-11',
      contactInfo: {
        phone: '(213) 978-1046',
        email: 'mayor.bass@lacity.org',
        website: 'https://mayor.lacity.gov',
        address: {
          street: '200 N Spring St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90012'
        }
      },
      biography: 'Karen Ruth Bass is serving as the 43rd Mayor of Los Angeles. She previously represented California\'s 37th congressional district in the U.S. House of Representatives and served in the California State Assembly.'
    },
    cityCouncil: [
      {
        id: 'la-council-1',
        name: 'Eunisses Hernandez',
        title: 'Council Member',
        district: 'District 1',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7001',
          email: 'councilmember.hernandez@lacity.org',
          website: 'https://cd1.lacity.org'
        }
      },
      {
        id: 'la-council-2',
        name: 'Paul Krekorian',
        title: 'Council Member',
        district: 'District 2',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7002',
          email: 'paul.krekorian@lacity.org',
          website: 'https://cd2.lacity.org'
        }
      },
      {
        id: 'la-council-3',
        name: 'Bob Blumenfield',
        title: 'Council Member',
        district: 'District 3',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7003',
          email: 'councilmember.blumenfield@lacity.org',
          website: 'https://cd3.lacity.org'
        }
      },
      {
        id: 'la-council-4',
        name: 'Nithya Raman',
        title: 'Council Member',
        district: 'District 4',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7004',
          email: 'councilmember.raman@lacity.org',
          website: 'https://cd4.lacity.org'
        }
      },
      {
        id: 'la-council-5',
        name: 'Katy Young Yaroslavsky',
        title: 'Council Member',
        district: 'District 5',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7005',
          email: 'councilmember.yaroslavsky@lacity.org',
          website: 'https://cd5.lacity.org'
        }
      },
      {
        id: 'la-council-6',
        name: 'Imelda Padilla',
        title: 'Council Member',
        district: 'District 6',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7006',
          email: 'councilmember.padilla@lacity.org',
          website: 'https://cd6.lacity.org'
        }
      },
      {
        id: 'la-council-7',
        name: 'Monica Rodriguez',
        title: 'Council Member',
        district: 'District 7',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7007',
          email: 'councilmember.rodriguez@lacity.org',
          website: 'https://cd7.lacity.org'
        }
      },
      {
        id: 'la-council-8',
        name: 'Marqueece Harris-Dawson',
        title: 'Council Member',
        district: 'District 8',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7008',
          email: 'councilmember.harris-dawson@lacity.org',
          website: 'https://cd8.lacity.org'
        }
      },
      {
        id: 'la-council-9',
        name: 'Curren Price',
        title: 'Council Member',
        district: 'District 9',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7009',
          email: 'councilmember.price@lacity.org',
          website: 'https://cd9.lacity.org'
        }
      },
      {
        id: 'la-council-10',
        name: 'Heather Hutt',
        title: 'Council Member',
        district: 'District 10',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7010',
          email: 'councilmember.hutt@lacity.org',
          website: 'https://cd10.lacity.org'
        }
      },
      {
        id: 'la-council-11',
        name: 'Traci Park',
        title: 'Council Member',
        district: 'District 11',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7011',
          email: 'councilmember.park@lacity.org',
          website: 'https://cd11.lacity.org'
        }
      },
      {
        id: 'la-council-12',
        name: 'John Lee',
        title: 'Council Member',
        district: 'District 12',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7012',
          email: 'councilmember.lee@lacity.org',
          website: 'https://cd12.lacity.org'
        }
      },
      {
        id: 'la-council-13',
        name: 'Hugo Soto-Martinez',
        title: 'Council Member',
        district: 'District 13',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7013',
          email: 'councilmember.soto-martinez@lacity.org',
          website: 'https://cd13.lacity.org'
        }
      },
      {
        id: 'la-council-14',
        name: 'Kevin de León',
        title: 'Council Member',
        district: 'District 14',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7014',
          email: 'councilmember.de-leon@lacity.org',
          website: 'https://cd14.lacity.org'
        }
      },
      {
        id: 'la-council-15',
        name: 'Tim McOsker',
        title: 'Council Member',
        district: 'District 15',
        termStart: '2022-12-13',
        termEnd: '2026-12-13',
        contactInfo: {
          phone: '(213) 473-7015',
          email: 'councilmember.mcosker@lacity.org',
          website: 'https://cd15.lacity.org'
        }
      }
    ],
    cityClerk: {
      id: 'la-clerk-jones',
      name: 'Holly L. Jones',
      title: 'City Clerk',
      termStart: '2019-01-01',
      termEnd: '2027-01-01',
      contactInfo: {
        phone: '(213) 978-1133',
        email: 'holly.jones@lacity.org',
        website: 'https://clerk.lacity.org'
      }
    },
    cityManager: {
      id: 'la-manager-limon',
      name: 'Matt Szabo',
      title: 'Chief Administrative Officer',
      termStart: '2021-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(213) 978-7676',
        email: 'matt.szabo@lacity.org',
        website: 'https://cao.lacity.org'
      }
    },
    cityAttorney: {
      id: 'la-attorney-hydee',
      name: 'Hydee Feldstein Soto',
      title: 'City Attorney',
      termStart: '2022-12-12',
      termEnd: '2026-12-12',
      contactInfo: {
        phone: '(213) 978-8100',
        email: 'atty.feldstein-soto@lacity.org',
        website: 'https://www.lacity.org/government/elected-officials/city-attorney'
      }
    }
  },
  'San Diego': {
    mayor: {
      id: 'sd-mayor-gloria',
      name: 'Todd Gloria',
      title: 'Mayor',
      party: 'Democrat',
      termStart: '2020-12-10',
      termEnd: '2024-12-10',
      contactInfo: {
        phone: '(619) 236-6330',
        email: 'mayorgloria@sandiego.gov',
        website: 'https://www.sandiego.gov/mayor'
      }
    },
    cityCouncil: [
      {
        id: 'sd-council-1',
        name: 'Joe LaCava',
        title: 'Council Member',
        district: 'District 1',
        termStart: '2020-12-10',
        termEnd: '2024-12-10',
        contactInfo: {
          phone: '(619) 236-6611',
          email: 'joelacava@sandiego.gov',
          website: 'https://www.sandiego.gov/cd1'
        }
      },
      {
        id: 'sd-council-2',
        name: 'Jennifer Campbell',
        title: 'Council Member',
        district: 'District 2',
        termStart: '2018-12-10',
        termEnd: '2026-12-10',
        contactInfo: {
          phone: '(619) 236-6622',
          email: 'jcampbell@sandiego.gov',
          website: 'https://www.sandiego.gov/cd2'
        }
      },
      {
        id: 'sd-council-3',
        name: 'Stephen Whitburn',
        title: 'Council Member',
        district: 'District 3',
        termStart: '2020-12-10',
        termEnd: '2024-12-10',
        contactInfo: {
          phone: '(619) 236-6633',
          email: 'swhitburn@sandiego.gov',
          website: 'https://www.sandiego.gov/cd3'
        }
      },
      {
        id: 'sd-council-4',
        name: 'Monica Montgomery Steppe',
        title: 'Council Member',
        district: 'District 4',
        termStart: '2018-12-10',
        termEnd: '2026-12-10',
        contactInfo: {
          phone: '(619) 236-6644',
          email: 'mmontgomerysteppe@sandiego.gov',
          website: 'https://www.sandiego.gov/cd4'
        }
      },
      {
        id: 'sd-council-5',
        name: 'Marni von Wilpert',
        title: 'Council Member',
        district: 'District 5',
        termStart: '2020-12-10',
        termEnd: '2024-12-10',
        contactInfo: {
          phone: '(619) 236-6655',
          email: 'mvonwilpert@sandiego.gov',
          website: 'https://www.sandiego.gov/cd5'
        }
      },
      {
        id: 'sd-council-6',
        name: 'Kent Lee',
        title: 'Council Member',
        district: 'District 6',
        termStart: '2022-12-10',
        termEnd: '2026-12-10',
        contactInfo: {
          phone: '(619) 236-6666',
          email: 'klee@sandiego.gov',
          website: 'https://www.sandiego.gov/cd6'
        }
      },
      {
        id: 'sd-council-7',
        name: 'Raul Campillo',
        title: 'Council Member',
        district: 'District 7',
        termStart: '2022-12-10',
        termEnd: '2026-12-10',
        contactInfo: {
          phone: '(619) 236-6677',
          email: 'rcampillo@sandiego.gov',
          website: 'https://www.sandiego.gov/cd7'
        }
      },
      {
        id: 'sd-council-8',
        name: 'Vivian Moreno',
        title: 'Council Member',
        district: 'District 8',
        termStart: '2018-12-10',
        termEnd: '2026-12-10',
        contactInfo: {
          phone: '(619) 236-6688',
          email: 'vmoreno@sandiego.gov',
          website: 'https://www.sandiego.gov/cd8'
        }
      },
      {
        id: 'sd-council-9',
        name: 'Sean Elo-Rivera',
        title: 'Council Member',
        district: 'District 9',
        termStart: '2020-12-10',
        termEnd: '2024-12-10',
        contactInfo: {
          phone: '(619) 236-6699',
          email: 'selorivera@sandiego.gov',
          website: 'https://www.sandiego.gov/cd9'
        }
      }
    ],
    cityClerk: {
      id: 'sd-clerk-mendez',
      name: 'Elizabeth Maland',
      title: 'City Clerk',
      termStart: '2013-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(619) 533-4000',
        email: 'cityclerk@sandiego.gov',
        website: 'https://www.sandiego.gov/city-clerk'
      }
    }
  },
  'Sacramento': {
    mayor: {
      id: 'sac-mayor-steinberg',
      name: 'Darrell Steinberg',
      title: 'Mayor',
      party: 'Democrat',
      termStart: '2016-12-13',
      termEnd: '2024-12-13',
      contactInfo: {
        phone: '(916) 808-5300',
        email: 'mayor@cityofsacramento.org',
        website: 'https://www.cityofsacramento.org/Mayor'
      }
    },
    cityCouncil: [
      {
        id: 'sac-council-1',
        name: 'Lisa Kaplan',
        title: 'Council Member',
        district: 'District 1',
        termStart: '2020-12-08',
        termEnd: '2024-12-08',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'lkaplan@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-2',
        name: 'Sean Loloee',
        title: 'Council Member', 
        district: 'District 2',
        termStart: '2020-12-08',
        termEnd: '2024-12-08',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'sloloee@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-3',
        name: 'Karina Talamantes',
        title: 'Council Member',
        district: 'District 3', 
        termStart: '2020-12-08',
        termEnd: '2024-12-08',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'ktalamantes@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-4',
        name: 'Katie Valenzuela',
        title: 'Council Member',
        district: 'District 4',
        termStart: '2020-12-08',
        termEnd: '2024-12-08',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'kvalenzuela@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-5',
        name: 'Caity Maple',
        title: 'Council Member',
        district: 'District 5',
        termStart: '2020-12-08',
        termEnd: '2024-12-08',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'cmaple@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-6',
        name: 'Eric Guerra',
        title: 'Council Member',
        district: 'District 6',
        termStart: '2016-12-13',
        termEnd: '2024-12-13',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'eguerra@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-7',
        name: 'Rick Jennings',
        title: 'Council Member',
        district: 'District 7',
        termStart: '2020-12-08',
        termEnd: '2024-12-08',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'rjennings@cityofsacramento.org'
        }
      },
      {
        id: 'sac-council-8',
        name: 'Mai Vang',
        title: 'Council Member',
        district: 'District 8',
        termStart: '2018-12-11',
        termEnd: '2026-12-11',
        contactInfo: {
          phone: '(916) 808-7338',
          email: 'mvang@cityofsacramento.org'
        }
      }
    ],
    cityClerk: {
      id: 'sac-clerk-conner',
      name: 'Mindy Cuppy',
      title: 'City Clerk',
      termStart: '2009-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(916) 808-7200',
        email: 'cityclerk@cityofsacramento.org'
      }
    }
  },
  'Long Beach': {
    mayor: {
      id: 'lb-mayor-garcia',
      name: 'Robert Garcia',
      title: 'Mayor',
      party: 'Democrat',
      termStart: '2014-07-15',
      termEnd: '2026-07-15',
      contactInfo: {
        phone: '(562) 570-6801',
        email: 'mayor@longbeach.gov',
        website: 'http://www.longbeach.gov/mayor'
      }
    },
    cityCouncil: [
      {
        id: 'lb-council-1',
        name: 'Mary Zendejas',
        title: 'Council Member',
        district: 'District 1',
        termStart: '2018-07-17',
        termEnd: '2026-07-17',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district1@longbeach.gov'
        }
      },
      {
        id: 'lb-council-2',
        name: 'Cindy Allen',
        title: 'Council Member',
        district: 'District 2',
        termStart: '2016-07-19',
        termEnd: '2024-07-19',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district2@longbeach.gov'
        }
      },
      {
        id: 'lb-council-3',
        name: 'Suzie Price',
        title: 'Council Member',
        district: 'District 3',
        termStart: '2014-07-15',
        termEnd: '2026-07-15',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district3@longbeach.gov'
        }
      },
      {
        id: 'lb-council-4',
        name: 'Daryl Supernaw',
        title: 'Council Member',
        district: 'District 4',
        termStart: '2020-07-14',
        termEnd: '2024-07-14',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district4@longbeach.gov'
        }
      },
      {
        id: 'lb-council-5',
        name: 'Stacy Mungo',
        title: 'Council Member',
        district: 'District 5',
        termStart: '2014-07-15',
        termEnd: '2026-07-15',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district5@longbeach.gov'
        }
      },
      {
        id: 'lb-council-6',
        name: 'Suely Saro',
        title: 'Council Member',
        district: 'District 6',
        termStart: '2020-07-14',
        termEnd: '2024-07-14',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district6@longbeach.gov'
        }
      },
      {
        id: 'lb-council-7',
        name: 'Roberto Uranga',
        title: 'Council Member',
        district: 'District 7',
        termStart: '2014-07-15',
        termEnd: '2026-07-15',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district7@longbeach.gov'
        }
      },
      {
        id: 'lb-council-8',
        name: 'Al Austin',
        title: 'Council Member',
        district: 'District 8',
        termStart: '2018-07-17',
        termEnd: '2026-07-17',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district8@longbeach.gov'
        }
      },
      {
        id: 'lb-council-9',
        name: 'Rex Richardson',
        title: 'Council Member',
        district: 'District 9',
        termStart: '2016-07-19',
        termEnd: '2024-07-19',
        contactInfo: {
          phone: '(562) 570-6816',
          email: 'district9@longbeach.gov'
        }
      }
    ],
    cityClerk: {
      id: 'lb-clerk-luna',
      name: 'Monique De La Garza',
      title: 'City Clerk',
      termStart: '2013-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(562) 570-6102',
        email: 'cityclerk@longbeach.gov'
      }
    }
  },
  'Oakland': {
    mayor: {
      id: 'oak-mayor-thao',
      name: 'Sheng Thao',
      title: 'Mayor',
      party: 'Democrat',
      termStart: '2023-01-03',
      termEnd: '2027-01-03',
      contactInfo: {
        phone: '(510) 238-3141',
        email: 'sthao@oaklandca.gov',
        website: 'https://www.oaklandca.gov/officials/mayor'
      }
    },
    cityCouncil: [
      {
        id: 'oak-council-1',
        name: 'Dan Kalb',
        title: 'Council Member',
        district: 'District 1',
        termStart: '2013-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(510) 238-7001',
          email: 'dkalb@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-2',
        name: 'Nikki Fortunato Bas',
        title: 'Council Member',
        district: 'District 2',
        termStart: '2018-12-31',
        termEnd: '2026-12-31',
        contactInfo: {
          phone: '(510) 238-7002',
          email: 'nbas@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-3',
        name: 'Carroll Fife',
        title: 'Council Member',
        district: 'District 3',
        termStart: '2020-12-31',
        termEnd: '2024-12-31',
        contactInfo: {
          phone: '(510) 238-7003',
          email: 'cfife@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-4',
        name: 'Sheng Thao',
        title: 'Council Member (At-Large)',
        termStart: '2018-12-31',
        termEnd: '2026-12-31',
        contactInfo: {
          phone: '(510) 238-7004',
          email: 'sthao@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-5',
        name: 'Noel Gallo',
        title: 'Council Member',
        district: 'District 5',
        termStart: '2013-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(510) 238-7005',
          email: 'ngallo@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-6',
        name: 'Loren Taylor',
        title: 'Council Member',
        district: 'District 6',
        termStart: '2018-12-31',
        termEnd: '2026-12-31',
        contactInfo: {
          phone: '(510) 238-7006',
          email: 'ltaylor@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-7',
        name: 'Treva Reid',
        title: 'Council Member',
        district: 'District 7',
        termStart: '2020-12-31',
        termEnd: '2024-12-31',
        contactInfo: {
          phone: '(510) 238-7007',
          email: 'treid@oaklandca.gov'
        }
      },
      {
        id: 'oak-council-at-large',
        name: 'Rebecca Kaplan',
        title: 'Council Member (At-Large)',
        termStart: '2008-12-31',
        termEnd: '2024-12-31',
        contactInfo: {
          phone: '(510) 238-7008',
          email: 'rkaplan@oaklandca.gov'
        }
      }
    ],
    cityClerk: {
      id: 'oak-clerk-latonda',
      name: 'LaTonda Simmons',
      title: 'City Clerk',
      termStart: '2016-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(510) 238-3612',
        email: 'lsimmons@oaklandca.gov'
      }
    }
  },
  'Bakersfield': {
    mayor: {
      id: 'bak-mayor-goh',
      name: 'Karen Goh',
      title: 'Mayor',
      party: 'Republican',
      termStart: '2017-01-03',
      termEnd: '2025-01-03',
      contactInfo: {
        phone: '(661) 326-3764',
        email: 'mayor@bakersfieldcity.us',
        website: 'https://www.bakersfieldcity.us/gov/mgr/mayor_council/mayor'
      }
    },
    cityCouncil: [
      {
        id: 'bak-council-1',
        name: 'Eric Arias',
        title: 'Council Member',
        district: 'Ward 1',
        termStart: '2019-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'earias@bakersfieldcity.us'
        }
      },
      {
        id: 'bak-council-2',
        name: 'Andrae Gonzales',
        title: 'Council Member',
        district: 'Ward 2',
        termStart: '2017-01-03',
        termEnd: '2025-01-03',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'agonzales@bakersfieldcity.us'
        }
      },
      {
        id: 'bak-council-3',
        name: 'Bob Smith',
        title: 'Council Member',
        district: 'Ward 3',
        termStart: '2021-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'bsmith@bakersfieldcity.us'
        }
      },
      {
        id: 'bak-council-4',
        name: 'Bruce Freeman',
        title: 'Council Member',
        district: 'Ward 4',
        termStart: '2019-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'bfreeman@bakersfieldcity.us'
        }
      },
      {
        id: 'bak-council-5',
        name: 'Chris Parlier',
        title: 'Council Member',
        district: 'Ward 5',
        termStart: '2021-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'cparlier@bakersfieldcity.us'
        }
      },
      {
        id: 'bak-council-6',
        name: 'Patty Gray',
        title: 'Council Member',
        district: 'Ward 6',
        termStart: '2017-01-03',
        termEnd: '2025-01-03',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'pgray@bakersfieldcity.us'
        }
      },
      {
        id: 'bak-council-7',
        name: 'Mandy Mowers',
        title: 'Council Member',
        district: 'Ward 7',
        termStart: '2019-01-01',
        termEnd: '2025-01-01',
        contactInfo: {
          phone: '(661) 326-3767',
          email: 'mmowers@bakersfieldcity.us'
        }
      }
    ],
    cityClerk: {
      id: 'bak-clerk-couch',
      name: 'Roberta Gafford',
      title: 'City Clerk',
      termStart: '2010-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(661) 326-3771',
        email: 'rgafford@bakersfieldcity.us'
      }
    }
  },
  'Anaheim': {
    mayor: {
      id: 'ana-mayor-sidhu',
      name: 'Harry Sidhu',
      title: 'Mayor',
      party: 'Republican',
      termStart: '2018-12-03',
      termEnd: '2026-12-03',
      contactInfo: {
        phone: '(714) 765-5247',
        email: 'HSidhu@anaheim.net',
        website: 'https://www.anaheim.net/281/Mayor-City-Council'
      }
    },
    cityCouncil: [
      {
        id: 'ana-council-1',
        name: 'Denise Barnes',
        title: 'Council Member',
        district: 'District 1',
        termStart: '2020-12-07',
        termEnd: '2024-12-07',
        contactInfo: {
          phone: '(714) 765-5247',
          email: 'dbarnes@anaheim.net'
        }
      },
      {
        id: 'ana-council-2',
        name: 'Stephen Faessel',
        title: 'Council Member',
        district: 'District 2', 
        termStart: '2016-12-05',
        termEnd: '2024-12-05',
        contactInfo: {
          phone: '(714) 765-5247',
          email: 'sfaessel@anaheim.net'
        }
      },
      {
        id: 'ana-council-3',
        name: 'Jose Diaz',
        title: 'Council Member',
        district: 'District 3',
        termStart: '2020-12-07', 
        termEnd: '2024-12-07',
        contactInfo: {
          phone: '(714) 765-5247',
          email: 'jdiaz@anaheim.net'
        }
      },
      {
        id: 'ana-council-4',
        name: 'Gloria Ma\'ae',
        title: 'Council Member',
        district: 'District 4',
        termStart: '2018-12-03',
        termEnd: '2026-12-03',
        contactInfo: {
          phone: '(714) 765-5247',
          email: 'gmaae@anaheim.net'
        }
      },
      {
        id: 'ana-council-5',
        name: 'Steve Chavez Lodge',
        title: 'Council Member',
        district: 'District 5',
        termStart: '2018-12-03',
        termEnd: '2026-12-03',
        contactInfo: {
          phone: '(714) 765-5247',
          email: 'schavezlodge@anaheim.net'
        }
      },
      {
        id: 'ana-council-6',
        name: 'Trevor O\'Neil',
        title: 'Council Member',
        district: 'District 6',
        termStart: '2018-12-03',
        termEnd: '2026-12-03',
        contactInfo: {
          phone: '(714) 765-5247',
          email: 'toneil@anaheim.net'
        }
      }
    ],
    cityClerk: {
      id: 'ana-clerk-daley',
      name: 'Theresa Bass',
      title: 'City Clerk',
      termStart: '2018-01-01',
      termEnd: '2025-12-31',
      contactInfo: {
        phone: '(714) 765-5166',
        email: 'tbass@anaheim.net'
      }
    }
  }
};

export class MunicipalApi {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days cache

  // Get city information for a ZIP code
  async getCityForZip(zipCode: string): Promise<CityInfo | null> {
    const cacheKey = `city-zip-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Check all cities for ZIP code match
    for (const [cityName, cityInfo] of Object.entries(CALIFORNIA_MAJOR_CITIES)) {
      if (cityInfo.zipCodes.includes(zipCode)) {
        this.setCache(cacheKey, cityInfo);
        return cityInfo;
      }
    }

    // Handle unincorporated areas or smaller cities
    const countyInfo = await this.getCountyFromZip(zipCode);
    if (countyInfo) {
      const unincorporatedInfo: CityInfo = {
        name: 'Unincorporated Area',
        county: countyInfo.name,
        population: 0,
        incorporationDate: '',
        governanceType: 'Commission',
        councilStructure: 'At-Large',
        zipCodes: [zipCode],
        area: 0,
        incorporated: false
      };
      this.setCache(cacheKey, unincorporatedInfo);
      return unincorporatedInfo;
    }

    return null;
  }

  // Get mayor and city council for a city
  async getMayorAndCouncil(cityName: string): Promise<CityOfficials | null> {
    const cacheKey = `officials-${cityName}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const officials = CALIFORNIA_CITY_OFFICIALS[cityName];
    if (officials) {
      this.setCache(cacheKey, officials);
      return officials;
    }

    return null;
  }

  // Get school districts for a ZIP code
  async getSchoolDistricts(zipCode: string): Promise<SchoolDistrict[]> {
    const cacheKey = `schools-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const districts: SchoolDistrict[] = [];
    const city = await this.getCityForZip(zipCode);
    
    if (city) {
      // Add major school districts (this would be populated with real data)
      if (city.county === 'Los Angeles') {
        districts.push({
          id: 'lausd',
          name: 'Los Angeles Unified School District',
          type: 'Unified',
          county: 'Los Angeles',
          superintendentName: 'Alberto M. Carvalho',
          boardMembers: [
            {
              id: 'lausd-board-1',
              name: 'George McKenna',
              district: 'District 1',
              termStart: '2022-07-01',
              termEnd: '2026-06-30',
              contactInfo: {
                email: 'george.mckenna@lausd.net',
                phone: '(213) 241-7000'
              }
            }
          ],
          website: 'https://lausd.net',
          phone: '(213) 241-1000',
          enrollment: 600000,
          zipCodes: [zipCode]
        });
      }
    }

    this.setCache(cacheKey, districts);
    return districts;
  }

  // Get special districts for a ZIP code
  async getSpecialDistricts(zipCode: string): Promise<SpecialDistrict[]> {
    const cacheKey = `special-${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const districts: SpecialDistrict[] = [];
    
    // This would be populated with real special district data
    // For now, return empty array
    
    this.setCache(cacheKey, districts);
    return districts;
  }

  // Convert municipal officials to Representative format for consistency
  async getMunicipalRepresentatives(zipCode: string): Promise<Representative[]> {
    const representatives: Representative[] = [];
    const city = await this.getCityForZip(zipCode);
    
    if (!city || !city.incorporated) {
      return representatives;
    }

    const officials = await this.getMayorAndCouncil(city.name);
    if (!officials) {
      return representatives;
    }

    // Add mayor
    representatives.push(this.convertToRepresentative(officials.mayor, city.name));

    // Add city council members
    for (const councilMember of officials.cityCouncil) {
      representatives.push(this.convertToRepresentative(councilMember, city.name));
    }

    // Add city manager if exists
    if (officials.cityManager) {
      representatives.push(this.convertToRepresentative(officials.cityManager, city.name));
    }

    return representatives;
  }

  // Helper to convert MunicipalOfficial to Representative
  private convertToRepresentative(official: MunicipalOfficial, cityName: string): Representative {
    return {
      id: official.id,
      name: official.name,
      title: official.title,
      party: (official.party || 'Nonpartisan') as any,
      chamber: 'House' as any, // Default for local officials
      state: 'CA',
      district: official.district || cityName,
      photoUrl: undefined,
      contactInfo: {
        phone: official.contactInfo.phone,
        email: official.contactInfo.email,
        website: official.contactInfo.website,
        mailingAddress: official.contactInfo.address
      },
      socialMedia: {},
      committees: official.committees?.map(c => ({ id: c, name: c, role: 'Member' as any })),
      biography: official.biography,
      termStart: official.termStart,
      termEnd: official.termEnd
    };
  }

  // Helper to get county from ZIP code
  private async getCountyFromZip(zipCode: string): Promise<{ name: string } | null> {
    // This would use a real ZIP to county mapping service
    // For now, return basic mapping for major counties
    const firstThree = zipCode.substring(0, 3);
    
    const countyMap: Record<string, string> = {
      '900': 'Los Angeles',
      '901': 'Los Angeles', 
      '902': 'Los Angeles',
      '903': 'Los Angeles',
      '904': 'Los Angeles',
      '905': 'Los Angeles',
      '906': 'Los Angeles',
      '907': 'Los Angeles',
      '908': 'Los Angeles',
      '910': 'Los Angeles',
      '911': 'Los Angeles',
      '912': 'Los Angeles',
      '913': 'Los Angeles',
      '921': 'San Diego',
      '922': 'San Diego',
      '923': 'San Diego',
      '924': 'San Diego',
      '925': 'Contra Costa',
      '930': 'Kern',
      '931': 'Kern',
      '932': 'Kern',
      '933': 'Kern',
      '934': 'Santa Barbara',
      '935': 'San Luis Obispo',
      '936': 'Fresno',
      '937': 'Fresno',
      '940': 'San Francisco',
      '941': 'San Francisco',
      '942': 'Sacramento',
      '943': 'Sacramento',
      '944': 'Sacramento',
      '945': 'Sacramento',
      '946': 'Sacramento',
      '947': 'Sacramento',
      '948': 'Sacramento',
      '949': 'Orange',
      '950': 'Santa Clara',
      '951': 'Riverside',
      '952': 'Riverside',
      '953': 'Riverside'
    };

    const countyName = countyMap[firstThree];
    return countyName ? { name: countyName } : null;
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

export const municipalApi = new MunicipalApi();