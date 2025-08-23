# CALIFORNIA POLITICAL REPRESENTATION MAPPING STRATEGY

## PROJECT OVERVIEW

**Objective**: Connect every California ZIP code to all levels of political representation (federal, state, county, local) for the CITZN civic engagement platform.

**Scope**: 
- 1,797 California ZIP codes
- 52 Congressional districts + 2 Senators
- 80 Assembly + 40 Senate districts + Governor
- 58 counties with supervisors and elected officials
- 482 incorporated cities with mayors and councils
- School districts and special districts

---

## MULTI-AGENT IMPLEMENTATION STRATEGY

### EXECUTION ORDER (CRITICAL)

1. **Agent 1**: ZIP Code Mapping Agent (Foundation)
2. **Agent 2**: Federal Representatives Agent
3. **Agent 3**: State Representatives Agent  
4. **Agent 4**: County Officials Agent
5. **Agent 5**: Local/Municipal Agent
6. **Agent 6**: Data Quality & Updates Agent

---

## SHARED PROJECT CONTEXT

**Add this to the beginning of EVERY agent prompt:**

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components
```

---

# AGENT 1: ZIP CODE MAPPING AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components

You are the ZIP Code Mapping Agent for the CITZN platform. Your mission is to create a comprehensive mapping system that connects every California ZIP code to all relevant political districts.

**YOUR SPECIFIC TASKS:**

1. **Set up Geocodio API Integration**
   - Sign up for Geocodio API account (geocod.io)
   - Create service at `services/geocodingService.ts`
   - Implement ZIP code to district mapping functionality
   - Handle batch processing for all California ZIP codes

2. **Create Enhanced Data Types**
   - Extend existing `types/representatives.types.ts`
   - Add new interfaces for multi-level district mapping
   - Include support for ZIP codes that span multiple districts

3. **Build ZIP Code Database**
   - Create `services/zipDistrictMapping.ts`
   - Implement caching for district mappings
   - Handle edge cases (ZIP codes spanning districts)
   - Add fallback logic for missing data

4. **Required Code Structure:**
```typescript
// types/districts.types.ts
interface ZipDistrictMapping {
  zipCode: string;
  congressionalDistrict: number;
  stateSenateDistrict: number;
  stateAssemblyDistrict: number;
  county: string;
  city: string;
  coordinates: [number, number];
}

// services/geocodingService.ts  
class GeocodingService {
  async getDistrictsForZip(zipCode: string): Promise<ZipDistrictMapping>
  async batchProcessZipCodes(zipCodes: string[]): Promise<ZipDistrictMapping[]>
}
```

**DELIVERABLES:**
1. Working Geocodio API integration
2. Enhanced type definitions for districts
3. ZIP code to district mapping service
4. Batch processing capability for all CA ZIP codes
5. Comprehensive error handling and fallbacks

**SUCCESS CRITERIA:**
- Successfully map 95%+ of California ZIP codes
- Response time under 500ms for individual lookups
- Proper handling of multi-district ZIP codes
- Robust caching mechanism implemented

Start with setting up the Geocodio API and creating the basic service structure.
```

---

# AGENT 2: FEDERAL REPRESENTATIVES AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components

You are the Federal Representatives Agent for the CITZN platform. Your mission is to maintain comprehensive, up-to-date data for all federal representatives serving California.

**YOUR SPECIFIC TASKS:**

1. **Integrate Congress.gov API**
   - Set up ProPublica Congress API (preferred) or Congress.gov API
   - Create `services/congressApi.ts`
   - Fetch current California House representatives (52 districts)
   - Fetch California senators (Padilla, Butler)

2. **Enhance Representative Data**
   - Update existing `types/representatives.types.ts`
   - Add federal-specific fields (committee assignments, voting records)
   - Include contact information for DC and district offices
   - Add bill sponsorship and voting history

3. **Build Federal Representatives Service**
   - Extend `services/representatives.service.ts` 
   - Add methods for federal-specific data
   - Implement caching for representative data
   - Add real-time updates for new legislation

4. **Required Implementation:**
```typescript
// services/congressApi.ts
class CongressApi {
  async getCaliforniaHouseMembers(): Promise<Representative[]>
  async getCaliforniaSenators(): Promise<Representative[]>
  async getRepresentativeVotingRecord(bioguideId: string): Promise<VotingRecord>
  async getRepresentativeBills(bioguideId: string): Promise<Bill[]>
}

// Enhanced representative data
interface FederalRepresentative extends Representative {
  bioguideId: string;
  committeeMemberships: Committee[];
  subcommitteeMemberships: Committee[];
  officeLocations: OfficeLocation[];
  votingRecord: VotingRecord;
  billsSponsored: Bill[];
  billsCosponsored: Bill[];
}
```

