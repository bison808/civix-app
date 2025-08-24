# CITZN API Integration Detailed Specification
## Legislative Expansion Implementation Guide

### Overview
This document provides detailed specifications for integrating Congress API, California Legislative API, and other data sources to support the enhanced Bills and Committee functionality in the CITZN platform.

---

## 1. Congress API Integration

### Base Configuration
```typescript
// services/api/congressApi.ts
class CongressApiClient {
  private baseURL = 'https://api.congress.gov/v3';
  private apiKey: string;
  private rateLimit = {
    requestsPerHour: 5000,
    requestsPerSecond: 10
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    // Rate limiting implementation
    await this.rateLimiter.waitForSlot();
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new CongressApiError(response.status, await response.text());
    }
    
    return response.json();
  }
}
```

### Committee Data Integration
```typescript
// services/committee.service.ts
class CommitteeService {
  private congressApi: CongressApiClient;
  private cacheManager: CacheManager;
  
  /**
   * Fetch all committees for current Congress
   * Congress API: /committee/{congress}/{chamber}
   */
  async getCommittees(filter?: CommitteeFilter): Promise<Committee[]> {
    const cacheKey = `committees:${JSON.stringify(filter)}`;
    
    return this.cacheManager.getCachedOrFetch(
      cacheKey,
      async () => {
        const houseCommittees = await this.congressApi.makeRequest('/committee/118/house', {
          limit: 250
        });
        
        const senateCommittees = await this.congressApi.makeRequest('/committee/118/senate', {
          limit: 250
        });
        
        const allCommittees = [
          ...this.parseCongressCommittees(houseCommittees.committees, 'House'),
          ...this.parseCongressCommittees(senateCommittees.committees, 'Senate')
        ];
        
        return this.applyCommitteeFilters(allCommittees, filter);
      },
      { ttl: 24 * 60 * 60 * 1000 } // 24 hours
    );
  }
  
  /**
   * Get detailed committee information including members
   * Congress API: /committee/{congress}/{chamber}/{committeeCode}
   */
  async getCommitteeById(id: string): Promise<Committee> {
    const cacheKey = `committee:${id}`;
    
    return this.cacheManager.getCachedOrFetch(
      cacheKey,
      async () => {
        const [chamber, committeeCode] = this.parseCommitteeId(id);
        
        // Get committee details
        const committeeData = await this.congressApi.makeRequest(
          `/committee/118/${chamber}/${committeeCode}`
        );
        
        // Get committee members
        const membersData = await this.congressApi.makeRequest(
          `/committee/118/${chamber}/${committeeCode}/member`
        );
        
        return this.parseCommitteeWithMembers(committeeData.committee, membersData.members);
      },
      { ttl: 12 * 60 * 60 * 1000 } // 12 hours
    );
  }
  
  /**
   * Get committee meeting/hearing schedule
   * Congress API: /committee/118/{chamber}/{committeeCode}/hearing
   */
  async getCommitteeSchedule(committeeId: string, dateRange?: DateRange): Promise<CommitteeMeeting[]> {
    const [chamber, committeeCode] = this.parseCommitteeId(committeeId);
    
    const hearingsData = await this.congressApi.makeRequest(
      `/committee/118/${chamber}/${committeeCode}/hearing`,
      {
        fromDateTime: dateRange?.start || new Date().toISOString(),
        toDateTime: dateRange?.end || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    );
    
    return hearingsData.hearings.map(this.parseCommitteeHearing);
  }
  
  /**
   * Get bills currently in committee
   * Congress API: /bill/{congress}/{billType}?committeeCode={code}
   */
  async getCommitteeBills(committeeId: string): Promise<Bill[]> {
    const [chamber, committeeCode] = this.parseCommitteeId(committeeId);
    
    const billTypes = ['hr', 'hres', 'hjres', 'hconres', 's', 'sres', 'sjres', 'sconres'];
    
    const allBills = await Promise.all(
      billTypes.map(async (billType) => {
        try {
          const billsData = await this.congressApi.makeRequest(`/bill/118/${billType}`, {
            committeeCode,
            limit: 250
          });
          return billsData.bills.map(this.parseBillData);
        } catch (error) {
          console.warn(`Failed to fetch ${billType} bills for committee ${committeeId}:`, error);
          return [];
        }
      })
    );
    
    return allBills.flat().sort((a, b) => 
      new Date(b.lastActionDate).getTime() - new Date(a.lastActionDate).getTime()
    );
  }
  
  /**
   * Track bill progress through committees
   * Congress API: /bill/{congress}/{billType}/{billNumber}/committees
   */
  async getBillCommitteeHistory(billId: string): Promise<CommitteeAction[]> {
    const { congress, billType, billNumber } = this.parseBillId(billId);
    
    const committeeData = await this.congressApi.makeRequest(
      `/bill/${congress}/${billType}/${billNumber}/committees`
    );
    
    return committeeData.committees.map(this.parseCommitteeAction);
  }
}
```

