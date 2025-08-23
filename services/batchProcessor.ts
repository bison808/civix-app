import {
  ZipDistrictMapping,
  MultiDistrictMapping,
  BatchProcessingResult,
  RepresentativeWithDistrict,
  DistrictLookupOptions
} from '../types/districts.types';
import { zipDistrictMappingService } from './zipDistrictMapping';
import { geocodingService } from './geocodingService';

interface BatchProcessingOptions extends DistrictLookupOptions {
  maxConcurrency?: number;
  batchSize?: number;
  delayBetweenBatches?: number;
  onProgress?: (processed: number, total: number) => void;
  onError?: (error: string, zipCode: string) => void;
}

interface ComprehensiveBatchResult {
  zipCode: string;
  districts: ZipDistrictMapping | MultiDistrictMapping;
  representatives: RepresentativeWithDistrict[];
  processingTime: number;
  success: boolean;
  error?: string;
}

class BatchProcessor {
  private readonly DEFAULT_CONCURRENCY = 10;
  private readonly DEFAULT_BATCH_SIZE = 25;
  private readonly DEFAULT_DELAY = 100; // ms between batches

  async processAllCaliforniaZipCodes(
    options: BatchProcessingOptions = {}
  ): Promise<{
    summary: BatchProcessingResult;
    detailed: ComprehensiveBatchResult[];
    processingStats: {
      totalTime: number;
      averageTimePerZip: number;
      successRate: number;
    };
  }> {
    const startTime = Date.now();
    
    // Get all California ZIP codes
    const allZipCodes = await this.getAllCaliforniaZipCodes();
    console.log(`Starting batch processing of ${allZipCodes.length} California ZIP codes`);

    const results = await this.processBatch(allZipCodes, options);
    
    const totalTime = Date.now() - startTime;
    const successful = results.filter(r => r.success);
    
    // Generate summary
    const summary: BatchProcessingResult = {
      processed: results.length,
      successful: successful.length,
      failed: results.length - successful.length,
      errors: results
        .filter(r => !r.success)
        .map(r => ({ zipCode: r.zipCode, error: r.error || 'Unknown error' })),
      results: successful.map(r => r.districts as ZipDistrictMapping)
    };

    return {
      summary,
      detailed: results,
      processingStats: {
        totalTime,
        averageTimePerZip: totalTime / results.length,
        successRate: successful.length / results.length
      }
    };
  }

  async processBatch(
    zipCodes: string[],
    options: BatchProcessingOptions = {}
  ): Promise<ComprehensiveBatchResult[]> {
    const {
      maxConcurrency = this.DEFAULT_CONCURRENCY,
      batchSize = this.DEFAULT_BATCH_SIZE,
      delayBetweenBatches = this.DEFAULT_DELAY,
      onProgress,
      onError
    } = options;

    const results: ComprehensiveBatchResult[] = [];
    let processed = 0;

    // Split into batches to manage memory and API limits
    for (let i = 0; i < zipCodes.length; i += batchSize) {
      const batch = zipCodes.slice(i, i + batchSize);
      
      // Process batch with controlled concurrency
      const batchResults = await this.processConcurrentBatch(
        batch,
        maxConcurrency,
        options
      );

      results.push(...batchResults);
      processed += batchResults.length;

      // Report progress
      if (onProgress) {
        onProgress(processed, zipCodes.length);
      }

      // Report errors
      batchResults.forEach(result => {
        if (!result.success && onError && result.error) {
          onError(result.error, result.zipCode);
        }
      });

      // Delay between batches to respect rate limits
      if (i + batchSize < zipCodes.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }

      // Log progress every 100 ZIP codes
      if (processed % 100 === 0) {
        console.log(`Processed ${processed}/${zipCodes.length} ZIP codes`);
      }
    }

    return results;
  }

