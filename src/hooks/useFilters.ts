import { useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  useFilterStore, 
  useFilterActions, 
  useFilters as useFiltersState,
  useSelectedFilters,
  useFilteredArticles,
  useFiltersLoading,
  useArticlesLoading,
  useFiltersError,
  useArticlesError
} from '@/store/filters'
import type { Filter, Article, PaginatedResponse } from '@/types'
import { mockAllArticles, mockCategories } from '@/lib/mock-content'

// Build mock hierarchical filters from mock articles and categories
function buildMockFiltersFromArticles(articles: Article[]): Filter[] {
  const now = new Date().toISOString()
  // Map category id -> articles
  const byCategory = new Map<string, Article[]>()
  articles.forEach(a => {
    const cid = a.category?.id || a.category_id
    if (!cid) return
    if (!byCategory.has(cid)) byCategory.set(cid, [])
    byCategory.get(cid)!.push(a)
  })

  const TOKENS = [
    'BTC','ETH','SOL','AAPL','NDX','NASDAQ','DeFi','AI','Tax','Global','SaaS','Portfolio'
  ]
  // Level-2 topics to synthesize under each level-1 token, if present in titles
  const TOPICS = [
    'Outlook','Risk','Strategy','Regulation','Earnings','M&A','On-chain','Layer 2','NFTs','Yield','Macro','Flows'
  ]

  const mkSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const filters: Filter[] = []
  let parentOrder = 1

  mockCategories.forEach(cat => {
    const list = byCategory.get(cat.id) || []
    // Derive children tokens present in titles for this category
    const present = new Set<string>()
    list.forEach(a => {
      const title = a.title || ''
      TOKENS.forEach(t => {
        const re = new RegExp(`\\b${t}\\b`, 'i')
        if (re.test(title)) present.add(t)
      })
    })

    const children: Filter[] = Array.from(present).sort().map((token, idx) => {
      const tokenRegex = new RegExp(`\\b${token}\\b`, 'i')
      const tokenArticles = list.filter(a => tokenRegex.test(a.title || ''))
      const tokenCount = tokenArticles.length

      // Build level-2 topics under this token based on presence in titles
      const topicsPresent = new Set<string>()
      tokenArticles.forEach(a => {
        const title = a.title || ''
        TOPICS.forEach(t => {
          const re = new RegExp(`\\b${t}\\b`, 'i')
          if (re.test(title)) topicsPresent.add(t)
        })
      })

      const grandChildren: Filter[] = Array.from(topicsPresent).sort().map((topic, j) => {
        const topicCount = tokenArticles.filter(a => new RegExp(`\\b${topic}\\b`, 'i').test(a.title || '')).length
        return {
          id: `${cat.slug}-${mkSlug(token)}-${mkSlug(topic)}`,
          name: topic,
          slug: mkSlug(`${cat.slug}-${token}-${topic}`),
          parent_id: `${cat.slug}-${mkSlug(token)}`,
          level: 2,
          order_index: j + 1,
          description: undefined,
          created_at: now,
          children: [],
          articleCount: topicCount,
        }
      })

      return {
        id: `${cat.slug}-${mkSlug(token)}`,
        name: token,
        slug: mkSlug(`${cat.slug}-${token}`),
        parent_id: cat.id,
        level: 1,
        order_index: idx + 1,
        description: undefined,
        created_at: now,
        children: grandChildren,
        articleCount: tokenCount,
      }
    })

    const parent: Filter = {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: undefined,
      level: 0,
      order_index: parentOrder++,
      description: cat.description,
      created_at: now,
      children: children,
      articleCount: list.length,
    }

    // Only include categories that have at least one mock article
    if (list.length > 0) filters.push(parent)
  })

  return filters
}

interface UseFiltersReturn {
  filters: Filter[]
  selectedFilters: string[]
  filteredArticles: PaginatedResponse<Article> | null
  loading: boolean
  error: string | null
  // granular loading flags
  filtersLoading: boolean
  articlesLoading: boolean
  // granular error messages
  filtersError: string | null
  articlesError: string | null
  selectFilter: (filterId: string) => void
  deselectFilter: (filterId: string) => void
  clearFilters: () => void
  loadFilteredArticles: (page?: number) => Promise<void>
  loadFilters: () => Promise<void>
  refreshFilters: () => void
}

