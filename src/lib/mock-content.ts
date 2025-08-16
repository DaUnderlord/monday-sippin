import { Article, Category, Profile } from '@/types'

// Shared mock authors
const authors: Profile[] = [
  {
    id: 'author-1',
    email: 'sarah@mondaysippin.com',
    full_name: 'Sarah Chen',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    role: 'author' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'author-2',
    email: 'mike@mondaysippin.com',
    full_name: 'Mike Rodriguez',
    avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
    role: 'author' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'author-3',
    email: 'alex@mondaysippin.com',
    full_name: 'Alex Thompson',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'author' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Canonical category list used across the app
export const mockCategories: Category[] = [
  { id: 'market-analysis', name: 'Market Analysis', slug: 'market-analysis', description: 'Stock market insights and macro trends', color: '#1B4B5A', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 1 },
  { id: 'investment', name: 'Investment', slug: 'investment', description: 'Portfolio strategy and asset allocation', color: '#0E7C66', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 2 },
  { id: 'business', name: 'Business', slug: 'business', description: 'Entrepreneurship and operations', color: '#6B46C1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 3 },
  { id: 'technology', name: 'Technology', slug: 'technology', description: 'Tech and innovation shaping finance', color: '#E76F51', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 4 },
  { id: 'lifestyle', name: 'Lifestyle', slug: 'lifestyle', description: 'Money habits and personal growth', color: '#F4A261', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 5 },
  { id: 'global', name: 'Global', slug: 'global', description: 'International markets and geopolitics', color: '#4361EE', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 6 },
  { id: 'crypto-analysis', name: 'Crypto Analysis', slug: 'crypto-analysis', description: 'Deep dives into crypto markets', color: '#0B525B', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 7 },
  { id: 'defi', name: 'DeFi', slug: 'defi', description: 'Decentralized finance protocols', color: '#52B788', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 8 },
  { id: 'personal-finance', name: 'Personal Finance', slug: 'personal-finance', description: 'Money management tips', color: '#EE9B00', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 9 },
  { id: 'business-strategy', name: 'Business Strategy', slug: 'business-strategy', description: 'Strategic insights for leaders', color: '#8B5CF6', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 10 },
  { id: 'taxes', name: 'Taxes', slug: 'taxes', description: 'Tax planning and compliance', color: '#3A0CA3', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), order_index: 11 },
]

function pickAuthor(i: number) {
  return authors[i % authors.length]
}

// Get mock articles by category (slug or id)
export function getMockArticlesByCategory(categoryKey: string, limit = 24): Article[] {
  const normalized = categoryKey.toLowerCase()
  const list = mockAllArticles.filter(a => {
    const idOrSlug = a.category?.id || a.category_id
    return idOrSlug?.toLowerCase() === normalized
  })
  return list.slice(0, limit)
}

function cat(slug: string): Category {
  const c = mockCategories.find(c => c.slug === slug)!
  return c
}

// Helper to build a mock article quickly
function A(
  id: string,
  title: string,
  slug: string,
  excerpt: string,
  featured_image: string,
  categorySlug: string,
  views: number,
  daysAgo: number,
  reading_time = 6,
  body?: string,
): Article {
  const published_at = new Date(Date.now() - daysAgo * 86400000).toISOString()
  const base: Article = {
    id,
    title,
    slug,
    excerpt,
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: title }] },
        { type: 'paragraph', content: [{ type: 'text', text: excerpt }] },
        ...(body
          ? [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: body }],
              },
            ]
          : []),
      ],
    },
    featured_image,
    author_id: pickAuthor(parseInt(id) || 0).id,
    category_id: cat(categorySlug).id,
    status: 'published',
    published_at,
    reading_time,
    view_count: views,
    created_at: published_at,
    updated_at: published_at,
    author: pickAuthor(parseInt(id) || 0),
    category: cat(categorySlug),
    tags: [],
  }
  return base
}

