import { useState, useEffect } from 'react'
import { Article, PaginatedResponse } from '@/types'

interface UseArticlesOptions {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
  authorId?: string
  tagId?: string
  filterId?: string
  autoFetch?: boolean
}

interface UseArticlesReturn {
  articles: Article[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    totalPages: number
    count: number
  }
  refetch: () => Promise<void>
  fetchMore: () => Promise<void>
  hasMore: boolean
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const {
    page = 1,
    limit = 10,
    status = 'published',
    categoryId,
    authorId,
    tagId,
    filterId,
    autoFetch = true
  } = options

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page,
    limit,
    totalPages: 0,
    count: 0
  })

  const fetchArticles = async (pageNum = page, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        status
      })

      if (categoryId) params.append('category_id', categoryId)
      if (authorId) params.append('author_id', authorId)
      if (tagId) params.append('tag_id', tagId)
      if (filterId) params.append('filter_id', filterId)

      const response = await fetch(`/api/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }

      const result: PaginatedResponse<Article> = await response.json()

      if (append) {
        setArticles(prev => [...prev, ...result.data])
      } else {
        setArticles(result.data)
      }

      setPagination({
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        count: result.count
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchArticles(1, false)
  }

  const fetchMore = async () => {
    if (pagination.page < pagination.totalPages) {
      await fetchArticles(pagination.page + 1, true)
    }
  }

  const hasMore = pagination.page < pagination.totalPages

  useEffect(() => {
    if (autoFetch) {
      fetchArticles()
    }
  }, [page, limit, status, categoryId, authorId, tagId, filterId, autoFetch])

  return {
    articles,
    loading,
    error,
    pagination,
    refetch,
    fetchMore,
    hasMore
  }
}