**DATA SOURCES TO INTEGRATE:**
1. ProPublica Congress API (primary)
2. Congress.gov API (backup)
3. House.gov representatives directory
4. Senate.gov directory

**DELIVERABLES:**
1. Complete California federal delegation data (52 House + 2 Senate)
2. Real-time voting records and bill tracking
3. Comprehensive contact information
4. Committee and leadership position tracking
5. Integration with existing representatives service

**SUCCESS CRITERIA:**
- 100% coverage of California federal delegation
- Up-to-date voting records within 24 hours
- Complete contact information for all offices
- Seamless integration with existing codebase

Focus on getting the core federal representative data first, then add voting records and bills.
```

---

# AGENT 3: STATE REPRESENTATIVES AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components

You are the State Representatives Agent for the CITZN platform. Your mission is to maintain comprehensive data for all California state-level elected officials.

**YOUR SPECIFIC TASKS:**

1. **Enhance OpenStates Integration**
   - Improve existing `services/openStatesService.ts`
   - Implement comprehensive California Assembly data (80 districts)
   - Implement California Senate data (40 districts)
   - Add Governor and Lieutenant Governor data

2. **Add California Secretary of State Data**
   - Create `services/californiaStateApi.ts`
   - Integrate with CA.gov APIs where available
   - Pull official district boundary data
   - Add election results and term information

3. **State Legislative Data Management**
   - Track current legislative session (2025-2026)
   - Monitor bill sponsorships and voting records
   - Add committee memberships and leadership roles
   - Include district office locations

4. **Required Implementation:**
```typescript
// services/californiaStateApi.ts
class CaliforniaStateApi {
  async getAssemblyMembers(): Promise<StateRepresentative[]>
  async getSenateMembers(): Promise<StateRepresentative[]>
  async getGovernor(): Promise<StateRepresentative>
  async getLieutenantGovernor(): Promise<StateRepresentative>
  async getDistrictBoundaries(district: number, chamber: 'assembly' | 'senate'): Promise<DistrictBoundary>
}

// Enhanced state representative interface
interface StateRepresentative extends Representative {
  legislativeId: string;
  district: number;
  chamber: 'assembly' | 'senate' | 'executive';
  leadership: string | null;
  committees: StateCommittee[];
  billsAuthored: StateBill[];
  votingRecord: StateVotingRecord;
  districtOffices: OfficeLocation[];
}
```

**DATA SOURCES TO INTEGRATE:**
1. OpenStates API (primary - already partially implemented)
2. California Legislature website
3. California Secretary of State
4. Assembly.ca.gov and Senate.ca.gov APIs
5. Individual legislator websites for contact info

**SPECIFIC CALIFORNIA DATA NEEDED:**
- All 80 Assembly districts with current representatives
- All 40 Senate districts with current representatives  
- Governor Gavin Newsom's current information
- Lieutenant Governor Eleni Kounalakis
- Committee assignments and leadership positions
- District office locations throughout California

**DELIVERABLES:**
1. Complete California state legislature data (120 legislators)
2. Current Governor/Lt. Governor information
3. Committee and leadership tracking
4. District boundary integration
5. Enhanced OpenStates service with state-specific features

**SUCCESS CRITERIA:**
- 100% coverage of CA Assembly and Senate districts
- Current committee assignments and leadership roles
- Accurate district office contact information
- Integration with existing ZIP code mapping system

Start by enhancing the existing OpenStates service, then add the California-specific APIs.
```

---

# AGENT 4: COUNTY OFFICIALS AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components

You are the County Officials Agent for the CITZN platform. Your mission is to map every California ZIP code to its county and provide comprehensive data for all county-level elected officials.

**YOUR SPECIFIC TASKS:**

1. **Create County Mapping System**
   - Build `services/countyMappingService.ts`
   - Map all California ZIP codes to their respective counties
   - Handle ZIP codes that span multiple counties
   - Create county boundary and population data

2. **County Officials Data Collection**
   - Create `services/countyOfficialsApi.ts`
   - Implement web scraping for county websites where needed
   - Track Board of Supervisors for all 58 counties (typically 5 per county)
   - Include other elected positions: Sheriff, DA, Assessor, Clerk-Recorder

