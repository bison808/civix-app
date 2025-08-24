'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bell, Settings, HelpCircle, Loader2, Users, Crown, Landmark, Building2, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { api } from '@/services/api';
import { Representative } from '@/types';
import { CivixLogo } from '@/components/CivixLogo';
import UserMenu from '@/components/UserMenu';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';
import EnhancedZipInput from '@/components/zipcode/EnhancedZipInput';
import EnhancedRepresentativeCard from '@/components/representatives/EnhancedRepresentativeCard';
import GovernmentLevelNav, { FilterState, GovernmentLevel } from '@/components/navigation/GovernmentLevelNav';
import AggregatedFeedback from '@/components/feedback/AggregatedFeedback';
import StateExpansionWaitlist from '@/components/feedback/StateExpansionWaitlist';
import ContextualFeedbackPrompt from '@/components/feedback/ContextualFeedbackPrompt';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';
import { coverageDetectionService, CoverageLevel, LocationData } from '@/services/coverageDetectionService';

const GOVERNMENT_LEVELS: GovernmentLevel[] = [
  {
    id: 'federal',
    label: 'Federal',
    icon: Crown,
    description: 'US Congress, President',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    priority: 4,
    count: 0
  },
  {
    id: 'state',
    label: 'State',
    icon: Landmark,
    description: 'Governor, State Legislature',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    priority: 3,
    count: 0
  },
  {
    id: 'county',
    label: 'County',
    icon: Building2,
    description: 'Supervisors, Sheriff, Judges',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    priority: 2,
    count: 0
  },
  {
    id: 'municipal',
    label: 'City/Local',
    icon: Home,
    description: 'Mayor, City Council',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    priority: 1,
    count: 0
  }
];

