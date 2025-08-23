import { dataPipelineAPI } from './api/client';
import {
  County,
  CountyInfo,
  CountyOfficial,
  SupervisorDistrict,
  CountySearchResult,
  CountyFilter,
} from '../types/county.types';

// California County ZIP code mappings (major counties with sample ZIP codes)
const CALIFORNIA_COUNTY_ZIP_MAPPING: Record<string, string[]> = {
  'Los Angeles': [
    '90210', '90211', '90212', '90213', '90001', '90002', '90003', '90004', '90005',
    '90006', '90007', '90008', '90009', '90010', '90011', '90012', '90013', '90014',
    '90015', '90016', '90017', '90018', '90019', '90020', '90021', '90022', '90023',
    '90024', '90025', '90026', '90027', '90028', '90029', '90030', '90031', '90032',
    '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90040', '90041',
    '90042', '90043', '90044', '90045', '90046', '90047', '90048', '90049', '90050',
    '90051', '90052', '90053', '90054', '90055', '90056', '90057', '90058', '90059',
    '90060', '90061', '90062', '90063', '90064', '90065', '90066', '90067', '90068',
    '90069', '90070', '90071', '90072', '90073', '90074', '90075', '90076', '90077',
    '90078', '90079', '90080', '90081', '90082', '90083', '90084', '90086', '90087',
    '90088', '90089', '90090', '90091', '90093', '90094', '90095', '90096', '90189',
    '90301', '90302', '90303', '90304', '90305', '90401', '90402', '90403', '90404',
    '90405', '90501', '90502', '90503', '90504', '90505', '90601', '90602', '90603',
    '90604', '90605', '90606', '90607', '90608', '90609', '90610', '90637', '90638',
    '90639', '90640', '90650', '90660', '90670', '90701', '90702', '90703', '90704',
    '90706', '90707', '90710', '90711', '90712', '90713', '90714', '90715', '90716',
    '90717', '90723', '90731', '90732', '90733', '90734', '90744', '90745', '90746',
    '90747', '90748', '90749', '90755', '90801', '90802', '90803', '90804', '90805',
    '90806', '90807', '90808', '90810', '90813', '90814', '90815', '90822', '90831',
    '90832', '90833', '90834', '90835', '90840', '90842', '90844', '90846', '90847',
    '90848', '91001', '91006', '91007', '91008', '91009', '91010', '91011', '91016',
    '91017', '91020', '91024', '91025', '91030', '91031', '91040', '91041', '91042',
    '91043', '91046', '91066', '91077', '91101', '91102', '91103', '91104', '91105',
    '91106', '91107', '91108', '91109', '91110', '91114', '91115', '91116', '91117',
    '91118', '91121', '91123', '91124', '91125', '91126', '91129', '91182', '91184',
    '91185', '91188', '91189', '91199', '91201', '91202', '91203', '91204', '91205',
    '91206', '91207', '91208', '91209', '91210', '91214', '91221', '91222', '91224',
    '91225', '91226', '91301', '91302', '91303', '91304', '91305', '91306', '91307',
    '91308', '91309', '91310', '91311', '91313', '91316', '91321', '91322', '91324',
    '91325', '91326', '91327', '91328', '91329', '91330', '91331', '91333', '91334',
    '91335', '91337', '91340', '91341', '91342', '91343', '91344', '91345', '91346',
    '91350', '91351', '91352', '91353', '91354', '91355', '91356', '91357', '91358',
    '91359', '91360', '91361', '91362', '91364', '91365', '91367', '91371', '91372',
    '91376', '91380', '91381', '91382', '91383', '91384', '91385', '91386', '91387',
    '91390', '91392', '91393', '91394', '91395', '91396', '91401', '91402', '91403',
    '91404', '91405', '91406', '91407', '91408', '91409', '91410', '91411', '91412',
    '91413', '91416', '91423', '91426', '91436', '91470', '91482', '91495', '91496',
    '91499', '91501', '91502', '91503', '91504', '91505', '91506', '91507', '91508',
    '91510', '91521', '91522', '91523', '91526', '91601', '91602', '91603', '91604',
    '91605', '91606', '91607', '91608', '91609', '91610', '91611', '91612', '91614',
    '91615', '91616', '91617', '91618', '91702', '91706', '91708', '91709', '91710',
    '91711', '91714', '91715', '91716', '91722', '91723', '91724', '91731', '91732',
    '91733', '91734', '91735', '91740', '91741', '91744', '91745', '91746', '91747',
    '91748', '91749', '91750', '91754', '91755', '91756', '91759', '91761', '91762',
    '91763', '91764', '91765', '91766', '91767', '91768', '91769', '91770', '91771',
    '91772', '91773', '91775', '91776', '91778', '91780', '91788', '91789', '91790',
    '91791', '91792', '91793', '91801', '91802', '91803', '91804', '91896', '91899'
  ],
  'San Diego': [
    '91901', '91902', '91903', '91905', '91906', '91908', '91909', '91910', '91911',
    '91912', '91913', '91914', '91915', '91916', '91917', '91921', '91931', '91932',
    '91933', '91934', '91935', '91941', '91942', '91943', '91944', '91945', '91946',
    '91947', '91948', '91950', '91951', '91962', '91963', '91977', '91978', '91980',
    '92003', '92004', '92007', '92008', '92009', '92010', '92011', '92013', '92014',
    '92018', '92019', '92020', '92021', '92024', '92025', '92026', '92027', '92028',
    '92029', '92030', '92033', '92036', '92037', '92038', '92039', '92040', '92054',
    '92055', '92056', '92057', '92058', '92059', '92060', '92061', '92064', '92065',
    '92066', '92067', '92068', '92069', '92070', '92071', '92072', '92074', '92075',
    '92078', '92079', '92081', '92082', '92083', '92084', '92085', '92086', '92091',
    '92092', '92093', '92096', '92101', '92102', '92103', '92104', '92105', '92106',
    '92107', '92108', '92109', '92110', '92111', '92112', '92113', '92114', '92115',
    '92116', '92117', '92118', '92119', '92120', '92121', '92122', '92123', '92124',
    '92126', '92127', '92128', '92129', '92130', '92131', '92132', '92134', '92135',
    '92136', '92137', '92138', '92139', '92140', '92142', '92143', '92145', '92147',
    '92149', '92150', '92152', '92153', '92154', '92155', '92158', '92159', '92160',
    '92161', '92162', '92163', '92164', '92165', '92166', '92167', '92168', '92169',
    '92170', '92171', '92172', '92173', '92174', '92175', '92176', '92177', '92178',
    '92179', '92182', '92184', '92186', '92187', '92191', '92192', '92193', '92195',
    '92196', '92197', '92198', '92199'
  ],
  'Orange': [
    '90620', '90621', '90623', '90630', '90631', '90632', '90633', '90680', '90720',
    '90721', '90740', '92602', '92603', '92604', '92605', '92606', '92607', '92609',
    '92610', '92612', '92614', '92615', '92616', '92617', '92618', '92619', '92620',
    '92623', '92624', '92625', '92626', '92627', '92628', '92629', '92630', '92637',
    '92646', '92647', '92648', '92649', '92650', '92651', '92652', '92653', '92654',
    '92655', '92656', '92657', '92658', '92659', '92660', '92661', '92662', '92663',
    '92672', '92673', '92674', '92675', '92676', '92677', '92678', '92679', '92683',
    '92684', '92685', '92688', '92691', '92692', '92693', '92694', '92697', '92698',
    '92701', '92702', '92703', '92704', '92705', '92706', '92707', '92708', '92711',
    '92712', '92728', '92735', '92780', '92781', '92782', '92799', '92801', '92802',
    '92803', '92804', '92805', '92806', '92807', '92808', '92809', '92811', '92812',
    '92814', '92815', '92816', '92817', '92821', '92822', '92823', '92825', '92831',
    '92832', '92833', '92834', '92835', '92836', '92837', '92838', '92840', '92841',
    '92842', '92843', '92844', '92845', '92846', '92850', '92856', '92857', '92859',
    '92861', '92862', '92863', '92864', '92865', '92866', '92867', '92868', '92869',
    '92870', '92871', '92885', '92886', '92887', '92899'
  ]
  // Additional counties would be added here
};

