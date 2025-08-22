# CITZN Platform - Bug Tracker
*QA Testing Session: August 22, 2025*

## 🐛 BUG #001: Invalid ZIP Code Validation Issue

**Severity**: Medium  
**Priority**: High  
**Status**: Open  
**Found by**: QA Testing  
**Date**: August 22, 2025  

### Problem Description
The ZIP code validation API endpoint `/api/auth/verify-zip` accepts clearly invalid ZIP codes (like 99999) and returns them as valid with a generic fallback location instead of properly rejecting them.

### Steps to Reproduce
1. Send POST request to `/api/auth/verify-zip`
2. Include body: `{"zipCode": "99999"}`
3. Observe response

### Expected Behavior
- Should return: `{"valid": false, "error": "Invalid ZIP code format"}` or similar
- Should reject ZIP codes that don't correspond to real US locations

### Actual Behavior
- Returns: `{"valid": true, "zipCode": "99999", "city": "United States", "state": "US"}`
- Treats invalid ZIP as valid with generic fallback

### Impact
- Users can enter non-existent ZIP codes and proceed through the app
- May lead to incorrect representative data or failed downstream API calls
- Poor user experience - no feedback for typos

### Technical Details
- **File**: `/app/api/auth/verify-zip/route.ts:139`
- **Code**: The `getStateFromZip()` function returns a generic fallback instead of null/error
- **Root Cause**: Missing validation for invalid ZIP code ranges

### Suggested Fix
Add proper validation to reject ZIP codes outside valid US ranges (00501-99950) before applying fallback logic.

### Test Cases to Verify Fix
- [ ] ZIP 99999 → should return error
- [ ] ZIP 00000 → should return error  
- [ ] ZIP 99999 → should return error
- [ ] ZIP 12345 → should work (if valid)

---

## Bug Statistics
- **Total Bugs**: 1
- **Open**: 1
- **Critical**: 0
- **High**: 1
- **Medium**: 0
- **Low**: 0