### Bill Enhancement Integration
```typescript
// Enhanced bills service with committee integration
class EnhancedBillsService extends BillsService {
  /**
   * Get bills with enhanced committee information
   */
  async getBillsWithCommitteeData(filter?: BillFilter): Promise<Bill[]> {
    const bills = await super.getBills(filter);
    
    // Enhance with committee information
    const enhancedBills = await Promise.all(
      bills.bills.map(async (bill) => {
        try {
          const committeeHistory = await this.committeeService.getBillCommitteeHistory(bill.id);
          const currentCommittees = await this.getCurrentCommittees(bill.id);
          
          return {
            ...bill,
            committeeHistory,
            currentCommittees,
            nextCommitteeAction: this.predictNextCommitteeAction(committeeHistory)
          };
        } catch (error) {
          console.warn(`Failed to enhance bill ${bill.id} with committee data:`, error);
          return bill;
        }
      })
    );
    
    return enhancedBills;
  }
  
  /**
   * Get personalized bills based on user's representatives' committee memberships
   */
  async getPersonalizedBillsByCommittees(zipCode: string): Promise<Bill[]> {
    // Get user's representatives
    const representatives = await this.representativesService.getByZipCode(zipCode);
    
    // Get committees where user's representatives serve
    const userCommittees = await Promise.all(
      representatives.map(rep => this.committeeService.getRepresentativeCommittees(rep.id))
    );
    
    // Get bills from those committees
    const committeeBills = await Promise.all(
      userCommittees.flat().map(committee => this.committeeService.getCommitteeBills(committee.id))
    );
    
    // Deduplicate and rank by relevance
    const uniqueBills = this.deduplicateBills(committeeBills.flat());
    return this.rankBillsByUserRelevance(uniqueBills, zipCode);
  }
}
```

---

## 2. California State Legislative API Integration

### California Legislative Information Service
```typescript
// services/californiaLegislative.service.ts
class CaliforniaLegislativeService {
  private baseURL = 'http://leginfo.legislature.ca.gov/faces/billNavClient.xhtml';
  private apiURL = 'https://legiscan.com/api/?key={API_KEY}';
  
  /**
   * Get California committees
   * Using LegiScan API for California state data
   */
  async getCaliforniaCommittees(session: string = '20232024'): Promise<Committee[]> {
    const response = await fetch(`${this.apiURL}&op=getDataset&id=CA&session=${session}`);
    const data = await response.json();
    
    // Parse committee data from California legislative system
    return data.dataset.committees.map(this.parseCaliforniaCommittee);
  }
  
  /**
   * Get California bill data with committee assignments
   */
  async getCaliforniaBills(filter?: BillFilter): Promise<Bill[]> {
    const session = this.getCurrentCaliforniaSession();
    
    const response = await fetch(`${this.apiURL}&op=getBillsBySubject&id=CA&session=${session}`);
    const data = await response.json();
    
    return data.bills.map(this.parseCaliforniaBill);
  }
  
  /**
   * Get hearing schedules from California Legislature
   */
  async getCaliforniaHearings(dateRange?: DateRange): Promise<CommitteeMeeting[]> {
    // California provides RSS feeds and calendar data
    const calendarURL = 'http://www.legislature.ca.gov/calendar.html';
    
    // Implementation would parse calendar data or use web scraping
    // for committee hearing schedules
    return this.parseCaliforniaHearings(calendarURL, dateRange);
  }
}
```

