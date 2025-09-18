'use client'

import { Article } from '@/types'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { LottieHero } from '@/components/media/LottieHero'
import logo from '../../../assets/images/monday-sippin-logo.png'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BusinessmanCoffee from '@/../assets/images/Businessmanhavingcoffee.json'

interface HeroSectionProps {
  featuredArticle: Article | null
  loading?: boolean
}

export function HeroSection({ featuredArticle, loading }: HeroSectionProps) {
  if (loading) {
    return (
      <section className="relative overflow-hidden text-slate-900 dark:text-white">
        <div className="absolute inset-0 bg-[rgb(230,229,255)] dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 lg:pt-12 pb-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left skeleton */}
            <div className="space-y-5">
              <div className="h-10 md:h-12 lg:h-16 w-3/4 rounded-lg bg-white/60 dark:bg-slate-800 animate-pulse" />
              <div className="h-10 md:h-12 lg:h-16 w-2/3 rounded-lg bg-white/60 dark:bg-slate-800 animate-pulse" />
              <div className="h-6 w-full max-w-3xl rounded-md bg-white/60 dark:bg-slate-800 animate-pulse" />
              <div className="h-6 w-11/12 max-w-3xl rounded-md bg-white/60 dark:bg-slate-800 animate-pulse" />
              <div className="h-6 w-10/12 max-w-3xl rounded-md bg-white/60 dark:bg-slate-800 animate-pulse" />
            </div>
            {/* Right skeleton (animation placeholder) */}
            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] rounded-2xl bg-white/60 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      className="relative overflow-hidden text-slate-900 dark:text-white -mt-6 md:-mt-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Background: consistent light color in both modes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[rgb(230,229,255)]" />
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 lg:pt-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Left side - Brand and Newsletter */}
            <motion.div
              className="order-2 lg:order-1 text-center lg:text-left space-y-6 relative lg:-mt-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Subtle background accent for the text area */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl border border-white/30 backdrop-blur-sm -z-10" />
              <div className="space-y-3 lg:space-y-4 p-8 lg:p-10">
                
                {/* Brand logo with enhanced 3D depth */}
                <div className="flex justify-center lg:justify-start mb-2">
                  <Image
                    src={logo}
                    alt="Monday Sippin'"
                    priority
                    className="h-20 md:h-28 lg:h-36 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)] filter brightness-105 contrast-110"
                    style={{
                      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15)) drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                    }}
                  />
                </div>
                
                {/* Animated rotating subtitle copy */}
                <AnimatedSubtitle />
              </div>
              
            </motion.div>

            {/* Right side - Lottie animation */}
            <motion.div
              className="order-1 lg:order-2 w-full h-80 sm:h-96 md:h-[28rem] lg:h-[28rem] xl:h-[32rem]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <LottieHero className="w-full h-full" loop autoplay speed={1} jsonData={BusinessmanCoffee} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

// Animated subtitle component cycling through expanded copy
function AnimatedSubtitle() {
  const lines = [
    'Your Monday morning briefing on crypto markets, macro trends, and on-chain insights that actually matter for your portfolio.',
    'Cut through the noise with curated analysis that connects traditional finance with digital asset movements.',
    'Weekly deep-dives into market signals, regulatory shifts, and emerging opportunities — delivered in digestible 5-minute reads.',
    'Join thousands of investors who start their week with actionable intelligence, not speculation.'
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % lines.length)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-[9rem] md:h-[7.5rem] relative overflow-hidden">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-lg md:text-xl text-black dark:text-black leading-relaxed max-w-3xl mx-auto lg:mx-0"
      >
        {lines[index]}
      </motion.div>
    </div>
  )
}