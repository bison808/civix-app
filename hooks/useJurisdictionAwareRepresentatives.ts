/**
 * Hook for jurisdiction-aware representative data
 * Provides representatives filtered based on jurisdiction type (incorporated vs unincorporated)
 */

import { useState, useEffect } from 'react';
import { integratedRepresentativesService } from '@/services/integratedRepresentatives.service';
import { FederalRepresentative } from '@/types/federal.types';
import { Representative } from '@/types/representatives.types';
import { JurisdictionDetectionResult } from '@/types/jurisdiction.types';

interface JurisdictionAwareRepresentativesState {
  // Representative data
  federal: FederalRepresentative[];
  state: Representative[];
  local: Representative[];
  total: number;
  breakdown: {
    federal: number;
    state: number;
    local: number;
  };
  
  // Jurisdiction information
  jurisdiction: JurisdictionDetectionResult | null;
  areaInfo: {
    title: string;
    description: string;
    governmentStructure: string;
    representatives: string;
  } | null;
  
  // State management
  loading: boolean;
  error: string | null;
  zipCode: string | null;
}

interface UseJurisdictionAwareRepresentativesOptions {
  includeVotingRecords?: boolean;
  includeBillData?: boolean;
  includeCommitteeInfo?: boolean;
  cacheResults?: boolean;
}

export const useJurisdictionAwareRepresentatives = (
  zipCode?: string,
  options: UseJurisdictionAwareRepresentativesOptions = {}
) => {
  const [state, setState] = useState<JurisdictionAwareRepresentativesState>({
    federal: [],
    state: [],
    local: [],
    total: 0,
    breakdown: { federal: 0, state: 0, local: 0 },
    jurisdiction: null,
    areaInfo: null,
    loading: false,
    error: null,
    zipCode: null
  });

  const fetchRepresentatives = async (zip: string) => {
    if (!zip || zip.length !== 5) {
      setState(prev => ({
        ...prev,
        error: 'Please provide a valid 5-digit ZIP code',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, zipCode: zip }));

    try {
      const result = await integratedRepresentativesService.getAllRepresentativesByZipCode(
        zip, 
        options
      );

      setState(prev => ({
        ...prev,
        federal: result.federal,
        state: result.state,
        local: result.local,
        total: result.total,
        breakdown: result.breakdown,
        jurisdiction: result.jurisdiction || null,
        areaInfo: result.areaInfo || null,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error fetching jurisdiction-aware representatives:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch representatives'
      }));
    }
  };

  const getJurisdictionInfo = async (zip: string) => {
    if (!zip || zip.length !== 5) return null;

    try {
      return await integratedRepresentativesService.getJurisdictionInfo(zip);
    } catch (error) {
      console.error('Error fetching jurisdiction info:', error);
      return null;
    }
  };

  const clearData = () => {
    setState({
      federal: [],
      state: [],
      local: [],
      total: 0,
      breakdown: { federal: 0, state: 0, local: 0 },
      jurisdiction: null,
      areaInfo: null,
      loading: false,
      error: null,
      zipCode: null
    });
  };

  const refreshData = async () => {
    if (state.zipCode) {
      await fetchRepresentatives(state.zipCode);
    }
  };

  // Auto-fetch when zipCode changes
  useEffect(() => {
    if (zipCode && zipCode !== state.zipCode) {
      fetchRepresentatives(zipCode);
    }
  }, [zipCode]);

  // Helper methods for UI
  const isIncorporatedCity = () => {
    return state.jurisdiction?.jurisdiction.type === 'incorporated_city';
  };

  const isUnincorporatedArea = () => {
    return state.jurisdiction?.jurisdiction.type === 'unincorporated_area' ||
           state.jurisdiction?.jurisdiction.type === 'census_designated_place';
  };

  const hasLocalRepresentatives = () => {
    return state.jurisdiction?.jurisdiction.hasLocalRepresentatives || false;
  };

  const getAreaType = () => {
    if (!state.jurisdiction) return 'unknown';
    return state.jurisdiction.jurisdiction.type;
  };

  const getConfidenceLevel = () => {
    if (!state.jurisdiction) return 0;
    return state.jurisdiction.confidence;
  };

  const getApplicableLevels = () => {
    if (!state.jurisdiction) return [];
    return state.jurisdiction.jurisdiction.governmentLevel;
  };

  const getExclusionReason = () => {
    if (isUnincorporatedArea()) {
      return `${state.jurisdiction?.jurisdiction.name} is an unincorporated area of ${state.jurisdiction?.jurisdiction.county}. Local government services are provided at the county level.`;
    }
    return null;
  };

  return {
    // Data
    ...state,
    
    // Actions
    fetchRepresentatives,
    getJurisdictionInfo,
    clearData,
    refreshData,
    
    // Helper methods
    isIncorporatedCity,
    isUnincorporatedArea,
    hasLocalRepresentatives,
    getAreaType,
    getConfidenceLevel,
    getApplicableLevels,
    getExclusionReason
  };
};

export default useJurisdictionAwareRepresentatives;