-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is editor or above
CREATE OR REPLACE FUNCTION is_editor_or_above(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is author or above
CREATE OR REPLACE FUNCTION is_author_or_above(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'editor', 'author')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (is_admin(auth.uid()));

-- Categories policies
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Editors can manage categories" ON categories FOR ALL USING (is_editor_or_above(auth.uid()));

-- Tags policies
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authors can manage tags" ON tags FOR ALL USING (is_author_or_above(auth.uid()));

-- Filters policies
CREATE POLICY "Anyone can view filters" ON filters FOR SELECT USING (true);
CREATE POLICY "Editors can manage filters" ON filters FOR ALL USING (is_editor_or_above(auth.uid()));

-- Articles policies
CREATE POLICY "Anyone can view published articles" ON articles FOR SELECT USING (
  status = 'published' OR 
  auth.uid() = author_id OR 
  is_editor_or_above(auth.uid())
);

CREATE POLICY "Authors can create articles" ON articles FOR INSERT WITH CHECK (
  is_author_or_above(auth.uid()) AND 
  auth.uid() = author_id
);

CREATE POLICY "Authors can update own articles" ON articles FOR UPDATE USING (
  auth.uid() = author_id OR 
  is_editor_or_above(auth.uid())
);

CREATE POLICY "Editors can delete articles" ON articles FOR DELETE USING (
  is_editor_or_above(auth.uid())
);

-- Article tags policies
CREATE POLICY "Anyone can view article tags" ON article_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = article_tags.article_id 
    AND (articles.status = 'published' OR articles.author_id = auth.uid() OR is_editor_or_above(auth.uid()))
  )
);

CREATE POLICY "Authors can manage article tags" ON article_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = article_tags.article_id 
    AND (articles.author_id = auth.uid() OR is_editor_or_above(auth.uid()))
  )
);

-- Article filters policies
CREATE POLICY "Anyone can view article filters" ON article_filters FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = article_filters.article_id 
    AND (articles.status = 'published' OR articles.author_id = auth.uid() OR is_editor_or_above(auth.uid()))
  )
);

CREATE POLICY "Authors can manage article filters" ON article_filters FOR ALL USING (
  EXISTS (
    SELECT 1 FROM articles 
    WHERE articles.id = article_filters.article_id 
    AND (articles.author_id = auth.uid() OR is_editor_or_above(auth.uid()))
  )
);

-- Newsletter subscribers policies
CREATE POLICY "Users can view own subscription" ON newsletter_subscribers FOR SELECT USING (
  auth.jwt() ->> 'email' = email OR is_admin(auth.uid())
);

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own subscription" ON newsletter_subscribers FOR UPDATE USING (
  auth.jwt() ->> 'email' = email OR is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all subscriptions" ON newsletter_subscribers FOR ALL USING (
  is_admin(auth.uid())
);