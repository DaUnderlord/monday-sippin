'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, X, MinusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import type { Filter } from '@/types'

interface FilterPanelProps {
  filters: Filter[]
  selectedFilters: string[]
  onFilterSelect: (filterId: string) => void
  onFilterDeselect: (filterId: string) => void
  onClearFilters: () => void
  loading?: boolean
  className?: string
}

interface FilterItemProps {
  filter: Filter
  selectedFilters: string[]
  onFilterSelect: (filterId: string) => void
  onFilterDeselect: (filterId: string) => void
  level?: number
  expandState?: 'expand' | 'collapse'
  getSelectedCount?: (f: Filter) => number
}

function FilterItem({ 
  filter, 
  selectedFilters, 
  onFilterSelect, 
  onFilterDeselect,
  level = 0,
  expandState,
  getSelectedCount,
}: FilterItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first two levels
  const isSelected = selectedFilters.includes(filter.id)
  const hasChildren = filter.children && filter.children.length > 0
  const selectedInSubtree = useMemo(() => (getSelectedCount ? getSelectedCount(filter) : 0), [getSelectedCount, filter, selectedFilters])
  
  // React to global expand/collapse requests
  useEffect(() => {
    if (!hasChildren || !expandState) return
    setIsExpanded(expandState === 'expand')
  }, [expandState, hasChildren])
  
  const handleToggle = () => {
    if (isSelected) {
      onFilterDeselect(filter.id)
    } else {
      onFilterSelect(filter.id)
    }
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="space-y-1">
      <div 
        className={`
          flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
          ${isSelected 
            ? 'bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 border border-brand-teal/20' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${level > 0 ? 'ml-4' : ''}
        `}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className="flex items-center space-x-2 flex-1" onClick={handleToggle}>
          <div className={`
            w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
            ${isSelected 
              ? 'bg-gradient-to-r from-brand-teal to-brand-orange border-brand-teal' 
              : 'border-gray-300 dark:border-gray-600'
            }
         `}>
            {isSelected && (
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <span className={`
            text-sm font-medium transition-colors
            ${isSelected ? 'text-brand-teal dark:text-brand-orange' : 'text-gray-700 dark:text-gray-300'}
            ${level === 0 ? 'font-semibold' : ''}
         `}>
            {filter.name}
          </span>
          
          <div className="ml-auto flex items-center gap-2">
            {typeof selectedInSubtree === 'number' && hasChildren && selectedInSubtree > 0 && (
              <Badge variant="secondary" className="text-[10px]">{selectedInSubtree} selected</Badge>
            )}
            {filter.articleCount !== undefined && (
              <Badge variant="secondary" className="text-[10px] opacity-70">{filter.articleCount}</Badge>
            )}
          </div>
        </div>

        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="p-1 h-6 w-6"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {filter.children?.map(child => (
            <FilterItem
              key={child.id}
              filter={child}
              selectedFilters={selectedFilters}
              onFilterSelect={onFilterSelect}
              onFilterDeselect={onFilterDeselect}
              level={level + 1}
              expandState={expandState}
              getSelectedCount={getSelectedCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterPanel({
  filters,
  selectedFilters,
  onFilterSelect,
  onFilterDeselect,
  onClearFilters,
  loading = false,
  className = ''
}: FilterPanelProps) {
  const selectedFilterCount = selectedFilters.length
  const [query, setQuery] = useState('')
  const [expandState, setExpandState] = useState<undefined | 'expand' | 'collapse'>(undefined)

  // Build a map of id -> Filter for quick label lookups and selected chips
  const filterIndex = useMemo(() => {
    const map = new Map<string, Filter>()
    const walk = (nodes: Filter[]) => {
      nodes.forEach(n => {
        map.set(n.id, n)
        if (n.children && n.children.length) walk(n.children)
      })
    }
    walk(filters)
    return map
  }, [filters])

  const getSelectedCount = useCallback((node: Filter): number => {
    let count = selectedFilters.includes(node.id) ? 1 : 0
    if (node.children) {
      node.children.forEach(c => { count += getSelectedCount(c) })
    }
    return count
  }, [selectedFilters])

  // Prune tree by search query while keeping ancestors of matches
  const prunedFilters = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return filters

    const prune = (nodes: Filter[]): Filter[] => {
      const res: Filter[] = []
      nodes.forEach(n => {
        const nameMatch = n.name.toLowerCase().includes(q)
        const prunedChildren = n.children ? prune(n.children) : []
        if (nameMatch || prunedChildren.length > 0) {
          res.push({ ...n, children: prunedChildren })
        }
      })
      return res
    }
    return prune(filters)
  }, [filters, query])

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
            Filters
          </CardTitle>
          {selectedFilterCount > 0 && (
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
        
        {/* Search input */}
        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder="Search filters"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
          <Button variant="ghost" size="sm" onClick={() => setExpandState('expand')} className="text-xs">Expand all</Button>
          <Button variant="ghost" size="sm" onClick={() => setExpandState('collapse')} className="text-xs">Collapse all</Button>
        </div>

        {/* Selected chips summary */}
        {selectedFilterCount > 0 && (
          <div className="mt-3 -mb-1 sticky top-0 z-10 bg-white/70 dark:bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-gray-950/50 rounded-md p-2 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map(id => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1 text-xs">
                  {filterIndex.get(id)?.name || id}
                  <button onClick={() => onFilterDeselect(id)} aria-label={`Remove ${filterIndex.get(id)?.name || id}`}>
                    <MinusCircle className="h-3 w-3 opacity-70" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : prunedFilters.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {prunedFilters.map(filter => (
              <FilterItem
                key={filter.id}
                filter={filter}
                selectedFilters={selectedFilters}
                onFilterSelect={onFilterSelect}
                onFilterDeselect={onFilterDeselect}
                level={0}
                expandState={expandState}
                getSelectedCount={getSelectedCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-brand-teal to-brand-orange rounded-full flex items-center justify-center opacity-50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No filters available</p>
            <p className="text-xs mt-1">Filters will appear here once they are created</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}