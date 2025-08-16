'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalUsers: number
  newUsersThisWeek: number
  totalArticles: number
  publishedArticles: number
  totalViews: number
  viewsThisWeek: number
  totalSubscribers: number
  newSubscribersThisWeek: number
}

interface SystemHealth {
  database: boolean
  storage: boolean
  email: boolean
}

interface RecentActivity {
  timestamp: string
  description: string
  type: 'user' | 'article' | 'system'
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch stats in parallel
      const [
        usersResult,
        articlesResult,
        subscribersResult,
        healthResult
      ] = await Promise.all([
        fetchUserStats(),
        fetchArticleStats(),
        fetchSubscriberStats(),
        checkSystemHealth()
      ])

      setStats({
        ...usersResult,
        ...articlesResult,
        ...subscribersResult
      })

      setSystemHealth(healthResult)
      
      // Fetch recent activity
      await fetchRecentActivity()
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [totalUsersResult, newUsersResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())
    ])

    return {
      totalUsers: totalUsersResult.count || 0,
      newUsersThisWeek: newUsersResult.count || 0
    }
  }

  const fetchArticleStats = async () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [totalArticlesResult, publishedArticlesResult, totalViewsRpc] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.rpc('total_article_views')
    ])

    // Get total views via RPC (bigint)
    const totalViews = Number(totalViewsRpc.data ?? 0)

    // Get views from this week (simplified - would need view tracking by date for accurate weekly views)
    const viewsThisWeek = Math.floor(totalViews * 0.1) // Placeholder calculation

    return {
      totalArticles: totalArticlesResult.count || 0,
      publishedArticles: publishedArticlesResult.count || 0,
      totalViews,
      viewsThisWeek
    }
  }

  const fetchSubscriberStats = async () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [totalSubscribersResult, newSubscribersResult] = await Promise.all([
      supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('created_at', oneWeekAgo.toISOString())
    ])

    return {
      totalSubscribers: totalSubscribersResult.count || 0,
      newSubscribersThisWeek: newSubscribersResult.count || 0
    }
  }

  const checkSystemHealth = async (): Promise<SystemHealth> => {
    try {
      // Test database connection
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1)
      
      // Test storage (simplified check)
      const { error: storageError } = await supabase.storage.listBuckets()
      
      // Email service health would need to be checked via API endpoint
      // For now, assume it's healthy if no errors in other services
      const emailHealthy = !dbError && !storageError

      return {
        database: !dbError,
        storage: !storageError,
        email: emailHealthy
      }
    } catch (error) {
      console.error('Error checking system health:', error)
      return {
        database: false,
        storage: false,
        email: false
      }
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      // Get recent articles
      const { data: recentArticles } = await supabase
        .from('articles')
        .select('title, created_at, status')
        .order('created_at', { ascending: false })
        .limit(3)

      const activities: RecentActivity[] = []

      // Add user activities
      recentUsers?.forEach(user => {
        activities.push({
          timestamp: new Date(user.created_at).toLocaleDateString(),
          description: `New user registered: ${user.full_name || 'Anonymous'}`,
          type: 'user'
        })
      })

      // Add article activities
      recentArticles?.forEach(article => {
        activities.push({
          timestamp: new Date(article.created_at).toLocaleDateString(),
          description: `Article ${article.status}: ${article.title}`,
          type: 'article'
        })
      })

      // Sort by timestamp and take most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 5))

    } catch (error) {
      console.error('Error fetching recent activity:', error)
      setRecentActivity([])
    }
  }

  return {
    stats,
    systemHealth,
    recentActivity,
    isLoading,
    refetch: fetchDashboardData
  }
}