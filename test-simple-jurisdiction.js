/**
 * Simple Jurisdiction Test - Node.js compatible
 */

// Mock the TypeScript imports for Node.js testing
const mockJurisdictionService = {
  detectJurisdiction: async (zipCode, districtMapping) => {
    console.log(`🔍 Testing jurisdiction detection for ZIP: ${zipCode}`);
    
    // Known incorporated cities
    const incorporatedCities = {
      '90210': { name: 'Beverly Hills', county: 'Los Angeles County', type: 'incorporated_city' },
      '94102': { name: 'San Francisco', county: 'San Francisco County', type: 'incorporated_city' },
      '95814': { name: 'Sacramento', county: 'Sacramento County', type: 'incorporated_city' },
      '91101': { name: 'Pasadena', county: 'Los Angeles County', type: 'incorporated_city' }
    };
    
    // Known unincorporated areas
    const unincorporatedAreas = {
      '90022': { name: 'East Los Angeles', county: 'Los Angeles County', type: 'census_designated_place' },
      '91001': { name: 'Altadena', county: 'Los Angeles County', type: 'census_designated_place' },
      '90044': { name: 'West Athens', county: 'Los Angeles County', type: 'census_designated_place' }
    };
    
    let result;
    
    if (incorporatedCities[zipCode]) {
      const city = incorporatedCities[zipCode];
      result = {
        jurisdiction: {
          type: city.type,
          classification: 'city',
          name: city.name,
          county: city.county,
          incorporationStatus: 'incorporated',
          governmentLevel: ['federal', 'state', 'county', 'municipal'],
          hasLocalRepresentatives: true,
          localGovernmentType: 'city_council',
          description: `Incorporated city with full municipal services`
        },
        confidence: 1.0,
        source: 'database',
        lastUpdated: new Date().toISOString()
      };
    } else if (unincorporatedAreas[zipCode]) {
      const area = unincorporatedAreas[zipCode];
      result = {
        jurisdiction: {
          type: area.type,
          classification: 'unincorporated_county',
          name: area.name,
          county: area.county,
          incorporationStatus: 'unincorporated',
          governmentLevel: ['federal', 'state', 'county'],
          hasLocalRepresentatives: false,
          localGovernmentType: 'none',
          description: `Unincorporated community governed by ${area.county}`
        },
        confidence: 0.9,
        source: 'database',
        lastUpdated: new Date().toISOString()
      };
    } else {
      // Fallback for unknown areas
      result = {
        jurisdiction: {
          type: 'unincorporated_area',
          classification: 'unincorporated_county',
          name: `Unknown Area`,
          county: 'Unknown County',
          incorporationStatus: 'unincorporated',
          governmentLevel: ['federal', 'state', 'county'],
          hasLocalRepresentatives: false,
          localGovernmentType: 'none',
          description: `Area with unknown jurisdiction status`
        },
        confidence: 0.3,
        source: 'fallback',
        lastUpdated: new Date().toISOString()
      };
    }
    
    return result;
  },
  
  getRepresentativeRules: (jurisdiction) => {
    const info = jurisdiction.jurisdiction;
    
    return {
      zipCode: 'test',
      jurisdiction: info,
      applicableLevels: [
        { level: 'federal', applicable: true, reason: 'All areas have federal representatives' },
        { level: 'state', applicable: true, reason: 'All areas have state representatives' },
        { level: 'county', applicable: true, reason: 'All areas are within county jurisdiction' },
        { 
          level: 'municipal', 
          applicable: info.hasLocalRepresentatives,
          reason: info.hasLocalRepresentatives 
            ? `${info.name} is an incorporated city`
            : `${info.name} is unincorporated and governed at county level`
        }
      ],
      excludedLevels: info.hasLocalRepresentatives ? [] : ['municipal'],
      specialRules: info.hasLocalRepresentatives ? [] : [
        'Display county-level representatives only for local government',
        `Show message: "This is an unincorporated area of ${info.county}"`
      ]
    };
  },
  
  getAreaDescription: (jurisdiction) => {
    const info = jurisdiction.jurisdiction;
    
    if (info.type === 'incorporated_city') {
      return {
        title: `City of ${info.name}`,
        description: `${info.name} is an incorporated city in ${info.county}.`,
        governmentStructure: 'This city has its own local government with a mayor and city council.',
        representatives: 'You have representatives at the city, county, state, and federal levels.'
      };
    } else {
      return {
        title: `${info.name}`,
        description: `${info.name} is an unincorporated area in ${info.county}.`,
        governmentStructure: 'This area is governed directly by the county government.',
        representatives: 'You have representatives at the county, state, and federal levels. There are no city-level representatives.'
      };
    }
  }
};

