/**
 * Agent 35: ZIP Code & Geographic Data Validation Specialist
 * Comprehensive California ZIP Code Validation Framework
 * 
 * CRITICAL MISSION: Validate all 1,797 California ZIP codes return real, 
 * accurate geographic and political data with ZERO placeholder responses.
 */

const fs = require('fs');
const path = require('path');

class CaliforniaZipValidationFramework {
  constructor() {
    this.validationResults = {
      totalZipCodes: 0,
      validatedZipCodes: 0,
      failedValidations: 0,
      placeholderDetections: 0,
      realDataConfirmed: 0,
      performanceMetrics: {
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        totalRequestTime: 0
      },
      errors: [],
      placeholderViolations: [],
      geographicAccuracyIssues: [],
      districtMappingErrors: []
    };

    // Complete California ZIP code ranges based on USPS data
    this.californiaZipRanges = [
      // Northern California
      { start: 94000, end: 95999, region: 'Northern California', counties: ['San Francisco', 'Alameda', 'San Mateo', 'Santa Clara', 'Contra Costa', 'Marin', 'Napa', 'Sonoma', 'Solano', 'Yolo', 'Sacramento', 'San Joaquin', 'Stanislaus', 'Merced', 'Fresno', 'Kings', 'Tulare', 'Kern'] },
      
      // Central California  
      { start: 93200, end: 93599, region: 'Central California', counties: ['Kern', 'Kings', 'Tulare', 'Fresno', 'Madera', 'Merced', 'Stanislaus'] },
      { start: 93600, end: 93799, region: 'Central Valley', counties: ['Fresno', 'Madera', 'Tulare', 'Kings'] },
      
      // Southern California - Los Angeles County
      { start: 90000, end: 91999, region: 'Los Angeles County', counties: ['Los Angeles'] },
      
      // Southern California - Orange/Riverside/San Bernardino
      { start: 92000, end: 92999, region: 'Southern California Inland', counties: ['Orange', 'Riverside', 'San Bernardino', 'San Diego'] },
      
      // Central Coast
      { start: 93000, end: 93199, region: 'Central Coast', counties: ['Santa Barbara', 'Ventura', 'San Luis Obispo'] },
      { start: 93400, end: 93499, region: 'Central Coast SLO', counties: ['San Luis Obispo'] },
      { start: 93800, end: 93999, region: 'Central Coast Extended', counties: ['Santa Barbara', 'Ventura'] }
    ];

    // Forbidden placeholder values - these should NEVER appear in real data
    this.forbiddenPlaceholderValues = {
      cities: [
        'unknown', 'Unknown', 'UNKNOWN', 'Unknown City',
        'placeholder', 'Placeholder', 'PLACEHOLDER', 'Placeholder City',
        'TBD', 'To Be Determined', 'Coming Soon', 'Not Available',
        'N/A', 'Not Found', '[City Name]', '[CITY]',
        'Sample City', 'Test City', 'Example City', 'Demo City',
        'Default City', 'Fallback City', 'Generic City',
        'City Not Found', 'Invalid City', 'Missing City'
      ],
      counties: [
        'Unknown County', 'Placeholder County', 'Default County',
        '[County Name]', '[COUNTY]', 'Sample County', 'Test County',
        'N/A County', 'Not Available County', 'Missing County'
      ],
      districts: [
        0, -1, 999, 9999, 99999,
        'Unknown District', 'Placeholder District', '[District]',
        'TBD District', 'Not Available'
      ],
      coordinates: [
        [0, 0], [-1, -1], [999, 999],
        [-119.4179, 36.7783] // Generic California center - not acceptable for specific ZIP
      ]
    };

    // Real California congressional districts (1-52)
    this.validCongressionalDistricts = Array.from({length: 52}, (_, i) => i + 1);
    
    // Real California state senate districts (1-40)  
    this.validStateSenateDistricts = Array.from({length: 40}, (_, i) => i + 1);
    
    // Real California state assembly districts (1-80)
    this.validStateAssemblyDistricts = Array.from({length: 80}, (_, i) => i + 1);

    this.californiaCounties = [
      'Alameda County', 'Alpine County', 'Amador County', 'Butte County', 'Calaveras County',
      'Colusa County', 'Contra Costa County', 'Del Norte County', 'El Dorado County', 'Fresno County',
      'Glenn County', 'Humboldt County', 'Imperial County', 'Inyo County', 'Kern County',
      'Kings County', 'Lake County', 'Lassen County', 'Los Angeles County', 'Madera County',
      'Marin County', 'Mariposa County', 'Mendocino County', 'Merced County', 'Modoc County',
      'Mono County', 'Monterey County', 'Napa County', 'Nevada County', 'Orange County',
      'Placer County', 'Plumas County', 'Riverside County', 'Sacramento County', 'San Benito County',
      'San Bernardino County', 'San Diego County', 'San Francisco County', 'San Joaquin County',
      'San Luis Obispo County', 'San Mateo County', 'Santa Barbara County', 'Santa Clara County',
      'Santa Cruz County', 'Shasta County', 'Sierra County', 'Siskiyou County', 'Solano County',
      'Sonoma County', 'Stanislaus County', 'Sutter County', 'Tehama County', 'Trinity County',
      'Tulare County', 'Tuolumne County', 'Ventura County', 'Yolo County', 'Yuba County'
    ];
  }

