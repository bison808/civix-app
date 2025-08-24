import { useState, useEffect, useMemo } from 'react';
import { 
  Committee, 
  CommitteeMeeting, 
  CommitteeFilter,
  UserCommitteeInterest,
  CommitteeActivity,
  CommitteeStats
} from '@/types/committee.types';
import committeeService from '@/services/committee.service';

export interface UseCommitteesOptions {
  userZip?: string;
  autoFetch?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseCommitteesReturn {
  // Data
  committees: Committee[];
  userCommittees: Committee[];
  userInterests: UserCommitteeInterest[];
  stats: CommitteeStats;
  
  // Loading states
  loading: boolean;
  loadingStats: boolean;
  loadingUserCommittees: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshCommittees: () => Promise<void>;
  searchCommittees: (query: string, filter?: CommitteeFilter) => Promise<void>;
  getCommitteeMembers: (committeeId: string) => Promise<Committee | null>;
  getCommitteeMeetings: (committeeId: string) => Promise<CommitteeMeeting[]>;
}

export function useCommittees(options: UseCommitteesOptions = {}): UseCommitteesReturn {
  const { userZip, autoFetch = true, refreshInterval } = options;
  
  // State
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [userCommittees, setUserCommittees] = useState<Committee[]>([]);
  const [userInterests, setUserInterests] = useState<UserCommitteeInterest[]>([]);
  const [stats, setStats] = useState<CommitteeStats>({
    totalCommittees: 0,
    userRelevantCommittees: 0,
    upcomingMeetings: 0,
    recentActivity: 0,
    billsInCommittee: 0,
    representativesOnCommittees: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUserCommittees, setLoadingUserCommittees] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch user's relevant committees
  const fetchUserCommittees = async (zipCode: string) => {
    if (loadingUserCommittees) return;
    
    setLoadingUserCommittees(true);
    setError(null);
    
    try {
      const { committees: userComms, interests } = await committeeService.getUserRelevantCommittees(zipCode);
      setUserCommittees(userComms);
      setUserInterests(interests);
    } catch (err) {
      console.error('Failed to fetch user committees:', err);
      setError('Failed to load your committees');
    } finally {
      setLoadingUserCommittees(false);
    }
  };

  // Fetch committee stats
  const fetchStats = async (zipCode: string) => {
    if (loadingStats) return;
    
    setLoadingStats(true);
    
    try {
      const committeeStats = await committeeService.getCommitteeStats(zipCode);
      setStats(committeeStats);
    } catch (err) {
      console.error('Failed to fetch committee stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Search committees
  const searchCommittees = async (query: string, filter?: CommitteeFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await committeeService.searchCommittees(query, filter);
      setCommittees(result.committees);
    } catch (err) {
      console.error('Failed to search committees:', err);
      setError('Failed to search committees');
    } finally {
      setLoading(false);
    }
  };

  // Get committee members
  const getCommitteeMembers = async (committeeId: string): Promise<Committee | null> => {
    try {
      return await committeeService.getCommitteeMembers(committeeId);
    } catch (err) {
      console.error('Failed to get committee members:', err);
      return null;
    }
  };

  // Get committee meetings
  const getCommitteeMeetings = async (committeeId: string): Promise<CommitteeMeeting[]> => {
    try {
      return await committeeService.getCommitteeMeetings(committeeId);
    } catch (err) {
      console.error('Failed to get committee meetings:', err);
      return [];
    }
  };

  // Refresh all data
  const refreshCommittees = async () => {
    if (!userZip) return;
    
    await Promise.all([
      fetchUserCommittees(userZip),
      fetchStats(userZip)
    ]);
  };

  // Initial data fetch
  useEffect(() => {
    if (autoFetch && userZip) {
      fetchUserCommittees(userZip);
      fetchStats(userZip);
    }
  }, [userZip, autoFetch]);

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval || !userZip) return;
    
    const interval = setInterval(() => {
      refreshCommittees();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, userZip]);

  return {
    // Data
    committees,
    userCommittees,
    userInterests,
    stats,
    
    // Loading states
    loading,
    loadingStats,
    loadingUserCommittees,
    
    // Error state
    error,
    
    // Actions
    refreshCommittees,
    searchCommittees,
    getCommitteeMembers,
    getCommitteeMeetings
  };
}

export interface UseCommitteeActivityOptions {
  committeeIds: string[];
  limit?: number;
  refreshInterval?: number;
}

export interface UseCommitteeActivityReturn {
  activities: CommitteeActivity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCommitteeActivity(options: UseCommitteeActivityOptions): UseCommitteeActivityReturn {
  const { committeeIds, limit = 20, refreshInterval } = options;
  
  const [activities, setActivities] = useState<CommitteeActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (committeeIds.length === 0) {
      setActivities([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const activityData = await committeeService.getCommitteeActivity(committeeIds, limit);
      setActivities(activityData);
    } catch (err) {
      console.error('Failed to fetch committee activity:', err);
      setError('Failed to load committee activity');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [committeeIds.join(','), limit]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;
    
    const interval = setInterval(fetchActivities, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivities
  };
}

export interface UseCommitteeMeetingsOptions {
  committeeId: string;
  limit?: number;
  includeUpcoming?: boolean;
  autoRefresh?: boolean;
}

export function useCommitteeMeetings(options: UseCommitteeMeetingsOptions) {
  const { committeeId, limit = 10, includeUpcoming = true, autoRefresh = false } = options;
  
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    if (!committeeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const meetingData = await committeeService.getCommitteeMeetings(
        committeeId, 
        limit, 
        includeUpcoming
      );
      setMeetings(meetingData);
    } catch (err) {
      console.error('Failed to fetch committee meetings:', err);
      setError('Failed to load committee meetings');
    } finally {
      setLoading(false);
    }
  };

  // Memoize upcoming and past meetings
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings.filter(m => new Date(m.date) > now && m.status === 'Scheduled');
  }, [meetings]);

  const pastMeetings = useMemo(() => {
    const now = new Date();
    return meetings.filter(m => 
      new Date(m.date) <= now || m.status === 'Completed'
    );
  }, [meetings]);

  useEffect(() => {
    fetchMeetings();
  }, [committeeId, limit, includeUpcoming]);

  // Auto-refresh for upcoming meetings
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchMeetings, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return {
    meetings,
    upcomingMeetings,
    pastMeetings,
    loading,
    error,
    refresh: fetchMeetings
  };
}