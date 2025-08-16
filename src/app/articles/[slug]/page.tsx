import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/articles'
import { articleService } from '@/lib/database'
import { Metadata } from 'next'
import { getMockArticleBySlug } from '@/lib/mock-content'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const article = await articleService.getArticleBySlug(slug)
    
    if (!article) {
      // Fallback to mock metadata if available
      const mock = getMockArticleBySlug(slug)
      if (mock) {
        return {
          title: mock.title,
          description: mock.excerpt || `Read ${mock.title} on Monday Sippin'`,
          openGraph: {
            title: mock.title,
            description: mock.excerpt || `Read ${mock.title} on Monday Sippin'`,
            type: 'article',
            publishedTime: mock.published_at || mock.created_at,
            authors: mock.author ? [mock.author.full_name || mock.author.email] : [],
            images: mock.featured_image ? [
              { url: mock.featured_image, width: 1200, height: 630, alt: mock.title }
            ] : [],
          },
          twitter: {
            card: 'summary_large_image',
            title: mock.title,
            description: mock.excerpt || `Read ${mock.title} on Monday Sippin'`,
            images: mock.featured_image ? [mock.featured_image] : [],
          },
          keywords: mock.tags?.map(t => t.name).join(', '),
        }
      }
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.'
      }
    }

    return {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || `Read ${article.title} on Monday Sippin'`,
      openGraph: {
        title: article.title,
        description: article.excerpt || `Read ${article.title} on Monday Sippin'`,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        authors: article.author ? [article.author.full_name || article.author.email] : [],
        images: article.featured_image ? [
          {
            url: article.featured_image,
            width: 1200,
            height: 630,
            alt: article.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || `Read ${article.title} on Monday Sippin'`,
        images: article.featured_image ? [article.featured_image] : [],
      },
      keywords: article.tags?.map(t => t.name).join(', '),
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ArticlePage] Error generating metadata, trying mock fallback:', error)
    }
    // Try mock fallback on error
    const { slug } = await params
    const mock = getMockArticleBySlug(slug)
    if (mock) {
      return {
        title: mock.title,
        description: mock.excerpt || `Read ${mock.title} on Monday Sippin'`,
      }
    }
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }
}

export default async function ArticlePageRoute({ params }: ArticlePageProps) {
  try {
    const { slug } = await params
    const article = await articleService.getArticleBySlug(slug)
    
    if (!article) {
      // Fallback to mock article for development/demo
      const mock = getMockArticleBySlug(slug)
      if (mock) {
        return <ArticlePage article={mock} />
      }
      notFound()
    }

    // Only show published articles to non-authenticated users
    if (article.status !== 'published') {
      notFound()
    }

    return <ArticlePage article={article} />
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ArticlePage] Error fetching article, trying mock fallback:', error)
    }
    const { slug } = await params
    const mock = getMockArticleBySlug(slug)
    if (mock) {
      return <ArticlePage article={mock} />
    }
    notFound()
  }
}