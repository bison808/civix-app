# DELTA Frontend Architecture

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Accessibility**: React Aria

## Directory Structure
```
/agent4_frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/             # Auth routes
│   │   ├── (main)/             # Main app routes
│   │   │   ├── feed/           # Bill feed
│   │   │   ├── bill/[id]/      # Bill detail
│   │   │   ├── impact/         # Impact visualizations
│   │   │   └── representatives/# Rep scoreboard
│   │   ├── onboarding/         # Onboarding flow
│   │   └── settings/           # User settings
│   ├── components/
│   │   ├── core/               # Core UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   └── Toast/
│   │   ├── feedback/           # Feedback components
│   │   │   ├── LikeDislike/
│   │   │   └── CommentBox/
│   │   ├── bills/              # Bill-related components
│   │   │   ├── BillCard/
│   │   │   ├── BillFeed/
│   │   │   └── BillFilter/
│   │   ├── impact/             # Impact visualizations
│   │   │   ├── ImpactChart/
│   │   │   └── ImpactSummary/
│   │   └── layout/             # Layout components
│   │       ├── Header/
│   │       ├── Navigation/
│   │       └── Footer/
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   ├── styles/                 # Global styles
│   └── types/                  # TypeScript definitions

## Component Architecture

### Design System Tokens
```typescript
const theme = {
  colors: {
    primary: '#1E40AF',    // Trust blue
    secondary: '#10B981',  // Action green
    accent: '#F59E0B',     // Alert amber
    delta: '#7C3AED',      // Delta purple
    positive: '#22C55E',   // Like green
    negative: '#EF4444',   // Dislike red
    neutral: '#6B7280',    // Gray scale
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  }
}
```

## Core User Flows

### 1. First-Time User Onboarding
```
Landing → ZIP Verification → Interest Selection → Notification Setup → Home Feed
```

### 2. Bill Interaction Flow
```
Feed → Bill Preview → Full Detail → Like/Dislike → Optional Comment → Impact View
```

### 3. Representative Engagement
```
Bill → Representative Vote → Scorecard → Contact Options
```

## Performance Requirements
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 200KB initial
- **Image Optimization**: Next.js Image with WebP
- **Code Splitting**: Dynamic imports for routes

## Accessibility Standards
- WCAG 2.1 AA Compliance
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast ratios
- ARIA labels and roles

## Mobile-First Responsive Strategy
1. **Touch-First Interactions**
   - Min touch target: 44x44px
   - Swipe gestures for navigation
   - Pull-to-refresh on feeds

2. **Progressive Enhancement**
   - Core functionality without JS
   - Enhanced features with JS
   - Offline reading capability

3. **Breakpoint Strategy**
   - Mobile: 320-767px (base)
   - Tablet: 768-1023px
   - Desktop: 1024px+

## State Management Pattern
```typescript
interface AppState {
  user: {
    zipCode: string;
    interests: string[];
    notifications: NotificationPrefs;
  };
  bills: {
    feed: Bill[];
    filters: BillFilters;
    selectedBill: Bill | null;
  };
  feedback: {
    likes: string[];
    dislikes: string[];
    comments: Map<string, string>;
  };
}
```

## API Integration Points
- `/api/bills` - Agent 1 data API
- `/api/simplified` - Agent 2 content API
- `/api/auth` - Agent 3 auth API
- `/api/feedback` - Feedback submission
- `/api/notifications` - Push notifications

## Component Examples

### One-Click Feedback
```typescript
<FeedbackButton
  billId={bill.id}
  onLike={() => handleFeedback('like')}
  onDislike={() => handleFeedback('dislike')}
  showComment={true}
/>
```

### Bill Card
```typescript
<BillCard
  title={bill.title}
  summary={bill.simplifiedSummary}
  impact={bill.personalImpact}
  deadline={bill.voteDate}
  representatives={bill.reps}
/>
```

### Impact Visualization
```typescript
<ImpactChart
  type="personal"
  data={bill.impacts}
  animated={true}
  interactive={true}
/>
```