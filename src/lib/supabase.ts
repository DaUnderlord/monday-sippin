import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Ensure we don't create multiple client instances in the same browser context (HMR/dev)
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: ReturnType<typeof createClient<Database>> | undefined
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const missingEnvMessage =
  'Supabase env not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.'

// Client for browser/client-side operations (singleton)
export const supabase = (() => {
  // If env is missing, export a safe proxy that throws when used, so app can still render
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('[supabase] ' + missingEnvMessage)
    }
    const proxy = new Proxy({} as any, {
      get() {
        throw new Error(missingEnvMessage)
      },
    })
    return proxy as ReturnType<typeof createClient<Database>>
  }

  if (typeof window !== 'undefined') {
    if (!globalThis.__supabase__) {
      globalThis.__supabase__ = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    }
    return globalThis.__supabase__
  }
  // On the server, just return a fresh client (server doesn’t share browser storage)
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
})()

// Admin client for server-side operations that require elevated permissions
// IMPORTANT: Only call this on the server. Never in client components.
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('[supabaseAdmin] Do not use admin client on the client-side')
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('[supabaseAdmin] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
  }
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signInWithProvider: async (provider: 'github' | 'google', redirectTo?: string) => {
    const cb = new URL(`${window.location.origin}/auth/callback`)
    if (redirectTo) cb.searchParams.set('redirectTo', redirectTo)
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: cb.toString()
      }
    })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
  },

  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({
      password
    })
  },

  getUser: async () => {
    return await supabase.auth.getUser()
  },

  getSession: async () => {
    return await supabase.auth.getSession()
  }
}