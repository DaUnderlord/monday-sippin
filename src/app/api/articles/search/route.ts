import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/database'

// GET /api/articles/search - Search articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const articles = await searchService.searchArticles(query.trim(), limit)

    return NextResponse.json({ 
      data: articles,
      query: query.trim(),
      count: articles.length 
    })
  } catch (error) {
    console.error('Error in GET /api/articles/search:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}