  private async processConcurrentBatch(
    zipCodes: string[],
    maxConcurrency: number,
    options: BatchProcessingOptions
  ): Promise<ComprehensiveBatchResult[]> {
    const results: ComprehensiveBatchResult[] = [];
    const semaphore = new Semaphore(maxConcurrency);

    const promises = zipCodes.map(async (zipCode) => {
      await semaphore.acquire();
      
      try {
        const result = await this.processSingleZipCode(zipCode, options);
        results.push(result);
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);
    return results;
  }

  private async processSingleZipCode(
    zipCode: string,
    options: BatchProcessingOptions
  ): Promise<ComprehensiveBatchResult> {
    const startTime = Date.now();
    
    try {
      // Get districts and representatives
      const [districts, representatives] = await Promise.all([
        zipDistrictMappingService.getDistrictsForZipCode(zipCode, options),
        zipDistrictMappingService.getRepresentativesByZipCode(zipCode, options)
      ]);

      return {
        zipCode,
        districts,
        representatives,
        processingTime: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      return {
        zipCode,
        districts: {} as ZipDistrictMapping,
        representatives: [],
        processingTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getAllCaliforniaZipCodes(): Promise<string[]> {
    // Start with the known ZIP codes from geocoding service
    const knownZips = await geocodingService.getAllCaliforniaZipCodes();
    
    // Add additional California ZIP codes for comprehensive coverage
    const additionalZips = this.generateCaliforniaZipRange();
    
    // Combine and deduplicate
    const allZips = Array.from(new Set([...knownZips, ...additionalZips]));
    
    return allZips.sort();
  }

  private generateCaliforniaZipRange(): string[] {
    const californiaZips: string[] = [];
    
    // California ZIP code ranges (90000-96199)
    for (let prefix = 90; prefix <= 96; prefix++) {
      for (let suffix = 0; suffix <= 999; suffix++) {
        const zipCode = `${prefix}${suffix.toString().padStart(3, '0')}`;
        californiaZips.push(zipCode);
      }
    }
    
    // Additional ranges (80000-89999 for some CA areas)
    for (let prefix = 80; prefix <= 89; prefix++) {
      for (let suffix = 0; suffix <= 999; suffix++) {
        const zipCode = `${prefix}${suffix.toString().padStart(3, '0')}`;
        // Only include ZIP codes that might be in California
        if (this.likelyCaliforniaZip(zipCode)) {
          californiaZips.push(zipCode);
        }
      }
    }
    
    return californiaZips;
  }

  private likelyCaliforniaZip(zipCode: string): boolean {
    // Simple heuristic - in practice, this would use a more comprehensive check
    const prefix = zipCode.substring(0, 2);
    return ['90', '91', '92', '93', '94', '95', '96'].includes(prefix);
  }

  async validateBatchResults(
    results: ComprehensiveBatchResult[]
  ): Promise<{
    validResults: ComprehensiveBatchResult[];
    invalidResults: ComprehensiveBatchResult[];
    validationReport: {
      totalChecked: number;
      validCount: number;
      invalidCount: number;
      commonErrors: string[];
    };
  }> {
    const validResults: ComprehensiveBatchResult[] = [];
    const invalidResults: ComprehensiveBatchResult[] = [];
    const errors: string[] = [];

    for (const result of results) {
      if (!result.success) {
        invalidResults.push(result);
        if (result.error) errors.push(result.error);
        continue;
      }

      // Validate district data
      const isValid = this.validateDistrictData(result.districts) && 
                     this.validateRepresentativeData(result.representatives);
      
      if (isValid) {
        validResults.push(result);
      } else {
        invalidResults.push({
          ...result,
          success: false,
          error: 'Invalid district or representative data'
        });
        errors.push('Invalid district or representative data');
      }
    }

    // Count common errors
    const errorCounts = errors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    return {
      validResults,
      invalidResults,
      validationReport: {
        totalChecked: results.length,
        validCount: validResults.length,
        invalidCount: invalidResults.length,
        commonErrors
      }
    };
  }

  private validateDistrictData(
    districts: ZipDistrictMapping | MultiDistrictMapping
  ): boolean {
    // Basic validation checks
    if (!districts.zipCode || !districts.county || !districts.city) {
      return false;
    }

    if (!Array.isArray(districts.coordinates) || districts.coordinates.length !== 2) {
      return false;
    }

    // Check if coordinates are within California bounds
    const [lng, lat] = districts.coordinates;
    const inCaliforniaBounds = 
      lat >= 32.5 && lat <= 42.0 && lng >= -124.4 && lng <= -114.1;

    if (!inCaliforniaBounds) {
      return false;
    }

    // Validate district numbers
    if ('congressionalDistrict' in districts) {
      return districts.congressionalDistrict > 0 && districts.congressionalDistrict <= 52;
    } else {
      return districts.primaryDistricts.congressional > 0 && 
             districts.primaryDistricts.congressional <= 52;
    }
  }

  private validateRepresentativeData(
    representatives: RepresentativeWithDistrict[]
  ): boolean {
    if (!Array.isArray(representatives) || representatives.length === 0) {
      return false;
    }

    // Check that we have at least federal representatives
    const hasFederal = representatives.some(rep => rep.level === 'federal');
    return hasFederal;
  }

  // Export batch results to JSON file
  async exportResults(
    results: ComprehensiveBatchResult[],
    filename: string = `ca_zip_districts_${Date.now()}.json`
  ): Promise<string> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalZipCodes: results.length,
        successfulMappings: results.filter(r => r.success).length,
        failedMappings: results.filter(r => !r.success).length
      },
      zipCodeMappings: results.map(result => ({
        zipCode: result.zipCode,
        success: result.success,
        processingTime: result.processingTime,
        districts: result.success ? result.districts : null,
        representatives: result.success ? result.representatives.map(rep => ({
          id: rep.id,
          name: rep.name,
          title: rep.title,
          level: rep.level,
          chamber: rep.chamber,
          district: rep.district,
          party: rep.party
        })) : null,
        error: result.error || null
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    // In a browser environment, trigger download
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return jsonString;
  }
}

// Simple semaphore implementation for controlling concurrency
class Semaphore {
  private permits: number;
  private waitQueue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

export const batchProcessor = new BatchProcessor();
export default batchProcessor;