---

## 3. User Engagement API Implementation

### Engagement Tracking Service
```typescript
// services/userEngagement.service.ts
class UserEngagementService {
  private database: Database;
  private analyticsService: AnalyticsService;
  
  /**
   * Track user activity with bills and committees
   */
  async trackActivity(activity: UserActivity): Promise<void> {
    // Store in database
    await this.database.userActivities.create({
      userId: activity.userId,
      activityType: activity.type,
      entityId: activity.entityId,
      entityType: activity.entityType,
      metadata: activity.metadata,
      timestamp: new Date()
    });
    
    // Update engagement metrics
    await this.updateEngagementMetrics(activity.userId, activity.type);
    
    // Send to analytics service
    this.analyticsService.track('user_activity', {
      userId: activity.userId,
      activity: activity.type,
      entity: activity.entityType
    });
  }
  
  /**
   * Calculate and update user engagement score
   */
  async updateEngagementMetrics(userId: string, activityType: string): Promise<void> {
    const metrics = await this.getUserEngagementScore(userId);
    
    const updates: Partial<EngagementMetrics> = {};
    
    switch (activityType) {
      case 'bill_view':
        updates.totalBillsViewed = metrics.totalBillsViewed + 1;
        break;
      case 'vote_cast':
        updates.totalVotesCast = metrics.totalVotesCast + 1;
        break;
      case 'representative_contact':
        updates.representativesContacted = metrics.representativesContacted + 1;
        break;
      case 'committee_follow':
        updates.committeesFollowed = metrics.committeesFollowed + 1;
        break;
    }
    
    // Update engagement score
    updates.engagementScore = this.calculateEngagementScore(metrics, updates);
    updates.lastActiveDate = new Date().toISOString();
    
    // Update streak
    updates.streakDays = this.calculateStreak(userId, metrics.lastActiveDate);
    
    await this.database.userEngagementMetrics.update(userId, updates);
  }
  
  /**
   * Get personalized bill recommendations based on user behavior
   */
  async getPersonalizedRecommendations(userId: string, zipCode: string): Promise<Bill[]> {
    const userInterests = await this.getUserInterests(userId);
    const userReps = await this.representativesService.getByZipCode(zipCode);
    
    // Get bills matching user interests
    const interestBills = await Promise.all(
      userInterests.subjects.map(subject => 
        this.billsService.getBillsBySubject(subject.subject)
      )
    );
    
    // Get bills from user's representatives
    const repBills = await Promise.all(
      userReps.map(rep => this.billsService.getBillsBySponsor(rep.id))
    );
    
    // Combine and score by relevance
    const allBills = [...interestBills.flat(), ...repBills.flat()];
    return this.scoreBillsByUserRelevance(allBills, userInterests);
  }
  
  /**
   * Update user interest profile based on activity
   */
  async updateUserInterests(userId: string, subjects: string[]): Promise<void> {
    const existingInterests = await this.getUserInterests(userId);
    
    const updatedInterests = subjects.map(subject => {
      const existing = existingInterests.subjects.find(s => s.subject === subject);
      
      if (existing) {
        return {
          ...existing,
          score: Math.min(1.0, existing.score + 0.1), // Increment interest
          confidence: Math.min(1.0, existing.confidence + 0.05),
          lastInteraction: new Date().toISOString()
        };
      } else {
        return {
          subject,
          score: 0.3, // Starting score for new interest
          confidence: 0.2,
          lastInteraction: new Date().toISOString()
        };
      }
    });
    
    await this.database.userInterests.upsertMany(userId, updatedInterests);
  }
}
```

