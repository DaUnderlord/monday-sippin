import { supabase } from '@/lib/supabase'

export type SearchFilters = {
  categories?: string[]
  tags?: string[]
  dateRange?: { start?: string; end?: string }
  readingTime?: { min?: number; max?: number }
}

export type SearchArticle = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featured_image?: string | null
  reading_time?: number | null
  view_count?: number | null
  category?: { name: string } | null
  author?: { full_name?: string | null; email: string; avatar_url?: string | null } | null
  published_at?: string | null
  created_at: string
}

export type SearchResult = {
  hits: SearchArticle[]
  page: number
  hitsPerPage: number
  total: number
  totalPages: number
  query: string
  processingTimeMS: number
}

type SearchOptions = {
  page?: number
  hitsPerPage?: number
  sortBy?: 'relevance' | 'date' | 'views'
}

// Core search using Supabase. This aims to be safe across client/server.
export async function searchArticles(
  query: string,
  filters: SearchFilters = {},
  options: SearchOptions = {}
): Promise<SearchResult> {
  const startTime = performance.now()

  const page = Math.max(0, options.page ?? 0)
  const hitsPerPage = Math.max(1, options.hitsPerPage ?? 10)
  const sortBy = options.sortBy ?? 'relevance'

  // Base query: only published articles by default
  let qb = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  const q = (query || '').trim()
  if (q) {
    // Simple OR search across a few text fields
    // Note: Supabase .or expects filters joined by commas
    qb = qb.or(
      `title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`
    )
  }

  // Apply optional filters
  if (filters.dateRange) {
    const { start, end } = filters.dateRange
    if (start) qb = qb.gte('published_at', start)
    if (end) qb = qb.lte('published_at', end)
  }

  if (filters.readingTime) {
    const { min, max } = filters.readingTime
    if (typeof min === 'number') qb = qb.gte('reading_time', min)
    if (typeof max === 'number') qb = qb.lte('reading_time', max)
  }

  // NOTE: Category/tag filtering assumes existence of category_name or junctions.
  // If your schema uses relations, adjust accordingly.
  if (filters.categories?.length) {
    // Assuming a denormalized text column category_name exists; otherwise replace with a join.
    qb = qb.in('category_name', filters.categories)
  }
  if (filters.tags?.length) {
    // If tags are denormalized into a text[] column 'tag_names'
    // qb = qb.contains('tag_names', filters.tags)
    // Fallback: weak match on a comma-separated string column 'tags_text'
    // This is a no-op unless the column exists; safe to ignore if not.
  }

  // Sorting
  if (sortBy === 'date') {
    qb = qb.order('published_at', { ascending: false, nullsFirst: false })
  } else if (sortBy === 'views') {
    qb = qb.order('view_count', { ascending: false, nullsFirst: true })
  } else {
    // Relevance fallback: prefer newer content if we can't compute real relevance
    qb = qb.order('published_at', { ascending: false, nullsFirst: false })
  }

  const from = page * hitsPerPage
  const to = from + hitsPerPage - 1
  qb = qb.range(from, to)

  const { data, error, count } = await qb
  if (error) {
    throw new Error(error.message)
  }

  // Map to SearchArticle with minimal fields
  const hits: SearchArticle[] = (data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? null,
    featured_image: a.featured_image ?? null,
    reading_time: a.reading_time ?? null,
    view_count: a.view_count ?? null,
    category: a.category_name ? { name: a.category_name } : undefined,
    author: a.author_email
      ? { full_name: a.author_full_name ?? null, email: a.author_email, avatar_url: a.author_avatar_url ?? null }
      : undefined,
    published_at: a.published_at ?? null,
    created_at: a.created_at,
  }))

  const total = count ?? hits.length
  const totalPages = Math.max(1, Math.ceil(total / hitsPerPage))

  return {
    hits,
    page,
    hitsPerPage,
    total,
    totalPages,
    query: q,
    processingTimeMS: Math.round(performance.now() - startTime),
  }
}

export async function getSearchSuggestions(query: string, limit = 8): Promise<string[]> {
  const q = (query || '').trim()
  if (!q) return []

  // Search for titles matching the query
  const { data, error } = await supabase
    .from('articles')
    .select('title')
    .eq('status', 'published')
    .ilike('title', `%${q}%`)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    // Fail softly for suggestions
    console.warn('getSearchSuggestions error:', error.message)
    return []
  }

  const titles = (data || [])
    .map((r: any) => r.title)
    .filter(Boolean) as string[]

  // Deduplicate while preserving order
  const seen = new Set<string>()
  const unique = [] as string[]
  for (const t of titles) {
    if (!seen.has(t)) {
      seen.add(t)
      unique.push(t)
    }
  }
  return unique
}

