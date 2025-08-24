/**
 * Agent 35: Real Data Validation Criteria & Forbidden Placeholder Detection
 * 
 * MISSION: Ensure ZERO placeholder or "unknown" values in all California ZIP code responses.
 * All data must be real, accurate, and verified against authoritative sources.
 */

class RealDataValidationCriteria {
  constructor() {
    // FORBIDDEN VALUES - These should NEVER appear in production data
    this.forbiddenValues = {
      // Generic placeholders
      generic: [
        'unknown', 'Unknown', 'UNKNOWN',
        'placeholder', 'Placeholder', 'PLACEHOLDER',
        'TBD', 'To Be Determined', 'Coming Soon',
        'N/A', 'Not Available', 'Not Found',
        'NULL', 'null', 'undefined', '',
        'DEFAULT', 'Default', 'default'
      ],

      // City-specific forbidden values
      cities: [
        'Unknown City', 'Placeholder City', 'Default City',
        '[City Name]', '[CITY]', 'Sample City', 'Test City',
        'Example City', 'Demo City', 'Fallback City',
        'Generic City', 'City Not Found', 'Invalid City',
        'Missing City', 'Unspecified City', 'Temporary City',
        'Lorem City', 'Lorem Ipsum', 'Test Location'
      ],

      // County-specific forbidden values
      counties: [
        'Unknown County', 'Placeholder County', 'Default County',
        '[County Name]', '[COUNTY]', 'Sample County', 'Test County',
        'Example County', 'Demo County', 'Fallback County',
        'Generic County', 'County Not Found', 'Invalid County',
        'Missing County', 'Unspecified County', 'Temporary County'
      ],

      // District-specific forbidden values
      districts: [
        0, -1, 999, 9999, 99999, // Invalid numeric districts
        'Unknown District', 'Placeholder District', '[District]',
        'TBD District', 'Not Available', 'Invalid District',
        'District Not Found', 'Missing District', 'Default District'
      ],

      // Coordinate-specific forbidden values
      coordinates: [
        [0, 0], // Origin point - clearly invalid
        [-1, -1], // Negative placeholder
        [999, 999], [999.0, 999.0], // Out of range placeholder
        [-119.4179, 36.7783], // Generic California center - too generic
        [null, null], [undefined, undefined]
      ],

      // State-specific (non-California states for CA ZIP codes)
      invalidStatesForCA: [
        'Unknown', 'XX', 'ZZ', 'N/A', null, undefined, '',
        // Wrong states that might appear due to data errors
        'Nevada', 'NV', 'Oregon', 'OR', 'Arizona', 'AZ'
      ]
    };

    // REAL DATA VALIDATION CRITERIA
    this.realDataCriteria = {
      // Valid California congressional districts (1-52 after 2022 redistricting)
      congressionalDistricts: {
        min: 1,
        max: 52,
        validValues: Array.from({length: 52}, (_, i) => i + 1)
      },

      // Valid California state senate districts (1-40)
      stateSenateDistricts: {
        min: 1,
        max: 40,
        validValues: Array.from({length: 40}, (_, i) => i + 1)
      },

      // Valid California state assembly districts (1-80)
      stateAssemblyDistricts: {
        min: 1,
        max: 80,
        validValues: Array.from({length: 80}, (_, i) => i + 1)
      },

      // Valid California coordinate bounds
      coordinateBounds: {
        latitude: { min: 32.5, max: 42.0 },
        longitude: { min: -124.4, max: -114.1 }
      },

      // All 58 California counties (must match exactly)
      validCounties: new Set([
        'Alameda County', 'Alpine County', 'Amador County', 'Butte County',
        'Calaveras County', 'Colusa County', 'Contra Costa County', 'Del Norte County',
        'El Dorado County', 'Fresno County', 'Glenn County', 'Humboldt County',
        'Imperial County', 'Inyo County', 'Kern County', 'Kings County',
        'Lake County', 'Lassen County', 'Los Angeles County', 'Madera County',
        'Marin County', 'Mariposa County', 'Mendocino County', 'Merced County',
        'Modoc County', 'Mono County', 'Monterey County', 'Napa County',
        'Nevada County', 'Orange County', 'Placer County', 'Plumas County',
        'Riverside County', 'Sacramento County', 'San Benito County', 'San Bernardino County',
        'San Diego County', 'San Francisco County', 'San Joaquin County', 'San Luis Obispo County',
        'San Mateo County', 'Santa Barbara County', 'Santa Clara County', 'Santa Cruz County',
        'Shasta County', 'Sierra County', 'Siskiyou County', 'Solano County',
        'Sonoma County', 'Stanislaus County', 'Sutter County', 'Tehama County',
        'Trinity County', 'Tulare County', 'Tuolumne County', 'Ventura County',
        'Yolo County', 'Yuba County'
      ]),

      // Valid states for California ZIP codes
      validStates: new Set(['CA', 'California']),

      // Minimum accuracy threshold for geocoding
      minimumAccuracy: 0.7
    };

    // REAL CITY VALIDATION
    this.cityValidation = {
      // Known major California cities for quick validation
      knownCities: new Set([
        'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno',
        'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim',
        'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista',
        'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard',
        'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita', 'Garden Grove'
      ]),

      // Patterns that indicate valid city names
      validCityPatterns: [
        /^[A-Z][a-z]+([ -][A-Z][a-z]+)*$/, // Standard city name pattern
        /^[A-Z][a-z]+ [A-Z][a-z]+$/, // Two-word cities
        /^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/ // Three-word cities
      ],

      // Patterns that indicate invalid/placeholder city names
      invalidCityPatterns: [
        /unknown/i, /placeholder/i, /default/i, /test/i, /sample/i,
        /lorem/i, /ipsum/i, /\[.*\]/, /^[0-9]+$/, /null/i, /undefined/i
      ]
    };
  }

