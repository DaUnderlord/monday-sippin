import { useEffect } from 'react'
import { useArticleStore, useArticleSelectors } from '@/store/articles'
import { categoryService, tagService, filterService } from '@/lib/database'

/**
 * Comprehensive hook for article data management
 * Combines store state with data fetching and provides a unified API
 */
export function useArticleData() {
  const store = useArticleStore()
  const selectors = useArticleSelectors()

  // Load initial metadata (categories, tags, filters)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        store.setLoading(true)
        
        const [categories, tags, filters] = await Promise.all([
          categoryService.getAllCategories(),
          tagService.getAllTags(),
          filterService.getHierarchicalFilters()
        ])

        store.setCategories(categories)
        store.setTags(tags)
        store.setFilters(filters)
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Failed to load metadata')
      } finally {
        store.setLoading(false)
      }
    }

    // Only load if we don't have the data yet
    if (store.categories.length === 0 && store.tags.length === 0 && store.filters.length === 0) {
      loadMetadata()
    }
  }, [])

  // Fetch articles with current filters
  const fetchArticles = async (page = 1, append = false) => {
    try {
      store.setLoading(true)
      store.setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: 'published'
      })

      if (store.selectedCategory) {
        params.append('category_id', store.selectedCategory)
      }

      if (store.selectedTags.length > 0) {
        store.selectedTags.forEach(tagId => {
          params.append('tag_id', tagId)
        })
      }

      if (store.selectedFilters.length > 0) {
        store.selectedFilters.forEach(filterId => {
          params.append('filter_id', filterId)
        })
      }

      const response = await fetch(`/api/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }

      const result = await response.json()

      if (append) {
        store.addArticles(result.data)
      } else {
        store.setArticles(result.data)
      }

      store.setPagination(result.page, result.totalPages, result.count)
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch articles')
    } finally {
      store.setLoading(false)
    }
  }

  // Load more articles (pagination)
  const loadMore = async () => {
    if (store.currentPage < store.totalPages && !store.loading) {
      await fetchArticles(store.currentPage + 1, true)
    }
  }

  // Refresh articles
  const refresh = async () => {
    await fetchArticles(1, false)
  }

  // Search articles
  const search = async (query: string) => {
    store.setSearchQuery(query)
    await fetchArticles(1, false)
  }

  // Apply filters and fetch
  const applyFilters = async (filters: {
    categoryId?: string | null
    tagIds?: string[]
    filterIds?: string[]
  }) => {
    if (filters.categoryId !== undefined) {
      store.setSelectedCategory(filters.categoryId)
    }
    if (filters.tagIds) {
      store.setSelectedTags(filters.tagIds)
    }
    if (filters.filterIds) {
      store.setSelectedFilters(filters.filterIds)
    }
    
    await fetchArticles(1, false)
  }

  // Clear all filters
  const clearAllFilters = async () => {
    store.clearFilters()
    await fetchArticles(1, false)
  }

  return {
    // State
    articles: store.articles,
    currentArticle: store.currentArticle,
    featuredArticles: store.featuredArticles,
    categories: store.categories,
    tags: store.tags,
    filters: store.filters,
    loading: store.loading,
    error: store.error,
    
    // Pagination
    currentPage: store.currentPage,
    totalPages: store.totalPages,
    totalCount: store.totalCount,
    hasMore: store.currentPage < store.totalPages,
    
    // Filters
    selectedCategory: store.selectedCategory,
    selectedTags: store.selectedTags,
    selectedFilters: store.selectedFilters,
    searchQuery: store.searchQuery,
    hasActiveFilters: selectors.hasActiveFilters(),
    
    // Computed data
    filteredArticles: selectors.getFilteredArticles(),
    
    // Actions
    fetchArticles,
    loadMore,
    refresh,
    search,
    applyFilters,
    clearAllFilters,
    
    // Store actions
    setCurrentArticle: store.setCurrentArticle,
    setFeaturedArticles: store.setFeaturedArticles,
    
    // Selectors
    getArticlesByCategory: selectors.getArticlesByCategory,
    getArticlesByAuthor: selectors.getArticlesByAuthor,
    getRelatedArticles: selectors.getRelatedArticles,
    
    // Utilities
    reset: store.reset,
    clearError: () => store.setError(null)
  }
}