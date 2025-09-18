'use client'

import { motion } from 'framer-motion'
import { Search, Sparkles, BookOpen, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import categoriesBg from '@/../assets/images/pexels-weekendplayer-187041.jpg'

import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export function CategoriesHero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDark, setIsDark] = useState(false)

  // Track theme to adapt the curved wave color to the next section
  // and adjust hero background per theme.
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative overflow-hidden text-slate-900 dark:text-white">
      {/* Background: light brand color in light, premium dark gradient in dark */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[rgb(230,229,255)] dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
      </div>
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={categoriesBg}
          alt="Categories background"
          fill
          priority
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-transparent" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Your
              <span className="block bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Perfect Read
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/80 mb-8 leading-relaxed">
              From market analysis to lifestyle insights, explore our diverse collection 
              of expertly curated categories designed to inform and inspire.
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <BookOpen className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Expert Content</h3>
              <p className="text-white/70 text-sm">Curated by industry professionals</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Trending Topics</h3>
              <p className="text-white/70 text-sm">Stay ahead with latest insights</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Sparkles className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Fresh Perspectives</h3>
              <p className="text-white/70 text-sm">Unique takes on important topics</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom wave (matches next section background) */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill={isDark ? '#0b0b12' : 'rgb(248 250 252)'}
          />
        </svg>
      </div>
    </section>
  )
}