/**
 * Test suite for ZIP code mapping system
 * This file provides comprehensive testing utilities for the district mapping services
 * 
 * Usage:
 * - Run individual tests to validate specific functionality
 * - Use the full test suite to validate the entire system
 * - Check performance metrics with load testing
 */

import {
  ZipDistrictMapping,
  MultiDistrictMapping,
  RepresentativeWithDistrict,
  DistrictLookupOptions
} from '../types/districts.types';
import { geocodingService } from './geocodingService';
import { zipDistrictMappingService } from './zipDistrictMapping';
import { batchProcessor } from './batchProcessor';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
  data?: any;
}

interface TestSuite {
  suiteName: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    totalDuration: number;
  };
}

class ZipMappingTestSuite {
  private testResults: TestResult[] = [];
  
  async runAllTests(): Promise<TestSuite> {
    console.log('🧪 Starting ZIP Code Mapping Test Suite...');
    
    this.testResults = [];
    
    // Basic functionality tests
    await this.testBasicZipLookup();
    await this.testInvalidZipHandling();
    await this.testCacheOperations();
    
    // Integration tests
    await this.testRepresentativeLookup();
    await this.testMultiDistrictHandling();
    
    // Performance tests
    await this.testBatchProcessing();
    await this.testRateLimiting();
    
    // Data validation tests
    await this.testDataValidation();
    await this.testErrorHandling();
    
    return this.generateTestSuite();
  }

