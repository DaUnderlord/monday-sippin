'use client'

import { useState } from 'react'
import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArticleContent } from './ArticleContent'
import { RelatedArticles } from './RelatedArticles'
import { VisualizeModal } from '@/components/charts/VisualizeModal'
import { Clock, Eye, Calendar, Share2, Bookmark, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import headerFallback from '../../../assets/images/pexels-rdne-8370752.jpg'
import { formatDistanceToNow, format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface ArticlePageProps {
  article: Article
}

export function ArticlePage({ article }: ArticlePageProps) {
  const router = useRouter()
  const [showVisualizeModal, setShowVisualizeModal] = useState(false)
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date(article.created_at)
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true })
  const formattedDate = format(publishedDate, 'MMMM d, yyyy')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying URL
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    // You could add a toast notification here
  }

  const handleBookmark = () => {
    // Implement bookmark functionality
    // This could save to local storage or user preferences
    console.log('Bookmark article:', article.id)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b12]">
      {/* Header with back button */}
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-[#0b0b12]/80 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-brand-violet/10 text-gray-900 dark:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 py-12">
        <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category && (
              <Badge variant="secondary" className="bg-brand-deep-teal text-white">
                {article.category.name}
              </Badge>
            )}
            {article.tags && article.tags.slice(0, 3).map((tagRelation: any) => (
              <Badge key={(tagRelation.tag?.id) ?? tagRelation.id} variant="outline">
                {(tagRelation.tag?.name) ?? tagRelation.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <Typography variant="h1" className="mb-4 leading-tight">
            {article.title}
          </Typography>

          {/* Excerpt */}
          {article.excerpt && (
            <Typography variant="lead" className="mb-6 text-gray-600">
              {article.excerpt}
            </Typography>
          )}

          {/* Author and Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              {article.author && (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.author.avatar_url} />
                    <AvatarFallback>
                      {article.author.full_name?.charAt(0) || article.author.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Typography variant="body" className="font-medium">
                      {article.author.full_name || article.author.email}
                    </Typography>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Reading Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.view_count} views</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVisualizeModal(true)}
                  className="bg-gradient-violet text-white border-0 hover:opacity-90"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Visualize Play
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Header Image (with fallback) */}
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={article.featured_image || headerFallback}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </header>

        <Separator className="mb-8" />

        {/* Article Content */}
        <div className="mb-12">
          <ArticleContent content={article.content} />
        </div>

        <Separator className="mb-8" />

        {/* Article Footer */}
        <footer className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gray-50 dark:bg-[#11121a] border border-gray-100 dark:border-slate-800 rounded-lg">
            <div className="flex items-center space-x-4">
              {article.author && (
                <>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={article.author.avatar_url} />
                    <AvatarFallback>
                      {article.author.full_name?.charAt(0) || article.author.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Typography variant="h5" className="mb-1">
                      {article.author.full_name || article.author.email}
                    </Typography>
                    <Typography variant="body-small" className="text-gray-600">
                      Author • {article.author.role}
                    </Typography>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </div>
          </div>
        </footer>

        {/* Related Articles */}
        <RelatedArticles currentArticle={article} className="mt-12" />
        </div>
      </article>

      {/* Visualize Modal */}
      <VisualizeModal
        isOpen={showVisualizeModal}
        onClose={() => setShowVisualizeModal(false)}
        articleId={article.id}
        articleContent={typeof article.content === 'string' ? article.content : JSON.stringify(article.content)}
        articleTitle={article.title}
      />
    </div>
  )
}