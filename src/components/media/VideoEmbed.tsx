'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

interface VideoEmbedProps {
  src?: string
  poster?: string
  title?: string
  width?: number | string
  height?: number | string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  onLoad?: () => void
  onError?: (error: string) => void
}

export function VideoEmbed({
  src,
  poster,
  title,
  width = '100%',
  height = 'auto',
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  className,
  onLoad,
  onError
}: VideoEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setLoading(false)
      setDuration(video.duration)
      onLoad?.()
    }

    const handleError = () => {
      setLoading(false)
      const errorMessage = 'Failed to load video'
      setError(errorMessage)
      onError?.(errorMessage)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [src, onLoad, onError])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value) / 100
    video.volume = newVolume
    setVolume(newVolume)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (error) {
    return (
      <Card className={cn("bg-red-50 border-red-200", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-700 font-medium">Video Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!src) {
    return (
      <Card className={cn("bg-gray-50 border-gray-200", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <Play className="h-12 w-12 mx-auto mb-2" />
            <p>No video source provided</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0 relative">
        <div className="relative group">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            width={width}
            height={height}
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            className="w-full h-auto"
            style={{ aspectRatio: '16/9' }}
          />

          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white">Loading...</div>
            </div>
          )}

          {/* Custom Controls */}
          {controls && !loading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Progress Bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          {!isPlaying && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="bg-black/50 text-white hover:bg-black/70 rounded-full p-4"
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          )}
        </div>

        {/* Video Title */}
        {title && (
          <div className="p-4 border-t">
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface VideoEmbedBuilderProps {
  onEmbed?: (embedCode: string) => void
  className?: string
}

export function VideoEmbedBuilder({ onEmbed, className }: VideoEmbedBuilderProps) {
  const [url, setUrl] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    if (!url) return

    // Detect video platform and generate appropriate embed code
    let code = ''

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // YouTube
      const videoId = extractYouTubeId(url)
      if (videoId) {
        code = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
      }
    } else if (url.includes('vimeo.com')) {
      // Vimeo
      const videoId = extractVimeoId(url)
      if (videoId) {
        code = `<iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`
      }
    } else if (url.includes('dailymotion.com')) {
      // Dailymotion
      const videoId = extractDailymotionId(url)
      if (videoId) {
        code = `<iframe frameborder="0" width="560" height="315" src="https://www.dailymotion.com/embed/video/${videoId}"></iframe>`
      }
    } else {
      // Direct video URL
      code = `<video controls width="560" height="315">
  <source src="${url}" type="video/mp4">
  Your browser does not support the video tag.
</video>`
    }

    setEmbedCode(code)
  }

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const extractVimeoId = (url: string): string | null => {
    const regex = /vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const extractDailymotionId = (url: string): string | null => {
    const regex = /dailymotion\.com\/video\/([^_]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy embed code:', error)
    }
  }

  const handleEmbed = () => {
    if (embedCode && onEmbed) {
      onEmbed(embedCode)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Video Embed Builder</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter a video URL from YouTube, Vimeo, Dailymotion, or a direct video file URL
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1"
              />
              <Button onClick={generateEmbedCode} disabled={!url}>
                Generate
              </Button>
            </div>
          </div>

          {embedCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embed Code
              </label>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md text-sm font-mono bg-gray-50 resize-none"
                  rows={4}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyEmbedCode}
                  className="absolute top-2 right-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {embedCode && onEmbed && (
            <div className="flex justify-end">
              <Button onClick={handleEmbed} variant="brand">
                Insert Video
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}