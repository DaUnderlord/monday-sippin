import { UserRole } from '@/types'

// Define permission levels
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  reader: 1,
  author: 2,
  editor: 3,
  admin: 4
}

// Permission checking functions
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => hasRole(userRole, role))
}

export function canAccessRoute(userRole: UserRole, routeRoles: UserRole[]): boolean {
  return routeRoles.includes(userRole)
}

// Specific permission checks
export const permissions = {
  // Content management
  canCreateArticle: (role: UserRole) => hasRole(role, 'author'),
  canEditOwnArticle: (role: UserRole) => hasRole(role, 'author'),
  canEditAnyArticle: (role: UserRole) => hasRole(role, 'editor'),
  canDeleteOwnArticle: (role: UserRole) => hasRole(role, 'author'),
  canDeleteAnyArticle: (role: UserRole) => hasRole(role, 'editor'),
  canPublishArticle: (role: UserRole) => hasRole(role, 'editor'),
  
  // User management
  canViewUsers: (role: UserRole) => hasRole(role, 'admin'),
  canEditUsers: (role: UserRole) => hasRole(role, 'admin'),
  canDeleteUsers: (role: UserRole) => hasRole(role, 'admin'),
  canChangeUserRoles: (role: UserRole) => hasRole(role, 'admin'),
  
  // System management
  canAccessAdmin: (role: UserRole) => hasRole(role, 'admin'),
  canManageCategories: (role: UserRole) => hasRole(role, 'editor'),
  canManageTags: (role: UserRole) => hasRole(role, 'editor'),
  canManageFilters: (role: UserRole) => hasRole(role, 'editor'),
  canViewAnalytics: (role: UserRole) => hasRole(role, 'editor'),
  
  // Newsletter management
  canManageNewsletter: (role: UserRole) => hasRole(role, 'editor'),
  canSendNewsletter: (role: UserRole) => hasRole(role, 'admin'),
  
  // Profile management
  canEditOwnProfile: (role: UserRole) => hasRole(role, 'reader'),
  canViewOwnProfile: (role: UserRole) => hasRole(role, 'reader'),
}

// Route-based permissions
export const routePermissions = {
  '/admin': ['admin'],
  '/admin/*': ['admin'],
  '/dashboard': ['admin', 'editor', 'author'],
  '/profile': ['admin', 'editor', 'author', 'reader'],
  '/create': ['admin', 'editor', 'author'],
  '/edit/*': ['admin', 'editor', 'author'],
  '/users': ['admin'],
  '/analytics': ['admin', 'editor'],
  '/newsletter': ['admin', 'editor'],
  '/settings': ['admin']
} as const

// Helper to get route permissions
export function getRoutePermissions(pathname: string): UserRole[] {
  // Check exact match first
  if (pathname in routePermissions) {
    return routePermissions[pathname as keyof typeof routePermissions]
  }
  
  // Check wildcard matches
  for (const [route, roles] of Object.entries(routePermissions)) {
    if (route.endsWith('/*')) {
      const basePath = route.slice(0, -2)
      if (pathname.startsWith(basePath)) {
        return roles
      }
    }
  }
  
  // Default to public access
  return ['admin', 'editor', 'author', 'reader']
}

// Article ownership checking
export function canEditArticle(userRole: UserRole, userId: string, articleAuthorId: string): boolean {
  // Admins and editors can edit any article
  if (hasRole(userRole, 'editor')) {
    return true
  }
  
  // Authors can only edit their own articles
  if (hasRole(userRole, 'author') && userId === articleAuthorId) {
    return true
  }
  
  return false
}

export function canDeleteArticle(userRole: UserRole, userId: string, articleAuthorId: string): boolean {
  // Admins and editors can delete any article
  if (hasRole(userRole, 'editor')) {
    return true
  }
  
  // Authors can only delete their own articles
  if (hasRole(userRole, 'author') && userId === articleAuthorId) {
    return true
  }
  
  return false
}