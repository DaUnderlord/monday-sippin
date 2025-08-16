'use client'

import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import heroBg from '../../../assets/images/pexels-rdne-8370752.jpg'

interface HeroSectionProps {
  featuredArticle: Article | null
  loading?: boolean
}

export function HeroSection({ featuredArticle, loading }: HeroSectionProps) {
  if (loading) {
    return (
      <section className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Brand and Newsletter */}
              <div className="text-center lg:text-left">
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-300/70 dark:bg-gray-700/50 rounded mb-6"></div>
                  <div className="h-6 bg-gray-300/70 dark:bg-gray-700/50 rounded mb-8"></div>
                  <div className="h-12 bg-gray-300/70 dark:bg-gray-700/50 rounded"></div>
                </div>
              </div>
              
              {/* Right side - Featured Article Placeholder */}
              <div className="animate-pulse">
                <div className="h-64 bg-gray-300/70 dark:bg-gray-700/50 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden text-white">
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg}
          alt="Abstract market background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Brand and Newsletter */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                  <Sparkles className="h-6 w-6 text-brand-violet-tint animate-pulse" />
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                    Premium Insights
                  </Badge>
                </div>
                
                <Typography variant="h1" className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">
                  Monday Sippin&apos;
                </Typography>
                
                <Typography variant="lead" className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                  Premium crypto & finance insights delivered in short, power-packed bits. 
                  Perfect for your Monday morning coffee ritual.
                </Typography>
                
                <div className="flex items-center justify-center lg:justify-start space-x-6 text-white/80 text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Weekly Insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>5-min Reads</span>
                  </div>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="pt-4">
                <NewsletterSignup variant="hero" />
              </div>
            </div>
            
            {/* Right side - Featured Article */}
            {featuredArticle ? (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center space-x-2 mb-6">
                    <Badge variant="secondary" className="bg-gradient-to-r from-brand-violet-dark to-brand-violet text-white font-semibold px-3 py-1 shadow-lg">
                      ✨ Featured
                    </Badge>
                    {featuredArticle.category && (
                      <Badge variant="outline" className="border-white/30 text-white/90 backdrop-blur-sm">
                        {featuredArticle.category.name}
                      </Badge>
                    )}
                  </div>
                  
                  {featuredArticle.featured_image && (
                    <div className="relative h-52 w-full mb-6 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-brand-deep-teal to-brand-sage-green">
                      <div className="absolute inset-0 flex items-center justify-center text-white/80">
                        <span className="text-sm">Featured Image</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}
                  
                  <Typography variant="h3" className="text-white mb-4 line-clamp-2 font-bold leading-tight">
                    {featuredArticle.title}
                  </Typography>
                  
                  {featuredArticle.excerpt && (
                    <Typography variant="body" className="text-white/85 mb-6 line-clamp-3 leading-relaxed">
                      {featuredArticle.excerpt}
                    </Typography>
                  )}
                  
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-4 text-sm text-white/70">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredArticle.reading_time} min read</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(featuredArticle.published_at || featuredArticle.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/articles/${featuredArticle.slug}`}>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-brand-indigo-text hover:bg-white/95 font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur opacity-75"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center shadow-2xl">
                  <div className="mb-6">
                    <Sparkles className="h-12 w-12 text-brand-violet-tint mx-auto mb-4 animate-pulse" />
                  </div>
                  <Typography variant="h4" className="text-white mb-4 font-bold">
                    Featured Article Coming Soon
                  </Typography>
                  <Typography variant="body" className="text-white/85 mb-8 leading-relaxed">
                    Our first premium featured article will appear here once published. 
                    Get ready for expert insights!
                  </Typography>
                  <Link href="/articles">
                    <Button 
                      variant="secondary" 
                      className="bg-white text-brand-indigo-text hover:bg-white/95 font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      Browse Articles
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}