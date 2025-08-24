'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  Calendar, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  MapPin,
  ExternalLink,
  Eye,
  Bell,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommitteeInfo, LegislativeCalendarEvent } from '@/types/legislative-comprehensive.types';

interface SmartCommitteeExplorerProps {
  committees: CommitteeInfo[];
  userInterests?: string[];
  userRepresentatives?: Array<{ name: string; id: string }>;
  className?: string;
}

interface CommitteeFilterState {
  search: string;
  chamber: 'All' | 'House' | 'Senate';
  hasUserRep: boolean;
  hasUpcomingHearings: boolean;
  highActivity: boolean;
  userInterests: boolean;
}

interface CommitteeSummaryCardProps {
  committee: CommitteeInfo;
  isUserRelevant: boolean;
  upcomingHearings: LegislativeCalendarEvent[];
  onFollow: (committeeId: string) => void;
  onViewDetails: (committee: CommitteeInfo) => void;
}

// ========================================================================================
// SMART COMMITTEE FILTER SIDEBAR
// ========================================================================================

function CommitteeFilterSidebar({ 
  filters, 
  onFiltersChange, 
  totalCommittees,
  filteredCount,
  className 
}: {
  filters: CommitteeFilterState;
  onFiltersChange: (filters: CommitteeFilterState) => void;
  totalCommittees: number;
  filteredCount: number;
  className?: string;
}) {
  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Smart Filters
        </CardTitle>
        <div className="text-sm text-gray-600">
          Showing {filteredCount} of {totalCommittees} committees
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Committees
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Healthcare, Education, etc."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Chamber Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chamber
          </label>
          <div className="space-y-2">
            {(['All', 'House', 'Senate'] as const).map((chamber) => (
              <label key={chamber} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="chamber"
                  value={chamber}
                  checked={filters.chamber === chamber}
                  onChange={(e) => onFiltersChange({ ...filters, chamber: e.target.value as any })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {chamber === 'House' ? 'Assembly' : chamber}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Smart Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Smart Filters
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.hasUserRep}
                  onChange={(e) => onFiltersChange({ ...filters, hasUserRep: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Your Representatives</span>
              </div>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.hasUpcomingHearings}
                  onChange={(e) => onFiltersChange({ ...filters, hasUpcomingHearings: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Upcoming Hearings</span>
              </div>
              <Calendar className="h-4 w-4 text-green-500" />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.highActivity}
                  onChange={(e) => onFiltersChange({ ...filters, highActivity: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">High Activity</span>
              </div>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={filters.userInterests}
                  onChange={(e) => onFiltersChange({ ...filters, userInterests: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Matches Your Interests</span>
              </div>
              <Star className="h-4 w-4 text-yellow-500" />
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onFiltersChange({
            search: '',
            chamber: 'All',
            hasUserRep: false,
            hasUpcomingHearings: false,
            highActivity: false,
            userInterests: false
          })}
          className="w-full"
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// ENHANCED COMMITTEE SUMMARY CARD
// ========================================================================================

function CommitteeSummaryCard({ 
  committee, 
  isUserRelevant, 
  upcomingHearings,
  onFollow,
  onViewDetails 
}: CommitteeSummaryCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow(committee.id);
  };

  const chair = committee.members.find(m => m.role === 'Chair');
  const nextHearing = upcomingHearings[0];
  const isHighActivity = committee.statistics && committee.statistics.billsConsidered > 10;

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 border-2",
      isUserRelevant ? "border-blue-200 bg-blue-50/30" : "border-gray-200"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-bold line-clamp-2">
                {committee.name}
              </CardTitle>
              {isUserRelevant && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  <Star className="h-3 w-3 mr-1" />
                  Relevant
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={cn(
                "text-xs",
                committee.chamber === 'House' 
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-purple-100 text-purple-800 border-purple-300'
              )}>
                {committee.chamber === 'House' ? 'Assembly' : 'Senate'}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {committee.members.length} Members
              </Badge>
              
              {isHighActivity && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  High Activity
                </Badge>
              )}

              {nextHearing && (
                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Hearing Soon
                </Badge>
              )}
            </div>

            {/* Jurisdiction Tags */}
            {committee.jurisdiction.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {committee.jurisdiction.slice(0, 3).map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {committee.jurisdiction.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{committee.jurisdiction.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={handleFollow}
              className={cn(
                "px-3",
                isFollowing && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isFollowing ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <Bell className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
            
            {committee.url && (
              <a href={committee.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="px-2">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {committee.description && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {committee.description}
          </p>
        )}

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chair && (
            <div>
              <div className="text-xs text-gray-500 font-medium">Chair</div>
              <div className="text-sm font-medium truncate">{chair.name}</div>
              <div className="text-xs text-gray-600">({chair.party})</div>
            </div>
          )}
          
          {committee.statistics && (
            <div>
              <div className="text-xs text-gray-500 font-medium">Bills This Year</div>
              <div className="text-sm font-medium">{committee.statistics.billsConsidered}</div>
              <div className="text-xs text-gray-600">
                {committee.statistics.billsReported} reported
              </div>
            </div>
          )}
          
          <div>
            <div className="text-xs text-gray-500 font-medium">Next Meeting</div>
            <div className="text-sm font-medium">
              {nextHearing 
                ? new Date(nextHearing.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : 'TBD'
              }
            </div>
            {nextHearing?.startTime && (
              <div className="text-xs text-gray-600">{nextHearing.startTime}</div>
            )}
          </div>
          
          {committee.statistics && (
            <div>
              <div className="text-xs text-gray-500 font-medium">Success Rate</div>
              <div className="text-sm font-medium">
                {(committee.statistics.successRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">bills passed</div>
            </div>
          )}
        </div>

        {/* Next Hearing Preview */}
        {nextHearing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-green-900 text-sm line-clamp-1">
                  Upcoming: {nextHearing.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-green-700">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(nextHearing.date).toLocaleDateString()}
                  </div>
                  {nextHearing.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {nextHearing.startTime}
                    </div>
                  )}
                  {nextHearing.location.room && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {nextHearing.location.room}
                    </div>
                  )}
                </div>
                {nextHearing.bills.length > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    {nextHearing.bills.length} bill{nextHearing.bills.length !== 1 ? 's' : ''} on agenda
                  </div>
                )}
              </div>
              {nextHearing.publicAccess.openToPublic && (
                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                  Public
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(committee)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {nextHearing && (
              <Button variant="outline" size="sm">
                <Calendar className="h-3 w-3 mr-1" />
                View Agenda
              </Button>
            )}
          </div>
          
          {committee.statistics && (
            <div className="text-xs text-gray-500">
              {committee.statistics.averageMarkupTime} days avg. markup
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================================================================
// MAIN SMART COMMITTEE EXPLORER
// ========================================================================================

export default function SmartCommitteeExplorer({ 
  committees, 
  userInterests = [],
  userRepresentatives = [],
  className 
}: SmartCommitteeExplorerProps) {
  const [filters, setFilters] = useState<CommitteeFilterState>({
    search: '',
    chamber: 'All',
    hasUserRep: false,
    hasUpcomingHearings: false,
    highActivity: false,
    userInterests: false
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock upcoming hearings data - in real app would come from API
  const upcomingHearings: LegislativeCalendarEvent[] = [];

  const filteredCommittees = useMemo(() => {
    return committees.filter(committee => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const searchMatch = 
          committee.name.toLowerCase().includes(search) ||
          committee.jurisdiction.some(j => j.toLowerCase().includes(search)) ||
          (committee.description && committee.description.toLowerCase().includes(search));
        if (!searchMatch) return false;
      }

      // Chamber filter
      if (filters.chamber !== 'All' && committee.chamber !== filters.chamber) {
        return false;
      }

      // User representative filter
      if (filters.hasUserRep) {
        const hasUserRep = committee.members.some(member =>
          userRepresentatives.some(rep => rep.name === member.name)
        );
        if (!hasUserRep) return false;
      }

      // High activity filter
      if (filters.highActivity) {
        const isHighActivity = committee.statistics && committee.statistics.billsConsidered > 10;
        if (!isHighActivity) return false;
      }

      // User interests filter
      if (filters.userInterests) {
        const matchesInterests = committee.jurisdiction.some(j =>
          userInterests.some(interest => 
            j.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(j.toLowerCase())
          )
        );
        if (!matchesInterests) return false;
      }

      return true;
    });
  }, [committees, filters, userRepresentatives, userInterests]);

  const handleFollow = (committeeId: string) => {
    // Handle follow/unfollow logic
    console.log('Toggle follow for committee:', committeeId);
  };

  const handleViewDetails = (committee: CommitteeInfo) => {
    // Navigate to committee details
    console.log('View details for committee:', committee.id);
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-4 gap-6", className)}>
      {/* Filter Sidebar */}
      <div className="lg:col-span-1">
        <CommitteeFilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          totalCommittees={committees.length}
          filteredCount={filteredCommittees.length}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Committee Explorer</h2>
            <p className="text-gray-600">
              Discover committees relevant to your interests and representatives
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Results */}
        {filteredCommittees.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Committees Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find committees.
            </p>
            <Button variant="outline" onClick={() => setFilters({
              search: '',
              chamber: 'All',
              hasUserRep: false,
              hasUpcomingHearings: false,
              highActivity: false,
              userInterests: false
            })}>
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
          )}>
            {filteredCommittees.map((committee) => {
              const isUserRelevant = 
                committee.members.some(member =>
                  userRepresentatives.some(rep => rep.name === member.name)
                ) ||
                committee.jurisdiction.some(j =>
                  userInterests.some(interest => 
                    j.toLowerCase().includes(interest.toLowerCase()) ||
                    interest.toLowerCase().includes(j.toLowerCase())
                  )
                );

              return (
                <CommitteeSummaryCard
                  key={committee.id}
                  committee={committee}
                  isUserRelevant={isUserRelevant}
                  upcomingHearings={upcomingHearings.filter(h => 
                    h.eventId?.includes(committee.id)
                  )}
                  onFollow={handleFollow}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}