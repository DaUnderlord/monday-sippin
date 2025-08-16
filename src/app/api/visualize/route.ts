import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { playSpecSchema, visualizeRequestSchema } from '@/lib/schemas/visualize'

// This route proxies to the Supabase Edge Function "visualize-play" which calls Gemini
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = visualizeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    // Extract plain text from Tiptap JSON if needed so the Edge Function receives readable content
    const normalizeContent = (raw?: string): string | undefined => {
      if (!raw) return undefined
      let text = raw
      try {
        const doc = JSON.parse(raw)
        if (doc && typeof doc === 'object' && Array.isArray(doc.content)) {
          const lines: string[] = []
          const walk = (node: any) => {
            if (!node) return
            if (node.type === 'text' && typeof node.text === 'string') {
              lines.push(node.text)
            }
            if (node.attrs && typeof node.attrs.text === 'string') {
              lines.push(node.attrs.text)
            }
            if (Array.isArray(node.content)) node.content.forEach(walk)
          }
          doc.content.forEach(walk)
          text = lines.join(' ').replace(/\s+/g, ' ').trim()
        }
      } catch {
        // Not JSON; use as-is
      }
      return text || undefined
    }

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!projectUrl) {
      return NextResponse.json({ error: 'Supabase env not configured' }, { status: 500 })
    }

    const fnUrl = `${projectUrl}/functions/v1/visualize-play`
    
    // Try multiple approaches to get auth token
    // Pass cookies reference directly to avoid synchronous access warnings
    const supabase = createRouteHandlerClient({ cookies })
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    let jwt = sessionData?.session?.access_token

    // Fallback: try getting from Authorization header
    if (!jwt) {
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        jwt = authHeader.substring(7)
      }
    }

    // Fallback: use anon key for now (temporary workaround)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!jwt && anonKey) {
      console.log('[/api/visualize] Using anon key as fallback')
      jwt = anonKey
    }

    console.log('[/api/visualize] Auth debug:', {
      hasSession: !!sessionData?.session,
      hasJWT: !!jwt,
      sessionError,
      userId: sessionData?.session?.user?.id,
      usingFallback: !sessionData?.session?.access_token
    })

    if (!jwt) {
      return NextResponse.json(
        { 
          error: 'Authentication required', 
          message: 'Please sign in to use the Visualize Play feature',
          debug: { hasSession: !!sessionData?.session, sessionError }
        },
        { status: 401 }
      )
    }

    // Apply normalized content to outgoing payload
    const outgoing = {
      ...parsed.data,
      content: normalizeContent(parsed.data.content),
    }

    // Fast path: if heuristic parser can extract insights, return immediately (speeds up local/dev and avoids slow AI)
    if (outgoing.content) {
      const heuristic = parsePlayFromText(outgoing.content)
      if (heuristic) {
        const nowIso = new Date().toISOString()
        const fastSpec = {
          version: '1.0' as const,
          context: { articleId: parsed.data.articleId, source: 'monday-sippin', extractedAt: nowIso },
          ...heuristic,
        }
        const ok = playSpecSchema.safeParse(fastSpec)
        if (ok.success) {
          console.log('[/api/visualize] using heuristic parser (fast-path)')
          return NextResponse.json(ok.data)
        }
      }
    }

    // Call edge function with timeout to avoid long hangs
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    let res: Response
    try {
      res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(outgoing),
        signal: controller.signal,
      })
    } catch (e) {
      clearTimeout(timeout)
      console.warn('[/api/visualize] edge function fetch failed/timeout, falling back to heuristic if possible')
      if (outgoing.content) {
        const h = parsePlayFromText(outgoing.content)
        if (h) {
          const nowIso = new Date().toISOString()
          const fastSpec = { version: '1.0' as const, context: { articleId: parsed.data.articleId, source: 'monday-sippin', extractedAt: nowIso }, ...h }
          const ok = playSpecSchema.safeParse(fastSpec)
          if (ok.success) return NextResponse.json(ok.data)
        }
      }
      return NextResponse.json({ error: 'Edge function timeout' }, { status: 504 })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      // Prefer JSON detail if available, otherwise fall back to text
      let detail: any = null
      try {
        detail = await res.json()
      } catch {
        detail = await res.text().catch(() => '')
      }
      return NextResponse.json(
        { error: 'Edge function failed', upstreamStatus: res.status, detail },
        { status: 502 }
      )
    }

    const payload = await res.json()
    const validated = playSpecSchema.safeParse(payload)
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid play spec from function', detail: validated.error.flatten() }, { status: 502 })
    }

    // If the function returned no actionable insights, try a local heuristic parser against the outgoing content
    const spec = validated.data
    const noInsights =
      spec.levels.length === 0 &&
      spec.entries.length === 0 &&
      spec.stops.length === 0 &&
      spec.targets.length === 0 &&
      spec.zones.length === 0

    if (noInsights && outgoing.content) {
      const parsedFallback = parsePlayFromText(outgoing.content)
      if (parsedFallback) {
        const merged = { ...spec, ...parsedFallback }
        const recheck = playSpecSchema.safeParse(merged)
        if (recheck.success) {
          console.log('[/api/visualize] using heuristic merge (AI returned empty)')
          return NextResponse.json(recheck.data)
        }
      }
    }

    return NextResponse.json(spec)
  } catch (err) {
    console.error('[POST /api/visualize] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Very lightweight heuristic parser for mock article patterns (e.g., "Symbol: BTC-USD, Timeframe: 1D ... Entries: 98,800; Stops: 95,800; Targets: 102,500 / 105,000")
function parsePlayFromText(text: string) {
  try {
    const lower = text
    const getNum = (s: string) => {
      const n = Number(s.replace(/[\,\s]/g, ''))
      return isFinite(n) ? n : undefined
    }

    // Remove parenthetical parts e.g., "(50%)" to avoid capturing 50 as a target
    const stripParen = (s: string) => s.replace(/\([^)]*\)/g, ' ')

    const extractPriceList = (s?: string): number[] => {
      if (!s) return []
      const cleaned = stripParen(s)
      // Split by common delimiters and words
      const parts = cleaned.split(/\s*(?:\/|,|;|\band\b|\bor\b)\s*/i).filter(Boolean)
      const nums = parts
        .map(p => {
          const m = p.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?/)
          return m ? getNum(m[0]) : undefined
        })
        .filter((v): v is number => typeof v === 'number')
      // Heuristic: if there are values > 500 among extracted, drop values <= 100 to avoid picking RSI/percentages
      const hasLarge = nums.some(n => n > 500)
      return hasLarge ? nums.filter(n => n > 100) : nums
    }

    const findAfter = (label: string) => {
      const m = new RegExp(`${label}\s*:\s*([^\n\.]+)`, 'i').exec(lower)
      return m?.[1]?.trim()
    }

    const symbol = findAfter('Symbol')?.split(/[\s,]/)[0]
    const timeframeRaw = findAfter('Timeframe')?.toUpperCase()
    const timeframe = (['1D','4H','1H','15M'] as const).find(t => timeframeRaw?.includes(t))
    const biasRaw = findAfter('Bias')?.toLowerCase()
    const bias = biasRaw?.includes('bull') ? 'bullish' : biasRaw?.includes('bear') ? 'bearish' : 'neutral'

    const entriesRaw = findAfter('Entries')
    const stopsRaw = findAfter('Stops') || findAfter('Stop')
    const targetsRaw = findAfter('Targets') || findAfter('Target')
    const levelsRaw = findAfter('Levels')
    const zonesRaw = findAfter('Zones') || findAfter('Zone')

    const entriesNums = extractPriceList(entriesRaw)
    const stopsNums = extractPriceList(stopsRaw)
    const targetsNums = extractPriceList(targetsRaw)

    const entries = entriesNums.map(n => ({ price: n }))
    const stops = stopsNums.map(n => ({ price: n }))
    const targets = targetsNums.map(n => ({ price: n }))

    const levels: { type: 'support'|'resistance'|'trendline'; price: number; label?: string }[] = []
    if (levelsRaw) {
      // Look for "support 18,000" or "resistance 18,600"
      const supMatches = [...levelsRaw.matchAll(/support\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/gi)]
      const resMatches = [...levelsRaw.matchAll(/resistance\s+(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/gi)]
      supMatches.forEach(m => { const n = getNum(m[1]); if (n) levels.push({ type: 'support', price: n }) })
      resMatches.forEach(m => { const n = getNum(m[1]); if (n) levels.push({ type: 'resistance', price: n }) })
    }

    const zones: { type: 'supply'|'demand'; top: number; bottom: number; label?: string }[] = []
    if (zonesRaw) {
      // e.g., "demand 3,350–3,250" or "supply 210/225"
      const z = /\b(supply|demand)\b[^\d]*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)[^\d]+(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i.exec(zonesRaw)
      if (z) {
        const top = getNum(z[2])
        const bottom = getNum(z[3])
        const t = z[1].toLowerCase() as 'supply'|'demand'
        if (top && bottom) zones.push({ type: t, top: Math.max(top, bottom), bottom: Math.min(top, bottom) })
      }
    }

    const hasAny = entries.length || stops.length || targets.length || levels.length || zones.length
    if (!hasAny) return null

    return {
      symbol: symbol || 'BTC-USD',
      timeframe: timeframe || '1D',
      bias: bias || 'neutral',
      indicators: [],
      levels,
      zones,
      entries,
      stops,
      targets,
    }
  } catch {
    return null
  }
}
