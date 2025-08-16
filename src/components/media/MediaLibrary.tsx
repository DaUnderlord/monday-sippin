'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { storageService } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  Filter,
  X,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  Download,
  Copy,
  Check,
  Loader2
} from 'lucide-react'

export interface MediaFile {
  id: string
  name: string
  url: string
  path: string
  type: 'image' | 'video' | 'document'
  size: number
  uploadedAt: Date
  folder: string
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void
  selectedFiles?: MediaFile[]
  multiSelect?: boolean
  acceptedTypes?: string[]
  maxFileSize?: number
  className?: string
}

export function MediaLibrary({
  onSelect,
  selectedFiles = [],
  multiSelect = false,
  acceptedTypes = ['image/*', 'video/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Mock data - in real implementation, this would come from Supabase
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    try {
      // Mock implementation - replace with actual Supabase query
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          name: 'hero-image.jpg',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
          path: 'articles/hero-image.jpg',
          type: 'image',
          size: 1024000,
          uploadedAt: new Date('2024-01-15'),
          folder: 'articles'
        },
        {
          id: '2',
          name: 'crypto-chart.png',
          url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
          path: 'articles/crypto-chart.png',
          type: 'image',
          size: 2048000,
          uploadedAt: new Date('2024-01-14'),
          folder: 'articles'
        }
      ]
      setFiles(mockFiles)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (uploadFiles: FileList | File[]) => {
    const fileArray = Array.from(uploadFiles)
    setUploading(true)

    try {
      for (const file of fileArray) {
        // Validate file type
        const isValidType = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })

        if (!isValidType) {
          console.error(`Invalid file type: ${file.type}`)
          continue
        }

        // Validate file size
        if (file.size > maxFileSize) {
          console.error(`File too large: ${file.name}`)
          continue
        }

        // Upload file with progress tracking
        const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        try {
          const url = await storageService.uploadFile(file, 'media')
          
          // Create media file record
          const newFile: MediaFile = {
            id: fileId,
            name: file.name,
            url,
            path: `media/${file.name}`,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'document',
            size: file.size,
            uploadedAt: new Date(),
            folder: 'media'
          }

          setFiles(prev => [newFile, ...prev])
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
          
          // Remove progress after delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const { [fileId]: _, ...rest } = prev
              return rest
            })
          }, 2000)

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          setUploadProgress(prev => {
            const { [fileId]: _, ...rest } = prev
            return rest
          })
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileSelect = (file: MediaFile) => {
    if (multiSelect) {
      const isSelected = selectedFiles.some(f => f.id === file.id)
      if (isSelected) {
        onSelect?.(file) // Let parent handle deselection
      } else {
        onSelect?.(file)
      }
    } else {
      onSelect?.(file)
    }
  }

  const handleDeleteFile = async (file: MediaFile) => {
    try {
      await storageService.deleteFile(file.path)
      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  const folders = Array.from(new Set(files.map(f => f.folder)))

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Media Library</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          uploading && "opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports images and videos up to {formatFileSize(maxFileSize)}
          </p>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button variant="brand" disabled={uploading} className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </>
              )}
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="space-y-2">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Folders</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {filteredFiles.map(file => (
            <MediaFileCard
              key={file.id}
              file={file}
              viewMode={viewMode}
              isSelected={selectedFiles.some(f => f.id === file.id)}
              onSelect={() => handleFileSelect(file)}
              onDelete={() => handleDeleteFile(file)}
              onCopyUrl={() => handleCopyUrl(file.url)}
              copiedUrl={copiedUrl}
            />
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No files found</p>
        </div>
      )}
    </div>
  )
}

interface MediaFileCardProps {
  file: MediaFile
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onCopyUrl: () => void
  copiedUrl: string | null
}

function MediaFileCard({
  file,
  viewMode,
  isSelected,
  onSelect,
  onDelete,
  onCopyUrl,
  copiedUrl
}: MediaFileCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-blue-500"
        )}
        onClick={onSelect}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex-shrink-0">
            {file.type === 'image' ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                {getFileIcon(file.type)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getFileIcon(file.type)}
              {file.type}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCopyUrl()
              }}
            >
              {copiedUrl === file.url ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          {file.type === 'image' ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              {getFileIcon(file.type)}
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCopyUrl()
              }}
              className="bg-white/80 hover:bg-white"
            >
              {copiedUrl === file.url ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="p-3">
          <p className="font-medium text-sm text-gray-900 truncate mb-1">
            {file.name}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {file.type}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}