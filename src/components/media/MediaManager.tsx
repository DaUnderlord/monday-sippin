'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaLibrary, MediaFile } from './MediaLibrary'
import { FileUpload } from './FileUpload'
import { VideoEmbedBuilder } from './VideoEmbed'
import { ResponsiveImage } from './ResponsiveImage'
import { cn } from '@/lib/utils'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Link,
  Grid,
  X,
  Check
} from 'lucide-react'

interface MediaManagerProps {
  onSelect?: (media: SelectedMedia) => void
  onClose?: () => void
  multiSelect?: boolean
  acceptedTypes?: ('image' | 'video' | 'embed')[]
  className?: string
}

export interface SelectedMedia {
  type: 'image' | 'video' | 'embed'
  url: string
  alt?: string
  title?: string
  caption?: string
  embedCode?: string
  file?: MediaFile
}

export function MediaManager({
  onSelect,
  onClose,
  multiSelect = false,
  acceptedTypes = ['image', 'video', 'embed'],
  className
}: MediaManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [activeTab, setActiveTab] = useState('library')

  const handleFileSelect = (file: MediaFile) => {
    if (multiSelect) {
      const isSelected = selectedFiles.some(f => f.id === file.id)
      if (isSelected) {
        setSelectedFiles(prev => prev.filter(f => f.id !== file.id))
      } else {
        setSelectedFiles(prev => [...prev, file])
      }
    } else {
      setSelectedFiles([file])
    }
  }

  const handleInsertSelected = () => {
    if (selectedFiles.length === 0) return

    if (multiSelect) {
      // For multi-select, return all selected files
      selectedFiles.forEach(file => {
        const media: SelectedMedia = {
          type: file.type === 'video' ? 'video' : 'image',
          url: file.url,
          alt: file.name,
          title: file.name,
          file
        }
        onSelect?.(media)
      })
    } else {
      // For single select, return the first selected file
      const file = selectedFiles[0]
      const media: SelectedMedia = {
        type: file.type === 'video' ? 'video' : 'image',
        url: file.url,
        alt: file.name,
        title: file.name,
        file
      }
      onSelect?.(media)
    }

    onClose?.()
  }

  const handleUploadComplete = (files: { url: string; path: string; file: File }[]) => {
    // Auto-select uploaded files if in single select mode
    if (!multiSelect && files.length > 0) {
      const file = files[0]
      const media: SelectedMedia = {
        type: file.file.type.startsWith('video/') ? 'video' : 'image',
        url: file.url,
        alt: file.file.name,
        title: file.file.name
      }
      onSelect?.(media)
      onClose?.()
    }
  }

  const handleVideoEmbed = (embedCode: string) => {
    const media: SelectedMedia = {
      type: 'embed',
      url: '',
      embedCode
    }
    onSelect?.(media)
    onClose?.()
  }

  const getAcceptedFileTypes = (): string[] => {
    const types: string[] = []
    if (acceptedTypes.includes('image')) {
      types.push('image/*')
    }
    if (acceptedTypes.includes('video')) {
      types.push('video/*')
    }
    return types
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Media Manager
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <Button
                variant="brand"
                onClick={handleInsertSelected}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Insert {selectedFiles.length} {selectedFiles.length === 1 ? 'Item' : 'Items'}
              </Button>
            )}
            
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Library
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              
              {acceptedTypes.includes('embed') && (
                <TabsTrigger value="embed" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Embed
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="library" className="mt-6">
              <MediaLibrary
                onSelect={handleFileSelect}
                selectedFiles={selectedFiles}
                multiSelect={multiSelect}
                acceptedTypes={getAcceptedFileTypes()}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <FileUpload
                onUploadComplete={handleUploadComplete}
                acceptedTypes={getAcceptedFileTypes()}
                multiple={multiSelect}
                folder="media"
              />
            </TabsContent>

            {acceptedTypes.includes('embed') && (
              <TabsContent value="embed" className="mt-6">
                <VideoEmbedBuilder onEmbed={handleVideoEmbed} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">
              Selected Files ({selectedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selectedFiles.map(file => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-blue-500">
                    {file.type === 'image' ? (
                      <ResponsiveImage
                        src={file.url}
                        alt={file.name}
                        fill
                        objectFit="cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleFileSelect(file)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface MediaPickerProps {
  trigger?: React.ReactNode
  onSelect: (media: SelectedMedia) => void
  multiSelect?: boolean
  acceptedTypes?: ('image' | 'video' | 'embed')[]
  className?: string
}

export function MediaPicker({
  trigger,
  onSelect,
  multiSelect = false,
  acceptedTypes = ['image', 'video', 'embed'],
  className
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (media: SelectedMedia) => {
    onSelect(media)
    setIsOpen(false)
  }

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <ImageIcon className="h-4 w-4" />
      Select Media
    </Button>
  )

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={className}>
        {trigger || defaultTrigger}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <MediaManager
              onSelect={handleSelect}
              onClose={() => setIsOpen(false)}
              multiSelect={multiSelect}
              acceptedTypes={acceptedTypes}
            />
          </div>
        </div>
      )}
    </>
  )
}