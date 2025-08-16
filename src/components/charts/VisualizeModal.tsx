'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { ChartPlay } from './ChartPlay'
import { PlaySpec, VisualizeRequest } from '@/lib/schemas/visualize'
import { X, TrendingUp } from 'lucide-react'

interface VisualizeModalProps {
  isOpen: boolean
  onClose: () => void
  articleId?: string
  articleContent?: string
  articleTitle?: string
}

export function VisualizeModal({ 
  isOpen, 
  onClose, 
  articleId, 
  articleContent, 
  articleTitle 
}: VisualizeModalProps) {
  const [playSpec, setPlaySpec] = useState<PlaySpec | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customSymbol, setCustomSymbol] = useState('')
  const [customTimeframe, setCustomTimeframe] = useState<'1D' | '4H' | '1H' | '15M'>('1D')

  const handleVisualize = async (symbol?: string, timeframe?: string) => {
    if (!articleContent && !articleId) {
      setError('No article content available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const request: VisualizeRequest = {
        articleId,
        content: articleContent,
        symbol: symbol || customSymbol || undefined,
        timeframe: (timeframe as any) || customTimeframe,
      }

      const res = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[VisualizeModal] API Error:', { status: res.status, errorData })
        
        // Show detailed error info for debugging
        const errorMsg = errorData.error || `HTTP ${res.status}`
        const details = errorData.upstreamStatus 
          ? ` (upstream: ${errorData.upstreamStatus}, detail: ${errorData.detail || 'none'})`
          : ''
        
        throw new Error(errorMsg + details)
      }

      const spec = await res.json()
      setPlaySpec(spec)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate visualization')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSetup = async (setup: any) => {
    try {
      const res = await fetch('/api/play-setups', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...setup,
          articleId,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save setup')
      }

      return await res.json()
    } catch (err) {
      throw err
    }
  }

  const handleClose = () => {
    setPlaySpec(null)
    setError(null)
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-brand-violet" />
              <span>Visualize Play</span>
              {articleTitle && (
                <span className="text-sm font-normal text-gray-500">
                  from "{articleTitle.slice(0, 50)}..."
                </span>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {!playSpec && !loading && (
            <div className="space-y-4">
              <Typography variant="body" className="text-gray-600">
                Generate an interactive chart analysis based on this article's market insights.
              </Typography>

              {/* Custom inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-brand-surface rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symbol (optional)
                  </label>
                  <input
                    type="text"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., BTC, ETH, AAPL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-detect from article
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={customTimeframe}
                    onChange={(e) => setCustomTimeframe(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="1H">1 Hour</option>
                    <option value="4H">4 Hours</option>
                    <option value="1D">1 Day</option>
                  </select>
                </div>
              </div>

              {/* Quick symbol buttons */}
              <div className="flex flex-wrap gap-2">
                <Typography variant="body-small" className="text-gray-600 w-full">
                  Quick symbols:
                </Typography>
                {['BTC', 'ETH', 'SOL'].map((symbol) => (
                  <Button
                    key={symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => handleVisualize(symbol)}
                    className="text-xs"
                  >
                    {symbol}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => handleVisualize()}
                className="w-full bg-gradient-violet text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Analyzing Article...' : 'Generate Chart Analysis'}
              </Button>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-brand-violet border-t-transparent rounded-full mx-auto mb-4"></div>
                <Typography variant="body" className="text-gray-600">
                  AI is analyzing the article and generating chart insights...
                </Typography>
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <Typography variant="h3" className="text-red-600 mb-2">
                Analysis Failed
              </Typography>
              <Typography variant="body" className="text-gray-600 mb-4">
                {error}
              </Typography>
              <Button onClick={() => setError(null)} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {playSpec && (
            <ChartPlay 
              playSpec={playSpec} 
              onSave={handleSaveSetup}
              className="mt-4"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
