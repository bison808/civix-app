# CITZN Legislative Architecture Plan
## Bills & Committee Expansion Strategy

### Executive Summary
This document outlines the comprehensive architecture for expanding CITZN's legislative functionality to include enhanced bills tracking, committee functionality, and deep user engagement analytics. The plan builds on the existing robust political mapping system (40 files, 17K lines) and integrates with current bill service infrastructure.

### Current System Analysis

#### Strengths
- **Robust Political Mapping**: Comprehensive ZIP-to-representative system covering federal, state, and local levels
- **Existing Bills Service**: Well-structured bills.service.ts with comprehensive API methods
- **Performance Optimized**: Existing caching, progressive loading, and performance monitoring
- **Mobile-First Design**: Responsive layouts with established UI patterns
- **Type Safety**: Complete TypeScript coverage with detailed type definitions

#### Gaps Identified
- **Committee Integration**: Bills reference committees but no committee service exists
- **User Engagement Tracking**: Limited analytics on user voting patterns and interests
- **Representative-Bill Connection**: No linking between user's representatives and their authored/sponsored bills
- **Legislative Calendar**: Missing committee meeting schedules and important dates

---

## 1. Data Architecture Design

### New Services Architecture

```typescript
// services/committee.service.ts
interface CommitteeService {
  // Committee data management
  getCommittees(filter?: CommitteeFilter): Promise<Committee[]>
  getCommitteeById(id: string): Promise<Committee>
  getCommitteeMembers(committeeId: string): Promise<Representative[]>
  getCommitteeSchedule(committeeId: string): Promise<CommitteeMeeting[]>
  
  // Bill-committee relationships
  getCommitteeBills(committeeId: string): Promise<Bill[]>
  getBillCommitteeHistory(billId: string): Promise<CommitteeAction[]>
  
  // User representative committee memberships
  getUserRepresentativeCommittees(zipCode: string): Promise<Committee[]>
}

// services/userEngagement.service.ts
interface UserEngagementService {
  // User activity tracking
  trackBillView(userId: string, billId: string): Promise<void>
  trackVote(userId: string, billId: string, vote: VoteType): Promise<void>
  trackRepresentativeContact(userId: string, repId: string): Promise<void>
  
  // Analytics and insights
  getUserEngagementScore(userId: string): Promise<EngagementMetrics>
  getUserInterests(userId: string): Promise<InterestProfile>
  getPersonalizedBills(userId: string, zipCode: string): Promise<Bill[]>
  
  // Civic goals and gamification
  getUserGoals(userId: string): Promise<CivicGoal[]>
  updateGoalProgress(userId: string, goalId: string): Promise<void>
}

// services/legislativeCalendar.service.ts
interface LegislativeCalendarService {
  // Calendar management
  getUpcomingHearings(zipCode?: string): Promise<CommitteeMeeting[]>
  getBillSchedule(billId: string): Promise<LegislativeEvent[]>
  getCommitteeMeetings(committeeId: string, dateRange?: DateRange): Promise<CommitteeMeeting[]>
  
  // Notifications and reminders
  subscribeToCommitteeUpdates(userId: string, committeeId: string): Promise<void>
  getPersonalizedCalendar(userId: string, zipCode: string): Promise<LegislativeEvent[]>
}
```

### Enhanced Type Definitions

