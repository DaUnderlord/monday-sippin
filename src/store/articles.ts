import { create } from 'zustand'
import { Article, Category, Tag, Filter } from '@/types'

interface ArticleState {
  // Article data
  articles: Article[]
  currentArticle: Article | null
  featuredArticles: Article[]
  
  // Metadata
  categories: Category[]
  tags: Tag[]
  filters: Filter[]
  
  // UI state
  loading: boolean
  error: string | null
  
  // Pagination
  currentPage: number
  totalPages: number
  totalCount: number
  
  // Filters
  selectedCategory: string | null
  selectedTags: string[]
  selectedFilters: string[]
  searchQuery: string
  
  // Actions
  setArticles: (articles: Article[]) => void
  addArticles: (articles: Article[]) => void
  setCurrentArticle: (article: Article | null) => void
  setFeaturedArticles: (articles: Article[]) => void
  
  setCategories: (categories: Category[]) => void
  setTags: (tags: Tag[]) => void
  setFilters: (filters: Filter[]) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  setPagination: (page: number, totalPages: number, totalCount: number) => void
  
  setSelectedCategory: (categoryId: string | null) => void
  setSelectedTags: (tagIds: string[]) => void
  setSelectedFilters: (filterIds: string[]) => void
  setSearchQuery: (query: string) => void
  
  clearFilters: () => void
  reset: () => void
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  // Initial state
  articles: [],
  currentArticle: null,
  featuredArticles: [],
  
  categories: [],
  tags: [],
  filters: [],
  
  loading: false,
  error: null,
  
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  
  selectedCategory: null,
  selectedTags: [],
  selectedFilters: [],
  searchQuery: '',
  
  // Actions
  setArticles: (articles) => set({ articles }),
  
  addArticles: (newArticles) => set((state) => ({
    articles: [...state.articles, ...newArticles]
  })),
  
  setCurrentArticle: (article) => set({ currentArticle: article }),
  
  setFeaturedArticles: (articles) => set({ featuredArticles: articles }),
  
  setCategories: (categories) => set({ categories }),
  
  setTags: (tags) => set({ tags }),
  
  setFilters: (filters) => set({ filters }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setPagination: (currentPage, totalPages, totalCount) => set({
    currentPage,
    totalPages,
    totalCount
  }),
  
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  
  setSelectedTags: (tagIds) => set({ selectedTags: tagIds }),
  
  setSelectedFilters: (filterIds) => set({ selectedFilters: filterIds }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  clearFilters: () => set({
    selectedCategory: null,
    selectedTags: [],
    selectedFilters: [],
    searchQuery: ''
  }),
  
  reset: () => set({
    articles: [],
    currentArticle: null,
    featuredArticles: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    selectedCategory: null,
    selectedTags: [],
    selectedFilters: [],
    searchQuery: ''
  })
}))

// Selectors for computed values
export const useArticleSelectors = () => {
  const store = useArticleStore()
  
  return {
    // Get filtered articles based on current filters
    getFilteredArticles: () => {
      const { articles, selectedCategory, selectedTags, selectedFilters, searchQuery } = store
      
      return articles.filter(article => {
        // Category filter
        if (selectedCategory && article.category_id !== selectedCategory) {
          return false
        }
        
        // Tags filter
        if (selectedTags.length > 0) {
          const articleTagIds = article.tags?.map(tag => tag.id) || []
          const hasMatchingTag = selectedTags.some(tagId => articleTagIds.includes(tagId))
          if (!hasMatchingTag) return false
        }
        
        // Filters filter
        if (selectedFilters.length > 0) {
          const articleFilterIds = article.filters?.map(filter => filter.id) || []
          const hasMatchingFilter = selectedFilters.some(filterId => articleFilterIds.includes(filterId))
          if (!hasMatchingFilter) return false
        }
        
        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const titleMatch = article.title.toLowerCase().includes(query)
          const excerptMatch = article.excerpt?.toLowerCase().includes(query)
          if (!titleMatch && !excerptMatch) return false
        }
        
        return true
      })
    },
    
    // Get articles by category
    getArticlesByCategory: (categoryId: string) => {
      return store.articles.filter(article => article.category_id === categoryId)
    },
    
    // Get articles by author
    getArticlesByAuthor: (authorId: string) => {
      return store.articles.filter(article => article.author_id === authorId)
    },
    
    // Get related articles (same category or tags)
    getRelatedArticles: (currentArticle: Article, limit = 5) => {
      const { articles } = store
      
      return articles
        .filter(article => 
          article.id !== currentArticle.id && 
          article.status === 'published' &&
          (
            article.category_id === currentArticle.category_id ||
            article.tags?.some(tag => 
              currentArticle.tags?.some(currentTag => currentTag.id === tag.id)
            )
          )
        )
        .slice(0, limit)
    },
    
    // Check if filters are active
    hasActiveFilters: () => {
      const { selectedCategory, selectedTags, selectedFilters, searchQuery } = store
      return !!(selectedCategory || selectedTags.length > 0 || selectedFilters.length > 0 || searchQuery)
    }
  }
}