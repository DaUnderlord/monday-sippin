'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Eye, 
  User,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Grid,
  List
} from 'lucide-react'
import { Category, Article } from '@/types'
import { supabase } from '@/lib/supabase'
import { getMockArticlesByCategory } from '@/lib/mock-content'
import { ArticleCard } from '@/components/articles/ArticleCard'
import Link from 'next/link'

interface CategoryPageProps {
  category: Category
}

export function CategoryPage({ category }: CategoryPageProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 12

  useEffect(() => {
    fetchArticles()
  }, [category.id])

  useEffect(() => {
    filterAndSortArticles()
  }, [articles, searchQuery, sortBy])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          tags:article_tags(tag:tags(name, slug))
        `)
        .eq('category_id', category.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (error || !data || data.length === 0) {
        // Fallback to mock articles by slug first, then id
        const mocksBySlug = getMockArticlesByCategory(category.slug)
        const mocks = mocksBySlug.length > 0 ? mocksBySlug : getMockArticlesByCategory(category.id)
        setArticles(mocks)
        return
      }
      setArticles(data)
    } catch (error) {
      console.error('Error fetching articles:', error)
      // On error, also fallback to mocks
      const mocksBySlug = getMockArticlesByCategory(category.slug)
      const mocks = mocksBySlug.length > 0 ? mocksBySlug : getMockArticlesByCategory(category.id)
      setArticles(mocks)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortArticles = () => {
    let filtered = [...articles]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
      case 'reading-time':
        filtered.sort((a, b) => (a.reading_time || 0) - (b.reading_time || 0))
        break
    }

    setFilteredArticles(filtered)
    setCurrentPage(1)
  }

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  )

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)

  const getCategoryIcon = () => {
    const iconMap: Record<string, string> = {
      'market-analysis': '📈',
      'investment': '💰',
      'business': '💼',
      'technology': '💡',
      'lifestyle': '❤️',
      'global': '🌍'
    }
    return iconMap[category.slug] || '📚'
  }

  const getCategoryGradient = () => {
    const gradientMap: Record<string, string> = {
      'market-analysis': 'from-blue-500 to-cyan-500',
      'investment': 'from-green-500 to-emerald-500',
      'business': 'from-purple-500 to-violet-500',
      'technology': 'from-orange-500 to-red-500',
      'lifestyle': 'from-pink-500 to-rose-500',
      'global': 'from-indigo-500 to-blue-500'
    }
    return gradientMap[category.slug] || 'from-gray-500 to-slate-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0b0b12] dark:to-[#0b0b12]">
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${getCategoryGradient()}`}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 dark:bg-black/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 dark:bg-black/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="text-6xl mb-6">{getCategoryIcon()}</div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                {category.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{articles.length} Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Updated Weekly</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{articles.reduce((sum, article) => sum + (article.view_count || 0), 0)} Total Views</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave separator - light */}
        <div className="absolute bottom-0 left-0 right-0 dark:hidden">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
        {/* Wave separator - dark */}
        <div className="absolute bottom-0 left-0 right-0 hidden dark:block">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#0b0b12"
            />
          </svg>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="bg-white dark:bg-[#11121a] rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-800">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white dark:bg-[#0f1018] dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-[#0f1018]"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="reading-time">Reading Time</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="flex items-center bg-gray-100 dark:bg-[#0f1018] rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Showing {filteredArticles.length} of {articles.length} articles
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Articles Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-80"></div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">No articles found</h3>
              <p className="text-gray-600 dark:text-slate-300 mb-8">
                {searchQuery 
                  ? `No articles match your search for "${searchQuery}"`
                  : "No articles available in this category yet"
                }
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {paginatedArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-16 flex justify-center"
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-10"
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Related Categories */}
      <section className="py-16 bg-white dark:bg-[#0b0b12]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Explore More Categories
            </h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              Discover other topics that might interest you
            </p>
          </motion.div>

          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl">
              <Link href="/categories">
                <ArrowRight className="w-5 h-5 mr-2" />
                View All Categories
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}