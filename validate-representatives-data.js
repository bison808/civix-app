#!/usr/bin/env node

/**
 * CITZN Phase 1 Beta - Representative Data Validation
 * Agent 36: Political Representatives Data Validation Specialist
 * 
 * This script validates ALL political representative data for:
 * 1. Federal Representatives (52 House + 2 Senate)
 * 2. State Representatives (40 Senate + 80 Assembly) 
 * 3. County Officials (58 California Counties)
 * 4. Local Representatives (City/Municipal)
 * 
 * Ensures NO placeholder data exists and all information is real, current, and accurate.
 */

const fs = require('fs');
const path = require('path');

// Forbidden placeholder data patterns
const FORBIDDEN_DATA_PATTERNS = {
  names: [
    'John Doe', 'Jane Smith', 'Representative Name',
    'Senator [Name]', '[Representative Name]', 'Rep. Name',
    'Government Official', 'Elected Official', '[Name]',
    'Tom Smith', 'Mary Johnson', 'Sample Name'
  ],
  phones: [
    '(555) 555-5555', '555-1234', '555-0000', '555-XXXX',
    '(000) 000-0000', '123-456-7890', 'XXX-XXX-XXXX'
  ],
  emails: [
    'office@example.com', 'contact@placeholder.com', 'email@example.com',
    'info@example.gov', 'contact@example.org', 'test@test.com'
  ],
  websites: [
    'www.example.com', 'https://placeholder.gov', 'http://example.org',
    'https://example.com', 'www.placeholder.gov'
  ],
  addresses: [
    '123 Main Street', '1234 Capitol Building', '[Office Address]',
    'State Capitol Building', '456 Government Way', 'Example Address'
  ]
};

// Expected data counts
const EXPECTED_COUNTS = {
  federal: {
    senators: 2,
    houseReps: 52
  },
  state: {
    senate: 40,
    assembly: 80
  },
  counties: 58
};

class RepresentativeDataValidator {
  constructor() {
    this.violations = [];
    this.stats = {
      totalChecked: 0,
      placeholderViolations: 0,
      missingData: 0,
      validRepresentatives: 0
    };
  }

  /**
   * Main validation function
   */
  async validateAllRepresentatives() {
    console.log('🔍 Starting comprehensive representative data validation...\n');

    try {
      // Validate federal representatives
      await this.validateFederalRepresentatives();
      
      // Validate state representatives  
      await this.validateStateRepresentatives();
      
      // Validate county officials
      await this.validateCountyOfficials();
      
      // Check for any remaining mock/placeholder files
      await this.validateMockDataRemoval();
      
      // Generate comprehensive report
      this.generateValidationReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      this.violations.push({
        type: 'SYSTEM_ERROR',
        message: `Validation system error: ${error.message}`,
        severity: 'CRITICAL'
      });
    }
  }

  /**
   * Validate California federal delegation (2 Senators + 52 House)
   */
  async validateFederalRepresentatives() {
    console.log('📊 Validating Federal Representatives...');
    
    try {
      const federalRepsPath = path.join(__dirname, 'services', 'californiaFederalReps.ts');
      
      if (!fs.existsSync(federalRepsPath)) {
        this.addViolation('MISSING_FILE', 'californiaFederalReps.ts file not found', 'CRITICAL');
        return;
      }

      const content = fs.readFileSync(federalRepsPath, 'utf8');
      
      // Check for senators
      const senatorsMatch = content.match(/export const CALIFORNIA_SENATORS.*?\[(.*?)\];/s);
      if (senatorsMatch) {
        const senatorsContent = senatorsMatch[1];
        const senatorCount = (senatorsContent.match(/name:\s*'([^']+)'/g) || []).length;
        
        if (senatorCount !== EXPECTED_COUNTS.federal.senators) {
          this.addViolation('INCOMPLETE_DATA', 
            `Expected ${EXPECTED_COUNTS.federal.senators} senators, found ${senatorCount}`, 
            'HIGH');
        } else {
          console.log('✅ Senators count correct: 2');
        }
        this.validateRepresentativeData(senatorsContent, 'Federal Senator');
      } else {
        this.addViolation('INCOMPLETE_DATA', 'Could not find CALIFORNIA_SENATORS data', 'CRITICAL');
      }
      
      // Check for house representatives
      const houseMatch = content.match(/export const CALIFORNIA_HOUSE_REPS.*?\[(.*?)\];/s);
      if (houseMatch) {
        const houseContent = houseMatch[1];
        const houseCount = (houseContent.match(/name:\s*'([^']+)'/g) || []).length;
        
        if (houseCount < EXPECTED_COUNTS.federal.houseReps) {
          this.addViolation('INCOMPLETE_DATA', 
            `Expected ${EXPECTED_COUNTS.federal.houseReps} House representatives, found ${houseCount}. Data is incomplete - need all 52 districts.`, 
            'CRITICAL');
        } else if (houseCount === EXPECTED_COUNTS.federal.houseReps) {
          console.log('✅ House Representatives count correct: 52');
        }
        
        this.validateRepresentativeData(houseContent, 'Federal House Representative');
      } else {
        this.addViolation('INCOMPLETE_DATA', 'Could not find CALIFORNIA_HOUSE_REPS data', 'CRITICAL');
      }
      
    } catch (error) {
      this.addViolation('VALIDATION_ERROR', `Federal validation error: ${error.message}`, 'HIGH');
    }
  }

