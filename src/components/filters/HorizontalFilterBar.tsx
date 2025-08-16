'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Filter } from '@/types'

interface HorizontalFilterBarProps {
  filters: Filter[]
  selectedFilters: string[]
  onFilterSelect: (filterId: string) => void
  onFilterDeselect: (filterId: string) => void
  onClearFilters: () => void
  loading?: boolean
  className?: string
}

interface FilterRowProps {
  filters: Filter[]
  selectedFilters: string[]
  onFilterSelect: (filterId: string) => void
  onFilterDeselect: (filterId: string) => void
  level: number
  title?: string
  onResetLevel?: (level: number) => void
}

function FilterRow({ 
  filters, 
  selectedFilters, 
  onFilterSelect, 
  onFilterDeselect, 
  level,
  title,
  onResetLevel,
}: FilterRowProps) {
  if (filters.length === 0) return null

  const hasSelectedInRow = useMemo(() => {
    const ids = new Set(filters.map(f => f.id))
    return selectedFilters.some(id => ids.has(id))
  }, [filters, selectedFilters])

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </div>
          {hasSelectedInRow && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResetLevel?.(level)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {filters.map(filter => {
          const isSelected = selectedFilters.includes(filter.id)
          
          return (
            <Button
              key={filter.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (isSelected) {
                  onFilterDeselect(filter.id)
                } else {
                  onFilterSelect(filter.id)
                }
              }}
              className={`
                relative transition-all duration-200 hover:scale-105
                ${isSelected 
                  ? 'bg-primary text-primary-foreground border-transparent shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }
                ${level === 0 ? 'font-semibold px-4 py-2' : 'px-3 py-1.5'}
              `}
            >
              <span className="flex items-center gap-2">
                {filter.name}
                {filter.articleCount !== undefined && filter.articleCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`
                      text-[10px] px-1.5 py-0.5 min-w-[18px] h-4
                      ${isSelected 
                        ? 'bg-white/20 text-primary-foreground border-white/30' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }
                    `}
                  >
                    {filter.articleCount}
                  </Badge>
                )}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function HorizontalFilterBar({
  filters,
  selectedFilters,
  onFilterSelect,
  onFilterDeselect,
  onClearFilters,
  loading = false,
  className = ''
}: HorizontalFilterBarProps) {
  // Get top-level filters (level 0)
  const primaryFilters = useMemo(() => 
    filters.filter(f => f.level === 0), 
    [filters]
  )

  // Get secondary filters based on selected primary filters
  const secondaryFilters = useMemo(() => {
    const selectedPrimary = primaryFilters.filter(f => selectedFilters.includes(f.id))
    const children: Filter[] = []
    selectedPrimary.forEach(primary => {
      if (primary.children) {
        children.push(...primary.children)
      }
    })
    return children
  }, [primaryFilters, selectedFilters])

  // Get tertiary filters based on selected secondary filters
  const tertiaryFilters = useMemo(() => {
    const selectedSecondary = secondaryFilters.filter(f => selectedFilters.includes(f.id))
    const children: Filter[] = []
    selectedSecondary.forEach(secondary => {
      if (secondary.children) {
        children.push(...secondary.children)
      }
    })
    return children
  }, [secondaryFilters, selectedFilters])

  const hasActiveFilters = selectedFilters.length > 0

  // Clear only the filters that belong to a specific level
  const handleResetLevel = (level: number) => {
    const pool = level === 0 ? primaryFilters : level === 1 ? secondaryFilters : tertiaryFilters
    const idsAtLevel = new Set(pool.map(f => f.id))
    selectedFilters.forEach(id => {
      if (idsAtLevel.has(id)) onFilterDeselect(id)
    })
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Header with clear button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
                Filter Articles
              </h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {selectedFilters.length} active
                </Badge>
              )}
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Primary filters row */}
          {primaryFilters.length > 0 && (
            <FilterRow
              filters={primaryFilters}
              selectedFilters={selectedFilters}
              onFilterSelect={onFilterSelect}
              onFilterDeselect={onFilterDeselect}
              level={0}
              title="Categories"
              onResetLevel={handleResetLevel}
            />
          )}

          {/* Secondary filters row - only show if primary is selected */}
          {secondaryFilters.length > 0 && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <FilterRow
                filters={secondaryFilters}
                selectedFilters={selectedFilters}
                onFilterSelect={onFilterSelect}
                onFilterDeselect={onFilterDeselect}
                level={1}
                title="Subcategories"
                onResetLevel={handleResetLevel}
              />
            </div>
          )}

          {/* Tertiary filters row - only show if secondary is selected */}
          {tertiaryFilters.length > 0 && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <FilterRow
                filters={tertiaryFilters}
                selectedFilters={selectedFilters}
                onFilterSelect={onFilterSelect}
                onFilterDeselect={onFilterDeselect}
                level={2}
                title="Topics"
                onResetLevel={handleResetLevel}
              />
            </div>
          )}

          {/* Empty state */}
          {primaryFilters.length === 0 && !loading && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No filters available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
