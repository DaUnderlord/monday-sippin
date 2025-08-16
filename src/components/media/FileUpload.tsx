'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { storageService } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { 
  Upload, 
  X, 
  Check, 
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  File as FileIcon
} from 'lucide-react'

export interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

interface FileUploadProps {
  onUploadComplete?: (files: { url: string; path: string; file: File }[]) => void
  onUploadProgress?: (files: UploadFile[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
  multiple?: boolean
  folder?: string
  className?: string
}

export function FileUpload({
  onUploadComplete,
  onUploadProgress,
  acceptedTypes = ['image/*', 'video/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  multiple = true,
  folder = 'media',
  className
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateFileId = () => `${Date.now()}-${Math.random().toString(36).substring(2)}`

  const validateFile = (file: File): string | null => {
    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isValidType) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size: ${formatFileSize(maxFileSize)}`
    }

    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-5 w-5" />
    } else {
      return <FileIcon className="h-5 w-5" />
    }
  }

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newUploadFiles: UploadFile[] = []

    for (const file of fileArray) {
      // Check max files limit
      if (uploadFiles.length + newUploadFiles.length >= maxFiles) {
        break
      }

      const validationError = validateFile(file)
      const uploadFile: UploadFile = {
        id: generateFileId(),
        file,
        progress: 0,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined
      }

      newUploadFiles.push(uploadFile)
    }

    const updatedFiles = [...uploadFiles, ...newUploadFiles]
    setUploadFiles(updatedFiles)
    onUploadProgress?.(updatedFiles)
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadFiles.filter(f => f.id !== fileId)
    setUploadFiles(updatedFiles)
    onUploadProgress?.(updatedFiles)
  }

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    if (uploadFile.status !== 'pending') return

    // Update status to uploading
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading' as const, progress: 0 }
        : f
    ))

    try {
      // Simulate progress updates (in real implementation, you'd get this from the upload service)
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 30, 90)
            return { ...f, progress: newProgress }
          }
          return f
        }))
      }, 200)

      // Upload the file
      const url = await storageService.uploadFile(uploadFile.file, folder)
      
      clearInterval(progressInterval)

      // Update to success
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success' as const, progress: 100, url }
          : f
      ))

    } catch (error) {
      // Update to error
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error' as const, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    
    // Upload files concurrently
    await Promise.all(pendingFiles.map(uploadFile))

    // Get successful uploads
    const successfulUploads = uploadFiles
      .filter(f => f.status === 'success' && f.url)
      .map(f => ({
        url: f.url!,
        path: storageService.extractPathFromUrl(f.url!) || '',
        file: f.file
      }))

    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads)
    }
  }

  const retryUpload = (fileId: string) => {
    const file = uploadFiles.find(f => f.id === fileId)
    if (file) {
      setUploadFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'pending' as const, error: undefined }
          : f
      ))
    }
  }

  const clearCompleted = () => {
    const activeFiles = uploadFiles.filter(f => 
      f.status === 'pending' || f.status === 'uploading'
    )
    setUploadFiles(activeFiles)
    onUploadProgress?.(activeFiles)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }, [uploadFiles.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length
  const uploadingCount = uploadFiles.filter(f => f.status === 'uploading').length
  const successCount = uploadFiles.filter(f => f.status === 'success').length
  const errorCount = uploadFiles.filter(f => f.status === 'error').length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          uploadingCount > 0 && "opacity-75"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className={cn(
            "h-12 w-12 mb-4 transition-colors",
            dragOver ? "text-blue-500" : "text-gray-400"
          )} />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dragOver ? 'Drop files here' : 'Upload files'}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4 text-center">
            Drag and drop files here, or click to select files<br />
            Supports {acceptedTypes.join(', ')} up to {formatFileSize(maxFileSize)}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-input"
          />
          
          <label htmlFor="file-upload-input">
            <Button 
              variant="brand" 
              className="cursor-pointer"
              disabled={uploadingCount > 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </label>

          {uploadFiles.length > 0 && (
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <span>{uploadFiles.length} files selected</span>
              {successCount > 0 && (
                <span className="text-green-600">{successCount} uploaded</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">{errorCount} failed</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {uploadFiles.map(uploadFile => (
                <FileUploadItem
                  key={uploadFile.id}
                  uploadFile={uploadFile}
                  onRemove={() => removeFile(uploadFile.id)}
                  onRetry={() => retryUpload(uploadFile.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {uploadFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompleted}
              disabled={successCount === 0 && errorCount === 0}
            >
              Clear Completed
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="brand"
              onClick={uploadAllFiles}
              disabled={pendingCount === 0 || uploadingCount > 0}
              className="flex items-center gap-2"
            >
              {uploadingCount > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading ({uploadingCount})
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {pendingCount} Files
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface FileUploadItemProps {
  uploadFile: UploadFile
  onRemove: () => void
  onRetry: () => void
}

function FileUploadItem({ uploadFile, onRemove, onRetry }: FileUploadItemProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-5 w-5" />
    } else {
      return <FileIcon className="h-5 w-5" />
    }
  }

  const getStatusIcon = () => {
    switch (uploadFile.status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (uploadFile.status) {
      case 'uploading':
        return 'bg-blue-500'
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0">
      {/* File Icon */}
      <div className="flex-shrink-0 text-gray-500">
        {getFileIcon(uploadFile.file)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {uploadFile.file.name}
          </p>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{formatFileSize(uploadFile.file.size)}</span>
          <span className="capitalize">{uploadFile.status}</span>
        </div>

        {/* Progress Bar */}
        {(uploadFile.status === 'uploading' || uploadFile.status === 'success') && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={cn("h-1.5 rounded-full transition-all duration-300", getStatusColor())}
              style={{ width: `${uploadFile.progress}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {uploadFile.status === 'error' && uploadFile.error && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-red-600">{uploadFile.error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}