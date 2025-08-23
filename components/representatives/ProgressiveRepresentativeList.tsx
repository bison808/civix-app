'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Representative } from '@/types';

interface ExtendedRepresentative extends Representative {
  // level is now defined in base Representative interface
}
import { RepresentativeListSkeleton } from './RepresentativeCardSkeleton';
import RepresentativeCard from './RepresentativeCard';
import { optimizedApiClient } from '@/services/optimizedApiClient';
import { preloadForRepresentativeSearch } from '@/utils/serviceLoader';

interface ProgressiveRepresentativeListProps {
  zipCode: string;
  searchQuery: string;
  levelFilter: 'all' | 'federal' | 'state' | 'local';
  sortBy: 'name' | 'approval' | 'responsiveness' | 'alignment';
  onContact: (rep: ExtendedRepresentative, method: 'email' | 'phone') => void;
  onFeedback: (rep: ExtendedRepresentative, type: 'like' | 'dislike') => void;
}

interface LoadingState {
  federal: boolean;
  state: boolean;
  local: boolean;
}

export const ProgressiveRepresentativeList: React.FC<ProgressiveRepresentativeListProps> = ({
  zipCode,
  searchQuery,
  levelFilter,
  sortBy,
  onContact,
  onFeedback
}) => {
  const [representatives, setRepresentatives] = useState<ExtendedRepresentative[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    federal: true,
    state: true,
    local: true
  });

  // Preload services when component mounts
  useEffect(() => {
    preloadForRepresentativeSearch();
  }, []);

  // Progressive loading effect
  useEffect(() => {
    loadRepresentativesProgressively();
  }, [zipCode]);

  const loadRepresentativesProgressively = async () => {
    // Reset loading state
    setLoadingState({ federal: true, state: true, local: true });
    setRepresentatives([]);

    try {
      // Phase 1: Load federal representatives first (most important)
      const federalPromise = loadFederalRepresentatives(zipCode);
      
      // Phase 2: Load state representatives (medium priority)
      const statePromise = loadStateRepresentatives(zipCode);
      
      // Phase 3: Load local representatives (nice to have)
      const localPromise = loadLocalRepresentatives(zipCode);

      // Load federal first
      const federalReps = await federalPromise;
      setRepresentatives(prev => [...prev, ...federalReps]);
      setLoadingState(prev => ({ ...prev, federal: false }));

      // Then load state and local in parallel
      const [stateReps, localReps] = await Promise.allSettled([statePromise, localPromise]);

      if (stateReps.status === 'fulfilled') {
        setRepresentatives(prev => [...prev, ...stateReps.value]);
      }
      setLoadingState(prev => ({ ...prev, state: false }));

      if (localReps.status === 'fulfilled') {
        setRepresentatives(prev => [...prev, ...localReps.value]);
      }
      setLoadingState(prev => ({ ...prev, local: false }));

    } catch (error) {
      console.error('Failed to load representatives:', error);
      setLoadingState({ federal: false, state: false, local: false });
    }
  };

  const loadFederalRepresentatives = async (zip: string): Promise<ExtendedRepresentative[]> => {
    try {
      const data = await optimizedApiClient.getRepresentativesByZip(zip);
      return (data as ExtendedRepresentative[]).filter((rep: ExtendedRepresentative) => 
        rep.chamber === 'House' || rep.chamber === 'Senate'
      ).map(rep => ({ ...rep, level: 'federal' as const }));
    } catch (error) {
      console.error('Failed to load federal representatives:', error);
      return [];
    }
  };

  const loadStateRepresentatives = async (zip: string): Promise<ExtendedRepresentative[]> => {
    try {
      // Load California state representatives through lazy-loaded service
      const { getCaliforniaServices } = await import('@/services/lazy');
      const californiaServices = await getCaliforniaServices();
      
      const stateReps = await californiaServices.integratedCaliforniaStateService.getByZipCode(zip);
      return stateReps.map((rep: any) => ({
        ...rep,
        level: 'state'
      }));
    } catch (error) {
      console.error('Failed to load state representatives:', error);
      return [];
    }
  };

  const loadLocalRepresentatives = async (zip: string): Promise<ExtendedRepresentative[]> => {
    try {
      // Load local representatives through lazy-loaded service
      const { getCountyServices } = await import('@/services/lazy');
      const countyServices = await getCountyServices();
      
      const localReps = await countyServices.countyOfficialsApi.getByZipCode(zip);
      return localReps.map((rep: any) => ({
        ...rep,
        level: 'local'
      }));
    } catch (error) {
      console.error('Failed to load local representatives:', error);
      return [];
    }
  };

  // Memoized filtering and sorting
  const filteredAndSortedReps = useMemo(() => {
    let filtered = [...representatives];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rep => 
        rep.name.toLowerCase().includes(query) ||
        rep.title.toLowerCase().includes(query) ||
        (typeof rep.district === 'string' ? rep.district.toLowerCase().includes(query) : rep.district?.toString().includes(query))
      );
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(rep => {
        if (levelFilter === 'federal') {
          return rep.chamber === 'House' || rep.chamber === 'Senate';
        } else if (levelFilter === 'state') {
          return rep.level === 'state' || rep.title.toLowerCase().includes('state');
        } else if (levelFilter === 'local') {
          return rep.level === 'municipal' || rep.level === 'county' ||
                 rep.title.toLowerCase().includes('mayor') || 
                 rep.title.toLowerCase().includes('council') || 
                 rep.title.toLowerCase().includes('commissioner');
        }
        return false;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'approval':
        case 'responsiveness':
        case 'alignment':
          return (b.scorecard?.overallScore || 0) - (a.scorecard?.overallScore || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [representatives, searchQuery, levelFilter, sortBy]);

  // Calculate counts for stats
  const stats = useMemo(() => {
    return {
      federal: representatives.filter(r => r.chamber === 'House' || r.chamber === 'Senate').length,
      state: representatives.filter(r => r.level === 'state').length,
      local: representatives.filter(r => r.level === 'municipal' || r.level === 'county').length,
      total: representatives.length
    };
  }, [representatives]);

  const isAnyLoading = Object.values(loadingState).some(loading => loading);

  return (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-center mb-1">
            {loadingState.federal ? (
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{stats.federal}</span>
              </div>
            )}
          </div>
          <div className="text-lg font-bold">{stats.federal}</div>
          <div className="text-xs text-gray-600">Federal</div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-center mb-1">
            {loadingState.state ? (
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{stats.state}</span>
              </div>
            )}
          </div>
          <div className="text-lg font-bold">{stats.state}</div>
          <div className="text-xs text-gray-600">State</div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-center mb-1">
            {loadingState.local ? (
              <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{stats.local}</span>
              </div>
            )}
          </div>
          <div className="text-lg font-bold">{stats.local}</div>
          <div className="text-xs text-gray-600">Local</div>
        </div>
      </div>

      {/* Loading indicator */}
      {isAnyLoading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading representatives...
          </div>
        </div>
      )}

      {/* Representatives List */}
      {filteredAndSortedReps.length === 0 && !isAnyLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">
            {searchQuery || levelFilter !== 'all' 
              ? 'No representatives match your filters' 
              : 'No representatives found for your area'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Show loaded representatives */}
          {filteredAndSortedReps.map((rep) => (
            <RepresentativeCard
              key={rep.id}
              representative={rep}
              onContact={(method) => onContact(rep, method)}
              onFeedback={(type) => onFeedback(rep, type)}
            />
          ))}
          
          {/* Show skeleton for still loading sections */}
          {isAnyLoading && (
            <RepresentativeListSkeleton count={2} />
          )}
        </div>
      )}
    </div>
  );
};