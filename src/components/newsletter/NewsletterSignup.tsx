'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface NewsletterSignupProps {
  variant?: 'hero' | 'inline' | 'footer'
  className?: string
  onImage?: boolean
}

export function NewsletterSignup({ variant = 'inline', className = '', onImage = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // For now, we'll simulate the subscription
      // In a real implementation, this would call /api/newsletter/subscribe
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubscribed(true)
      setEmail('')
      
      toast({
        title: 'Successfully subscribed!',
        description: 'Welcome to Monday Sippin\'. Check your email for confirmation.',
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: 'Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative overflow-hidden rounded-2xl border border-emerald-200/40 bg-emerald-50 p-5 sm:p-6 ${className}`}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="flex items-start sm:items-center gap-3">
          <div className="shrink-0 rounded-full bg-white p-2 shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <Typography variant="h6" className="text-emerald-900 font-semibold">You're in! 🎉</Typography>
            <Typography variant="body-small" className="text-emerald-800/80">
              Thanks for subscribing to Monday Sippin'. Check your inbox to confirm your email.
            </Typography>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'hero') {
    return (
      <motion.form 
        onSubmit={handleSubmit} 
        className={`w-full ${className}`}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <Input
            type="email"
            placeholder="Enter your email to get Monday insights"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-full bg-white/15 border-white/30 text-white placeholder:text-white/70 focus:bg-white/25 focus:border-white/60"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-full bg-white text-brand-indigo-text hover:bg-white/90 font-semibold px-6"
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </div>
        <div className="mt-3 text-center">
          <Typography variant="small" className="text-white/80">No spam. Unsubscribe anytime.</Typography>
        </div>
      </motion.form>
    )
  }

  if (variant === 'footer') {
    return (
      <motion.div 
        className={`space-y-3 ${className}`}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-brand-violet-tint" />
          <Typography variant="body-small" className="text-white/90">Join Big Sippin’</Typography>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-24"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="absolute right-1 top-1 h-8 rounded-full bg-gradient-to-r from-brand-violet-dark to-brand-violet hover:from-brand-violet-dark/90 hover:to-brand-violet/90 text-white px-3"
            >
              {loading ? '…' : 'Join'}
            </Button>
          </div>
        </form>
        <Typography variant="body-small" className="text-white/60">Weekly. No spam.</Typography>
      </motion.div>
    )
  }

  // Default inline variant (revamped)
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-3xl group ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Background adapts if placed on an image */}
      {onImage ? (
        <>
          <div className="absolute inset-0 bg-white/10" />
          <div className="absolute inset-0 backdrop-blur-md" />
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-violet" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_100%_0%,rgba(255,255,255,0.18),transparent)]" />
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </>
      )}

      <div className="relative p-6 sm:p-10 text-white">
        <div className="grid gap-8 sm:grid-cols-5 sm:items-center">
          {/* Left: Heading + bullets */}
          <div className="sm:col-span-3 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Mail className="h-4 w-4 text-brand-violet-tint" />
              Big Sippin’
            </div>
            <Typography variant="h3" className="font-extrabold leading-tight">
              Start your week smarter with curated crypto & finance briefs
            </Typography>
            <ul className="grid gap-2 text-white/90 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2"><CheckCircle className={`${onImage ? 'text-white/85' : 'text-emerald-300'} h-4 w-4`} /> Actionable signals</li>
              <li className="flex items-center gap-2"><CheckCircle className={`${onImage ? 'text-white/85' : 'text-emerald-300'} h-4 w-4`} /> Macro + on-chain</li>
              <li className="flex items-center gap-2"><CheckCircle className={`${onImage ? 'text-white/85' : 'text-emerald-300'} h-4 w-4`} /> No noise, just signal</li>
              <li className="flex items-center gap-2"><CheckCircle className={`${onImage ? 'text-white/85' : 'text-emerald-300'} h-4 w-4`} /> 3–5 min read</li>
            </ul>
          </div>

          {/* Right: Form card */}
          <div className="sm:col-span-2">
            <form onSubmit={handleSubmit} className={`relative rounded-2xl p-4 sm:p-5 border shadow-2xl transition-all ${onImage ? 'bg-white/10 border-white/25 backdrop-blur-md' : 'bg-white/10 border-white/20 backdrop-blur-md'} group-hover:shadow-[0_20px_50px_-12px_rgba(104,69,255,0.35)]`}>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl bg-white/15 border-white/30 text-white placeholder:text-white/70 pr-32 focus:bg-white/25 focus:border-white/60"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1 top-1 h-10 rounded-xl bg-white text-brand-indigo-text hover:bg-white/90 font-semibold px-4"
                  >
                    {loading ? 'Joining…' : 'Join Big Sippin’'}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-white/75">
                  <span>No spam. Unsubscribe anytime.</span>
                  <span className="inline-flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Privacy first</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}