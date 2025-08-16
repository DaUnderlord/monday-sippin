'use client'

import { Suspense } from 'react'
import { FilterPanel, FilteredArticlesList } from '@/components/filters'
import { useFilters } from '@/hooks/useFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function TestFiltersContent() {
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
            Filter System Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Testing the advanced hierarchical filter system with URL synchronization and article filtering.
          </p>
        </div>

        {/* Debug Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Total Filters Loaded:</strong> {filters.length}
            </div>
            <div>
              <strong>Selected Filters:</strong> {selectedFilters.length}
              {selectedFilters.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFilters.map(filterId => (
                    <Badge key={filterId} variant="outline">
                      {filterId}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <strong>Loading State:</strong> {loading ? 'Loading...' : 'Ready'}
            </div>
            {error && (
              <div className="text-red-600">
                <strong>Error:</strong> {error}
              </div>
            )}
            {filteredArticles && (
              <div>
                <strong>Filtered Articles:</strong> {filteredArticles.count} total, showing {filteredArticles.data.length}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Reload Page
              </Button>
              <Button 
                onClick={clearFilters} 
                variant="outline"
                disabled={selectedFilters.length === 0}
              >
                Clear All Filters
              </Button>
              <Button 
                onClick={() => loadFilteredArticles(1)} 
                variant="outline"
                disabled={selectedFilters.length === 0}
              >
                Reload Articles
              </Button>
            </div>
          </CardContent>
        </Card>

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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deselectFilter(filterId)}
                              className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                            >
                              ×
                            </Button>
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
                      Test Filter System
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Select filters from the sidebar to test the filtering functionality. 
                      The URL will update automatically to reflect your selections.
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Features being tested:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Hierarchical filter structure</li>
                        <li>• URL synchronization</li>
                        <li>• Multiple filter combination</li>
                        <li>• Article count display</li>
                        <li>• Responsive design</li>
                      </ul>
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

export default function TestFiltersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-teal"></div>
      </div>
    }>
      <TestFiltersContent />
    </Suspense>
  )
}