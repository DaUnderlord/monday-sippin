import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// Define protected routes and their required roles
// Note: Admin routes are handled client-side for now to avoid SSR auth cookie mismatch loops
const protectedRoutes = {
  // '/admin/*' is intentionally NOT SSR-protected. Client-side guards handle it to avoid redirect loops.
  '/profile': ['admin', 'editor', 'author', 'reader'],
  '/dashboard': ['admin', 'editor', 'author'],
  '/create': ['admin', 'editor', 'author'],
  '/edit/*': ['admin', 'editor', 'author']
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  // Allow base admin to render; client-side controls visibility, and subpaths are still protected
  '/admin',
  // Make all admin subpaths public at the middleware layer to prevent SSR loops
  '/admin/*',
  // Temporarily allow admin create-article page to bypass SSR auth to avoid redirect loop
  '/admin/articles/new',
  '/articles/*',
  '/categories/*',
  '/search',
  '/about',
  '/contact'
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('/*')) {
      return pathname.startsWith(route.slice(0, -2))
    }
    return pathname === route
  })
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (route.endsWith('/*')) {
      const base = route.slice(0, -2)
      // Only match true subpaths like /admin/..., not the exact base /admin
      if (pathname !== base && pathname.startsWith(base + '/')) {
        return roles
      }
    } else if (pathname === route) {
      return roles
    }
  }
  return null
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return res
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return res
  }

  // Create Supabase client
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname)

  if (requiredRoles) {
    // Route requires authentication
    if (!session) {
      // Redirect to login with return URL
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      // Profile not found, redirect to login
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has required role
    if (!requiredRoles.includes(profile.role)) {
      // User doesn't have required role, redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}