-- Function to get categories with article counts
CREATE OR REPLACE FUNCTION get_categories_with_counts(category_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  parent_id UUID,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  article_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.parent_id,
    c.color,
    c.created_at,
    COALESCE(article_counts.count, 0) as article_count
  FROM categories c
  LEFT JOIN (
    SELECT 
      category_id,
      COUNT(*) as count
    FROM articles 
    WHERE status = 'published'
    GROUP BY category_id
  ) article_counts ON c.id = article_counts.category_id
  ORDER BY article_count DESC, c.name ASC
  LIMIT category_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_categories_with_counts TO authenticated;
GRANT EXECUTE ON FUNCTION get_categories_with_counts TO anon;