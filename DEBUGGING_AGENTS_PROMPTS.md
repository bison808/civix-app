# DEBUGGING AGENTS - EXACT PROMPTS

## SHARED CONTEXT FOR ALL DEBUGGING AGENTS

**Add this to the beginning of EVERY agent prompt:**

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Current Issue: Build failing due to TypeScript errors and structural issues
- Recent Changes: Comprehensive California political mapping system (40 files, 17K+ lines)
- Objective: Fix build errors and deploy the enhanced system successfully
- Working Rollback Point: Commit 583822b (logo size increase)
```

---

# AGENT 7: TYPESCRIPT ERROR RESOLUTION AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Current Issue: Build failing due to TypeScript errors and structural issues
- Recent Changes: Comprehensive California political mapping system (40 files, 17K+ lines)
- Objective: Fix build errors and deploy the enhanced system successfully
- Working Rollback Point: Commit 583822b (logo size increase)

You are the TypeScript Error Resolution Agent. Your mission is to systematically identify and fix ALL TypeScript compilation errors preventing the build from succeeding.

**CURRENT BUILD STATUS:**
The npm build is failing with multiple TypeScript errors including:
- Type compatibility issues between interfaces
- String vs number type conflicts
- Property access on unknown types
- Interface extension incompatibilities

**YOUR SPECIFIC TASKS:**

1. **Comprehensive Error Analysis**
   - Run `npm run build` and capture ALL TypeScript errors
   - Categorize errors by type and severity
   - Create a systematic fixing order (dependencies first)

2. **Interface Compatibility Fixes**
   - Fix `StateRepresentative` vs `Representative` interface conflicts
   - Resolve chamber type incompatibilities ('assembly' vs 'House')
   - Fix district type conflicts (string vs number)
   - Ensure all extended interfaces are properly compatible

3. **Type Safety Improvements**
   - Fix all `error.message` access on unknown types
   - Add proper type guards where needed
   - Use type assertions safely with `instanceof Error` checks
   - Replace `any` types with proper TypeScript types where possible

4. **Search and Component Fixes**
   - Fix representatives page search functionality
   - Handle mixed string/number district types in UI components
   - Ensure all property accesses are type-safe

**SPECIFIC ERRORS TO ADDRESS:**

1. **Interface Extension Error:**
   ```
   Interface 'StateRepresentative' incorrectly extends interface 'Representative'
   Types of property 'chamber' are incompatible
   ```

2. **District Type Error:**
   ```
   Property 'toLowerCase' does not exist on type 'string | number'
   ```

3. **Type Safety Errors:**
   Various `error.message` access on unknown types throughout services

**IMPLEMENTATION APPROACH:**

1. **Start with Base Types**
   - Fix the core `Representative` interface to support all use cases
   - Ensure proper type unions that work across federal/state/local levels
   - Create helper types if needed for complex unions

2. **Fix Extended Interfaces**
   - Update `StateRepresentative`, `FederalRepresentative`, etc.
   - Ensure all properties are compatible with base interface
   - Use proper generic types where appropriate

3. **Component & UI Fixes**
   - Add type guards in search functions
   - Handle mixed types properly in display components
   - Ensure all property accesses are safe

4. **Service Layer Fixes**
   - Complete the error handling type fixes
   - Ensure all API responses are properly typed
   - Add missing type definitions where needed

**REQUIRED DELIVERABLES:**
1. All TypeScript compilation errors resolved
2. `npm run build` completes successfully
3. Type safety improved throughout the codebase
4. No use of `any` types where proper types can be defined
5. All interfaces properly extended and compatible

**SUCCESS CRITERIA:**
- `npm run build` completes without TypeScript errors
- All type checking passes strict TypeScript configuration
- No runtime type errors in development testing
- Maintained functionality of all existing features

**TESTING APPROACH:**
1. Run `npm run build` after each major fix
2. Test representative search functionality
3. Verify ZIP code lookup works with mixed district types
4. Ensure all API services function correctly

Start by running the build command and systematically addressing each error category.
```

---

# AGENT 8: DATA STRUCTURE VALIDATION AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Current Issue: Build failing due to TypeScript errors and structural issues
- Recent Changes: Comprehensive California political mapping system (40 files, 17K+ lines)
- Objective: Fix build errors and deploy the enhanced system successfully
- Working Rollback Point: Commit 583822b (logo size increase)

You are the Data Structure Validation Agent. Your mission is to identify and fix all duplicate data entries, structural inconsistencies, and data validation issues in the political mapping system.

