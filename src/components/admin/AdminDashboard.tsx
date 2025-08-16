'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Eye, 
  TrendingUp, 
  Mail, 
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { AnalyticsOverview } from './AnalyticsOverview'
import { QuickActions } from './QuickActions'
import { UserManagement } from './UserManagement'
import { ContentModeration } from './ContentModeration'
import { SystemStatus } from './SystemStatus'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import dynamic from 'next/dynamic'
import type { Article } from '@/types'

// Dynamically import ArticleForm to avoid SSR/hydration issues
const ArticleForm = dynamic(() => import('@/components/forms/ArticleForm').then(mod => ({ default: mod.ArticleForm })), {
  ssr: false,
  loading: () => (
    <div className="py-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    </div>
  )
})

export function AdminDashboard({ initialTab }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview')
  const { 
    stats, 
    recentActivity, 
    systemHealth, 
    isLoading 
  } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your Monday Sippin' publication</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newUsersThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedArticles || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.viewsThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newSubscribersThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {systemHealth?.database ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Database</span>
              <Badge variant={systemHealth?.database ? 'default' : 'destructive'}>
                {systemHealth?.database ? 'Healthy' : 'Error'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {systemHealth?.storage ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Storage</span>
              <Badge variant={systemHealth?.storage ? 'default' : 'destructive'}>
                {systemHealth?.storage ? 'Healthy' : 'Error'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {systemHealth?.email ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Email Service</span>
              <Badge variant={systemHealth?.email ? 'default' : 'destructive'}>
                {systemHealth?.email ? 'Healthy' : 'Error'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-600">{activity.timestamp}</span>
                      <span>{activity.description}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* Write Tab: Inline Article Editor */}
        <TabsContent value="write">
          <Card>
            <CardHeader>
              <CardTitle>Write a New Article</CardTitle>
              <CardDescription>Create and publish content from the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleForm onSave={(article: Article) => {
                // Article saved successfully. Rely on form's internal navigation/toast.
                // Optionally, return to Overview tab.
                setActiveTab('overview')
              }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsOverview />
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}