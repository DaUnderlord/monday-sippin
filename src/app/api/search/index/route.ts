import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/database-search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '0')
    const hitsPerPage = parseInt(searchParams.get('hitsPerPage') || '10')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    
    // Parse filters
    const filters: any = {}
    
    const categories = searchParams.get('categories')
    if (categories) {
      filters.categories = categories.split(',')
    }
    
    const tags = searchParams.get('tags')
    if (tags) {
      filters.tags = tags.split(',')
    }
    
    const filterTypes = searchParams.get('filters')
    if (filterTypes) {
      filters.filters = filterTypes.split(',')
    }
    
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')
    if (dateStart || dateEnd) {
      filters.dateRange = {}
      if (dateStart) filters.dateRange.start = dateStart
      if (dateEnd) filters.dateRange.end = dateEnd
    }
    
    const readingTimeMin = searchParams.get('readingTimeMin')
    const readingTimeMax = searchParams.get('readingTimeMax')
    if (readingTimeMin || readingTimeMax) {
      filters.readingTime = {}
      if (readingTimeMin) filters.readingTime.min = parseInt(readingTimeMin)
      if (readingTimeMax) filters.readingTime.max = parseInt(readingTimeMax)
    }
    
    // Perform search
    const results = await searchArticles(query, filters, {
      page,
      hitsPerPage,
      sortBy
    })
    
    return NextResponse.json(results)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query = '', filters = {}, options = {} } = body
    
    // Perform search
    const results = await searchArticles(query, filters, options)
    
    return NextResponse.json(results)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}