```typescript
// types/committee.types.ts
export interface Committee {
  id: string;
  name: string;
  chamber: 'House' | 'Senate' | 'Joint' | 'State Assembly' | 'State Senate';
  type: 'Standing' | 'Subcommittee' | 'Select' | 'Joint' | 'Special';
  jurisdiction: string[];
  members: CommitteeMember[];
  chair: CommitteeMember;
  rankingMember?: CommitteeMember;
  currentBills: string[];
  upcomingMeetings: CommitteeMeeting[];
  level: 'federal' | 'state' | 'local';
}

export interface CommitteeMember {
  representativeId: string;
  name: string;
  party: string;
  role: 'Chair' | 'Ranking Member' | 'Vice Chair' | 'Member';
  seniority: number;
}

export interface CommitteeMeeting {
  id: string;
  committeeId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: AgendaItem[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  streamingUrl?: string;
  transcriptUrl?: string;
}

export interface AgendaItem {
  id: string;
  type: 'Bill Review' | 'Hearing' | 'Markup' | 'Business Meeting';
  billId?: string;
  title: string;
  estimatedTime: number;
  witnesses?: Witness[];
}

// types/userEngagement.types.ts
export interface EngagementMetrics {
  userId: string;
  totalBillsViewed: number;
  totalVotesCast: number;
  representativesContacted: number;
  committeesFollowed: number;
  engagementScore: number; // 0-100
  streakDays: number;
  lastActiveDate: string;
  topIssues: string[];
}

export interface InterestProfile {
  userId: string;
  subjects: SubjectInterest[];
  committees: string[];
  representatives: string[];
  billTypes: BillTypePreference[];
  engagementStyle: 'Casual' | 'Regular' | 'Activist' | 'Professional';
  lastUpdated: string;
}

export interface SubjectInterest {
  subject: string;
  score: number; // 0-1, calculated from user behavior
  confidence: number; // How confident we are in this interest
  lastInteraction: string;
}

export interface CivicGoal {
  id: string;
  userId: string;
  type: 'bills_reviewed' | 'representatives_contacted' | 'meetings_attended';
  title: string;
  description: string;
  target: number;
  current: number;
  deadline?: string;
  completed: boolean;
  completedDate?: string;
}

// types/legislativeCalendar.types.ts
export interface LegislativeEvent {
  id: string;
  type: 'Committee Meeting' | 'Floor Vote' | 'Hearing' | 'Markup' | 'Recess';
  title: string;
  date: string;
  time?: string;
  location: string;
  committeeId?: string;
  billsConsidered: string[];
  relevanceScore?: number; // How relevant to user based on their interests
  userRepresentativeInvolved: boolean;
}
```

---

## 2. API Integration Strategy

### Congress API Enhancement
```typescript
// Enhanced Congress API integration
class CongressApiService {
  // Committee data
  async getCommittees(congress: number = 118): Promise<Committee[]>
  async getCommitteeMembers(committeeCode: string): Promise<CommitteeMember[]>
  async getCommitteeBills(committeeCode: string): Promise<Bill[]>
  
  // Hearing and meeting schedules
  async getCommitteeHearings(committeeCode: string, dateRange?: DateRange): Promise<CommitteeMeeting[]>
  async getFloorSchedule(chamber: 'house' | 'senate'): Promise<LegislativeEvent[]>
  
  // Member-bill relationships
  async getMemberSponsoredBills(memberId: string): Promise<Bill[]>
  async getMemberCommitteeAssignments(memberId: string): Promise<Committee[]>
}
```

### California Legislative API Integration
```typescript
// State-level legislative data
class CaliforniaLegislativeApi {
  // California-specific committee structure
  async getCaliforniaCommittees(session: string): Promise<Committee[]>
  async getCommitteeCalendar(committeeId: string): Promise<CommitteeMeeting[]>
  
  // Bill tracking through California legislature
  async getCaliforniaBillsByCommittee(committeeId: string): Promise<Bill[]>
  async getBillHearingSchedule(billId: string): Promise<LegislativeEvent[]>
}
```

### API Endpoints Strategy
```typescript
// New API routes to implement
/api/committees
  GET /                           # List committees with filtering
  GET /:id                       # Get committee details
  GET /:id/members              # Committee members
  GET /:id/bills                # Bills in committee
  GET /:id/meetings             # Committee meeting schedule
  GET /:id/subscribe            # Subscribe to committee updates

/api/user-engagement
  POST /track-view              # Track bill/committee view
  POST /track-vote              # Track user vote
  POST /track-contact          # Track representative contact
  GET /metrics/:userId         # User engagement metrics
  GET /interests/:userId       # User interest profile
  GET /goals/:userId           # User civic goals

/api/legislative-calendar
  GET /upcoming-hearings       # Upcoming hearings (filtered by location)
  GET /personal-calendar       # Personalized legislative calendar
  GET /bill-schedule/:billId   # Specific bill's legislative timeline

/api/representatives/enhanced
  GET /:id/committees          # Representative's committee memberships
  GET /:id/sponsored-bills     # Bills sponsored by representative
  GET /:id/committee-activity  # Committee activity and voting record
```

