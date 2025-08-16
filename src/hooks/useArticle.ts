import { useState, useEffect } from 'react'
import { Article } from '@/types'

interface UseArticleReturn {
  article: Article | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useArticle(slug: string): UseArticleReturn {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticle = async () => {
    if (!slug) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/articles/slug/${encodeURIComponent(slug)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found')
        }
        throw new Error('Failed to fetch article')
      }

      const result = await response.json()
      setArticle(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setArticle(null)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchArticle()
  }

  useEffect(() => {
    fetchArticle()
  }, [slug])

  return {
    article,
    loading,
    error,
    refetch
  }
}