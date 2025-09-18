'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Users, 
  FileText, 
  Settings, 
  Mail,
  BarChart3,
  Filter,
  Tags
} from 'lucide-react'
import Link from 'next/link'

interface QuickActionsProps {
  onTabChange?: (tab: string) => void
}

export function QuickActions({ onTabChange }: QuickActionsProps) {
  const actions = [
    {
      title: 'Create Article',
      description: 'Write a new article',
      icon: Plus,
      action: () => onTabChange?.('write'),
      variant: 'default' as const
    },
    {
      title: 'Manage Users',
      description: 'View and edit user accounts',
      icon: Users,
      href: '/admin/users',
      variant: 'outline' as const
    },
    {
      title: 'View Articles',
      description: 'Manage published content',
      icon: FileText,
      href: '/admin/articles',
      variant: 'outline' as const
    },
    {
      title: 'Manage Categories',
      description: 'Create and organize categories',
      icon: Tags,
      href: '/admin/categories',
      variant: 'outline' as const
    },
    {
      title: 'Manage Filters',
      description: 'Configure content filters',
      icon: Filter,
      href: '/admin/filters',
      variant: 'outline' as const
    },
    {
      title: 'Newsletter',
      description: 'Send newsletter campaign',
      icon: Mail,
      href: '/admin/newsletter',
      variant: 'outline' as const
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      variant: 'outline' as const
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            
            if (action.action) {
              // Handle tab switching actions
              return (
                <Button
                  key={action.title}
                  variant={action.variant}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={action.action}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              )
            }
            
            // Handle navigation actions
            return (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-center gap-2"
                asChild
              >
                <Link href={action.href}>
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}