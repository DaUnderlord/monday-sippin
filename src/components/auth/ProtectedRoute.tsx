'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = ['admin', 'editor', 'author', 'reader'],
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // User is not authenticated, redirect to login
      const currentPath = window.location.pathname
      router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`)
    } else if (!isLoading && user && !requiredRoles.includes(user.role)) {
      // User doesn't have required role, redirect to unauthorized
      router.push('/unauthorized')
    }
  }, [user, isLoading, requiredRoles, router])

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  // Show nothing if user is not authenticated or doesn't have required role
  if (!user || !requiredRoles.includes(user.role)) {
    return null
  }

  // User is authenticated and has required role
  return <>{children}</>
}

// Convenience components for specific roles
export function AdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function EditorRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'editor']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function AuthorRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'editor', 'author']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}