import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate reading time for article content
 */
export function calculateReadingTime(content: any): number {
  if (!content) return 0
  
  // Extract text from Tiptap JSON content
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node
    if (!node || typeof node !== 'object') return ''
    
    let text = ''
    
    if (node.text) {
      text += node.text
    }
    
    if (node.content && Array.isArray(node.content)) {
      text += node.content.map(extractText).join(' ')
    }
    
    return text
  }
  
  const text = extractText(content)
  const wordsPerMinute = 200 // Average reading speed
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
