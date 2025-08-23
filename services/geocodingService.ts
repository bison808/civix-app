import {
  ZipDistrictMapping,
  MultiDistrictMapping,
  GeocodioResponse,
  GeocodioResult,
  BatchProcessingResult,
  GeocodingServiceConfig,
  DistrictLookupOptions,
  DistrictMappingError,
  DistrictMappingErrorResponse,
  DistrictCacheEntry
} from '../types/districts.types';

class GeocodingService {
  private config: GeocodingServiceConfig;
  private cache: Map<string, DistrictCacheEntry> = new Map();
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private readonly RATE_LIMIT_REQUESTS = 1000; // Geocodio free tier: 2,500 requests/day
  private readonly RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config?: Partial<GeocodingServiceConfig>) {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GEOCODIO_API_KEY || '',
      baseUrl: 'https://api.geocod.io/v1.7',
      timeout: 10000,
      maxRetries: 3,
      batchSize: 50, // Geocodio batch limit
      cacheExpiration: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...config
    };

    if (!this.config.apiKey) {
      console.warn('Geocodio API key not provided. Service will use fallback methods.');
    }

    this.loadCacheFromStorage();
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastResetTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    return this.requestCount < this.RATE_LIMIT_REQUESTS;
  }

  private incrementRequestCount(): void {
    this.requestCount++;
  }

  private loadCacheFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem('district_mapping_cache');
      if (cached) {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as DistrictCacheEntry);
        });
      }
    } catch (error) {
      console.warn('Failed to load district mapping cache:', error);
    }
  }

  private saveCacheToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = Object.fromEntries(this.cache.entries());
      localStorage.setItem('district_mapping_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save district mapping cache:', error);
    }
  }

  private getCachedMapping(zipCode: string, maxAge?: number): ZipDistrictMapping | MultiDistrictMapping | null {
    const cached = this.cache.get(zipCode);
    if (!cached) return null;

    const age = Date.now() - cached.expiresAt + this.config.cacheExpiration;
    const effectiveMaxAge = maxAge || this.config.cacheExpiration;
    
    if (age > effectiveMaxAge) {
      this.cache.delete(zipCode);
      return null;
    }

    return cached.mapping;
  }

  private setCachedMapping(zipCode: string, mapping: ZipDistrictMapping | MultiDistrictMapping): void {
    this.cache.set(zipCode, {
      zipCode,
      mapping,
      expiresAt: Date.now() + this.config.cacheExpiration
    });
    
    // Cleanup expired entries periodically
    if (this.cache.size > 1000) {
      this.cleanupExpiredCache();
    }
    
    this.saveCacheToStorage();
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  private validateZipCode(zipCode: string): boolean {
    return /^\d{5}(-\d{4})?$/.test(zipCode.trim());
  }

  private async makeGeocodioRequest(url: string, retryCount = 0): Promise<GeocodioResponse> {
    if (!this.checkRateLimit()) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    if (!this.config.apiKey) {
      throw new Error('Geocodio API key is required');
    }

    try {
      this.incrementRequestCount();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.config.maxRetries) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.makeGeocodioRequest(url, retryCount + 1);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (retryCount < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.makeGeocodioRequest(url, retryCount + 1);
        }
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private parseGeocodioResult(result: GeocodioResult, zipCode: string): ZipDistrictMapping | MultiDistrictMapping {
    const congressional = result.fields.congressional_districts || [];
    const stateLegislative = result.fields.state_legislative_districts || {};
    
    const congressionalNumbers = congressional
      .filter(d => d.congress_numbers.includes(119)) // Current congress
      .map(d => d.district_number);
    
    const senateNumbers = (stateLegislative.senate || [])
      .map(d => parseInt(d.district_number))
      .filter(n => !isNaN(n));
    
    const assemblyNumbers = (stateLegislative.house || [])
      .map(d => parseInt(d.district_number))
      .filter(n => !isNaN(n));

    const baseData = {
      zipCode,
      county: result.fields.county?.name || result.address_components.county,
      city: result.address_components.city,
      coordinates: [result.location.lng, result.location.lat] as [number, number],
      accuracy: result.accuracy,
      source: 'geocodio' as const,
      lastUpdated: new Date().toISOString()
    };

    // Check if ZIP spans multiple districts
    const hasMultipleDistricts = 
      congressionalNumbers.length > 1 ||
      senateNumbers.length > 1 ||
      assemblyNumbers.length > 1;

    if (hasMultipleDistricts) {
      return {
        ...baseData,
        districts: {
          congressional: congressionalNumbers,
          stateSenate: senateNumbers,
          stateAssembly: assemblyNumbers
        },
        primaryDistricts: {
          congressional: congressionalNumbers[0] || 0,
          stateSenate: senateNumbers[0] || 0,
          stateAssembly: assemblyNumbers[0] || 0
        }
      } as MultiDistrictMapping;
    }

    return {
      ...baseData,
      congressionalDistrict: congressionalNumbers[0] || 0,
      stateSenateDistrict: senateNumbers[0] || 0,
      stateAssemblyDistrict: assemblyNumbers[0] || 0
    } as ZipDistrictMapping;
  }

  async getDistrictsForZip(
    zipCode: string, 
    options: DistrictLookupOptions = {}
  ): Promise<ZipDistrictMapping | MultiDistrictMapping> {
    const {
      useCache = true,
      allowMultiDistrict = true,
      includeFallback = true,
      maxAge
    } = options;

    // Validate ZIP code
    const cleanZip = zipCode.trim().substring(0, 5);
    if (!this.validateZipCode(cleanZip)) {
      throw {
        error: 'INVALID_ZIP_FORMAT' as DistrictMappingError,
        message: 'Invalid ZIP code format. Expected 5 digits.',
        zipCode: cleanZip
      } as DistrictMappingErrorResponse;
    }

    // Check cache first
    if (useCache) {
      const cached = this.getCachedMapping(cleanZip, maxAge);
      if (cached) {
        return cached;
      }
    }

    // If no API key and fallback allowed, use fallback data
    if (!this.config.apiKey && includeFallback) {
      return this.getFallbackMapping(cleanZip);
    }

    try {
      // Make API request
      const url = `${this.config.baseUrl}/geocode?postal_code=${cleanZip}&state=CA&fields=cd,stateleg_next`;
      const response = await this.makeGeocodioRequest(url);

      if (!response.results || response.results.length === 0) {
        throw {
          error: 'ZIP_NOT_FOUND' as DistrictMappingError,
          message: 'ZIP code not found in California',
          zipCode: cleanZip
        } as DistrictMappingErrorResponse;
      }

      // Use the most accurate result
      const bestResult = response.results.sort((a, b) => b.accuracy - a.accuracy)[0];
      const mapping = this.parseGeocodioResult(bestResult, cleanZip);

      // Cache the result
      if (useCache) {
        this.setCachedMapping(cleanZip, mapping);
      }

      return mapping;
    } catch (error) {
      if (includeFallback) {
        return this.getFallbackMapping(cleanZip);
      }
      
      if (error instanceof Error) {
        throw {
          error: 'NETWORK_ERROR' as DistrictMappingError,
          message: error.message,
          zipCode: cleanZip
        } as DistrictMappingErrorResponse;
      }
      
      throw error;
    }
  }

  private getFallbackMapping(zipCode: string): ZipDistrictMapping {
    // Basic fallback mapping for common CA ZIP code ranges
    // This should be enhanced with actual district data
    const zipNum = parseInt(zipCode);
    
    let congressionalDistrict = 1;
    let stateSenateDistrict = 1;
    let stateAssemblyDistrict = 1;
    let county = 'Unknown County';
    let city = 'Unknown City';

    // Rough mapping based on ZIP code ranges (this should be improved with real data)
    if (zipCode.startsWith('90') || zipCode.startsWith('91')) {
      // Los Angeles area
      congressionalDistrict = Math.floor((zipNum - 90000) / 1000) + 25;
      county = 'Los Angeles County';
      city = 'Los Angeles Area';
    } else if (zipCode.startsWith('94')) {
      // San Francisco Bay Area
      congressionalDistrict = 12;
      county = 'San Francisco County';
      city = 'San Francisco Area';
    } else if (zipCode.startsWith('95')) {
      // Sacramento/Central Valley
      congressionalDistrict = 7;
      county = 'Sacramento County';
      city = 'Sacramento Area';
    }

    return {
      zipCode,
      congressionalDistrict: Math.min(Math.max(congressionalDistrict, 1), 52), // CA has 52 districts
      stateSenateDistrict: Math.min(Math.max(stateAssemblyDistrict, 1), 40), // CA has 40 senate districts
      stateAssemblyDistrict: Math.min(Math.max(stateAssemblyDistrict, 1), 80), // CA has 80 assembly districts
      county,
      city,
      coordinates: [-119.4179, 36.7783], // Center of California
      accuracy: 0.5,
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    };
  }

  async batchProcessZipCodes(
    zipCodes: string[], 
    options: DistrictLookupOptions = {}
  ): Promise<BatchProcessingResult> {
    const result: BatchProcessingResult = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      results: []
    };

    // Process in batches to respect API limits
    const batchSize = this.config.batchSize;
    const batches: string[][] = [];
    
    for (let i = 0; i < zipCodes.length; i += batchSize) {
      batches.push(zipCodes.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (zipCode) => {
        try {
          const mapping = await this.getDistrictsForZip(zipCode, options);
          return { zipCode, mapping, success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { zipCode, error: errorMessage, success: false };
        }
      });

      const batchResults = await Promise.all(promises);
      
      for (const batchResult of batchResults) {
        result.processed++;
        
        if (batchResult.success && 'mapping' in batchResult) {
          result.successful++;
          result.results.push(batchResult.mapping as ZipDistrictMapping);
        } else {
          result.failed++;
          result.errors.push({
            zipCode: batchResult.zipCode,
            error: batchResult.error || 'Unknown error'
          });
        }
      }

      // Add delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return result;
  }

  // Get all California ZIP codes for batch processing
  async getAllCaliforniaZipCodes(): Promise<string[]> {
    // This would typically come from a data source
    // For now, return a sample of common CA ZIP codes
    const californiaZips = [
      // Los Angeles County (sample)
      '90210', '90211', '90212', '90213', '90214', '90215',
      '90001', '90002', '90003', '90004', '90005', '90006',
      '91101', '91102', '91103', '91104', '91105', '91106',
      
      // San Francisco County (sample)
      '94101', '94102', '94103', '94104', '94105', '94106',
      '94107', '94108', '94109', '94110', '94111', '94112',
      
      // Orange County (sample)
      '92602', '92603', '92604', '92605', '92606', '92607',
      '92801', '92802', '92803', '92804', '92805', '92806',
      
      // San Diego County (sample)
      '92101', '92102', '92103', '92104', '92105', '92106',
      '92107', '92108', '92109', '92110', '92111', '92112',
      
      // Sacramento County (sample)
      '95814', '95815', '95816', '95817', '95818', '95819',
      '95820', '95821', '95822', '95823', '95824', '95825'
    ];
    
    return californiaZips;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('district_mapping_cache');
    }
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    if (entries.length === 0) {
      return { size: 0, hitRate: 0, oldestEntry: null, newestEntry: null };
    }

    const ages = entries.map(e => now - (e.expiresAt - this.config.cacheExpiration));
    const oldest = Math.max(...ages);
    const newest = Math.min(...ages);
    
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      oldestEntry: new Date(now - oldest).toISOString(),
      newestEntry: new Date(now - newest).toISOString()
    };
  }
}

export const geocodingService = new GeocodingService();
export default geocodingService;