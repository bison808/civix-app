'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Users, Building2, MapPin, Bell, Grid3X3, List, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/core/Button';
import RepresentativeCard from '@/components/representatives/RepresentativeCard';
import AggregatedFeedback from '@/components/feedback/AggregatedFeedback';
import { Representative } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { CivixLogo } from '@/components/CivixLogo';
import UserMenu from '@/components/UserMenu';
import ZipDisplay from '@/components/ZipDisplay';
import VerificationBadge from '@/components/VerificationBadge';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function RepresentativesPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [filteredReps, setFilteredReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'federal' | 'state' | 'local'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'approval' | 'responsiveness' | 'alignment'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showAggregatedFeedback, setShowAggregatedFeedback] = useState(false);
  
  // New organization states
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [regionFilter, setRegionFilter] = useState<'all' | 'northern' | 'central' | 'southern'>('all');

  useEffect(() => {
    loadRepresentatives();
  }, []);

  useEffect(() => {
    filterAndSortRepresentatives();
  }, [representatives, searchQuery, levelFilter, sortBy, regionFilter]);

  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const zipCode = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') || '90210' : '90210';
      const data = await api.representatives.getByZipCode(zipCode);
      // Categorize representatives by level
      const enhancedData = data.map(rep => ({
        ...rep,
        level: (rep.title === 'Senator' || rep.title === 'Representative' ? 'federal' : 
               rep.title.includes('State') ? 'state' : 'local') as 'federal' | 'state' | 'county' | 'municipal',
        jurisdiction: rep.state || 'Unknown',
        governmentType: (rep.title === 'Senator' || rep.title === 'Representative' ? 'federal' :
                       rep.title.includes('State') ? 'state' : 
                       rep.title.includes('County') || rep.title.includes('Supervisor') ? 'county' : 'city') as 'city' | 'county' | 'state' | 'federal' | 'district' | 'special',
        jurisdictionScope: (rep.title === 'Senator' ? 'statewide' :
                          rep.title === 'Representative' ? 'district' :
                          rep.title.includes('State') ? 'statewide' : 'district') as 'citywide' | 'countywide' | 'statewide' | 'national' | 'district',
        approvalRating: Math.floor(Math.random() * 40) + 50,
        responsiveness: Math.floor(Math.random() * 30) + 60,
        totalFeedback: Math.floor(Math.random() * 2000) + 100
      }));
      setRepresentatives(enhancedData);
      setFilteredReps(enhancedData);
    } catch (error) {
      console.error('Failed to load representatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRepresentatives = () => {
    let filtered = [...representatives];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(rep => 
        rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof rep.district === 'string' ? rep.district.toLowerCase().includes(searchQuery.toLowerCase()) : rep.district?.toString().includes(searchQuery)) ||
        rep.party.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply level filter based on chamber and title
    if (levelFilter !== 'all') {
      filtered = filtered.filter(rep => {
        if (levelFilter === 'federal') {
          return rep.chamber === 'House' || rep.chamber === 'Senate';
        } else if (levelFilter === 'state') {
          return rep.chamber === 'assembly' || rep.chamber === 'senate';
        } else if (levelFilter === 'local') {
          return !['House', 'Senate', 'assembly', 'senate'].includes(rep.chamber);
        }
        return false;
      });
    }

    // Apply region filter for California state legislators
    if (regionFilter !== 'all') {
      filtered = filtered.filter(rep => {
        if (rep.chamber === 'assembly' || rep.chamber === 'senate') {
          const districtNum = typeof rep.district === 'string' ? parseInt(rep.district) : rep.district;
          if (districtNum) {
            const region = getCaliforniaRegion(districtNum);
            return region === regionFilter;
          }
        }
        // For non-state legislators, include all when any region is selected
        return rep.chamber === 'House' || rep.chamber === 'Senate' || (!['assembly', 'senate'].includes(rep.chamber));
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'approval':
          return (b.scorecard?.overallScore || 0) - (a.scorecard?.overallScore || 0);
        case 'responsiveness':
          return (b.scorecard?.overallScore || 0) - (a.scorecard?.overallScore || 0);
        case 'alignment':
          return (b.scorecard?.overallScore || 0) - (a.scorecard?.overallScore || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredReps(filtered);
  };

  const handleContact = async (rep: Representative, method: 'email' | 'phone') => {
    if (method === 'email') {
      window.location.href = `mailto:${rep.contactInfo.email}`;
    } else {
      window.location.href = `tel:${rep.contactInfo.phone}`;
    }
  };

  const handleFeedback = (rep: Representative, type: 'like' | 'dislike') => {
    console.log('Feedback:', rep.id, type);
    // Would submit feedback to API
  };

  // Organization helper functions
  const getCaliforniaRegion = (districtNum: number): 'northern' | 'central' | 'southern' => {
    // California Assembly/Senate district regional mapping
    if (districtNum <= 15) return 'northern';
    if (districtNum <= 35) return 'central';
    return 'southern';
  };

  const organizeByDistricts = (reps: Representative[]) => {
    const organized: { [key: string]: Representative[] } = {};
    
    reps.forEach(rep => {
      let groupKey = '';
      
      if (rep.chamber === 'House' || rep.chamber === 'Senate') {
        // Federal representatives
        groupKey = `Federal - ${rep.chamber === 'House' ? 'U.S. House' : 'U.S. Senate'}`;
      } else if (rep.chamber === 'assembly') {
        // State Assembly
        const districtNum = typeof rep.district === 'string' ? parseInt(rep.district) : rep.district;
        const region = districtNum ? getCaliforniaRegion(districtNum) : 'unknown';
        groupKey = `State Assembly - District ${rep.district || 'Unknown'} (${region.charAt(0).toUpperCase() + region.slice(1)} CA)`;
      } else if (rep.chamber === 'senate') {
        // State Senate
        const districtNum = typeof rep.district === 'string' ? parseInt(rep.district) : rep.district;
        const region = districtNum ? getCaliforniaRegion(districtNum) : 'unknown';
        groupKey = `State Senate - District ${rep.district || 'Unknown'} (${region.charAt(0).toUpperCase() + region.slice(1)} CA)`;
      } else {
        // Local representatives
        groupKey = `Local - ${rep.title}`;
      }
      
      if (!organized[groupKey]) {
        organized[groupKey] = [];
      }
      organized[groupKey].push(rep);
    });
    
    // Sort groups and representatives within groups
    const sortedGroups: { [key: string]: Representative[] } = {};
    Object.keys(organized)
      .sort((a, b) => {
        // Order: Federal, State Assembly, State Senate, Local
        const getOrder = (key: string) => {
          if (key.startsWith('Federal')) return 0;
          if (key.startsWith('State Assembly')) return 1;
          if (key.startsWith('State Senate')) return 2;
          return 3;
        };
        return getOrder(a) - getOrder(b) || a.localeCompare(b);
      })
      .forEach(key => {
        sortedGroups[key] = organized[key].sort((a, b) => a.name.localeCompare(b.name));
      });
    
    return sortedGroups;
  };

  const toggleGroupCollapse = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Desktop Header - Same as Feed */}
      {!isMobile && (
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white safe-top">
          <div className="flex items-center gap-4">
            <CivixLogo size="sm" />
            <ZipDisplay showChangeButton={false} />
            <VerificationBadge size="sm" showLabel={false} />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <UserMenu />
          </div>
        </header>
      )}

      {/* Enhanced Search and Controls */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search representatives by name, district, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* View Mode Toggle and Quick Filters */}
        <div className="flex items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'grouped'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Grid3X3 size={16} />
              {!isMobile && 'Grouped'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <List size={16} />
              {!isMobile && 'List'}
            </button>
          </div>

          {/* Region Filter */}
          <div className="flex gap-1">
            {(['all', 'northern', 'central', 'southern'] as const).map(region => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium transition-colors capitalize',
                  regionFilter === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {region === 'all' ? 'All CA' : region}
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            {!isMobile && 'Filters'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 bg-white border-b border-gray-200 space-y-3">
          {/* Level Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Level</label>
            <div className="flex gap-2">
              {(['all', 'federal', 'state', 'local'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize',
                    levelFilter === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {level === 'all' ? 'All Levels' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
            <div className="flex gap-2">
              {[
                { value: 'name', label: 'Name' },
                { value: 'approval', label: 'Approval Rating' },
                { value: 'responsiveness', label: 'Responsiveness' },
                { value: 'alignment', label: 'Alignment' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                    sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600" size={16} />
            <span className="text-sm text-blue-800">
              ZIP: {typeof window !== 'undefined' ? localStorage.getItem('userZipCode') || '90210' : '90210'}
            </span>
          </div>
          <span className="text-sm text-blue-800 font-medium">
            {filteredReps.length} of {representatives.length} representatives shown
          </span>
        </div>
      </div>

      {/* Content wrapper - Conditional padding based on mobile/desktop */}
      <div className={isMobile ? "flex-1 overflow-y-auto pt-14 pb-16" : "flex-1 overflow-y-auto"}>
        <div className="p-4 space-y-4">
          {/* Aggregated Feedback Panel */}
          {showAggregatedFeedback && filteredReps.length > 0 && (
            <div className="mb-4">
              <AggregatedFeedback
                targetId="all-representatives"
                targetType="representative"
              />
            </div>
          )}

          {/* Representatives Display */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
              ))}
            </div>
          ) : filteredReps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {searchQuery || levelFilter !== 'all' || regionFilter !== 'all'
                  ? 'No representatives match your filters' 
                  : 'No representatives found for your area'}
              </p>
              {(searchQuery || levelFilter !== 'all' || regionFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setLevelFilter('all');
                    setRegionFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-purple-600" size={24} />
                  <div className="text-lg font-bold">
                    {filteredReps.filter(r => r.chamber === 'House' || r.chamber === 'Senate').length}
                  </div>
                  <div className="text-xs text-gray-600">Federal</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-green-600" size={24} />
                  <div className="text-lg font-bold">
                    {filteredReps.filter(r => r.chamber === 'assembly').length}
                  </div>
                  <div className="text-xs text-gray-600">Assembly</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-blue-600" size={24} />
                  <div className="text-lg font-bold">
                    {filteredReps.filter(r => r.chamber === 'senate').length}
                  </div>
                  <div className="text-xs text-gray-600">State Senate</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-orange-600" size={24} />
                  <div className="text-lg font-bold">
                    {filteredReps.filter(r => !['House', 'Senate', 'assembly', 'senate'].includes(r.chamber)).length}
                  </div>
                  <div className="text-xs text-gray-600">Local</div>
                </div>
              </div>

              {/* Representatives Display - Grouped or List View */}
              {viewMode === 'grouped' ? (
                <div className="space-y-4">
                  {Object.entries(organizeByDistricts(filteredReps)).map(([groupKey, reps]) => (
                    <div key={groupKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroupCollapse(groupKey)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-900">
                            {groupKey}
                          </div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {reps.length} rep{reps.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {collapsedGroups.has(groupKey) ? (
                          <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                          <ChevronUp size={16} className="text-gray-500" />
                        )}
                      </button>
                      
                      {/* Group Content */}
                      {!collapsedGroups.has(groupKey) && (
                        <div className="divide-y divide-gray-100">
                          {reps.map((rep, index) => (
                            <div key={rep.id} className={index === 0 ? "" : "pt-0"}>
                              <RepresentativeCard
                                representative={rep}
                                onContact={(method) => handleContact(rep, method)}
                                onFeedback={(type) => handleFeedback(rep, type)}
                                compact={isMobile}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* List View */}
                  {filteredReps.map((rep) => (
                    <RepresentativeCard
                      key={rep.id}
                      representative={rep}
                      onContact={(method) => handleContact(rep, method)}
                      onFeedback={(type) => handleFeedback(rep, type)}
                      compact={isMobile}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}