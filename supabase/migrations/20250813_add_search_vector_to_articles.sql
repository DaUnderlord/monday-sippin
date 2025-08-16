-- Add full-text search support for articles
-- Creates a generated tsvector column and a GIN index.
-- Safe to run multiple times.

-- 1) Add search_vector column (generated)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
) STORED;

-- 2) Create GIN index on search_vector
CREATE INDEX IF NOT EXISTS articles_search_vector_idx
ON public.articles
USING GIN (search_vector);

-- Optional: If you later add a plain text column for content text, extend search_vector like:
--   || setweight(to_tsvector('english', coalesce(content_text, '')), 'C');