### Civic Goals and Gamification
```typescript
// services/civicGoals.service.ts
class CivicGoalsService {
  /**
   * Create default civic goals for new users
   */
  async initializeUserGoals(userId: string): Promise<CivicGoal[]> {
    const defaultGoals: Omit<CivicGoal, 'id' | 'userId' | 'current' | 'completed'>[] = [
      {
        type: 'bills_reviewed',
        title: 'Review 10 Bills',
        description: 'Review and vote on 10 bills to understand legislative process',
        target: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      {
        type: 'representatives_contacted',
        title: 'Contact Your Representatives',
        description: 'Reach out to at least 3 of your representatives about issues you care about',
        target: 3,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      },
      {
        type: 'meetings_attended',
        title: 'Attend Committee Meetings',
        description: 'Watch or attend 5 committee meetings to see democracy in action',
        target: 5
      }
    ];
    
    const goals = await Promise.all(
      defaultGoals.map(goal => this.createGoal(userId, goal))
    );
    
    return goals;
  }
  
  /**
   * Update goal progress based on user activity
   */
  async updateGoalProgress(userId: string, activityType: string): Promise<void> {
    const goals = await this.getUserGoals(userId);
    const relevantGoals = goals.filter(goal => 
      this.isRelevantActivity(goal.type, activityType) && !goal.completed
    );
    
    for (const goal of relevantGoals) {
      const newProgress = goal.current + 1;
      const completed = newProgress >= goal.target;
      
      await this.database.civicGoals.update(goal.id, {
        current: newProgress,
        completed,
        completedDate: completed ? new Date().toISOString() : undefined
      });
      
      if (completed) {
        await this.notifyGoalCompleted(userId, goal);
        await this.suggestNextGoal(userId, goal.type);
      }
    }
  }
  
  /**
   * Suggest new goals based on completed goals and user interests
   */
  async suggestNextGoal(userId: string, completedGoalType: string): Promise<CivicGoal | null> {
    const userInterests = await this.userEngagementService.getUserInterests(userId);
    const userLevel = await this.calculateUserCivicLevel(userId);
    
    const nextGoalSuggestions = this.getGoalSuggestions(completedGoalType, userLevel, userInterests);
    
    if (nextGoalSuggestions.length > 0) {
      const suggestedGoal = nextGoalSuggestions[0]; // Take first suggestion
      return this.createGoal(userId, suggestedGoal);
    }
    
    return null;
  }
}
```

---

## 4. Legislative Calendar Integration

### Calendar Service Implementation
```typescript
// services/legislativeCalendar.service.ts
class LegislativeCalendarService {
  /**
   * Get comprehensive legislative calendar for user's location
   */
  async getPersonalizedCalendar(userId: string, zipCode: string): Promise<LegislativeEvent[]> {
    const userReps = await this.representativesService.getByZipCode(zipCode);
    const userCommittees = await this.getUserRelevantCommittees(userReps);
    const userInterests = await this.userEngagementService.getUserInterests(userId);
    
    // Federal calendar events
    const federalEvents = await Promise.all([
      this.getFederalFloorSchedule(),
      this.getFederalCommitteeHearings(userCommittees.filter(c => c.level === 'federal'))
    ]);
    
    // State calendar events (California)
    const stateEvents = await Promise.all([
      this.getCaliforniaLegislativeCalendar(),
      this.getCaliforniaCommitteeHearings(userCommittees.filter(c => c.level === 'state'))
    ]);
    
    // Local events (city council, county meetings)
    const localEvents = await this.getLocalGovernmentCalendar(zipCode);
    
    const allEvents = [
      ...federalEvents.flat(),
      ...stateEvents.flat(),
      ...localEvents
    ];
    
    // Score events by relevance to user
    return this.scoreEventsByRelevance(allEvents, userInterests, userReps);
  }
  
  /**
   * Get federal legislative floor schedule
   */
  async getFederalFloorSchedule(): Promise<LegislativeEvent[]> {
    // House and Senate floor schedules
    const [houseSchedule, senateSchedule] = await Promise.all([
      this.getHouseFloorSchedule(),
      this.getSenateFloorSchedule()
    ]);
    
    return [...houseSchedule, ...senateSchedule];
  }
  
  /**
   * Subscribe user to specific committee or bill updates
   */
  async subscribeToUpdates(
    userId: string, 
    entityType: 'committee' | 'bill' | 'representative',
    entityId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    await this.database.subscriptions.create({
      userId,
      entityType,
      entityId,
      preferences,
      createdAt: new Date()
    });
    
    // Schedule notifications based on preferences
    if (preferences.email) {
      await this.scheduleEmailNotifications(userId, entityType, entityId);
    }
    
    if (preferences.push) {
      await this.schedulePushNotifications(userId, entityType, entityId);
    }
  }
}
```

