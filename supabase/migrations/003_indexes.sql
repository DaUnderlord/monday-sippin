-- Performance indexes for better query performance

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_order_index ON categories(order_index);

-- Tags indexes
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- Filters indexes
CREATE INDEX idx_filters_slug ON filters(slug);
CREATE INDEX idx_filters_parent_id ON filters(parent_id);
CREATE INDEX idx_filters_level ON filters(level);
CREATE INDEX idx_filters_order_index ON filters(order_index);

-- Articles indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX idx_articles_reading_time ON articles(reading_time);

-- Composite indexes for common queries
CREATE INDEX idx_articles_status_published_at ON articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_author_status ON articles(author_id, status);
CREATE INDEX idx_articles_category_status ON articles(category_id, status) WHERE status = 'published';

-- Full-text search index on articles
CREATE INDEX idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || COALESCE(content::text, '')));

-- Junction table indexes
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);
CREATE INDEX idx_article_filters_article_id ON article_filters(article_id);
CREATE INDEX idx_article_filters_filter_id ON article_filters(filter_id);

-- Newsletter subscribers indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Partial indexes for active subscribers
CREATE INDEX idx_newsletter_active_subscribers ON newsletter_subscribers(email) WHERE status = 'active';