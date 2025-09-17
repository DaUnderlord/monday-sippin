'use client'

import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface LatestArticlesProps {
  articles: Article[]
  loading?: boolean
}

export function LatestArticles({ articles, loading }: LatestArticlesProps) {
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 text-gray-900 dark:text-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-48 mx-auto rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-72 mx-auto mt-3 rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 rounded-xl bg-black/10 dark:bg-white/10 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 rounded-md bg-black/10 dark:bg-white/10" />
                  <div className="h-4 w-3/4 rounded-md bg-black/10 dark:bg-white/10" />
                  <div className="h-3 w-1/2 rounded-md bg-black/10 dark:bg-white/10" />
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
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 text-gray-900 dark:text-slate-100 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-transparent to-brand-violet/5" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-violet-light text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Fresh Insights
            </div>
            <Typography variant="h2" className="mb-4 text-slate-900 dark:text-white">
              Latest Articles
            </Typography>
            <Typography variant="body" className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Stay ahead with our newest market insights, on-chain analysis, and strategic perspectives
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
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 text-gray-900 dark:text-slate-100 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-transparent to-brand-violet/5" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-violet-light text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Fresh Insights
          </div>
          <Typography variant="h2" className="mb-4 text-slate-900 dark:text-white">
            Latest Articles
          </Typography>
          <Typography variant="body" className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Stay ahead with our newest market insights, on-chain analysis, and strategic perspectives
          </Typography>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {articles.map((article, index) => (
            <motion.div 
              key={article.id}
              className="group h-full"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 * index, ease: 'easeOut' }}
            >
              <ArticleCard
                article={article}
                variant="default"
                showAuthor={true}
                showCategory={true}
                showTags={true}
                showStats={true}
              />
            </motion.div>
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