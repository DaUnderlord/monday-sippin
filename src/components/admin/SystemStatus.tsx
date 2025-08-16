'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Database, 
  HardDrive, 
  Wifi, 
  Mail,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  Zap
} from 'lucide-react'
import { useSystemStatus } from '@/hooks/useSystemStatus'
import { useToast } from '@/hooks/use-toast'

export function SystemStatus() {
  const { 
    systemHealth, 
    performance, 
    storage, 
    logs,
    isLoading,
    refreshStatus 
  } = useSystemStatus()
  
  const { toast } = useToast()

  const handleRefresh = async () => {
    try {
      await refreshStatus()
      toast({
        title: 'Success',
        description: 'System status refreshed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh system status',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'}>
        {status ? 'Healthy' : 'Error'}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Status</h2>
          <p className="text-gray-600">Monitor system health and performance</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth?.database || false)}
              {getStatusBadge(systemHealth?.database || false)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Response time: {performance?.dbResponseTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth?.storage || false)}
              {getStatusBadge(systemHealth?.storage || false)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {storage?.used || 0}GB / {storage?.total || 0}GB used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Service</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth?.email || false)}
              {getStatusBadge(systemHealth?.email || false)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Queue: {performance?.emailQueue || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth?.api || false)}
              {getStatusBadge(systemHealth?.api || false)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {performance?.uptime || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-500">{performance?.cpuUsage || 0}%</span>
              </div>
              <Progress value={performance?.cpuUsage || 0} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-500">{performance?.memoryUsage || 0}%</span>
              </div>
              <Progress value={performance?.memoryUsage || 0} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-gray-500">
                  {storage?.used || 0}GB / {storage?.total || 0}GB
                </span>
              </div>
              <Progress 
                value={storage?.total ? (storage.used / storage.total) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{performance?.requestsPerMinute || 0}</div>
                <p className="text-sm text-gray-600">Requests/min</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{performance?.avgResponseTime || 0}ms</div>
                <p className="text-sm text-gray-600">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Server Status</p>
                    <p className="text-sm text-gray-500">Last restart: {performance?.lastRestart || 'Unknown'}</p>
                  </div>
                </div>
                <Badge variant="default">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Database Connections</p>
                    <p className="text-sm text-gray-500">Active: {performance?.dbConnections || 0}</p>
                  </div>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Backup Status</p>
                    <p className="text-sm text-gray-500">Last backup: {storage?.lastBackup || 'Unknown'}</p>
                  </div>
                </div>
                <Badge variant="default">Up to date</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent System Logs
          </CardTitle>
          <CardDescription>
            Latest system events and errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs?.map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-1">
                  {log.level === 'error' ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : log.level === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      log.level === 'error' ? 'destructive' : 
                      log.level === 'warning' ? 'secondary' : 
                      'default'
                    }>
                      {log.level}
                    </Badge>
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm">{log.message}</p>
                  {log.details && (
                    <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                  )}
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-sm text-center py-4">No recent logs available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}