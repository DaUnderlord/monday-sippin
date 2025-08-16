'use client'

import { useState, useEffect } from 'react'
import { storageService } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes = '100vw',
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: ResponsiveImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setImageSrc(src)
    setLoading(true)
    setError(false)
  }, [src])

  const handleLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    onError?.()
  }

  // Generate responsive image variants
  const generateSrcSet = (originalSrc: string): string => {
    if (!originalSrc.includes('supabase')) {
      // For external images, return as-is
      return originalSrc
    }

    const path = storageService.extractPathFromUrl(originalSrc)
    if (!path) return originalSrc

    const variants = [
      { width: 400, descriptor: '400w' },
      { width: 800, descriptor: '800w' },
      { width: 1200, descriptor: '1200w' },
      { width: 1600, descriptor: '1600w' }
    ]

    return variants
      .map(variant => {
        const optimizedUrl = storageService.getOptimizedImageUrl(path, {
          width: variant.width,
          quality,
          format: 'webp'
        })
        return `${optimizedUrl} ${variant.descriptor}`
      })
      .join(', ')
  }

  const getOptimizedSrc = (originalSrc: string, targetWidth?: number): string => {
    if (!originalSrc.includes('supabase')) {
      return originalSrc
    }

    const path = storageService.extractPathFromUrl(originalSrc)
    if (!path) return originalSrc

    return storageService.getOptimizedImageUrl(path, {
      width: targetWidth || width,
      height,
      quality,
      format: 'webp'
    })
  }

  if (error) {
    return (
      <div 
        className={cn(
          "bg-gray-100 flex items-center justify-center text-gray-400",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">📷</div>
          <div className="text-xs">Image not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", fill ? "w-full h-full" : "", className)}>
      {loading && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-100 flex items-center justify-center",
            fill ? "" : "rounded"
          )}
          style={!fill ? { width, height } : undefined}
        >
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      <img
        src={getOptimizedSrc(imageSrc, width)}
        srcSet={generateSrcSet(imageSrc)}
        sizes={sizes}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(
          "transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          fill ? "absolute inset-0 w-full h-full" : "",
          objectFit && fill ? `object-${objectFit}` : ""
        )}
        style={
          fill 
            ? { objectPosition }
            : { objectFit, objectPosition }
        }
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />

      {placeholder === 'blur' && blurDataURL && loading && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover filter blur-sm",
            fill ? "" : "rounded"
          )}
          style={{ objectPosition }}
        />
      )}
    </div>
  )
}

interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape'
  columns?: number
  gap?: number
}

export function ImageGallery({
  images,
  className,
  aspectRatio = 'landscape',
  columns = 3,
  gap = 4
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      case 'landscape':
        return 'aspect-[4/3]'
      default:
        return 'aspect-video'
    }
  }

  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getGapClass = () => {
    switch (gap) {
      case 1:
        return 'gap-1'
      case 2:
        return 'gap-2'
      case 3:
        return 'gap-3'
      case 4:
        return 'gap-4'
      case 6:
        return 'gap-6'
      case 8:
        return 'gap-8'
      default:
        return 'gap-4'
    }
  }

  return (
    <>
      <div className={cn(
        "grid",
        getGridClass(),
        getGapClass(),
        className
      )}>
        {images.map((image, index) => (
          <div
            key={index}
            className="group cursor-pointer"
            onClick={() => setSelectedImage(index)}
          >
            <div className={cn(
              "relative overflow-hidden rounded-lg",
              getAspectRatioClass()
            )}>
              <ResponsiveImage
                src={image.src}
                alt={image.alt}
                fill
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            </div>
            
            {image.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <ResponsiveImage
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="max-w-full max-h-full object-contain"
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
            
            {images[selectedImage].caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                <p className="bg-black bg-opacity-50 px-4 py-2 rounded">
                  {images[selectedImage].caption}
                </p>
              </div>
            )}
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-3xl"
                >
                  ‹
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-3xl"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}