---

## 5. API Rate Limiting and Caching Strategy

### Rate Limiting Implementation
```typescript
// lib/rateLimiter.ts
class APIRateLimiter {
  private requestQueues: Map<string, RequestQueue> = new Map();
  
  constructor(private limits: Record<string, RateLimit>) {}
  
  async waitForSlot(apiName: string): Promise<void> {
    const queue = this.getOrCreateQueue(apiName);
    const limit = this.limits[apiName];
    
    return new Promise((resolve) => {
      queue.add(() => {
        setTimeout(resolve, 1000 / limit.requestsPerSecond);
      });
    });
  }
  
  private getOrCreateQueue(apiName: string): RequestQueue {
    if (!this.requestQueues.has(apiName)) {
      this.requestQueues.set(apiName, new RequestQueue(this.limits[apiName]));
    }
    return this.requestQueues.get(apiName)!;
  }
}

// Usage in services
const rateLimiter = new APIRateLimiter({
  congress: { requestsPerSecond: 10, requestsPerHour: 5000 },
  legiscan: { requestsPerSecond: 1, requestsPerHour: 100 },
  california: { requestsPerSecond: 2, requestsPerHour: 500 }
});
```

### Advanced Caching Strategy
```typescript
// lib/advancedCache.ts
class LegislativeCacheManager extends CacheManager {
  /**
   * Multi-level caching for legislative data
   */
  async getCachedLegislativeData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions & {
      level?: 'memory' | 'redis' | 'database';
      invalidateOn?: string[]; // Events that invalidate this cache
    }
  ): Promise<T> {
    // Try memory cache first (fastest)
    const memoryResult = await this.memoryCache.get<T>(key);
    if (memoryResult) return memoryResult;
    
    // Try Redis cache (fast, shared)
    if (options.level !== 'memory') {
      const redisResult = await this.redisCache.get<T>(key);
      if (redisResult) {
        // Backfill memory cache
        this.memoryCache.set(key, redisResult, { ttl: 5 * 60 * 1000 });
        return redisResult;
      }
    }
    
    // Fetch fresh data
    const freshData = await fetcher();
    
    // Store in all applicable caches
    this.memoryCache.set(key, freshData, { ttl: 5 * 60 * 1000 }); // 5 minutes
    if (options.level !== 'memory') {
      this.redisCache.set(key, freshData, options);
    }
    
    // Set up invalidation triggers
    if (options.invalidateOn) {
      this.setupInvalidationTriggers(key, options.invalidateOn);
    }
    
    return freshData;
  }
  
  /**
   * Proactive cache warming for frequently accessed data
   */
  async warmCache(): Promise<void> {
    const warmupTasks = [
      () => this.committeeService.getCommittees(), // All committees
      () => this.billsService.getTrendingBills(50), // Trending bills
      () => this.legislativeCalendarService.getUpcomingHearings() // Upcoming hearings
    ];
    
    // Execute in parallel with error handling
    await Promise.allSettled(warmupTasks.map(task => task()));
  }
}
```

---

## 6. Error Handling and Resilience

### Comprehensive Error Handling
```typescript
// lib/apiErrorHandler.ts
class LegislativeAPIErrorHandler {
  /**
   * Handle various API errors gracefully
   */
  async handleAPIError<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    retryOptions?: RetryOptions
  ): Promise<T> {
    const maxRetries = retryOptions?.maxRetries || 3;
    const baseDelay = retryOptions?.baseDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (this.isRetryableError(error) && attempt < maxRetries) {
          await this.delay(baseDelay * Math.pow(2, attempt - 1));
          continue;
        }
        
        // If we have a fallback, use it
        if (fallback) {
          try {
            return await fallback();
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }
        
        // Transform error for user-friendly display
        throw this.transformError(error);
      }
    }
    
    throw new Error('Max retries exceeded');
  }
  
  private isRetryableError(error: any): boolean {
    // Rate limit errors, temporary server errors, network errors
    return error.status === 429 || 
           error.status === 503 || 
           error.status === 502 ||
           error.code === 'ECONNRESET';
  }
  
  private transformError(error: any): LegislativeAPIError {
    if (error.status === 429) {
      return new LegislativeAPIError(
        'RATE_LIMITED',
        'Too many requests. Please try again later.',
        error
      );
    }
    
    if (error.status >= 500) {
      return new LegislativeAPIError(
        'SERVER_ERROR',
        'Legislative data service is temporarily unavailable.',
        error
      );
    }
    
    return new LegislativeAPIError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred while fetching legislative data.',
      error
    );
  }
}
```

