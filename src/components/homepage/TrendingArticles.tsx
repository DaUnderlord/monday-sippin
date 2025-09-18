'use client'

import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
    <motion.section
      className="py-20 bg-gradient-to-br from-gray-50 via-white to-brand-sage-green/5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 relative overflow-hidden text-gray-900 dark:text-slate-100"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Background decoration (toned down for dark mode) */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-violet/10 to-transparent rounded-full blur-3xl dark:from-white/5"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-brand-violet-dark/10 to-transparent rounded-full blur-3xl dark:from-white/5"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Typography variant="h2" className="mb-6 text-gradient-brand-primary text-4xl md:text-5xl font-extrabold">
            Trending
          </Typography>
        </motion.div>

        {/* Desktop/Tablet Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {articles.map((article, index) => (
            <motion.div 
              key={article.id} 
              className="relative group"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 * index, ease: 'easeOut' }}
            >
              {/* Enhanced trending rank badge */}
              <motion.div className="absolute -top-3 -left-3 z-20" whileHover={{ scale: 1.05 }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-violet-dark to-brand-violet rounded-full blur-sm opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-brand-violet-dark to-brand-violet text-white rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold shadow-xl border-2 border-white">
                    #{index + 1}
                  </div>
                </div>
              </motion.div>
              
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
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden -mx-6 px-6 py-2 relative mb-14">
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                className="snap-start shrink-0 w-[85%] xs:w-[82%] max-w-sm relative group pt-4"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: 'easeOut' }}
              >
                <div className="absolute top-0 left-2 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-violet-dark to-brand-violet rounded-full blur-sm opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-brand-violet-dark to-brand-violet text-white rounded-full h-9 w-9 flex items-center justify-center text-xs font-bold shadow-xl border-2 border-white">
                      #{index + 1}
                    </div>
                  </div>
                </div>
                <ArticleCard
                  article={article}
                  variant="default"
                  showAuthor={true}
                  showCategory={true}
                  showTags={false}
                  showStats={true}
                />
              </motion.div>
            ))}
          </div>
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
    </motion.section>
  )
}