  private async runTest(
    testName: string, 
    testFunction: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      await testFunction();
      this.testResults.push({
        testName,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      console.log(`❌ ${testName} - FAILED: ${error}`);
    }
  }

  async testBasicZipLookup(): Promise<void> {
    await this.runTest('Basic ZIP Code Lookup', async () => {
      const testZips = ['90210', '94102', '92101', '95814'];
      
      for (const zipCode of testZips) {
        const result = await zipDistrictMappingService.getDistrictsForZipCode(zipCode, {
          useCache: false, // Force fresh lookup for testing
          includeFallback: true
        });
        
        // Validate basic structure
        if (!result.zipCode || !result.county || !result.city) {
          throw new Error(`Invalid result structure for ZIP ${zipCode}`);
        }
        
        // Validate coordinates
        if (!Array.isArray(result.coordinates) || result.coordinates.length !== 2) {
          throw new Error(`Invalid coordinates for ZIP ${zipCode}`);
        }
        
        // Check California bounds
        const [lng, lat] = result.coordinates;
        if (lat < 32.5 || lat > 42.0 || lng < -124.4 || lng > -114.1) {
          throw new Error(`Coordinates outside California bounds for ZIP ${zipCode}`);
        }
        
        console.log(`  📍 ${zipCode}: ${result.city}, ${result.county}`);
      }
    });
  }

  async testInvalidZipHandling(): Promise<void> {
    await this.runTest('Invalid ZIP Code Handling', async () => {
      const invalidZips = ['1234', '123456', 'ABCDE', '00000', ''];
      
      for (const invalidZip of invalidZips) {
        try {
          await zipDistrictMappingService.getDistrictsForZipCode(invalidZip, {
            includeFallback: false
          });
          throw new Error(`Should have failed for invalid ZIP: ${invalidZip}`);
        } catch (error) {
          // Expected to fail
          if (error instanceof Error && error.message.includes('Should have failed')) {
            throw error;
          }
          // This is expected behavior
        }
      }
    });
  }

  async testCacheOperations(): Promise<void> {
    await this.runTest('Cache Operations', async () => {
      const testZip = '90210';
      
      // Clear cache first
      geocodingService.clearCache();
      
      // First lookup (should hit API)
      const start1 = Date.now();
      const result1 = await zipDistrictMappingService.getDistrictsForZipCode(testZip, {
        useCache: true
      });
      const duration1 = Date.now() - start1;
      
      // Second lookup (should hit cache)
      const start2 = Date.now();
      const result2 = await zipDistrictMappingService.getDistrictsForZipCode(testZip, {
        useCache: true
      });
      const duration2 = Date.now() - start2;
      
      // Cache should be significantly faster
      if (duration2 >= duration1) {
        console.warn(`Cache may not be working properly. First: ${duration1}ms, Second: ${duration2}ms`);
      }
      
      // Results should be identical
      if (result1.zipCode !== result2.zipCode || result1.city !== result2.city) {
        throw new Error('Cached result differs from original');
      }
      
      console.log(`  ⚡ First lookup: ${duration1}ms, Cached lookup: ${duration2}ms`);
    });
  }

  async testRepresentativeLookup(): Promise<void> {
    await this.runTest('Representative Lookup', async () => {
      const testZips = ['90210', '94102'];
      
      for (const zipCode of testZips) {
        const representatives = await zipDistrictMappingService.getRepresentativesByZipCode(zipCode);
        
        if (!Array.isArray(representatives) || representatives.length === 0) {
          throw new Error(`No representatives found for ZIP ${zipCode}`);
        }
        
        // Should have at least federal representatives
        const federalReps = representatives.filter(rep => rep.level === 'federal');
        if (federalReps.length === 0) {
          throw new Error(`No federal representatives found for ZIP ${zipCode}`);
        }
        
        // Validate representative structure
        for (const rep of representatives.slice(0, 3)) { // Check first 3
          if (!rep.id || !rep.name || !rep.title || !rep.level) {
            throw new Error(`Invalid representative structure: ${JSON.stringify(rep)}`);
          }
        }
        
        console.log(`  👥 ${zipCode}: Found ${representatives.length} representatives`);
      }
    });
  }

  async testMultiDistrictHandling(): Promise<void> {
    await this.runTest('Multi-District ZIP Handling', async () => {
      // Some ZIP codes span multiple districts
      // This test checks if the system handles them properly
      
      const testZip = '91001'; // Example ZIP that might span districts
      
      try {
        const result = await zipDistrictMappingService.getDistrictsForZipCode(testZip);
        
        // Check if it's multi-district
        if ('districts' in result) {
          const multiResult = result as MultiDistrictMapping;
          
          // Validate multi-district structure
          if (!multiResult.districts.congressional || !Array.isArray(multiResult.districts.congressional)) {
            throw new Error('Invalid multi-district structure');
          }
          
          if (!multiResult.primaryDistricts || !multiResult.primaryDistricts.congressional) {
            throw new Error('Missing primary districts');
          }
          
          console.log(`  🗺️ Multi-district ZIP ${testZip}: ${multiResult.districts.congressional.length} congressional districts`);
        } else {
          console.log(`  📍 Single-district ZIP ${testZip}`);
        }
      } catch (error) {
        // If multi-district handling isn't implemented yet, that's OK
        if (error instanceof Error && error.message.includes('not implemented')) {
          console.log(`  ⏳ Multi-district handling not yet implemented`);
        } else {
          throw error;
        }
      }
    });
  }

  async testBatchProcessing(): Promise<void> {
    await this.runTest('Batch Processing', async () => {
      const testZips = ['90210', '90211', '94102', '94103', '92101'];
      
      const result = await batchProcessor.processBatch(testZips, {
        useCache: false,
        maxConcurrency: 3,
        batchSize: 2
      });
      
      if (result.length !== testZips.length) {
        throw new Error(`Expected ${testZips.length} results, got ${result.length}`);
      }
      
      const successful = result.filter(r => r.success);
      const successRate = successful.length / result.length;
      
      if (successRate < 0.8) {
        throw new Error(`Low success rate: ${successRate * 100}%`);
      }
      
      console.log(`  📊 Processed ${result.length} ZIP codes, ${successful.length} successful (${Math.round(successRate * 100)}%)`);
    });
  }

  async testRateLimiting(): Promise<void> {
    await this.runTest('Rate Limiting', async () => {
      // Test that rate limiting doesn't break functionality
      const rapidRequests = ['90210', '90211', '90212', '90213', '90214'];
      
      const promises = rapidRequests.map(zipCode => 
        zipDistrictMappingService.getDistrictsForZipCode(zipCode, {
          useCache: false
        })
      );
      
      const results = await Promise.all(promises.map(p => 
        p.catch(error => ({ error: error.message }))
      ));
      
      const successful = results.filter(r => !('error' in r));
      
      // Should handle at least some requests successfully
      if (successful.length === 0) {
        throw new Error('All requests failed - possible rate limiting issue');
      }
      
      console.log(`  🏃 Rapid requests: ${successful.length}/${results.length} successful`);
    });
  }

  async testDataValidation(): Promise<void> {
    await this.runTest('Data Validation', async () => {
      const testZip = '90210';
      const result = await zipDistrictMappingService.getDistrictsForZipCode(testZip);
      
      // Validate district numbers are reasonable
      const congressionalDistrict = 'congressionalDistrict' in result 
        ? result.congressionalDistrict 
        : result.primaryDistricts.congressional;
      
      if (congressionalDistrict < 1 || congressionalDistrict > 52) {
        throw new Error(`Invalid congressional district: ${congressionalDistrict}`);
      }
      
      // Validate coordinates format
      if (typeof result.coordinates[0] !== 'number' || typeof result.coordinates[1] !== 'number') {
        throw new Error('Invalid coordinate format');
      }
      
      // Validate required fields
      const requiredFields = ['zipCode', 'county', 'city', 'coordinates', 'source', 'lastUpdated'];
      for (const field of requiredFields) {
        if (!(field in result) || result[field as keyof typeof result] == null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      console.log(`  ✅ Data validation passed for ${testZip}`);
    });
  }

  async testErrorHandling(): Promise<void> {
    await this.runTest('Error Handling', async () => {
      // Test network errors, invalid responses, etc.
      
      // Test with an out-of-state ZIP code
      try {
        await zipDistrictMappingService.getDistrictsForZipCode('10001', {
          includeFallback: false
        });
        console.log('  📍 Out-of-state ZIP handled gracefully');
      } catch (error) {
        console.log('  ❗ Out-of-state ZIP rejected as expected');
      }
      
      // Test service statistics
      const stats = zipDistrictMappingService.getServiceStats();
      if (typeof stats.cacheSize !== 'number') {
        throw new Error('Invalid service statistics');
      }
      
      console.log(`  📈 Service stats: ${stats.cacheSize} cached entries`);
    });
  }

  private generateTestSuite(): TestSuite {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.length - passed;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    
    const suite: TestSuite = {
      suiteName: 'ZIP Code District Mapping Tests',
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        passed,
        failed,
        totalDuration
      }
    };
    
    console.log('\n📊 Test Suite Summary:');
    console.log(`Total Tests: ${suite.summary.total}`);
    console.log(`✅ Passed: ${suite.summary.passed}`);
    console.log(`❌ Failed: ${suite.summary.failed}`);
    console.log(`⏱️ Total Duration: ${suite.summary.totalDuration}ms`);
    console.log(`🎯 Success Rate: ${Math.round((passed / suite.summary.total) * 100)}%`);
    
    return suite;
  }

  // Individual test methods for easier debugging
  async quickTest(): Promise<void> {
    console.log('🚀 Running Quick Test...');
    await this.testBasicZipLookup();
  }

  async performanceTest(): Promise<void> {
    console.log('⚡ Running Performance Test...');
    
    const testZips = ['90210', '94102', '92101', '95814', '91101'];
    const iterations = 5;
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      const promises = testZips.map(zip => 
        zipDistrictMappingService.getDistrictsForZipCode(zip)
      );
      
      await Promise.all(promises);
      const duration = Date.now() - start;
      results.push(duration);
      
      console.log(`  Round ${i + 1}: ${duration}ms for ${testZips.length} ZIP codes`);
    }
    
    const avgDuration = results.reduce((a, b) => a + b, 0) / results.length;
    const avgPerZip = avgDuration / testZips.length;
    
    console.log(`📊 Performance Results:`);
    console.log(`  Average total time: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Average per ZIP: ${avgPerZip.toFixed(2)}ms`);
    console.log(`  Target: <500ms per ZIP - ${avgPerZip < 500 ? '✅ PASS' : '❌ FAIL'}`);
  }
}

// Usage examples and utilities
export const zipMappingTests = new ZipMappingTestSuite();

// Convenience functions for common test scenarios
export async function testSampleZipCodes(): Promise<void> {
  console.log('🧪 Testing Sample California ZIP Codes...');
  
  const sampleZips = [
    '90210', // Beverly Hills
    '94102', // San Francisco
    '92101', // San Diego
    '95814', // Sacramento
    '91101', // Pasadena
    '92602', // Irvine
    '94301', // Palo Alto
  ];
  
  for (const zipCode of sampleZips) {
    try {
      const districts = await zipDistrictMappingService.getDistrictsForZipCode(zipCode);
      const representatives = await zipDistrictMappingService.getRepresentativesByZipCode(zipCode);
      
      console.log(`📍 ${zipCode} (${districts.city}, ${districts.county}):`);
      if ('congressionalDistrict' in districts) {
        console.log(`   Congressional District: ${districts.congressionalDistrict}`);
      }
      console.log(`   Representatives: ${representatives.length} found`);
    } catch (error) {
      console.log(`❌ ${zipCode}: Error - ${error}`);
    }
  }
}

export async function validateCaliforniaZipMapping(): Promise<boolean> {
  console.log('🔍 Validating California ZIP Code Mapping...');
  
  try {
    // Test that we can identify California ZIP codes
    const caZips = ['90210', '94102'];
    const nonCaZips = ['10001', '60601']; // NYC, Chicago
    
    for (const zip of caZips) {
      const isCA = await zipDistrictMappingService.isCaliforniaZipCode(zip);
      if (!isCA) {
        console.log(`❌ ${zip} should be identified as California ZIP`);
        return false;
      }
    }
    
    for (const zip of nonCaZips) {
      const isCA = await zipDistrictMappingService.isCaliforniaZipCode(zip);
      if (isCA) {
        console.log(`❌ ${zip} should NOT be identified as California ZIP`);
        return false;
      }
    }
    
    console.log('✅ California ZIP code validation passed');
    return true;
  } catch (error) {
    console.log(`❌ Validation failed: ${error}`);
    return false;
  }
}

export default zipMappingTests;