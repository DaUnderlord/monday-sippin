import { Metadata } from 'next'
import { UserManagement } from '@/components/admin/UserManagement'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'User Management - Monday Sippin\'',
  description: 'Manage user accounts and permissions',
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <UserManagement />
      </div>
    </ProtectedRoute>
  )
}