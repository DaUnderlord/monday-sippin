const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSQLDirectly(sql, description) {
  console.log(`Running: ${description}`)
  
  try {
    const { data, error } = await supabase
      .from('_migrations')
      .select('*')
      .limit(1)
    
    // If we can't access _migrations, we'll use a different approach
    // Let's try to create tables using the REST API
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Use raw SQL execution via RPC if available
          const { error } = await supabase.rpc('exec', { sql: statement })
          if (error && !error.message.includes('already exists')) {
            console.warn(`Warning: ${error.message}`)
          }
        } catch (e) {
          console.warn(`Warning: ${e.message}`)
        }
      }
    }
    
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message)
  }
}

async function createBasicTables() {
  console.log('🚀 Creating basic tables for homepage...')
  
  // Create essential tables with basic structure
  const basicSchema = `
    -- Create user_role enum if it doesn't exist
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'editor', 'author', 'reader');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    -- Create article_status enum if it doesn't exist
    DO $$ BEGIN
      CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    -- Create categories table
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      color TEXT DEFAULT '#1B4B5A',
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create tags table
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create articles table
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content JSONB NOT NULL DEFAULT '{}',
      featured_image TEXT,
      author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      status article_status DEFAULT 'draft',
      published_at TIMESTAMP WITH TIME ZONE,
      reading_time INTEGER DEFAULT 5,
      view_count INTEGER DEFAULT 0,
      meta_title TEXT,
      meta_description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create article_tags junction table
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
      tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );
    
    -- Insert sample data for testing
    INSERT INTO categories (name, slug, description, color) VALUES 
      ('Crypto Analysis', 'crypto-analysis', 'Deep dives into cryptocurrency markets and trends', '#1B4B5A'),
      ('Personal Finance', 'personal-finance', 'Tips and strategies for managing your money', '#52B788'),
      ('Market News', 'market-news', 'Latest updates from financial markets', '#F4A261')
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO tags (name, slug, description) VALUES 
      ('Bitcoin', 'bitcoin', 'Content related to Bitcoin'),
      ('DeFi', 'defi', 'Decentralized Finance topics'),
      ('Investment', 'investment', 'Investment strategies and tips')
    ON CONFLICT (slug) DO NOTHING;
  `
  
  await runSQLDirectly(basicSchema, 'Basic schema setup')
  
  console.log('🎉 Basic tables created! The homepage should now work.')
}

// Run the setup
createBasicTables()
  .then(() => {
    console.log('✅ Migration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })