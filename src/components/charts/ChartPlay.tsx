'use client'

import { useState, useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, LineStyle, ColorType, UTCTimestamp, CandlestickSeries, LineSeries } from 'lightweight-charts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { PlaySpec } from '@/lib/schemas/visualize'
import { TrendingUp, TrendingDown, Minus, Save, Share2, Settings, Eye, EyeOff, RefreshCw, Maximize2 } from 'lucide-react'

interface ChartPlayProps {
  playSpec: PlaySpec
  onSave?: (setup: any) => void
  className?: string
}

interface OHLCVCandle {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export function ChartPlay({ playSpec, onSave, className = '' }: ChartPlayProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const levelSeriesRefs = useRef<Array<ISeriesApi<'Line'>>>([])
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  
  const [candles, setCandles] = useState<OHLCVCandle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState(playSpec.timeframe)
  const [showIndicators, setShowIndicators] = useState({
    sma50: true,
    ema200: true,
    rsi: false,
  })
  const [levelsVisible, setLevelsVisible] = useState<boolean[]>(() => playSpec.levels.map(() => true))
  const [hoverOHLC, setHoverOHLC] = useState<{ time?: number; o?: number; h?: number; l?: number; c?: number } | null>(null)
  
  const { toast } = useToast()

  // Helpers: moving averages
  const computeSMA = (values: number[], period: number) => {
    if (period <= 0 || values.length < period) return [] as number[]
    const out: number[] = []
    let sum = 0
    for (let i = 0; i < values.length; i++) {
      sum += values[i]
      if (i >= period) sum -= values[i - period]
      if (i >= period - 1) out.push(sum / period)
    }
    return out
  }

  const computeEMA = (values: number[], period: number) => {
    if (period <= 0 || values.length === 0) return [] as number[]
    const k = 2 / (period + 1)
    const out: number[] = []
    let ema = values[0]
    out.push(ema)
    for (let i = 1; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k)
      out.push(ema)
    }
    return out
  }