  /**
   * Comprehensive validation of ZIP code response data
   */
  validateRealData(zipCode, responseData) {
    const validation = {
      zipCode,
      timestamp: new Date().toISOString(),
      isRealData: true,
      violations: [],
      warnings: [],
      accuracy: {
        city: 'UNKNOWN',
        county: 'UNKNOWN', 
        state: 'UNKNOWN',
        districts: 'UNKNOWN',
        coordinates: 'UNKNOWN',
        overall: 'UNKNOWN'
      }
    };

    // 1. Check for forbidden placeholder values
    this.checkForForbiddenValues(responseData, validation);

    // 2. Validate geographic data
    this.validateGeographicData(responseData, validation);

    // 3. Validate political districts
    this.validatePoliticalDistricts(responseData, validation);

    // 4. Validate coordinate accuracy
    this.validateCoordinates(responseData, validation);

    // 5. Calculate overall accuracy score
    this.calculateOverallAccuracy(validation);

    return validation;
  }

  /**
   * Check for any forbidden placeholder values
   */
  checkForForbiddenValues(data, validation) {
    // Check city for forbidden values
    if (data.city) {
      if (this.forbiddenValues.cities.includes(data.city) || 
          this.forbiddenValues.generic.includes(data.city)) {
        validation.violations.push({
          field: 'city',
          value: data.city,
          issue: 'FORBIDDEN_PLACEHOLDER',
          severity: 'CRITICAL',
          message: `City contains forbidden placeholder value: "${data.city}"`
        });
        validation.isRealData = false;
        validation.accuracy.city = 'FAILED';
      } else if (this.isValidCityName(data.city)) {
        validation.accuracy.city = 'VERIFIED';
      } else {
        validation.warnings.push({
          field: 'city',
          value: data.city,
          issue: 'SUSPICIOUS_CITY_NAME',
          severity: 'MEDIUM',
          message: `City name "${data.city}" does not match expected patterns`
        });
        validation.accuracy.city = 'SUSPICIOUS';
      }
    }

    // Check county for forbidden values
    if (data.county) {
      if (this.forbiddenValues.counties.includes(data.county) ||
          this.forbiddenValues.generic.includes(data.county)) {
        validation.violations.push({
          field: 'county',
          value: data.county,
          issue: 'FORBIDDEN_PLACEHOLDER',
          severity: 'CRITICAL',
          message: `County contains forbidden placeholder value: "${data.county}"`
        });
        validation.isRealData = false;
        validation.accuracy.county = 'FAILED';
      } else if (this.realDataCriteria.validCounties.has(data.county)) {
        validation.accuracy.county = 'VERIFIED';
      } else {
        validation.violations.push({
          field: 'county',
          value: data.county,
          issue: 'INVALID_COUNTY',
          severity: 'HIGH',
          message: `County "${data.county}" is not a valid California county`
        });
        validation.isRealData = false;
        validation.accuracy.county = 'FAILED';
      }
    }

    // Check state
    if (data.state) {
      if (this.forbiddenValues.invalidStatesForCA.includes(data.state) ||
          this.forbiddenValues.generic.includes(data.state)) {
        validation.violations.push({
          field: 'state',
          value: data.state,
          issue: 'INVALID_STATE',
          severity: 'CRITICAL',
          message: `State "${data.state}" is invalid for California ZIP code`
        });
        validation.isRealData = false;
        validation.accuracy.state = 'FAILED';
      } else if (this.realDataCriteria.validStates.has(data.state)) {
        validation.accuracy.state = 'VERIFIED';
      } else {
        validation.warnings.push({
          field: 'state',
          value: data.state,
          issue: 'UNEXPECTED_STATE_FORMAT',
          severity: 'LOW',
          message: `State format "${data.state}" is unexpected but may be valid`
        });
        validation.accuracy.state = 'SUSPICIOUS';
      }
    }
  }

