import { NextRequest, NextResponse } from 'next/server'
import { filterService } from '@/lib/database'

// GET /api/filters/[id]/articles - Get articles by filter ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const additionalFilters = searchParams.getAll('filters')

    // Allow either UUID id or slug in both path param and query
    const maybeIdOrSlug = params.id
    const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

    // Resolve main
    let mainFilterId = maybeIdOrSlug
    if (!isUuid(maybeIdOrSlug)) {
      const bySlug = await filterService.getFilterBySlug(maybeIdOrSlug)
      if (!bySlug) {
        return NextResponse.json({ error: 'Filter not found' }, { status: 404 })
      }
      mainFilterId = bySlug.id
    }

    // Resolve additional filters
    const resolvedAdditional: string[] = []
    for (const f of additionalFilters) {
      if (isUuid(f)) {
        resolvedAdditional.push(f)
      } else {
        const bySlug = await filterService.getFilterBySlug(f)
        if (bySlug) resolvedAdditional.push(bySlug.id)
      }
    }

    const allFilters = [mainFilterId, ...resolvedAdditional]

    const result = await filterService.getArticlesByFilters(allFilters, page, limit)
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error in GET /api/filters/[id]/articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles by filter' },
      { status: 500 }
    )
  }
}