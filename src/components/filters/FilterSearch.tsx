'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Filter } from '@/types'

interface FilterSearchProps {
  filters: Filter[]
  selectedFilters: string[]
  onFilterSelect: (filterId: string) => void
  onFilterDeselect: (filterId: string) => void
  placeholder?: string
  className?: string
}

export function FilterSearch({
  filters,
  selectedFilters,
  onFilterSelect,
  onFilterDeselect,
  placeholder = "Search filters...",
  className = ''
}: FilterSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Flatten filters for searching
  const flattenFilters = (filters: Filter[]): Filter[] => {
    const result: Filter[] = []
    
    const flatten = (filterList: Filter[], level = 0) => {
      filterList.forEach(filter => {
        result.push({ ...filter, level })
        if (filter.children && filter.children.length > 0) {
          flatten(filter.children, level + 1)
        }
      })
    }
    
    flatten(filters)
    return result
  }

  const flatFilters = useMemo(() => flattenFilters(filters), [filters])

  // Filter based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    return flatFilters.filter(filter =>
      filter.name.toLowerCase().includes(query) ||
      filter.slug.toLowerCase().includes(query)
    ).slice(0, 10) // Limit results
  }, [flatFilters, searchQuery])

  const handleFilterToggle = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      onFilterDeselect(filterId)
    } else {
      onFilterSelect(filterId)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery && filteredResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto">
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredResults.map(filter => {
                const isSelected = selectedFilters.includes(filter.id)
                
                return (
                  <div
                    key={filter.id}
                    onClick={() => handleFilterToggle(filter.id)}
                    className={`
                      flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                      ${isSelected 
                        ? 'bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 border border-brand-teal/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                    style={{ paddingLeft: `${(filter.level || 0) * 12 + 8}px` }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-3 h-3 rounded border flex items-center justify-center
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
                        text-sm transition-colors
                        ${isSelected ? 'text-brand-teal dark:text-brand-orange font-medium' : 'text-gray-700 dark:text-gray-300'}
                      `}>
                        {filter.name}
                      </span>
                    </div>

                    {filter.articleCount !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {filter.articleCount}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {isOpen && searchQuery && filteredResults.length === 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No filters found for "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}