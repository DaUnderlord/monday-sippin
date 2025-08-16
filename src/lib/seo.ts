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
    image: article.featuredImage || DEFAULT_SEO.image,
    url: `/articles/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedAt?.toISOString(),
    modifiedTime: article.updatedAt?.toISOString(),
    author: article.author?.fullName || 'Monday Sippin Team',
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