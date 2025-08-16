import { useState, useEffect } from 'react'
import { Article } from '@/types'
import { mockAllArticles } from '@/lib/mock-content'

interface UseRelatedArticlesOptions {
  currentArticleId: string
  categoryId?: string
  tags?: string[]
  filters?: string[]
  limit?: number
}

interface UseRelatedArticlesReturn {
  relatedArticles: Article[]
  loading: boolean
  error: string | null
}

export function useRelatedArticles({
  currentArticleId,
  categoryId,
  tags = [],
  filters = [],
  limit = 4
}: UseRelatedArticlesOptions): UseRelatedArticlesReturn {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Stabilize array dependencies to avoid refetch loops from new array refs
  const tagsKey = (tags || []).slice().sort().join(',')
  const filtersKey = (filters || []).slice().sort().join(',')

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        // Only show skeletons on first load; keep previous data during refetch to avoid flicker
        if (relatedArticles.length === 0) setLoading(true)
        setError(null)

        // Build query parameters for related articles
        const params = new URLSearchParams({
          limit: limit.toString(),
          status: 'published',
          exclude: currentArticleId
        })

        // Add category filter if available
        if (categoryId) {
          params.append('category_id', categoryId)
        }

        // Add tag filters if available
        if (tags.length > 0) {
          tags.forEach(tagId => params.append('tag_id', tagId))
        }

        // Add filter filters if available
        if (filters.length > 0) {
          filters.forEach(filterId => params.append('filter_id', filterId))
        }

        const response = await fetch(`/api/articles/related?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch related articles')
        }

        const result = await response.json()
        const apiData: Article[] = result.data || []

        if (apiData.length > 0) {
          setRelatedArticles(apiData)
        } else {
          // Mock fallback: simple relevance by category, then tag overlap, then recents
          const currentId = currentArticleId
          const tagSet = new Set(tags)
          const filterSet = new Set(filters)

          // Helper: overlap count
          const overlap = (arr: any[], set: Set<string>) =>
            arr.reduce((acc, x: any) => acc + (set.has(x?.tag?.id ?? x?.id) ? 1 : 0), 0)

          let pool = mockAllArticles.filter(a => a.id !== currentId)

          // Score by category match + tag/filter overlaps + recency
          const scored = pool.map(a => {
            const aTagIds = (a as any).tags || []
            const aFilterIds = (a as any).filters || []
            const catMatch = categoryId && ((a as any).category_id === categoryId || (a as any).category?.id === categoryId) ? 2 : 0
            const tagScore = tagSet.size > 0 ? overlap(aTagIds, tagSet) : 0
            const filterScore = filterSet.size > 0 ? overlap(aFilterIds, filterSet) : 0
            const ts = new Date(a.published_at || a.created_at).getTime()
            const recency = ts ? ts / 1e13 : 0 // tiny tie-breaker
            return { a, score: catMatch * 3 + tagScore * 2 + filterScore + recency }
          })

          const picked = scored
            .sort((x, y) => y.score - x.score)
            .slice(0, limit)
            .map(s => s.a)

          setRelatedArticles(picked)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        // Mock fallback on error
        try {
          const pool = mockAllArticles.filter(a => a.id !== currentArticleId)
          const picked = pool.slice(0, limit)
          setRelatedArticles(picked)
        } catch {
          setRelatedArticles([])
        }
      } finally {
        setLoading(false)
      }
    }

    if (currentArticleId) {
      fetchRelatedArticles()
    }
  }, [currentArticleId, categoryId, tagsKey, filtersKey, limit])

  return {
    relatedArticles,
    loading,
    error
  }
}