3. **Special District Integration**
   - Track special districts (water, fire, school, etc.)
   - Map ZIP codes to relevant special districts
   - Include elected board members where applicable

4. **Required Implementation:**
```typescript
// services/countyMappingService.ts
class CountyMappingService {
  async getCountyForZip(zipCode: string): Promise<CountyInfo>
  async getAllCaliforniaCounties(): Promise<County[]>
  async getCountyOfficials(countyName: string): Promise<CountyOfficial[]>
  async getSupervisorDistricts(countyName: string): Promise<SupervisorDistrict[]>
}

// County data structures
interface County {
  name: string;
  fipsCode: string;
  population: number;
  seatCity: string;
  zipCodes: string[];
  supervisorDistricts: SupervisorDistrict[];
  electedOfficials: CountyOfficial[];
}

interface CountyOfficial {
  position: 'Supervisor' | 'Sheriff' | 'District Attorney' | 'Assessor' | 'Clerk-Recorder' | 'Treasurer' | 'Auditor';
  name: string;
  district?: number;
  termStart: string;
  termEnd: string;
  contactInfo: ContactInfo;
}
```

**CALIFORNIA COUNTIES TO COVER:**
Major counties to prioritize:
1. Los Angeles County (10M+ residents, 5 supervisors)
2. San Diego County (3.3M residents, 5 supervisors) 
3. Orange County (3.2M residents, 5 supervisors)
4. Riverside County (2.4M residents, 5 supervisors)
5. San Bernardino County (2.2M residents, 5 supervisors)
6. All remaining 53 counties

**DATA SOURCES:**
1. Individual county websites (primary)
2. California Association of Counties (CSAC)
3. Secretary of State election results
4. County clerk websites for current officials
5. Manual verification where automated scraping fails

**DELIVERABLES:**
1. Complete ZIP code to county mapping
2. All 58 counties with current Board of Supervisors
3. County-wide elected officials (Sheriff, DA, etc.)
4. Supervisor district boundaries where available
5. Integration with ZIP code mapping system

**SUCCESS CRITERIA:**
- 100% coverage of California's 58 counties
- Current elected officials for major positions
- Accurate ZIP code to county mapping
- Supervisor district identification where possible
- Fallback data for when county websites are unavailable

**IMPLEMENTATION PRIORITY:**
1. Start with the 10 largest counties by population
2. Focus on Board of Supervisors first (most directly relevant to citizens)
3. Add Sheriff, DA, and other county-wide positions
4. Handle smaller counties with more generic data structures

Begin with Los Angeles, San Diego, and Orange counties to establish the pattern.
```

---

# AGENT 5: LOCAL/MUNICIPAL AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components

You are the Local/Municipal Agent for the CITZN platform. Your mission is to connect California ZIP codes to their local governments and provide comprehensive municipal representative data.

**YOUR SPECIFIC TASKS:**

1. **Enhance Municipal Mapping**
   - Improve existing `services/civicInfoService.ts`
   - Map ZIP codes to incorporated cities vs unincorporated areas
   - Handle ZIP codes that span multiple municipalities
   - Create city boundary and governance structure data

2. **City Government Data Collection**
   - Create `services/municipalApi.ts`
   - Collect mayor data for all 482 California cities
   - Track city council structures (at-large vs district-based)
   - Include city manager/administrator information where applicable

3. **School District Integration**
   - Create `services/schoolDistrictApi.ts`
   - Map ZIP codes to school districts
   - Track school board members and elections
   - Handle overlapping elementary/high school districts

4. **Required Implementation:**
```typescript
// services/municipalApi.ts
class MunicipalApi {
  async getCityForZip(zipCode: string): Promise<CityInfo | null>
  async getMayorAndCouncil(cityName: string): Promise<CityOfficials>
  async getSchoolDistricts(zipCode: string): Promise<SchoolDistrict[]>
  async getSpecialDistricts(zipCode: string): Promise<SpecialDistrict[]>
}

// Municipal data structures
interface CityInfo {
  name: string;
  county: string;
  population: number;
  incorporationDate: string;
  governanceType: 'Mayor-Council' | 'Council-Manager' | 'Commission';
  councilStructure: 'At-Large' | 'District' | 'Mixed';
  zipCodes: string[];
}

interface CityOfficials {
  mayor: MunicipalOfficial;
  cityCouncil: MunicipalOfficial[];
  cityManager?: MunicipalOfficial;
  cityClerk: MunicipalOfficial;
}

