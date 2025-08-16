'use client';

import React from 'react';
import { Clock, Eye, Calendar, User, Tag, Folder } from 'lucide-react';
import { AlgoliaArticle } from '@/lib/algolia';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsProps {
  results: {
    hits: AlgoliaArticle[];
    nbHits: number;
    page: number;
    nbPages: number;
    hitsPerPage: number;
    processingTimeMS: number;
    query: string;
  };
  loading?: boolean;
  onLoadMore?: () => void;
  showLoadMore?: boolean;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading = false,
  onLoadMore,
  showLoadMore = false,
  className,
}) => {
  const { hits, nbHits, processingTimeMS, query } = results;

  if (hits.length === 0 && !loading) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any articles matching "{query}". Try adjusting your search terms or filters.
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-2">Suggestions:</p>
            <ul className="space-y-1">
              <li>• Check your spelling</li>
              <li>• Try more general keywords</li>
              <li>• Remove some filters</li>
              <li>• Browse our categories instead</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-900">{nbHits.toLocaleString()}</span>
          {' '}results found
          {query && (
            <>
              {' '}for "<span className="font-medium text-gray-900">{query}</span>"
            </>
          )}
        </div>
        <div>
          Search took {processingTimeMS}ms
        </div>
      </div>

      {/* Search results */}
      <div className="space-y-6">
        {hits.map((article) => (
          <SearchResultCard key={article.objectID} article={article} />
        ))}
      </div>

      {/* Load more button */}
      {showLoadMore && onLoadMore && (
        <div className="text-center pt-8">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? 'Loading...' : 'Load More Results'}
          </Button>
        </div>
      )}
    </div>
  );
};

interface SearchResultCardProps {
  article: AlgoliaArticle;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ article }) => {
  const publishedDate = new Date(article.publishedAt);

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        {/* Article image */}
        {article.featuredImage && (
          <div className="lg:w-48 lg:flex-shrink-0 mb-4 lg:mb-0">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-32 lg:h-24 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article content */}
        <div className="flex-1 min-w-0">
          {/* Title with highlighting */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            <a
              href={`/articles/${article.slug}`}
              className="hover:text-primary transition-colors"
              dangerouslySetInnerHTML={{
                __html: article._highlightResult?.title?.value || article.title
              }}
            />
          </h3>

          {/* Excerpt with highlighting */}
          {article.excerpt && (
            <p
              className="text-gray-600 mb-3 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: article._highlightResult?.excerpt?.value || article.excerpt
              }}
            />
          )}

          {/* Content snippet with highlighting */}
          {article._snippetResult?.content?.value && (
            <p
              className="text-sm text-gray-500 mb-3 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: article._snippetResult.content.value
              }}
            />
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span
                dangerouslySetInnerHTML={{
                  __html: article._highlightResult?.authorName?.value || article.authorName
                }}
              />
            </div>

            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <time dateTime={article.publishedAt}>
                {formatDistanceToNow(publishedDate, { addSuffix: true })}
              </time>
            </div>

            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {article.readingTime} min read
            </div>

            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {article.viewCount} views
            </div>
          </div>

          {/* Category and tags */}
          <div className="flex flex-wrap items-center gap-2">
            {article.categoryName && (
              <Badge variant="secondary" className="flex items-center">
                <Folder className="h-3 w-3 mr-1" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: article._highlightResult?.categoryName?.value || article.categoryName
                  }}
                />
              </Badge>
            )}

            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: article._highlightResult?.tags?.[index]?.value || tag
                  }}
                />
              </Badge>
            ))}

            {article.tags.length > 3 && (
              <Badge variant="outline">
                +{article.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};