  /**
   * Validate geographic data accuracy
   */
  validateGeographicData(data, validation) {
    // Additional city validation
    if (data.city && !this.isValidCityName(data.city)) {
      validation.warnings.push({
        field: 'city',
        value: data.city,
        issue: 'SUSPICIOUS_CITY_NAME',
        severity: 'MEDIUM',
        message: `City name "${data.city}" may not be real or may be misspelled`
      });
    }

    // Check for unincorporated areas (these are valid but should be clearly labeled)
    if (data.city && data.city.toLowerCase().includes('unincorporated')) {
      validation.warnings.push({
        field: 'city',
        value: data.city,
        issue: 'UNINCORPORATED_AREA',
        severity: 'INFO',
        message: `ZIP code is in unincorporated area - ensure county data is accurate`
      });
    }
  }

  /**
   * Validate political district assignments
   */
  validatePoliticalDistricts(data, validation) {
    let districtValidation = 'VERIFIED';

    // Congressional district validation
    if (data.congressionalDistrict !== undefined) {
      const cd = parseInt(data.congressionalDistrict);
      if (this.forbiddenValues.districts.includes(data.congressionalDistrict) ||
          !this.realDataCriteria.congressionalDistricts.validValues.includes(cd)) {
        validation.violations.push({
          field: 'congressionalDistrict',
          value: data.congressionalDistrict,
          issue: 'INVALID_CONGRESSIONAL_DISTRICT',
          severity: 'HIGH',
          message: `Congressional district ${data.congressionalDistrict} is invalid (must be 1-52)`
        });
        districtValidation = 'FAILED';
      }
    }

    // State senate district validation
    if (data.stateSenateDistrict !== undefined) {
      const sd = parseInt(data.stateSenateDistrict);
      if (this.forbiddenValues.districts.includes(data.stateSenateDistrict) ||
          !this.realDataCriteria.stateSenateDistricts.validValues.includes(sd)) {
        validation.violations.push({
          field: 'stateSenateDistrict',
          value: data.stateSenateDistrict,
          issue: 'INVALID_STATE_SENATE_DISTRICT',
          severity: 'HIGH',
          message: `State senate district ${data.stateSenateDistrict} is invalid (must be 1-40)`
        });
        districtValidation = 'FAILED';
      }
    }

    // State assembly district validation
    if (data.stateAssemblyDistrict !== undefined) {
      const ad = parseInt(data.stateAssemblyDistrict);
      if (this.forbiddenValues.districts.includes(data.stateAssemblyDistrict) ||
          !this.realDataCriteria.stateAssemblyDistricts.validValues.includes(ad)) {
        validation.violations.push({
          field: 'stateAssemblyDistrict',
          value: data.stateAssemblyDistrict,
          issue: 'INVALID_STATE_ASSEMBLY_DISTRICT',
          severity: 'HIGH',
          message: `State assembly district ${data.stateAssemblyDistrict} is invalid (must be 1-80)`
        });
        districtValidation = 'FAILED';
      }
    }

    validation.accuracy.districts = districtValidation;
  }