---

## 3. Database Schema for User Engagement

### Core Engagement Tables
```sql
-- User engagement tracking
CREATE TABLE user_engagement_metrics (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  total_bills_viewed INTEGER DEFAULT 0,
  total_votes_cast INTEGER DEFAULT 0,
  representatives_contacted INTEGER DEFAULT 0,
  committees_followed INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity log
CREATE TABLE user_activities (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'bill_view', 'vote_cast', 'rep_contact', etc.
  entity_id VARCHAR(255), -- bill_id, representative_id, committee_id
  entity_type VARCHAR(50), -- 'bill', 'representative', 'committee'
  metadata JSONB, -- Additional activity data
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interest profiles
CREATE TABLE user_interests (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  score DECIMAL(3,2) DEFAULT 0, -- 0-1 interest score
  confidence DECIMAL(3,2) DEFAULT 0, -- Confidence in the interest
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, subject)
);

-- Civic goals and gamification
CREATE TABLE civic_goals (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  deadline TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Committee subscriptions
CREATE TABLE user_committee_subscriptions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  committee_id VARCHAR(255) NOT NULL,
  notification_preferences JSONB, -- Email, push, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, committee_id)
);
```

### Committee and Calendar Tables
```sql
-- Committee information
CREATE TABLE committees (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  chamber VARCHAR(50) NOT NULL,
  committee_type VARCHAR(50) NOT NULL,
  jurisdiction TEXT[],
  chair_id VARCHAR(255),
  ranking_member_id VARCHAR(255),
  level VARCHAR(20) NOT NULL, -- 'federal', 'state', 'local'
  parent_committee_id VARCHAR(255), -- For subcommittees
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Committee meetings and hearings
CREATE TABLE committee_meetings (
  id UUID PRIMARY KEY,
  committee_id VARCHAR(255) NOT NULL REFERENCES committees(id),
  title VARCHAR(500) NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME,
  location VARCHAR(500),
  agenda JSONB, -- Structured agenda data
  status VARCHAR(50) DEFAULT 'Scheduled',
  streaming_url VARCHAR(500),
  transcript_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills-Committee relationship tracking
CREATE TABLE bill_committee_actions (
  id UUID PRIMARY KEY,
  bill_id VARCHAR(255) NOT NULL,
  committee_id VARCHAR(255) NOT NULL REFERENCES committees(id),
  action_type VARCHAR(100) NOT NULL, -- 'Referred', 'Markup', 'Reported', etc.
  action_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. UI/UX Flow Diagrams

### Enhanced Bills Page Flow
```
Bills Page (Rebranded from Feed)
├── Header with Search & Filters
├── Personalization Controls
│   ├── "Show bills from my representatives"
│   ├── "Filter by my interests"
│   └── "Committee activity alerts"
├── Bills Feed
│   ├── Enhanced Bill Cards
│   │   ├── Committee status indicator
│   │   ├── "Your rep's position" badge
│   │   ├── Upcoming hearing alerts
│   │   └── Engagement actions
│   └── Infinite scroll with performance optimization
└── Footer with Engagement Summary
    ├── "Bills reviewed today: X"
    ├── "Streak: X days"
    └── Quick civic goals progress
```

### New Committee Page Flow
```
Committee Page (New)
├── Committee Discovery
│   ├── "Committees your reps serve on"
│   ├── "By subject area"
│   └── "Most active committees"
├── Committee Detail View
│   ├── Committee info and members
│   ├── Current bills under consideration
│   ├── Meeting schedule
│   ├── Recent activity timeline
│   └── Subscription controls
├── Meeting Detail View
│   ├── Agenda with bill links
│   ├── Live stream integration (if available)
│   ├── Witness list and testimonies
│   └── Meeting outcomes and votes
└── My Committees Dashboard
    ├── Subscribed committees
    ├── Upcoming meetings I'm following
    ├── Bills moving through committees
    └── Notification preferences
