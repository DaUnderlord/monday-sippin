'use client'

import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LatestArticlesProps {
  articles: Article[]
  loading?: boolean
}

export function LatestArticles({ articles, loading }: LatestArticlesProps) {
  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-[#0b0b12] text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Typography variant="h2" className="mb-4">
              Latest Articles
            </Typography>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Stay up to date with our newest insights and analysis
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-slate-800 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!articles.length) {
    return (
      <section className="py-16 bg-white dark:bg-[#0b0b12] text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Typography variant="h2" className="mb-4">
              Latest Articles
            </Typography>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300 mb-8">
              Our latest articles will appear here once published.
            </Typography>
            <Link href="/admin/articles/new">
              <Button>
                Create First Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50/50 dark:from-[#0b0b12] dark:to-[#0b0b12] text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-deep-teal/10 to-brand-sage-green/10 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-brand-warm-orange rounded-full animate-pulse"></div>
            <Typography variant="small" className="text-brand-deep-teal font-semibold">
              Fresh Content
            </Typography>
          </div>
          
          <Typography variant="h2" className="mb-6 text-gradient-brand-primary text-4xl md:text-5xl font-extrabold">
            Latest Articles
          </Typography>
          <Typography variant="body" className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            Stay ahead of the curve with our expertly curated content on crypto, 
            finance, and business strategy. Each piece is crafted to deliver maximum value in minimum time.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {articles.map((article, index) => (
            <div 
              key={article.id}
              className="group h-full"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <ArticleCard
                article={article}
                variant="default"
                showAuthor={true}
                showCategory={true}
                showTags={true}
                showStats={true}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-4">
            <Link href="/articles">
              <Button 
                variant="outline" 
                size="lg"
                className="group border-2 border-brand-deep-teal text-brand-deep-teal hover:bg-brand-deep-teal hover:text-white transition-all duration-300 px-8 py-3 font-semibold shadow-lg hover:shadow-xl"
              >
                View All Articles
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <Typography variant="small" className="text-gray-500 mt-4">
            Discover {articles.length > 0 ? `${articles.length}+ more` : 'more'} premium insights
          </Typography>
        </div>
      </div>
    </section>
  )
}