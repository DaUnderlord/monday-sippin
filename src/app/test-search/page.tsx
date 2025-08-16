'use client';

import React, { useState, Suspense } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchFallback } from '@/components/search/SearchFallback';
import { useSearch } from '@/hooks/useSearch';
import { SearchFilters as SearchFiltersType } from '@/lib/algolia';
import { Button } from '@/components/ui/button';

function TestSearchContent() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [sortBy, setSortBy] = useState('relevance');

  const searchHook = useSearch();
  
  // Check if search is available
  if (!searchHook) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Test Page</h1>
          <SearchFallback 
            message="Search functionality requires Algolia configuration"
            showSetupInstructions={true}
          />
        </div>
      </div>
    );
  }

  const { results, loading, error, search } = searchHook;

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    search({
      query: searchQuery,
      filters,
      sortBy: sortBy === 'relevance' ? undefined : sortBy,
      page: 0,
      hitsPerPage: 10,
    });
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    if (query) {
      search({
        query,
        filters: newFilters,
        sortBy: sortBy === 'relevance' ? undefined : sortBy,
        page: 0,
        hitsPerPage: 10,
      });
    }
  };

  const testIndexing = async () => {
    try {
      const response = await fetch('/api/search/index', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reindex' }),
      });
      
      const result = await response.json();
      console.log('Indexing result:', result);
      alert(result.message || 'Indexing completed');
    } catch (error) {
      console.error('Indexing error:', error);
      alert('Indexing failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Test Page</h1>
          
          {/* Test Controls */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
            <div className="flex space-x-4">
              <Button onClick={testIndexing}>
                Reindex All Articles
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSearch('crypto')}
              >
                Test Search: "crypto"
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSearch('finance')}
              >
                Test Search: "finance"
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mb-6">
            <SearchBar
              placeholder="Test search functionality..."
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Searching...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-red-800 font-semibold">Search Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold mb-2">Search Results Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Query: "{results.query}"</p>
                    <p>Total hits: {results.nbHits}</p>
                    <p>Processing time: {results.processingTimeMS}ms</p>
                    <p>Page: {results.page + 1} of {results.nbPages}</p>
                  </div>
                </div>

                <SearchResults results={results} />
              </div>
            )}

            {!results && !loading && !error && (
              <div className="text-center py-12">
                <p className="text-gray-600">Enter a search query to test the search functionality.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <TestSearchContent />
    </Suspense>
  );
}