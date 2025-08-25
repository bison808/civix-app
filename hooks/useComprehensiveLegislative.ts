/**
 * Comprehensive Legislative Hooks - Agent Carlos Implementation
 * EXPANSION: React hooks for complete civic engagement platform
 * 
 * Provides hooks for all comprehensive legislative features:
 * - Roll Call Votes & Voting Records
 * - Committee Information & Hearings
 * - Legislator Profiles & Contact Info
 * - Legislative Documents & Full Texts
 * - Calendar Events & Public Hearings
 * - Advanced Search & Personalized Feeds
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { legiScanComprehensiveApi } from '@/services/legiScanComprehensiveApi';
import type {
  VotingRecord,
  LegislatorVotingStats,
  CommitteeInfo,
  CommitteeHearing,
  LegislatorProfile,
  LegislativeDocument,
  LegislativeCalendarEvent,
  AdvancedSearchOptions,
  SearchResults,
  CivicEngagementAction,
  UserLegislativeProfile
} from '@/types/legislative-comprehensive.types';

// ========================================================================================
// VOTING RECORDS & ROLL CALL VOTES HOOKS
// ========================================================================================

/**
 * Hook for bill voting records - "How did MY representative vote?"
 */
const useBillVotingRecords = (billId: string) => {
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotingRecords = useCallback(async () => {
    if (!billId) return;

    setLoading(true);
    setError(null);

    try {
      const records = await legiScanComprehensiveApi.getBillRollCallVotes(billId);
      setVotingRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch voting records');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchVotingRecords();
  }, [fetchVotingRecords]);

  return {
    votingRecords,
    loading,
    error,
    refetch: fetchVotingRecords,
  };
};

/**
 * Hook for legislator voting history
 */
const useLegislatorVotingRecord = (peopleId: number, limit: number = 50) => {
  const [votingStats, setVotingStats] = useState<LegislatorVotingStats | null>(null);
  const [votingHistory, setVotingHistory] = useState<VotingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotingRecord = useCallback(async () => {
    if (!peopleId) return;

    setLoading(true);
    setError(null);

    try {
      const records = await legiScanComprehensiveApi.getLegislatorVotingRecord(peopleId, limit);
      setVotingHistory(records);
      
      // Calculate voting statistics
      if (records.length > 0) {
        const stats = calculateVotingStats(records, peopleId);
        setVotingStats(stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch voting record');
    } finally {
      setLoading(false);
    }
  }, [peopleId, limit]);

  useEffect(() => {
    fetchVotingRecord();
  }, [fetchVotingRecord]);

  return {
    votingStats,
    votingHistory,
    loading,
    error,
    refetch: fetchVotingRecord,
  };
};

// ========================================================================================
// COMMITTEE DATA HOOKS
// ========================================================================================

/**
 * Hook for comprehensive committee information
 */
const useCommitteeDetails = (committeeId: number) => {
  const [committee, setCommittee] = useState<CommitteeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommittee = useCallback(async () => {
    if (!committeeId) return;

    setLoading(true);
    setError(null);

    try {
      const committeeData = await legiScanComprehensiveApi.getCommitteeDetails(committeeId);
      setCommittee(committeeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch committee details');
    } finally {
      setLoading(false);
    }
  }, [committeeId]);

  useEffect(() => {
    fetchCommittee();
  }, [fetchCommittee]);

  return {
    committee,
    loading,
    error,
    refetch: fetchCommittee,
  };
};

/**
 * Hook for state committees list - PRODUCTION OPTIMIZED with Service Layer
 */
const useStateCommittees = (stateId: string = 'CA') => {
  const [committees, setCommittees] = useState<CommitteeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommittees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // PRODUCTION FIX: Use the fixed committee service instead of direct LegiScan API
      const { committeeService } = await import('@/services/committee.service');
      const response = await committeeService.getCommittees({
        level: stateId === 'CA' ? 'state' : 'federal',
        chamber: 'All'
      });
      
      // Transform Committee[] to CommitteeInfo[] format if needed
      const committeesData = response.committees.map(committee => ({
        id: committee.id,
        name: committee.name,
        chamber: committee.chamber as 'House' | 'Senate',
        jurisdiction: committee.jurisdiction ? [committee.jurisdiction] : [],
        description: committee.description || '',
        members: committee.members || [],
        chair: committee.chair,
        subcommittees: committee.subcommittees || [],
        currentBills: [],
        website: committee.website,
        phone: committee.phone,
        address: committee.address,
        meetingSchedule: committee.meetingSchedule
      })) as CommitteeInfo[];
      
      setCommittees(committeesData);
    } catch (err) {
      console.error('Committee fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch committees');
      
      // Fallback to direct LegiScan API if service layer fails
      try {
        const committeesData = await legiScanComprehensiveApi.getStateCommittees(stateId);
        setCommittees(committeesData);
      } catch (fallbackErr) {
        console.error('Fallback committee fetch also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [stateId]);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  return {
    committees,
    loading,
    error,
    refetch: fetchCommittees,
  };
};

/**
 * Hook for committee hearings schedule
 */
const useCommitteeHearings = (committeeId: number, days: number = 30) => {
  const [hearings, setHearings] = useState<LegislativeCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHearings = useCallback(async () => {
    if (!committeeId) return;

    setLoading(true);
    setError(null);

    try {
      const hearingsData = await legiScanComprehensiveApi.getCommitteeHearings(committeeId, days);
      setHearings(hearingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch committee hearings');
    } finally {
      setLoading(false);
    }
  }, [committeeId, days]);

  useEffect(() => {
    fetchHearings();
  }, [fetchHearings]);

  return {
    hearings,
    loading,
    error,
    refetch: fetchHearings,
  };
};

// ========================================================================================
// LEGISLATOR PROFILE HOOKS
// ========================================================================================

/**
 * Hook for comprehensive legislator profile
 */
const useLegislatorProfile = (peopleId: number) => {
  const [legislator, setLegislator] = useState<LegislatorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLegislator = useCallback(async () => {
    if (!peopleId) return;

    setLoading(true);
    setError(null);

    try {
      const legislatorData = await legiScanComprehensiveApi.getLegislatorProfile(peopleId);
      setLegislator(legislatorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch legislator profile');
    } finally {
      setLoading(false);
    }
  }, [peopleId]);

  useEffect(() => {
    fetchLegislator();
  }, [fetchLegislator]);

  return {
    legislator,
    loading,
    error,
    refetch: fetchLegislator,
  };
};

/**
 * Hook for searching legislators
 */
const useLegislatorSearch = () => {
  const [legislators, setLegislators] = useState<LegislatorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLegislators = useCallback(async (query: string, stateId: string = 'CA') => {
    if (!query.trim()) {
      setLegislators([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await legiScanComprehensiveApi.searchLegislators(query, stateId);
      setLegislators(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search legislators');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    legislators,
    loading,
    error,
    searchLegislators,
  };
};

// ========================================================================================
// LEGISLATIVE DOCUMENTS HOOKS
// ========================================================================================

/**
 * Hook for bill documents and full texts
 */
const useBillDocuments = (billId: string) => {
  const [documents, setDocuments] = useState<LegislativeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!billId) return;

    setLoading(true);
    setError(null);

    try {
      const documentsData = await legiScanComprehensiveApi.getBillDocuments(billId);
      setDocuments(documentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bill documents');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
  };
};

/**
 * Hook for accessing full document content
 */
const useDocumentContent = () => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async (docId: number) => {
    setLoading(true);
    setError(null);

    try {
      const documentContent = await legiScanComprehensiveApi.getDocumentContent(docId);
      setContent(documentContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document content');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    content,
    loading,
    error,
    fetchContent,
  };
};

// ========================================================================================
// LEGISLATIVE CALENDAR HOOKS
// ========================================================================================

/**
 * Hook for legislative calendar events - PRODUCTION OPTIMIZED
 */
const useLegislativeCalendar = (stateId: string = 'CA', days: number = 30) => {
  const [events, setEvents] = useState<LegislativeCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const calendarData = await legiScanComprehensiveApi.getLegislativeCalendar(stateId, days);
      setEvents(calendarData);
    } catch (err) {
      console.error('Legislative calendar fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch legislative calendar');
    } finally {
      setLoading(false);
    }
  }, [stateId, days]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return {
    events,
    loading,
    error,
    refetch: fetchCalendar,
  };
};

// ========================================================================================
// ADVANCED SEARCH HOOKS
// ========================================================================================

/**
 * Hook for advanced legislative search
 */
const useAdvancedLegislativeSearch = () => {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (options: AdvancedSearchOptions) => {
    setLoading(true);
    setError(null);

    try {
      const searchData = await legiScanComprehensiveApi.advancedBillSearch(options);
      
      // Transform to SearchResults format
      const searchResults: SearchResults = {
        query: options.query,
        executionTime: 0, // Would be measured in real implementation
        total: searchData.total,
        page: searchData.page,
        pageSize: options.pagination.pageSize,
        results: searchData.bills.map(bill => ({
          resultId: bill.id,
          relevanceScore: 1.0,
          matchType: 'Title' as const,
          bill: {
            id: bill.id,
            number: bill.billNumber,
            title: bill.title,
            summary: bill.summary,
            status: bill.status.stage,
            lastAction: bill.lastAction
          }
        }))
      };

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    performSearch,
  };
};

// ========================================================================================
// COMPREHENSIVE CIVIC ENGAGEMENT HOOK
// ========================================================================================

/**
 * Master hook combining all legislative features for personalized experience
 */
const useComprehensiveCivicEngagement = (userProfile?: UserLegislativeProfile) => {
  // State for various data types
  const [personalizedData, setPersonalizedData] = useState({
    relevantBills: [],
    upcomingEvents: [],
    representativeActivities: [],
    suggestedActions: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all relevant data based on user profile
  const fetchPersonalizedData = useCallback(async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch calendar events relevant to user interests
      const events = await legiScanComprehensiveApi.getLegislativeCalendar('CA', 30);
      
      // Filter events by user interests
      const relevantEvents = events.filter(event =>
        userProfile.interests.committees.includes(event.committeeId || 0) ||
        event.bills.some(bill => userProfile.interests.bills.includes(bill.billId))
      );

      setPersonalizedData(prev => ({
        ...prev,
        upcomingEvents: relevantEvents
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personalized data');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchPersonalizedData();
  }, [fetchPersonalizedData]);

  return {
    personalizedData,
    loading,
    error,
    refetch: fetchPersonalizedData,
  };
};

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

/**
 * Calculate voting statistics from voting records
 */
function calculateVotingStats(records: VotingRecord[], peopleId: number): LegislatorVotingStats {
  const totalVotes = records.length;
  const voteBreakdown = records.reduce(
    (acc, record) => {
      switch (record.vote) {
        case 'Yea':
          acc.yea++;
          break;
        case 'Nay':
          acc.nay++;
          break;
        case 'Not Voting':
          acc.notVoting++;
          break;
        case 'Absent':
          acc.absent++;
          break;
      }
      return acc;
    },
    { yea: 0, nay: 0, notVoting: 0, absent: 0 }
  );

  const participatedVotes = voteBreakdown.yea + voteBreakdown.nay;
  const attendanceRate = totalVotes > 0 ? (participatedVotes / totalVotes) * 100 : 0;

  return {
    legislatorId: peopleId,
    legislatorName: '', // Would be filled from legislator profile
    party: '',
    district: '',
    votingPeriod: {
      startDate: records[records.length - 1]?.date || '',
      endDate: records[0]?.date || ''
    },
    totalVotes,
    voteBreakdown,
    attendanceRate,
    partyLoyaltyScore: 0, // Would require party voting analysis
    bipartisanScore: 0, // Would require cross-party voting analysis
    significantVotes: records.filter(record => record.significance === 'Critical'),
    votesByTopic: [] // Would require topic categorization
  };
}

// ========================================================================================
// EXPORT ALL HOOKS
// ========================================================================================

export {
  useBillVotingRecords,
  useLegislatorVotingRecord,
  useCommitteeDetails,
  useStateCommittees,
  useCommitteeHearings,
  useLegislatorProfile,
  useLegislatorSearch,
  useBillDocuments,
  useDocumentContent,
  useLegislativeCalendar,
  useAdvancedLegislativeSearch,
  useComprehensiveCivicEngagement
};