export function useFilters(): UseFiltersReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Store state
  const filters = useFiltersState()
  const selectedFilters = useSelectedFilters()
  const filteredArticles = useFilteredArticles()
  const filtersLoading = useFiltersLoading()
  const articlesLoading = useArticlesLoading()
  const filtersError = useFiltersError()
  const articlesError = useArticlesError()
  
  // Store actions
  const {
    setFilters,
    setSelectedFilters,
    addSelectedFilter,
    removeSelectedFilter,
    clearSelectedFilters,
    setFilteredArticles,
    setFiltersLoading,
    setArticlesLoading,
    setFiltersError,
    setArticlesError
  } = useFilterActions()

  // Load filters on mount
  useEffect(() => {
    if (filters.length === 0) {
      loadFilters()
    }
  }, [])

  // Sync selected filters with URL params
  useEffect(() => {
    const filterParams = searchParams.getAll('filters')
    if (JSON.stringify(filterParams.sort()) !== JSON.stringify(selectedFilters.sort())) {
      setSelectedFilters(filterParams)
    }
  }, [searchParams, selectedFilters, setSelectedFilters])

  // Load filtered articles when selected filters change
  useEffect(() => {
    if (selectedFilters.length > 0) {
      loadFilteredArticles()
    } else {
      setFilteredArticles(null)
    }
  }, [selectedFilters])

  // Helpers to resolve levels and flatten current filters
  const flattenFilters = useCallback((roots: Filter[]): Filter[] => {
    const out: Filter[] = []
    const walk = (list?: Filter[]) => {
      if (!list) return
      list.forEach(f => {
        out.push(f)
        if (f.children && f.children.length) walk(f.children)
      })
    }
    walk(roots)
    return out
  }, [])

  const getFilterById = useCallback((id: string): Filter | undefined => {
    const all = flattenFilters(filters)
    return all.find(f => f.id === id)
  }, [filters, flattenFilters])

  const getIdsAtLevel = useCallback((level: number): Set<string> => {
    const all = flattenFilters(filters)
    return new Set(all.filter(f => f.level === level).map(f => f.id))
  }, [filters, flattenFilters])

  const loadFilters = useCallback(async (retryCount = 0) => {
    try {
      setFiltersLoading(true)
      setFiltersError(null)
      
      const response = await fetch('/api/filters?includeCounts=true')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load filters')
      }
      
      const fetched: Filter[] = result.data || []
      if (fetched.length === 0) {
        // Fallback to mock-derived filters when API returns empty
        const mockFilters = buildMockFiltersFromArticles(mockAllArticles)
        setFilters(mockFilters)
      } else {
        setFilters(fetched)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load filters'
      
      // Retry once on failure
      if (retryCount < 1) {
        console.warn('Retrying filter load after error:', errorMessage)
        setTimeout(() => loadFilters(retryCount + 1), 1000)
        return
      }
      
      // After retry fails, populate mock-derived filters so UI is testable
      const mockFilters = buildMockFiltersFromArticles(mockAllArticles)
      if (mockFilters.length > 0) {
        setFilters(mockFilters)
      } else {
        setFiltersError(errorMessage)
      }
      console.error('Failed to load filters after retry:', err)
    } finally {
      setFiltersLoading(false)
    }
  }, [setFilters, setFiltersLoading, setFiltersError])

  const loadFilteredArticles = useCallback(async (page = 1) => {
    if (selectedFilters.length === 0) {
      setFilteredArticles(null)
      return
    }

    try {
      setArticlesLoading(true)
      setArticlesError(null)
      
      // Use the first filter as the main endpoint and pass others as query params
      const [mainFilter, ...additionalFilters] = selectedFilters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      additionalFilters.forEach(filterId => {
        params.append('filters', filterId)
      })
      
      const response = await fetch(`/api/filters/${mainFilter}/articles?${params}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load filtered articles')
      }
      
      setFilteredArticles(result.data)
    } catch (err) {
      setArticlesError(err instanceof Error ? err.message : 'Failed to load filtered articles')
    } finally {
      setArticlesLoading(false)
    }
  }, [selectedFilters, setFilteredArticles, setArticlesLoading, setArticlesError])

  const selectFilter = useCallback((filterId: string) => {
    if (selectedFilters.includes(filterId)) return

    const meta = getFilterById(filterId)
    if (!meta) {
      // If we can't resolve, default to appending
      updateUrlParams([...selectedFilters, filterId])
      return
    }

    // Remove any selection at the same level
    const sameLevelIds = getIdsAtLevel(meta.level)
    let next = selectedFilters.filter(id => !sameLevelIds.has(id))

    // If selecting a parent level, clear deeper levels to maintain a single path
    if (meta.level === 0) {
      const level1 = getIdsAtLevel(1)
      const level2 = getIdsAtLevel(2)
      next = next.filter(id => !level1.has(id) && !level2.has(id))
    } else if (meta.level === 1) {
      const level2 = getIdsAtLevel(2)
      next = next.filter(id => !level2.has(id))
    }

    updateUrlParams([...next, filterId])
  }, [selectedFilters, getFilterById, getIdsAtLevel])

  const deselectFilter = useCallback((filterId: string) => {
    const meta = getFilterById(filterId)
    let next = selectedFilters.filter(id => id !== filterId)

    if (meta) {
      if (meta.level === 0) {
        // Removing a primary filter should also clear deeper levels
        const level1 = getIdsAtLevel(1)
        const level2 = getIdsAtLevel(2)
        next = next.filter(id => !level1.has(id) && !level2.has(id))
      } else if (meta.level === 1) {
        // Removing a secondary filter should clear tertiary selections
        const level2 = getIdsAtLevel(2)
        next = next.filter(id => !level2.has(id))
      }
    }

    updateUrlParams(next)
  }, [selectedFilters, getFilterById, getIdsAtLevel])

  const clearFilters = useCallback(() => {
    updateUrlParams([])
  }, [])

  const updateUrlParams = useCallback((filterIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove existing filter params
    params.delete('filters')
    
    // Add new filter params
    filterIds.forEach(filterId => {
      params.append('filters', filterId)
    })
    
    // Update URL
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(newUrl, { scroll: false })
  }, [router, searchParams])

  const refreshFilters = useCallback(() => {
    loadFilters()
  }, [loadFilters])

  return {
    filters,
    selectedFilters,
    filteredArticles,
    loading: filtersLoading || articlesLoading,
    filtersLoading,
    articlesLoading,
    error: filtersError || articlesError,
    filtersError,
    articlesError,
    selectFilter,
    deselectFilter,
    clearFilters,
    loadFilteredArticles,
    loadFilters,
    refreshFilters
  }
}