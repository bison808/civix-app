'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Filter,
  BookOpen,
  Calendar,
  Users,
  Building,
  Tag,
  FileText,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Share,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Bill } from '@/types';

interface AdvancedLegislativeSearchProps {
  onSearch: (query: AdvancedSearchQuery) => Promise<Bill[]>;
  savedSearches?: SavedSearch[];
  searchHistory?: SearchHistory[];
  className?: string;
}

interface AdvancedSearchQuery {
  searchTerms: SearchTerm[];
  filters: SearchFilters;
  sorting: SortOption;
  pagination: PaginationOption;
}

interface SearchTerm {
  id: string;
  type: 'AND' | 'OR' | 'NOT' | 'PHRASE' | 'NEAR';
  field: 'all' | 'title' | 'summary' | 'fulltext' | 'sponsor' | 'committee';
  value: string;
  proximity?: number; // for NEAR operator
}

interface SearchFilters {
  chambers: ('House' | 'Senate')[];
  statuses: string[];
  subjects: string[];
  sponsors: string[];
  committees: string[];
  dateRange: {
    from?: string;
    to?: string;
    field: 'introduced' | 'lastAction' | 'enacted';
  };
  hasVotes: boolean;
  hasDocuments: boolean;
  publicHearings: boolean;
}

interface SortOption {
  field: 'relevance' | 'date' | 'status' | 'title' | 'sponsor';
  order: 'asc' | 'desc';
}

interface PaginationOption {
  page: number;
  size: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: AdvancedSearchQuery;
  created: string;
  lastUsed: string;
  resultCount: number;
}

interface SearchHistory {
  id: string;
  query: AdvancedSearchQuery;
  resultCount: number;
  timestamp: string;
}

interface SearchResultsProps {
  results: Bill[];
  query: AdvancedSearchQuery;
  loading: boolean;
  totalCount: number;
  onResultClick: (bill: Bill) => void;
}

// ========================================================================================
// SEARCH TERM BUILDER COMPONENT
// ========================================================================================

