# Browse vs Authenticated Mode Implementation Plan

## Overview
This document outlines the implementation strategy for allowing public browsing of CITZN while maintaining full features for authenticated users. This creates a "freemium" experience where users can explore content before committing to registration.

**Status:** 📋 PLANNED - To be implemented after core features are refined
**Created:** January 23, 2025
**Priority:** Medium (Post-MVP)

## Business Objectives
1. **Lower barrier to entry** - Users can explore without signup friction
2. **Increase conversions** - Show value before requiring commitment  
3. **Better SEO** - Public content is crawlable
4. **Trust building** - Transparency about platform content

## Architecture Decision: Single Backend with Middleware

After research and analysis, we've chosen a **single backend with smart middleware** approach over dual backends.

### Reasoning:
- Lower maintenance overhead
- Single source of truth for business logic
- Cost-effective infrastructure
- Simpler deployment pipeline
- Industry best practice for freemium models

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Update AuthContext to support browse mode
- [ ] Create middleware for route protection
- [ ] Define public vs protected routes
- [ ] Add session state management

### Phase 2: API Updates (Week 1-2)
- [ ] Modify all API endpoints for conditional responses
- [ ] Add caching layer for public data
- [ ] Implement rate limiting for unauthenticated requests
- [ ] Create API documentation for both modes

### Phase 3: Frontend Updates (Week 2-3)
- [ ] Remove ProtectedRoute from public pages
- [ ] Add conditional rendering to all interactive components
- [ ] Create reusable AuthPrompt component
- [ ] Update navigation for both modes

### Phase 4: User Experience (Week 3-4)
- [ ] Design and implement CTA prompts
- [ ] Create onboarding flow from browse → auth
- [ ] Add feature comparison tooltips
- [ ] Implement "preview mode" for premium features

### Phase 5: Testing & Optimization (Week 4)
- [ ] Comprehensive testing of both modes
- [ ] Performance optimization
- [ ] Security audit
- [ ] Analytics implementation

## Technical Implementation Details

### 1. Middleware Configuration
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define route access levels
const PUBLIC_ROUTES = [
  '/',
  '/browse',
  '/bill/:id',
  '/representatives',
  '/about',
  '/privacy'
]