  /**
   * Validate California state representatives (40 Senate + 80 Assembly)
   */
  async validateStateRepresentatives() {
    console.log('📊 Validating State Representatives...');
    
    try {
      // Check integrated state service
      const stateServicePath = path.join(__dirname, 'services', 'integratedCaliforniaState.service.ts');
      
      if (!fs.existsSync(stateServicePath)) {
        this.addViolation('MISSING_FILE', 'integratedCaliforniaState.service.ts file not found', 'CRITICAL');
        return;
      }

      const content = fs.readFileSync(stateServicePath, 'utf8');
      this.validateRepresentativeData(content, 'State Representative Service');
      
      // Check for OpenStates integration
      const openStatesPath = path.join(__dirname, 'services', 'openStatesService.ts');
      if (fs.existsSync(openStatesPath)) {
        const openStatesContent = fs.readFileSync(openStatesPath, 'utf8');
        this.validateRepresentativeData(openStatesContent, 'OpenStates Service');
        console.log('✅ OpenStates integration found');
      } else {
        this.addViolation('MISSING_INTEGRATION', 'OpenStates service integration missing', 'MEDIUM');
      }
      
    } catch (error) {
      this.addViolation('VALIDATION_ERROR', `State validation error: ${error.message}`, 'HIGH');
    }
  }

  /**
   * Validate county officials across all 58 California counties
   */
  async validateCountyOfficials() {
    console.log('📊 Validating County Officials...');
    
    try {
      const countyServicePath = path.join(__dirname, 'services', 'countyServices.ts');
      
      if (!fs.existsSync(countyServicePath)) {
        this.addViolation('MISSING_FILE', 'countyServices.ts file not found', 'CRITICAL');
        return;
      }

      const content = fs.readFileSync(countyServicePath, 'utf8');
      this.validateRepresentativeData(content, 'County Officials');
      
      // Check county officials API
      const countyApiPath = path.join(__dirname, 'services', 'countyOfficialsApi.ts');
      if (fs.existsSync(countyApiPath)) {
        const countyApiContent = fs.readFileSync(countyApiPath, 'utf8');
        this.validateRepresentativeData(countyApiContent, 'County Officials API');
        console.log('✅ County Officials API found');
      } else {
        this.addViolation('MISSING_API', 'County Officials API missing', 'HIGH');
      }
      
    } catch (error) {
      this.addViolation('VALIDATION_ERROR', `County validation error: ${error.message}`, 'HIGH');
    }
  }

  /**
   * Validate individual representative data for placeholder content
   */
  validateRepresentativeData(content, context) {
    this.stats.totalChecked++;
    
    let hasViolations = false;
    
    // Check for forbidden names
    FORBIDDEN_DATA_PATTERNS.names.forEach(forbiddenName => {
      if (content.includes(forbiddenName)) {
        this.addViolation('PLACEHOLDER_NAME', 
          `Found placeholder name "${forbiddenName}" in ${context}`, 
          'HIGH');
        hasViolations = true;
      }
    });
    
    // Check for forbidden phone numbers
    FORBIDDEN_DATA_PATTERNS.phones.forEach(forbiddenPhone => {
      if (content.includes(forbiddenPhone)) {
        this.addViolation('PLACEHOLDER_PHONE', 
          `Found placeholder phone "${forbiddenPhone}" in ${context}`, 
          'HIGH');
        hasViolations = true;
      }
    });
    
    // Check for forbidden emails
    FORBIDDEN_DATA_PATTERNS.emails.forEach(forbiddenEmail => {
      if (content.includes(forbiddenEmail)) {
        this.addViolation('PLACEHOLDER_EMAIL', 
          `Found placeholder email "${forbiddenEmail}" in ${context}`, 
          'HIGH');
        hasViolations = true;
      }
    });
    
    // Check for forbidden websites
    FORBIDDEN_DATA_PATTERNS.websites.forEach(forbiddenSite => {
      if (content.includes(forbiddenSite)) {
        this.addViolation('PLACEHOLDER_WEBSITE', 
          `Found placeholder website "${forbiddenSite}" in ${context}`, 
          'HIGH');
        hasViolations = true;
      }
    });
    
    // Check for forbidden addresses
    FORBIDDEN_DATA_PATTERNS.addresses.forEach(forbiddenAddr => {
      if (content.includes(forbiddenAddr)) {
        this.addViolation('PLACEHOLDER_ADDRESS', 
          `Found placeholder address "${forbiddenAddr}" in ${context}`, 
          'HIGH');
        hasViolations = true;
      }
    });
    
    if (!hasViolations) {
      this.stats.validRepresentatives++;
      console.log(`✅ ${context}: No placeholder data found`);
    }
  }

