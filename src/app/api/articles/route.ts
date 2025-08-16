import { NextRequest, NextResponse } from 'next/server'
import { articleService } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { indexArticle } from '@/lib/search-indexing'
import type { ArticleFormData, Article } from '@/types'
import { mockAllArticles } from '@/lib/mock-content'

// GET /api/articles - List articles with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = (searchParams.get('status') || 'published').toLowerCase()
    const categoryId = searchParams.get('category_id') || undefined
    const authorId = searchParams.get('author_id') || undefined
    // tag_id and filter_id are ignored in mock fallback as mocks don't include them meaningfully

    // TODO: Implement real DB fetch when articles table is populated.
    // For now, use mock fallback with filtering and pagination.
    let list: Article[] = [...mockAllArticles]

    // Filter by status if present
    if (status) {
      list = list.filter(a => (a.status || 'published').toLowerCase() === status)
    }
    // Filter by category
    if (categoryId) {
      list = list.filter(a => a.category?.id === categoryId || (a as any).category_id === categoryId)
    }
    // Filter by author
    if (authorId) {
      list = list.filter(a => a.author?.id === authorId || a.author_id === authorId)
    }

    // Sort by published_at desc (fallback to created_at)
    list.sort((a, b) => (b.published_at || b.created_at || '').localeCompare(a.published_at || a.created_at || ''))

    const count = list.length
    const start = (page - 1) * limit
    const end = start + limit
    const data = list.slice(start, end)

    return NextResponse.json({
      data,
      count,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit))
    })
  } catch (error) {
    console.error('Error in GET /api/articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'editor', 'author'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const articleData: ArticleFormData = await request.json()

    // Validate required fields
    if (!articleData.title || !articleData.slug || !articleData.content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    const article = await articleService.createArticle(articleData, user.id)

    // Index article in Algolia if published
    if (article.status === 'published') {
      try {
        await indexArticle(article.id)
      } catch (indexError) {
        console.error('Failed to index article:', indexError)
        // Don't fail the request if indexing fails
      }
    }

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/articles:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}