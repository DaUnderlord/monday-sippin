-- Create function to execute SQL queries for search
CREATE OR REPLACE FUNCTION execute_sql(query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    param_count int;
    i int;
    param_value text;
    final_query text;
BEGIN
    -- This is a simplified version - in production you'd want more security
    -- For now, we'll use a different approach with predefined search functions
    RAISE EXCEPTION 'Direct SQL execution not allowed. Use predefined search functions.';
END;
$$;

-- Create optimized search function
CREATE OR REPLACE FUNCTION search_articles(
    search_query text DEFAULT '',
    category_slugs text[] DEFAULT '{}',
    tag_slugs text[] DEFAULT '{}',
    filter_slugs text[] DEFAULT '{}',
    date_start timestamp DEFAULT NULL,
    date_end timestamp DEFAULT NULL,
    reading_time_min int DEFAULT NULL,
    reading_time_max int DEFAULT NULL,
    sort_by text DEFAULT 'relevance',
    page_offset int DEFAULT 0,
    page_limit int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    title text,
    slug text,
    excerpt text,
    content jsonb,
    featured_image text,
    author_id uuid,
    author_name text,
    author_email text,
    category_id uuid,
    category_name text,
    category_slug text,
    status text,
    published_at timestamp with time zone,
    reading_time int,
    view_count int,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    tags jsonb,
    filters_data jsonb,
    relevance_score int
)
LANGUAGE plpgsql
AS $$
DECLARE
    search_terms text[];
    order_clause text;
BEGIN
    -- Parse search terms
    IF search_query IS NOT NULL AND search_query != '' THEN
        search_terms := string_to_array(lower(trim(search_query)), ' ');
    END IF;
    
    -- Build order clause
    CASE sort_by
        WHEN 'date_desc' THEN order_clause := 'a.published_at DESC';
        WHEN 'date_asc' THEN order_clause := 'a.published_at ASC';
        WHEN 'popularity' THEN order_clause := 'a.view_count DESC, a.published_at DESC';
        WHEN 'reading_time_asc' THEN order_clause := 'a.reading_time ASC';
        WHEN 'reading_time_desc' THEN order_clause := 'a.reading_time DESC';
        ELSE order_clause := 'relevance_score ASC, a.view_count DESC, a.published_at DESC';
    END CASE;
    
    RETURN QUERY
    EXECUTE format('
        SELECT 
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.content,
            a.featured_image,
            a.author_id,
            p.full_name as author_name,
            p.email as author_email,
            a.category_id,
            c.name as category_name,
            c.slug as category_slug,
            a.status,
            a.published_at,
            a.reading_time,
            a.view_count,
            a.created_at,
            a.updated_at,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        ''id'', t.id,
                        ''name'', t.name,
                        ''slug'', t.slug
                    )
                ) FILTER (WHERE t.id IS NOT NULL),
                ''[]''::json
            )::jsonb as tags,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        ''id'', f.id,
                        ''name'', f.name,
                        ''slug'', f.slug
                    )
                ) FILTER (WHERE f.id IS NOT NULL),
                ''[]''::json
            )::jsonb as filters_data,
            CASE 
                WHEN $1 IS NULL OR $1 = '''' THEN 1
                WHEN lower(a.title) LIKE lower(''%%'' || $1 || ''%%'') THEN 1
                WHEN lower(a.excerpt) LIKE lower(''%%'' || $1 || ''%%'') THEN 2
                ELSE 3
            END as relevance_score
        FROM articles a
        LEFT JOIN profiles p ON a.author_id = p.id
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN article_tags at ON a.id = at.article_id
        LEFT JOIN tags t ON at.tag_id = t.id
        LEFT JOIN article_filters af ON a.id = af.article_id
        LEFT JOIN filters f ON af.filter_id = f.id
        WHERE a.status = ''published''
            AND ($1 IS NULL OR $1 = '''' OR (
                lower(a.title) LIKE lower(''%%'' || $1 || ''%%'') OR
                lower(a.excerpt) LIKE lower(''%%'' || $1 || ''%%'') OR
                lower(a.content::text) LIKE lower(''%%'' || $1 || ''%%'') OR
                lower(p.full_name) LIKE lower(''%%'' || $1 || ''%%'') OR
                lower(c.name) LIKE lower(''%%'' || $1 || ''%%'')
            ))
            AND ($2 = ''{}'' OR c.slug = ANY($2))
            AND ($3 = ''{}'' OR EXISTS (
                SELECT 1 FROM article_tags at2
                JOIN tags t2 ON at2.tag_id = t2.id
                WHERE at2.article_id = a.id AND t2.slug = ANY($3)
            ))
            AND ($4 = ''{}'' OR EXISTS (
                SELECT 1 FROM article_filters af2
                JOIN filters f2 ON af2.filter_id = f2.id
                WHERE af2.article_id = a.id AND f2.slug = ANY($4)
            ))
            AND ($5 IS NULL OR a.published_at >= $5)
            AND ($6 IS NULL OR a.published_at <= $6)
            AND ($7 IS NULL OR a.reading_time >= $7)
            AND ($8 IS NULL OR a.reading_time <= $8)
        GROUP BY a.id, p.full_name, p.email, c.name, c.slug
        ORDER BY %s
        LIMIT $11 OFFSET $10
    ', order_clause)
    USING search_query, category_slugs, tag_slugs, filter_slugs, date_start, date_end, 
          reading_time_min, reading_time_max, sort_by, page_offset, page_limit;
