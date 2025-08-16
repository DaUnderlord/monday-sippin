'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    TrendingUp,
    DollarSign,
    Briefcase,
    Lightbulb,
    Heart,
    Globe,
    ArrowRight,
    Users,
    Clock,
    BookOpen
} from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import type { Category as HookCategory } from '@/hooks/useCategories'
import Link from 'next/link'

const categoryIcons: Record<string, any> = {
    'market-analysis': TrendingUp,
    'investment': DollarSign,
    'business': Briefcase,
    'technology': Lightbulb,
    'lifestyle': Heart,
    'global': Globe,
    'default': BookOpen
}

const categoryColors: Record<string, string> = {
    'market-analysis': 'from-blue-500 to-cyan-500',
    'investment': 'from-green-500 to-emerald-500',
    'business': 'from-purple-500 to-violet-500',
    'technology': 'from-orange-500 to-red-500',
    'lifestyle': 'from-pink-500 to-rose-500',
    'global': 'from-indigo-500 to-blue-500',
    'default': 'from-gray-500 to-slate-500'
}

export function CategoriesGrid({ initialCategories }: { initialCategories?: HookCategory[] }) {
    const { categories, loading } = useCategories(initialCategories)
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

    if (loading) {
        return (
            <section className="py-20 bg-white dark:bg-[#0b0b12] text-gray-900 dark:text-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="rounded-2xl h-64 bg-gray-200 dark:bg-slate-800"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-[#0b0b12] dark:to-[#0b0b12] text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Browse by Category
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Dive deep into topics that matter to you. Each category is carefully curated
                        with expert insights and actionable content.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories?.map((category, index) => {
                        const IconComponent = categoryIcons[category.slug] || categoryIcons.default
                        const colorClass = categoryColors[category.slug] || categoryColors.default

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                onHoverStart={() => setHoveredCategory(category.id)}
                                onHoverEnd={() => setHoveredCategory(null)}
                            >
                                <Link href={`/categories/${category.slug}`}>
                                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white dark:bg-[#11121a]">
                                        {/* Gradient background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                        {/* Animated background pattern */}
                                        <div className="absolute inset-0 opacity-5">
                                            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-current transform rotate-12 group-hover:rotate-45 transition-transform duration-700"></div>
                                            <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border border-current transform -rotate-12 group-hover:-rotate-45 transition-transform duration-700"></div>
                                        </div>

                                        <CardContent className="relative p-8 h-full flex flex-col">
                                            {/* Icon */}
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>

                                            {/* Category info */}
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                                    {category.name}
                                                </h3>

                                                {category.description && (
                                                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                                        {category.description}
                                                    </p>
                                                )}

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>{Math.floor(Math.random() * 50) + 10} articles</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{Math.floor(Math.random() * 1000) + 100} readers</span>
                                                    </div>
                                                </div>

                                                {/* Popular badge */}
                                                {index < 3 && (
                                                    <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                                        Popular
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* CTA */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                    Explore Category
                                                </span>
                                                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                                            </div>
                                        </CardContent>

                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 dark:from-white/0 dark:to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                    </Card>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Featured categories section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-20 text-center"
                >
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#11121a] dark:to-[#0f1018] rounded-3xl p-12">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Can't find what you're looking for?
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Use our powerful search to find articles across all categories,
                            or browse our complete article archive.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl">
                                <Link href="/search">
                                    Advanced Search
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border-2 border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500 px-8 py-3 rounded-xl">
                                <Link href="/articles">
                                    Browse All Articles
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}