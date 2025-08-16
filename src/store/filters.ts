import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Filter, Article, PaginatedResponse } from '@/types'

interface FilterState {
  // Filter data
  filters: Filter[]
  selectedFilters: string[]
  filteredArticles: PaginatedResponse<Article> | null
  
  // Loading states
  filtersLoading: boolean
  articlesLoading: boolean
  
  // Error states
  filtersError: string | null
  articlesError: string | null
  
  // Search state
  searchQuery: string
  
  // Actions
  setFilters: (filters: Filter[]) => void
  setSelectedFilters: (filterIds: string[]) => void
  addSelectedFilter: (filterId: string) => void
  removeSelectedFilter: (filterId: string) => void
  clearSelectedFilters: () => void
  setFilteredArticles: (articles: PaginatedResponse<Article> | null) => void
  setFiltersLoading: (loading: boolean) => void
  setArticlesLoading: (loading: boolean) => void
  setFiltersError: (error: string | null) => void
  setArticlesError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  
  // Computed getters
  getFilterById: (id: string) => Filter | null
  getFiltersByIds: (ids: string[]) => Filter[]
  getSelectedFilterNames: () => string[]
  hasSelectedFilters: () => boolean
}

// Helper function to find filter by ID in hierarchical structure
const findFilterById = (filters: Filter[], id: string): Filter | null => {
  for (const filter of filters) {
    if (filter.id === id) return filter
    if (filter.children) {
      const found = findFilterById(filter.children, id)
      if (found) return found
    }
  }
  return null
}

// Helper function to get all filters as flat array
const flattenFilters = (filters: Filter[]): Filter[] => {
  const result: Filter[] = []
  
  const flatten = (filterList: Filter[]) => {
    filterList.forEach(filter => {
      result.push(filter)
      if (filter.children && filter.children.length > 0) {
        flatten(filter.children)
      }
    })
  }
  
  flatten(filters)
  return result
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: [],
      selectedFilters: [],
      filteredArticles: null,
      filtersLoading: false,
      articlesLoading: false,
      filtersError: null,
      articlesError: null,
      searchQuery: '',

      // Actions
      setFilters: (filters) => set({ filters }),
      
      setSelectedFilters: (filterIds) => set({ selectedFilters: filterIds }),
      
      addSelectedFilter: (filterId) => set((state) => ({
        selectedFilters: state.selectedFilters.includes(filterId)
          ? state.selectedFilters
          : [...state.selectedFilters, filterId]
      })),
      
      removeSelectedFilter: (filterId) => set((state) => ({
        selectedFilters: state.selectedFilters.filter(id => id !== filterId)
      })),
      
      clearSelectedFilters: () => set({ 
        selectedFilters: [],
        filteredArticles: null 
      }),
      
      setFilteredArticles: (articles) => set({ filteredArticles: articles }),
      
      setFiltersLoading: (loading) => set({ filtersLoading: loading }),
      
      setArticlesLoading: (loading) => set({ articlesLoading: loading }),
      
      setFiltersError: (error) => set({ filtersError: error }),
      
      setArticlesError: (error) => set({ articlesError: error }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Computed getters
      getFilterById: (id) => {
        const { filters } = get()
        return findFilterById(filters, id)
      },
      
      getFiltersByIds: (ids) => {
        const { filters } = get()
        const flatFilters = flattenFilters(filters)
        return ids.map(id => flatFilters.find(f => f.id === id)).filter(Boolean) as Filter[]
      },
      
      getSelectedFilterNames: () => {
        const { filters, selectedFilters } = get()
        const flatFilters = flattenFilters(filters)
        return selectedFilters
          .map(id => flatFilters.find(f => f.id === id)?.name)
          .filter(Boolean) as string[]
      },
      
      hasSelectedFilters: () => {
        const { selectedFilters } = get()
        return selectedFilters.length > 0
      }
    }),
    {
      name: 'filter-store',
      // Only persist selected filters, not the full state
      partialize: (state) => ({ 
        selectedFilters: state.selectedFilters 
      }),
    }
  )
)

// Selector hooks for better performance
export const useFilters = () => useFilterStore((state) => state.filters)
export const useSelectedFilters = () => useFilterStore((state) => state.selectedFilters)
export const useFilteredArticles = () => useFilterStore((state) => state.filteredArticles)
export const useFiltersLoading = () => useFilterStore((state) => state.filtersLoading)
export const useArticlesLoading = () => useFilterStore((state) => state.articlesLoading)
export const useFiltersError = () => useFilterStore((state) => state.filtersError)
export const useArticlesError = () => useFilterStore((state) => state.articlesError)
export const useSearchQuery = () => useFilterStore((state) => state.searchQuery)

// Action hooks
export const useFilterActions = () => {
  const setFilters = useFilterStore(state => state.setFilters)
  const setSelectedFilters = useFilterStore(state => state.setSelectedFilters)
  const addSelectedFilter = useFilterStore(state => state.addSelectedFilter)
  const removeSelectedFilter = useFilterStore(state => state.removeSelectedFilter)
  const clearSelectedFilters = useFilterStore(state => state.clearSelectedFilters)
  const setFilteredArticles = useFilterStore(state => state.setFilteredArticles)
  const setFiltersLoading = useFilterStore(state => state.setFiltersLoading)
  const setArticlesLoading = useFilterStore(state => state.setArticlesLoading)
  const setFiltersError = useFilterStore(state => state.setFiltersError)
  const setArticlesError = useFilterStore(state => state.setArticlesError)
  const setSearchQuery = useFilterStore(state => state.setSearchQuery)

  return {
    setFilters,
    setSelectedFilters,
    addSelectedFilter,
    removeSelectedFilter,
    clearSelectedFilters,
    setFilteredArticles,
    setFiltersLoading,
    setArticlesLoading,
    setFiltersError,
    setArticlesError,
    setSearchQuery,
  }
}

// Computed hooks
export const useFilterComputed = () => {
  const getFilterById = useFilterStore(state => state.getFilterById)
  const getFiltersByIds = useFilterStore(state => state.getFiltersByIds)
  const getSelectedFilterNames = useFilterStore(state => state.getSelectedFilterNames)
  const hasSelectedFilters = useFilterStore(state => state.hasSelectedFilters)

  return { getFilterById, getFiltersByIds, getSelectedFilterNames, hasSelectedFilters }
}