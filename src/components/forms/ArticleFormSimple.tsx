'use client'

import { useState } from 'react'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Article, ArticleFormData, ArticleStatus } from '@/types'
import { useArticleMutations } from '@/hooks/useArticleMutations'
import { storageService } from '@/lib/storage'

interface ArticleFormSimpleProps {
  article?: Article
  onSave?: (article: Article) => void
  onCancel?: () => void
}

export function ArticleFormSimple({ article, onSave, onCancel }: ArticleFormSimpleProps) {
  const { createArticle, updateArticle, creating, updating, error } = useArticleMutations()

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

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const url = await storageService.uploadImage(file, 'articles')
      return url
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  const handleSave = async (status: ArticleStatus) => {
    const updatedFormData = { ...formData, status }
    
    try {
      let savedArticle: Article | null = null

      if (article) {
        savedArticle = await updateArticle(article.id, updatedFormData)
      } else {
        savedArticle = await createArticle(updatedFormData)
      }

      if (savedArticle) {
        onSave?.(savedArticle)
      }
    } catch (error) {
      console.error('Failed to save article:', error)
    }
  }

  const isLoading = creating || updating

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {article ? 'Edit Article' : 'Create New Article'}
        </h1>
        
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
          >
            Save Draft
          </Button>
          
          <Button
            variant="brand"
            onClick={() => handleSave('published')}
            disabled={isLoading}
          >
            Publish
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Article Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter article title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="article-url-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief description of the article..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              onImageUpload={handleImageUpload}
              placeholder="Start writing your article..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}