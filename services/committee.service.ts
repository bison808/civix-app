import { 
  Committee, 
  CommitteeMeeting, 
  CommitteeFilter, 
  CommitteeListResponse,
  UserCommitteeInterest,
  CommitteeActivity,
  CommitteeStats,
  CommitteeSchedule,
  CommitteeVote
} from '@/types/committee.types';
import { Representative } from '@/types/representatives.types';

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for committee data
const COMMITTEE_CACHE_KEY = 'committee_data_';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class CommitteeService {
  private congressApiKey?: string;
  private congressBaseUrl: string;
  private openStatesBaseUrl: string;
  private cache: Map<string, CachedData<any>> = new Map();

  constructor() {
    this.congressApiKey = process.env.CONGRESS_API_KEY;
    this.congressBaseUrl = process.env.NEXT_PUBLIC_CONGRESS_API_URL || 'https://api.congress.gov/v3';
    this.openStatesBaseUrl = 'https://v3.openstates.org';
  }

  // Cache management
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Get committees by representative
  async getCommitteesByRepresentative(representativeId: string): Promise<Committee[]> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}rep_${representativeId}`;
    const cached = this.getCached<Committee[]>(cacheKey);
    if (cached) return cached;

    try {
      // Try to determine if this is federal or state rep
      const committees = await this.fetchRepresentativeCommittees(representativeId);
      this.setCached(cacheKey, committees);
      return committees;
    } catch (error) {
      console.error('Failed to fetch representative committees:', error);
      return [];
    }
  }

  // Get committee members
  async getCommitteeMembers(committeeId: string): Promise<Committee | null> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}members_${committeeId}`;
    const cached = this.getCached<Committee>(cacheKey);
    if (cached) return cached;

    try {
      const committee = await this.fetchCommitteeDetails(committeeId);
      if (committee) {
        this.setCached(cacheKey, committee);
      }
      return committee;
    } catch (error) {
      console.error('Failed to fetch committee members:', error);
      return null;
    }
  }

  // Get committee meetings
  async getCommitteeMeetings(
    committeeId: string, 
    limit: number = 10,
    includeUpcoming: boolean = true
  ): Promise<CommitteeMeeting[]> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}meetings_${committeeId}_${limit}`;
    const cached = this.getCached<CommitteeMeeting[]>(cacheKey);
    if (cached) return cached;

    try {
      const meetings = await this.fetchCommitteeMeetings(committeeId, limit, includeUpcoming);
      this.setCached(cacheKey, meetings);
      return meetings;
    } catch (error) {
      console.error('Failed to fetch committee meetings:', error);
      return [];
    }
  }

  // Get user's relevant committees based on their representatives
  async getUserRelevantCommittees(userZip: string): Promise<{
    committees: Committee[];
    interests: UserCommitteeInterest[];
  }> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}user_${userZip}`;
    const cached = this.getCached<{ committees: Committee[]; interests: UserCommitteeInterest[] }>(cacheKey);
    if (cached) return cached;

    try {
      // First, get user's representatives
      const representatives = await this.getUserRepresentatives(userZip);
      
      // Get committees for each representative
      const allCommittees: Committee[] = [];
      const interests: UserCommitteeInterest[] = [];
      
      for (const rep of representatives) {
        const repCommittees = await this.getCommitteesByRepresentative(rep.id);
        
        for (const committee of repCommittees) {
          // Avoid duplicates
          if (!allCommittees.find(c => c.id === committee.id)) {
            allCommittees.push(committee);
          }
          
          // Track user interest
          interests.push({
            committeeId: committee.id,
            committeeName: committee.name,
            reason: 'Representative Member',
            representativeId: rep.id,
            subscriptionDate: new Date().toISOString(),
            isNotificationEnabled: true
          });
        }
      }

      const result = { committees: allCommittees, interests };
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get user relevant committees:', error);
      return { committees: [], interests: [] };
    }
  }

  // Search committees
  async searchCommittees(query: string, filter?: CommitteeFilter): Promise<CommitteeListResponse> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}search_${query}_${JSON.stringify(filter)}`;
    const cached = this.getCached<CommitteeListResponse>(cacheKey);
    if (cached) return cached;

    try {
      // Get committees from both federal and state sources
      const federalCommittees = await this.searchFederalCommittees(query, filter);
      const stateCommittees = await this.searchStateCommittees(query, filter);
      
      const allCommittees = [...federalCommittees, ...stateCommittees];
      const filteredCommittees = this.applyFilters(allCommittees, filter);
      
      const result: CommitteeListResponse = {
        committees: filteredCommittees.slice(0, 50), // Limit results
        total: filteredCommittees.length,
        page: 1,
        pageSize: 50,
        filters: filter
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to search committees:', error);
      return { committees: [], total: 0, page: 1, pageSize: 50 };
    }
  }

  // Get committee activity feed
  async getCommitteeActivity(
    committeeIds: string[], 
    limit: number = 20
  ): Promise<CommitteeActivity[]> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}activity_${committeeIds.join(',')}_${limit}`;
    const cached = this.getCached<CommitteeActivity[]>(cacheKey);
    if (cached) return cached;

    try {
      const activities: CommitteeActivity[] = [];
      
      for (const committeeId of committeeIds.slice(0, 10)) { // Limit to avoid API overload
        const meetings = await this.getCommitteeMeetings(committeeId, 5);
        
        for (const meeting of meetings) {
          activities.push({
            id: `meeting_${meeting.id}`,
            committeeId: meeting.committeeId,
            committeeName: meeting.committeeName,
            type: 'Meeting Scheduled',
            title: meeting.title,
            description: `${meeting.type} scheduled for ${meeting.date}`,
            date: meeting.date,
            relatedMeetingId: meeting.id,
            importance: this.determineMeetingImportance(meeting)
          });
        }
      }

      // Sort by date (most recent first)
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const limitedActivities = activities.slice(0, limit);
      this.setCached(cacheKey, limitedActivities);
      return limitedActivities;
    } catch (error) {
      console.error('Failed to get committee activity:', error);
      return [];
    }
  }

  // Get committee stats for dashboard
  async getCommitteeStats(userZip: string): Promise<CommitteeStats> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}stats_${userZip}`;
    const cached = this.getCached<CommitteeStats>(cacheKey);
    if (cached) return cached;

    try {
      const { committees, interests } = await this.getUserRelevantCommittees(userZip);
      
      // Count upcoming meetings
      let upcomingMeetings = 0;
      for (const committee of committees.slice(0, 5)) { // Limit API calls
        const meetings = await this.getCommitteeMeetings(committee.id, 5, true);
        upcomingMeetings += meetings.filter(m => 
          new Date(m.date) > new Date() && m.status === 'Scheduled'
        ).length;
      }

      const stats: CommitteeStats = {
        totalCommittees: committees.length,
        userRelevantCommittees: interests.length,
        upcomingMeetings,
        recentActivity: 0, // Will be calculated from activity feed
        billsInCommittee: 0, // Will be enhanced with bill data
        representativesOnCommittees: new Set(
          interests.map(i => i.representativeId).filter(Boolean)
        ).size
      };

      this.setCached(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Failed to get committee stats:', error);
      return {
        totalCommittees: 0,
        userRelevantCommittees: 0,
        upcomingMeetings: 0,
        recentActivity: 0,
        billsInCommittee: 0,
        representativesOnCommittees: 0
      };
    }
  }

  // Private helper methods
  private async fetchRepresentativeCommittees(representativeId: string): Promise<Committee[]> {
    // For now, return mock data based on representative ID patterns
    // In production, this would call the appropriate API based on the rep's level
    return this.getMockCommitteesByRepresentative(representativeId);
  }

  private async fetchCommitteeDetails(committeeId: string): Promise<Committee | null> {
    // Mock implementation - in production would fetch from appropriate API
    const mockCommittees = this.getMockFederalCommittees();
    return mockCommittees.find(c => c.id === committeeId) || null;
  }

  private async fetchCommitteeMeetings(
    committeeId: string, 
    limit: number, 
    includeUpcoming: boolean
  ): Promise<CommitteeMeeting[]> {
    // Mock implementation
    return this.getMockCommitteeMeetings(committeeId).slice(0, limit);
  }

  private async getUserRepresentatives(userZip: string): Promise<Representative[]> {
    // This would integrate with the existing representatives service
    // For now, return mock data
    return [];
  }

  private async searchFederalCommittees(query: string, filter?: CommitteeFilter): Promise<Committee[]> {
    const committees = this.getMockFederalCommittees();
    return committees.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.jurisdiction.toLowerCase().includes(query.toLowerCase())
    );
  }

  private async searchStateCommittees(query: string, filter?: CommitteeFilter): Promise<Committee[]> {
    // Mock implementation for state committees
    return [];
  }

  private applyFilters(committees: Committee[], filter?: CommitteeFilter): Committee[] {
    if (!filter) return committees;

    return committees.filter(committee => {
      if (filter.chamber && filter.chamber !== 'All' && committee.chamber !== filter.chamber) return false;
      if (filter.level && filter.level !== 'All' && committee.level !== filter.level) return false;
      if (filter.isActive !== undefined && committee.isActive !== filter.isActive) return false;
      if (filter.jurisdiction && !committee.jurisdiction.toLowerCase().includes(filter.jurisdiction.toLowerCase())) return false;
      
      return true;
    });
  }

  private determineMeetingImportance(meeting: CommitteeMeeting): 'Low' | 'Medium' | 'High' {
    if (meeting.bills && meeting.bills.length > 0) return 'High';
    if (meeting.type === 'Markup' || meeting.type === 'Business Meeting') return 'High';
    if (meeting.witnesses && meeting.witnesses.length > 5) return 'Medium';
    return 'Low';
  }

  // Mock data methods (replace with real API calls in production)
  private getMockCommitteesByRepresentative(representativeId: string): Committee[] {
    const currentDate = new Date().toISOString();
    
    // Sample committees based on representative
    return [
      {
        id: 'house-energy-commerce',
        name: 'House Committee on Energy and Commerce',
        abbreviation: 'HENCOM',
        chamber: 'House',
        jurisdiction: 'Energy, commerce, healthcare, telecommunications, consumer protection',
        description: 'Oversees matters related to energy policy, interstate and foreign commerce, consumer affairs, and public health.',
        isActive: true,
        level: 'federal',
        members: [
          {
            representativeId,
            name: 'John Doe',
            party: 'Republican',
            state: 'TX',
            district: '25',
            role: 'Member',
            isVoting: true,
            joinedDate: '2023-01-01'
          }
        ],
        memberCount: 55,
        meetingsThisYear: 12,
        billsConsidered: 45,
        lastMeetingDate: '2025-01-15',
        nextMeetingDate: '2025-01-25',
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];
  }

  private getMockFederalCommittees(): Committee[] {
    const currentDate = new Date().toISOString();
    
    return [
      {
        id: 'house-energy-commerce',
        name: 'House Committee on Energy and Commerce',
        abbreviation: 'HENCOM',
        chamber: 'House',
        jurisdiction: 'Energy, commerce, healthcare, telecommunications, consumer protection',
        description: 'Oversees matters related to energy policy, interstate and foreign commerce, consumer affairs, and public health.',
        isActive: true,
        level: 'federal',
        members: [],
        memberCount: 55,
        meetingsThisYear: 12,
        billsConsidered: 45,
        lastMeetingDate: '2025-01-15',
        nextMeetingDate: '2025-01-25',
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        id: 'senate-judiciary',
        name: 'Senate Committee on the Judiciary',
        abbreviation: 'SJUD',
        chamber: 'Senate',
        jurisdiction: 'Federal courts, immigration, antitrust, intellectual property, criminal justice',
        description: 'Oversees the administration of justice within the federal government.',
        isActive: true,
        level: 'federal',
        members: [],
        memberCount: 22,
        meetingsThisYear: 8,
        billsConsidered: 32,
        lastMeetingDate: '2025-01-10',
        nextMeetingDate: '2025-01-30',
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];
  }

  private getMockCommitteeMeetings(committeeId: string): CommitteeMeeting[] {
    const currentDate = new Date().toISOString();
    
    return [
      {
        id: `meeting_${committeeId}_001`,
        eventId: 'event_123456',
        committeeId,
        committeeName: 'House Committee on Energy and Commerce',
        title: 'Hearing on AI Safety and Innovation',
        type: 'Hearing',
        status: 'Scheduled',
        date: '2025-01-25T10:00:00Z',
        time: '10:00 AM',
        duration: 180,
        location: 'Room 2123, Rayburn House Office Building',
        isPublic: true,
        description: 'Examining the current state of AI safety measures and innovation policies.',
        agenda: [
          {
            id: 'agenda_001',
            order: 1,
            title: 'Opening Statements',
            type: 'Administrative',
            estimatedDuration: 30
          },
          {
            id: 'agenda_002',
            order: 2,
            title: 'Witness Testimony on AI Safety Standards',
            type: 'Hearing',
            estimatedDuration: 120
          }
        ],
        witnesses: [
          {
            id: 'witness_001',
            name: 'Dr. Jane Smith',
            title: 'Director of AI Ethics',
            organization: 'Tech Safety Institute',
            expertise: ['AI Safety', 'Machine Learning', 'Ethics']
          }
        ],
        bills: ['hr-125-119'],
        documents: [],
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];
  }
}

export const committeeService = new CommitteeService();
export default committeeService;