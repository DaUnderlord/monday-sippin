'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SearchBar } from '@/components/search/SearchBar'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import logo from '../../../assets/images/monday-sippin-logo.png'

const navigationLinks = [
  { href: '/articles', label: 'Articles' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const { user, signOut } = useAuth()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      const has = document.documentElement.classList.contains('dark')
      setIsDark(has)
    } catch {}
  }, [])

  const toggleTheme = () => {
    try {
      const el = document.documentElement.classList
      const next = !el.contains('dark')
      el.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      setIsDark(next)
    } catch {}
  }

  return (
    <header className="sticky top-0 z-50 bg-[rgb(230,229,255)]/50 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[rgb(230,229,255)]/40 ring-1 ring-slate-900/5 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={logo}
              alt="Monday Sippin' logo"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar 
              placeholder="Search articles..."
              className="w-full"
            />
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2" aria-label="Toggle theme">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    {user.full_name || user.email}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="#newsletter">
                  <Button size="sm" className="bg-gradient-to-r from-[#1B4B5A] to-[#F4A261] hover:opacity-90">
                    Newsletter
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Search & Menu */}
          <div className="flex items-center space-x-2 lg:hidden">
            {/* Theme toggle (mobile) */}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 lg:hidden" aria-label="Toggle theme">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {/* Mobile Search Button */}
            <Link href="/search">
              <Button variant="ghost" size="sm" className="p-2">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Image
                      src={logo}
                      alt="Monday Sippin' logo"
                      width={140}
                      height={36}
                      className="h-7 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Search */}
                  <div className="md:hidden">
                    <SearchBar 
                      placeholder="Search articles..."
                      className="w-full"
                    />
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-4">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {user && (
                      <>
                        {user.role === 'admin' && (
                          <Link href="/admin" className="text-lg font-medium">
                            Admin Dashboard
                          </Link>
                        )}
                      </>
                    )}
                  </nav>

                  {/* User Actions */}
                  <div className="border-t pt-6">
                    {user ? (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          Signed in as {user.full_name || user.email}
                        </div>
                        <Link href="/profile" className="block">
                          <Button variant="ghost" className="w-full">
                            Profile
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={signOut}
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="#newsletter" className="block">
                          <Button className="w-full bg-gradient-to-r from-[#1B4B5A] to-[#F4A261] hover:opacity-90">
                            Newsletter
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}