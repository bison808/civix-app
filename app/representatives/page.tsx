'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Filter, SortAsc, Users, Building2, MapPin } from 'lucide-react';
import Button from '@/components/core/Button';
import RepresentativeCard from '@/components/representatives/RepresentativeCard';
import AggregatedFeedback from '@/components/feedback/AggregatedFeedback';
import { Representative } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

export default function RepresentativesPage() {
  const router = useRouter();
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [filteredReps, setFilteredReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'federal' | 'state' | 'local'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'approval' | 'responsiveness' | 'alignment'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showAggregatedFeedback, setShowAggregatedFeedback] = useState(false);

  useEffect(() => {
    loadRepresentatives();
  }, []);

  useEffect(() => {
    filterAndSortRepresentatives();
  }, [representatives, searchQuery, levelFilter, sortBy]);

  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const zipCode = typeof window !== 'undefined' ? localStorage.getItem('userZipCode') || '90210' : '90210';
      const data = await api.representatives.getByZipCode(zipCode);
      // Categorize representatives by level
      const enhancedData = data.map(rep => ({
        ...rep,
        level: rep.title === 'Senator' || rep.title === 'Representative' ? 'federal' : 
               rep.title.includes('State') ? 'state' : 'local',
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
        rep.district?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply level filter (using chamber instead of level)
    if (levelFilter !== 'all') {
      filtered = filtered.filter(rep => rep.chamber.toLowerCase() === levelFilter.toLowerCase());
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

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white safe-top">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-lg font-semibold">Your Representatives</h1>
        <button
          onClick={() => setShowAggregatedFeedback(!showAggregatedFeedback)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Users size={20} />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Filter size={20} />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search representatives by name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
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

          {/* Representatives List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          ) : filteredReps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {searchQuery || levelFilter !== 'all' 
                  ? 'No representatives match your filters' 
                  : 'No representatives found for your area'}
              </p>
              {(searchQuery || levelFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setLevelFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
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
                    {0}
                  </div>
                  <div className="text-xs text-gray-600">State</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Building2 className="mx-auto mb-1 text-orange-600" size={24} />
                  <div className="text-lg font-bold">
                    {0}
                  </div>
                  <div className="text-xs text-gray-600">Local</div>
                </div>
              </div>

              {/* Representatives Cards */}
              {filteredReps.map((rep) => (
                <RepresentativeCard
                  key={rep.id}
                  representative={rep}
                  onContact={(method) => handleContact(rep, method)}
                  onFeedback={(type) => handleFeedback(rep, type)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}