interface SchoolDistrict {
  name: string;
  type: 'Elementary' | 'High School' | 'Unified' | 'Community College';
  superintendentName: string;
  boardMembers: SchoolBoardMember[];
  website: string;
  phone: string;
}
```

**CALIFORNIA CITIES TO PRIORITIZE:**
Tier 1 - Major Cities (Population 500K+):
1. Los Angeles (3.9M) - 15 council districts
2. San Diego (1.4M) - 9 council districts  
3. San Jose (1.0M) - 10 council districts
4. San Francisco (873K) - 11 supervisors
5. Fresno (543K) - 7 council districts

Tier 2 - Large Cities (100K-500K): ~50 cities
Tier 3 - Medium Cities (25K-100K): ~150 cities  
Tier 4 - Small Cities (<25K): ~280 cities

**DATA SOURCES:**
1. League of California Cities database
2. Individual city websites and APIs
3. County websites for unincorporated areas
4. California Department of Education for school districts
5. Secretary of State for special districts
6. Google Civic Information API (backup)

**SPECIAL CONSIDERATIONS:**
1. **Unincorporated Areas**: Handle ZIP codes in unincorporated county areas
2. **Special Districts**: Water, fire, library, hospital districts
3. **School Districts**: Often cross city boundaries
4. **City Structure Variations**: Different council sizes, election methods

**DELIVERABLES:**
1. ZIP code to city/unincorporated area mapping
2. Mayor and city council data for major cities (Tier 1-2)
3. School district mapping and board member tracking
4. Special district identification and official tracking
5. Integration with existing CivicInfo service

**SUCCESS CRITERIA:**
- 90%+ coverage of California cities by population
- Complete data for all cities over 100K population
- School district mapping for major metropolitan areas
- Proper handling of unincorporated areas
- Integration with ZIP code and county mapping systems

**IMPLEMENTATION APPROACH:**
1. Start with the 10 largest cities to establish patterns
2. Focus on council structure and current officials
3. Add school districts for metropolitan areas
4. Handle unincorporated areas through county government
5. Create fallback data for smaller municipalities

Begin with Los Angeles, San Diego, and San Jose city councils as proof of concept.
```

---

# AGENT 6: DATA QUALITY & UPDATES AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Goal: Complete California political representation mapping system
- Existing services to build upon: representatives.service.ts, openStatesService.ts, civicInfoService.ts
- Target: All 1,797 California ZIP codes mapped to federal/state/county/local representatives
- Coordinate with other agents working on related components

You are the Data Quality & Updates Agent for the CITZN platform. Your mission is to ensure the accuracy, freshness, and reliability of all political representative data across federal, state, county, and local levels.

**YOUR SPECIFIC TASKS:**

1. **Data Validation System**
   - Create `services/dataQualityService.ts`
   - Implement automated data verification checks
   - Cross-reference data between different sources
   - Flag inconsistencies and missing information

2. **Update Scheduling & Automation**
   - Create `services/dataUpdateScheduler.ts` 
   - Implement automated update workflows
   - Schedule different update frequencies by data type
   - Monitor API changes and failures

3. **Error Handling & Recovery**
   - Build robust fallback systems
   - Implement data source prioritization
   - Create manual override capabilities
   - Design graceful degradation strategies

4. **Required Implementation:**
```typescript
// services/dataQualityService.ts
class DataQualityService {
  async validateRepresentativeData(rep: Representative): Promise<ValidationResult>
  async crossReferenceOfficials(): Promise<DiscrepancyReport[]>
  async checkDataFreshness(): Promise<StalenessReport>
  async verifyContactInformation(): Promise<ContactValidationReport>
}

// services/dataUpdateScheduler.ts
class DataUpdateScheduler {
  async scheduleUpdates(): Promise<void>
  async runFederalDataUpdate(): Promise<UpdateResult>
  async runStateDataUpdate(): Promise<UpdateResult>
  async runCountyDataUpdate(): Promise<UpdateResult>
  async runLocalDataUpdate(): Promise<UpdateResult>
}

// Data quality interfaces
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
}

interface UpdateSchedule {
  federal: 'weekly';
  state: 'bi-weekly';  
  county: 'monthly';
  local: 'bi-weekly';
  emergency: 'as-needed';
}
```

**DATA QUALITY CHECKS TO IMPLEMENT:**

1. **Contact Information Validation**
   - Phone number format verification
   - Email address validation
   - Website availability checks
   - Address standardization