function SearchTermBuilder({ 
  terms, 
  onTermsChange 
}: { 
  terms: SearchTerm[];
  onTermsChange: (terms: SearchTerm[]) => void;
}) {
  const addTerm = () => {
    const newTerm: SearchTerm = {
      id: `term_${Date.now()}`,
      type: 'AND',
      field: 'all',
      value: ''
    };
    onTermsChange([...terms, newTerm]);
  };

  const updateTerm = (id: string, updates: Partial<SearchTerm>) => {
    onTermsChange(terms.map(term => 
      term.id === id ? { ...term, ...updates } : term
    ));
  };

  const removeTerm = (id: string) => {
    onTermsChange(terms.filter(term => term.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Search Terms</h3>
        <Button variant="outline" size="sm" onClick={addTerm}>
          <Plus className="h-4 w-4 mr-1" />
          Add Term
        </Button>
      </div>

      <div className="space-y-3">
        {terms.map((term, index) => (
          <div key={term.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {/* Logic Operator */}
            {index > 0 && (
              <select
                value={term.type}
                onChange={(e) => updateTerm(term.id, { type: e.target.value as SearchTerm['type'] })}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-medium"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
              </select>
            )}

            {/* Field Selector */}
            <select
              value={term.field}
              onChange={(e) => updateTerm(term.id, { field: e.target.value as SearchTerm['field'] })}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Fields</option>
              <option value="title">Title</option>
              <option value="summary">Summary</option>
              <option value="fulltext">Full Text</option>
              <option value="sponsor">Sponsor</option>
              <option value="committee">Committee</option>
            </select>

            {/* Search Type */}
            <select
              value={term.type === 'PHRASE' || term.type === 'NEAR' ? term.type : 'contains'}
              onChange={(e) => {
                if (e.target.value === 'PHRASE' || e.target.value === 'NEAR') {
                  updateTerm(term.id, { type: e.target.value as SearchTerm['type'] });
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="contains">Contains</option>
              <option value="PHRASE">Exact Phrase</option>
              <option value="NEAR">Near Words</option>
            </select>

            {/* Search Value */}
            <input
              type="text"
              value={term.value}
              onChange={(e) => updateTerm(term.id, { value: e.target.value })}
              placeholder="Enter search term..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />

            {/* Proximity for NEAR operator */}
            {term.type === 'NEAR' && (
              <input
                type="number"
                value={term.proximity || 5}
                onChange={(e) => updateTerm(term.id, { proximity: parseInt(e.target.value) || 5 })}
                min="1"
                max="20"
                className="w-16 px-2 py-2 border border-gray-300 rounded text-sm"
                placeholder="5"
              />
            )}

            {/* Remove Term */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTerm(term.id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {terms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No search terms added. Click "Add Term" to start building your query.</p>
        </div>
      )}
    </div>
  );
}

// ========================================================================================
// ADVANCED FILTERS COMPONENT
// ========================================================================================

function AdvancedFilters({ 
  filters, 
  onFiltersChange 
}: { 
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const FilterSection = ({ 
    id, 
    title, 
    icon, 
    children 
  }: { 
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Advanced Filters</h3>

      <div className="space-y-3">
        {/* Basic Filters */}
        <FilterSection 
          id="basic" 
          title="Basic Filters" 
          icon={<Filter className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chambers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chambers
              </label>
              <div className="space-y-2">
                {['House', 'Senate'].map((chamber) => (
                  <label key={chamber} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.chambers.includes(chamber as 'House' | 'Senate')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onFiltersChange({
                            ...filters,
                            chambers: [...filters.chambers, chamber as 'House' | 'Senate']
                          });
                        } else {
                          onFiltersChange({
                            ...filters,
                            chambers: filters.chambers.filter(c => c !== chamber)
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {chamber === 'House' ? 'Assembly' : chamber}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Status
              </label>
              <div className="space-y-2">
                {['Introduced', 'Committee', 'Floor Vote', 'Passed', 'Signed', 'Vetoed'].map((status) => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onFiltersChange({
                            ...filters,
                            statuses: [...filters.statuses, status]
                          });
                        } else {
                          onFiltersChange({
                            ...filters,
                            statuses: filters.statuses.filter(s => s !== status)
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Date Range */}
        <FilterSection 
          id="date" 
          title="Date Range" 
          icon={<Calendar className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Field
              </label>
              <select
                value={filters.dateRange.field}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange,
                    field: e.target.value as 'introduced' | 'lastAction' | 'enacted'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="introduced">Date Introduced</option>
                <option value="lastAction">Last Action Date</option>
                <option value="enacted">Date Enacted</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, from: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, to: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Content Filters */}
        <FilterSection 
          id="content" 
          title="Content & Documents" 
          icon={<FileText className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.hasVotes}
                onChange={(e) => onFiltersChange({ ...filters, hasVotes: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Has Voting Records</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.hasDocuments}
                onChange={(e) => onFiltersChange({ ...filters, hasDocuments: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Has Full Text Documents</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.publicHearings}
                onChange={(e) => onFiltersChange({ ...filters, publicHearings: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Has Public Hearings</span>
            </label>
          </div>
        </FilterSection>

        {/* Subject Tags */}
        <FilterSection 
          id="subjects" 
          title="Subject Tags" 
          icon={<Tag className="h-4 w-4" />}
        >
          <div>
            <input
              type="text"
              placeholder="Start typing to add subjects..."
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
            />
            
            <div className="flex flex-wrap gap-2">
              {/* Mock popular subjects */}
              {['Healthcare', 'Education', 'Environment', 'Transportation', 'Budget', 'Housing'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    if (!filters.subjects.includes(subject)) {
                      onFiltersChange({
                        ...filters,
                        subjects: [...filters.subjects, subject]
                      });
                    }
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-colors",
                    filters.subjects.includes(subject)
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {subject}
                  {filters.subjects.includes(subject) && (
                    <X 
                      className="h-3 w-3 ml-1 inline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFiltersChange({
                          ...filters,
                          subjects: filters.subjects.filter(s => s !== subject)
                        });
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {filters.subjects.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filters.subjects.length} subject{filters.subjects.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, subjects: [] })}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

// ========================================================================================
// SEARCH RESULTS COMPONENT
// ========================================================================================

function SearchResults({ 
  results, 
  query, 
  loading, 
  totalCount, 
  onResultClick 
}: SearchResultsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching legislative database...</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find more results.
          </p>
          <Button variant="outline">
            Broaden Search Criteria
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Search Results ({totalCount.toLocaleString()})
        </h3>
        
        <div className="flex items-center gap-2">
          <select className="px-3 py-1 border border-gray-300 rounded text-sm">
            <option value="relevance">Sort by Relevance</option>
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
          
          <Button variant="ghost" size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save Search
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((bill) => (
          <Card 
            key={bill.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onResultClick(bill)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {bill.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {bill.billNumber}
                        </Badge>
                        <Badge 
                          variant={bill.status.stage === 'Law' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {bill.status.stage}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {bill.chamber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {bill.aiSummary?.simpleSummary || bill.summary}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Sponsor: {bill.sponsor.name}</span>
                    <span>Introduced: {new Date(bill.introducedDate).toLocaleDateString()}</span>
                    <span>Last Action: {new Date(bill.lastActionDate).toLocaleDateString()}</span>
                  </div>
                  
                  {bill.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {bill.subjects.slice(0, 4).map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {bill.subjects.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bill.subjects.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-gray-600">
          Showing {results.length} of {totalCount.toLocaleString()} results
        </span>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========================================================================================
// MAIN ADVANCED SEARCH COMPONENT
// ========================================================================================

export default function AdvancedLegislativeSearch({ 
  onSearch, 
  savedSearches = [],
  searchHistory = [],
  className 
}: AdvancedLegislativeSearchProps) {
  const [query, setQuery] = useState<AdvancedSearchQuery>({
    searchTerms: [],
    filters: {
      chambers: [],
      statuses: [],
      subjects: [],
      sponsors: [],
      committees: [],
      dateRange: { field: 'introduced' },
      hasVotes: false,
      hasDocuments: false,
      publicHearings: false
    },
    sorting: { field: 'relevance', order: 'desc' },
    pagination: { page: 1, size: 20 }
  });
  
  const [results, setResults] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'history'>('search');

  const handleSearch = async () => {
    if (query.searchTerms.length === 0 && 
        query.filters.chambers.length === 0 && 
        query.filters.statuses.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
      setTotalCount(searchResults.length);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (bill: Bill) => {
    console.log('View bill details:', bill.id);
  };

  const isSearchValid = useMemo(() => {
    return query.searchTerms.some(term => term.value.trim() !== '') ||
           query.filters.chambers.length > 0 ||
           query.filters.statuses.length > 0 ||
           query.filters.subjects.length > 0;
  }, [query]);

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Search Builder Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex border-b">
              {[
                { id: 'search', label: 'Search Builder', icon: <Search className="h-4 w-4" /> },
                { id: 'saved', label: 'Saved', icon: <Bookmark className="h-4 w-4" /> },
                { id: 'history', label: 'History', icon: <History className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Search Builder */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <SearchTermBuilder 
                  terms={query.searchTerms}
                  onTermsChange={(terms) => setQuery({ ...query, searchTerms: terms })}
                />
              </CardContent>
            </Card>

            <AdvancedFilters 
              filters={query.filters}
              onFiltersChange={(filters) => setQuery({ ...query, filters })}
            />

            <Button 
              onClick={handleSearch}
              disabled={!isSearchValid || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Legislation
                </>
              )}
            </Button>
          </div>
        )}

        {/* Saved Searches */}
        {activeTab === 'saved' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Searches</h3>
                <p className="text-gray-600">Save your complex searches to reuse them later.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search History */}
        {activeTab === 'history' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Search History</h3>
                <p className="text-gray-600">Your recent searches will appear here.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Results */}
      <div className="lg:col-span-2">
        <SearchResults 
          results={results}
          query={query}
          loading={loading}
          totalCount={totalCount}
          onResultClick={handleResultClick}
        />
      </div>
    </div>
  );
}