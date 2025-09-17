import { supabase } from './supabase';

import { calculateReadingTime } from './utils';
import type { 
  Profile, 
  Article, 
  Category, 
  Tag, 
  Filter, 
  NewsletterSubscriber,
  ArticleFormData,
  PaginatedResponse 
} from '@/types';

// Profile operations
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Article operations
export const articleService = {
  async getPublishedArticles(page = 1, limit = 10): Promise<PaginatedResponse<Article>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(tag:tags(*)),
        filters:article_filters(filter:filters(*))
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(tag:tags(*)),
        filters:article_filters(filter:filters(*))
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentArticlesByCategory(categoryId: string, limit = 4): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(tag:tags(*)),
        filters:article_filters(filter:filters(*))
      `)
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createArticle(articleData: ArticleFormData, authorId: string): Promise<Article> {
    const { tags, filters, ...articleFields } = articleData;
    
    // Ensure slug is unique
    const { data: existingWithSlug } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', articleFields.slug)
      .limit(1);
    if (existingWithSlug && existingWithSlug.length > 0) {
      throw new Error('An article with this slug already exists');
    }
    
    // Calculate reading time
    const readingTime = calculateReadingTime(articleFields.content);
    
    // Create the article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        ...articleFields,
        author_id: authorId,
        reading_time: readingTime,
        // Set published_at automatically when status is published
        published_at: articleFields.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (articleError) throw articleError;

    // Add tags
    if (tags.length > 0) {
      const tagRelations = tags.map(tagId => ({
        article_id: article.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('article_tags')
        .insert(tagRelations);
      
      if (tagError) throw tagError;
    }

    // Add filters
    if (filters.length > 0) {
      const filterRelations = filters.map(filterId => ({
        article_id: article.id,
        filter_id: filterId
      }));
      
      const { error: filterError } = await supabase
        .from('article_filters')
        .insert(filterRelations);
      
      if (filterError) throw filterError;
    }

    return article;
  },

  async updateArticle(articleId: string, updates: Partial<ArticleFormData>): Promise<Article> {
    const { tags, filters, ...articleFields } = updates;
    
    // Calculate reading time if content is being updated
    // Widen type to allow reading_time which is not part of ArticleFormData
    const updateData: Partial<ArticleFormData> & { reading_time?: number; published_at?: string | null } = { ...articleFields };
    if (articleFields.content) {
      updateData.reading_time = calculateReadingTime(articleFields.content);
    }
    
    // Ensure slug is unique when updating
    if (articleFields.slug) {
      const { data: existingWithSlug } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', articleFields.slug)
        .neq('id', articleId)
        .limit(1);
      if (existingWithSlug && existingWithSlug.length > 0) {
        throw new Error('An article with this slug already exists');
      }
    }
    
    // If setting status to published, ensure published_at is set
    if (articleFields.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }
    
    // Update the article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select()
      .single();

    if (articleError) throw articleError;

    // Update tags if provided
    if (tags) {
      // Remove existing tags
      await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId);

      // Add new tags
      if (tags.length > 0) {
        const tagRelations = tags.map(tagId => ({
          article_id: articleId,
          tag_id: tagId
        }));
        
        await supabase
          .from('article_tags')
          .insert(tagRelations);
      }
    }

    // Update filters if provided
    if (filters) {
      // Remove existing filters
      await supabase
        .from('article_filters')
        .delete()
        .eq('article_id', articleId);

      // Add new filters
      if (filters.length > 0) {
        const filterRelations = filters.map(filterId => ({
          article_id: articleId,
          filter_id: filterId
        }));
        
        await supabase
          .from('article_filters')
          .insert(filterRelations);
      }
    }

    return article;
  },

  async deleteArticle(articleId: string): Promise<void> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
  },

  async incrementViewCount(articleId: string): Promise<void> {
    const { error } = await supabase
      .rpc('increment_view_count', { article_id: articleId });

    if (error) throw error;
  }
};

// Category operations
export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Tag operations
export const tagService = {
  async getAllTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Filter operations
export const filterService = {
  async getHierarchicalFilters(includeCounts = false): Promise<Filter[]> {
    const { data, error } = await supabase
      .from('filters')
      .select('*')
      .order('level, order_index');

    if (error) throw error;

    // Build hierarchical structure
    const filterMap = new Map<string, Filter>();
    const rootFilters: Filter[] = [];

    // First pass: create all filter objects
    data?.forEach(filter => {
      filterMap.set(filter.id, { ...filter, children: [] });
    });

    // Second pass: build hierarchy
    data?.forEach(filter => {
      const filterObj = filterMap.get(filter.id)!;
      if (filter.parent_id) {
        const parent = filterMap.get(filter.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(filterObj);
        }
      } else {
        rootFilters.push(filterObj);
      }
    });

    // Third pass: add article counts if requested
    if (includeCounts) {
      await this.addArticleCounts(filterMap);
    }

    return rootFilters;
  },

  async addArticleCounts(filterMap: Map<string, Filter>): Promise<void> {
    try {
      // Get article counts for each filter
      const { data: counts, error } = await supabase
        .from('article_filters')
        .select(`
          filter_id,
          article:articles!inner(status)
        `)
        .eq('article.status', 'published');

      if (error) {
        console.error('Error fetching article counts:', error);
        // Don't throw error, just set counts to 0
        filterMap.forEach((filter) => {
          filter.articleCount = 0;
        });
        return;
      }

      // Count articles per filter
      const countMap = new Map<string, number>();
      counts?.forEach(item => {
        const current = countMap.get(item.filter_id) || 0;
        countMap.set(item.filter_id, current + 1);
      });

      // Apply counts to filters
      filterMap.forEach((filter, id) => {
        filter.articleCount = countMap.get(id) || 0;
      });
    } catch (error) {
      console.error('Error in addArticleCounts:', error);
      // Set all counts to 0 on error
      filterMap.forEach((filter) => {
        filter.articleCount = 0;
      });
    }
  },

  async getArticlesByFilters(
    filterIds: string[], 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<Article>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (filterIds.length === 0) {
      return {
        data: [],
        count: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    try {
      // First, find articles that have ALL the selected filters
      const { data: articleIds, error: filterError } = await supabase
        .rpc('get_articles_with_all_filters', { 
          filter_ids: filterIds 
        });

      if (filterError) {
        console.error('Filter RPC error:', filterError);
        // Fallback to simpler query if RPC fails
        return await this.getArticlesByFiltersSimple(filterIds, page, limit);
      }

      if (!articleIds || articleIds.length === 0) {
        return {
          data: [],
          count: 0,
          page,
          limit,
          totalPages: 0
        };
      }

      // Now get the actual articles with all relations
      const { data, error, count } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:categories(*),
          tags:article_tags(tag:tags(*)),
          filters:article_filters(filter:filters(*))
        `, { count: 'exact' })
        .in('id', articleIds)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching filtered articles:', error);
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getArticlesByFilters:', error);
      // Fallback to simple query on any error
      return await this.getArticlesByFiltersSimple(filterIds, page, limit);
    }
  },

  async getArticlesByFiltersSimple(
    filterIds: string[], 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<Article>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Simple approach: get articles that have at least one of the filters
    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(tag:tags(*)),
        filters:article_filters!inner(filter:filters(*))
      `, { count: 'exact' })
      .in('filters.filter_id', filterIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async createFilter(filter: Omit<Filter, 'id' | 'created_at' | 'children'>): Promise<Filter> {
    const { data, error } = await supabase
      .from('filters')
      .insert(filter)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFilterBySlug(slug: string): Promise<Filter | null> {
    const { data, error } = await supabase
      .from('filters')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async getFiltersByIds(ids: string[]): Promise<Filter[]> {
    const { data, error } = await supabase
      .from('filters')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  },

  async getFilterStats(): Promise<{ totalFilters: number; filtersByLevel: Record<number, number> }> {
    try {
      const { data, error } = await supabase
        .from('filters')
        .select('level');

      if (error) throw error;

      const stats = {
        totalFilters: data?.length || 0,
        filtersByLevel: {} as Record<number, number>
      };

      data?.forEach(filter => {
        stats.filtersByLevel[filter.level] = (stats.filtersByLevel[filter.level] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting filter stats:', error);
      return { totalFilters: 0, filtersByLevel: {} };
    }
  },

  async updateFilter(filterId: string, updates: Partial<Filter>): Promise<Filter> {
    const { data, error } = await supabase
      .from('filters')
      .update(updates)
      .eq('id', filterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFilter(filterId: string): Promise<void> {
    // First check if filter has children
    const { data: children } = await supabase
      .from('filters')
      .select('id')
      .eq('parent_id', filterId);

    if (children && children.length > 0) {
      throw new Error('Cannot delete filter with child filters');
    }

    const { error } = await supabase
      .from('filters')
      .delete()
      .eq('id', filterId);

    if (error) throw error;
  }
};

// Newsletter operations
export const newsletterService = {
  async subscribe(email: string, preferences?: any): Promise<NewsletterSubscriber> {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        preferences: preferences || { frequency: 'weekly', categories: [] }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unsubscribe(email: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) throw error;
  },

  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Search operations
export const searchService = {
  async searchArticles(query: string, limit = 10): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(tag:tags(*)),
        filters:article_filters(filter:filters(*))
      `)
      .eq('status', 'published')
      // Use Postgres full-text search over generated search_vector column
      // websearch: supports natural language queries (AND/OR, quoted phrases)
      .textSearch('search_vector', query, { type: 'websearch' })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};