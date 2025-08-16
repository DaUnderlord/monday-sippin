'use client'

import { Suspense } from 'react'
import { FilterManager } from '@/components/filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFilters } from '@/hooks/useFilters'

function FilterStatsCard() {
  const { filters, loading } = useFilters()

  const stats = {
    total: 0,
    level1: 0,
    level2: 0,
    level3: 0,
    withArticles: 0
  }

  const flattenFilters = (filters: any[]): any[] => {
    const result: any[] = []
    
    const flatten = (filterList: any[]) => {
      filterList.forEach(filter => {
        result.push(filter)
        if (filter.children && filter.children.length > 0) {
          flatten(filter.children)
        }
      })
    }
    
    flatten(filters)
    return result
  }

  if (!loading && filters.length > 0) {
    const flatFilters = flattenFilters(filters)
    stats.total = flatFilters.length
    stats.level1 = flatFilters.filter(f => f.level === 1).length
    stats.level2 = flatFilters.filter(f => f.level === 2).length
    stats.level3 = flatFilters.filter(f => f.level === 3).length
    stats.withArticles = flatFilters.filter(f => (f.articleCount || 0) > 0).length
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-teal">{loading ? '...' : stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Filters</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-orange">{loading ? '...' : stats.level1}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Level 1</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-purple">{loading ? '...' : stats.level2}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Level 2</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-sage">{loading ? '...' : stats.level3}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Level 3</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-coral">{loading ? '...' : stats.withArticles}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">With Articles</div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminFiltersContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent mb-4">
            Filter Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Manage the hierarchical filter system for content organization. Create, edit, and organize filters 
            to help users discover relevant articles.
          </p>
        </div>

        {/* Stats Cards */}
        <FilterStatsCard />

        {/* Filter Manager */}
        <FilterManager />
      </div>
    </div>
  )
}

export default function AdminFiltersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-teal"></div>
      </div>
    }>
      <AdminFiltersContent />
    </Suspense>
  )
}