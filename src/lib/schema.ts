import { Article, Category, Profile } from '@/types';

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mondaysippin.com';

export function generateOrganizationSchema(): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Monday Sippin'",
    description: 'Premium crypto and finance insights for small business owners and young professionals',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: [
      'https://twitter.com/mondaysippin',
      'https://linkedin.com/company/mondaysippin',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@mondaysippin.com',
    },
  };
}

export function generateWebsiteSchema(): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Monday Sippin'",
    description: 'Premium crypto and finance insights for small business owners and young professionals',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateArticleSchema(article: Article, category?: Category): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.featuredImage ? `${SITE_URL}${article.featuredImage}` : `${SITE_URL}/images/og-default.jpg`,
    url: `${SITE_URL}/articles/${article.slug}`,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    wordCount: article.content ? JSON.stringify(article.content).length / 5 : undefined, // Rough estimate
    timeRequired: `PT${article.readingTime || 5}M`,
    author: {
      '@type': 'Person',
      name: article.author?.fullName || 'Monday Sippin Team',
      url: `${SITE_URL}/authors/${article.author?.id}`,
    },
    publisher: {
      '@type': 'Organization',
      name: "Monday Sippin'",
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${article.slug}`,
    },
  };

  if (category) {
    schema.articleSection = category.name;
  }

  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.map(tag => tag.name).join(', ');
  }

  return schema;
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateNewsletterSchema(): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsletterService',
    name: "Monday Sippin' Newsletter",
    description: 'Weekly crypto and finance insights delivered to your inbox',
    provider: {
      '@type': 'Organization',
      name: "Monday Sippin'",
    },
  };
}

export function renderSchemaMarkup(schema: SchemaMarkup | SchemaMarkup[]): string {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return schemas.map(s => JSON.stringify(s, null, 0)).join('\n');
}