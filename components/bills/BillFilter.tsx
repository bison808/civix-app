'use client';

import { X } from 'lucide-react';
import Button from '@/components/core/Button';
import { FilterOptions } from '@/types';
import { cn } from '@/lib/utils';

interface BillFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

const topics = [
  'healthcare',
  'education',
  'environment',
  'economy',
  'taxes',
  'housing',
  'transportation',
  'justice',
  'immigration',
  'technology',
];

const statuses = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'committee', label: 'In Committee' },
  { value: 'floor', label: 'Floor Vote' },
  { value: 'passed', label: 'Passed' },
  { value: 'enacted', label: 'Enacted' },
];

export default function BillFilter({ filters, onFiltersChange, onClose }: BillFilterProps) {
  const handleTopicToggle = (topic: string) => {
    const newTopics = filters.topics.includes(topic)
      ? filters.topics.filter((t) => t !== topic)
      : [...filters.topics, topic];
    onFiltersChange({ ...filters, topics: newTopics });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleClearAll = () => {
    onFiltersChange({
      location: 'all',
      topics: [],
      impact: 'all',
      status: [],
      sortBy: 'relevance',
    });
  };

  return (
    <div className="absolute top-full left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-lg animate-slide-up">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Topics */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicToggle(topic)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm capitalize transition-colors',
                  filters.topics.includes(topic)
                    ? 'bg-delta text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusToggle(status.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.status.includes(status.value)
                    ? 'bg-delta text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Level */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Impact Level</h4>
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onFiltersChange({ ...filters, impact: level })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm capitalize transition-colors',
                  filters.impact === level
                    ? 'bg-delta text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
          <div className="flex gap-2">
            {(['relevance', 'date', 'popularity'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => onFiltersChange({ ...filters, sortBy: sort })}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm capitalize transition-colors',
                  filters.sortBy === sort
                    ? 'bg-delta text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={handleClearAll} className="flex-1">
            Clear All
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}