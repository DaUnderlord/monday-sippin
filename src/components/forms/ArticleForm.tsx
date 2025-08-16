'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { storageService } from '@/lib/storage'
import { useArticleMutations } from '@/hooks/useArticleMutations'
import { Article, ArticleFormData, Category, Tag, Filter, ArticleStatus } from '@/types'
import { cn, calculateReadingTime, generateSlug } from '@/lib/utils'
import { MediaPicker } from '@/components/media'
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  Hash,
  FolderOpen,
  FileText,
  Image,
  AlertCircle
} from 'lucide-react'

interface ArticleFormProps {
  article?: Article
  onSave?: (article: Article) => void
  onCancel?: () => void
}

export function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const router = useRouter()
  const { createArticle, updateArticle, creating, updating, error, clearError } = useArticleMutations()

  // Form state
  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || null,
    featured_image: article?.featured_image || '',
    category_id: article?.category_id || '',
    status: article?.status || 'draft',
    meta_title: article?.meta_title || '',
    meta_description: article?.meta_description || '',
    tags: article?.tags?.map(t => t.id) || [],
    filters: article?.filters?.map(f => f.id) || []
  })

  // Metadata state
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filters, setFilters] = useState<Filter[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>(article?.tags || [])
  const [selectedFilters, setSelectedFilters] = useState<Filter[]>(article?.filters || [])

  // UI state
  const [isUploading, setIsUploading] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [showNewTagInput, setShowNewTagInput] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load metadata on mount
  useEffect(() => {
    loadMetadata()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !article) {
      const slug = generateSlug(formData.title)
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, article])

  // Calculate reading time when content changes
  useEffect(() => {
    if (formData.content) {
      const readingTime = calculateReadingTime(formData.content)
      // Note: Reading time will be calculated on the server side during save
    }
  }, [formData.content])

  const loadMetadata = async () => {
    try {
      const [categoriesRes, tagsRes, filtersRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags'),
        fetch('/api/filters')
      ])

      const [categoriesData, tagsData, filtersData] = await Promise.all([
        categoriesRes.json(),
        tagsRes.json(),
        filtersRes.json()
      ])

      setCategories(categoriesData.data || [])
      setTags(tagsData.data || [])
      setFilters(filtersData.data || [])
    } catch (error) {
      console.error('Failed to load metadata:', error)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required'
    }

    if (!formData.content) {
      errors.content = 'Content is required'
    }

    if (formData.status === 'published' && !formData.excerpt?.trim()) {
      errors.excerpt = 'Excerpt is required for published articles'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setIsUploading(true)
      const url = await storageService.uploadImage(file, 'articles')
      return url
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const url = await handleImageUpload(file)
        setFormData(prev => ({ ...prev, featured_image: url }))
      } catch (error) {
        console.error('Failed to upload featured image:', error)
      }
    }
  }

  const handleFeaturedImageSelect = (media: any) => {
    if (media.type === 'image') {
      setFormData(prev => ({ ...prev, featured_image: media.url }))
    }
  }

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      const newSelectedTags = [...selectedTags, tag]
      setSelectedTags(newSelectedTags)
      setFormData(prev => ({ 
        ...prev, 
        tags: newSelectedTags.map(t => t.id) 
      }))
    }
  }

  const handleTagRemove = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(t => t.id !== tagId)
    setSelectedTags(newSelectedTags)
    setFormData(prev => ({ 
      ...prev, 
      tags: newSelectedTags.map(t => t.id) 
    }))
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const slug = newTagName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName, slug })
      })

      if (response.ok) {
        const { data: newTag } = await response.json()
        setTags(prev => [...prev, newTag])
        handleTagSelect(newTag)
        setNewTagName('')
        setShowNewTagInput(false)
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const handleFilterSelect = (filter: Filter) => {
    if (!selectedFilters.find(f => f.id === filter.id)) {
      const newSelectedFilters = [...selectedFilters, filter]
      setSelectedFilters(newSelectedFilters)
      setFormData(prev => ({ 
        ...prev, 
        filters: newSelectedFilters.map(f => f.id) 
      }))
    }
  }

  const handleFilterRemove = (filterId: string) => {
    const newSelectedFilters = selectedFilters.filter(f => f.id !== filterId)
    setSelectedFilters(newSelectedFilters)
    setFormData(prev => ({ 
      ...prev, 
      filters: newSelectedFilters.map(f => f.id) 
    }))
  }

  const handleSave = async (status: ArticleStatus) => {
    clearError()
    
    const updatedFormData = { ...formData, status }
    
    if (!validateForm()) {
      return
    }

    try {
      let savedArticle: Article | null = null

      if (article) {
        savedArticle = await updateArticle(article.id, updatedFormData)
      } else {
        savedArticle = await createArticle(updatedFormData)
      }

      if (savedArticle) {
        onSave?.(savedArticle)
        if (!article) {
          router.push(`/admin/articles/${savedArticle.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to save article:', error)
    }
  }

  const isLoading = creating || updating || isUploading

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {article ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="text-gray-600 mt-1">
            {article ? 'Update your article content and settings' : 'Write and publish your new article'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          
          <Button
            variant="brand"
            onClick={() => handleSave('published')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {formData.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card variant="default" className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Article Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title..."
                  className={cn(validationErrors.title && "border-red-500")}
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-url-slug"
                  className={cn(validationErrors.slug && "border-red-500")}
                />
                {validationErrors.slug && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.slug}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt {formData.status === 'published' && '*'}
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the article..."
                  rows={3}
                  className={cn(validationErrors.excerpt && "border-red-500")}
                />
                {validationErrors.excerpt && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.excerpt}</p>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <div className={cn(validationErrors.content && "border border-red-500 rounded-lg")}>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    onImageUpload={handleImageUpload}
                    placeholder="Start writing your article..."
                  />
                </div>
                {validationErrors.content && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.content}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.featured_image ? (
                <div className="space-y-3">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="flex gap-2">
                    <MediaPicker
                      onSelect={handleFeaturedImageSelect}
                      acceptedTypes={['image']}
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1">
                          Change Image
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                      className="flex-1"
                    >
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-3">Upload or select featured image</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                      id="featured-image"
                    />
                    <label htmlFor="featured-image" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full cursor-pointer">
                        Upload New
                      </Button>
                    </label>
                    
                    <MediaPicker
                      onSelect={handleFeaturedImageSelect}
                      acceptedTypes={['image']}
                      trigger={
                        <Button variant="brand" size="sm" className="flex-1">
                          Select from Library
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      <button
                        onClick={() => handleTagRemove(tag.id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag Selection */}
              <div className="space-y-2">
                <select
                  onChange={(e) => {
                    const tag = tags.find(t => t.id === e.target.value)
                    if (tag) handleTagSelect(tag)
                    e.target.value = ''
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Add existing tag...</option>
                  {tags
                    .filter(tag => !selectedTags.find(st => st.id === tag.id))
                    .map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>

                {/* New Tag Input */}
                {showNewTagInput ? (
                  <div className="flex gap-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="New tag name"
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                    />
                    <Button size="sm" onClick={handleCreateTag}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowNewTagInput(false)
                        setNewTagName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewTagInput(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Tag
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Selected Filters */}
              {selectedFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.map(filter => (
                    <Badge
                      key={filter.id}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {filter.name}
                      <button
                        onClick={() => handleFilterRemove(filter.id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Filter Selection */}
              <select
                onChange={(e) => {
                  const filter = filters.find(f => f.id === e.target.value)
                  if (filter) handleFilterSelect(filter)
                  e.target.value = ''
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Add filter...</option>
                {filters
                  .filter(filter => !selectedFilters.find(sf => sf.id === filter.id))
                  .map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {'  '.repeat(filter.level - 1)}{filter.name}
                    </option>
                  ))}
              </select>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}