// Complete list of all 58 California counties with basic info
const CALIFORNIA_COUNTIES: Omit<County, 'zipCodes' | 'supervisorDistricts' | 'electedOfficials'>[] = [
  { name: 'Alameda', fipsCode: '06001', population: 1671329, seatCity: 'Oakland', website: 'https://www.acgov.org', contactPhone: '(510) 272-6691' },
  { name: 'Alpine', fipsCode: '06003', population: 1204, seatCity: 'Markleeville', website: 'https://www.alpinecountyca.gov', contactPhone: '(530) 694-2281' },
  { name: 'Amador', fipsCode: '06005', population: 40474, seatCity: 'Jackson', website: 'https://www.amadorgov.org', contactPhone: '(209) 223-6380' },
  { name: 'Butte', fipsCode: '06007', population: 219186, seatCity: 'Oroville', website: 'https://www.buttecounty.net', contactPhone: '(530) 538-7551' },
  { name: 'Calaveras', fipsCode: '06009', population: 45905, seatCity: 'San Andreas', website: 'https://www.calaverasgov.us', contactPhone: '(209) 754-6370' },
  { name: 'Colusa', fipsCode: '06011', population: 21839, seatCity: 'Colusa', website: 'https://www.countyofcolusa.org', contactPhone: '(530) 458-0200' },
  { name: 'Contra Costa', fipsCode: '06013', population: 1165927, seatCity: 'Martinez', website: 'https://www.contracosta.ca.gov', contactPhone: '(925) 335-1000' },
  { name: 'Del Norte', fipsCode: '06015', population: 28100, seatCity: 'Crescent City', website: 'https://www.co.del-norte.ca.us', contactPhone: '(707) 464-7204' },
  { name: 'El Dorado', fipsCode: '06017', population: 193221, seatCity: 'Placerville', website: 'https://www.edcgov.us', contactPhone: '(530) 621-5390' },
  { name: 'Fresno', fipsCode: '06019', population: 1008654, seatCity: 'Fresno', website: 'https://www.co.fresno.ca.us', contactPhone: '(559) 600-3481' },
  { name: 'Glenn', fipsCode: '06021', population: 28393, seatCity: 'Willows', website: 'https://www.countyofglenn.net', contactPhone: '(530) 934-6412' },
  { name: 'Humboldt', fipsCode: '06023', population: 136463, seatCity: 'Eureka', website: 'https://humboldtgov.org', contactPhone: '(707) 445-7266' },
  { name: 'Imperial', fipsCode: '06025', population: 179702, seatCity: 'El Centro', website: 'https://www.imperialcounty.org', contactPhone: '(760) 482-4271' },
  { name: 'Inyo', fipsCode: '06027', population: 19016, seatCity: 'Independence', website: 'https://www.inyocounty.us', contactPhone: '(760) 878-0373' },
  { name: 'Kern', fipsCode: '06029', population: 909235, seatCity: 'Bakersfield', website: 'https://www.kerncounty.com', contactPhone: '(661) 868-3585' },
  { name: 'Kings', fipsCode: '06031', population: 152940, seatCity: 'Hanford', website: 'https://www.countyofkings.com', contactPhone: '(559) 852-2362' },
  { name: 'Lake', fipsCode: '06033', population: 68163, seatCity: 'Lakeport', website: 'https://www.lakecountyca.gov', contactPhone: '(707) 263-2368' },
  { name: 'Lassen', fipsCode: '06035', population: 32730, seatCity: 'Susanville', website: 'https://www.lassencounty.org', contactPhone: '(530) 251-8217' },
  { name: 'Los Angeles', fipsCode: '06037', population: 10014009, seatCity: 'Los Angeles', website: 'https://www.lacounty.gov', contactPhone: '(213) 974-1311' },
  { name: 'Madera', fipsCode: '06039', population: 157327, seatCity: 'Madera', website: 'https://www.maderacounty.com', contactPhone: '(559) 675-7700' },
  { name: 'Marin', fipsCode: '06041', population: 262321, seatCity: 'San Rafael', website: 'https://www.marincounty.org', contactPhone: '(415) 473-7331' },
  { name: 'Mariposa', fipsCode: '06043', population: 17131, seatCity: 'Mariposa', website: 'https://www.mariposacounty.org', contactPhone: '(209) 966-2005' },
  { name: 'Mendocino', fipsCode: '06045', population: 91305, seatCity: 'Ukiah', website: 'https://www.mendocinocounty.org', contactPhone: '(707) 463-4221' },
  { name: 'Merced', fipsCode: '06047', population: 281202, seatCity: 'Merced', website: 'https://www.co.merced.ca.us', contactPhone: '(209) 385-7366' },
  { name: 'Modoc', fipsCode: '06049', population: 8700, seatCity: 'Alturas', website: 'https://www.co.modoc.ca.us', contactPhone: '(530) 233-6205' },
  { name: 'Mono', fipsCode: '06051', population: 14444, seatCity: 'Bridgeport', website: 'https://monocounty.ca.gov', contactPhone: '(760) 932-5420' },
  { name: 'Monterey', fipsCode: '06053', population: 439035, seatCity: 'Salinas', website: 'https://www.co.monterey.ca.us', contactPhone: '(831) 755-5073' },
  { name: 'Napa', fipsCode: '06055', population: 140973, seatCity: 'Napa', website: 'https://www.countyofnapa.org', contactPhone: '(707) 253-4580' },
  { name: 'Nevada', fipsCode: '06057', population: 102241, seatCity: 'Nevada City', website: 'https://www.mynevadacounty.com', contactPhone: '(530) 265-1298' },
  { name: 'Orange', fipsCode: '06059', population: 3186989, seatCity: 'Santa Ana', website: 'https://www.ocgov.com', contactPhone: '(714) 834-3100' },
  { name: 'Placer', fipsCode: '06061', population: 404739, seatCity: 'Auburn', website: 'https://www.placer.ca.gov', contactPhone: '(530) 889-4000' },
  { name: 'Plumas', fipsCode: '06063', population: 19915, seatCity: 'Quincy', website: 'https://www.plumascounty.us', contactPhone: '(530) 283-6207' },
  { name: 'Riverside', fipsCode: '06065', population: 2418185, seatCity: 'Riverside', website: 'https://www.rivco.org', contactPhone: '(951) 955-1110' },
  { name: 'Sacramento', fipsCode: '06067', population: 1585055, seatCity: 'Sacramento', website: 'https://www.saccounty.net', contactPhone: '(916) 874-5056' },
  { name: 'San Benito', fipsCode: '06069', population: 64209, seatCity: 'Hollister', website: 'https://www.cosb.us', contactPhone: '(831) 636-4000' },
  { name: 'San Bernardino', fipsCode: '06071', population: 2181654, seatCity: 'San Bernardino', website: 'https://www.sbcounty.gov', contactPhone: '(909) 387-8304' },
  { name: 'San Diego', fipsCode: '06073', population: 3338330, seatCity: 'San Diego', website: 'https://www.sandiegocounty.gov', contactPhone: '(619) 531-5800' },
  { name: 'San Francisco', fipsCode: '06075', population: 873965, seatCity: 'San Francisco', website: 'https://www.sf.gov', contactPhone: '(415) 554-4000' },
  { name: 'San Joaquin', fipsCode: '06077', population: 779233, seatCity: 'Stockton', website: 'https://www.sjgov.org', contactPhone: '(209) 468-3113' },
  { name: 'San Luis Obispo', fipsCode: '06079', population: 282424, seatCity: 'San Luis Obispo', website: 'https://www.slocounty.ca.gov', contactPhone: '(805) 781-5100' },
  { name: 'San Mateo', fipsCode: '06081', population: 764442, seatCity: 'Redwood City', website: 'https://www.smcgov.org', contactPhone: '(650) 363-4123' },
  { name: 'Santa Barbara', fipsCode: '06083', population: 448229, seatCity: 'Santa Barbara', website: 'https://www.countyofsb.org', contactPhone: '(805) 568-2190' },
  { name: 'Santa Clara', fipsCode: '06085', population: 1936259, seatCity: 'San Jose', website: 'https://www.sccgov.org', contactPhone: '(408) 299-5001' },
  { name: 'Santa Cruz', fipsCode: '06087', population: 273170, seatCity: 'Santa Cruz', website: 'https://www.santacruzcounty.us', contactPhone: '(831) 454-2000' },
  { name: 'Shasta', fipsCode: '06089', population: 182155, seatCity: 'Redding', website: 'https://www.co.shasta.ca.us', contactPhone: '(530) 225-5550' },
  { name: 'Sierra', fipsCode: '06091', population: 3236, seatCity: 'Downieville', website: 'https://www.sierracounty.ca.gov', contactPhone: '(530) 289-3251' },
  { name: 'Siskiyou', fipsCode: '06093', population: 44937, seatCity: 'Yreka', website: 'https://www.co.siskiyou.ca.us', contactPhone: '(530) 842-8081' },
  { name: 'Solano', fipsCode: '06095', population: 453491, seatCity: 'Fairfield', website: 'https://www.solanocounty.com', contactPhone: '(707) 784-6100' },
  { name: 'Sonoma', fipsCode: '06097', population: 488863, seatCity: 'Santa Rosa', website: 'https://sonomacounty.ca.gov', contactPhone: '(707) 565-2331' },
  { name: 'Stanislaus', fipsCode: '06099', population: 552878, seatCity: 'Modesto', website: 'https://www.stancounty.com', contactPhone: '(209) 525-6333' },
  { name: 'Sutter', fipsCode: '06101', population: 99063, seatCity: 'Yuba City', website: 'https://www.suttercounty.org', contactPhone: '(530) 822-7540' },
  { name: 'Tehama', fipsCode: '06103', population: 65829, seatCity: 'Red Bluff', website: 'https://www.co.tehama.ca.us', contactPhone: '(530) 527-8491' },
  { name: 'Trinity', fipsCode: '06105', population: 16060, seatCity: 'Weaverville', website: 'https://www.trinitycounty.org', contactPhone: '(530) 623-1351' },
  { name: 'Tulare', fipsCode: '06107', population: 473117, seatCity: 'Visalia', website: 'https://tularecounty.ca.gov', contactPhone: '(559) 636-5000' },
  { name: 'Tuolumne', fipsCode: '06109', population: 55810, seatCity: 'Sonora', website: 'https://www.tuolumnecounty.ca.gov', contactPhone: '(209) 533-5511' },
  { name: 'Ventura', fipsCode: '06111', population: 843843, seatCity: 'Ventura', website: 'https://www.ventura.org', contactPhone: '(805) 654-2681' },
  { name: 'Yolo', fipsCode: '06113', population: 220500, seatCity: 'Woodland', website: 'https://www.yolocounty.org', contactPhone: '(530) 666-8180' },
  { name: 'Yuba', fipsCode: '06115', population: 81575, seatCity: 'Marysville', website: 'https://www.yuba.org', contactPhone: '(530) 749-7840' }
];

