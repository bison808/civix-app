# CITZN Voting System Specification

## User Access Levels & Vote Weights

### Level 0: Anonymous Read-Only Access
- **Access**: Browse bills, representatives, view votes/results
- **Restrictions**: Cannot vote, cannot save preferences
- **Registration**: None required
- **Vote Weight**: 0 (read-only)

### Level 1: ZIP Code Verified User  
- **Access**: All Level 0 + voting capability
- **Verification**: ZIP code verification only
- **Vote Weight**: 1
- **Current Status**: ✅ Implemented

### Level 2: Recent Election Voter
- **Access**: All Level 1 + enhanced credibility
- **Verification**: ZIP code + last election voter verification
- **Vote Weight**: 2
- **Current Status**: 🔄 Future implementation (requires 3rd party verification)

### Level 3: Consistent Voter
- **Access**: All Level 2 + maximum credibility  
- **Verification**: ZIP code + last election + 4+ consecutive elections
- **Vote Weight**: 3
- **Current Status**: 🔄 Future implementation (requires 3rd party verification)

## Implementation Notes

### Current (MVP)
- Anonymous browsing fully functional
- Level 1 (ZIP code) verification active
- Vote aggregation weighted by verification level

### Future Phases
- Integration with voter registration databases
- Third-party verification services (VoteShield, TurboVote, etc.)
- Advanced fraud detection and duplicate prevention
- Blockchain-based vote integrity (optional)

## Platform Philosophy
**"Civic engagement should be accessible to all, but influence should reflect democratic participation."**

- Lower barrier to entry (anonymous browsing)
- Graduated trust system based on civic engagement history
- Transparency in vote weighting and verification levels
- Protection against manipulation while encouraging participation

---
*This specification guides the long-term development of CITZN's democratic credibility system.*