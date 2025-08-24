import { useState, useEffect, useCallback } from 'react';
import { billsService } from '@/services/bills.service';
import { Bill } from '@/types/bills.types';
import { Representative } from '@/types/representatives.types';
import { 
  RepresentativeBillActivity, 
  UserBillPreferences 
} from '@/services/enhancedBillTracking.service';

interface UseEnhancedBillTrackingReturn {
  // Bills from user's representatives
  representativeBills: Bill[];
  loadingRepresentativeBills: boolean;
  errorRepresentativeBills: string | null;
  
  // Personalized bills
  personalizedBills: Bill[];
  loadingPersonalized: boolean;
  errorPersonalized: string | null;
  
  // Representative bill activity
  representativeActivity: RepresentativeBillActivity | null;
  loadingActivity: boolean;
  errorActivity: string | null;
  
  // Bill tracking
  trackedBills: Map<string, { bill: Bill; statusChanged: boolean }>;
  
  // Methods
  fetchBillsFromRepresentatives: (zipCode: string) => Promise<void>;
  fetchPersonalizedBills: (zipCode: string, preferences?: UserBillPreferences) => Promise<void>;
  fetchRepresentativeActivity: (representativeId: string, includeTypes?: Array<'sponsored' | 'cosponsored' | 'committee' | 'votes'>) => Promise<void>;
  trackBillProgress: (billId: string) => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useEnhancedBillTracking = (): UseEnhancedBillTrackingReturn => {
  // State for bills from representatives
  const [representativeBills, setRepresentativeBills] = useState<Bill[]>([]);
  const [loadingRepresentativeBills, setLoadingRepresentativeBills] = useState(false);
  const [errorRepresentativeBills, setErrorRepresentativeBills] = useState<string | null>(null);

  // State for personalized bills
  const [personalizedBills, setPersonalizedBills] = useState<Bill[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const [errorPersonalized, setErrorPersonalized] = useState<string | null>(null);

  // State for representative activity
  const [representativeActivity, setRepresentativeActivity] = useState<RepresentativeBillActivity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [errorActivity, setErrorActivity] = useState<string | null>(null);

  // State for tracked bills
  const [trackedBills, setTrackedBills] = useState<Map<string, { bill: Bill; statusChanged: boolean }>>(new Map());

  // Fetch bills from user's representatives
  const fetchBillsFromRepresentatives = useCallback(async (zipCode: string) => {
    if (!zipCode) {
      setErrorRepresentativeBills('ZIP code is required');
      return;
    }

    setLoadingRepresentativeBills(true);
    setErrorRepresentativeBills(null);

    try {
      const bills = await billsService.getBillsFromUserRepresentatives(zipCode);
      setRepresentativeBills(bills);
    } catch (error) {
      console.error('Error fetching representative bills:', error);
      setErrorRepresentativeBills(error instanceof Error ? error.message : 'Failed to fetch bills');
    } finally {
      setLoadingRepresentativeBills(false);
    }
  }, []);

  // Fetch personalized bills
  const fetchPersonalizedBills = useCallback(async (
    zipCode: string, 
    preferences?: UserBillPreferences
  ) => {
    if (!zipCode) {
      setErrorPersonalized('ZIP code is required');
      return;
    }

    setLoadingPersonalized(true);
    setErrorPersonalized(null);

    try {
      const bills = await billsService.getPersonalizedBills(zipCode, preferences);
      setPersonalizedBills(bills);
    } catch (error) {
      console.error('Error fetching personalized bills:', error);
      setErrorPersonalized(error instanceof Error ? error.message : 'Failed to fetch personalized bills');
    } finally {
      setLoadingPersonalized(false);
    }
  }, []);

  // Fetch representative activity
  const fetchRepresentativeActivity = useCallback(async (
    representativeId: string,
    includeTypes?: Array<'sponsored' | 'cosponsored' | 'committee' | 'votes'>
  ) => {
    if (!representativeId) {
      setErrorActivity('Representative ID is required');
      return;
    }

    setLoadingActivity(true);
    setErrorActivity(null);

    try {
      const activity = await billsService.getBillsByRepresentative(representativeId, includeTypes);
      setRepresentativeActivity(activity);
    } catch (error) {
      console.error('Error fetching representative activity:', error);
      setErrorActivity(error instanceof Error ? error.message : 'Failed to fetch representative activity');
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  // Track bill progress
  const trackBillProgress = useCallback(async (billId: string) => {
    if (!billId) {
      console.warn('Bill ID is required for tracking');
      return;
    }

    try {
      const result = await billsService.trackBillProgress(billId);
      
      setTrackedBills(prev => {
        const updated = new Map(prev);
        updated.set(billId, {
          bill: result.bill,
          statusChanged: result.statusChanged
        });
        return updated;
      });

      // If this bill is in our representative bills, update it
      setRepresentativeBills(prev => 
        prev.map(bill => bill.id === billId ? result.bill : bill)
      );

      // If this bill is in our personalized bills, update it
      setPersonalizedBills(prev => 
        prev.map(bill => bill.id === billId ? result.bill : bill)
      );

    } catch (error) {
      console.error('Error tracking bill progress:', error);
    }
  }, []);

  // Clear all caches
  const clearCache = useCallback(async () => {
    try {
      await billsService.clearAllCaches();
      
      // Clear local state
      setRepresentativeBills([]);
      setPersonalizedBills([]);
      setRepresentativeActivity(null);
      setTrackedBills(new Map());
      
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }, []);

  return {
    // Bills from representatives
    representativeBills,
    loadingRepresentativeBills,
    errorRepresentativeBills,
    
    // Personalized bills
    personalizedBills,
    loadingPersonalized,
    errorPersonalized,
    
    // Representative activity
    representativeActivity,
    loadingActivity,
    errorActivity,
    
    // Tracked bills
    trackedBills,
    
    // Methods
    fetchBillsFromRepresentatives,
    fetchPersonalizedBills,
    fetchRepresentativeActivity,
    trackBillProgress,
    clearCache,
  };
};

// Hook for specifically tracking California bills
export const useCaliforniaBillTracking = () => {
  const [californiaBills, setCaliforniaBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentCaliforniaBills = useCallback(async (limit?: number, offset?: number) => {
    setLoading(true);
    setError(null);

    try {
      const bills = await billsService.getRecentCaliforniaBills(limit, offset);
      setCaliforniaBills(bills);
    } catch (error) {
      console.error('Error fetching California bills:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch California bills');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCaliforniaBills = useCallback(async (query: string) => {
    if (!query) {
      setError('Search query is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bills = await billsService.searchCaliforniaBills(query);
      setCaliforniaBills(bills);
    } catch (error) {
      console.error('Error searching California bills:', error);
      setError(error instanceof Error ? error.message : 'Failed to search California bills');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    californiaBills,
    loading,
    error,
    fetchRecentCaliforniaBills,
    searchCaliforniaBills,
  };
};

// Hook for specifically tracking federal bills
export const useFederalBillTracking = () => {
  const [federalBills, setFederalBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentFederalBills = useCallback(async (limit?: number, offset?: number) => {
    setLoading(true);
    setError(null);

    try {
      const bills = await billsService.getRecentFederalBills(limit, offset);
      setFederalBills(bills);
    } catch (error) {
      console.error('Error fetching federal bills:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch federal bills');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFederalBills = useCallback(async (query: string) => {
    if (!query) {
      setError('Search query is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bills = await billsService.searchFederalBills(query);
      setFederalBills(bills);
    } catch (error) {
      console.error('Error searching federal bills:', error);
      setError(error instanceof Error ? error.message : 'Failed to search federal bills');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    federalBills,
    loading,
    error,
    fetchRecentFederalBills,
    searchFederalBills,
  };
};