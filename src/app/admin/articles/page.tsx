import { Metadata } from 'next'
import { ContentModeration } from '@/components/admin/ContentModeration'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Article Management - Monday Sippin\'',
  description: 'Manage and moderate articles',
}

export default function ArticlesPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'editor']}>
      <div className="container mx-auto px-4 py-8">
        <ContentModeration />
      </div>
    </ProtectedRoute>
  )
}