export default function EnhancedRepresentativesPage() {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // State management
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [showZipInput, setShowZipInput] = useState(!user?.zipCode);
  const [showAggregatedFeedback, setShowAggregatedFeedback] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [coverage, setCoverage] = useState<CoverageLevel | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    levels: [],
    parties: [],
    sortBy: 'name',
    sortOrder: 'asc',
    searchTerm: ''
  });

  // Load representatives when ZIP code changes
  useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      loadRepresentatives(zipCode);
    }
  }, [zipCode]);

  // Update government level counts when representatives change
  const governmentLevelsWithCounts = useMemo(() => {
    return GOVERNMENT_LEVELS.map(level => ({
      ...level,
      count: representatives.filter(rep => rep.level === level.id).length
    }));
  }, [representatives]);

  // Filter and sort representatives
  const filteredRepresentatives = useMemo(() => {
    let filtered = [...representatives];

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(rep => 
        rep.name.toLowerCase().includes(searchTerm) ||
        rep.title.toLowerCase().includes(searchTerm) ||
        rep.party.toLowerCase().includes(searchTerm) ||
        (rep.district && rep.district.toString().includes(searchTerm))
      );
    }

    // Apply level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter(rep => filters.levels.includes(rep.level));
    }

    // Apply party filter
    if (filters.parties.length > 0) {
      filtered = filtered.filter(rep => filters.parties.includes(rep.party));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'level':
          const levelPriority = { federal: 4, state: 3, county: 2, municipal: 1 };
          comparison = (levelPriority[b.level as keyof typeof levelPriority] || 0) - 
                      (levelPriority[a.level as keyof typeof levelPriority] || 0);
          break;
        case 'approval':
        case 'responsiveness':
        case 'alignment':
          comparison = (b.scorecard?.overallScore || 0) - (a.scorecard?.overallScore || 0);
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [representatives, filters]);

  const loadRepresentatives = async (zip: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get location and coverage data
      const zipResponse = await fetch('/api/auth/verify-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode: zip })
      });

      const zipData = await zipResponse.json();

      if (!zipData.valid) {
        setError('Invalid ZIP code. Please enter a valid US ZIP code.');
        return;
      }

      // Create location data and determine coverage
      const locationData: LocationData = {
        city: zipData.city,
        state: zipData.state,
        county: zipData.county,
        zipCode: zip,
        coordinates: [0, 0], // Default coordinates
        districts: { congressional: 0 }
      };

      const coverage = coverageDetectionService.determineUserExperience(locationData);
      
      setLocationData(locationData);
      setCoverage(coverage);

      // Load representatives based on coverage
      const data = await api.representatives.getByZipCode(zip);
      
      // Filter representatives based on coverage level
      let filteredData = data;
      if (coverage.type === 'federal_only') {
        // Only show federal representatives for non-CA states
        filteredData = data.filter(rep => 
          rep.chamber === 'House' || rep.chamber === 'Senate'
        );
      }
      
      // Enhance data with levels and sample scores
      const enhancedData = filteredData.map((rep, index) => ({
        ...rep,
        level: (rep.title === 'Senator' || rep.title === 'Representative' ? 'federal' : 
               rep.title.includes('State') || rep.title.includes('Assembly') ? 'state' : 
               rep.title.includes('County') || rep.title.includes('Supervisor') ? 'county' : 'municipal') as 'federal' | 'state' | 'county' | 'municipal',
        jurisdiction: rep.state || locationData.state,
        governmentType: (rep.title === 'Senator' || rep.title === 'Representative' ? 'federal' :
                       rep.title.includes('State') ? 'state' : 
                       rep.title.includes('County') ? 'county' : 'city') as 'city' | 'county' | 'state' | 'federal' | 'district' | 'special',
        jurisdictionScope: (rep.title === 'Senator' ? 'statewide' :
                          rep.title === 'Representative' ? 'district' :
                          rep.title.includes('State') ? 'statewide' : 'district') as 'citywide' | 'countywide' | 'statewide' | 'national' | 'district',
        scorecard: {
          ...rep.scorecard,
          overallScore: Math.floor(Math.random() * 40) + 50 + (index % 3) * 10, // Sample varied scores
          votingRecord: rep.scorecard?.votingRecord || {
            totalVotes: 0,
            yesVotes: 0,
            noVotes: 0,
            abstentions: 0,
            presentVotes: 0,
            notVoting: 0
          },
          sponsoredBills: rep.scorecard?.sponsoredBills || 0,
          cosponseredBills: rep.scorecard?.cosponseredBills || 0,
          missedVotes: rep.scorecard?.missedVotes || 0,
          totalVotes: rep.scorecard?.totalVotes || 0,
          topIssues: rep.scorecard?.topIssues || [],
          lastUpdated: rep.scorecard?.lastUpdated || new Date().toISOString()
        }
      }));

      setRepresentatives(enhancedData);
      setShowZipInput(false);
    } catch (err) {
      setError('Failed to load representatives. Please try again.');
      console.error('Failed to load representatives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZipChange = (newZip: string) => {
    setZipCode(newZip);
  };

  const handleValidZip = (zipData: { zip: string; city: string; state: string; county: string }) => {
    // Update the ZIP code and potentially save to user profile
    setZipCode(zipData.zip);
  };

  const handleContact = async (rep: Representative, method: 'email' | 'phone' | 'website') => {
    switch (method) {
      case 'email':
        if (rep.contactInfo.email) {
          window.location.href = `mailto:${rep.contactInfo.email}`;
        }
        break;
      case 'phone':
        if (rep.contactInfo.phone) {
          window.location.href = `tel:${rep.contactInfo.phone}`;
        }
        break;
      case 'website':
        if (rep.contactInfo.website) {
          window.open(rep.contactInfo.website, '_blank');
        }
        break;
    }
  };

  const handleFeedback = (rep: Representative, type: 'like' | 'dislike') => {
    console.log('Feedback:', rep.id, type);
    // Would submit feedback to API
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <CivixLogo size="sm" />
              {!isMobile && (
                <>
                  <ZipDisplay showChangeButton={false} />
                  <VerificationBadge size="sm" showLabel={false} />
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <HelpCircle size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings size={20} />
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ZIP Code Input Section */}
          {showZipInput && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Find Your Representatives
                </h2>
                <EnhancedZipInput
                  value={zipCode}
                  onChange={handleZipChange}
                  onValidZip={handleValidZip}
                  size="lg"
                  autoFocus
                />
                <p className="mt-3 text-sm text-gray-600 text-center">
                  Enter your ZIP code to see all your representatives from federal to local levels
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-gray-600">Loading your representatives...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowZipInput(true)}
              >
                Try Different ZIP Code
              </Button>
            </div>
          )}

          {/* Representatives Section */}
          {!loading && !error && representatives.length > 0 && (
            <div className="space-y-8">
              {/* Navigation & Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <GovernmentLevelNav
                  filters={filters}
                  onFiltersChange={setFilters}
                  governmentLevels={governmentLevelsWithCounts}
                  totalCount={representatives.length}
                  compact={isMobile}
                />
              </div>

              {/* View Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Showing {filteredRepresentatives.length} of {representatives.length} representatives
                  </span>
                  {zipCode && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowZipInput(true)}
                    >
                      Change ZIP Code
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={showAggregatedFeedback ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowAggregatedFeedback(!showAggregatedFeedback)}
                  >
                    <Users size={16} className="mr-1" />
                    Community Feedback
                  </Button>
                  
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={cn(
                        'px-3 py-1 text-sm',
                        viewMode === 'cards' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={cn(
                        'px-3 py-1 text-sm border-l border-gray-300',
                        viewMode === 'compact' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      Compact
                    </button>
                  </div>
                </div>
              </div>

              {/* Aggregated Feedback */}
              {showAggregatedFeedback && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <AggregatedFeedback
                    targetId="all-representatives"
                    targetType="representative"
                  />
                </div>
              )}

              {/* Coverage Status Banner */}
              {coverage && locationData && (
                <div className={cn(
                  'p-4 rounded-lg border',
                  coverage.type === 'full_coverage' 
                    ? 'bg-green-50 border-green-200'
                    : coverage.type === 'federal_only'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {locationData.city}, {locationData.state}
                      </h3>
                      <p className="text-sm text-gray-600">{coverage.message}</p>
                    </div>
                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      coverage.type === 'full_coverage' 
                        ? 'bg-green-100 text-green-700'
                        : coverage.type === 'federal_only'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    )}>
                      {coverage.type === 'full_coverage' && 'Full Coverage'}
                      {coverage.type === 'federal_only' && 'Federal Only'}
                      {coverage.type === 'not_supported' && 'Limited'}
                    </div>
                  </div>
                </div>
              )}

              {/* Representatives List */}
              {filteredRepresentatives.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">No representatives match your filters</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      levels: [],
                      parties: [],
                      sortBy: 'name',
                      sortOrder: 'asc',
                      searchTerm: ''
                    })}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className={cn(
                  'space-y-4',
                  viewMode === 'compact' && 'space-y-2'
                )}>
                  {filteredRepresentatives.map((rep) => (
                    <EnhancedRepresentativeCard
                      key={rep.id}
                      representative={rep}
                      onContact={(method) => handleContact(rep, method)}
                      onFeedback={(type) => handleFeedback(rep, type)}
                      variant={viewMode === 'compact' ? 'compact' : 'default'}
                      showHierarchy={true}
                    />
                  ))}
                </div>
              )}

              {/* State Expansion Waitlist for Federal-Only Coverage */}
              {coverage && coverage.type === 'federal_only' && locationData && (
                <div className="mt-8">
                  <StateExpansionWaitlist
                    state={locationData.state}
                    zipCode={zipCode}
                    city={locationData.city}
                  />
                </div>
              )}

              {/* Contextual Feedback Prompts */}
              {coverage && locationData && (
                <div className="mt-6">
                  {coverage.type === 'full_coverage' ? (
                    <ContextualFeedbackPrompt
                      context={{
                        type: 'after_full_data',
                        zipCode,
                        state: locationData.state,
                        page: 'representatives'
                      }}
                      compact
                    />
                  ) : coverage.type === 'federal_only' ? (
                    <ContextualFeedbackPrompt
                      context={{
                        type: 'limited_coverage',
                        zipCode,
                        state: locationData.state,
                        page: 'representatives'
                      }}
                      state={locationData.state}
                      compact
                    />
                  ) : (
                    <ContextualFeedbackPrompt
                      context={{
                        type: 'empty_results',
                        zipCode,
                        state: locationData.state,
                        page: 'representatives'
                      }}
                      compact
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && representatives.length === 0 && !showZipInput && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No representatives found for your area</p>
              <Button 
                variant="primary"
                onClick={() => setShowZipInput(true)}
              >
                Enter ZIP Code
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}