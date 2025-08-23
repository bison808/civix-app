#!/usr/bin/env node

/**
 * Data Structure Validation Script
 * Validates all data structures in the political mapping system
 * Checks for duplicates, missing properties, and schema compliance
 */

const fs = require('fs');
const path = require('path');

class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesChecked: 0,
      objectsValidated: 0,
      duplicatesFound: 0,
      schemaViolations: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  addError(error) {
    this.errors.push(error);
    this.log(error, 'error');
  }

  addWarning(warning) {
    this.warnings.push(warning);
    this.log(warning, 'warning');
  }

  /**
   * Check for duplicate entries in Record objects
   */
  checkForDuplicates(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Look for object literal patterns
      let inObject = false;
      let objectType = '';
      let currentKeys = new Set();
      let braceLevel = 0;
      let startLine = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect start of Record object
        if (line.includes('Record<string,') && line.includes('= {')) {
          inObject = true;
          currentKeys.clear();
          braceLevel = 1;
          startLine = i + 1;
          objectType = line.split('=')[0].trim();
          continue;
        }

        if (inObject) {
          // Count braces to track nesting
          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          braceLevel += openBraces - closeBraces;

          // Extract keys (city names, county names, etc.)
          const keyMatch = line.match(/^\s*['"']([^'"']+)['"']\s*:/);
          if (keyMatch) {
            const key = keyMatch[1];
            if (currentKeys.has(key)) {
              this.addError(
                `DUPLICATE KEY found in ${filePath}:${i + 1} - "${key}" already exists in ${objectType}`
              );
              this.stats.duplicatesFound++;
            } else {
              currentKeys.add(key);
            }
          }

          // End of object
          if (braceLevel <= 0) {
            inObject = false;
            this.log(
              `Validated ${objectType} in ${path.basename(filePath)} - ${currentKeys.size} keys, no duplicates`
            );
            this.stats.objectsValidated++;
          }
        }
      }

      this.stats.filesChecked++;
    } catch (error) {
      this.addError(`Error reading ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validate specific data types and structures
   */
  validateDataStructures(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);

      // Check for specific structure requirements
      if (fileName === 'municipalApi.ts') {
        this.validateMunicipalData(content, filePath);
      } else if (fileName === 'countyMappingService.ts') {
        this.validateCountyData(content, filePath);
      } else if (fileName === 'californiaStateApi.ts') {
        this.validateStateData(content, filePath);
      }

    } catch (error) {
      this.addError(`Error validating ${filePath}: ${error.message}`);
    }
  }

  validateMunicipalData(content, filePath) {
    const lines = content.split('\n');
    
    // Check for required interfaces
    const requiredInterfaces = [
      'CityInfo',
      'MunicipalOfficial', 
      'CityOfficials',
      'SchoolDistrict',
      'SpecialDistrict'
    ];

    for (const interfaceName of requiredInterfaces) {
      if (!content.includes(`interface ${interfaceName}`)) {
        this.addError(`Missing required interface ${interfaceName} in ${filePath}`);
        this.stats.schemaViolations++;
      }
    }

    // Check for required data objects
    const requiredObjects = [
      'CALIFORNIA_MAJOR_CITIES',
      'CALIFORNIA_CITY_OFFICIALS'
    ];

    for (const objectName of requiredObjects) {
      if (!content.includes(`${objectName}:`)) {
        this.addError(`Missing required data object ${objectName} in ${filePath}`);
        this.stats.schemaViolations++;
      }
    }

    // Validate city name consistency between objects
    this.validateCityNameConsistency(content, filePath);
  }

  validateCityNameConsistency(content, filePath) {
    const cityPattern = /['"']([^'"']+)['"']\s*:\s*{/g;
    let match;
    const majorCities = new Set();
    const officialCities = new Set();
    let inMajorCities = false;
    let inOfficials = false;

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('CALIFORNIA_MAJOR_CITIES')) {
        inMajorCities = true;
        inOfficials = false;
        continue;
      } else if (line.includes('CALIFORNIA_CITY_OFFICIALS')) {
        inMajorCities = false;
        inOfficials = true;
        continue;
      }

      const cityMatch = line.match(/^\s*['"']([^'"']+)['"']\s*:/);
      if (cityMatch) {
        const cityName = cityMatch[1];
        if (inMajorCities) {
          majorCities.add(cityName);
        } else if (inOfficials) {
          officialCities.add(cityName);
        }
      }
    }

    // Check for cities with officials but no basic info
    for (const city of officialCities) {
      if (!majorCities.has(city)) {
        this.addWarning(
          `City "${city}" has officials data but no entry in CALIFORNIA_MAJOR_CITIES in ${filePath}`
        );
      }
    }

    // Check for cities with basic info but no officials
    for (const city of majorCities) {
      if (!officialCities.has(city)) {
        this.addWarning(
          `City "${city}" has basic info but no officials data in CALIFORNIA_CITY_OFFICIALS in ${filePath}`
        );
      }
    }
  }

  validateCountyData(content, filePath) {
    // Check for required county data structures
    if (!content.includes('CALIFORNIA_COUNTY_ZIP_MAPPING')) {
      this.addError(`Missing CALIFORNIA_COUNTY_ZIP_MAPPING in ${filePath}`);
      this.stats.schemaViolations++;
    }

    if (!content.includes('CALIFORNIA_COUNTIES')) {
      this.addError(`Missing CALIFORNIA_COUNTIES array in ${filePath}`);
      this.stats.schemaViolations++;
    }
  }

  validateStateData(content, filePath) {
    // Check for state representative data completeness
    const requiredFunctions = [
      'getGovernorInfo',
      'getLieutenantGovernor',
      'getAssemblyMember',
      'getStateSenator'
    ];

    for (const funcName of requiredFunctions) {
      if (!content.includes(funcName)) {
        this.addWarning(`Missing function ${funcName} in ${filePath}`);
      }
    }
  }

  /**
   * Run comprehensive validation
   */
  async runValidation() {
    this.log('Starting comprehensive data validation...');
    
    const serviceFiles = [
      'services/municipalApi.ts',
      'services/countyMappingService.ts',
      'services/californiaStateApi.ts',
      'services/zipDistrictMapping.ts',
      'services/countyOfficialsApi.ts',
      'services/schoolDistrictApi.ts'
    ];

    for (const filePath of serviceFiles) {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (fs.existsSync(fullPath)) {
        this.log(`Validating ${filePath}...`);
        this.checkForDuplicates(fullPath);
        this.validateDataStructures(fullPath);
      } else {
        this.addWarning(`File not found: ${filePath}`);
      }
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('DATA VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log('\nSTATISTICS:');
    console.log(`- Files checked: ${this.stats.filesChecked}`);
    console.log(`- Objects validated: ${this.stats.objectsValidated}`);
    console.log(`- Duplicates found: ${this.stats.duplicatesFound}`);
    console.log(`- Schema violations: ${this.stats.schemaViolations}`);
    
    if (this.errors.length > 0) {
      console.log(`\nERRORS (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\nWARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('✅ DATA VALIDATION PASSED - No critical errors found');
      return true;
    } else {
      console.log('❌ DATA VALIDATION FAILED - Critical errors found');
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DataValidator();
  validator.runValidation().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DataValidator;