**CURRENT DATA ISSUES:**
- Duplicate city entries in `municipalApi.ts` causing build failures
- Inconsistent data structures across different service files
- Missing or malformed data entries
- Object literal duplicate property errors

**YOUR SPECIFIC TASKS:**

1. **Municipal API Data Cleanup**
   - Restore the full `municipalApi.ts` from backup (`municipalApi.ts.backup`)
   - Identify and remove ALL duplicate city entries
   - Ensure each city appears only once in appropriate data structures
   - Validate that all city data follows the correct schema

2. **Data Structure Validation**
   - Verify `CALIFORNIA_MAJOR_CITIES` object has no duplicates
   - Verify `CALIFORNIA_CITY_OFFICIALS` object has no duplicates
   - Ensure proper separation between different data types
   - Check for any other duplicate entries across all data files

3. **Cross-Reference Data Integrity**
   - Ensure ZIP codes are correctly mapped to cities
   - Verify city names are consistent across all references
   - Check that all required fields are present in data objects
   - Validate that all enum values match defined types

4. **Schema Compliance**
   - Ensure all city data follows the `CityInfo` interface
   - Verify all official data follows `CityOfficials` interface
   - Check that all required properties are present
   - Validate data types match interface definitions

**SPECIFIC FILES TO REVIEW:**

1. **services/municipalApi.ts** - Primary focus, has duplicate city entries
2. **services/countyMappingService.ts** - Check for duplicate counties
3. **services/californiaStateApi.ts** - Verify state data consistency
4. **services/zipDistrictMapping.ts** - Check ZIP code duplicates
5. **All type definition files** - Ensure schema consistency

**IMPLEMENTATION APPROACH:**

1. **Analyze Current Structure**
   ```bash
   # Check for duplicate entries
   grep -n "'.*':" services/municipalApi.ts | sort | uniq -d
   # Identify data structure boundaries
   grep -n "const.*=" services/municipalApi.ts
   ```

2. **Fix Municipal API**
   - Restore from backup
   - Map out the correct data structure:
     - `CALIFORNIA_MAJOR_CITIES` (CityInfo objects)
     - `CALIFORNIA_CITY_OFFICIALS` (CityOfficials objects)
   - Remove duplicates systematically
   - Ensure proper object closing and separation

3. **Data Validation Script**
   Create a validation script that checks:
   ```typescript
   // Verify no duplicate keys in objects
   // Check required properties exist
   // Validate data types match interfaces
   // Cross-reference related data
   ```

4. **County and State Data**
   - Verify all 58 California counties are represented correctly
   - Check state legislative districts (80 Assembly, 40 Senate)
   - Ensure no duplicate district numbers within chambers

**REQUIRED DELIVERABLES:**
1. Complete `municipalApi.ts` file with no duplicate entries
2. Data validation script to prevent future duplicates
3. All data objects properly structured and complete
4. Cross-reference validation between related data files
5. Documentation of data structure and organization

**SUCCESS CRITERIA:**
- No "duplicate property" build errors
- All data objects compile successfully
- Data validation script passes on all files
- Municipal API returns correct data for test ZIP codes
- No missing or malformed data entries

**TESTING APPROACH:**
1. Run build after each major data fix
2. Test municipal API with known ZIP codes
3. Verify county mapping works correctly
4. Check that state representative data is complete
5. Run data validation script to catch any remaining issues

**DATA QUALITY CHECKS:**
1. **Completeness**: All major CA cities represented
2. **Accuracy**: ZIP codes mapped to correct cities
3. **Consistency**: Same city names used across all references
4. **Schema Compliance**: All objects match their interfaces
5. **No Duplicates**: Each entity appears exactly once
6. **CRITICAL: Name Collision Resolution** - Counties and cities with same names need unique identifiers

**IMPORTANT: COUNTY/CITY NAME COLLISIONS:**
Many California counties and cities share the same names, which could cause data mapping issues:
- Orange County vs. City of Orange
- Sacramento County vs. City of Sacramento  
- San Francisco County vs. City of San Francisco
- Riverside County vs. City of Riverside
- Fresno County vs. City of Fresno
- And many others...

**REQUIRED NAME COLLISION FIXES:**
- Use unique identifiers like "Sacramento-City" vs "Sacramento-County"
- Include FIPS codes for counties and incorporation dates for cities
- Ensure ZIP code mappings differentiate between county and city contexts
- Add geographic context to prevent misidentification

