'use client'

import dynamic from 'next/dynamic'
import { Article } from '@/types'

// Dynamically import ArticleForm to avoid SSR issues
const ArticleForm = dynamic(() => import('@/components/forms/ArticleForm').then(mod => ({ default: mod.ArticleForm })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
})

export default function TestArticleFormPage() {
  const handleSave = (article: Article) => {
    console.log('Article saved:', article)
    alert('Article saved successfully!')
  }

  const handleCancel = () => {
    console.log('Article creation cancelled')
    alert('Article creation cancelled')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ArticleForm 
        onSave={handleSave} 
        onCancel={handleCancel}
      />
    </div>
  )
}