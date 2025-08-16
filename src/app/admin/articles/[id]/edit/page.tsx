'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Article } from '@/types'

// Dynamically import ArticleForm to avoid SSR issues
const ArticleForm = dynamic(() => import('@/components/forms/ArticleForm').then(mod => ({ default: mod.ArticleForm })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading article editor...</p>
      </div>
    </div>
  )
})

export default function EditArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadArticle(params.id as string)
    }
  }, [params.id])

  const loadArticle = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/articles/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load article')
      }

      const { data } = await response.json()
      setArticle(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (updatedArticle: Article) => {
    setArticle(updatedArticle)
    console.log('Article updated:', updatedArticle)
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'editor', 'author']}>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'editor', 'author']}>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadArticle(params.id as string)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!article) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'editor', 'author']}>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Article not found</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'editor', 'author']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <ArticleForm article={article} onSave={handleSave} />
      </div>
    </ProtectedRoute>
  )
}