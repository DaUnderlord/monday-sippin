'use client'

import { Suspense } from 'react'
import { FilterPanel, FilteredArticlesList } from '@/components/filters'
import { useFilters } from '@/hooks/useFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function FiltersPageContent() {
  const {
    filters,
    selectedFilters,
    filteredArticles,
    loading,
    error,
    selectFilter,
    deselectFilter,
    clearFilters,
    loadFilteredArticles
  } = useFilters()

  const handlePageChange = (page: number) => {
    loadFilteredArticles(page)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent mb-4">
            Explore Articles
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Discover content tailored to your interests using our advanced filter system. 
            Select multiple filters to find exactly what you're looking for.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FilterPanel
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterSelect={selectFilter}
                onFilterDeselect={deselectFilter}
                onClearFilters={clearFilters}
                loading={loading}
              />
            </div>
          </div>

          {/* Articles Content */}
          <div className="lg:col-span-3">
            {selectedFilters.length > 0 ? (
              <div className="space-y-6">
                {/* Selected Filters Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedFilters.map(filterId => {
                        // Find filter name from the filters array
                        const findFilterName = (filters: any[], id: string): string => {
                          for (const filter of filters) {
                            if (filter.id === id) return filter.name
                            if (filter.children) {
                              const found = findFilterName(filter.children, id)
                              if (found) return found
                            }
                          }
                          return 'Unknown Filter'
                        }

                        const filterName = findFilterName(filters, filterId)
                        
                        return (
                          <Badge 
                            key={filterId}
                            variant="secondary"
                            className="bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 text-brand-teal border-brand-teal/20"
                          >
                            {filterName}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Filtered Articles */}
                <FilteredArticlesList
                  articles={filteredArticles}
                  loading={loading}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              /* Welcome State */
              <Card className="text-center py-12">
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-brand-teal to-brand-orange rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Start Filtering
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Select one or more filters from the sidebar to discover articles that match your interests.
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      You can combine multiple filters to narrow down your search and find exactly what you're looking for.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FiltersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-teal"></div>
      </div>
    }>
      <FiltersPageContent />
    </Suspense>
  )
}