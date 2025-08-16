-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET view_count = view_count + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate reading time based on content
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- Count words (approximate)
  word_count := array_length(string_to_array(content_text, ' '), 1);
  
  -- Calculate reading time (assuming 200 words per minute)
  reading_time := GREATEST(1, CEIL(word_count / 200.0));
  
  RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get article count for filters
CREATE OR REPLACE FUNCTION get_filter_article_count(filter_id UUID)
RETURNS INTEGER AS $$
DECLARE
  article_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT af.article_id)
  INTO article_count
  FROM article_filters af
  JOIN articles a ON af.article_id = a.id
  WHERE af.filter_id = filter_id
    AND a.status = 'published';
  
  RETURN COALESCE(article_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get related articles based on tags and filters
CREATE OR REPLACE FUNCTION get_related_articles(target_article_id UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time INTEGER,
  view_count INTEGER,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH article_tags AS (
    SELECT tag_id FROM article_tags WHERE article_id = target_article_id
  ),
  article_filters AS (
    SELECT filter_id FROM article_filters WHERE article_id = target_article_id
  ),
  related_scores AS (
    SELECT 
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      a.featured_image,
      a.published_at,
      a.reading_time,
      a.view_count,
      (
        COALESCE((
          SELECT COUNT(*)
          FROM article_tags at2
          WHERE at2.article_id = a.id
            AND at2.tag_id IN (SELECT tag_id FROM article_tags)
        ), 0) * 2 +
        COALESCE((
          SELECT COUNT(*)
          FROM article_filters af2
          WHERE af2.article_id = a.id
            AND af2.filter_id IN (SELECT filter_id FROM article_filters)
        ), 0)
      ) as relevance_score
    FROM articles a
    WHERE a.id != target_article_id
      AND a.status = 'published'
      AND a.published_at IS NOT NULL
  )
  SELECT 
    rs.id,
    rs.title,
    rs.slug,
    rs.excerpt,
    rs.featured_image,
    rs.published_at,
    rs.reading_time,
    rs.view_count,
    rs.relevance_score
  FROM related_scores rs
  WHERE rs.relevance_score > 0
  ORDER BY rs.relevance_score DESC, rs.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;