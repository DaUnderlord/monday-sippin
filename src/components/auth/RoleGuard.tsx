'use client'

import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
  showFallback?: boolean
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null,
  showFallback = false 
}: RoleGuardProps) {
  const { user, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return showFallback ? fallback : null
  }

  // User not authenticated
  if (!user) {
    return showFallback ? fallback : null
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return showFallback ? fallback : null
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  )
}

export function EditorAndAbove({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'editor']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  )
}

export function AuthorAndAbove({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'editor', 'author']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  )
}

export function AuthenticatedOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'editor', 'author', 'reader']} fallback={fallback} showFallback={!!fallback}>
      {children}
    </RoleGuard>
  )
}