class CountyMappingService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours cache

  async getCountyForZip(zipCode: string): Promise<CountyInfo | null> {
    const cacheKey = `zip-county-${zipCode}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // First, check our local mapping
      const localResult = this.getCountyFromLocalMapping(zipCode);
      if (localResult) {
        this.setCache(cacheKey, localResult);
        return localResult;
      }

      // Fallback to API if we have one
      const response = await dataPipelineAPI.get(`/api/counties/by-zip/${zipCode}`);
      const result = await response.json();
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(`Failed to get county for ZIP ${zipCode}:`, error);
      
      // Return basic fallback for California ZIPs
      if (zipCode.startsWith('9')) {
        const fallback: CountyInfo = {
          county: {
            name: 'Unknown California County',
            fipsCode: '06000',
            population: 0,
            seatCity: 'Unknown',
            zipCodes: [zipCode],
            supervisorDistricts: [],
            electedOfficials: [],
            website: 'https://www.ca.gov',
            contactPhone: '311'
          },
          zipCodeCoverage: 'partial',
          primaryCounty: true
        };
        return fallback;
      }
      
      return null;
    }
  }

  private getCountyFromLocalMapping(zipCode: string): CountyInfo | null {
    for (const [countyName, zipCodes] of Object.entries(CALIFORNIA_COUNTY_ZIP_MAPPING)) {
      if (zipCodes.includes(zipCode)) {
        const countyBase = CALIFORNIA_COUNTIES.find(c => c.name === countyName);
        if (countyBase) {
          const county: County = {
            ...countyBase,
            zipCodes: zipCodes,
            supervisorDistricts: [],
            electedOfficials: []
          };
          
          return {
            county,
            zipCodeCoverage: 'full',
            primaryCounty: true
          };
        }
      }
    }
    return null;
  }

  async getAllCaliforniaCounties(): Promise<County[]> {
    const cacheKey = 'all-california-counties';
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await dataPipelineAPI.get('/api/counties/california');
      const result = await response.json();
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Failed to get all counties from API, using local data:', error);
      
      // Return local data with empty arrays for missing fields
      const counties: County[] = CALIFORNIA_COUNTIES.map(countyBase => ({
        ...countyBase,
        zipCodes: CALIFORNIA_COUNTY_ZIP_MAPPING[countyBase.name] || [],
        supervisorDistricts: [],
        electedOfficials: []
      }));
      
      this.setCache(cacheKey, counties);
      return counties;
    }
  }

  async getCountyOfficials(countyName: string): Promise<CountyOfficial[]> {
    const cacheKey = `county-officials-${countyName}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await dataPipelineAPI.get(`/api/counties/${encodeURIComponent(countyName)}/officials`);
      const result = await response.json();
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(`Failed to get officials for ${countyName}:`, error);
      
      // Return empty array - will be populated by specific county implementations
      return [];
    }
  }

  async getSupervisorDistricts(countyName: string): Promise<SupervisorDistrict[]> {
    const cacheKey = `supervisor-districts-${countyName}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await dataPipelineAPI.get(`/api/counties/${encodeURIComponent(countyName)}/districts`);
      const result = await response.json();
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(`Failed to get supervisor districts for ${countyName}:`, error);
      
      // Return basic 5-district structure (standard for California counties)
      return this.getDefaultSupervisorDistricts(countyName);
    }
  }

  private getDefaultSupervisorDistricts(countyName: string): SupervisorDistrict[] {
    const districts: SupervisorDistrict[] = [];
    
    for (let i = 1; i <= 5; i++) {
      districts.push({
        district: i,
        supervisor: {
          id: `${countyName.toLowerCase()}-supervisor-${i}`,
          position: 'Supervisor',
          name: `${countyName} County Supervisor District ${i}`,
          district: i,
          termStart: '2023-01-01',
          termEnd: '2027-01-01',
          contactInfo: {
            phone: '311',
            website: CALIFORNIA_COUNTIES.find(c => c.name === countyName)?.website || 'https://www.ca.gov',
            email: `supervisor${i}@${countyName.toLowerCase()}county.gov`
          }
        },
        zipCodes: [],
        population: 0
      });
    }
    
    return districts;
  }

  async searchCounties(filter?: CountyFilter): Promise<CountySearchResult> {
    try {
      const params = new URLSearchParams();
      
      if (filter) {
        if (filter.population?.min) params.append('populationMin', filter.population.min.toString());
        if (filter.population?.max) params.append('populationMax', filter.population.max.toString());
        if (filter.region) params.append('region', filter.region);
        if (filter.searchTerm) params.append('search', filter.searchTerm);
      }

      const response = await dataPipelineAPI.get(
        `/api/counties/search${params.toString() ? `?${params.toString()}` : ''}`
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.warn('Failed to search counties from API, using local filtering:', error);
      
      // Fallback to local filtering
      let counties = await this.getAllCaliforniaCounties();
      
      if (filter) {
        if (filter.population?.min) {
          counties = counties.filter(c => c.population >= filter.population!.min!);
        }
        if (filter.population?.max) {
          counties = counties.filter(c => c.population <= filter.population!.max!);
        }
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          counties = counties.filter(c => 
            c.name.toLowerCase().includes(term) || 
            c.seatCity.toLowerCase().includes(term)
          );
        }
        if (filter.region) {
          counties = counties.filter(c => this.getRegionForCounty(c.name) === filter.region);
        }
      }
      
      return {
        counties,
        total: counties.length
      };
    }
  }

  private getRegionForCounty(countyName: string): 'Northern' | 'Central' | 'Southern' {
    const northernCounties = [
      'Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa',
      'Del Norte', 'El Dorado', 'Glenn', 'Humboldt', 'Lake', 'Lassen', 'Marin',
      'Mendocino', 'Modoc', 'Mono', 'Napa', 'Nevada', 'Placer', 'Plumas',
      'Sacramento', 'San Francisco', 'San Mateo', 'Shasta', 'Sierra', 'Siskiyou',
      'Solano', 'Sonoma', 'Sutter', 'Tehama', 'Trinity', 'Tuolumne', 'Yolo', 'Yuba'
    ];
    
    const centralCounties = [
      'Fresno', 'Inyo', 'Kern', 'Kings', 'Madera', 'Mariposa', 'Merced',
      'Monterey', 'San Benito', 'San Joaquin', 'San Luis Obispo', 'Santa Barbara',
      'Santa Clara', 'Santa Cruz', 'Stanislaus', 'Tulare'
    ];
    
    if (northernCounties.includes(countyName)) return 'Northern';
    if (centralCounties.includes(countyName)) return 'Central';
    return 'Southern'; // Los Angeles, Orange, Riverside, San Bernardino, San Diego, Ventura, Imperial
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

export const countyMappingService = new CountyMappingService();
export default countyMappingService;