'use client'

import Link from 'next/link'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

const quickLinks = [
  { href: '/articles', label: 'Articles' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gray-200 dark:border-white/10 bg-[#0b0b12]">
      {/* Subtle background gradient and pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b12] via-[#0e0e18] to-[#0b0b12]" />
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #9B8CFF 2px, transparent 2px), radial-gradient(circle at 80% 60%, #E7E3FF 2px, transparent 2px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Soft aurora gradient blobs for depth (dark mode) */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(closest-side, rgba(120,98,240,0.35), transparent)' }} />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-72 w-72 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(closest-side, rgba(231,227,255,0.25), transparent)' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="bg-gradient-to-r from-brand-violet-dark to-brand-violet bg-clip-text text-2xl font-extrabold text-transparent">
                Monday Sippin&apos;
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Premium crypto and finance insights delivered in short, power-packed bits. 
              Perfect for your Monday morning coffee.
            </p>
            
            {/* Newsletter Signup */}
            <NewsletterSignup variant="footer" className="max-w-lg" />
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-gray-600 dark:text-gray-300">
          <p className="text-center sm:text-left">&copy; 2025 Monday Sippin&apos;. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/sitemap" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
              Sitemap
            </Link>
            <Link href="/rss" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
              RSS Feed
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}