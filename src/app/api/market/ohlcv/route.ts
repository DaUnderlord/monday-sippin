import { NextRequest, NextResponse } from 'next/server'

// Simple OHLCV proxy for crypto via CoinGecko (MVP). Not for production trading.
// Query: ?symbol=BTC&currency=usd&days=90&interval=daily
// Returns: [{ t, o, h, l, c, v }]
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = (searchParams.get('symbol') || 'BTC').toUpperCase()
    const currency = (searchParams.get('currency') || 'usd').toLowerCase()
    const days = searchParams.get('days') || '90'
    const interval = searchParams.get('interval') || 'daily' // daily or hourly

    // Map symbol to coingecko id (basic mapping for MVP)
    const map: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
    }
    const id = map[symbol]
    if (!id) {
      return NextResponse.json({ error: 'unsupported symbol' }, { status: 400 })
    }

    const cgUrl = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`
    const res = await fetch(cgUrl, { next: { revalidate: 60 } })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: 'provider failed', detail: text }, { status: 502 })
    }
    const data = await res.json()
    const prices: [number, number][] = data.prices || []
    const highs: [number, number][] = data.high_24h || [] // not typically present here
    const lows: [number, number][] = data.low_24h || []
    const volumes: [number, number][] = data.total_volumes || []

    // CoinGecko market_chart doesn't provide OHLC per point; only close. Approximate OHLC from nearby points if needed.
    const candles = prices.map(([t, c], i) => {
      const prev = prices[i - 1]?.[1] ?? c
      const next = prices[i + 1]?.[1] ?? c
      const o = prev
      const close = c
      const h = Math.max(o, close, next)
      const l = Math.min(o, close, next)
      const v = volumes[i]?.[1] ?? 0
      return { t, o, h, l, c: close, v }
    })

    return NextResponse.json({ symbol, currency, interval, candles })
  } catch (err) {
    console.error('[GET /api/market/ohlcv] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
