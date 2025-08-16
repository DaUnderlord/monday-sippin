import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mondaysippin.com';

interface SitemapUrl {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const urls: SitemapUrl[] = [];

    // Static pages
    urls.push(
      {
        url: `${SITE_URL}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    );

    // Get published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (articles) {
      articles.forEach(article => {
        urls.push({
          url: `${SITE_URL}/articles/${article.slug}`,
          lastModified: new Date(article.updated_at),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      });
    }

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, created_at')
      .order('name');

    if (categories) {
      categories.forEach(category => {
        urls.push({
          url: `${SITE_URL}/categories/${category.slug}`,
          lastModified: new Date(category.created_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }

    // Generate XML sitemap
    const sitemap = generateSitemapXML(urls);

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map(
      ({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}