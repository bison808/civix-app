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

  // PRODUCTION FIX: Main getCommittees method - follows Mike's successful API endpoint pattern
  async getCommittees(filter?: CommitteeFilter): Promise<CommitteeListResponse> {
    const cacheKey = `${COMMITTEE_CACHE_KEY}main_${JSON.stringify(filter)}`;
    const cached = this.getCached<CommitteeListResponse>(cacheKey);
    if (cached) return cached;

    try {
      console.log('[CommitteeService] Calling working committees API endpoint');
      
      // Build query parameters for the working API endpoint
      const params = new URLSearchParams();
      if (filter?.chamber && filter.chamber !== 'All') {
        params.set('chamber', filter.chamber.toLowerCase());
      }
      if (filter?.level && filter.level !== 'All') {
        params.set('level', filter.level.toLowerCase());
      }
      if (filter?.type && filter.type !== 'All') {
        params.set('type', filter.type.toLowerCase());
      }
      if (filter?.jurisdiction) {
        params.set('jurisdiction', filter.jurisdiction);
      }
      
      const apiUrl = `/api/committees${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('[CommitteeService] Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Committees API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[CommitteeService] Successfully fetched ${data.committees?.length || 0} committees`);
      
      // Transform to expected CommitteeListResponse format
      const result: CommitteeListResponse = {
        committees: data.committees || [],
        total: data.total || (data.committees?.length || 0),
        page: 1,
        pageSize: data.committees?.length || 0,
        filters: filter,
        summary: data.summary,
        source: data.source
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[CommitteeService] API call failed:', error);
      return {
        committees: [],
        total: 0,
        page: 1,
        pageSize: 0,
        filters: filter
      };
    }
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
    try {
      // Use the real API endpoint to fetch committees
      const response = await fetch('/api/committees?level=federal');
      
      if (!response.ok) {
        throw new Error('Failed to fetch committees');
      }
      
      const data = await response.json();
      return data.committees || [];
    } catch (error) {
      console.error('Error fetching representative committees:', error);
      return [];
    }
  }

  private async fetchCommitteeDetails(committeeId: string): Promise<Committee | null> {
    try {
      // Use the real API endpoint to fetch committee details
      const response = await fetch('/api/committees');
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const committees = data.committees || [];
      return committees.find((c: Committee) => c.id === committeeId) || null;
    } catch (error) {
      console.error('Error fetching committee details:', error);
      return null;
    }
  }

  private async fetchCommitteeMeetings(
    committeeId: string, 
    limit: number, 
    includeUpcoming: boolean
  ): Promise<CommitteeMeeting[]> {
    try {
      // In production, this would fetch real meeting data
      // For now, return empty array as real meeting APIs are complex
      return [];
    } catch (error) {
      console.error('Error fetching committee meetings:', error);
      return [];
    }
  }

  private async getUserRepresentatives(userZip: string): Promise<Representative[]> {
    // This would integrate with the existing representatives service
    // For now, return mock data
    return [];
  }

  private async searchFederalCommittees(query: string, filter?: CommitteeFilter): Promise<Committee[]> {
    try {
      // Fetch real federal committee data from API endpoint
      const params = new URLSearchParams();
      if (filter?.chamber && filter.chamber !== 'All') params.set('chamber', filter.chamber.toLowerCase());
      if (filter?.level && filter.level !== 'All') params.set('level', filter.level.toLowerCase());
      if (query.trim()) params.set('jurisdiction', query);
      
      const response = await fetch(`/api/committees?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.committees || [];
    } catch (error) {
      console.error('Failed to fetch federal committees:', error);
      // In case of API failure, return empty array instead of mock data
      return [];
    }
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

  // Real data methods using API endpoints
  private async getRealCommitteesByRepresentative(representativeId: string): Promise<Committee[]> {
    try {
      // This would fetch committees for a specific representative from the API
      // For now, return all federal committees and filter client-side
      const response = await fetch('/api/committees?level=federal');
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      // TODO: Implement actual filtering by representative membership
      // For now, return all committees as placeholder
      return data.committees || [];
    } catch (error) {
      console.error('Failed to fetch committees by representative:', error);
      return [];
    }
  }

  // ELIMINATED: getMockFederalCommittees() - All federal committee data now comes from real API endpoint /api/committees

  // ELIMINATED: getMockCommitteeMeetings() - to be replaced with real committee meeting API
  // Real committee meetings data would come from Congress.gov or committee-specific APIs
  private async getRealCommitteeMeetings(committeeId: string): Promise<CommitteeMeeting[]> {
    try {
      // TODO: Implement real committee meeting API integration
      // This would fetch from Congress.gov committee schedules or similar real source
      console.log(`Real committee meetings API not yet implemented for ${committeeId}`);
      return [];
    } catch (error) {
      console.error('Failed to fetch committee meetings:', error);
      return [];
    }
  }
}

export const committeeService = new CommitteeService();
export default committeeService;