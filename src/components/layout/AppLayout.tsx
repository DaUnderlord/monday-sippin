import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-[#0b0b12] dark:text-gray-100">
      <Header />
      <main className={`flex-1 ${className || ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}