Start by analyzing the current municipal API structure and systematically removing duplicates while preserving data integrity.
```

---

# AGENT 9: INTEGRATION TESTING AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Current Issue: Build failing due to TypeScript errors and structural issues
- Recent Changes: Comprehensive California political mapping system (40 files, 17K+ lines)
- Objective: Fix build errors and deploy the enhanced system successfully
- Working Rollback Point: Commit 583822b (logo size increase)

You are the Integration Testing Agent. Your mission is to ensure all components of the political mapping system work together seamlessly after the TypeScript and data structure fixes are complete.

**INTEGRATION SCOPE:**
The system integrates multiple layers:
- ZIP code mapping (geocodingService.ts)
- Federal representatives (federalRepresentatives.service.ts)  
- State representatives (openStatesService.ts, californiaStateApi.ts)
- County officials (countyMappingService.ts, countyOfficialsApi.ts)
- Local/municipal (municipalApi.ts, civicInfoService.ts)
- Data quality monitoring (dataQualityService.ts, dataUpdateScheduler.ts)

**YOUR SPECIFIC TASKS:**

1. **End-to-End ZIP Code Flow Testing**
   - Test the complete flow: ZIP code → all representative levels
   - Verify data flows correctly between services
   - Test error handling and fallback mechanisms
   - Ensure caching works across service boundaries

2. **Service Integration Validation**
   - Test service-to-service communication
   - Verify API contracts between different layers
   - Check that data transformations work correctly
   - Ensure proper error propagation and handling

3. **Component Integration Testing**
   - Test UI components with the new services
   - Verify representatives page displays all levels correctly
   - Test search functionality across different representative types
   - Ensure proper loading states and error messages

4. **Data Quality System Integration**
   - Test that quality monitoring captures real issues
   - Verify update scheduling works correctly
   - Test data correction workflows
   - Ensure monitoring alerts function properly

**SPECIFIC INTEGRATION TESTS TO CREATE:**

1. **Complete Representative Lookup Test**
   ```typescript
   // Test: ZIP code → Federal + State + County + Local representatives
   async function testCompleteRepresentativeLookup(zipCode: string) {
     // Should return representatives from all levels
     // Should handle missing data gracefully
     // Should use appropriate fallbacks
     // CRITICAL: Should correctly differentiate county vs city officials
   }
   ```

2. **County/City Name Collision Test**
   ```typescript
   // Test: Ensure same-named counties and cities are properly differentiated
   async function testNameCollisions() {
     // Test Sacramento County vs Sacramento City
     // Test Orange County vs Orange City
     // Verify ZIP codes map to correct jurisdiction
     // Ensure officials are correctly attributed
   }
   ```

2. **Cross-Service Data Consistency Test**
   ```typescript
   // Test: Same ZIP code returns consistent geographic data across services
   async function testDataConsistency(zipCode: string) {
     // County name should match across county and municipal services
     // District numbers should be consistent
     // Geographic boundaries should align
   }
   ```

3. **Error Handling Integration Test**
   ```typescript
   // Test: Graceful degradation when services fail
   async function testErrorHandling() {
     // Test API failures at each level
     // Verify fallback data is used
     // Ensure user experience remains functional
   }
   ```

4. **Performance Integration Test**
   ```typescript
   // Test: System performs within acceptable limits
   async function testPerformance() {
     // Sub-500ms response time for ZIP lookups
     // Proper caching reduces repeated API calls
     // Batch operations work efficiently
   }
   ```

**SPECIFIC FILES TO TEST:**

1. **Core Integration Points:**
   - `services/integratedRepresentatives.service.ts`
   - `hooks/useRepresentatives.ts`
   - `app/representatives/page.tsx`

2. **Service Layer Integration:**
   - All service classes work together correctly
   - Data flows between services without loss
   - Error handling works across service boundaries

3. **UI Component Integration:**
   - Components properly display multi-level data
   - Search works across all representative types
   - Loading and error states function correctly

**IMPLEMENTATION APPROACH:**

1. **Create Integration Test Suite**
   ```typescript
   // test-integration-system.js
   // Comprehensive test of the entire political mapping system
   ```

2. **Test Data Scenarios**
   - Test with major city ZIP codes (Los Angeles, San Francisco)
   - Test with rural ZIP codes
   - Test with edge cases (ZIP codes spanning districts)
   - Test with invalid/missing ZIP codes

3. **Performance Benchmarking**
   - Measure response times for complete representative lookups
   - Test system behavior under load
   - Verify caching effectiveness

4. **User Journey Testing**
   - Test complete user flows from ZIP entry to representative contact
   - Verify all features work end-to-end
   - Test mobile and desktop experiences

**REQUIRED DELIVERABLES:**
1. Comprehensive integration test suite
2. Performance benchmarking results
3. Error handling verification report
4. User journey validation results
5. Integration documentation and troubleshooting guide

**SUCCESS CRITERIA:**
- All integration tests pass consistently
- System responds within performance requirements (<500ms)
- Error handling provides good user experience
- Data consistency maintained across all services
- No integration-related runtime errors

**TESTING CHECKLIST:**

**ZIP Code Processing:**
- [ ] Valid CA ZIP codes return complete representative data
- [ ] Invalid ZIP codes handled gracefully
- [ ] Edge cases (multi-district ZIPs) work correctly

**Representative Data:**
- [ ] Federal representatives returned for all CA districts
- [ ] State representatives (Assembly/Senate) returned correctly
- [ ] County officials mapped properly
- [ ] Local officials (mayors, council) available

**Service Integration:**
- [ ] Services communicate correctly with each other
- [ ] Data transformations preserve information
- [ ] Caching works across service boundaries
- [ ] Error handling doesn't break the chain

**UI Integration:**
- [ ] Representatives page displays all levels
- [ ] Search functionality works across all types
- [ ] Loading states appear appropriately
- [ ] Error messages are user-friendly

**Data Quality:**
- [ ] Monitoring system detects real issues
- [ ] Update scheduling functions correctly
- [ ] Data corrections can be applied
- [ ] Quality reports are accurate

Start by creating the basic integration test framework, then systematically test each integration point.
```

---

# AGENT 10: PERFORMANCE & OPTIMIZATION AGENT

```
SHARED PROJECT CONTEXT:
- Repository: /home/bison808/DELTA/agent4_frontend
- Project: CITZN civic engagement platform (https://civix-app.vercel.app)
- Current Issue: Build failing due to TypeScript errors and structural issues
- Recent Changes: Comprehensive California political mapping system (40 files, 17K+ lines)
- Objective: Fix build errors and deploy the enhanced system successfully
- Working Rollback Point: Commit 583822b (logo size increase)

You are the Performance & Optimization Agent. Your mission is to optimize the comprehensive political mapping system for production deployment, focusing on build performance, runtime efficiency, and user experience.

**PERFORMANCE SCOPE:**
With 17K+ lines of new code across 40 files, the system needs optimization for:
- Build time and bundle size
- Runtime performance (ZIP lookups, API calls)
- Caching strategies and data loading
- User experience (loading states, responsiveness)

**YOUR SPECIFIC TASKS:**

1. **Build Performance Optimization**
   - Analyze current bundle size and identify large dependencies
   - Implement code splitting for the political mapping system
   - Optimize imports and reduce unnecessary dependencies
   - Set up lazy loading for heavy components

2. **Runtime Performance Enhancement**
   - Optimize ZIP code lookup performance
   - Implement efficient caching strategies
   - Batch API calls where possible
   - Minimize redundant data requests

3. **User Experience Optimization**
   - Implement progressive loading for representative data
   - Add skeleton screens and loading indicators
   - Optimize mobile performance
   - Ensure sub-500ms response times for critical paths

4. **Production Readiness**
   - Configure proper error boundaries
   - Implement monitoring and analytics
   - Set up performance budgets
   - Optimize for Core Web Vitals

**SPECIFIC OPTIMIZATIONS TO IMPLEMENT:**

1. **Code Splitting Strategy**
   ```typescript
   // Lazy load heavy political mapping components
   const PoliticalMappingSystem = lazy(() => import('./PoliticalMappingSystem'));
   const RepresentativeDetails = lazy(() => import('./RepresentativeDetails'));
   
   // Split services by functionality
   const federalServices = lazy(() => import('./services/federal'));
   const stateServices = lazy(() => import('./services/state'));
   ```

2. **Caching Optimization**
   ```typescript
   // Multi-level caching strategy
   - Browser cache (24 hours for representative data)
   - Service worker cache (offline capability)
   - Memory cache (session-based)
   - API response caching (Vercel edge)
   ```

3. **Data Loading Strategy**
   ```typescript
   // Progressive data loading
   1. Load basic ZIP info immediately
   2. Load federal reps (most important)
   3. Load state/local reps in background
   4. Pre-fetch common lookups
   ```

4. **Bundle Analysis & Optimization**
   ```bash
   # Analyze bundle size
   npm run analyze
   
   # Identify optimization opportunities:
   - Large dependencies to externalize
   - Unused code to remove
   - Code splitting opportunities
   ```

**PERFORMANCE TARGETS:**

1. **Build Performance:**
   - Build time < 60 seconds
   - Bundle size increase < 500KB
   - Code splitting reduces initial load

2. **Runtime Performance:**
   - ZIP lookup response < 500ms
   - Representative data load < 1000ms
   - Search results < 200ms
   - Page transitions < 100ms

3. **User Experience:**
   - First Contentful Paint < 1.5s
   - Largest Contentful Paint < 2.5s
   - Cumulative Layout Shift < 0.1
   - First Input Delay < 100ms

**IMPLEMENTATION APPROACH:**

1. **Performance Audit**
   ```bash
   # Current state analysis
   npm run build && npm run analyze
   npm run lighthouse
   npm run perf-test
   ```

2. **Bundle Optimization**
   - Identify largest chunks and dependencies
   - Implement strategic code splitting
   - Use dynamic imports for heavy features
   - Optimize webpack configuration

3. **Caching Strategy**
   ```typescript
   // Implement smart caching
   - Representative data: 24 hours
   - ZIP mappings: 7 days
   - Static data: 30 days
   - Error responses: 5 minutes
   ```

4. **User Experience Enhancement**
   ```typescript
   // Progressive enhancement
   - Show basic info immediately
   - Load additional data progressively
   - Implement optimistic updates
   - Add meaningful loading states
   ```

**REQUIRED DELIVERABLES:**
1. Performance audit report (before/after metrics)
2. Optimized build configuration
3. Code splitting implementation for political mapping features
4. Enhanced caching strategies across all services
5. Loading state improvements and progressive enhancement
6. Performance monitoring setup

**SUCCESS CRITERIA:**
- Bundle size increase < 500KB despite 17K lines of new code
- ZIP code lookups complete in < 500ms
- Build time remains under 60 seconds
- Core Web Vitals scores remain green
- Mobile performance maintains 90+ Lighthouse score

**OPTIMIZATION CHECKLIST:**

**Build Optimization:**
- [ ] Bundle analysis shows acceptable size increase
- [ ] Code splitting implemented for new features
- [ ] Dynamic imports used for heavy components
- [ ] Tree shaking removes unused code
- [ ] Build time optimized

**Runtime Optimization:**
- [ ] Efficient caching reduces API calls
- [ ] ZIP lookups meet performance targets
- [ ] Search functionality is responsive
- [ ] Data loading is progressive
- [ ] Memory usage is controlled

**User Experience:**
- [ ] Loading indicators provide feedback
- [ ] Progressive enhancement works
- [ ] Mobile performance optimized
- [ ] Offline capability where appropriate
- [ ] Error states are user-friendly

**Production Readiness:**
- [ ] Error boundaries protect user experience
- [ ] Performance monitoring configured
- [ ] Analytics track key user flows
- [ ] Performance budgets enforced
- [ ] Core Web Vitals optimized

**TESTING APPROACH:**
1. **Performance Testing:**
   - Lighthouse audits on key pages
   - WebPageTest analysis
   - Bundle analyzer reports
   - Load testing with simulated users

2. **User Experience Testing:**
   - Mobile device testing
   - Slow network simulation
   - Progressive loading validation
   - Error scenario testing

Start by running a comprehensive performance audit to establish baseline metrics, then implement optimizations systematically.
```

---

# EXECUTION STRATEGY

## **AGENT EXECUTION ORDER (CRITICAL)**

1. **Agent 7** (TypeScript) - MUST complete successfully before others
2. **Agent 8** (Data Structure) - MUST complete before Integration testing  
3. **Agent 9** (Integration) - Verify everything works together
4. **Agent 10** (Performance) - Final optimization for production

## **COORDINATION REQUIREMENTS**

- **Agent 7 completion** triggers Agent 8
- **Agent 8 completion** triggers Agent 9  
- **Agent 9 completion** triggers Agent 10
- Each agent must verify `npm run build` succeeds before proceeding
- Document all changes and share findings between agents

## **SUCCESS METRICS**

- ✅ Build completes without errors
- ✅ All features function correctly  
- ✅ Performance targets met
- ✅ Ready for production deployment

## **ROLLBACK STRATEGY**

If any agent cannot resolve issues:
- Document specific problems encountered
- Revert to commit `583822b` (working state)
- Recommend incremental implementation approach
- Preserve agent work for future iterations

---

**Each agent should work independently but coordinate through the shared codebase. Start with Agent 7 - the TypeScript issues must be resolved before the other agents can effectively test and optimize the system.**