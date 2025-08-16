// Database types matching Supabase schema
export type UserRole = 'admin' | 'editor' | 'author' | 'reader';
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type SubscriptionStatus = 'active' | 'unsubscribed' | 'bounced';

// Core database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  color?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Filter {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  level: number;
  order_index: number;
  description?: string;
  created_at: string;
  children?: Filter[];
  articleCount?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any; // JSONB content from Tiptap editor
  featured_image?: string;
  author_id: string;
  category_id?: string;
  status: ArticleStatus;
  published_at?: string;
  reading_time: number;
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  author?: Profile;
  category?: Category;
  tags?: Tag[];
  filters?: Filter[];
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface ArticleFilter {
  article_id: string;
  filter_id: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: SubscriptionStatus;
  subscribed_at: string;
  unsubscribed_at?: string;
  preferences: {
    frequency: 'weekly' | 'monthly';
    categories: string[];
  };
  source: string;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  featured_image?: string;
  category_id?: string;
  status: ArticleStatus;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  filters: string[];
}

export interface ProfileFormData {
  full_name?: string;
  avatar_url?: string;
}

export interface NewsletterFormData {
  email: string;
  preferences?: {
    frequency: 'weekly' | 'monthly';
    categories: string[];
  };
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
}