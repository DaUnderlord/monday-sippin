import { Metadata } from 'next'
import { AboutHero } from '@/components/about/AboutHero'
import { AboutMission } from '@/components/about/AboutMission'
import { AboutTeam } from '@/components/about/AboutTeam'
import { AboutValues } from '@/components/about/AboutValues'
import { AboutStats } from '@/components/about/AboutStats'
import { AboutNewsletter } from '@/components/about/AboutNewsletter'

export const metadata: Metadata = {
  title: 'About Us - Monday Sippin\'',
  description: 'Learn about Monday Sippin\' - your trusted source for cryptocurrency insights, market analysis, and blockchain education.',
  openGraph: {
    title: 'About Monday Sippin\'',
    description: 'Your trusted source for cryptocurrency insights and blockchain education',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <AboutMission />
      <AboutStats />
      <AboutValues />
      <AboutTeam />
      <AboutNewsletter />
    </div>
  )
}