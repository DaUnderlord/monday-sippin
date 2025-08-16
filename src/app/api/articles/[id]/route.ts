import { NextRequest, NextResponse } from 'next/server'
import { articleService } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { indexArticle, removeArticleFromIndex } from '@/lib/search-indexing'
import type { ArticleFormData } from '@/types'

// GET /api/articles/[id] - Get single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(tag:tags(*)),
        filters:article_filters(filter:filters(*))
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Error in GET /api/articles/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile and article to check permissions
    const [profileResult, articleResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single(),
      supabase
        .from('articles')
        .select('author_id')
        .eq('id', params.id)
        .single()
    ])

    if (!profileResult.data || !articleResult.data) {
      return NextResponse.json(
        { error: 'Article not found or access denied' },
        { status: 404 }
      )
    }

    const { role } = profileResult.data
    const { author_id } = articleResult.data

    // Check permissions: admin/editor can edit any article, author can edit their own
    const canEdit = ['admin', 'editor'].includes(role) || 
                   (role === 'author' && author_id === user.id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const updates: Partial<ArticleFormData> = await request.json()
    const article = await articleService.updateArticle(params.id, updates)

    // Update search index
    try {
      if (article.status === 'published') {
        await indexArticle(article.id)
      } else {
        // Remove from index if not published
        await removeArticleFromIndex(article.id)
      }
    } catch (indexError) {
      console.error('Failed to update search index:', indexError)
      // Don't fail the request if indexing fails
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Error in PUT /api/articles/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile and article to check permissions
    const [profileResult, articleResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single(),
      supabase
        .from('articles')
        .select('author_id')
        .eq('id', params.id)
        .single()
    ])

    if (!profileResult.data || !articleResult.data) {
      return NextResponse.json(
        { error: 'Article not found or access denied' },
        { status: 404 }
      )
    }

    const { role } = profileResult.data
    const { author_id } = articleResult.data

    // Check permissions: admin/editor can delete any article, author can delete their own
    const canDelete = ['admin', 'editor'].includes(role) || 
                     (role === 'author' && author_id === user.id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await articleService.deleteArticle(params.id)

    // Remove from search index
    try {
      await removeArticleFromIndex(params.id)
    } catch (indexError) {
      console.error('Failed to remove from search index:', indexError)
      // Don't fail the request if index removal fails
    }

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/articles/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}