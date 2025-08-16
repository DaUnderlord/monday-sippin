'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MediaManager, 
  MediaPicker, 
  FileUpload, 
  VideoEmbed, 
  ResponsiveImage, 
  ImageGallery,
  SelectedMedia 
} from '@/components/media'

export default function TestMediaPage() {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([])
  const [showMediaManager, setShowMediaManager] = useState(false)

  const handleMediaSelect = (media: SelectedMedia) => {
    setSelectedMedia(prev => [...prev, media])
  }

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index))
  }

  const sampleImages = [
    {
      src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      alt: 'Sample image 1',
      caption: 'Beautiful landscape'
    },
    {
      src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      alt: 'Sample image 2',
      caption: 'Crypto chart visualization'
    },
    {
      src: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
      alt: 'Sample image 3',
      caption: 'Modern office space'
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Media Management System Test
        </h1>
        <p className="text-gray-600">
          Test all media management components and functionality
        </p>
      </div>

      {/* Media Picker Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Media Picker Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <MediaPicker
              onSelect={handleMediaSelect}
              trigger={
                <Button variant="brand">
                  Pick Single Media
                </Button>
              }
            />
            
            <MediaPicker
              onSelect={handleMediaSelect}
              multiSelect
              trigger={
                <Button variant="outline">
                  Pick Multiple Media
                </Button>
              }
            />
            
            <Button 
              variant="outline"
              onClick={() => setShowMediaManager(true)}
            >
              Open Media Manager
            </Button>
          </div>

          {/* Selected Media Display */}
          {selectedMedia.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Selected Media ({selectedMedia.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedMedia.map((media, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      {media.type === 'image' && (
                        <div className="aspect-video relative mb-2">
                          <ResponsiveImage
                            src={media.url}
                            alt={media.alt || 'Selected image'}
                            fill
                            objectFit="cover"
                            className="rounded"
                          />
                        </div>
                      )}
                      
                      {media.type === 'video' && (
                        <div className="aspect-video mb-2">
                          <VideoEmbed
                            src={media.url}
                            title={media.title}
                            controls
                          />
                        </div>
                      )}
                      
                      {media.type === 'embed' && media.embedCode && (
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono mb-2">
                          {media.embedCode.substring(0, 100)}...
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {media.type}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedia(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Demo */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload Component</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUploadComplete={(files) => {
              files.forEach(file => {
                const media: SelectedMedia = {
                  type: file.file.type.startsWith('video/') ? 'video' : 'image',
                  url: file.url,
                  alt: file.file.name,
                  title: file.file.name
                }
                handleMediaSelect(media)
              })
            }}
            acceptedTypes={['image/*', 'video/*']}
            multiple
            folder="test-uploads"
          />
        </CardContent>
      </Card>

      {/* Responsive Image Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Image Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Standard Responsive Image</h4>
              <ResponsiveImage
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800"
                alt="Sample responsive image"
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Fill Container Image</h4>
              <div className="aspect-video relative">
                <ResponsiveImage
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800"
                  alt="Fill container image"
                  fill
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery Component</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageGallery
            images={sampleImages}
            columns={3}
            aspectRatio="landscape"
            gap={4}
          />
        </CardContent>
      </Card>

      {/* Video Embed Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Video Embed Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Sample Video (placeholder)</h4>
            <VideoEmbed
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800"
              title="Sample Video"
              controls
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Manager Modal */}
      {showMediaManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <MediaManager
              onSelect={handleMediaSelect}
              onClose={() => setShowMediaManager(false)}
              multiSelect
              acceptedTypes={['image', 'video', 'embed']}
            />
          </div>
        </div>
      )}
    </div>
  )
}