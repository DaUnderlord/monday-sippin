import { Metadata } from 'next'
import { AnalyticsOverview } from '@/components/admin/AnalyticsOverview'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Analytics - Monday Sippin\'',
  description: 'Detailed analytics and insights',
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'editor']}>
      <div className="container mx-auto px-4 py-8">
        <AnalyticsOverview />
      </div>
    </ProtectedRoute>
  )
}