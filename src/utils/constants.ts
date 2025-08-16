// Brand colors based on design document
export const BRAND_COLORS = {
  deepTeal: '#1B4B5A',
  warmOrange: '#F4A261',
  richPurple: '#6B46C1',
  sageGreen: '#52B788',
  coralPink: '#E76F51',
} as const

// Gradients
export const BRAND_GRADIENTS = {
  primary: 'from-[#1B4B5A] to-[#F4A261]', // Deep Teal to Warm Orange
  secondary: 'from-[#6B46C1] to-[#E76F51]', // Rich Purple to Coral Pink
  accent: 'from-[#52B788] to-[#1B4B5A]', // Sage Green to Deep Teal
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  READER: 'reader',
} as const

// Article status
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

// Newsletter subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  UNSUBSCRIBED: 'unsubscribed',
  BOUNCED: 'bounced',
} as const