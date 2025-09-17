import { Metadata } from 'next';
import { Article, Category } from '@/types';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const DEFAULT_SEO = {
  siteName: "Monday Sippin'",
  description: "Premium crypto and finance insights for small business owners and young professionals. Knowledge in short power-packed bits.",
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mondaysippin.com',
  image: '/images/og-default.jpg',
  twitterHandle: '@mondaysippin',
};


export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = DEFAULT_SEO.image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
  } = config;

  const fullTitle = title.includes(DEFAULT_SEO.siteName) 
    ? title 
    : `${title} | ${DEFAULT_SEO.siteName}`;
  
  const fullUrl = url ? `${DEFAULT_SEO.url}${url}` : DEFAULT_SEO.url;
  const fullImage = image.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: DEFAULT_SEO.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type as any,
      publishedTime,
      modifiedTime,
      section,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: DEFAULT_SEO.twitterHandle,
      site: DEFAULT_SEO.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  };

  return metadata;
}

export function generateArticleMetadata(article: Article, category?: Category): Metadata {
  const keywords = [
    ...(article.tags?.map(tag => tag.name) || []),
    category?.name || '',
    'crypto',
    'finance',
    'business',
    'Monday Sippin',
  ].filter(Boolean);

  return generateMetadata({
    title: article.title,
    description: article.excerpt || article.title,
    keywords,
    image: article.featured_image || DEFAULT_SEO.image,
    url: `/articles/${article.slug}`,
    type: 'article',
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    author: article.author?.full_name || 'Monday Sippin Team',
    section: category?.name,
    tags: article.tags?.map(tag => tag.name) || [],
  });
}

export function generateCategoryMetadata(category: Category): Metadata {
  return generateMetadata({
    title: `${category.name} Articles`,
    description: category.description || `Explore ${category.name} articles on Monday Sippin'`,
    keywords: [category.name, 'crypto', 'finance', 'business'],
    url: `/categories/${category.slug}`,
  });
}

export function generateHomeMetadata(): Metadata {
  return generateMetadata({
    title: "Monday Sippin' - Premium Crypto & Finance Insights",
    description: DEFAULT_SEO.description,
    keywords: ['crypto', 'finance', 'business', 'DeFi', 'blockchain', 'investment', 'small business'],
    url: '/',
  });
}

// SEO Analytics Integration
export interface SEOAnalytics {
  trackPageView: (url: string, title: string) => void;
  trackEvent: (action: string, category: string, label?: string) => void;
  trackArticleRead: (articleId: string, title: string, category?: string) => void;
  trackSearch: (query: string, results: number) => void;
}

export function createSEOAnalytics(): SEOAnalytics {
  return {
    trackPageView: (url: string, title: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
          page_path: url,
          page_title: title,
        });
      }
    },
    
    trackEvent: (action: string, category: string, label?: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
        });
      }
    },
    
    trackArticleRead: (articleId: string, title: string, category?: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'article_read', {
          event_category: 'engagement',
          event_label: title,
          custom_parameter_1: articleId,
          custom_parameter_2: category,
        });
      }
    },
    
    trackSearch: (query: string, results: number) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search', {
          search_term: query,
          event_category: 'search',
          custom_parameter_1: results,
        });
      }
    },
  };
}

// Third-party SEO tools integration
export function generateSitemapEntry(url: string, lastModified?: Date, priority = 0.5) {
  return {
    url,
    lastModified: lastModified || new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  };
}

export function generateRobotsTxt() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mondaysippin.com';
  
  return `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`;
}