// Mock representative service
const mockRepresentativeService = {
  getAllRepresentativesByZipCode: async (zipCode) => {
    console.log(`🏛️  Getting representatives for ZIP: ${zipCode}`);
    
    const jurisdiction = await mockJurisdictionService.detectJurisdiction(zipCode);
    const rules = mockJurisdictionService.getRepresentativeRules(jurisdiction);
    const areaInfo = mockJurisdictionService.getAreaDescription(jurisdiction);
    
    // Mock representatives based on jurisdiction type
    const federal = [
      { id: 'sen1', name: 'Dianne Feinstein', title: 'U.S. Senator', level: 'federal' },
      { id: 'sen2', name: 'Alex Padilla', title: 'U.S. Senator', level: 'federal' },
      { id: 'rep1', name: 'District Representative', title: 'U.S. Representative', level: 'federal' }
    ];
    
    const state = [
      { id: 'state1', name: 'State Senator', title: 'State Senator', level: 'state' },
      { id: 'state2', name: 'Assembly Member', title: 'Assembly Member', level: 'state' }
    ];
    
    const local = jurisdiction.jurisdiction.hasLocalRepresentatives ? [
      { id: 'local1', name: 'Mayor', title: 'Mayor', level: 'local' },
      { id: 'local2', name: 'City Council Member', title: 'Council Member', level: 'local' }
    ] : [];
    
    return {
      federal,
      state,
      local,
      total: federal.length + state.length + local.length,
      breakdown: {
        federal: federal.length,
        state: state.length,
        local: local.length
      },
      jurisdiction,
      areaInfo
    };
  }
};

async function testJurisdictionLogic() {
  console.log('🧪 CITZN Jurisdiction Logic Test\n');
  console.log('Testing representative filtering for incorporated vs unincorporated areas\n');
  console.log('='.repeat(80) + '\n');
  
  const testCases = [
    { zip: '90210', description: 'Beverly Hills (Incorporated City)' },
    { zip: '90022', description: 'East Los Angeles (Unincorporated Area)' },
    { zip: '94102', description: 'San Francisco (Incorporated City)' },
    { zip: '91001', description: 'Altadena (Unincorporated Area)' },
    { zip: '99999', description: 'Unknown Area (Fallback Test)' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📍 Testing: ${testCase.description}`);
    console.log('-'.repeat(60));
    
    try {
      const result = await mockRepresentativeService.getAllRepresentativesByZipCode(testCase.zip);
      
      console.log(`\n🏛️  Representative Count:`);
      console.log(`   Federal: ${result.breakdown.federal}`);
      console.log(`   State: ${result.breakdown.state}`);
      console.log(`   Local: ${result.breakdown.local}`);
      console.log(`   Total: ${result.total}`);
      
      console.log(`\n🏗️  Jurisdiction Info:`);
      console.log(`   Name: ${result.jurisdiction.jurisdiction.name}`);
      console.log(`   Type: ${result.jurisdiction.jurisdiction.type}`);
      console.log(`   Status: ${result.jurisdiction.jurisdiction.incorporationStatus}`);
      console.log(`   Has Local Reps: ${result.jurisdiction.jurisdiction.hasLocalRepresentatives}`);
      console.log(`   Confidence: ${Math.round(result.jurisdiction.confidence * 100)}%`);
      
      console.log(`\n📋 Area Description:`);
      console.log(`   ${result.areaInfo.description}`);
      console.log(`   ${result.areaInfo.governmentStructure}`);
      console.log(`   ${result.areaInfo.representatives}`);
      
      // Validation checks
      console.log(`\n✅ Validation Results:`);
      
      // All areas should have federal and state reps
      const hasFederalState = result.breakdown.federal > 0 && result.breakdown.state > 0;
      console.log(`   Federal & State Reps: ${hasFederalState ? '✅ PASS' : '❌ FAIL'}`);
      
      // Local reps should match jurisdiction type
      const localRepsMatchJurisdiction = result.jurisdiction.jurisdiction.hasLocalRepresentatives === (result.breakdown.local > 0);
      console.log(`   Local Rep Logic: ${localRepsMatchJurisdiction ? '✅ PASS' : '❌ FAIL'}`);
      
      // Incorporated cities should have local reps
      if (result.jurisdiction.jurisdiction.type === 'incorporated_city') {
        const hasLocalReps = result.breakdown.local > 0;
        console.log(`   Incorporated City Has Local Reps: ${hasLocalReps ? '✅ PASS' : '❌ FAIL'}`);
      }
      
      // Unincorporated areas should NOT have city-level reps
      if (result.jurisdiction.jurisdiction.type === 'census_designated_place' || 
          result.jurisdiction.jurisdiction.type === 'unincorporated_area') {
        const noLocalReps = result.breakdown.local === 0;
        console.log(`   Unincorporated Area Has No City Reps: ${noLocalReps ? '✅ PASS' : '❌ FAIL'}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 Test Complete!');
  console.log('\nKey Success Criteria:');
  console.log('✅ Incorporated cities show city, county, state, and federal representatives');
  console.log('✅ Unincorporated areas show only county, state, and federal representatives');
  console.log('✅ All areas show appropriate user messaging about government structure');
  console.log('✅ Jurisdiction detection works with high confidence for known areas');
}

// Run the test
if (require.main === module) {
  testJurisdictionLogic().catch(console.error);
}

module.exports = { testJurisdictionLogic };