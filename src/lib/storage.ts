import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(file: File, folder: string = 'articles'): Promise<string> {
    try {
      // Validate file size based on type
      const maxSize = file.type.startsWith('video/') 
        ? 100 * 1024 * 1024 // 100MB for videos
        : 10 * 1024 * 1024  // 10MB for other files

      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        throw new Error(`File size must be less than ${maxSizeMB}MB`)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload file
      const { error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  /**
   * Upload an image to Supabase Storage (legacy method for backward compatibility)
   */
  async uploadImage(file: File, folder: string = 'articles'): Promise<string> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }
    return this.uploadFile(file, folder)
  },

  /**
   * Upload a video to Supabase Storage
   */
  async uploadVideo(file: File, folder: string = 'videos'): Promise<string> {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      throw new Error('File must be a video')
    }
    return this.uploadFile(file, folder)
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], folder: string = 'articles'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder))
    return Promise.all(uploadPromises)
  },

  /**
   * Upload multiple images (legacy method for backward compatibility)
   */
  async uploadImages(files: File[], folder: string = 'articles'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder))
    return Promise.all(uploadPromises)
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([path])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  },

  /**
   * Delete an image from storage (legacy method for backward compatibility)
   */
  async deleteImage(path: string): Promise<void> {
    return this.deleteFile(path)
  },

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    path: string, 
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
    } = {}
  ): string {
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(path)

    // If no transformations needed, return original URL
    if (Object.keys(options).length === 0) {
      return publicUrl
    }

    // Build transformation parameters
    const params = new URLSearchParams()
    if (options.width) params.append('width', options.width.toString())
    if (options.height) params.append('height', options.height.toString())
    if (options.quality) params.append('quality', options.quality.toString())
    if (options.format) params.append('format', options.format)

    return `${publicUrl}?${params.toString()}`
  },

  /**
   * Generate responsive image variants
   */
  generateResponsiveVariants(path: string): {
    thumbnail: string
    small: string
    medium: string
    large: string
    original: string
  } {
    return {
      thumbnail: this.getOptimizedImageUrl(path, { width: 150, height: 150, quality: 80, format: 'webp' }),
      small: this.getOptimizedImageUrl(path, { width: 400, quality: 85, format: 'webp' }),
      medium: this.getOptimizedImageUrl(path, { width: 800, quality: 85, format: 'webp' }),
      large: this.getOptimizedImageUrl(path, { width: 1200, quality: 90, format: 'webp' }),
      original: this.getOptimizedImageUrl(path)
    }
  },

  /**
   * Extract path from Supabase public URL
   */
  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/media\/(.+)/)
      return pathMatch ? pathMatch[1] : null
    } catch {
      return null
    }
  }
}