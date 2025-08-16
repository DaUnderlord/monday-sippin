import { useState } from 'react'
import { Article, ArticleFormData } from '@/types'

interface UseArticleMutationsReturn {
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  createArticle: (data: ArticleFormData) => Promise<Article | null>
  updateArticle: (id: string, data: Partial<ArticleFormData>) => Promise<Article | null>
  deleteArticle: (id: string) => Promise<boolean>
  clearError: () => void
}

export function useArticleMutations(): UseArticleMutationsReturn {
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createArticle = async (data: ArticleFormData): Promise<Article | null> => {
    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create article')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article')
      return null
    } finally {
      setCreating(false)
    }
  }

  const updateArticle = async (
    id: string, 
    data: Partial<ArticleFormData>
  ): Promise<Article | null> => {
    try {
      setUpdating(true)
      setError(null)

      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update article')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article')
      return null
    } finally {
      setUpdating(false)
    }
  }

  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      setDeleting(true)
      setError(null)

      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete article')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article')
      return false
    } finally {
      setDeleting(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    creating,
    updating,
    deleting,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    clearError
  }
}