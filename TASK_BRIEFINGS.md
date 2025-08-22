# CITZN Platform - Agent Task Briefings

## 🐛 BUG HUNTER AGENT BRIEFING

### URGENT: Authentication State Persistence Fix

**Your Mission:** Fix the critical authentication bug where users lose their login state on page refresh.

**Investigation Starting Points:**
```typescript
// Check these files first:
1. /contexts/AuthContext.tsx - Main auth state management
2. /hooks/useAuth.ts - Authentication hook implementation
3. /middleware.ts - Route protection middleware
4. /app/api/auth/* - Auth API routes
```

**Known Symptoms:**
- Users logged out after page refresh
- Token not persisting in localStorage/sessionStorage
- Possible race condition in auth state initialization

**Debugging Steps:**
1. Check if tokens are being saved to localStorage
2. Verify AuthContext provider initialization
3. Test token refresh mechanism
4. Check middleware authentication logic
5. Verify API response handling

**Test Scenarios:**
- Login → Refresh → Should stay logged in
- Login → Close tab → Reopen → Should stay logged in
- Login → Wait for token expiry → Should auto-refresh
- Login → Navigate between pages → Should maintain state

**Success Criteria:**
✅ Authentication persists across page refreshes
✅ Tokens properly stored and retrieved
✅ No security vulnerabilities introduced
✅ Clean error handling for edge cases

---

## 🚀 FEATURE DEVELOPER AGENT BRIEFING

### Task 1: Real-Time Bill Updates Implementation

**Your Mission:** Integrate Congress API for live bill data updates without page refresh.

**Implementation Plan:**
```typescript
// Key files to modify:
1. /services/congressService.ts - Add WebSocket/polling logic
2. /hooks/useBills.ts - Implement real-time updates
3. /app/api/bills/route.ts - API endpoint optimization
4. /components/bills/BillFeed.tsx - UI update handling
```

**Technical Requirements:**
- Use React Query for data fetching and caching
- Implement 5-minute polling interval (configurable)
- Add WebSocket support if API provides it
- Cache responses to minimize API calls
- Handle rate limiting gracefully

**API Integration:**
```javascript
// Congress API endpoint
const CONGRESS_API = 'https://api.congress.gov/v3/bill';
// Add API key handling
// Implement retry logic with exponential backoff
```

**Success Criteria:**
✅ Bills update every 5 minutes automatically
✅ Efficient caching (>80% cache hit rate)
✅ Graceful error handling
✅ Loading states properly displayed
✅ No performance degradation

### Task 2: Onboarding Flow Enhancement (After Task 1)

**Quick Overview:**
- Simplify first-time user experience
- Add progress indicators
- Implement skip options
- Create engaging welcome screens

---

## 🎨 UI/UX DESIGNER AGENT BRIEFING

### Mobile Responsiveness Optimization

**Your Mission:** Make CITZN fully responsive and mobile-first.

**Priority Components:**
```css
/* Focus areas */
1. /app/feed/page.tsx - Bill feed layout
2. /components/bills/BillCard.tsx - Card sizing
3. /components/representatives/* - All rep components
4. /app/dashboard/page.tsx - Grid system
5. Navigation menu - Mobile hamburger menu
```

**Breakpoint Requirements:**
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

**Mobile-Specific Features:**
- Swipe gestures for bill voting
- Bottom navigation bar
- Collapsible filters
- Touch-friendly buttons (min 44x44px)
- Optimized images and lazy loading

**Testing Checklist:**
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Samsung Galaxy (360px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)

**Performance Targets:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1
- Mobile Lighthouse score: >90

**Design System Updates:**
```css
/* Add to Tailwind config */
- Touch target utilities
- Mobile-first spacing scale
- Responsive typography scale
- Mobile gesture animations
```

---

## 📋 COORDINATION NOTES

### Inter-Agent Dependencies
1. **Bug Hunter → Feature Developer**
   - Auth fix must be complete before API integration
   - Share any API token handling improvements

2. **UI/UX Designer → All Agents**
   - Component updates may affect everyone
   - Share responsive utility classes

3. **Feature Developer → UI/UX Designer**
   - New bill update UI needs mobile optimization
   - Coordinate loading state designs

### Communication Channels
- Status updates: Every 30 minutes
- Blockers: Immediate escalation
- Code reviews: Before each deployment
- Shared knowledge: Document in codebase

### Testing Protocol
1. Unit tests for critical functions
2. Integration tests for API calls
3. E2E tests for user flows (using Puppeteer)
4. Manual QA before deployment

---

## 🚀 QUICK START COMMANDS

```bash
# Development
npm run dev          # Start dev server (port 3008)
npm run lint         # Run linter
npm run type-check   # TypeScript checking
npm run build        # Production build

# Testing
npm test            # Run test suite
npm run test:e2e    # End-to-end tests

# Deployment
git push origin main  # Auto-deploy via Netlify

# Dashboard
# Access at http://localhost:8080/dashboard.html
```

---

*Each agent should refer to their specific briefing section and coordinate through AGENT_STATUS.md*