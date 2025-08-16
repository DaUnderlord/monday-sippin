'use client'

import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { createLowlight } from 'lowlight'
import { useMemo, useState, useEffect } from 'react'

interface ArticleContentProps {
  content: any
  className?: string
}

export function ArticleContent({ content, className = '' }: ArticleContentProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const htmlContent = useMemo(() => {
    if (!content || !isClient) return ''
    
    try {
      return generateHTML(content, [
        StarterKit.configure({
          codeBlock: false, // We'll use CodeBlockLowlight instead
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'rounded-lg max-w-full h-auto mx-auto my-6 shadow-md',
          },
        }),
        Link.configure({
          HTMLAttributes: {
            class: 'text-brand-warm-orange hover:text-brand-deep-teal underline underline-offset-2 transition-colors',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        CodeBlockLowlight.configure({
          lowlight: createLowlight(),
          HTMLAttributes: {
            class: 'bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm overflow-x-auto my-4 border',
          },
        }),
        Table.configure({
          HTMLAttributes: {
            class: 'border-collapse table-auto w-full my-6 border border-gray-300 rounded-lg overflow-hidden',
          },
        }),
        TableRow.configure({
          HTMLAttributes: {
            class: 'border-b border-gray-200 even:bg-gray-50',
          },
        }),
        TableHeader.configure({
          HTMLAttributes: {
            class: 'border border-gray-300 px-4 py-3 bg-brand-deep-teal text-white font-semibold text-left',
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: 'border border-gray-300 px-4 py-3',
          },
        }),
      ])
    } catch (error) {
      console.error('Error generating HTML from content:', error)
      return '<p>Error rendering content</p>'
    }
  }, [content, isClient])

  // Show loading state during SSR and initial hydration
  if (!isClient) {
    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`
        prose prose-lg max-w-none
        prose-headings:font-manrope prose-headings:font-bold
        prose-h1:text-brand-deep-teal prose-h1:text-3xl prose-h1:mb-6
        prose-h2:text-brand-deep-teal prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-brand-rich-purple prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-h4:text-brand-rich-purple prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-strong:text-brand-deep-teal prose-strong:font-semibold
        prose-em:text-brand-rich-purple
        prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-brand-deep-teal
        prose-blockquote:border-l-4 prose-blockquote:border-brand-warm-orange prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
        prose-li:mb-2 prose-li:text-gray-700
        prose-img:rounded-lg prose-img:shadow-md
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}