const AUTH_ONLY_ROUTES = [
  '/dashboard',
  '/settings',
  '/my-votes'
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hasSession = request.cookies.has('sessionToken')
  
  // Allow all public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }
  
  // Redirect to login for protected routes without auth
  if (isProtectedRoute(pathname) && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

### 2. AuthContext Updates
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  loading: boolean
  isBrowsing: boolean  // NEW
  login: (email: string, password: string) => Promise<boolean>
  startBrowsing: () => void  // NEW
  convertToUser: () => void  // NEW
}

// Track browse sessions
const startBrowsing = () => {
  localStorage.setItem('browseSession', Date.now().toString())
  setIsBrowsing(true)
}

// Convert browse to auth
const convertToUser = async () => {
  const browseStartTime = localStorage.getItem('browseSession')
  // Track conversion metrics
  await api.analytics.trackConversion(browseStartTime)
  localStorage.removeItem('browseSession')
  router.push('/register')
}
```

### 3. API Response Patterns
```typescript
// api/bills/route.ts
export async function GET(request: Request) {
  const session = await getSession(request)
  const bills = await fetchBills()
  
  if (session?.user) {
    // Authenticated response - full data
    return NextResponse.json({
      bills: bills.map(bill => ({
        ...bill,
        userVote: getUserVote(bill.id, session.user.id),
        impactScore: calculateImpact(bill, session.user),
        canContact: true,
        savedStatus: isSaved(bill.id, session.user.id)
      }))
    })
  } else {
    // Browse mode - limited data
    return NextResponse.json({
      bills: bills.map(bill => ({
        ...bill,
        userVote: null,
        impactScore: null,
        canContact: false,
        savedStatus: false
      })),
      mode: 'browse'
    })
  }
}
```

### 4. Component Patterns
```typescript
// components/bills/BillCard.tsx
function BillCard({ bill }) {
  const { user, isBrowsing } = useAuth()
  
  return (
    <Card>
      <BillInfo {...bill} />
      
      {/* Conditional voting */}
      {user ? (
        <VoteButtons 
          onVote={handleVote}
          currentVote={bill.userVote}
        />
      ) : (
        <AuthPrompt 
          message="Sign in to vote on this bill"
          icon={<ThumbsUp />}
          action="vote"
        />
      )}
      
      {/* Conditional impact score */}
      {user ? (
        <ImpactScore score={bill.impactScore} />
      ) : isBrowsing && (
        <LockedFeature 
          title="Personal Impact Score"
          description="See how this affects you"
        />
      )}
    </Card>
  )
}
```

### 5. Reusable Components

#### AuthPrompt Component
```typescript
// components/auth/AuthPrompt.tsx
interface AuthPromptProps {
  message: string
  icon?: ReactNode
  action?: string
  variant?: 'inline' | 'modal' | 'toast'
}

export function AuthPrompt({ message, icon, action, variant = 'inline' }) {
  const router = useRouter()
  
  const handleClick = () => {
    // Track what feature prompted signup
    localStorage.setItem('signupPrompt', action || 'unknown')
    router.push('/register')
  }
  
  if (variant === 'inline') {
    return (
      <button 
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        {icon}
        <span className="text-sm text-gray-600">{message}</span>
        <ChevronRight size={16} />
      </button>
    )
  }
  
  // Other variants...
}
```

#### LockedFeature Component
```typescript
// components/auth/LockedFeature.tsx
export function LockedFeature({ title, description, preview }) {
  return (
    <div className="relative">
      {preview && (
        <div className="opacity-50 blur-sm pointer-events-none">
          {preview}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="text-center p-4">
          <Lock className="mx-auto mb-2 text-gray-400" />
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
          <Link href="/register" className="text-delta text-sm mt-2">
            Unlock with free account →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## Routes Classification

### Always Public (No Auth Required)
- `/` - Landing page
- `/browse/*` - Browse bills and reps
- `/bill/[id]` - Individual bill pages (view only)
- `/representatives` - List of representatives (view only)
- `/about` - About page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Authenticated Only
- `/dashboard` - Personal dashboard
- `/my-votes` - Voting history
- `/settings` - Account settings
- `/impact` - Personal impact analysis
- `/saved` - Saved bills

### Mixed Access (Different features by auth state)
- `/feed` - Can browse, but no voting without auth
- `/representatives/[id]` - Can view, but no contact without auth

## Conversion Strategy

### Entry Points for Conversion
1. **Voting attempt** - "Sign in to make your voice heard"
2. **Impact score** - "See how this affects you personally"
3. **Save bill** - "Save bills to track them"
4. **Contact rep** - "Sign in to contact your representative"
5. **View history** - "Track your civic engagement"

### Conversion Funnel Metrics to Track
```typescript
// Analytics events
{
  'browse_session_start': timestamp,
  'auth_prompt_shown': { location, feature },
  'auth_prompt_clicked': { location, feature },
  'registration_started': { trigger },
  'registration_completed': { timeFromBrowse },
  'feature_unlocked': { feature, timeToUnlock }
}
```

## Security Considerations

### Rate Limiting
```typescript
// Different limits for browse vs auth
const RATE_LIMITS = {
  browse: {
    requests_per_minute: 30,
    bills_per_hour: 100
  },
  authenticated: {
    requests_per_minute: 100,
    bills_per_hour: 1000
  }
}
```

### Data Protection
- No PII exposed in browse mode
- Vote counts aggregated only
- Representative contact info requires auth
- IP-based rate limiting for browse mode

## Performance Optimizations

### Caching Strategy
```typescript
// Cache public data aggressively
const CACHE_DURATIONS = {
  public_bills: 5 * 60, // 5 minutes
  public_reps: 60 * 60, // 1 hour
  user_specific: 0 // No caching
}
```

### CDN Configuration
- Static pages for all public routes
- Edge caching for public API responses
- Geolocation-based routing

## Testing Plan

### Unit Tests
- [ ] Middleware route protection
- [ ] API conditional responses
- [ ] Component auth states
- [ ] Conversion tracking

### Integration Tests
- [ ] Browse flow end-to-end
- [ ] Auth flow end-to-end
- [ ] Browse → Auth conversion
- [ ] Rate limiting

### User Acceptance Tests
- [ ] Can browse without signup
- [ ] Clear CTAs for features
- [ ] Smooth conversion flow
- [ ] No data leakage

## Rollout Strategy

### Phase 1: Soft Launch (Week 1)
- Enable for 10% of traffic
- Monitor conversion rates
- Gather user feedback

### Phase 2: Expansion (Week 2)
- Increase to 50% of traffic
- A/B test CTA messaging
- Optimize based on data

### Phase 3: Full Launch (Week 3)
- 100% of traffic
- Marketing campaign
- Monitor and iterate

## Success Metrics

### Primary KPIs
- **Conversion Rate**: Browse → Registered (Target: 15%)
- **Engagement Rate**: Actions per browse session (Target: 3+)
- **Time to Convert**: Browse start → Registration (Target: <7 days)

### Secondary Metrics
- Bounce rate reduction
- Page views per session increase
- Feature discovery rate
- Return visitor rate

## Rollback Plan

If issues arise:
1. Revert middleware changes
2. Re-enable ProtectedRoute on all pages
3. Clear CDN cache
4. Notify users of temporary change

## Dependencies

### Technical
- Next.js 14+ (for middleware support)
- Redis (for rate limiting)
- Analytics platform (for conversion tracking)

### Team
- Frontend: Component updates
- Backend: API modifications  
- DevOps: Caching and CDN setup
- Design: CTA and prompt designs
- Product: Conversion optimization

## Timeline Estimate

**Total Duration:** 4 weeks

- Week 1: Foundation and API updates
- Week 2: Frontend implementation
- Week 3: Testing and optimization
- Week 4: Rollout and monitoring

## Future Enhancements

After initial implementation:
1. **Personalized CTAs** based on browse behavior
2. **Progressive feature unlocking** (gamification)
3. **Social proof** in conversion prompts
4. **A/B testing** framework for CTAs
5. **ML-based** conversion prediction

## Notes

- Consider GDPR compliance for browse mode tracking
- Ensure accessibility of auth prompts
- Mobile experience is critical for browse mode
- Consider implementing "guest checkout" pattern for one-time actions

---

**Document maintained by:** Development Team
**Last updated:** January 23, 2025
**Review schedule:** Before implementation begins