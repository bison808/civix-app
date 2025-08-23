'use client';

import { useState } from 'react';
import { 
  Crown, 
  Landmark, 
  Building2, 
  Home, 
  Filter, 
  SortAsc, 
  Users, 
  MapPin,
  ChevronDown,
  X,
  Search
} from 'lucide-react';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';

export interface GovernmentLevel {
  id: 'federal' | 'state' | 'county' | 'municipal';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  bgColor: string;
  priority: number;
  count?: number;
}

export interface FilterState {
  levels: string[];
  parties: string[];
  sortBy: 'name' | 'level' | 'approval' | 'responsiveness' | 'alignment';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

interface GovernmentLevelNavProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  governmentLevels: GovernmentLevel[];
  totalCount: number;
  className?: string;
  compact?: boolean;
}

const DEFAULT_GOVERNMENT_LEVELS: GovernmentLevel[] = [
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
    description: 'Governor, Legislature',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    priority: 3,
    count: 0
  },
  {
    id: 'county',
    label: 'County',
    icon: Building2,
    description: 'Supervisors, Sheriff',
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

const SORT_OPTIONS = [
  { value: 'name', label: 'Name', icon: SortAsc },
  { value: 'level', label: 'Government Level', icon: Landmark },
  { value: 'approval', label: 'Approval Rating', icon: Users },
  { value: 'responsiveness', label: 'Responsiveness', icon: Users },
  { value: 'alignment', label: 'Alignment Score', icon: Users }
];

const PARTY_OPTIONS = [
  { value: 'Democrat', label: 'Democrat', color: 'bg-blue-100 text-blue-800' },
  { value: 'Republican', label: 'Republican', color: 'bg-red-100 text-red-800' },
  { value: 'Independent', label: 'Independent', color: 'bg-purple-100 text-purple-800' }
];

export default function GovernmentLevelNav({
  filters,
  onFiltersChange,
  governmentLevels = DEFAULT_GOVERNMENT_LEVELS,
  totalCount,
  className = '',
  compact = false
}: GovernmentLevelNavProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleLevel = (levelId: string) => {
    const newLevels = filters.levels.includes(levelId)
      ? filters.levels.filter(l => l !== levelId)
      : [...filters.levels, levelId];
    updateFilters({ levels: newLevels });
  };

  const toggleParty = (party: string) => {
    const newParties = filters.parties.includes(party)
      ? filters.parties.filter(p => p !== party)
      : [...filters.parties, party];
    updateFilters({ parties: newParties });
  };

  const clearFilters = () => {
    updateFilters({
      levels: [],
      parties: [],
      sortBy: 'name',
      sortOrder: 'asc',
      searchTerm: ''
    });
  };

  const activeFiltersCount = filters.levels.length + filters.parties.length + 
    (filters.searchTerm ? 1 : 0);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 p-3 bg-white border-b border-gray-200', className)}>
        {/* Level Pills */}
        <div className="flex items-center gap-1 flex-1">
          {governmentLevels.map((level) => {
            const Icon = level.icon;
            const isActive = filters.levels.includes(level.id);
            
            return (
              <button
                key={level.id}
                onClick={() => toggleLevel(level.id)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all',
                  isActive
                    ? `${level.bgColor} ${level.color} border border-current`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{level.label}</span>
                {level.count !== undefined && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    isActive ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                  )}>
                    {level.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="relative"
        >
          <Filter size={16} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="text-gray-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Your Representatives</h2>
          <span className="text-sm text-gray-500">({totalCount} total)</span>
        </div>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={16} className="mr-1" />
            Clear Filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, title, or district..."
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Government Level Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Government Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {governmentLevels.sort((a, b) => b.priority - a.priority).map((level) => {
            const Icon = level.icon;
            const isActive = filters.levels.includes(level.id);
            
            return (
              <button
                key={level.id}
                onClick={() => toggleLevel(level.id)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isActive
                    ? `${level.bgColor} ${level.color} border-current shadow-md`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={24} className={isActive ? level.color : 'text-gray-400'} />
                  {level.count !== undefined && (
                    <span className={cn(
                      'px-2 py-1 rounded-full text-sm font-medium',
                      isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100 text-gray-600'
                    )}>
                      {level.count}
                    </span>
                  )}
                </div>
                <div className="font-medium mb-1">{level.label}</div>
                <div className={cn(
                  'text-xs',
                  isActive ? 'text-current opacity-80' : 'text-gray-500'
                )}>
                  {level.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <Button
        variant="ghost"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="w-full justify-between"
      >
        <span>Advanced Filters</span>
        <ChevronDown 
          size={20} 
          className={cn(
            'transition-transform duration-200',
            showAdvancedFilters ? 'rotate-180' : ''
          )} 
        />
      </Button>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* Party Filter */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Political Party</h4>
            <div className="flex flex-wrap gap-2">
              {PARTY_OPTIONS.map((party) => (
                <button
                  key={party.value}
                  onClick={() => toggleParty(party.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border transition-colors',
                    filters.parties.includes(party.value)
                      ? `${party.color} border-current`
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {party.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ sortBy: option.value as any })}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                    filters.sortBy === option.value
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <option.icon size={14} />
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Sort Order */}
            <div className="flex gap-2">
              <button
                onClick={() => updateFilters({ sortOrder: 'asc' })}
                className={cn(
                  'px-3 py-1 rounded text-sm',
                  filters.sortOrder === 'asc'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                Ascending
              </button>
              <button
                onClick={() => updateFilters({ sortOrder: 'desc' })}
                className={cn(
                  'px-3 py-1 rounded text-sm',
                  filters.sortOrder === 'desc'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                Descending
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}