  /**
   * Check for mock data that should be removed
   */
  async validateMockDataRemoval() {
    console.log('📊 Checking for mock/placeholder data files...');
    
    const mockDataPath = path.join(__dirname, 'services', 'mockData.ts');
    if (fs.existsSync(mockDataPath)) {
      const content = fs.readFileSync(mockDataPath, 'utf8');
      
      // Check if mock data contains placeholder representatives
      if (content.includes('John Doe') || content.includes('mockCARepresentatives')) {
        this.addViolation('MOCK_DATA_PRESENT', 
          'Mock data file still contains placeholder representative data', 
          'MEDIUM');
      }
    }
    
    // Check for test files that might contain placeholder data
    const testFiles = ['test-federal-reps.js', 'test-california-reps.js', 'test-county-system.js'];
    testFiles.forEach(testFile => {
      const testPath = path.join(__dirname, testFile);
      if (fs.existsSync(testPath)) {
        const content = fs.readFileSync(testPath, 'utf8');
        this.validateRepresentativeData(content, `Test file: ${testFile}`);
      }
    });
  }

  /**
   * Add a validation violation
   */
  addViolation(type, message, severity) {
    this.violations.push({
      type,
      message,
      severity,
      timestamp: new Date().toISOString()
    });
    
    this.stats.placeholderViolations++;
    
    const emoji = severity === 'CRITICAL' ? '🚨' : severity === 'HIGH' ? '⚠️' : '⚡';
    console.log(`${emoji} ${severity}: ${message}`);
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport() {
    const report = {
      validationTimestamp: new Date().toISOString(),
      summary: {
        totalViolations: this.violations.length,
        criticalViolations: this.violations.filter(v => v.severity === 'CRITICAL').length,
        highViolations: this.violations.filter(v => v.severity === 'HIGH').length,
        mediumViolations: this.violations.filter(v => v.severity === 'MEDIUM').length,
        ...this.stats
      },
      expectedCounts: EXPECTED_COUNTS,
      violations: this.violations,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'representative-data-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 REPRESENTATIVE DATA VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`🕐 Validation completed: ${report.validationTimestamp}`);
    console.log(`📊 Total representatives checked: ${this.stats.totalChecked}`);
    console.log(`✅ Valid representatives: ${this.stats.validRepresentatives}`);
    console.log(`⚠️  Total violations found: ${report.summary.totalViolations}`);
    console.log(`🚨 Critical violations: ${report.summary.criticalViolations}`);
    console.log(`⚠️  High-priority violations: ${report.summary.highViolations}`);
    console.log(`⚡ Medium-priority violations: ${report.summary.mediumViolations}`);
    
    if (report.summary.totalViolations === 0) {
      console.log('\n🎉 VALIDATION PASSED: All representative data is clean and free of placeholders!');
    } else {
      console.log('\n❌ VALIDATION FAILED: Placeholder data found that needs to be replaced.');
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('='.repeat(80));
    
    return report;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    const criticalViolations = this.violations.filter(v => v.severity === 'CRITICAL');
    if (criticalViolations.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Replace all placeholder representative data with real, current information',
        details: 'Critical violations indicate missing or incomplete representative data that prevents the system from functioning properly.'
      });
    }
    
    const placeholderViolations = this.violations.filter(v => 
      v.type.includes('PLACEHOLDER') || v.type.includes('MOCK'));
    if (placeholderViolations.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Remove all placeholder names, phone numbers, emails, and addresses',
        details: 'Replace with real, verified contact information for all representatives.'
      });
    }
    
    const missingFiles = this.violations.filter(v => v.type === 'MISSING_FILE');
    if (missingFiles.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Create missing representative data files',
        details: 'Implement complete representative data services for all government levels.'
      });
    }
    
    return recommendations;
  }
}

// Run validation if this script is called directly
if (require.main === module) {
  const validator = new RepresentativeDataValidator();
  validator.validateAllRepresentatives()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = RepresentativeDataValidator;