'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Article } from '@/types'

interface AnalyticsData {
  totalViews: number
  viewsChange: number
  uniqueVisitors: number
  visitorsChange: number
  articlesPublished: number
  articlesChange: number
  avgReadingTime: number
  readingTimeChange: number
  bounceRate: number
  avgSessionDuration: number
  pagesPerSession: number
  trafficSources: {
    name: string
    visitors: number
    percentage: number
  }[]
}

interface ChartDataPoint {
  date: string
  views: number
  visitors: number
}

export function useAnalytics(timeRange: string = '7d') {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [topArticles, setTopArticles] = useState<Article[]>([])
  const [userGrowth, setUserGrowth] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    
    switch (timeRange) {
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
      case '90d':
        start.setDate(start.getDate() - 90)
        break
      case '1y':
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        start.setDate(start.getDate() - 7)
    }
    
    return { start, end }
  }

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const { start, end } = getDateRange()
      
      // Fetch current period data
      const [
        articlesData,
        usersData,
        topArticlesData
      ] = await Promise.all([
        fetchArticleAnalytics(start, end),
        fetchUserAnalytics(start, end),
        fetchTopArticles(start, end)
      ])

      // Fetch previous period for comparison
      const prevStart = new Date(start)
      const prevEnd = new Date(end)
      const periodLength = end.getTime() - start.getTime()
      prevStart.setTime(prevStart.getTime() - periodLength)
      prevEnd.setTime(prevEnd.getTime() - periodLength)

      const [
        prevArticlesData,
        prevUsersData
      ] = await Promise.all([
        fetchArticleAnalytics(prevStart, prevEnd),
        fetchUserAnalytics(prevStart, prevEnd)
      ])

      // Calculate analytics
      const totalViews = articlesData.reduce((sum, article) => sum + (article.view_count || 0), 0)
      const prevTotalViews = prevArticlesData.reduce((sum, article) => sum + (article.view_count || 0), 0)
      const viewsChange = prevTotalViews > 0 ? ((totalViews - prevTotalViews) / prevTotalViews) * 100 : 0

      const avgReadingTime = articlesData.length > 0 
        ? articlesData.reduce((sum, article) => sum + (article.reading_time || 0), 0) / articlesData.length
        : 0
      const prevAvgReadingTime = prevArticlesData.length > 0
        ? prevArticlesData.reduce((sum, article) => sum + (article.reading_time || 0), 0) / prevArticlesData.length
        : 0
      const readingTimeChange = prevAvgReadingTime > 0 ? ((avgReadingTime - prevAvgReadingTime) / prevAvgReadingTime) * 100 : 0

      const articlesPublished = articlesData.filter(a => a.status === 'published').length
      const prevArticlesPublished = prevArticlesData.filter(a => a.status === 'published').length
      const articlesChange = prevArticlesPublished > 0 ? ((articlesPublished - prevArticlesPublished) / prevArticlesPublished) * 100 : 0

      // Simulate some metrics that would come from analytics service
      const uniqueVisitors = Math.floor(totalViews * 0.7) // Rough estimate
      const prevUniqueVisitors = Math.floor(prevTotalViews * 0.7)
      const visitorsChange = prevUniqueVisitors > 0 ? ((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100 : 0

      setAnalytics({
        totalViews,
        viewsChange: Math.round(viewsChange * 100) / 100,
        uniqueVisitors,
        visitorsChange: Math.round(visitorsChange * 100) / 100,
        articlesPublished,
        articlesChange: Math.round(articlesChange * 100) / 100,
        avgReadingTime: Math.round(avgReadingTime),
        readingTimeChange: Math.round(readingTimeChange * 100) / 100,
        bounceRate: 45, // Placeholder
        avgSessionDuration: 3.5, // Placeholder
        pagesPerSession: 2.1, // Placeholder
        trafficSources: [
          { name: 'Direct', visitors: Math.floor(uniqueVisitors * 0.4), percentage: 40 },
          { name: 'Search', visitors: Math.floor(uniqueVisitors * 0.35), percentage: 35 },
          { name: 'Social', visitors: Math.floor(uniqueVisitors * 0.15), percentage: 15 },
          { name: 'Referral', visitors: Math.floor(uniqueVisitors * 0.1), percentage: 10 }
        ]
      })

      setTopArticles(topArticlesData)
      
      // Generate chart data (simplified)
      const chartPoints: ChartDataPoint[] = []
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      for (let i = 0; i < days; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        
        chartPoints.push({
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 100) + 50, // Placeholder data
          visitors: Math.floor(Math.random() * 70) + 30 // Placeholder data
        })
      }
      
      setChartData(chartPoints)

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchArticleAnalytics = async (start: Date, end: Date) => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, view_count, reading_time, status, created_at, published_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (error) throw error
    return data || []
  }

  const fetchUserAnalytics = async (start: Date, end: Date) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (error) throw error
    return data || []
  }

  const fetchTopArticles = async (start: Date, end: Date) => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, view_count, slug')
      .eq('status', 'published')
      .gte('published_at', start.toISOString())
      .lte('published_at', end.toISOString())
      .order('view_count', { ascending: false })
      .limit(5)

    if (error) throw error
    return data || []
  }

  const exportAnalytics = async () => {
    try {
      if (!analytics) return

      const { start, end } = getDateRange()
      
      // Get detailed data for export
      const { data: detailedArticles } = await supabase
        .from('articles')
        .select(`
          title,
          slug,
          view_count,
          reading_time,
          status,
          published_at,
          author:profiles(full_name)
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('view_count', { ascending: false })

      // Create CSV content
      const headers = [
        'Period',
        'Total Views',
        'Unique Visitors',
        'Articles Published',
        'Avg Reading Time',
        'Bounce Rate',
        'Avg Session Duration',
        'Pages per Session'
      ]

      const summaryData = [
        `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        analytics.totalViews,
        analytics.uniqueVisitors,
        analytics.articlesPublished,
        `${analytics.avgReadingTime}m`,
        `${analytics.bounceRate}%`,
        `${analytics.avgSessionDuration}m`,
        analytics.pagesPerSession
      ]

      let csvContent = headers.join(',') + '\n'
      csvContent += summaryData.join(',') + '\n\n'

      // Add article details
      csvContent += 'Article Details\n'
      csvContent += 'Title,Slug,Views,Reading Time,Status,Published At,Author\n'
      
      detailedArticles?.forEach(article => {
        csvContent += [
          `"${article.title.replace(/"/g, '""')}"`,
          article.slug,
          article.view_count,
          article.reading_time,
          article.status,
          article.published_at ? new Date(article.published_at).toLocaleDateString() : '',
          article.author?.full_name || 'Unknown'
        ].join(',') + '\n'
      })

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error exporting analytics:', error)
      throw error
    }
  }

  return {
    analytics,
    chartData,
    topArticles,
    userGrowth,
    isLoading,
    exportAnalytics,
    refetch: fetchAnalytics
  }
}