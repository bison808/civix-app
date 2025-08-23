# ZIP Code District Mapping System

## Overview

The ZIP Code District Mapping System provides comprehensive mapping of California ZIP codes to their corresponding political districts and representatives at all levels of government (federal, state, county, and local).

## Features

- **Complete District Mapping**: Maps ZIP codes to congressional, state senate, and state assembly districts
- **Multi-Level Representatives**: Provides representatives from federal, state, county, and local levels
- **Geocodio API Integration**: Uses Geocodio for accurate, up-to-date district information
- **Intelligent Caching**: Local storage caching with configurable expiration times
- **Batch Processing**: Efficient processing of multiple ZIP codes with rate limiting
- **Error Handling**: Robust fallback mechanisms and error recovery
- **Performance Optimized**: <500ms response time for individual lookups

## Architecture

### Core Services

1. **GeocodingService** (`geocodingService.ts`)
   - Integrates with Geocodio API
   - Handles rate limiting and retries
   - Manages local caching
   - Provides fallback data

2. **ZipDistrictMappingService** (`zipDistrictMapping.ts`)
   - Main service for ZIP code lookups
   - Coordinates between geocoding and representative services
   - Handles multi-district ZIP codes
   - Provides comprehensive representative data

3. **BatchProcessor** (`batchProcessor.ts`)
   - Processes large batches of ZIP codes
   - Manages concurrency and rate limits
   - Provides progress tracking and error reporting
   - Exports results in various formats

### Data Types

See `types/districts.types.ts` for comprehensive type definitions including:
- `ZipDistrictMapping`: Single district ZIP codes
- `MultiDistrictMapping`: ZIP codes spanning multiple districts
- `RepresentativeWithDistrict`: Enhanced representative data with district info

## Quick Start

### 1. Environment Setup

Add to your `.env` file:

```env
# Geocodio API (sign up at https://geocod.io)
NEXT_PUBLIC_GEOCODIO_API_KEY=your_api_key_here

# Optional: Enable/disable features
NEXT_PUBLIC_ENABLE_GEOCODING=true
NEXT_PUBLIC_ENABLE_BATCH_PROCESSING=true
NEXT_PUBLIC_USE_REAL_DATA=true

# Cache configuration
NEXT_PUBLIC_CACHE_EXPIRATION_HOURS=24
NEXT_PUBLIC_MAX_CACHE_SIZE=1000
```

### 2. Basic Usage

```typescript
import { zipDistrictMappingService } from '@/services';

// Get districts for a ZIP code
const districts = await zipDistrictMappingService.getDistrictsForZipCode('90210');
console.log(districts.congressionalDistrict); // 30

// Get all representatives for a ZIP code
const representatives = await zipDistrictMappingService.getRepresentativesByZipCode('90210');
console.log(representatives.length); // Federal, state, and local officials
```

### 3. Batch Processing

```typescript
import { batchProcessor } from '@/services';

// Process multiple ZIP codes
const zipCodes = ['90210', '94102', '92101'];
const results = await batchProcessor.processBatch(zipCodes, {
  maxConcurrency: 5,
  onProgress: (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
  }
});
```

## API Reference

### ZipDistrictMappingService

#### `getDistrictsForZipCode(zipCode, options?)`

Returns district mapping for a single ZIP code.

**Parameters:**
- `zipCode`: 5-digit ZIP code string
- `options`: Optional lookup options
  - `useCache`: Use cached results (default: true)
  - `allowMultiDistrict`: Handle multi-district ZIP codes (default: true)
  - `includeFallback`: Use fallback data if API fails (default: true)
  - `maxAge`: Maximum cache age in milliseconds

**Returns:** `ZipDistrictMapping | MultiDistrictMapping`

#### `getRepresentativesByZipCode(zipCode, options?)`

Returns all representatives for a ZIP code.

**Returns:** `RepresentativeWithDistrict[]`

#### `batchProcessZipCodes(zipCodes, options?)`

Process multiple ZIP codes efficiently.

**Returns:** Array of results with districts and representatives

### BatchProcessor

#### `processAllCaliforniaZipCodes(options?)`

Process all California ZIP codes (1,797 total).

