import { useState, useCallback } from 'react'
import { Article } from '@/types'

interface UseArticleSearchReturn {
  results: Article[]
  loading: boolean
  error: string | null
  search: (query: string, limit?: number) => Promise<void>
  clear: () => void
  query: string
}

export function useArticleSearch(): UseArticleSearchReturn {
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const search = useCallback(async (searchQuery: string, limit = 10) => {
    if (!searchQuery.trim()) {
      setResults([])
      setQuery('')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setQuery(searchQuery)

      const params = new URLSearchParams({
        q: searchQuery.trim(),
        limit: limit.toString()
      })

      const response = await fetch(`/api/articles/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const result = await response.json()
      setResults(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setQuery('')
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clear,
    query
  }
}