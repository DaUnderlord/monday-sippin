import { useState, useEffect, useCallback } from 'react';
import { searchArticles, getSearchSuggestions, SearchFilters, SearchResult, SearchArticle } from '@/lib/database-search';

// SearchResult is now imported from database-search

export interface UseSearchOptions {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  hitsPerPage?: number;
  sortBy?: string;
}

export interface UseSearchReturn {
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  search: (options: UseSearchOptions) => Promise<void>;
  clearSearch: () => void;
  suggestions: string[];
  loadingSuggestions: boolean;
}

export const useSearch = (initialOptions?: UseSearchOptions): UseSearchReturn => {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const search = useCallback(async (options: UseSearchOptions) => {
    const {
      query = '',
      filters = {},
      page = 0,
      hitsPerPage = 10,
      sortBy = 'relevance',
    } = options;

    setLoading(true);
    setError(null);

    try {
      const searchResult = await searchArticles(query, filters, {
        page,
        hitsPerPage,
        sortBy
      });
      
      setResults(searchResult);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);

    try {
      const suggestions = await getSearchSuggestions(query, 8);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Suggestions error:', err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults(null);
    setError(null);
    setSuggestions([]);
  }, []);

  // Perform initial search if options provided
  useEffect(() => {
    if (initialOptions) {
      search(initialOptions);
    }
  }, [search, initialOptions]);

  return {
    results,
    loading,
    error,
    search,
    clearSearch,
    suggestions,
    loadingSuggestions,
    getSuggestions,
  } as UseSearchReturn & { getSuggestions: (query: string) => Promise<void> };
};

// Hook for search autocomplete
export const useSearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const suggestions = await getSearchSuggestions(searchQuery, 8);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedGetSuggestions = useCallback(
    debounce(getSuggestions, 300),
    [getSuggestions]
  );

  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  return {
    query,
    setQuery,
    suggestions,
    loading,
    getSuggestions: debouncedGetSuggestions,
  };
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}