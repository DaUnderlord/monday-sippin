import { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Monday Sippin\'',
  description: 'Administrative dashboard for Monday Sippin\' publication',
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const tabParam = sp?.tab
  const initialTab = Array.isArray(tabParam) ? tabParam[0] : tabParam
  return (
    // Client-side guard handles access; render directly
    <AdminDashboard initialTab={initialTab} />
  )
}