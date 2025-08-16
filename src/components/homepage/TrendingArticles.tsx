'use client'

import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TrendingArticlesProps {
  articles: Article[]
  loading?: boolean
}

export function TrendingArticles({ articles, loading }: TrendingArticlesProps) {
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-[#0b0b12] dark:to-[#0b0b12] text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-brand-warm-orange" />
              <Typography variant="h2">
                Trending This Week
              </Typography>
            </div>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Most popular articles based on reader engagement
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
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-[#0b0b12] dark:to-[#0b0b12] text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-brand-warm-orange" />
              <Typography variant="h2">
                Trending This Week
              </Typography>
            </div>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300">
              Trending articles will appear here based on reader engagement.
            </Typography>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-brand-sage-green/5 dark:from-[#0b0b12] dark:via-[#0b0b12] dark:to-[#0b0b12] relative overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-violet/15 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-brand-violet-dark/15 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-brand-violet-dark/15 to-brand-violet/15 rounded-full px-6 py-3 mb-6 backdrop-blur-sm border border-brand-violet/30">
            <TrendingUp className="h-6 w-6 text-brand-violet animate-pulse" />
            <Typography variant="small" className="text-brand-violet font-bold">
              Most Popular
            </Typography>
          </div>
          
          <Typography variant="h2" className="mb-6 text-gradient-brand-primary text-4xl md:text-5xl font-extrabold">
            Trending This Week
          </Typography>
          <Typography variant="body" className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            Discover the most popular articles based on reader engagement and views. 
            These insights are capturing the community's attention right now.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {articles.map((article, index) => (
            <div 
              key={article.id} 
              className="relative group"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Enhanced trending rank badge */}
              <div className="absolute -top-3 -left-3 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-violet-dark to-brand-violet rounded-full blur-sm opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-brand-violet-dark to-brand-violet text-white rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold shadow-xl border-2 border-white">
                    #{index + 1}
                  </div>
                </div>
              </div>
              
              {/* Trending glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-violet-dark/25 to-brand-violet/25 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative">
                <ArticleCard
                  article={article}
                  variant="default"
                  showAuthor={true}
                  showCategory={true}
                  showTags={false}
                  showStats={true}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-4">
            <Link href="/articles?sort=trending">
              <Button 
                variant="outline" 
                size="lg" 
                className="group border-2 border-brand-violet text-brand-violet hover:bg-brand-violet hover:text-white transition-all duration-300 px-8 py-3 font-semibold shadow-lg hover:shadow-xl"
              >
                View All Trending
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <Typography variant="small" className="text-gray-500 mt-4">
            See what's capturing everyone's attention
          </Typography>
        </div>
      </div>
    </section>
  )
}