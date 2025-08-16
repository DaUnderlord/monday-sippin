'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MediaLibrary, FileUpload, MediaManager, SelectedMedia } from '@/components/media'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { 
  Upload, 
  Search, 
  Filter,
  Grid,
  List,
  Trash2,
  Download,
  Eye,
  Settings
} from 'lucide-react'

export default function AdminMediaPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    images: 0,
    videos: 0,
    documents: 0
  })

  const handleFileSelect = (file: any) => {
    const isSelected = selectedFiles.some(f => f.id === file.id)
    if (isSelected) {
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id))
    } else {
      setSelectedFiles(prev => [...prev, file])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedFiles.length} files? This action cannot be undone.`
    )
    
    if (confirmed) {
      // Implement bulk delete logic here
      console.log('Deleting files:', selectedFiles)
      setSelectedFiles([])
    }
  }

  const handleUploadComplete = (files: { url: string; path: string; file: File }[]) => {
    console.log('Files uploaded:', files)
    setShowUpload(false)
    // Refresh the media library
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">
              Manage your images, videos, and other media files
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            
            <Button variant="brand" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Grid className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Size</p>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Images</p>
                  <p className="text-2xl font-bold">{stats.images}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Videos</p>
                  <p className="text-2xl font-bold">{stats.videos}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-2xl font-bold">{stats.documents}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Filter className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                acceptedTypes={['image/*', 'video/*', 'application/pdf']}
                multiple
                folder="admin-uploads"
                maxFiles={20}
                maxFileSize={50 * 1024 * 1024} // 50MB
              />
            </CardContent>
          </Card>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search and Filters */}
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Folders</option>
                  <option value="articles">Articles</option>
                  <option value="media">Media</option>
                  <option value="uploads">Uploads</option>
                </select>
              </div>

              {/* View Mode and Actions */}
              <div className="flex items-center gap-2">
                {selectedFiles.length > 0 && (
                  <>
                    <Badge variant="secondary">
                      {selectedFiles.length} selected
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
                
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Library */}
        <Card>
          <CardContent className="p-6">
            <MediaLibrary
              onSelect={handleFileSelect}
              selectedFiles={selectedFiles}
              multiSelect
              acceptedTypes={['image/*', 'video/*', 'application/*']}
              maxFileSize={50 * 1024 * 1024}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}