// Articles covering all categories above
export const mockAllArticles: Article[] = [
  A('101','Bitcoin Breaks $100K: What It Means','bitcoin-breaks-100k-portfolio-impact','Historic BTC milestone and implications.','https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=630&fit=crop','crypto-analysis',2100,1,8),
  A('102','DeFi Yield Farming: 5 Strategies for 2025','defi-yield-farming-strategies-2025','Maximize returns with risk-aware strategies.','https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop','defi',980,2,6),
  A('103','Build Your Emergency Fund','building-emergency-fund-guide','Practical steps to create safety nets.','https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop','personal-finance',640,3,5),
  A('104','Tech Stocks: Q1 2025 Outlook','tech-stocks-q1-2025-analysis','What to expect from big tech this quarter.','https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop','market-analysis',1120,4,7,
    'Symbol: NDX (NASDAQ 100), Timeframe: 1D. Bias: neutral to bullish if 18,000 holds. Levels: support 18,000; resistance 18,600. Entries: 18,150–18,250 on pullback; Stops: 17,900; Targets: 18,450 / 18,650. Rationale: momentum cooling but breadth stabilizing.'
  ),
  A('105','Crypto Tax Guide 2025','crypto-tax-guide-2025','Everything you need to know for tax season.','https://images.unsplash.com/photo-1554224154-26032fced8bd?w=1200&h=630&fit=crop','taxes',2156,5,9), 
  A('106','Global Markets Weekly Brief','global-markets-weekly-brief','Key geopolitical and macro developments.','https://images.unsplash.com/photo-1502920917128-1aa500764b1c?w=1200&h=630&fit=crop','global',820,1,7),
  A('107','AI Disrupts Finance','ai-disrupts-finance','How AI reshapes investment research.','https://images.unsplash.com/photo-1555949963-aa79dcee981d?w=1200&h=630&fit=crop','technology',1450,2,6),
  A('108','Founder Playbook: Hiring the First 10','founder-playbook-first-10-hires','A blueprint for early-stage teams.','https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&h=630&fit=crop','business',560,6,8),
  A('109','Lifestyle Inflation: Silent Portfolio Killer','lifestyle-inflation-silent-killer','Tactics to keep spending in check.','https://images.unsplash.com/photo-1459257868276-5e65389e2722?w=1200&h=630&fit=crop','lifestyle',430,7,5),
  A('110','All-Weather Portfolio Basics','all-weather-portfolio-basics','A resilient approach to investing.','https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&h=630&fit=crop','investment',770,3,7),
  A('111','Pricing Strategy for SaaS','pricing-strategy-for-saas','Find and defend your price point.','https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop','business-strategy',610,4,8),
  // Additional market analysis articles with realistic AI-friendly content
  A('201','BTC-USD Pullback to 50D SMA?','btc-usd-pullback-50d-sma','BTC-USD shows potential mean reversion toward the 50-day SMA around 98,500. Watch 96,000 as support and 105,000 as resistance.','https://images.unsplash.com/photo-1621504450181-5d356f9e2b64?w=1200&h=630&fit=crop','market-analysis',1880,1,6,
    'Symbol: BTC-USD, Timeframe: 1D. Bias: bullish-on-dip into 98,500–96,000 zone (near 50D SMA). Entries: 98,800 and 97,200; Stops: 95,800; Targets: 102,500 (50%), 105,000 (50%). Levels: support 96,000; resistance 105,000. Note: watch funding and open interest into CPI.'
  ),
  A('202','AAPL Range Break Setup (1D)','aapl-range-break-setup','AAPL consolidates between 197 and 205. A daily close above 205 could target 212/218; invalidation below 196.','https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&h=630&fit=crop','market-analysis',1340,2,7,
    'Symbol: AAPL, Timeframe: 1D. Bias: bullish on breakout. Entries: 205.20 daily close; Stops: 199.80; Targets: 212 and 218. Levels: support 197; resistance 205. Indicators: 50D rising, RSI ~55.'
  ),
  A('203','ETH-USD: Demand Zone Retest','eth-usd-demand-zone-retest','ETH-USD retests 3,350–3,250 demand zone with RSI near 40 on 4H. Bias cautiously bullish if 3,250 holds.','https://images.unsplash.com/photo-1621416894569-0f894c62c6f3?w=1200&h=630&fit=crop','market-analysis',990,3,5,
    'Symbol: ETH-USD, Timeframe: 4H. Bias: cautious-bullish above 3,250. Entries: 3,320; Stops: 3,220; Targets: 3,480 / 3,560. Zones: demand 3,350–3,250. Levels: resistance 3,500.'
  ),
  A('204','NASDAQ Momentum Cooling','nasdaq-momentum-cooling','NDX breadth fades as momentum cools. Watching 18,000 as key support; break risks a deeper pullback.','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop','market-analysis',760,5,6,
    'Symbol: NDX, Timeframe: 1D. Bias: neutral while below 18,600. Scenario 1 (0.55): rebound off 18,000 to 18,450; Scenario 2 (0.45): breakdown below 18,000 to 17,600. Levels: 18,000 support, 18,600 resistance.'
  ),
  A('205','SOL-USD Breakout Watch','sol-usd-breakout-watch','SOL-USD testing a multi-week descending trendline. Break and hold above 195 could extend to 210/225.','https://images.unsplash.com/photo-1642104704072-5d1f1a51a140?w=1200&h=630&fit=crop','market-analysis',870,4,6,
    'Symbol: SOL-USD, Timeframe: 4H. Bias: bullish on trendline break. Entries: 196.5 retest; Stops: 189.5; Targets: 210 (60%), 225 (40%). Levels: resistance 195/210; support 186.'
  ),
]

export function getMockArticleBySlug(slug: string): Article | null {
  return mockAllArticles.find(a => a.slug === slug) || null
}

export function getMockLatestArticles(limit = 9): Article[] {
  return [...mockAllArticles]
    .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''))
    .slice(0, limit)
}

// Simple trending score: views with time-decay (recent gets a boost)
export function getMockTrendingArticles(limit = 6): Article[] {
  const now = Date.now()
  const scored = mockAllArticles.map(a => {
    const ageDays = Math.max(1, Math.floor((now - new Date(a.published_at || a.created_at).getTime()) / 86400000))
    const decay = 1 / Math.sqrt(ageDays)
    const score = (a.view_count || 0) * decay
    return { a, score }
  })
  return scored.sort((x, y) => y.score - x.score).slice(0, limit).map(s => s.a)
}

export function getMockPopularCategories(): (Category & { article_count: number })[] {
  // Count articles per category
  const counts = new Map<string, number>()
  mockAllArticles.forEach(a => {
    const key = a.category?.id ?? a.category_id
    if (!key) return
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  return mockCategories.map(c => ({
    ...c,
    article_count: counts.get(c.id) || 0,
  }))
}
