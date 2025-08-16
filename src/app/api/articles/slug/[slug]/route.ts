import { NextRequest, NextResponse } from 'next/server'
import { articleService } from '@/lib/database'

// GET /api/articles/slug/[slug] - Get article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await articleService.getArticleBySlug(params.slug)

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Increment view count for published articles
    if (article.status === 'published') {
      await articleService.incrementViewCount(article.id)
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Error in GET /api/articles/slug/[slug]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}