END;
$$;

-- Create function to count search results
CREATE OR REPLACE FUNCTION count_search_articles(
    search_query text DEFAULT '',
    category_slugs text[] DEFAULT '{}',
    tag_slugs text[] DEFAULT '{}',
    filter_slugs text[] DEFAULT '{}',
    date_start timestamp DEFAULT NULL,
    date_end timestamp DEFAULT NULL,
    reading_time_min int DEFAULT NULL,
    reading_time_max int DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    result_count int;
BEGIN
    SELECT COUNT(DISTINCT a.id) INTO result_count
    FROM articles a
    LEFT JOIN profiles p ON a.author_id = p.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    LEFT JOIN article_filters af ON a.id = af.article_id
    LEFT JOIN filters f ON af.filter_id = f.id
    WHERE a.status = 'published'
        AND (search_query IS NULL OR search_query = '' OR (
            lower(a.title) LIKE lower('%' || search_query || '%') OR
            lower(a.excerpt) LIKE lower('%' || search_query || '%') OR
            lower(a.content::text) LIKE lower('%' || search_query || '%') OR
            lower(p.full_name) LIKE lower('%' || search_query || '%') OR
            lower(c.name) LIKE lower('%' || search_query || '%')
        ))
        AND (category_slugs = '{}' OR c.slug = ANY(category_slugs))
        AND (tag_slugs = '{}' OR EXISTS (
            SELECT 1 FROM article_tags at2
            JOIN tags t2 ON at2.tag_id = t2.id
            WHERE at2.article_id = a.id AND t2.slug = ANY(tag_slugs)
        ))
        AND (filter_slugs = '{}' OR EXISTS (
            SELECT 1 FROM article_filters af2
            JOIN filters f2 ON af2.filter_id = f2.id
            WHERE af2.article_id = a.id AND f2.slug = ANY(filter_slugs)
        ))
        AND (date_start IS NULL OR a.published_at >= date_start)
        AND (date_end IS NULL OR a.published_at <= date_end)
        AND (reading_time_min IS NULL OR a.reading_time >= reading_time_min)
        AND (reading_time_max IS NULL OR a.reading_time <= reading_time_max);
    
    RETURN result_count;
END;
$$;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_articles_search_title ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_search_excerpt ON articles USING gin(to_tsvector('english', excerpt));
CREATE INDEX IF NOT EXISTS idx_articles_search_content ON articles USING gin(to_tsvector('english', content::text));
CREATE INDEX IF NOT EXISTS idx_articles_published_status ON articles(published_at, status);
CREATE INDEX IF NOT EXISTS idx_articles_reading_time ON articles(reading_time);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);

-- Create composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_articles_category_published ON articles(category_id, published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_article_tags_lookup ON article_tags(article_id, tag_id);
CREATE INDEX IF NOT EXISTS idx_article_filters_lookup ON article_filters(article_id, filter_id);