import { useState, useEffect } from 'react'
import { Article, Category } from '@/types'
import {
  mockAllArticles,
  getMockLatestArticles,
  getMockTrendingArticles,
  getMockPopularCategories,
} from '@/lib/mock-content'

interface CategoryWithCount extends Category {
  article_count: number
}

interface UseHomepageDataReturn {
  featuredArticle: Article | null
  latestArticles: Article[]
  trendingArticles: Article[]
  popularCategories: CategoryWithCount[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Featured article = most recent by published_at
const mockFeaturedArticle: Article | null =
  mockAllArticles.length
    ? [...mockAllArticles].sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''))[0]
    : null

export function useHomepageData(): UseHomepageDataReturn {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([])
  const [popularCategories, setPopularCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMockData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Set mock data
      setFeaturedArticle(mockFeaturedArticle)
      setLatestArticles(getMockLatestArticles(9))
      setTrendingArticles(getMockTrendingArticles(6))
      setPopularCategories(getMockPopularCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error loading mock data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await loadMockData()
  }

  useEffect(() => {
    loadMockData()
  }, [])

  return {
    featuredArticle,
    latestArticles,
    trendingArticles,
    popularCategories,
    loading,
    error,
    refetch
  }
}