-- Function to get articles that have ALL specified filters
CREATE OR REPLACE FUNCTION get_articles_with_all_filters(filter_ids UUID[])
RETURNS UUID[]
LANGUAGE plpgsql
AS $$
DECLARE
    result UUID[];
BEGIN
    -- If no filters provided, return empty array
    IF array_length(filter_ids, 1) IS NULL THEN
        RETURN ARRAY[]::UUID[];
    END IF;
    
    -- Find articles that have ALL the specified filters
    SELECT ARRAY_AGG(article_id)
    INTO result
    FROM (
        SELECT af.article_id
        FROM article_filters af
        WHERE af.filter_id = ANY(filter_ids)
        GROUP BY af.article_id
        HAVING COUNT(DISTINCT af.filter_id) = array_length(filter_ids, 1)
    ) AS filtered_articles;
    
    -- Return empty array if no results
    IF result IS NULL THEN
        RETURN ARRAY[]::UUID[];
    END IF;
    
    RETURN result;
END;
$$;

-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE articles 
    SET view_count = view_count + 1 
    WHERE id = article_id;
END;
$$;