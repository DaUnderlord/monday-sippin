'use client'

import { Article } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Eye, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import localFallback from '../../../assets/images/pexels-weekendplayer-187041.jpg'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
  showAuthor?: boolean
  showCategory?: boolean
  showTags?: boolean
  showStats?: boolean
}

export function ArticleCard({ 
  article, 
  variant = 'default',
  showAuthor = true,
  showCategory = true,
  showTags = true,
  showStats = true
}: ArticleCardProps) {
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date(article.created_at)
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true })
  const isHttpUrl = (url?: string) => !!url && /^https?:\/\//i.test(url)
  const imgSrc = isHttpUrl(article.featured_image) ? (article.featured_image as string) : localFallback
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZWVlIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+'

  if (variant === 'featured') {
    return (
      <Link href={`/articles/${article.slug}`} className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40 rounded-xl">
        <Card variant="elevated" className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-0.5">
          <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
            <Image
              src={imgSrc}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={blurDataURL}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {showCategory && article.category && (
              <div className="absolute top-4 left-4">
                <Badge 
                  variant="secondary" 
                  className="bg-white/90 text-brand-deep-teal font-medium"
                >
                  {article.category.name}
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className="p-6 flex flex-1 flex-col">
            <div className="space-y-4 flex-1">
              <Typography variant="h2" className="group-hover:text-brand-warm-orange transition-colors">
                {article.title}
              </Typography>
              
              {article.excerpt && (
                <Typography variant="body" className="text-gray-600 line-clamp-3">
                  {article.excerpt}
                </Typography>
              )}

              <div className="flex items-center justify-between pt-4 border-t mt-auto">
                {showAuthor && article.author && (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={article.author.avatar_url} />
                      <AvatarFallback>
                        {article.author.full_name?.charAt(0) || article.author.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Typography variant="small" className="font-medium">
                        {article.author.full_name || article.author.email}
                      </Typography>
                      <Typography variant="muted" className="text-xs">
                        {timeAgo}
                      </Typography>
                    </div>
                  </div>
                )}

                {showStats && (
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{article.reading_time} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.view_count}</span>
                    </div>
                  </div>
                )}
              </div>

              {showTags && article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {article.tags.slice(0, 3).map((tagRelation) => (
                    <Badge 
                      key={tagRelation.id} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {tagRelation.name}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{article.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/articles/${article.slug}`} className="block group">
        <div className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={imgSrc}
              alt={article.title}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Typography variant="h6" className="group-hover:text-brand-warm-orange transition-colors line-clamp-2">
              {article.title}
            </Typography>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{article.reading_time} min</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/articles/${article.slug}`} className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40 rounded-xl">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-brand-violet/40">
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
          {showCategory && article.category && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="bg-white/90 text-brand-deep-teal font-medium"
              >
                {article.category.name}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex flex-1 flex-col">
          <div className="space-y-3 flex-1">
            <Typography variant="h4" className="group-hover:text-brand-warm-orange transition-colors line-clamp-2">
              {article.title}
            </Typography>
            
            {article.excerpt && (
              <Typography variant="body-small" className="text-gray-600 line-clamp-3">
                {article.excerpt}
              </Typography>
            )}

            <div className="flex items-center justify-between pt-3 border-t mt-auto">
              {showAuthor && article.author && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={article.author.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {article.author.full_name?.charAt(0) || article.author.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Typography variant="small" className="text-gray-600">
                    {article.author.full_name || article.author.email}
                  </Typography>
                </div>
              )}

              {showStats && (
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.reading_time}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{article.view_count}</span>
                  </div>
                </div>
              )}
            </div>

            {showTags && article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {article.tags.slice(0, 2).map((tagRelation) => (
                  <Badge 
                    key={tagRelation.id} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5"
                  >
                    {tagRelation.name}
                  </Badge>
                ))}
                {article.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{article.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}