import { Metadata } from 'next'
import { CategoriesHero } from '@/components/categories/CategoriesHero'
import { CategorySection } from '@/components/categories/CategorySection'
import { categoryService, articleService } from '@/lib/database'
import type { Category } from '@/types'

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

  // Fallback: populate mock categories if none exist so UI can be previewed
  if (!categories || categories.length === 0) {
    categories = [
      { id: 'mock-cat-1', name: 'Markets', slug: 'markets' },
      { id: 'mock-cat-2', name: 'On-Chain', slug: 'on-chain' },
      { id: 'mock-cat-3', name: 'Macro', slug: 'macro' },
    ] as any[]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <CategoriesHero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {await Promise.all(
          (categories as Category[]).map(async (category) => {
            const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

            let articles: any[] = []
            try {
              if (isUuid(category.id)) {
                articles = await articleService.getRecentArticlesByCategory(category.id, 4)
              }
            } catch (e) {
              // Swallow and fallback to mocks below
              console.warn('[CategoriesPage] failed to load recent articles for category', category.slug, e)
            }

            const ensureArticles = (articles && articles.length > 0)
              ? articles
              : Array.from({ length: 4 }).map((_, i) => ({
                  id: `mock-${category.id}-${i}`,
                  slug: `mock-${category.slug}-${i}`,
                  title: `${category.name} Insight ${i + 1}`,
                  excerpt: 'A short premium insight preview for demonstration purposes.',
                  content: '',
                  status: 'published',
                  category_id: category.id,
                  category: { ...category },
                  featured_image: undefined,
                  reading_time: 4 + i,
                  view_count: 100 + i * 37,
                  created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
                  published_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
                  author: undefined,
                  tags: [],
                  filters: []
                })) as any

            return (
              <CategorySection key={category.id} category={category} articles={ensureArticles as any} />
            )
          })
        )}
      </div>
    </div>
  )
}