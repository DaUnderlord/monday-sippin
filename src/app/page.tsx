'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { HeroSection, LatestArticles, TrendingArticles, PopularCategories } from '@/components/homepage'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { useHomepageData } from '@/hooks/useHomepageData'
import Image from 'next/image'
import newsletterImg from '../../assets/images/pexels-alesiakozik-6771607.jpg'

export default function Home() {
  const {
    featuredArticle,
    latestArticles,
    trendingArticles,
    popularCategories,
    loading,
    error
  } = useHomepageData()

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Homepage
          </h1>
          <p className="text-gray-600">
            {error}
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Hero Section with Featured Article */}
      <HeroSection 
        featuredArticle={featuredArticle}
        loading={loading}
      />

      {/* Latest Articles Grid */}
      <LatestArticles 
        articles={latestArticles}
        loading={loading}
      />

      {/* Trending Articles */}
      <TrendingArticles 
        articles={trendingArticles}
        loading={loading}
      />

      {/* Popular Categories */}
      <PopularCategories 
        categories={popularCategories}
        loading={loading}
      />

      {/* Newsletter Signup Section (background image) */}
      <section className="relative py-20">
        <Image
          src={newsletterImg}
          alt="Coffee and workspace setup for Monday Sippin'"
          fill
          priority={false}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl py-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
                Join the Monday Sippin' Newsletter
              </h2>
              <p className="text-base text-white/90 mb-8">
                Actionable crypto and finance insights delivered every Monday. Sip your coffee, get smarter—no spam.
              </p>
              <NewsletterSignup variant="inline" onImage className="max-w-xl" />
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}
