'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResponsiveImage } from '@/components/media/ResponsiveImage'
import type { Article, PaginatedResponse } from '@/types'

interface FilteredArticlesListProps {
  articles: PaginatedResponse<Article> | null
  loading?: boolean
  onPageChange?: (page: number) => void
  className?: string
}

function ArticleCard({ article }: { article: Article }) {
  const publishedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative">
          {article.featured_image && (
            <div className="aspect-video overflow-hidden">
              <ResponsiveImage
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          {article.category && (
            <Badge 
              className="absolute top-3 left-3 bg-gradient-to-r from-brand-teal to-brand-orange text-white"
            >
              {article.category.name}
            </Badge>
          )}
        </div>

        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-teal transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            {article.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                {article.author && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{article.author.full_name || article.author.email}</span>
                  </div>
                )}
                
                {publishedDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{publishedDate}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time} min read</span>
                </div>
              </div>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 3).map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{article.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void 
}) {
  const pages = []
  const showPages = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
  let endPage = Math.min(totalPages, startPage + showPages - 1)
  
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {pages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={page === currentPage ? "bg-gradient-to-r from-brand-teal to-brand-orange" : ""}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function FilteredArticlesList({
  articles,
  loading = false,
  onPageChange,
  className = ''
}: FilteredArticlesListProps) {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
            <CardContent className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!articles || articles.data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-brand-teal to-brand-orange rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or check back later for new content.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {articles.data.length} of {articles.count} articles
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {articles.data.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.totalPages > 1 && onPageChange && (
        <div className="pt-8">
          <Pagination
            currentPage={articles.page}
            totalPages={articles.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}