```

### Enhanced Dashboard Integration
```
Dashboard Enhancements
├── Civic Engagement Score
│   ├── Visual progress ring
│   ├── Breakdown by activity type
│   └── Comparison to peers (anonymized)
├── My Legislative Activity
│   ├── Bills I'm following
│   ├── Committees I'm subscribed to
│   ├── Representatives I've contacted
│   └── Recent votes and feedback
├── Personalized Insights
│   ├── "Bills from your representatives"
│   ├── "Committees with your interests"
│   ├── "Upcoming hearings to watch"
│   └── "Action opportunities"
└── Civic Goals Progress
    ├── Current goals with progress bars
    ├── Achievement badges
    ├── Streak tracking
    └── Goal setting wizard
```

---

## 5. Integration Plan with Political Mapping System

### Leveraging Existing Infrastructure

#### 1. Representative-Committee Connection
```typescript
// Enhanced representatives service
class EnhancedRepresentativesService {
  async getRepresentativeCommittees(repId: string): Promise<Committee[]> {
    // Use existing representative data to fetch committee memberships
    const committees = await this.committeeService.getCommitteesByMember(repId);
    return committees;
  }
  
  async getUserRepresentativeCommittees(zipCode: string): Promise<Committee[]> {
    // Leverage existing ZIP-to-rep mapping
    const representatives = await this.getByZipCode(zipCode);
    const allCommittees = await Promise.all(
      representatives.map(rep => this.getRepresentativeCommittees(rep.id))
    );
    return allCommittees.flat();
  }
}
```

#### 2. Personalized Bill Discovery
```typescript
// Enhanced bills service with representative connection
class EnhancedBillsService {
  async getPersonalizedBills(zipCode: string): Promise<Bill[]> {
    // Get user's representatives
    const userReps = await representativesService.getByZipCode(zipCode);
    
    // Get bills sponsored by user's representatives
    const sponsoredBills = await Promise.all(
      userReps.map(rep => this.getBillsBySponsor(rep.id))
    );
    
    // Get bills in committees where user's reps serve
    const userCommittees = await Promise.all(
      userReps.map(rep => committeeService.getRepresentativeCommittees(rep.id))
    );
    const committeeBills = await Promise.all(
      userCommittees.flat().map(committee => this.getBillsByCommittee(committee.id))
    );
    
    // Combine and rank by relevance
    return this.rankBillsByRelevance([...sponsoredBills.flat(), ...committeeBills.flat()]);
  }
}
```

#### 3. Geographic Context Preservation
```typescript
// Maintain existing geographic accuracy while adding legislative context
class GeographicLegislativeService {
  async getLegislativeContextForZip(zipCode: string): Promise<LegislativeContext> {
    // Use existing ZIP mapping infrastructure
    const politicalMapping = await zipMappingService.getCompletePoliticalMapping(zipCode);
    
    // Add legislative committee context
    const committees = await this.getUserRepresentativeCommittees(zipCode);
    const relevantBills = await this.getBillsRelevantToLocation(zipCode);
    const upcomingHearings = await this.getLocallyRelevantHearings(zipCode);
    
    return {
      representatives: politicalMapping.representatives,
      committees,
      relevantBills,
      upcomingHearings,
      jurisdictionalContext: politicalMapping.jurisdictions
    };
  }
}
```

### Performance Integration Strategy

#### 1. Caching Strategy Extension
```typescript
// Extend existing cache management for committee/legislative data
class EnhancedCacheManager extends CacheManager {
  // Committee data caching
  async getCommitteeWithCache(committeeId: string): Promise<Committee> {
    return this.getCachedOrFetch(
      `committee:${committeeId}`,
      () => committeeService.getCommitteeById(committeeId),
      { ttl: 24 * 60 * 60 * 1000 } // 24 hours
    );
  }
  