**Options:**
- `maxConcurrency`: Max concurrent requests (default: 10)
- `batchSize`: ZIP codes per batch (default: 25)
- `delayBetweenBatches`: Delay in ms (default: 100)
- `onProgress`: Progress callback function
- `onError`: Error callback function

#### `exportResults(results, filename?)`

Export batch results to JSON file.

### GeocodingService

#### `getDistrictsForZip(zipCode, options?)`

Direct Geocodio API integration.

#### `clearCache()`

Clear all cached district mappings.

#### `getCacheStats()`

Get cache usage statistics.

## Testing

### Run Test Suite

```typescript
import { zipMappingTests } from '@/services/zipMappingTests';

// Full test suite
const results = await zipMappingTests.runAllTests();

// Quick validation
await zipMappingTests.quickTest();

// Performance testing
await zipMappingTests.performanceTest();
```

### Sample Testing

```typescript
import { testSampleZipCodes, validateCaliforniaZipMapping } from '@/services/zipMappingTests';

// Test sample ZIP codes
await testSampleZipCodes();

// Validate California ZIP identification
const isValid = await validateCaliforniaZipMapping();
```

## Performance Metrics

### Target Performance
- **Individual Lookup**: <500ms response time
- **Batch Processing**: 25 ZIP codes per batch
- **Success Rate**: >95% for California ZIP codes
- **Cache Hit Rate**: >80% for repeated lookups

### Optimization Features
- Intelligent caching with localStorage
- Request deduplication
- Rate limiting compliance
- Concurrent processing with semaphores
- Progressive batch processing

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Automatic retries with exponential backoff
2. **Rate Limiting**: Respects API limits with queuing
3. **Invalid Data**: Validates all inputs and outputs
4. **Fallback Systems**: Multiple layers of fallback data
5. **Graceful Degradation**: Continues working even with partial failures

### Error Types

```typescript
type DistrictMappingError = 
  | 'ZIP_NOT_FOUND'
  | 'INVALID_ZIP_FORMAT'
  | 'API_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_API_KEY'
  | 'UNKNOWN_ERROR';
```

## Data Sources

### Primary Sources
1. **Geocodio API**: Congressional and state legislative districts
2. **Existing CITZN Services**: Federal representative data
3. **California Government APIs**: State and local officials

### Fallback Sources
1. **Static ZIP Mappings**: Pre-computed district assignments
2. **Geographic Boundaries**: ZIP code range approximations
3. **Known Representatives**: Cached representative data

## Monitoring & Analytics

### Key Metrics
- API response times
- Cache hit rates
- Success/failure rates
- Coverage statistics

### Logging
All services include comprehensive logging:
- API requests and responses
- Cache operations
- Error conditions
- Performance metrics

## Troubleshooting

### Common Issues

1. **"API key required" Error**
   - Add `NEXT_PUBLIC_GEOCODIO_API_KEY` to environment
   - Sign up at https://geocod.io

2. **Rate Limit Exceeded**
   - Reduce batch sizes
   - Increase delays between requests
   - Use caching more effectively

3. **Slow Performance**
   - Enable caching
   - Reduce concurrent requests
   - Check network connectivity

4. **Invalid District Numbers**
   - Verify ZIP code is in California
   - Check for recent redistricting changes
   - Validate input format

### Debug Mode

Enable detailed logging:

```typescript
// Set in environment
NEXT_PUBLIC_DEBUG_MODE=true

// Or programmatically
geocodingService.setDebugMode(true);
```

## Contributing

### Adding New Data Sources

1. Create new service in `services/` directory
2. Implement standard interface
3. Add to `zipDistrictMapping.ts` integration
4. Update type definitions
5. Add comprehensive tests

### Extending District Types

1. Update `types/districts.types.ts`
2. Modify parsing logic in services
3. Update validation rules
4. Add test coverage

## Future Enhancements

### Planned Features
- Real-time redistricting updates
- Historical district mapping
- Population-based weighting
- Geographic visualization
- API endpoints for external access

### Performance Improvements
- Database caching layer
- CDN distribution
- Background processing
- Predictive caching

## License

This system is part of the CITZN platform and follows the same licensing terms.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test suite for diagnostics
3. Review logs for specific errors
4. Contact the development team with detailed error information