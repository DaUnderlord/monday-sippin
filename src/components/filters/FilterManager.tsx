'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Filter } from '@/types'

interface FilterManagerProps {
  className?: string
}

interface FilterFormData {
  name: string
  slug: string
  parent_id?: string
  level: number
  order_index: number
  description?: string
}

export function FilterManager({ className = '' }: FilterManagerProps) {
  const [filters, setFilters] = useState<Filter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingFilter, setEditingFilter] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FilterFormData | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formData, setFormData] = useState<FilterFormData>({
    name: '',
    slug: '',
    level: 1,
    order_index: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    loadFilters()
  }, [])

  const loadFilters = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/filters?includeCounts=true')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load filters')
      }

      setFilters(result.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load filters'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createFilter = async () => {
    try {
      // Generate slug from name if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const response = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create filter')
      }

      toast({
        title: 'Success',
        description: 'Filter created successfully'
      })

      setShowCreateForm(false)
      setFormData({ name: '', slug: '', level: 1, order_index: 0 })
      loadFilters()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create filter'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  const updateFilter = async (filterId: string, updates: Partial<Filter>) => {
    try {
      const response = await fetch('/api/filters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: filterId, ...updates })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update filter')
      }

      toast({
        title: 'Success',
        description: 'Filter updated successfully'
      })

      setEditingFilter(null)
      setEditForm(null)
      loadFilters()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update filter'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  // Build a map of all descendant ids for a filter to prevent cycles when reparenting
  const getDescendantIds = (node: Filter): Set<string> => {
    const ids = new Set<string>()
    const walk = (n?: Filter) => {
      if (!n || !n.children) return
      n.children.forEach(c => {
        ids.add(c.id)
        walk(c)
      })
    }
    walk(node)
    return ids
  }

  // Sort children by order_index then name for a stable tree
  const sortTree = (list: Filter[]): Filter[] => {
    const clone: Filter[] = list.map(f => ({ ...f, children: f.children ? sortTree(f.children) : [] }))
    clone.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0) || a.name.localeCompare(b.name))
    return clone
  }

  const sortedFilters = useMemo(() => sortTree(filters), [filters])

  // Expand/collapse state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleExpanded = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // Find siblings array for a given filter id
  const findSiblings = (roots: Filter[], targetId: string): { siblings: Filter[]; index: number } | null => {
    let result: { siblings: Filter[]; index: number } | null = null
    const walk = (arr: Filter[]) => {
      arr.forEach((node, idx) => {
        if (node.id === targetId) {
          result = { siblings: arr, index: idx }
        }
        if (!result && node.children && node.children.length) walk(node.children)
      })
    }
    walk(roots)
    return result
  }

  const moveFilter = async (filterId: string, direction: 'up' | 'down') => {
    const loc = findSiblings(sortedFilters, filterId)
    if (!loc) return
    const { siblings, index } = loc
    const neighborIndex = direction === 'up' ? index - 1 : index + 1
    if (neighborIndex < 0 || neighborIndex >= siblings.length) return
    const current = siblings[index]
    const neighbor = siblings[neighborIndex]
    // Swap order_index
    const curOrder = current.order_index ?? index
    const neiOrder = neighbor.order_index ?? neighborIndex
    // Persist both updates sequentially
    await updateFilter(current.id, { order_index: neiOrder })
    await updateFilter(neighbor.id, { order_index: curOrder })
  }

  const deleteFilter = async (filterId: string) => {
    if (!confirm('Are you sure you want to delete this filter? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/filters?id=${filterId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete filter')
      }

      toast({
        title: 'Success',
        description: 'Filter deleted successfully'
      })

      loadFilters()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete filter'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

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

  const flatFilters = flattenFilters(filters)

  const beginEdit = (f: Filter, level: number) => {
    setEditingFilter(f.id)
    setEditForm({
      name: f.name,
      slug: f.slug,
      parent_id: f.parent_id,
      level: level,
      order_index: f.order_index ?? 0,
      description: f.description,
    })
  }

  const cancelEdit = () => {
    setEditingFilter(null)
    setEditForm(null)
  }

  const saveEdit = async (id: string) => {
    if (!editForm) return
    // Derive level from parent depth to keep consistency with tree
    const parentLevel = editForm.parent_id
      ? (flatFilters.find(p => p.id === editForm.parent_id)?.level ?? 0) + 1
      : 0
    const payload: Partial<Filter> = {
      name: editForm.name,
      slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      parent_id: editForm.parent_id || null as any,
      level: parentLevel,
      order_index: editForm.order_index,
      description: editForm.description,
    }
    await updateFilter(id, payload)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Filter Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filter Management</CardTitle>
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <Button onClick={loadFilters} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border-2 border-dashed border-brand-teal/30">
            <CardHeader>
              <CardTitle className="text-lg">Create New Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Filter name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="filter-slug (auto-generated if empty)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Parent Filter</label>
                  <Select
                    value={formData.parent_id || ''}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value || undefined, level: value ? 2 : 1 })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (root level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (root level)</SelectItem>
                      {flatFilters.filter(f => f.level <= 2).map(filter => (
                        <SelectItem key={filter.id} value={filter.id}>
                          {'  '.repeat(filter.level)} {filter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Level</label>
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Order</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={createFilter} disabled={!formData.name}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormData({ name: '', slug: '', level: 1, order_index: 0 })
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Tree */}
        <div className="space-y-1">
          {sortedFilters.map((node, i) => (
            <FilterTreeNode
              key={node.id}
              node={node}
              level={0}
              expanded={expanded}
              onToggle={toggleExpanded}
              onEdit={beginEdit}
              onDelete={deleteFilter}
              onMove={moveFilter}
              editingFilter={editingFilter}
              editForm={editForm}
              setEditForm={setEditForm}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              parentsList={flatFilters}
            />
          ))}
        </div>

        {flatFilters.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-brand-teal to-brand-orange rounded-full flex items-center justify-center opacity-50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No filters found</p>
            <p className="text-xs mt-1">Create your first filter to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface FilterTreeNodeProps {
  node: Filter
  level: number
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
  onEdit: (f: Filter, level: number) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  editingFilter: string | null
  editForm: FilterFormData | null
  setEditForm: (f: FilterFormData | null) => void
  saveEdit: (id: string) => void
  cancelEdit: () => void
  parentsList: Filter[]
}

function FilterTreeNode({
  node,
  level,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onMove,
  editingFilter,
  editForm,
  setEditForm,
  saveEdit,
  cancelEdit,
  parentsList,
}: FilterTreeNodeProps) {
  const isExpanded = expanded[node.id] ?? true
  const hasChildren = !!(node.children && node.children.length)
  const padding = { paddingLeft: `${level * 20 + 12}px` }
  const descendantIds = useMemo(() => getDescendantIdsLocal(node), [node])

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex items-center justify-between" style={padding}>
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => onToggle(node.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {editingFilter === node.id ? (
            <div className="grid grid-cols-6 gap-2 items-center">
              <Input
                value={editForm?.name || ''}
                onChange={(e) => setEditForm({ ...(editForm as any), name: e.target.value })}
                placeholder="Name"
              />
              <Input
                value={editForm?.slug || ''}
                onChange={(e) => setEditForm({ ...(editForm as any), slug: e.target.value })}
                placeholder="Slug"
              />
              <Select
                value={editForm?.parent_id || ''}
                onValueChange={(v) => setEditForm({ ...(editForm as any), parent_id: v || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (root)</SelectItem>
                  {parentsList
                    .filter(p => p.id !== node.id && !descendantIds.has(p.id))
                    .map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {'  '.repeat((p as any).level ?? 0)} {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                value={editForm?.order_index ?? 0}
                onChange={(e) => setEditForm({ ...(editForm as any), order_index: parseInt(e.target.value) })}
                placeholder="Order"
              />
              <Input
                value={editForm?.description || ''}
                onChange={(e) => setEditForm({ ...(editForm as any), description: e.target.value })}
                placeholder="Description"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={() => saveEdit(node.id)}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => cancelEdit()}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.name}</span>
              <Badge variant="outline" className="text-xs">Level {level}</Badge>
              {typeof node.articleCount === 'number' && (
                <Badge variant="secondary" className="text-xs">{node.articleCount} articles</Badge>
              )}
            </div>
          )}
        </div>
        {editingFilter === node.id ? null : (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onMove(node.id, 'up')}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onMove(node.id, 'down')}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(node, level)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => onDelete(node.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="space-y-1 mt-2">
          {node.children!.map(child => (
            <FilterTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              editingFilter={editingFilter}
              editForm={editForm}
              setEditForm={setEditForm}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              parentsList={parentsList}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Local util to compute descendants for exclusion in parent select
function getDescendantIdsLocal(node: Filter): Set<string> {
  const ids = new Set<string>()
  const walk = (n?: Filter) => {
    if (!n || !n.children) return
    n.children.forEach(c => {
      ids.add(c.id)
      walk(c)
    })
  }
  walk(node)
  return ids
}