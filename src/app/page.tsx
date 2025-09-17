'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { HeroSection, LatestArticles, TrendingArticles, PopularCategories } from '@/components/homepage'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { LottieHero } from '@/components/media/LottieHero'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CoffeeTimeAnim from '@/../assets/images/CoffeTime.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GreenCoffeeAnim from '@/../assets/images/greencoffee.json'
import { useEffect, useState } from 'react'
import { useHomepageData } from '@/hooks/useHomepageData'
import Image from 'next/image'
import newsletterImg from '../../assets/images/pexels-alesiakozik-6771607.jpg'

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    try {
      const update = () => setIsDark(document.documentElement.classList.contains('dark'))
      update()
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => update()
      mql.addEventListener?.('change', onChange)
      const observer = new MutationObserver(update)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      return () => {
        mql.removeEventListener?.('change', onChange)
        observer.disconnect()
      }
    } catch {}
  }, [])
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

      {/* Newsletter Signup Section (clean, no background) */}
      <section className="py-16" id="newsletter">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <NewsletterSignup className="shadow-xl" />
          </div>
        </div>
      </section>

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


      {/* Big Sippin’ Section (Lottie + copy) */}
      <section className="relative py-24 bg-gradient-to-b from-[rgb(230,229,255)] to-white dark:from-slate-900 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy in a soft glass card */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-4 sm:p-6 lg:p-8 shadow-lg dark:bg-white/5 dark:border-white/10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                  Big Sippin’
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-200 mb-4 sm:mb-6 max-w-2xl">
                  Kickstart your Monday with a concise, power-packed brief on the crypto and macro trends that matter. Curated signals, on-chain + macro alignment, no fluff.
                </p>
                <ul className="grid gap-2 text-slate-700 dark:text-slate-200 text-xs sm:text-sm sm:grid-cols-2 mb-4 sm:mb-6">
                  <li>• Actionable signals</li>
                  <li>• Macro + on-chain</li>
                  <li>• 3–5 min read</li>
                  <li>• Weekly, no spam</li>
                </ul>
                <a href="#newsletter" className="inline-flex">
                  <button className="group inline-flex items-center rounded-xl bg-brand-violet text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all">
                    Join Big Sippin’
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"><path d="M13.5 4.5L21 12l-7.5 7.5m7.5-7.5H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </a>
              </div>
            </div>
            {/* Lottie */}
            <div className="order-1 lg:order-2 w-full h-64 sm:h-72 md:h-80 lg:h-[28rem] xl:h-[32rem]">
              <LottieHero className="w-full h-full" loop autoplay speed={1} jsonData={isDark ? GreenCoffeeAnim : CoffeeTimeAnim} />
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}
