'use client'

import { useState, useEffect, Suspense } from 'react'
import { ArticleCard } from '@/components/articles'
import { Typography } from '@/components/ui/typography'
import { HorizontalFilterBar } from '@/components/filters/HorizontalFilterBar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Article, PaginatedResponse } from '@/types'
import { getMockLatestArticles } from '@/lib/mock-content'
import { FilteredArticlesList } from '@/components/filters'
import { useFilters } from '@/hooks/useFilters'
import Image from 'next/image'
import articlesBg from '../../../assets/images/pexels-davidmcbee-730564.jpg'

function ArticlesPageContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 0,
    count: 0
  })


  // Filters store/state for hierarchical filtering
  const {
    filters,
    selectedFilters,
    filteredArticles,
    loading: filtersLoading,
    error: filtersError,
    selectFilter,
    deselectFilter,
    clearFilters,
    loadFilteredArticles
  } = useFilters()

  const fetchArticles = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/articles?page=${page}&limit=${pagination.limit}&status=published`)
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const result: PaginatedResponse<Article> = await response.json()
      const data = result.data || []
      if (data.length === 0) {
        // Fallback to mocks when API returns empty
        const mocks = getMockLatestArticles(pagination.limit)
        setArticles(mocks)
        setPagination(prev => ({ ...prev, totalPages: 1, count: mocks.length, page: 1 }))
      } else {
        setArticles(data)
        setPagination({
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          count: result.count
        })
      }
    } catch (err) {
      // Use mock fallback on error
      const mocks = getMockLatestArticles(pagination.limit)
      setArticles(mocks)
      setPagination(prev => ({ ...prev, totalPages: 1, count: mocks.length, page: 1 }))
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[ArticlesPage] Falling back to mock articles due to error:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    // Clamp page and avoid redundant fetches
    const total = pagination.totalPages || 1
    const target = Math.max(1, Math.min(newPage, total))
    if (loading || target === pagination.page) return
    setPagination(prev => ({ ...prev, page: target }))
    fetchArticles(target)
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  // When filters are active, ensure filtered articles for current page are loaded
  useEffect(() => {
    if (selectedFilters.length > 0) {
      loadFilteredArticles(1)
    }
  }, [selectedFilters, loadFilteredArticles])

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          {/* Featured Article Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-64 w-full rounded-lg mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Article Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Typography variant="h1" className="mb-4">Error Loading Articles</Typography>
          <Typography variant="body" className="text-red-600 mb-4">{error}</Typography>
          <Button onClick={() => fetchArticles(pagination.page)}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const featuredArticle = articles[0]
  const gridArticles = articles.slice(1)

  return (
    <div className="min-h-screen bg-white py-0">
      {/* Header with background image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={articlesBg}
            alt="Financial charts background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 text-center">
          <Typography variant="h1" className="mb-2 sm:mb-4 text-white">
            Latest Articles
          </Typography>
          <Typography variant="lead" className="text-white/90 max-w-2xl mx-auto">
            Discover insights, analysis, and knowledge in short power-packed bits perfect for your Monday morning coffee.
          </Typography>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Horizontal Filter Bar */}
        <HorizontalFilterBar
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterSelect={selectFilter}
          onFilterDeselect={deselectFilter}
          onClearFilters={clearFilters}
          loading={filtersLoading}
          className="mb-8"
        />

        {/* When filters are active, show filtered list instead of featured/grid */}
        {selectedFilters.length > 0 ? (
          <div className="mb-12">
            <FilteredArticlesList
              articles={filteredArticles}
              loading={filtersLoading}
              onPageChange={(p) => loadFilteredArticles(p)}
            />
          </div>
        ) : (
        <>
          {/* Featured Article */}
          {featuredArticle && (
          <div className="mb-12">
            <Typography variant="h2" className="mb-6">Featured</Typography>
            <ArticleCard 
              article={featuredArticle} 
              variant="featured"
              showAuthor={true}
              showCategory={true}
              showTags={true}
              showStats={true}
            />
          </div>
          )}

          {/* Articles Grid */}
          {gridArticles.length > 0 && (
          <div className="mb-12">
            <Typography variant="h2" className="mb-6">Recent Articles</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {gridArticles.map((article) => (
                <ArticleCard 
                  key={article.id}
                  article={article} 
                  variant="default"
                  showAuthor={true}
                  showCategory={true}
                  showTags={true}
                  showStats={true}
                />
              ))}
            </div>
          </div>
          )}
        </>
        )}

        {/* Pagination (only when not filtering) */}
        {selectedFilters.length === 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1
                const isActive = pageNum === pagination.page
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              
              {pagination.totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={loading}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Article Count */}
        {selectedFilters.length === 0 && (
          <div className="text-center mt-8 text-sm text-gray-500">
            Showing {articles.length} of {pagination.count} articles
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          </div>
        </div>
      </div>
    }>
      <ArticlesPageContent />
    </Suspense>
  )
}