  /**
   * Validate coordinate accuracy
   */
  validateCoordinates(data, validation) {
    if (!data.coordinates) {
      validation.warnings.push({
        field: 'coordinates',
        value: null,
        issue: 'MISSING_COORDINATES',
        severity: 'LOW',
        message: 'Coordinates not provided'
      });
      validation.accuracy.coordinates = 'MISSING';
      return;
    }

    const [lng, lat] = data.coordinates;

    // Check for forbidden coordinate values
    const coordString = JSON.stringify([lng, lat]);
    for (const forbiddenCoord of this.forbiddenValues.coordinates) {
      if (JSON.stringify(forbiddenCoord) === coordString) {
        validation.violations.push({
          field: 'coordinates',
          value: data.coordinates,
          issue: 'FORBIDDEN_COORDINATE_PLACEHOLDER',
          severity: 'CRITICAL',
          message: `Coordinates contain forbidden placeholder value: ${coordString}`
        });
        validation.isRealData = false;
        validation.accuracy.coordinates = 'FAILED';
        return;
      }
    }

    // Check if coordinates are within California bounds
    const bounds = this.realDataCriteria.coordinateBounds;
    if (lat < bounds.latitude.min || lat > bounds.latitude.max ||
        lng < bounds.longitude.min || lng > bounds.longitude.max) {
      validation.violations.push({
        field: 'coordinates',
        value: data.coordinates,
        issue: 'COORDINATES_OUTSIDE_CALIFORNIA',
        severity: 'HIGH',
        message: `Coordinates ${coordString} are outside California bounds`
      });
      validation.accuracy.coordinates = 'FAILED';
    } else {
      validation.accuracy.coordinates = 'VERIFIED';
    }

    // Check accuracy score if provided
    if (data.accuracy !== undefined && data.accuracy < this.realDataCriteria.minimumAccuracy) {
      validation.warnings.push({
        field: 'accuracy',
        value: data.accuracy,
        issue: 'LOW_GEOCODING_ACCURACY',
        severity: 'MEDIUM',
        message: `Geocoding accuracy ${data.accuracy} is below minimum threshold of ${this.realDataCriteria.minimumAccuracy}`
      });
    }
  }

  /**
   * Check if a city name appears to be valid/real
   */
  isValidCityName(cityName) {
    // Quick check against known cities
    if (this.cityValidation.knownCities.has(cityName)) {
      return true;
    }

    // Check against invalid patterns
    for (const pattern of this.cityValidation.invalidCityPatterns) {
      if (pattern.test(cityName)) {
        return false;
      }
    }

    // Check against valid patterns
    for (const pattern of this.cityValidation.validCityPatterns) {
      if (pattern.test(cityName)) {
        return true;
      }
    }

    // If no patterns match, consider it suspicious but not definitively invalid
    return false;
  }

