"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/supabase'
import { LoginForm } from '@/types'
import { supabase } from '@/lib/supabase'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const [checking, setChecking] = useState(true)
  const [alreadySignedIn, setAlreadySignedIn] = useState(false)

  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in -> redirect
  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setAlreadySignedIn(true)
          router.replace(redirectTo)
        }
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [redirectTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Add a soft timeout so the UI doesn't hang indefinitely on network failures
      const withTimeout = <T,>(p: Promise<T>, ms = 12000) =>
        Promise.race([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ])

      const { error } = (await withTimeout(auth.signIn(formData.email, formData.password))) as Awaited<ReturnType<typeof auth.signIn>>
      if (error) setError(error.message)
      else router.push(redirectTo)
    } catch (err: any) {
      if (err?.message === 'timeout') {
        setError('Sign-in timed out. Please check your internet connection and Supabase URL, then try again.')
      } else {
        setError('Failed to contact auth server. Verify NEXT_PUBLIC_SUPABASE_URL/ANON_KEY and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await auth.signInWithProvider(provider, redirectTo)
      if (error) setError(error.message)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // While we know the user is already logged in and redirect is pending, show a small loader
  if (!submitting && alreadySignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your Monday Sippin' account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checking && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={submitting} />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={submitting} />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={submitting || checking}>{submitting ? 'Signing in...' : 'Sign in'}</Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={submitting || checking}>Google</Button>
            <Button variant="outline" onClick={() => handleSocialLogin('github')} disabled={submitting || checking}>GitHub</Button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">Forgot your password?</Link>
            <div className="text-sm text-muted-foreground">Don't have an account? <Link href="/auth/register" className="text-primary hover:underline">Sign up</Link></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}