---

## 7. Testing Strategy

### API Integration Tests
```typescript
// tests/integration/legislativeAPI.test.ts
describe('Legislative API Integration', () => {
  let committeeService: CommitteeService;
  let mockCongressApi: jest.Mocked<CongressApiClient>;
  
  beforeEach(() => {
    mockCongressApi = createMockCongressApi();
    committeeService = new CommitteeService(mockCongressApi);
  });
  
  describe('Committee Service', () => {
    it('should fetch and parse committees correctly', async () => {
      mockCongressApi.makeRequest.mockResolvedValueOnce({
        committees: [mockCommitteeData]
      });
      
      const committees = await committeeService.getCommittees();
      
      expect(committees).toHaveLength(1);
      expect(committees[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        chamber: expect.any(String),
        type: expect.any(String)
      });
    });
    
    it('should handle API errors gracefully', async () => {
      mockCongressApi.makeRequest.mockRejectedValueOnce(
        new Error('API Error')
      );
      
      await expect(committeeService.getCommittees())
        .rejects.toThrow('API Error');
    });
  });
  
  describe('User Engagement Integration', () => {
    it('should track user activities and update metrics', async () => {
      const activity = {
        userId: 'user123',
        type: 'bill_view',
        entityId: 'bill456',
        entityType: 'bill'
      };
      
      await userEngagementService.trackActivity(activity);
      
      const metrics = await userEngagementService.getUserEngagementScore('user123');
      expect(metrics.totalBillsViewed).toBe(1);
    });
  });
});
```

### Performance Tests
```typescript
// tests/performance/legislativeAPI.perf.test.ts
describe('Legislative API Performance', () => {
  it('should fetch committee data within acceptable time limits', async () => {
    const startTime = Date.now();
    
    await committeeService.getCommittees();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(2000); // 2 seconds max
  });
  
  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = Array(10).fill(null).map(() => 
      committeeService.getCommittees()
    );
    
    const startTime = Date.now();
    await Promise.all(concurrentRequests);
    const endTime = Date.now();
    
    // Should not take more than 5 seconds for 10 concurrent requests
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

---

## 8. Monitoring and Analytics

### API Performance Monitoring
```typescript
// lib/apiMonitoring.ts
class LegislativeAPIMonitor {
  private metrics: APIMetrics = {
    requests: 0,
    errors: 0,
    averageResponseTime: 0,
    cacheHitRate: 0
  };
  
  /**
   * Monitor API call performance
   */
  async monitorAPICall<T>(
    apiName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.requests++;
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.updateMetrics(apiName, duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.errors++;
      
      this.updateMetrics(apiName, duration, false);
      throw error;
    }
  }
  
  /**
   * Generate monitoring dashboard data
   */
  getMonitoringData(): MonitoringDashboard {
    return {
      apiHealth: {
        congress: this.getAPIHealth('congress'),
        california: this.getAPIHealth('california'),
        engagement: this.getAPIHealth('engagement')
      },
      performance: {
        averageResponseTime: this.metrics.averageResponseTime,
        cacheHitRate: this.metrics.cacheHitRate,
        errorRate: this.metrics.errors / this.metrics.requests
      },
      usage: {
        totalRequests: this.metrics.requests,
        requestsPerHour: this.calculateRequestsPerHour(),
        topEndpoints: this.getTopEndpoints()
      }
    };
  }
}
```

This comprehensive API integration specification provides the technical foundation for implementing the enhanced Bills and Committee functionality in the CITZN platform. The implementation focuses on reliability, performance, and user experience while building on the existing robust political mapping infrastructure.