  // User engagement data caching
  async getUserEngagementWithCache(userId: string): Promise<EngagementMetrics> {
    return this.getCachedOrFetch(
      `engagement:${userId}`,
      () => userEngagementService.getUserEngagementScore(userId),
      { ttl: 60 * 60 * 1000 } // 1 hour
    );
  }
}
```

#### 2. Progressive Loading for Legislative Data
```typescript
// Extend existing progressive loading patterns
class LegislativeProgressiveLoader {
  async loadCommitteeDataProgressively(committeeId: string): Observable<Committee> {
    // Load basic committee info first
    const basicInfo = await committeeService.getBasicCommitteeInfo(committeeId);
    yield basicInfo;
    
    // Load members in background
    const members = await committeeService.getCommitteeMembers(committeeId);
    yield { ...basicInfo, members };
    
    // Load bills and meetings
    const [bills, meetings] = await Promise.all([
      committeeService.getCommitteeBills(committeeId),
      committeeService.getCommitteeSchedule(committeeId)
    ]);
    yield { ...basicInfo, members, bills, meetings };
  }
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create committee service and types
- [ ] Implement basic committee API endpoints
- [ ] Add committee data to existing bill types
- [ ] Create user engagement tracking service

### Phase 2: Core Features (Weeks 3-4)
- [ ] Build Committee page with basic functionality
- [ ] Enhance Bills page with committee information
- [ ] Implement user engagement metrics
- [ ] Add committee meeting calendar

### Phase 3: Personalization (Weeks 5-6)
- [ ] Connect user representatives to committee memberships
- [ ] Implement personalized bill recommendations
- [ ] Add civic goals and gamification
- [ ] Create legislative calendar integration

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Real-time meeting updates
- [ ] Advanced analytics dashboard
- [ ] Committee subscription system
- [ ] Mobile app enhancements

### Phase 5: Optimization (Weeks 9-10)
- [ ] Performance optimization and caching
- [ ] Analytics and monitoring
- [ ] User testing and refinement
- [ ] Documentation and deployment

---

## 7. Success Metrics

### User Engagement Metrics
- **Committee Page Usage**: Monthly active users on committee pages
- **Legislative Calendar Engagement**: Users checking upcoming hearings
- **Personalization Effectiveness**: Click-through rates on personalized recommendations
- **Civic Goal Completion**: Percentage of users completing civic goals

### Technical Performance Metrics
- **Page Load Times**: Maintain <1.2s load times with new features
- **API Response Times**: Committee and engagement APIs <200ms
- **Cache Hit Rates**: >90% for committee and representative data
- **Mobile Performance**: Core Web Vitals scores maintained

### Business Impact Metrics
- **User Retention**: Increase in monthly active users
- **Session Duration**: Time spent on enhanced Bills and Committee pages
- **Representative Contact Rate**: Increase in users contacting representatives
- **Legislative Awareness**: User surveys on legislative knowledge

---

## 8. Risk Mitigation

### Technical Risks
- **Data Volume**: Large committee/meeting datasets - mitigate with efficient caching
- **API Rate Limits**: Congress API limits - implement smart caching and fallbacks
- **Real-time Updates**: Meeting schedule changes - build robust sync mechanisms

### User Experience Risks
- **Information Overload**: Too much legislative detail - focus on progressive disclosure
- **Complexity**: Committee structures can be complex - simplify with clear categorization
- **Privacy Concerns**: Tracking user engagement - ensure transparent, anonymous tracking

### Integration Risks
- **Performance Impact**: New features affecting existing performance - continuous monitoring
- **Data Consistency**: Committee-bill relationships - implement validation and reconciliation
- **Backward Compatibility**: Ensure existing features continue working seamlessly

---

## Conclusion

This architectural plan builds strategically on CITZN's existing strengths in political mapping and bill tracking to create a comprehensive legislative engagement platform. By leveraging the robust foundation of representative services and adding sophisticated committee functionality and user engagement tracking, we can transform CITZN into the premier civic engagement platform.

The integration approach ensures that new features enhance rather than complicate the existing user experience, while the performance optimization strategy maintains the platform's excellent speed and responsiveness standards.

Success will be measured not just by technical metrics, but by meaningful increases in civic engagement and legislative awareness among our users.