  /**
   * Calculate overall accuracy score
   */
  calculateOverallAccuracy(validation) {
    const scores = Object.values(validation.accuracy);
    const verifiedCount = scores.filter(score => score === 'VERIFIED').length;
    const failedCount = scores.filter(score => score === 'FAILED').length;
    const totalFieldsEvaluated = scores.filter(score => score !== 'UNKNOWN').length;

    if (failedCount > 0) {
      validation.accuracy.overall = 'FAILED';
      validation.isRealData = false;
    } else if (verifiedCount === totalFieldsEvaluated) {
      validation.accuracy.overall = 'VERIFIED';
    } else {
      validation.accuracy.overall = 'PARTIAL';
    }
  }

  /**
   * Generate a detailed real data validation report
   */
  generateValidationReport(validationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalValidated: validationResults.length,
        realDataConfirmed: validationResults.filter(v => v.isRealData).length,
        placeholderDetected: validationResults.filter(v => !v.isRealData).length,
        criticalViolations: 0,
        highSeverityIssues: 0,
        mediumSeverityIssues: 0,
        lowSeverityIssues: 0
      },
      detailedFindings: {
        forbiddenPlaceholders: [],
        invalidDistricts: [],
        geographicAccuracyIssues: [],
        coordinateProblems: [],
        suspiciousCityNames: []
      },
      complianceStatus: 'UNKNOWN'
    };

    // Analyze all validation results
    for (const validation of validationResults) {
      // Count severity levels
      const violations = validation.violations || [];
      const warnings = validation.warnings || [];

      report.summary.criticalViolations += violations.filter(v => v.severity === 'CRITICAL').length;
      report.summary.highSeverityIssues += violations.filter(v => v.severity === 'HIGH').length;
      report.summary.mediumSeverityIssues += violations.filter(v => v.severity === 'MEDIUM').length + warnings.filter(w => w.severity === 'MEDIUM').length;
      report.summary.lowSeverityIssues += warnings.filter(w => w.severity === 'LOW').length;

      // Categorize specific issues
      for (const violation of violations) {
        switch (violation.issue) {
          case 'FORBIDDEN_PLACEHOLDER':
          case 'FORBIDDEN_COORDINATE_PLACEHOLDER':
            report.detailedFindings.forbiddenPlaceholders.push({
              zipCode: validation.zipCode,
              field: violation.field,
              value: violation.value,
              message: violation.message
            });
            break;

          case 'INVALID_CONGRESSIONAL_DISTRICT':
          case 'INVALID_STATE_SENATE_DISTRICT':
          case 'INVALID_STATE_ASSEMBLY_DISTRICT':
            report.detailedFindings.invalidDistricts.push({
              zipCode: validation.zipCode,
              field: violation.field,
              value: violation.value,
              message: violation.message
            });
            break;

          case 'INVALID_COUNTY':
          case 'INVALID_STATE':
            report.detailedFindings.geographicAccuracyIssues.push({
              zipCode: validation.zipCode,
              field: violation.field,
              value: violation.value,
              message: violation.message
            });
            break;

          case 'COORDINATES_OUTSIDE_CALIFORNIA':
            report.detailedFindings.coordinateProblems.push({
              zipCode: validation.zipCode,
              coordinates: violation.value,
              message: violation.message
            });
            break;
        }
      }

      // Check for suspicious city names
      for (const warning of warnings) {
        if (warning.issue === 'SUSPICIOUS_CITY_NAME') {
          report.detailedFindings.suspiciousCityNames.push({
            zipCode: validation.zipCode,
            city: warning.value,
            message: warning.message
          });
        }
      }
    }

    // Determine compliance status
    const placeholderRate = (report.summary.placeholderDetected / report.summary.totalValidated) * 100;
    const realDataRate = (report.summary.realDataConfirmed / report.summary.totalValidated) * 100;

    if (report.summary.criticalViolations === 0 && placeholderRate === 0 && realDataRate >= 99.5) {
      report.complianceStatus = 'FULLY_COMPLIANT';
    } else if (report.summary.criticalViolations === 0 && placeholderRate < 1 && realDataRate >= 98) {
      report.complianceStatus = 'MOSTLY_COMPLIANT';
    } else if (placeholderRate < 5 && realDataRate >= 95) {
      report.complianceStatus = 'PARTIALLY_COMPLIANT';
    } else {
      report.complianceStatus = 'NON_COMPLIANT';
    }

    return report;
  }

  /**
   * Print a formatted validation report to console
   */
  printValidationReport(report) {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 REAL DATA VALIDATION REPORT - AGENT 35');
    console.log('='.repeat(70));

    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`   Total Validated: ${report.summary.totalValidated}`);
    console.log(`   Real Data Confirmed: ${report.summary.realDataConfirmed} (${((report.summary.realDataConfirmed/report.summary.totalValidated)*100).toFixed(1)}%)`);
    console.log(`   Placeholder Detected: ${report.summary.placeholderDetected} (${((report.summary.placeholderDetected/report.summary.totalValidated)*100).toFixed(1)}%)`);
    console.log(`   Compliance Status: ${report.complianceStatus}`);

    console.log('\n🚨 ISSUE BREAKDOWN:');
    console.log(`   Critical Violations: ${report.summary.criticalViolations}`);
    console.log(`   High Severity: ${report.summary.highSeverityIssues}`);
    console.log(`   Medium Severity: ${report.summary.mediumSeverityIssues}`);
    console.log(`   Low Severity: ${report.summary.lowSeverityIssues}`);

    if (report.detailedFindings.forbiddenPlaceholders.length > 0) {
      console.log('\n❌ FORBIDDEN PLACEHOLDER VIOLATIONS:');
      report.detailedFindings.forbiddenPlaceholders.slice(0, 10).forEach(issue => {
        console.log(`   ${issue.zipCode}: ${issue.field} = "${issue.value}"`);
      });
      if (report.detailedFindings.forbiddenPlaceholders.length > 10) {
        console.log(`   ... and ${report.detailedFindings.forbiddenPlaceholders.length - 10} more`);
      }
    }

    if (report.detailedFindings.invalidDistricts.length > 0) {
      console.log('\n🗳️  INVALID DISTRICT ASSIGNMENTS:');
      report.detailedFindings.invalidDistricts.slice(0, 5).forEach(issue => {
        console.log(`   ${issue.zipCode}: ${issue.field} = ${issue.value}`);
      });
    }

    if (report.complianceStatus === 'FULLY_COMPLIANT') {
      console.log('\n✅ MISSION SUCCESS: All data is real and accurate!');
    } else {
      console.log('\n⚠️  MISSION INCOMPLETE: Data quality issues detected');
    }

    console.log('\n' + '='.repeat(70));
  }
}

