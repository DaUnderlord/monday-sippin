'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Article, ArticleStatus } from '@/types'

export function useContentModeration() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, full_name, email),
          category:categories(id, name, slug)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateArticleStatus = async (articleId: string, status: ArticleStatus) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      // Set published_at when publishing
      if (status === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', articleId)

      if (error) throw error

      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              status, 
              updated_at: updateData.updated_at,
              published_at: updateData.published_at || article.published_at
            }
          : article
      ))

      return { success: true }
    } catch (error) {
      console.error('Error updating article status:', error)
      throw error
    }
  }

  const deleteArticles = async (articleIds: string[]) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', articleIds)

      if (error) throw error

      // Update local state
      setArticles(prev => prev.filter(article => !articleIds.includes(article.id)))

      return { success: true }
    } catch (error) {
      console.error('Error deleting articles:', error)
      throw error
    }
  }

  const exportArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          title,
          slug,
          status,
          view_count,
          reading_time,
          published_at,
          created_at,
          author:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Convert to CSV
      const headers = [
        'Title', 
        'Slug', 
        'Status', 
        'Views', 
        'Reading Time', 
        'Author', 
        'Published At', 
        'Created At'
      ]
      
      const csvContent = [
        headers.join(','),
        ...(data || []).map(article => [
          `"${article.title.replace(/"/g, '""')}"`, // Escape quotes in title
          article.slug,
          article.status,
          article.view_count,
          article.reading_time,
          article.author?.full_name || 'Unknown',
          article.published_at ? new Date(article.published_at).toLocaleDateString() : '',
          new Date(article.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `articles-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error('Error exporting articles:', error)
      throw error
    }
  }

  const getContentStats = () => {
    const statusStats = articles.reduce((acc, article) => {
      acc[article.status] = (acc[article.status] || 0) + 1
      return acc
    }, {} as Record<ArticleStatus, number>)

    const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0)
    const averageReadingTime = articles.length > 0 
      ? articles.reduce((sum, article) => sum + (article.reading_time || 0), 0) / articles.length
      : 0

    const recentArticles = articles.filter(article => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return new Date(article.created_at) > sevenDaysAgo
    }).length

    return {
      total: articles.length,
      byStatus: statusStats,
      totalViews,
      averageReadingTime: Math.round(averageReadingTime),
      recentArticles
    }
  }

  const getModerationQueue = () => {
    // Articles that might need moderation attention
    return articles.filter(article => {
      // Draft articles older than 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      return (
        article.status === 'draft' && 
        new Date(article.created_at) < sevenDaysAgo
      ) || (
        // Articles with high view counts but no recent updates
        article.view_count > 1000 &&
        new Date(article.updated_at) < sevenDaysAgo
      )
    })
  }

  return {
    articles,
    isLoading,
    updateArticleStatus,
    deleteArticles,
    exportArticles,
    getContentStats,
    getModerationQueue,
    refetch: fetchArticles
  }
}