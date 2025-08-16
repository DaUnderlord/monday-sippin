import { Metadata } from 'next'
import { CategoriesGrid } from '@/components/categories/CategoriesGrid'
import { CategoriesHero } from '@/components/categories/CategoriesHero'
import { categoryService } from '@/lib/database'

export const metadata: Metadata = {
  title: 'Categories - Monday Sippin\'',
  description: 'Explore our diverse range of topics and find articles that match your interests',
}

export default async function CategoriesPage() {
  // Prefetch on the server so the client component can render immediately without skeleton
  let categories = [] as any[]
  try {
    categories = await categoryService.getAllCategories()
  } catch (e) {
    // Non-fatal; the grid will handle fallback mocks if necessary
    console.warn('[CategoriesPage] failed to prefetch categories on server', e)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <CategoriesHero />
      <CategoriesGrid initialCategories={categories as any} />
    </div>
  )
}