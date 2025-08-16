'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile, UserRole } from '@/types'

export function useUserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, updated_at: new Date().toISOString() }
          : user
      ))

      return { success: true }
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      // Note: This will cascade delete due to foreign key constraints
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId))

      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  const exportUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name, role, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Convert to CSV
      const headers = ['Email', 'Full Name', 'Role', 'Created At']
      const csvContent = [
        headers.join(','),
        ...(data || []).map(user => [
          user.email,
          user.full_name || '',
          user.role,
          new Date(user.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error('Error exporting users:', error)
      throw error
    }
  }

  const getUserStats = () => {
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<UserRole, number>)

    const totalUsers = users.length
    const activeUsers = users.filter(user => {
      // Consider users active if they've been created in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return new Date(user.created_at) > thirtyDaysAgo
    }).length

    return {
      total: totalUsers,
      active: activeUsers,
      byRole: roleStats
    }
  }

  return {
    users,
    isLoading,
    updateUserRole,
    deleteUser,
    exportUsers,
    getUserStats,
    refetch: fetchUsers
  }
}