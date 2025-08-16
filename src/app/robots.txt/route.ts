import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mondaysippin.com';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /profile/
Disallow: /test-*/

# Allow specific API endpoints for SEO
Allow: /api/articles/
Allow: /api/categories/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}