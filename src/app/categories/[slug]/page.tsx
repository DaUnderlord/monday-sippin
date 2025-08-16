import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryPage } from '@/components/categories/CategoryPage'
import { supabase } from '@/lib/supabase'
import { mockCategories } from '@/lib/mock-content'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    const mock = mockCategories.find(c => c.slug === slug)
    if (mock) {
      return {
        title: `${mock.name} - Monday Sippin'`,
        description: mock.description || `Explore articles in ${mock.name} category`,
      }
    }
    return { title: 'Category Not Found - Monday Sippin\'' }
  }

  return {
    title: `${category.name} - Monday Sippin'`,
    description: category.description || `Explore articles in ${category.name} category`,
  }
}

export default async function CategoryPageRoute({ params }: CategoryPageProps) {
  const { slug } = await params
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    const mock = mockCategories.find(c => c.slug === slug)
    if (!mock) {
      notFound()
    }
    return <CategoryPage category={mock!} />
  }

  return <CategoryPage category={category} />
}