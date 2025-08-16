'use client'

import { Article } from '@/types'
import { useRelatedArticles } from '@/hooks/useRelatedArticles'
import { ArticleCard } from './ArticleCard'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'

interface RelatedArticlesProps {
  currentArticle?: Article
  limit?: number
  className?: string
}

export function RelatedArticles({ 
  currentArticle, 
  limit = 4, 
  className = '' 
}: RelatedArticlesProps) {
  // If no article, render nothing safely
  if (!currentArticle) {
    return null
  }

  // Normalize shapes: handle both nested { tag: { id } } and flat { id }
  const tagIds = (currentArticle.tags || [])
    .map((t: any) => t?.tag?.id ?? t?.id)
    .filter(Boolean) as string[]

  const filterIds = (currentArticle as any).filters
    ? ((currentArticle as any).filters as any[])
        .map((f: any) => f?.filter?.id ?? f?.id)
        .filter(Boolean)
    : []

  const categoryId = (currentArticle as any).category_id ?? (currentArticle as any).category?.id

  const { relatedArticles, loading, error } = useRelatedArticles({
    currentArticleId: currentArticle.id,
    categoryId,
    tags: tagIds,
    filters: filterIds,
    limit
  })

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Typography variant="body" className="text-gray-500">
          Unable to load related articles
        </Typography>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={className}>
        <Typography variant="h3" className="mb-6">
          Related Articles
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
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
    )
  }

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <Typography variant="h3" className="mb-6">
        Related Articles
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="default"
            showAuthor={false}
            showCategory={true}
            showTags={false}
            showStats={true}
          />
        ))}
      </div>
    </div>
  )
}