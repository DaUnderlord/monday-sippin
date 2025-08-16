import { algoliasearch } from 'algoliasearch';

// Initialize Algolia client (client-side only)
let client: ReturnType<typeof algoliasearch> | null = null;
let adminClient: ReturnType<typeof algoliasearch> | null = null;

const getClient = () => {
  if (typeof window === 'undefined') return null;
  
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
  
  // Check if credentials are properly configured (not placeholder values)
  if (!appId || !searchKey || appId === 'test_app_id' || searchKey === 'test_search_key') {
    return null;
  }
  
  if (!client) {
    try {
      client = algoliasearch(appId, searchKey);
    } catch (error) {
      console.error('Failed to initialize Algolia client:', error);
      return null;
    }
  }
  return client;
};

const getAdminClient = () => {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
  
  // Check if credentials are properly configured (not placeholder values)
  if (!appId || !adminKey || appId === 'test_app_id' || adminKey === 'test_admin_key') {
    return null;
  }
  
  if (!adminClient) {
    try {
      adminClient = algoliasearch(appId, adminKey);
    } catch (error) {
      console.error('Failed to initialize Algolia admin client:', error);
      return null;
    }
  }
  return adminClient;
};

// Index names
export const ALGOLIA_INDICES = {
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
  TAGS: 'tags',
} as const;

// Get search index
export const getSearchIndex = (indexName: string) => {
  const clientInstance = getClient();
  if (!clientInstance) {
    throw new Error('Algolia client not available');
  }
  return clientInstance.initIndex(indexName);
};

// Get admin index for indexing operations
export const getAdminIndex = (indexName: string) => {
  const adminClientInstance = getAdminClient();
  if (!adminClientInstance) {
    throw new Error('Algolia admin client not available');
  }
  return adminClientInstance.initIndex(indexName);
};

// Article search interface
export interface AlgoliaArticle {
  objectID: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorName: string;
  categoryName?: string;
  categorySlug?: string;
  tags: string[];
  filters: string[];
  status: string;
  publishedAt: string;
  readingTime: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Search configuration
export const searchConfig = {
  hitsPerPage: 10,
  attributesToRetrieve: [
    'objectID',
    'title',
    'slug',
    'excerpt',
    'featuredImage',
    'authorName',
    'categoryName',
    'categorySlug',
    'tags',
    'filters',
    'publishedAt',
    'readingTime',
    'viewCount',
  ],
  attributesToHighlight: [
    'title',
    'excerpt',
    'content',
    'authorName',
    'categoryName',
    'tags',
  ],
  attributesToSnippet: [
    'content:20',
    'excerpt:15',
  ],
  highlightPreTag: '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">',
  highlightPostTag: '</mark>',
};

// Search filters
export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  filters?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  readingTime?: {
    min?: number;
    max?: number;
  };
}

// Build Algolia filter string
export const buildAlgoliaFilters = (filters: SearchFilters): string => {
  const filterParts: string[] = [];

  // Always filter for published articles
  filterParts.push('status:published');

  if (filters.categories?.length) {
    const categoryFilter = filters.categories
      .map(cat => `categorySlug:"${cat}"`)
      .join(' OR ');
    filterParts.push(`(${categoryFilter})`);
  }

  if (filters.tags?.length) {
    const tagFilter = filters.tags
      .map(tag => `tags:"${tag}"`)
      .join(' OR ');
    filterParts.push(`(${tagFilter})`);
  }

  if (filters.filters?.length) {
    const filterFilter = filters.filters
      .map(filter => `filters:"${filter}"`)
      .join(' OR ');
    filterParts.push(`(${filterFilter})`);
  }

  if (filters.dateRange?.start) {
    filterParts.push(`publishedAt >= ${new Date(filters.dateRange.start).getTime()}`);
  }

  if (filters.dateRange?.end) {
    filterParts.push(`publishedAt <= ${new Date(filters.dateRange.end).getTime()}`);
  }

  if (filters.readingTime?.min) {
    filterParts.push(`readingTime >= ${filters.readingTime.min}`);
  }

  if (filters.readingTime?.max) {
    filterParts.push(`readingTime <= ${filters.readingTime.max}`);
  }

  return filterParts.join(' AND ');
};

export { getClient as client, getAdminClient as adminClient };