  // Fetch OHLCV data
  useEffect(() => {
    const fetchCandles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Extract base symbol (remove -USD suffix for CoinGecko)
        const baseSymbol = playSpec.symbol.replace(/-USD$/, '')
        const days = timeframe === '1H' ? '7' : timeframe === '4H' ? '30' : '90'
        const interval = timeframe === '1H' ? 'hourly' : 'daily'
        
        const res = await fetch(`/api/market/ohlcv?symbol=${baseSymbol}&currency=usd&days=${days}&interval=${interval}`)
        if (!res.ok) throw new Error('Failed to fetch market data')
        
        const data = await res.json()
        setCandles(data.candles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    fetchCandles()
  }, [playSpec.symbol, timeframe])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0b0b12' : '#ffffff' },
        textColor: isDark ? '#e5e7eb' : '#333',
      },
      grid: {
        vertLines: { color: isDark ? '#1f2937' : '#f0f0f0' },
        horzLines: { color: isDark ? '#1f2937' : '#f0f0f0' },
      },
      rightPriceScale: {
        borderColor: isDark ? '#1f2937' : '#e0e0e0',
      },
      timeScale: {
        borderColor: isDark ? '#1f2937' : '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candleSeries = chart.addSeries(CandlestickSeries)
    candleSeries.applyOptions({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    })

    // Convert candles to chart format
    const chartCandles = candles.map(c => ({
      time: Math.floor(c.t / 1000) as UTCTimestamp, // Convert to seconds
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    }))

    candleSeries.setData(chartCandles)

    // Add SMA50 and EMA200 overlays
    const closes = candles.map(c => c.c)
    // SMA aligns starting at index 49; we will pad initial undefined by skipping until we have period
    const sma50Arr = computeSMA(closes, 50)
    const ema200Arr = computeEMA(closes, 200)

    // Create or reuse series
    const ensureLine = (ref: React.MutableRefObject<ISeriesApi<'Line'> | null>, color: string) => {
      if (!ref.current) {
        const s = chart.addSeries(LineSeries)
        s.applyOptions({
          color,
          lineWidth: 2,
        })
        ref.current = s
      }
      return ref.current
    }

    // Build data aligned to chartCandles times
    if (sma50Arr.length > 0) {
      const s = ensureLine(sma50SeriesRef, '#7862F0') // brand violet
      const offset = chartCandles.length - sma50Arr.length
      const data = chartCandles.slice(offset).map((c, i) => ({ time: c.time as UTCTimestamp, value: sma50Arr[i] }))
      s.setData(data)
      s.applyOptions({ visible: showIndicators.sma50 })
    }

    if (ema200Arr.length > 0) {
      const s = ensureLine(ema200SeriesRef, '#3f3a9a')
      const offset = chartCandles.length - ema200Arr.length
      const data = chartCandles.slice(offset).map((c, i) => ({ time: c.time as UTCTimestamp, value: ema200Arr[i] }))
      s.setData(data)
      s.applyOptions({ visible: showIndicators.ema200 })
    }

    // Add support/resistance levels (toggleable)
    levelSeriesRefs.current = []
    playSpec.levels.forEach((level, i) => {
      const color = level.type === 'support' ? '#22c55e' : '#ef4444'
      const lineSeries = chart.addSeries(LineSeries)
      lineSeries.applyOptions({
        color,
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        visible: levelsVisible[i] ?? true,
      })
      const lineData = chartCandles.map(c => ({
        time: c.time as UTCTimestamp,
        value: level.price,
      }))
      lineSeries.setData(lineData)
      levelSeriesRefs.current.push(lineSeries)
    })

    // Add supply/demand zones (draw upper/lower boundaries for now)
    playSpec.zones.forEach((zone, i) => {
      const upper = Math.max(zone.top, zone.bottom)
      const lower = Math.min(zone.top, zone.bottom)
      const upperSeries = chart.addSeries(LineSeries)
      upperSeries.applyOptions({ color: zone.type === 'supply' ? '#ef4444' : '#22c55e', lineStyle: LineStyle.Solid, lineWidth: 1 })
      upperSeries.setData(chartCandles.map(c => ({ time: c.time as UTCTimestamp, value: upper })))
      const lowerSeries = chart.addSeries(LineSeries)
      lowerSeries.applyOptions({ color: zone.type === 'supply' ? '#ef4444' : '#22c55e', lineStyle: LineStyle.Solid, lineWidth: 1, })
      lowerSeries.setData(chartCandles.map(c => ({ time: c.time as UTCTimestamp, value: lower })))
    })

    // Entries / Stops / Targets as price lines and markers
    const lastBarTime = chartCandles[chartCandles.length - 1]?.time
    const firstBarTime = chartCandles[0]?.time
    const midTime = chartCandles[Math.floor(chartCandles.length / 2)]?.time
    const safeTime = lastBarTime || midTime || firstBarTime

    // Price lines on candlestick series
    playSpec.entries.forEach((e, idx) => {
      candleSeries.createPriceLine({ price: e.price, color: '#38bdf8', lineWidth: 2, lineStyle: LineStyle.Solid, title: `Entry ${idx + 1}` })
    })
    playSpec.stops.forEach((s, idx) => {
      candleSeries.createPriceLine({ price: s.price, color: '#ef4444', lineWidth: 2, lineStyle: LineStyle.Solid, title: `Stop ${idx + 1}` })
    })
    playSpec.targets.forEach((t, idx) => {
      candleSeries.createPriceLine({ price: t.price, color: '#22c55e', lineWidth: 2, lineStyle: LineStyle.Solid, title: `Target ${idx + 1}` })
    })

    // Add basic markers near the last bar to make signals obvious
    const markers: any[] = []
    playSpec.entries.forEach(e => markers.push({ time: safeTime, position: 'belowBar', color: '#38bdf8', shape: 'arrowUp', text: `Entry ${e.price}` }))
    playSpec.stops.forEach(s => markers.push({ time: safeTime, position: 'belowBar', color: '#ef4444', shape: 'arrowDown', text: `Stop ${s.price}` }))
    playSpec.targets.forEach(t => markers.push({ time: safeTime, position: 'aboveBar', color: '#22c55e', shape: 'arrowUp', text: `Target ${t.price}` }))
    if (markers.length > 0) {
      (candleSeries as any).setMarkers?.(markers)
    }

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    chart.timeScale().fitContent()

    // Crosshair OHLC readout
    chart.subscribeCrosshairMove((param) => {
      const seriesData = (param.seriesData as any)?.get?.(candleSeries)
      if (seriesData && typeof seriesData.open === 'number') {
        setHoverOHLC({
          time: (param.time as number) ?? undefined,
          o: seriesData.open,
          h: seriesData.high,
          l: seriesData.low,
          c: seriesData.close,
        })
      } else {
        setHoverOHLC(null)
      }
    })

    // Handle resize via ResizeObserver
    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        const { width } = chartContainerRef.current.getBoundingClientRect()
        chart.applyOptions({ width })
      }
    })
    if (chartContainerRef.current) ro.observe(chartContainerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [candles, playSpec.levels, playSpec.zones])

  // Update indicator visibility/data on toggle or candle changes (without recreating chart)
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || candles.length === 0) return
    const chart = chartRef.current
    const chartCandles = candles.map(c => ({
      time: Math.floor(c.t / 1000) as UTCTimestamp,
      value: c.c,
    }))

    // Ensure series exist
    const ensureLine = (ref: React.MutableRefObject<ISeriesApi<'Line'> | null>, color: string) => {
      if (!ref.current) {
        const s = chart.addSeries(LineSeries)
        s.applyOptions({ color, lineWidth: 2 })
        ref.current = s
      }
      return ref.current
    }

    // SMA 50
    const closes = candles.map(c => c.c)
    const sma50Arr = computeSMA(closes, 50)
    if (sma50Arr.length > 0) {
      const s = ensureLine(sma50SeriesRef, '#7862F0')
      const offset = chartCandles.length - sma50Arr.length
      const data = chartCandles.slice(offset).map((c, i) => ({ time: c.time as UTCTimestamp, value: sma50Arr[i] }))
      s.setData(data)
      s.applyOptions({ visible: showIndicators.sma50 })
    } else if (sma50SeriesRef.current) {
      sma50SeriesRef.current.applyOptions({ visible: false })
    }

    // EMA 200
    const ema200Arr = computeEMA(closes, 200)
    if (ema200Arr.length > 0) {
      const s = ensureLine(ema200SeriesRef, '#3f3a9a')
      const offset = chartCandles.length - ema200Arr.length
      const data = chartCandles.slice(offset).map((c, i) => ({ time: c.time as UTCTimestamp, value: ema200Arr[i] }))
      s.setData(data)
      s.applyOptions({ visible: showIndicators.ema200 })
    } else if (ema200SeriesRef.current) {
      ema200SeriesRef.current.applyOptions({ visible: false })
    }
  }, [showIndicators, candles])

  const toggleLevelVisibility = (index: number) => {
    setLevelsVisible(prev => {
      const next = [...prev]
      next[index] = !next[index]
      const s = levelSeriesRefs.current[index]
      if (s) s.applyOptions({ visible: next[index] })
      return next
    })
  }

  const fitContent = () => {
    chartRef.current?.timeScale().fitContent()
  }

  const resetView = () => {
    chartRef.current?.timeScale().fitContent()
    chartRef.current?.priceScale('right').applyOptions({ autoScale: true })
  }

  const handleSave = async () => {
    if (!onSave) return
    
    try {
      const setup = {
        symbol: playSpec.symbol,
        timeframe,
        bias: playSpec.bias,
        strategy: {
          levels: playSpec.levels,
          zones: playSpec.zones,
          entries: playSpec.entries,
          stops: playSpec.stops,
          targets: playSpec.targets,
          indicators: playSpec.indicators,
        },
        extractedFromAi: true,
      }
      
      await onSave(setup)
      toast({
        title: "Setup saved",
        description: "Your chart setup has been saved to your profile.",
      })
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Failed to save setup. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getBiasIcon = () => {
    switch (playSpec.bias) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getBiasColor = () => {
    switch (playSpec.bias) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200'
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-[#11121a] rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 p-6 ${className}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-[#11121a] rounded-2xl shadow-lg border border-red-200 dark:border-red-900 p-8 text-center ${className}`}>
        <div className="text-red-500 text-5xl mb-4">📊</div>
        <Typography variant="h4" className="text-red-600 mb-2">
          Chart Loading Failed
        </Typography>
        <Typography variant="body" className="text-gray-600 mb-6">
          {error}
        </Typography>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-[#11121a] rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-violet to-brand-violet-light p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Typography variant="h3" className="font-bold text-white">
                {playSpec.symbol}
              </Typography>
              <Badge 
                variant="secondary"
                className={`flex items-center space-x-1 ${
                  playSpec.bias === 'bullish' 
                    ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                    : playSpec.bias === 'bearish' 
                    ? 'bg-red-500/20 text-red-100 border-red-400/30'
                    : 'bg-gray-500/20 text-gray-100 border-gray-400/30'
                }`}
              >
                {playSpec.bias === 'bullish' && <TrendingUp className="h-3 w-3" />}
                {playSpec.bias === 'bearish' && <TrendingDown className="h-3 w-3" />}
                {playSpec.bias === 'neutral' && <Minus className="h-3 w-3" />}
                <span className="capitalize">{playSpec.bias}</span>
              </Badge>
            </div>
            <Typography variant="body-small" className="text-white/80">
              {playSpec.timeframe} • {playSpec.levels.length} levels • Live market data
            </Typography>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTimeframe(timeframe === '1D' ? '4H' : timeframe === '4H' ? '1H' : '1D')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {timeframe}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowIndicators(prev => ({ ...prev, sma50: !prev.sma50 }))}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-brand-surface dark:bg-[#0f1020] rounded-lg">
        <div className="flex items-center space-x-2">
          <Typography variant="body-small" className="text-gray-600">Timeframe:</Typography>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="1H">1H</option>
            <option value="4H">4H</option>
            <option value="1D">1D</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Typography variant="body-small" className="text-gray-600">Indicators:</Typography>
          <label className="flex items-center space-x-1 text-sm">
            <input 
              type="checkbox" 
              checked={showIndicators.sma50}
              onChange={(e) => setShowIndicators(prev => ({ ...prev, sma50: e.target.checked }))}
            />
            <span>SMA 50</span>
          </label>
          <label className="flex items-center space-x-1 text-sm">
            <input 
              type="checkbox" 
              checked={showIndicators.ema200}
              onChange={(e) => setShowIndicators(prev => ({ ...prev, ema200: e.target.checked }))}
            />
            <span>EMA 200</span>
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={resetView} className="border-gray-200">
            <RefreshCw className="h-4 w-4 mr-1" /> Reset view
          </Button>
          <Button variant="secondary" size="sm" onClick={fitContent} className="border-gray-200">
            <Maximize2 className="h-4 w-4 mr-1" /> Fit content
          </Button>
        </div>
      </div>

      {/* No insights notice */}
      {playSpec.levels.length === 0 && playSpec.entries.length === 0 && playSpec.stops.length === 0 && playSpec.targets.length === 0 && playSpec.zones.length === 0 && (
        <div className="mt-3 p-3 rounded-lg border border-amber-300/50 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
          <Typography variant="body-small" className="text-amber-800 dark:text-amber-200">
            No AI insights detected from this article yet. The chart shows live market data only. Try re-running Visualize Play or editing the article to include clearer play specs (entries, stops, targets).
          </Typography>
        </div>
      )}

      {/* Chart */}
      <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Analysis Summary */}
      {(playSpec.levels.length > 0 || playSpec.entries.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key Levels */}
          {playSpec.levels.length > 0 && (
            <div className="p-4 bg-white dark:bg-[#0f1020] border border-gray-200 dark:border-slate-800 rounded-lg">
              <Typography variant="h6" className="mb-2 text-brand-indigo-text">Key Levels</Typography>
              <div className="space-y-2">
                {playSpec.levels.map((level, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={levelsVisible[i] ? 'Hide level' : 'Show level'}
                        onClick={() => toggleLevelVisibility(i)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {levelsVisible[i] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <span className={`capitalize ${level.type === 'support' ? 'text-green-600' : 'text-red-600'}`}>
                        {level.type}
                      </span>
                    </div>
                    <span className="font-mono">${level.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry Points */}
          {playSpec.entries.length > 0 && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <Typography variant="h6" className="mb-2 text-brand-indigo-text">Entry Points</Typography>
              <div className="space-y-2">
                {playSpec.entries.map((entry, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-mono">${entry.price.toLocaleString()}</div>
                    {entry.rationale && (
                      <div className="text-gray-600 text-xs">{entry.rationale}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Management */}
          {(playSpec.stops.length > 0 || playSpec.targets.length > 0) && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <Typography variant="h6" className="mb-2 text-brand-indigo-text">Risk/Reward</Typography>
              <div className="space-y-2 text-sm">
                {playSpec.stops.map((stop, i) => (
                  <div key={`stop-${i}`} className="flex justify-between">
                    <span className="text-red-600">Stop Loss</span>
                    <span className="font-mono">${stop.price.toLocaleString()}</span>
                  </div>
                ))}
                {playSpec.targets.map((target, i) => (
                  <div key={`target-${i}`} className="flex justify-between">
                    <span className="text-green-600">Target {i + 1}</span>
                    <span className="font-mono">${target.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status bar + Disclaimer */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between px-4 py-2 text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-[#0f1020]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">{playSpec.symbol}</span>
            <span className="text-gray-400">•</span>
            <span>{timeframe}</span>
            <span className="text-gray-400">•</span>
            <span>Source: CoinGecko</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            {hoverOHLC ? (
              <>
                <span>O {hoverOHLC.o?.toLocaleString()}</span>
                <span>H {hoverOHLC.h?.toLocaleString()}</span>
                <span>L {hoverOHLC.l?.toLocaleString()}</span>
                <span>C {hoverOHLC.c?.toLocaleString()}</span>
              </>
            ) : (
              candles.length > 0 && (
                <span>Last {candles[candles.length-1].c.toLocaleString()}</span>
              )
            )}
          </div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <Typography variant="body-small" className="text-yellow-800">
            <strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered financial advice. 
            Always do your own research and consider your risk tolerance before making investment decisions.
          </Typography>
        </div>
      </div>
    </div>
  )
}