// Export for use in validation framework
module.exports = RealDataValidationCriteria;

// Standalone test runner
if (require.main === module) {
  const validator = new RealDataValidationCriteria();

  // Sample test data with various issues to demonstrate detection
  const testData = [
    // Good data example
    {
      zipCode: '90210',
      city: 'Beverly Hills',
      county: 'Los Angeles County',
      state: 'CA',
      congressionalDistrict: 30,
      stateSenateDistrict: 26,
      stateAssemblyDistrict: 50,
      coordinates: [-118.4065, 34.0901]
    },

    // Placeholder violation examples
    {
      zipCode: '90001',
      city: 'Unknown City',
      county: 'Los Angeles County', 
      state: 'CA',
      congressionalDistrict: 44,
      coordinates: [-118.2468, 33.9731]
    },

    // Invalid district example
    {
      zipCode: '94102',
      city: 'San Francisco',
      county: 'San Francisco County',
      state: 'CA',
      congressionalDistrict: 999, // Invalid
      coordinates: [-122.4194, 37.7749]
    }
  ];

  console.log('🧪 Running real data validation criteria tests...\n');

  const validationResults = testData.map(data => 
    validator.validateRealData(data.zipCode, data)
  );

  const report = validator.generateValidationReport(validationResults);
  validator.printValidationReport(report);
}