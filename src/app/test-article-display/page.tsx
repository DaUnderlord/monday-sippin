'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/articles'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Article } from '@/types'

export default function TestArticleDisplayPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?limit=6&status=published')
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        const result = await response.json()
        setArticles(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Typography variant="h1" className="text-center mb-12">
            Article Display Components Test
          </Typography>
          
          <div className="space-y-12">
            {/* Featured Article Skeleton */}
            <section>
              <Typography variant="h2" className="mb-6">Featured Article</Typography>
              <div className="max-w-4xl">
                <Skeleton className="h-64 w-full rounded-lg mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </section>

            {/* Article Grid Skeleton */}
            <section>
              <Typography variant="h2" className="mb-6">Article Grid</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Typography variant="h1" className="mb-4">Error Loading Articles</Typography>
          <Typography variant="body" className="text-red-600 mb-4">{error}</Typography>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const featuredArticle = articles[0]
  const gridArticles = articles.slice(1)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Typography variant="h1" className="text-center mb-12">
          Article Display Components Test
        </Typography>
        
        <div className="space-y-12">
          {/* Featured Article */}
          {featuredArticle && (
            <section>
              <Typography variant="h2" className="mb-6">Featured Article</Typography>
              <div className="max-w-4xl">
                <ArticleCard 
                  article={featuredArticle} 
                  variant="featured"
                  showAuthor={true}
                  showCategory={true}
                  showTags={true}
                  showStats={true}
                />
              </div>
            </section>
          )}

          {/* Article Grid */}
          {gridArticles.length > 0 && (
            <section>
              <Typography variant="h2" className="mb-6">Article Grid (Default Variant)</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.slice(0, 3).map((article) => (
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
            </section>
          )}

          {/* Compact Articles */}
          {gridArticles.length > 3 && (
            <section>
              <Typography variant="h2" className="mb-6">Compact Articles</Typography>
              <div className="max-w-2xl space-y-2">
                {gridArticles.slice(3).map((article) => (
                  <ArticleCard 
                    key={article.id}
                    article={article} 
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Component Variations */}
          {featuredArticle && (
            <section>
              <Typography variant="h2" className="mb-6">Component Variations</Typography>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Typography variant="h3" className="mb-4">Without Author</Typography>
                  <ArticleCard 
                    article={featuredArticle} 
                    variant="default"
                    showAuthor={false}
                    showCategory={true}
                    showTags={true}
                    showStats={true}
                  />
                </div>
                <div>
                  <Typography variant="h3" className="mb-4">Minimal (No Tags/Stats)</Typography>
                  <ArticleCard 
                    article={featuredArticle} 
                    variant="default"
                    showAuthor={true}
                    showCategory={true}
                    showTags={false}
                    showStats={false}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Navigation */}
          <section className="text-center pt-8 border-t">
            <Typography variant="h3" className="mb-4">Test Navigation</Typography>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/articles">All Articles</a>
              </Button>
              {featuredArticle && (
                <Button variant="outline" asChild>
                  <a href={`/articles/${featuredArticle.slug}`}>
                    View Sample Article
                  </a>
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}