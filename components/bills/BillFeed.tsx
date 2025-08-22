'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Filter, Search } from 'lucide-react';
import BillCard from './BillCard';
import EnhancedBillCard from './EnhancedBillCard';
import MobileBillCard from './MobileBillCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import BillFilter from './BillFilter';
import Button from '@/components/core/Button';
import { Bill, FilterOptions } from '@/types';
import { cn } from '@/lib/utils';

interface BillFeedProps {
  bills: Bill[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onVote?: (billId: string, vote: 'like' | 'dislike' | null) => Promise<void>;
  onBillClick?: (bill: Bill) => void;
  onRefresh?: () => void;
  useEnhancedCards?: boolean;
}

export default function BillFeed({
  bills,
  loading = false,
  onLoadMore,
  hasMore = false,
  onVote,
  onBillClick,
  onRefresh,
  useEnhancedCards = true,
}: BillFeedProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    location: 'all',
    topics: [],
    impact: 'all',
    status: [],
    sortBy: 'relevance',
  });
  const [filteredBills, setFilteredBills] = useState(bills);

  // Filter bills based on search and filters
  useEffect(() => {
    let filtered = [...bills];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.title.toLowerCase().includes(query) ||
          (bill.aiSummary?.simpleSummary || bill.summary).toLowerCase().includes(query) ||
          bill.billNumber.toLowerCase().includes(query) ||
          bill.subjects.some((subject) => subject.toLowerCase().includes(query))
      );
    }

    // Topic filter
    if (filters.topics.length > 0) {
      filtered = filtered.filter((bill) =>
        bill.subjects.some((subject) => filters.topics.includes(subject))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((bill) => filters.status.includes(bill.status.stage));
    }

    // Impact filter
    if (filters.impact !== 'all') {
      // Impact filtering disabled - no impacts data available
      // filtered = filtered.filter((bill) =>
      //   bill.impacts.some((impact) => impact.magnitude === filters.impact)
      // );
    }

    // Sort
    if (filters.sortBy === 'date') {
      filtered.sort((a, b) => {
        return new Date(a.lastActionDate).getTime() - new Date(b.lastActionDate).getTime();
      });
    } else if (filters.sortBy === 'popularity') {
      // Popularity sorting disabled - no likes/dislikes data available
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredBills(filtered);
  }, [bills, searchQuery, filters]);

  // Pull-to-refresh on mobile
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isPulling && window.scrollY === 0) {
      const touch = e.touches[0];
      const distance = Math.min(touch.clientY, 100);
      setPullDistance(distance);
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 50 && onRefresh) {
      onRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="relative">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center bg-delta/10 transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <RefreshCw
            className={cn(
              'text-delta',
              pullDistance > 50 && 'animate-spin'
            )}
            size={24}
          />
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-delta focus:border-delta',
                'text-sm'
              )}
            />
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className="px-3"
          >
            <Filter size={20} />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => setFilters({ ...filters, location: 'all' })}
            className={cn(
              'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
              filters.location === 'all'
                ? 'bg-delta text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilters({ ...filters, location: 'federal' })}
            className={cn(
              'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
              filters.location === 'federal'
                ? 'bg-delta text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Federal
          </button>
          <button
            onClick={() => setFilters({ ...filters, location: 'state' })}
            className={cn(
              'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
              filters.location === 'state'
                ? 'bg-delta text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            State
          </button>
          <button
            onClick={() => setFilters({ ...filters, location: 'local' })}
            className={cn(
              'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
              filters.location === 'local'
                ? 'bg-delta text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Local
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <BillFilter
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bills List */}
      <div className="px-4 py-4 space-y-4">
        {loading && filteredBills.length === 0 ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
            ))}
          </>
        ) : filteredBills.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <p className="text-gray-500">No bills found matching your criteria</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  location: 'all',
                  topics: [],
                  impact: 'all',
                  status: [],
                  sortBy: 'relevance',
                });
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          // Bills list
          <>
            {filteredBills.map((bill) => 
              isMobile ? (
                <MobileBillCard
                  key={bill.id}
                  bill={bill}
                  onVote={onVote}
                  onClick={onBillClick}
                />
              ) : useEnhancedCards ? (
                <EnhancedBillCard
                  key={bill.id}
                  bill={bill}
                  onVote={onVote}
                  onClick={onBillClick}
                />
              ) : (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onVote={onVote}
                  onClick={onBillClick}
                />
              )
            )}
          </>
        )}

        {/* Load more button */}
        {hasMore && !loading && (
          <div className="pt-4 pb-8">
            <Button
              variant="outline"
              fullWidth
              onClick={onLoadMore}
            >
              Load More Bills
            </Button>
          </div>
        )}

        {loading && filteredBills.length > 0 && (
          <div className="flex justify-center py-4">
            <RefreshCw className="animate-spin text-delta" size={24} />
          </div>
        )}
      </div>
    </div>
  );
}