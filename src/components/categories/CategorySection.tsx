"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Article, Category } from "@/types";
import { Typography } from "@/components/ui/typography";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CategorySectionProps {
  category: Category;
  articles: Article[];
}

export function CategorySection({ category, articles }: CategorySectionProps) {
  if (!articles || articles.length === 0) return null

  // Mobile scroll shadow logic
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const updateShadows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el
      setShowLeftShadow(scrollLeft > 2)
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 2)
    }
    updateShadows()
    el.addEventListener('scroll', updateShadows, { passive: true })
    window.addEventListener('resize', updateShadows)
    return () => {
      el.removeEventListener('scroll', updateShadows)
      window.removeEventListener('resize', updateShadows)
    }
  }, [])

  return (
    <motion.section
      className="py-10 relative overflow-hidden border-t border-slate-200/60 dark:border-white/10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Subtle parallax gradient textures */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-brand-violet/10 blur-2xl"
        initial={{ opacity: 0.4, y: 0 }}
        whileInView={{ opacity: 0.6 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -right-12 h-48 w-48 rounded-full bg-brand-violet-dark/10 blur-2xl"
        initial={{ opacity: 0.35, y: 0 }}
        whileInView={{ opacity: 0.55 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Header row: name left, See All right */}
      <motion.div
        className="mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div>
          <Typography variant="h2" className="text-2xl font-extrabold tracking-tight">
            {category.name}
          </Typography>
          <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-brand-violet to-brand-violet-dark/80 dark:from-white/40 dark:to-white/20"></div>
        </div>
        <Link
          href={`/categories/${category.slug}`}
          className="group inline-flex items-center text-brand-violet hover:text-brand-violet-dark transition-colors"
        >
          <span className="font-semibold">See All</span>
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      {/* Recent articles row: mobile horizontal snap, grid on md+ */}
      <div className="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 hidden md:block">
        {articles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.06 * idx, ease: 'easeOut' }}
          >
            <div className="group/card transition-transform duration-300 ease-out hover:-translate-y-1"> 
              <div className="transition-shadow duration-300 group-hover/card:shadow-[0_10px_30px_-10px_rgba(104,69,255,0.35)] rounded-2xl"> 
                <ArticleCard
                  article={article}
                  variant="default"
                  showAuthor={true}
                  showCategory={false}
                  showTags={false}
                  showStats={true}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: beautiful horizontal carousel with snap */}
      <div className="md:hidden -mx-4 px-4 relative">
        {/* Dynamic scroll shadows */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-slate-50 to-transparent transition-opacity"
          style={{ opacity: showLeftShadow ? 1 : 0 }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-slate-50 to-transparent transition-opacity"
          style={{ opacity: showRightShadow ? 1 : 0 }}
        />

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-brand-violet/40 scrollbar-track-transparent pb-2"
        >
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              className="snap-start shrink-0 w-[85%] xs:w-[80%] sm:w-[70%] max-w-xs"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.04 * idx, ease: 'easeOut' }}
            >
              <div className="group/card transition-transform duration-300 ease-out hover:-translate-y-0.5">
                <div className="transition-shadow duration-300 group-hover/card:shadow-[0_8px_24px_-12px_rgba(104,69,255,0.35)] rounded-2xl">
                  <ArticleCard
                    article={article}
                    variant="default"
                    showAuthor={true}
                    showCategory={false}
                    showTags={false}
                    showStats={true}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