  /**
   * Generate complete list of all California ZIP codes for testing
   */
  generateAllCaliforniaZipCodes() {
    const allZipCodes = new Set();

    // Generate ZIP codes from known ranges
    for (const range of this.californiaZipRanges) {
      for (let zip = range.start; zip <= range.end; zip++) {
        const zipString = zip.toString().padStart(5, '0');
        allZipCodes.add(zipString);
      }
    }

    // Add known edge cases and special ZIP codes
    const knownCaliforniaZips = [
      // Major cities that might be outside main ranges
      '96001', '96002', '96003', // Redding
      '96007', '96008', '96009', // Anderson/Redding area
      '90290', '90291', '90292', // Topanga/Malibu
      '95524', '95525', '95526', // Eureka area
      '90272', '90274', '90275', // Palos Verdes
      '93923', '93924', '93925', // Carmel/Monterey
      
      // Special postal facilities
      '96199', // Nevada City
      '95899', // Yuba City  
      '93599', // Visalia
    ];

    knownCaliforniaZips.forEach(zip => allZipCodes.add(zip));

    return Array.from(allZipCodes).sort();
  }

  /**
   * Validate a single ZIP code against all criteria
   */
  async validateSingleZipCode(zipCode, apiEndpoint = 'http://localhost:3008/api/auth/verify-zip') {
    const startTime = Date.now();
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode })
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.updatePerformanceMetrics(responseTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure and content
      const validation = this.validateZipCodeResponse(zipCode, data);
      
      return {
        zipCode,
        success: true,
        responseTime,
        data,
        validation,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.updatePerformanceMetrics(responseTime);

      this.validationResults.errors.push({
        zipCode,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return {
        zipCode,
        success: false,
        error: error.message,
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Comprehensive validation of ZIP code response data
   */
  validateZipCodeResponse(zipCode, data) {
    const validation = {
      structureValid: true,
      realDataConfirmed: true,
      geographicAccurate: true,
      districtMappingValid: true,
      placeholderDetected: false,
      issues: []
    };

    // 1. Structure Validation
    const requiredFields = ['valid', 'zipCode', 'city', 'state', 'county'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        validation.structureValid = false;
        validation.issues.push(`Missing required field: ${field}`);
      }
    }

    if (data.zipCode !== zipCode) {
      validation.structureValid = false;
      validation.issues.push(`ZIP code mismatch: expected ${zipCode}, got ${data.zipCode}`);
    }

    // 2. State Validation (must be California)
    if (data.state !== 'CA' && data.state !== 'California') {
      validation.geographicAccurate = false;
      validation.issues.push(`Invalid state for California ZIP: ${data.state}`);
    }

    // 3. Placeholder Detection
    if (this.containsPlaceholderData(data)) {
      validation.placeholderDetected = true;
      validation.realDataConfirmed = false;
      this.validationResults.placeholderDetections++;
    }

    // 4. Geographic Accuracy Validation
    if (!this.validateGeographicAccuracy(data)) {
      validation.geographicAccurate = false;
      validation.issues.push('Geographic data accuracy issues detected');
    }

    // 5. District Mapping Validation
    if (!this.validateDistrictMappings(data)) {
      validation.districtMappingValid = false;
      validation.issues.push('District mapping validation failed');
    }

    // 6. County Validation
    if (!this.validateCounty(data.county)) {
      validation.geographicAccurate = false;
      validation.issues.push(`Invalid California county: ${data.county}`);
    }

    // Update counters
    if (validation.realDataConfirmed && validation.geographicAccurate && validation.districtMappingValid) {
      this.validationResults.realDataConfirmed++;
    } else {
      this.validationResults.failedValidations++;
    }

    return validation;
  }

  /**
   * Detect forbidden placeholder values
   */
  containsPlaceholderData(data) {
    let hasPlaceholder = false;
    const violations = [];

    // Check city
    if (this.forbiddenPlaceholderValues.cities.includes(data.city)) {
      hasPlaceholder = true;
      violations.push(`Placeholder city detected: ${data.city}`);
    }

    // Check county  
    if (this.forbiddenPlaceholderValues.counties.includes(data.county)) {
      hasPlaceholder = true;
      violations.push(`Placeholder county detected: ${data.county}`);
    }

    // Check districts
    if (data.congressionalDistrict && this.forbiddenPlaceholderValues.districts.includes(data.congressionalDistrict)) {
      hasPlaceholder = true;
      violations.push(`Placeholder congressional district: ${data.congressionalDistrict}`);
    }

    // Check coordinates (if provided)
    if (data.coordinates) {
      const coordString = JSON.stringify(data.coordinates);
      for (const forbiddenCoord of this.forbiddenPlaceholderValues.coordinates) {
        if (JSON.stringify(forbiddenCoord) === coordString) {
          hasPlaceholder = true;
          violations.push(`Placeholder coordinates detected: ${coordString}`);
        }
      }
    }

    if (hasPlaceholder) {
      this.validationResults.placeholderViolations.push({
        zipCode: data.zipCode,
        violations: violations,
        timestamp: new Date().toISOString()
      });
    }

    return hasPlaceholder;
  }

  /**
   * Validate geographic accuracy
   */
  validateGeographicAccuracy(data) {
    let isAccurate = true;

    // Validate coordinates are within California bounds
    if (data.coordinates) {
      const [lng, lat] = data.coordinates;
      
      // California approximate bounds
      const caBounds = {
        north: 42.0,
        south: 32.5,
        east: -114.1,
        west: -124.4
      };

      if (lat < caBounds.south || lat > caBounds.north || 
          lng < caBounds.west || lng > caBounds.east) {
        isAccurate = false;
        this.validationResults.geographicAccuracyIssues.push({
          zipCode: data.zipCode,
          issue: 'Coordinates outside California bounds',
          coordinates: data.coordinates,
          timestamp: new Date().toISOString()
        });
      }
    }

    return isAccurate;
  }

  /**
   * Validate district mappings are within valid ranges
   */
  validateDistrictMappings(data) {
    let isValid = true;

    // Congressional district validation
    if (data.congressionalDistrict) {
      const cd = parseInt(data.congressionalDistrict);
      if (!this.validCongressionalDistricts.includes(cd)) {
        isValid = false;
        this.validationResults.districtMappingErrors.push({
          zipCode: data.zipCode,
          issue: `Invalid congressional district: ${cd}`,
          validRange: '1-52',
          timestamp: new Date().toISOString()
        });
      }
    }

    // State senate district validation
    if (data.stateSenateDistrict) {
      const sd = parseInt(data.stateSenateDistrict);
      if (!this.validStateSenateDistricts.includes(sd)) {
        isValid = false;
        this.validationResults.districtMappingErrors.push({
          zipCode: data.zipCode,
          issue: `Invalid state senate district: ${sd}`,
          validRange: '1-40',
          timestamp: new Date().toISOString()
        });
      }
    }

    // State assembly district validation
    if (data.stateAssemblyDistrict) {
      const ad = parseInt(data.stateAssemblyDistrict);
      if (!this.validStateAssemblyDistricts.includes(ad)) {
        isValid = false;
        this.validationResults.districtMappingErrors.push({
          zipCode: data.zipCode,
          issue: `Invalid state assembly district: ${ad}`,
          validRange: '1-80',
          timestamp: new Date().toISOString()
        });
      }
    }

    return isValid;
  }

  /**
   * Validate county is a real California county
   */
  validateCounty(county) {
    return this.californiaCounties.includes(county);
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(responseTime) {
    this.validationResults.performanceMetrics.totalRequestTime += responseTime;
    this.validationResults.performanceMetrics.maxResponseTime = Math.max(
      this.validationResults.performanceMetrics.maxResponseTime,
      responseTime
    );
    this.validationResults.performanceMetrics.minResponseTime = Math.min(
      this.validationResults.performanceMetrics.minResponseTime,
      responseTime
    );
    
    const totalRequests = this.validationResults.validatedZipCodes + 1;
    this.validationResults.performanceMetrics.averageResponseTime = 
      this.validationResults.performanceMetrics.totalRequestTime / totalRequests;
  }

  /**
   * Run comprehensive validation of all California ZIP codes
   */
  async validateAllCaliforniaZipCodes(options = {}) {
    const {
      apiEndpoint = 'http://localhost:3008/api/auth/verify-zip',
      batchSize = 50,
      delayBetweenBatches = 1000,
      saveIntermediateResults = true
    } = options;

    console.log('🔍 Starting comprehensive California ZIP code validation...\n');
    console.log('📊 Generating complete list of California ZIP codes...');

    const allZipCodes = this.generateAllCaliforniaZipCodes();
    this.validationResults.totalZipCodes = allZipCodes.length;

    console.log(`✅ Found ${allZipCodes.length} California ZIP codes to validate\n`);
    console.log('🚀 Beginning systematic validation...\n');

    const results = [];
    let processedCount = 0;

    // Process in batches to manage load
    for (let i = 0; i < allZipCodes.length; i += batchSize) {
      const batch = allZipCodes.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allZipCodes.length / batchSize);

      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch[0]} - ${batch[batch.length - 1]})`);

      const batchPromises = batch.map(zipCode => this.validateSingleZipCode(zipCode, apiEndpoint));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);
      processedCount += batch.length;
      this.validationResults.validatedZipCodes = processedCount;

      // Progress reporting
      const progressPercent = ((processedCount / allZipCodes.length) * 100).toFixed(1);
      console.log(`   ✅ Batch completed - Progress: ${processedCount}/${allZipCodes.length} (${progressPercent}%)`);
      
      // Error summary for this batch
      const batchErrors = batchResults.filter(r => !r.success).length;
      const batchSuccesses = batchResults.filter(r => r.success).length;
      console.log(`   📈 Batch results: ${batchSuccesses} successes, ${batchErrors} failures\n`);

      // Save intermediate results if requested
      if (saveIntermediateResults && batchNumber % 10 === 0) {
        await this.saveIntermediateResults(results, batchNumber);
      }

      // Delay between batches to be respectful of API limits
      if (i + batchSize < allZipCodes.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log('🏁 Validation complete! Generating comprehensive report...\n');

    return this.generateComprehensiveReport(results);
  }

  /**
   * Save intermediate results during long validation runs
   */
  async saveIntermediateResults(results, batchNumber) {
    const filename = `california-zip-validation-intermediate-batch-${batchNumber}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    try {
      await fs.promises.writeFile(filepath, JSON.stringify({
        timestamp: new Date().toISOString(),
        batchNumber,
        resultsCount: results.length,
        validationResults: this.validationResults,
        sampleResults: results.slice(-10) // Last 10 results as sample
      }, null, 2));
      
      console.log(`   💾 Intermediate results saved: ${filename}`);
    } catch (error) {
      console.log(`   ⚠️  Failed to save intermediate results: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive validation report
   */
  generateComprehensiveReport(results) {
    const report = {
      executionTimestamp: new Date().toISOString(),
      summary: {
        totalZipCodesTested: this.validationResults.totalZipCodes,
        validatedSuccessfully: this.validationResults.validatedZipCodes,
        realDataConfirmed: this.validationResults.realDataConfirmed,
        placeholderDetections: this.validationResults.placeholderDetections,
        failedValidations: this.validationResults.failedValidations,
        successRate: ((this.validationResults.realDataConfirmed / this.validationResults.totalZipCodes) * 100).toFixed(2) + '%',
        placeholderRate: ((this.validationResults.placeholderDetections / this.validationResults.totalZipCodes) * 100).toFixed(2) + '%'
      },
      performanceMetrics: {
        averageResponseTime: Math.round(this.validationResults.performanceMetrics.averageResponseTime) + 'ms',
        fastestResponse: Math.round(this.validationResults.performanceMetrics.minResponseTime) + 'ms',
        slowestResponse: Math.round(this.validationResults.performanceMetrics.maxResponseTime) + 'ms',
        totalExecutionTime: Math.round(this.validationResults.performanceMetrics.totalRequestTime / 1000) + 's'
      },
      dataQualityAnalysis: {
        placeholderViolations: this.validationResults.placeholderViolations.length,
        geographicAccuracyIssues: this.validationResults.geographicAccuracyIssues.length,
        districtMappingErrors: this.validationResults.districtMappingErrors.length,
        totalErrors: this.validationResults.errors.length
      },
      criticalFindings: {
        placeholderViolations: this.validationResults.placeholderViolations,
        geographicAccuracyIssues: this.validationResults.geographicAccuracyIssues,
        districtMappingErrors: this.validationResults.districtMappingErrors,
        systemErrors: this.validationResults.errors
      },
      recommendations: this.generateRecommendations(),
      productionReadiness: this.assessProductionReadiness()
    };

    // Save full results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFilename = `california-zip-validation-report-${timestamp}.json`;
    const detailedResultsFilename = `california-zip-detailed-results-${timestamp}.json`;

    // Save report
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`📋 Validation report saved: ${reportFilename}`);

    // Save detailed results
    fs.writeFileSync(detailedResultsFilename, JSON.stringify({
      timestamp: new Date().toISOString(),
      detailedResults: results,
      validationMetrics: this.validationResults
    }, null, 2));
    console.log(`📊 Detailed results saved: ${detailedResultsFilename}`);

    // Print report to console
    this.printConsoleReport(report);

    return report;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.validationResults.placeholderDetections > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Placeholder data detected',
        description: `${this.validationResults.placeholderDetections} ZIP codes contain placeholder or "unknown" values`,
        action: 'Replace all placeholder data with real geographic information from authoritative sources'
      });
    }

    if (this.validationResults.geographicAccuracyIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Geographic accuracy problems',
        description: `${this.validationResults.geographicAccuracyIssues.length} ZIP codes have geographic data outside California bounds`,
        action: 'Verify and correct coordinate data using official USPS and Census sources'
      });
    }

    if (this.validationResults.districtMappingErrors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Invalid district mappings',
        description: `${this.validationResults.districtMappingErrors.length} ZIP codes have invalid congressional or state district assignments`,
        action: 'Update district mapping data with current redistricting information'
      });
    }

    const avgResponseTime = this.validationResults.performanceMetrics.averageResponseTime;
    if (avgResponseTime > 2000) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Performance optimization needed',
        description: `Average response time of ${Math.round(avgResponseTime)}ms exceeds 2-second threshold`,
        action: 'Implement caching, database optimization, or API performance improvements'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'SUCCESS',
        issue: 'No critical issues found',
        description: 'All California ZIP codes return real, accurate geographic and political data',
        action: 'System is production-ready for California Phase 1 deployment'
      });
    }

    return recommendations;
  }

  /**
   * Assess production readiness based on validation results
   */
  assessProductionReadiness() {
    const successRate = (this.validationResults.realDataConfirmed / this.validationResults.totalZipCodes) * 100;
    const placeholderRate = (this.validationResults.placeholderDetections / this.validationResults.totalZipCodes) * 100;

    if (successRate >= 99.5 && placeholderRate === 0) {
      return {
        status: 'PRODUCTION_READY',
        confidence: 'EXCELLENT',
        message: 'System exceeds production quality standards with real data for all ZIP codes'
      };
    } else if (successRate >= 98 && placeholderRate < 1) {
      return {
        status: 'MOSTLY_READY',
        confidence: 'GOOD',
        message: 'Minor data quality issues should be resolved before production deployment'
      };
    } else if (successRate >= 95 && placeholderRate < 5) {
      return {
        status: 'NEEDS_IMPROVEMENT', 
        confidence: 'FAIR',
        message: 'Significant data quality issues must be addressed before production'
      };
    } else {
      return {
        status: 'NOT_READY',
        confidence: 'POOR',
        message: 'Critical data quality problems require immediate attention'
      };
    }
  }

  /**
   * Print formatted console report
   */
  printConsoleReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CALIFORNIA ZIP CODE VALIDATION REPORT - AGENT 35');
    console.log('='.repeat(80));

    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`   Total ZIP Codes Tested: ${report.summary.totalZipCodesTested}`);
    console.log(`   Real Data Confirmed: ${report.summary.realDataConfirmed}`);
    console.log(`   Success Rate: ${report.summary.successRate}`);
    console.log(`   Placeholder Detections: ${report.summary.placeholderDetections} (${report.summary.placeholderRate})`);
    console.log(`   Failed Validations: ${report.summary.failedValidations}`);

    console.log('\n⚡ PERFORMANCE METRICS:');
    console.log(`   Average Response Time: ${report.performanceMetrics.averageResponseTime}`);
    console.log(`   Fastest Response: ${report.performanceMetrics.fastestResponse}`);
    console.log(`   Slowest Response: ${report.performanceMetrics.slowestResponse}`);
    console.log(`   Total Execution Time: ${report.performanceMetrics.totalExecutionTime}`);

    console.log('\n🔍 DATA QUALITY ANALYSIS:');
    console.log(`   Placeholder Violations: ${report.dataQualityAnalysis.placeholderViolations}`);
    console.log(`   Geographic Accuracy Issues: ${report.dataQualityAnalysis.geographicAccuracyIssues}`);
    console.log(`   District Mapping Errors: ${report.dataQualityAnalysis.districtMappingErrors}`);
    console.log(`   System Errors: ${report.dataQualityAnalysis.totalErrors}`);

    console.log('\n🎯 PRODUCTION READINESS:');
    console.log(`   Status: ${report.productionReadiness.status}`);
    console.log(`   Confidence: ${report.productionReadiness.confidence}`);
    console.log(`   Assessment: ${report.productionReadiness.message}`);

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🏁 VALIDATION COMPLETE - AGENT 35 MISSION STATUS');
    console.log('='.repeat(80));

    // Mission success criteria check
    const missionSuccess = report.summary.placeholderDetections === 0 && 
                          parseFloat(report.summary.successRate) >= 99.5;

    if (missionSuccess) {
      console.log('✅ MISSION SUCCESS: All California ZIP codes return real, accurate data');
      console.log('🚀 California Phase 1 is ready for production deployment');
    } else {
      console.log('⚠️  MISSION INCOMPLETE: Placeholder data or accuracy issues detected');
      console.log('🔧 Data quality improvements required before production deployment');
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Quick validation test for a subset of ZIP codes
   */
  async runQuickValidationTest(testZipCodes = null) {
    if (!testZipCodes) {
      // Default quick test ZIP codes covering major regions
      testZipCodes = [
        '90210', '90001', '91101', // LA area
        '94102', '94301', '95014', // Bay Area
        '92101', '92037', '91910', // San Diego
        '95814', '93701', '93301', // Central Valley
        '92602', '92801', '92660', // Orange County
        '93401', '93101', '95060'  // Central Coast
      ];
    }

    console.log('🏃‍♂️ Running quick validation test on sample ZIP codes...\n');

    const results = [];
    for (const zipCode of testZipCodes) {
      const result = await this.validateSingleZipCode(zipCode);
      results.push(result);
      
      if (result.success && result.validation) {
        const status = result.validation.realDataConfirmed ? '✅' : '❌';
        const issues = result.validation.issues.length > 0 ? ` (${result.validation.issues.length} issues)` : '';
        console.log(`   ${status} ${zipCode}: ${result.data.city}, ${result.data.state}${issues}`);
      } else {
        console.log(`   ❌ ${zipCode}: ${result.error}`);
      }
    }

    const successes = results.filter(r => r.success && r.validation?.realDataConfirmed).length;
    const failures = results.filter(r => !r.success || !r.validation?.realDataConfirmed).length;

    console.log(`\n📊 Quick test results: ${successes}/${testZipCodes.length} passed (${((successes/testZipCodes.length)*100).toFixed(1)}%)`);
    
    if (successes === testZipCodes.length) {
      console.log('🎉 Quick test PASSED - sample data looks good for full validation');
    } else {
      console.log('⚠️  Quick test FAILED - data quality issues detected');
    }

    return results;
  }
}

// Export for use in other modules
module.exports = CaliforniaZipValidationFramework;

// CLI execution
if (require.main === module) {
  const framework = new CaliforniaZipValidationFramework();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'quick';

  async function main() {
    try {
      if (command === 'quick') {
        await framework.runQuickValidationTest();
      } else if (command === 'full') {
        await framework.validateAllCaliforniaZipCodes();
      } else if (command === 'generate') {
        const allZips = framework.generateAllCaliforniaZipCodes();
        console.log(`Generated ${allZips.length} California ZIP codes`);
        console.log('Sample:', allZips.slice(0, 20).join(', '));
      } else {
        console.log('Usage: node california-zip-validation-framework.js [quick|full|generate]');
        console.log('  quick: Run validation test on sample ZIP codes');
        console.log('  full:  Run complete validation of all California ZIP codes');  
        console.log('  generate: Generate list of all California ZIP codes');
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  main();
}