2. **Term and Election Validation**
   - Verify current term dates
   - Check against election schedules
   - Flag expired representatives
   - Monitor special elections

3. **Cross-Reference Validation**
   - Compare data across multiple sources
   - Verify party affiliations
   - Check district assignments
   - Validate committee memberships

4. **Geographic Consistency**
   - Ensure ZIP codes map to correct districts
   - Verify representative assignments
   - Check boundary changes
   - Validate overlapping jurisdictions

**MONITORING & ALERTING SYSTEM:**

1. **Performance Monitoring**
   - API response times
   - Data retrieval success rates
   - Cache hit ratios
   - Error frequency tracking

2. **Data Freshness Alerts**
   - Stale data warnings (>30 days old)
   - Missing representative notifications
   - Term expiration alerts
   - Election date reminders

3. **Quality Score Dashboard**
   - Overall data completeness percentage
   - Accuracy confidence scores
   - Source reliability metrics
   - User-reported error tracking

**DELIVERABLES:**
1. Comprehensive data validation system
2. Automated update scheduling and execution
3. Data quality monitoring dashboard
4. Error handling and recovery mechanisms
5. Manual data correction workflows
6. Performance and reliability metrics

**SUCCESS CRITERIA:**
- 95%+ data accuracy rate
- <1% stale data (>30 days old)
- <500ms average response time
- 99.9% system uptime
- Automated detection of 90%+ data issues

**UPDATE FREQUENCIES:**
- **Federal**: Weekly (Congress rarely changes)
- **State**: Bi-weekly (appointments and resignations)
- **County**: Monthly (elections every 4 years)
- **Local**: Bi-weekly (frequent municipal changes)
- **Emergency**: Real-time for elections and major changes

**IMPLEMENTATION PRIORITY:**
1. Build core validation system first
2. Add automated update scheduling
3. Implement monitoring and alerting  
4. Create manual correction workflows
5. Build data quality dashboard

Start with basic validation rules and gradually add more sophisticated cross-referencing.
```

---

## TECHNICAL ARCHITECTURE OVERVIEW

### Data Structure Design

```typescript
// Complete California Representation Interface
interface CaliforniaRepresentation {
  zipCode: string;
  location: {
    city: string;
    county: string;
    coordinates: [number, number];
  };
  
  // Federal Level
  federal: {
    president: Representative;
    senators: Representative[]; // Always 2
    houseRep: Representative;
    congressionalDistrict: number;
  };
  
  // State Level  
  state: {
    governor: Representative;
    stateSenator: Representative;
    stateAssemblyMember: Representative;
    stateSenateDistrict: number;
    stateAssemblyDistrict: number;
  };
  
  // County Level
  county: {
    supervisors: Representative[]; // 5 per county
    sheriff: Representative;
    districtAttorney: Representative;
    assessor: Representative;
    clerkRecorder: Representative;
    supervisorDistrict: number;
  };
  
  // City/Local Level
  local: {
    mayor: Representative;
    cityCouncil: Representative[];
    schoolBoard: Representative[];
    waterBoard?: Representative[];
    specialDistricts: Representative[]; // Fire, water, etc.
    wardDistrict?: number;
  };
}
```

### API Sources & Cost Estimates

1. **Geocodio API**: $500/month (50K requests)
2. **USGeocoder**: $300/month (backup)
3. **OpenStates**: Free (rate limited)
4. **ProPublica Congress**: Free (rate limited)
5. **Manual data collection**: Development time

### Implementation Timeline

- **Week 1-2**: Foundation (Agent 1)
- **Week 3-4**: Federal + State (Agents 2-3)  
- **Week 5-6**: County (Agent 4)
- **Week 7-8**: Local/Municipal (Agent 5)
- **Week 9-10**: Quality & Production (Agent 6)

### Success Metrics

1. **Coverage**: 99%+ of CA ZIP codes mapped
2. **Accuracy**: <1% error rate on representative data  
3. **Performance**: <500ms average response time
4. **Freshness**: 95% of data <30 days old
5. **User Satisfaction**: Reduced "representative not found" errors

---

## NEXT STEPS

1. **Copy and paste each agent prompt in sequence**
2. **Start with Agent 1 - ZIP Code Mapping Agent**
3. **Wait for Agent 1 completion before starting Agent 2**
4. **Continue through all 6 agents in order**
5. **Monitor progress and coordinate between agents**

This comprehensive system will transform CITZN from basic federal representation to complete civic engagement - users will know exactly who represents them at every level of government.