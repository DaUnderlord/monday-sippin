'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/lib/algolia';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { useFilters } from '@/hooks/useFilters';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
  showTitle?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
  showTitle = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    tags: false,
    filters: false,
    date: false,
    readingTime: false,
  });

  const { categories } = useCategories();
  const { tags } = useTags();
  const { filters: availableFilters } = useFilters();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilters = (updates: Partial<SearchFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined && v !== null);
    }
    return false;
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.filters?.length) count += filters.filters.length;
    if (filters.dateRange?.start || filters.dateRange?.end) count += 1;
    if (filters.readingTime?.min || filters.readingTime?.max) count += 1;
    return count;
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {showTitle && (
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter content */}
      <div className={cn(
        'space-y-4 p-4',
        !isExpanded && 'hidden lg:block'
      )}>
        {/* Categories */}
        <FilterSection
          title="Categories"
          isExpanded={expandedSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-2">
            {categories?.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={filters.categories?.includes(category.slug) || false}
                  onCheckedChange={(checked) => {
                    const currentCategories = filters.categories || [];
                    if (checked) {
                      updateFilters({
                        categories: [...currentCategories, category.slug],
                      });
                    } else {
                      updateFilters({
                        categories: currentCategories.filter(c => c !== category.slug),
                      });
                    }
                  }}
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Tags */}
        <FilterSection
          title="Tags"
          isExpanded={expandedSections.tags}
          onToggle={() => toggleSection('tags')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tags?.slice(0, 20).map((tag) => (
              <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={filters.tags?.includes(tag.slug) || false}
                  onCheckedChange={(checked) => {
                    const currentTags = filters.tags || [];
                    if (checked) {
                      updateFilters({
                        tags: [...currentTags, tag.slug],
                      });
                    } else {
                      updateFilters({
                        tags: currentTags.filter(t => t !== tag.slug),
                      });
                    }
                  }}
                />
                <span className="text-sm text-gray-700">{tag.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Content Filters */}
        <FilterSection
          title="Content Types"
          isExpanded={expandedSections.filters}
          onToggle={() => toggleSection('filters')}
        >
          <div className="space-y-2">
            {availableFilters?.slice(0, 10).map((filter) => (
              <label key={filter.id} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={filters.filters?.includes(filter.slug) || false}
                  onCheckedChange={(checked) => {
                    const currentFilters = filters.filters || [];
                    if (checked) {
                      updateFilters({
                        filters: [...currentFilters, filter.slug],
                      });
                    } else {
                      updateFilters({
                        filters: currentFilters.filter(f => f !== filter.slug),
                      });
                    }
                  }}
                />
                <span className="text-sm text-gray-700">{filter.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Date Range */}
        <FilterSection
          title="Date Range"
          isExpanded={expandedSections.date}
          onToggle={() => toggleSection('date')}
        >
          <div className="space-y-3">
            <Select
              value={getDateRangeValue(filters.dateRange)}
              onValueChange={(value) => {
                const dateRange = getDateRangeFromValue(value);
                updateFilters({ dateRange });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterSection>

        {/* Reading Time */}
        <FilterSection
          title="Reading Time"
          isExpanded={expandedSections.readingTime}
          onToggle={() => toggleSection('readingTime')}
        >
          <div className="space-y-3">
            <Select
              value={getReadingTimeValue(filters.readingTime)}
              onValueChange={(value) => {
                const readingTime = getReadingTimeFromValue(value);
                updateFilters({ readingTime });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reading time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any length</SelectItem>
                <SelectItem value="quick">Quick read (1-3 min)</SelectItem>
                <SelectItem value="medium">Medium read (4-7 min)</SelectItem>
                <SelectItem value="long">Long read (8+ min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterSection>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.categories?.map((category) => (
              <ActiveFilterBadge
                key={`category-${category}`}
                label={categories?.find(c => c.slug === category)?.name || category}
                onRemove={() => {
                  updateFilters({
                    categories: filters.categories?.filter(c => c !== category),
                  });
                }}
              />
            ))}
            {filters.tags?.map((tag) => (
              <ActiveFilterBadge
                key={`tag-${tag}`}
                label={tags?.find(t => t.slug === tag)?.name || tag}
                onRemove={() => {
                  updateFilters({
                    tags: filters.tags?.filter(t => t !== tag),
                  });
                }}
              />
            ))}
            {filters.filters?.map((filter) => (
              <ActiveFilterBadge
                key={`filter-${filter}`}
                label={availableFilters?.find(f => f.slug === filter)?.name || filter}
                onRemove={() => {
                  updateFilters({
                    filters: filters.filters?.filter(f => f !== filter),
                  });
                }}
              />
            ))}
            {(filters.dateRange?.start || filters.dateRange?.end) && (
              <ActiveFilterBadge
                label="Date range"
                onRemove={() => {
                  updateFilters({ dateRange: undefined });
                }}
              />
            )}
            {(filters.readingTime?.min || filters.readingTime?.max) && (
              <ActiveFilterBadge
                label="Reading time"
                onRemove={() => {
                  updateFilters({ readingTime: undefined });
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => (
  <div className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left mb-3"
    >
      <h4 className="font-medium text-gray-900">{title}</h4>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </button>
    {isExpanded && children}
  </div>
);

interface ActiveFilterBadgeProps {
  label: string;
  onRemove: () => void;
}

const ActiveFilterBadge: React.FC<ActiveFilterBadgeProps> = ({ label, onRemove }) => (
  <Badge variant="secondary" className="flex items-center gap-1">
    <span className="text-xs">{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-gray-300 rounded-full p-0.5"
    >
      <X className="h-2 w-2" />
    </button>
  </Badge>
);

// Helper functions
const getDateRangeValue = (dateRange?: { start?: string; end?: string }): string => {
  if (!dateRange?.start && !dateRange?.end) return 'all';
  
  const now = new Date();
  const start = dateRange.start ? new Date(dateRange.start) : null;
  
  if (start) {
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'today';
    if (diffDays <= 7) return 'week';
    if (diffDays <= 30) return 'month';
    if (diffDays <= 90) return 'quarter';
    if (diffDays <= 365) return 'year';
  }
  
  return 'all';
};

const getDateRangeFromValue = (value: string) => {
  const now = new Date();
  
  switch (value) {
    case 'today':
      return { start: new Date(now.setHours(0, 0, 0, 0)).toISOString() };
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: weekAgo.toISOString() };
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: monthAgo.toISOString() };
    case 'quarter':
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { start: quarterAgo.toISOString() };
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return { start: yearAgo.toISOString() };
    default:
      return undefined;
  }
};

const getReadingTimeValue = (readingTime?: { min?: number; max?: number }): string => {
  if (!readingTime?.min && !readingTime?.max) return 'all';
  
  if (readingTime.min === 1 && readingTime.max === 3) return 'quick';
  if (readingTime.min === 4 && readingTime.max === 7) return 'medium';
  if (readingTime.min === 8) return 'long';
  
  return 'all';
};

const getReadingTimeFromValue = (value: string) => {
  switch (value) {
    case 'quick':
      return { min: 1, max: 3 };
    case 'medium':
      return { min: 4, max: 7 };
    case 'long':
      return { min: 8 };
    default:
      return undefined;
  }
};