'use client'

import { Category } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, BookOpen, BarChart3, DollarSign, Newspaper, GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'


interface CategoryWithCount extends Category {
  article_count: number
}

interface PopularCategoriesProps {
  categories: CategoryWithCount[]
  loading?: boolean
}

// Icon mapping for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('market') || name.includes('analysis')) return BarChart3
  if (name.includes('finance') || name.includes('personal')) return DollarSign
  if (name.includes('business') || name.includes('strategy')) return TrendingUp
  if (name.includes('news') || name.includes('industry')) return Newspaper
  if (name.includes('educational') || name.includes('education')) return GraduationCap
  return BookOpen
}

export function PopularCategories({ categories, loading }: PopularCategoriesProps) {
  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Typography variant="h2" className="mb-4">
              Popular Categories
            </Typography>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our most popular content categories
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Typography variant="h2" className="mb-4">
              Popular Categories
            </Typography>
            <Typography variant="body" className="text-gray-600 dark:text-gray-300">
              Categories will appear here once articles are published.
            </Typography>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #1B4B5A 2px, transparent 2px), radial-gradient(circle at 75% 75%, #52B788 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-sage-green/10 to-brand-deep-teal/10 rounded-full px-4 py-2 mb-6">
            <BookOpen className="h-4 w-4 text-brand-sage-green" />
            <Typography variant="small" className="text-brand-deep-teal font-semibold">
              Explore Topics
            </Typography>
          </div>

          <Typography variant="h2" className="mb-6 text-gradient-brand-accent text-4xl md:text-5xl font-extrabold">
            Popular Categories
          </Typography>
          <Typography variant="body" className="text-gray-600 dark:text-white/80 max-w-3xl mx-auto text-lg leading-relaxed">
            Discover content across our most popular categories, from market analysis to personal finance.
            Each category is curated to deliver expert insights in your areas of interest.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.slice(0, 6).map((category, index) => {
            const IconComponent = getCategoryIcon(category.name)

            return (
              <Link
                key={category.id}
                href={`/articles?category=${category.slug}`}
                className="block group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="relative h-full">
                  {/* Hover glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-sage-green/20 to-brand-deep-teal/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                  <Card className="relative h-full hover:shadow-2xl transition-all duration-500 group-hover:scale-105 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 min-h-[220px]">
                    <CardContent className="p-8 h-full">
                      <div className="flex items-start space-x-6 h-full">
                        <div className="relative">
                          {/* Icon background with enhanced gradient */}
                          <div
                            className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: category.color
                                ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                                : 'linear-gradient(135deg, #1B4B5A, #52B788)'
                            }}
                          >
                            <IconComponent className="h-8 w-8" />
                          </div>

                          {/* Pulse effect */}
                          <div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 group-hover:animate-ping"
                            style={{
                              background: category.color
                                ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                                : 'linear-gradient(135deg, #1B4B5A, #52B788)'
                            }}
                          ></div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <Typography
                            variant="h4"
                            className="group-hover:text-brand-warm-orange transition-colors mb-3 font-bold"
                          >
                            {category.name}
                          </Typography>

                          <div className="flex items-center space-x-2 mb-4">
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-brand-sage-green/10 to-brand-deep-teal/10 text-brand-deep-teal border-brand-deep-teal/20 font-medium"
                            >
                              {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
                            </Badge>
                          </div>

                          {category.description && (
                            <Typography
                              variant="body-small"
                              className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed"
                            >
                              {category.description}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-4">
            <Link href="/articles">
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-brand-sage-green text-brand-sage-green hover:bg-brand-sage-green hover:text-white transition-all duration-300 px-8 py-3 font-semibold shadow-lg hover:shadow-xl"
              >
                View All Articles
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-4">
            Explore all categories and discover new insights
          </Typography>
        </div>
      </div>
    </section>
  )
}