'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminOnly, EditorAndAbove, AuthorAndAbove, AuthenticatedOnly } from './RoleGuard'

export function AuthTest() {
  const { user, isLoading, signOut } = useAuth()

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">Loading authentication...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current user authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.full_name || 'Not set'}</p>
              <p><strong>Role:</strong> <Badge>{user.role}</Badge></p>
              <p><strong>ID:</strong> {user.id}</p>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p>Not authenticated</p>
              <Button asChild>
                <a href="/auth/login">Sign In</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Role-Based Content</CardTitle>
          <CardDescription>Content visibility based on user roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthenticatedOnly fallback={<p className="text-gray-500">🔒 Authenticated users only</p>}>
            <p className="text-green-600">✅ You are authenticated!</p>
          </AuthenticatedOnly>

          <AuthorAndAbove fallback={<p className="text-gray-500">🔒 Authors and above only</p>}>
            <p className="text-blue-600">✅ You have author permissions or higher!</p>
          </AuthorAndAbove>

          <EditorAndAbove fallback={<p className="text-gray-500">🔒 Editors and above only</p>}>
            <p className="text-purple-600">✅ You have editor permissions or higher!</p>
          </EditorAndAbove>

          <AdminOnly fallback={<p className="text-gray-500">🔒 Admins only</p>}>
            <p className="text-red-600">✅ You have admin permissions!</p>
          </AdminOnly>
        </CardContent>
      </Card>
    </div>
  )
}