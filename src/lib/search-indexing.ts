import { ALGOLIA_INDICES, AlgoliaArticle } from './algolia';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper to get admin client lazily on the server only
const admin = () => getSupabaseAdmin();

// Determine if Algolia is configured; otherwise we no-op to avoid paid dependency
const isAlgoliaConfigured = () => {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
  if (!appId || !adminKey) return false;
  if (appId === 'test_app_id' || adminKey === 'test_admin_key') return false;
  return true;
};

// Create admin Algolia client for server-side operations (or null when disabled)
const getServerAdminClient = async () => {
  if (!isAlgoliaConfigured()) return null;
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string;
  const adminKey = process.env.ALGOLIA_ADMIN_API_KEY as string;
  // Dynamic import to avoid TS/ESM interop issues when not using Algolia
  const mod: any = await import('algoliasearch');
  const factory = mod?.default ?? mod?.algoliasearch ?? mod;
  return factory(appId, adminKey);
};

const getServerAdminIndex = async (indexName: string) => {
  const client = await getServerAdminClient();
  if (!client) return null;
  return client.initIndex(indexName);
};

// Convert article to Algolia format
const convertArticleToAlgolia = (article: any): AlgoliaArticle => {
  return {
    objectID: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: extractTextFromContent(article.content),
    featuredImage: article.featured_image,
    authorName: article.profiles?.full_name || article.profiles?.email || 'Unknown Author',
    categoryName: article.categories?.name,
    categorySlug: article.categories?.slug,
    tags: article.article_tags?.map((at: any) => at.tags.name) || [],
    filters: article.article_filters?.map((af: any) => af.filters.name) || [],
    status: article.status,
    publishedAt: article.published_at,
    readingTime: article.reading_time,
    viewCount: article.view_count,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
  };
};

// Extract plain text from Tiptap JSON content
const extractTextFromContent = (content: any): string => {
  if (!content || !content.content) return '';
  
  const extractText = (node: any): string => {
    if (node.type === 'text') {
      return node.text || '';
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ');
    }
    
    return '';
  };
  
  return content.content.map(extractText).join(' ').trim();
};

// Index a single article
export const indexArticle = async (articleId: string): Promise<void> => {
  try {
    const { data: article, error } = await admin()
      .from('articles')
      .select(`
        *,
        profiles:author_id (full_name, email),
        categories:category_id (name, slug),
        article_tags (
          tags (name, slug)
        ),
        article_filters (
          filters (name, slug)
        )
      `)
      .eq('id', articleId)
      .single();

    if (error) {
      console.error('Error fetching article for indexing:', error);
      return;
    }

    if (!article) {
      console.error('Article not found:', articleId);
      return;
    }

    const algoliaArticle = convertArticleToAlgolia(article);
    const index = await getServerAdminIndex(ALGOLIA_INDICES.ARTICLES);
    if (!index) {
      console.warn('[search-indexing] Algolia disabled or not configured. Skipping indexArticle.');
      return;
    }
    await index.saveObject(algoliaArticle);
    console.log(`Article indexed successfully: ${article.title}`);
  } catch (error) {
    console.error('Error indexing article:', error);
    throw error;
  }
};

// Remove article from index
export const removeArticleFromIndex = async (articleId: string): Promise<void> => {
  try {
    const index = await getServerAdminIndex(ALGOLIA_INDICES.ARTICLES);
    if (!index) {
      console.warn('[search-indexing] Algolia disabled or not configured. Skipping removeArticleFromIndex.');
      return;
    }
    await index.deleteObject(articleId);
    console.log(`Article removed from index: ${articleId}`);
  } catch (error) {
    console.error('Error removing article from index:', error);
    throw error;
  }
};

// Bulk index all published articles
export const indexAllArticles = async (): Promise<void> => {
  try {
    console.log('Starting bulk article indexing...');
    
    const { data: articles, error } = await admin()
      .from('articles')
      .select(`
        *,
        profiles:author_id (full_name, email),
        categories:category_id (name, slug),
        article_tags (
          tags (name, slug)
        ),
        article_filters (
          filters (name, slug)
        )
      `)
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching articles for bulk indexing:', error);
      return;
    }

    if (!articles || articles.length === 0) {
      console.log('No published articles found to index');
      return;
    }

    const algoliaArticles = articles.map(convertArticleToAlgolia);
    const index = await getServerAdminIndex(ALGOLIA_INDICES.ARTICLES);
    if (!index) {
      console.warn('[search-indexing] Algolia disabled or not configured. Skipping indexAllArticles.');
      return;
    }
    // Clear existing index
    await index.clearObjects();
    
    // Batch save articles
    const batchSize = 100;
    for (let i = 0; i < algoliaArticles.length; i += batchSize) {
      const batch = algoliaArticles.slice(i, i + batchSize);
      await index.saveObjects(batch);
      console.log(`Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(algoliaArticles.length / batchSize)}`);
    }

    console.log(`Successfully indexed ${algoliaArticles.length} articles`);
  } catch (error) {
    console.error('Error in bulk article indexing:', error);
    throw error;
  }
};

// Configure index settings
export const configureSearchIndex = async (): Promise<void> => {
  try {
    const index = await getServerAdminIndex(ALGOLIA_INDICES.ARTICLES);
    if (!index) {
      console.warn('[search-indexing] Algolia disabled or not configured. Skipping configureSearchIndex.');
      return;
    }
    await index.setSettings({
      searchableAttributes: [
        'title',
        'excerpt',
        'content',
        'authorName',
        'categoryName',
        'tags',
        'filters',
      ],
      attributesForFaceting: [
        'categorySlug',
        'tags',
        'filters',
        'authorName',
        'status',
      ],
      customRanking: [
        'desc(publishedAt)',
        'desc(viewCount)',
        'desc(readingTime)',
      ],
      ranking: [
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
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
      hitsPerPage: 10,
      maxValuesPerFacet: 100,
      distinct: true,
      attributeForDistinct: 'slug',
    });

    console.log('Search index configured successfully');
  } catch (error) {
    console.error('Error configuring search index:', error);
    throw error;
  }
};