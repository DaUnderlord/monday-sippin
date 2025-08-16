import { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Newsletter Management - Monday Sippin\'',
  description: 'Manage newsletter campaigns and subscribers',
}

export default function NewsletterPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'editor']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Management</h1>
          <p className="text-gray-600">Manage newsletter campaigns and subscribers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Newsletter Management</CardTitle>
            <CardDescription>
              Newsletter functionality will be implemented in task 13
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              This page will contain newsletter management features once task 13 is completed.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}