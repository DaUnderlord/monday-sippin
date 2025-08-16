import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { playSpecSchema } from '@/lib/schemas/visualize'

const createSchema = z.object({
  articleId: z.string().uuid().optional(),
  symbol: z.string(),
  timeframe: z.string(),
  bias: z.enum(['bullish','bearish','neutral']).default('neutral'),
  strategy: z.any(), // should conform to playSpecSchema but we store a subset under strategy
  isPublic: z.boolean().optional(),
  extractedFromAi: z.boolean().optional(),
})

// List current user's setups (basic pagination)
export async function GET(req: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await supabase
      .from('play_setups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({ data: data ?? [], page, limit })
  } catch (err) {
    console.error('[GET /api/play-setups] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a setup for current user
export async function POST(req: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const payload = parsed.data

    const { data, error } = await supabase
      .from('play_setups')
      .insert({
        article_id: payload.articleId ?? null,
        user_id: user.id,
        symbol: payload.symbol,
        timeframe: payload.timeframe,
        bias: payload.bias,
        strategy: payload.strategy,
        is_public: payload.isPublic ?? false,
        extracted_from_ai: payload.extractedFromAi ?? true,
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/play-setups] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
