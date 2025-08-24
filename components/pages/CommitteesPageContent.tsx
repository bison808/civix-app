'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Users, Calendar, TrendingUp, AlertCircle, Search, Filter, Clock, MapPin } from 'lucide-react';
import Card from '@/components/core/Card';
import Button from '@/components/core/Button';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import StandardPageHeader from '@/components/layout/StandardPageHeader';
import ContextualFeedbackPrompt from '@/components/feedback/ContextualFeedbackPrompt';
import StateExpansionWaitlist from '@/components/feedback/StateExpansionWaitlist';
import { CommitteeInfoCard } from '@/components/legislative/CommitteeInfoCard';
import { useAuth } from '@/contexts/AuthContext';
import { coverageDetectionService } from '@/services/coverageDetectionService';
import { useStateCommittees, useCommitteeHearings, useLegislativeCalendar } from '@/hooks/useComprehensiveLegislative';
import { cn } from '@/lib/utils';
import type { CommitteeInfo, LegislativeCalendarEvent } from '@/types/legislative-comprehensive.types';

export function CommitteesPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [locationData, setLocationData] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChamber, setFilterChamber] = useState<'All' | 'House' | 'Senate'>('All');
  const [showStats, setShowStats] = useState(true);

  // Fetch committees data using comprehensive hooks
  const { 
    committees, 
    loading: committeesLoading, 
    error: committeesError,
    refetch: refetchCommittees
  } = useStateCommittees('CA');

  const {
    events: upcomingHearings,
    loading: hearingsLoading,
    error: hearingsError
  } = useLegislativeCalendar('CA', 14); // Next 14 days

  useEffect(() => {
    const loadLocationData = async () => {
      const zipCode = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') : null;
      if (zipCode) {
        try {
          const zipResponse = await fetch('/api/auth/verify-zip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zipCode })
          });
          const zipData = await zipResponse.json();
          
          if (zipData.valid) {
            const locationData = {
              city: zipData.city,
              state: zipData.state,
              county: zipData.county,
              zipCode,
              coordinates: [0, 0] as [number, number],
              districts: { congressional: 0 }
            };
            const coverage = coverageDetectionService.determineUserExperience(locationData);
            setLocationData(locationData);
            setCoverage(coverage);
          }
        } catch (error) {
          console.error('Failed to load location data:', error);
        }
      }
      setIsInitialLoading(false);
    };

    loadLocationData();
  }, []);

  // Filter committees based on search and chamber
  const filteredCommittees = committees.filter(committee => {
    const matchesSearch = searchQuery === '' || 
      committee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      committee.jurisdiction.some(j => j.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesChamber = filterChamber === 'All' || committee.chamber === filterChamber;
    
    return matchesSearch && matchesChamber;
  });

  // Calculate statistics
  const stats = {
    totalCommittees: committees.length,
    houseCommittees: committees.filter(c => c.chamber === 'House').length,
    senateCommittees: committees.filter(c => c.chamber === 'Senate').length,
    upcomingHearings: upcomingHearings.filter(h => 
      h.type === 'Committee Hearing' && h.status === 'Scheduled'
    ).length,
    activeBills: committees.reduce((total, c) => total + c.currentBills.length, 0),
    totalMembers: committees.reduce((total, c) => total + c.members.length, 0)
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Committee System...</p>
        </div>
      </div>
    );
  }

  // Handle committee selection
  const handleCommitteeSelect = (committee: CommitteeInfo) => {
    setSelectedCommittee(committee);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Committee hearings for selected committee
  const selectedCommitteeHearings = selectedCommittee 
    ? upcomingHearings.filter(h => h.committee?.id === selectedCommittee.id)
    : [];

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Legislative Committees"
        description="Explore California legislative committees, track hearings, and follow your representatives' committee work."
        showLogo={true}
        logoSize="md"
      />

      {/* Loading State for Committees */}
      {committeesLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading committee information...</p>
        </div>
      )}

      {/* Error State */}
      {committeesError && (
        <Card variant="default" padding="lg" className="mb-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Committees</h3>
            <p className="text-gray-600 mb-4">
              There was an issue loading committee information. This may be due to API limitations or connectivity issues.
            </p>
            <Button onClick={refetchCommittees} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Success State - Show Committees */}
      {!committeesLoading && !committeesError && committees.length > 0 && (
        <>
          {/* Stats Dashboard */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card variant="default" padding="md" className="text-center">
                <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalCommittees}</p>
                <p className="text-sm text-gray-600">Active Committees</p>
              </Card>
              
              <Card variant="default" padding="md" className="text-center">
                <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingHearings}</p>
                <p className="text-sm text-gray-600">Upcoming Hearings</p>
              </Card>
              
              <Card variant="default" padding="md" className="text-center">
                <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </Card>
              
              <Card variant="default" padding="md" className="text-center">
                <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.activeBills}</p>
                <p className="text-sm text-gray-600">Bills in Committee</p>
              </Card>
            </div>
          )}

          {/* Search and Filter Controls */}
          <Card variant="default" padding="md" className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search committees by name or jurisdiction..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={filterChamber}
                  onChange={(e) => setFilterChamber(e.target.value as 'All' | 'House' | 'Senate')}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Chambers</option>
                  <option value="House">Assembly</option>
                  <option value="Senate">Senate</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredCommittees.length} of {committees.length} committees
              </div>
            </div>
          </Card>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Committee List */}
            <div className="lg:col-span-2">
              {filteredCommittees.length === 0 ? (
                <Card variant="default" padding="lg" className="text-center">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Committees Found</h3>
                  <p className="text-gray-600">
                    {searchQuery || filterChamber !== 'All' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No committee information is currently available.'
                    }
                  </p>
                  {(searchQuery || filterChamber !== 'All') && (
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterChamber('All');
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredCommittees.map((committee) => (
                    <div 
                      key={committee.id}
                      onClick={() => handleCommitteeSelect(committee)}
                      className={cn(
                        "cursor-pointer hover:shadow-md transition-shadow",
                        selectedCommittee?.id === committee.id && "ring-2 ring-blue-500"
                      )}
                    >
                      <CommitteeInfoCard
                        committee={committee}
                        upcomingHearings={upcomingHearings.filter(h => h.committee?.id === committee.id)}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Selected Committee Details or Upcoming Hearings */}
            <div className="lg:col-span-1">
              {selectedCommittee ? (
                <div className="space-y-6">
                  <Card variant="default" padding="md">
                    <h3 className="font-semibold text-gray-900 mb-3">Selected Committee</h3>
                    <CommitteeInfoCard
                      committee={selectedCommittee}
                      upcomingHearings={selectedCommitteeHearings}
                      compact={false}
                    />
                  </Card>
                  
                  <Button
                    onClick={() => setSelectedCommittee(null)}
                    variant="outline"
                    fullWidth
                  >
                    Clear Selection
                  </Button>
                </div>
              ) : (
                <Card variant="default" padding="md">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Committee Hearings
                  </h3>
                  
                  {hearingsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading hearings...</p>
                    </div>
                  ) : upcomingHearings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No upcoming hearings scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingHearings.slice(0, 5).map((hearing, index) => (
                        <div key={hearing.eventId || index} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {hearing.title}
                          </h4>
                          
                          <div className="mt-2 space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(hearing.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                              {hearing.startTime && (
                                <>
                                  <Clock className="h-3 w-3 ml-1" />
                                  {hearing.startTime}
                                </>
                              )}
                            </div>
                            
                            {hearing.location.room && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {hearing.location.room}
                              </div>
                            )}
                            
                            {hearing.committee && (
                              <div className="text-blue-600 font-medium">
                                {hearing.committee.name}
                              </div>
                            )}
                          </div>
                          
                          {hearing.bills.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="text-xs text-gray-500">
                                {hearing.bills.length} bill{hearing.bills.length !== 1 ? 's' : ''} on agenda
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {upcomingHearings.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm">
                            View All {upcomingHearings.length} Hearings
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/representatives')}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              View Your Representatives
            </Button>
            
            <Button
              onClick={() => router.push('/bills')}
              variant="outline"  
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Bills in Committee
            </Button>
            
            <Button
              onClick={() => router.push('/feed')}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Legislative Activity
            </Button>
          </div>
        </>
      )}

      {/* Empty State - No committees available */}
      {!committeesLoading && !committeesError && committees.length === 0 && (
        <Card variant="default" padding="lg" className="text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Committee Information Unavailable
            </h2>
            
            <p className="text-gray-600 mb-6">
              Committee information is currently unavailable. This may be due to API limitations or the LegiScan API key not being configured.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/representatives')}
                variant="primary"
                size="lg"
                fullWidth
              >
                View Your Representatives
              </Button>
              
              <Button
                onClick={() => router.push('/bills')}
                variant="outline"
                size="lg"
                fullWidth
              >
                View Legislative Bills
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Development Note</span>
              </div>
              <p className="text-sm text-blue-700">
                Full committee features are available when the LegiScan API key is configured. This includes committee membership, hearing schedules, and bill progression tracking.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Coverage-Aware Feedback Collection */}
      {coverage && locationData && (
        <div className="mt-8">
          {coverage.type === 'federal_only' ? (
            <StateExpansionWaitlist
              state={locationData.state}
              zipCode={locationData.zipCode}
              city={locationData.city}
            />
          ) : coverage.type === 'full_coverage' ? (
            <ContextualFeedbackPrompt
              context={{
                type: 'after_full_data',
                zipCode: locationData.zipCode,
                state: locationData.state,
                page: 'committees'
              }}
            />
          ) : (
            <ContextualFeedbackPrompt
              context={{
                type: 'empty_results',
                zipCode: locationData.zipCode,
                state: locationData.state,
                page: 'committees'
              }}
            />
          )}
        </div>
      )}

      {/* General Feedback for Committees System */}
      <div className="mt-6">
        <ContextualFeedbackPrompt
          context={{
            type: 'general',
            page: 'committees'
          }}
          compact
        />
      </div>
    </StandardPageLayout>
  );
}