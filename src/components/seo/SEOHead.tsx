'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  article?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
    section?: string
    tags?: string[]
  }
  noindex?: boolean
}

export function SEOHead({
  title = 'Monday Sippin\' - Premium Crypto & Finance Insights',
  description = 'Premium crypto & finance insights delivered in short, power-packed bits. Perfect for your Monday morning coffee.',
  keywords = ['crypto', 'finance', 'investment', 'market analysis', 'blockchain'],
  image = '/images/og-default.jpg',
  article,
  noindex = false
}: SEOHeadProps) {
  const pathname = usePathname()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mondaysippin.com'
  const fullUrl = `${siteUrl}${pathname}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': article ? 'Article' : 'WebSite',
    name: title,
    description,
    url: fullUrl,
    ...(article && {
      headline: title,
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'Monday Sippin\'',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/images/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl
      },
      image: image.startsWith('http') ? image : `${siteUrl}${image}`,
      articleSection: article.section,
      keywords: article.tags?.join(', ')
    })
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />
      <meta property="og:site_name" content="Monday Sippin'" />
      
      {/* Article specific Open Graph */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${siteUrl}${image}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Google Search Console Verification */}
      {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
      )}
      
      {/* Bing Webmaster Tools */}
      {process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && (
        <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION} />
      )}
    </Head>
  )
}
