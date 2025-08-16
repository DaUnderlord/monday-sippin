import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/articles/related - Get related articles based on category, tags, and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    const exclude = searchParams.get('exclude') // Article ID to exclude
    const categoryId = searchParams.get('category_id')
    const tagIds = searchParams.getAll('tag_id')
    const filterIds = searchParams.getAll('filter_id')

    if (!exclude) {
      return NextResponse.json(
        { error: 'Article ID to exclude is required' },
        { status: 400 }
      )
    }

    // Strategy: Find articles with similar attributes, prioritizing by relevance
    let relatedArticles: any[] = []

    // 1. First try to find articles in the same category
    if (categoryId && relatedArticles.length < limit) {
      const { data: categoryArticles } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:categories(*),
          tags:article_tags(tag:tags(*)),
          filters:article_filters(filter:filters(*))
        `)
        .eq('status', 'published')
        .eq('category_id', categoryId)
        .neq('id', exclude)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (categoryArticles) {
        relatedArticles = [...relatedArticles, ...categoryArticles]
      }
    }

    // 2. If we still need more articles, find by shared tags
    if (tagIds.length > 0 && relatedArticles.length < limit) {
      const remainingLimit = limit - relatedArticles.length
      const existingIds = relatedArticles.map(a => a.id)

      const { data: tagArticles } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:categories(*),
          tags:article_tags!inner(tag:tags(*)),
          filters:article_filters(filter:filters(*))
        `)
        .eq('status', 'published')
        .in('tags.tag_id', tagIds)
        .neq('id', exclude)
        .not('id', 'in', `(${existingIds.join(',')})`)
        .order('published_at', { ascending: false })
        .limit(remainingLimit)

      if (tagArticles) {
        relatedArticles = [...relatedArticles, ...tagArticles]
      }
    }

    // 3. If we still need more articles, find by shared filters
    if (filterIds.length > 0 && relatedArticles.length < limit) {
      const remainingLimit = limit - relatedArticles.length
      const existingIds = relatedArticles.map(a => a.id)

      const { data: filterArticles } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:categories(*),
          tags:article_tags(tag:tags(*)),
          filters:article_filters!inner(filter:filters(*))
        `)
        .eq('status', 'published')
        .in('filters.filter_id', filterIds)
        .neq('id', exclude)
        .not('id', 'in', `(${existingIds.join(',')})`)
        .order('published_at', { ascending: false })
        .limit(remainingLimit)

      if (filterArticles) {
        relatedArticles = [...relatedArticles, ...filterArticles]
      }
    }

    // 4. If we still need more articles, get recent articles
    if (relatedArticles.length < limit) {
      const remainingLimit = limit - relatedArticles.length
      const existingIds = relatedArticles.map(a => a.id)

      const { data: recentArticles } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:categories(*),
          tags:article_tags(tag:tags(*)),
          filters:article_filters(filter:filters(*))
        `)
        .eq('status', 'published')
        .neq('id', exclude)
        .not('id', 'in', `(${existingIds.join(',')})`)
        .order('published_at', { ascending: false })
        .limit(remainingLimit)

      if (recentArticles) {
        relatedArticles = [...relatedArticles, ...recentArticles]
      }
    }

    // Remove duplicates and limit results
    const uniqueArticles = relatedArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.id === article.id)
      )
      .slice(0, limit)

    return NextResponse.json({
      data: uniqueArticles,
      count: uniqueArticles.length
    })
  } catch (error) {
    console.error('Error in GET /api/articles/related:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related articles' },
      { status: 500 }
    )
  }
}