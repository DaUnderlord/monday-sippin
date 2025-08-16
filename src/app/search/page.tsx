'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { SearchFilters as SearchFiltersType } from '@/lib/algolia';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchFallback } from '@/components/search/SearchFallback';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'reading_time_asc', label: 'Quick Reads First' },
  { value: 'reading_time_desc', label: 'Long Reads First' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(0);

  const searchHook = useSearch();
  
  // Check if search is available
  if (!searchHook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Search className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Search Articles</h1>
            </div>
          </div>
          <SearchFallback 
            message="Search functionality requires Algolia configuration"
            showSetupInstructions={true}
          />
        </div>
      </div>
    );
  }

  const { results, loading, error, search } = searchHook;

  // Perform search when parameters change
  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      search({
        query,
        filters,
        sortBy: sortBy === 'relevance' ? undefined : sortBy,
        page: currentPage,
        hitsPerPage: 10,
      });
    }
  }, [query, filters, sortBy, currentPage, search]);

  // Update URL when search parameters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 0) params.set('page', currentPage.toString());
    
    // Add filter parameters
    if (filters.categories?.length) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.tags?.length) {
      params.set('tags', filters.tags.join(','));
    }
    if (filters.filters?.length) {
      params.set('filters', filters.filters.join(','));
    }

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [query, filters, sortBy, currentPage, router]);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: SearchFiltersType = {};
    
    const categories = searchParams.get('categories');
    if (categories) urlFilters.categories = categories.split(',');
    
    const tags = searchParams.get('tags');
    if (tags) urlFilters.tags = tags.split(',');
    
    const filtersParam = searchParams.get('filters');
    if (filtersParam) urlFilters.filters = filtersParam.split(',');
    
    const sort = searchParams.get('sort');
    if (sort) setSortBy(sort);
    
    const page = searchParams.get('page');
    if (page) setCurrentPage(parseInt(page, 10));
    
    setFilters(urlFilters);
  }, [searchParams]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(0);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasResults = results && results.hits.length > 0;
  const showLoadMore = hasResults && results.page < results.nbPages - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Search className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Search Articles</h1>
          </div>
          
          {/* Search bar */}
          <div className="max-w-2xl">
            <SearchBar
              placeholder="Search articles, categories, tags..."
              onSearch={handleSearch}
              autoFocus={!query}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              {/* Mobile filter toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-center"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>

              {/* Filters */}
              <div className={cn(
                'lg:block',
                showFilters ? 'block' : 'hidden'
              )}>
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Controls */}
            {(hasResults || loading) && (
              <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && !results && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Search results */}
            {results && (
              <SearchResults
                results={results}
                loading={loading}
                onLoadMore={showLoadMore ? handleLoadMore : undefined}
                showLoadMore={showLoadMore}
              />
            )}

            {/* No query state */}
            {!query && !hasResults && !loading && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start your search
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter keywords to find articles, or use the filters to browse by category.
                </p>
                <div className="max-w-md mx-auto">
                  <SearchBar
                    placeholder="What are you looking for?"
                    onSearch={handleSearch}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}