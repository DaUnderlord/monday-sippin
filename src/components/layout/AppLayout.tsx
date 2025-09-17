import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { SplashScreen } from '@/components/media/SplashScreen'

interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-slate-800 dark:text-slate-100">
      <SplashScreen />
      <Header />
      <main className={`flex-1 ${className || ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}