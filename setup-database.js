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

async function runMigration(migrationFile) {
  console.log(`Running migration: ${migrationFile}`)
  
  try {
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Split SQL by statements (basic approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`Error executing statement: ${error.message}`)
          // Continue with other statements
        }
      }
    }
    
    console.log(`✅ Migration ${migrationFile} completed`)
  } catch (error) {
    console.error(`❌ Error running migration ${migrationFile}:`, error.message)
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Monday Sippin\' database...')
  
  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (!error) {
      console.log('✅ Database already set up!')
      return
    }
  } catch (e) {
    // Database not set up yet, continue
  }
  
  // Run migrations in order
  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_indexes.sql',
    '004_functions.sql',
    '005_filter_functions.sql',
    '006_homepage_functions.sql'
  ]
  
  for (const migration of migrations) {
    await runMigration(migration)
  }
  
  console.log('🎉 Database setup complete!')
  console.log('You can now run your Next.js app and test authentication.')
}

// Alternative approach using direct SQL execution
async function setupDatabaseDirect() {
  console.log('🚀 Setting up database with direct SQL...')
  
  // Read the initial schema
  const schemaPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  
  try {
    // Execute the schema directly
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('Error setting up schema:', error)
      
      // Try alternative approach - create tables individually
      console.log('Trying alternative setup...')
      await createTablesIndividually()
    } else {
      console.log('✅ Schema created successfully!')
    }
  } catch (error) {
    console.error('Error:', error.message)
    console.log('Trying alternative setup...')
    await createTablesIndividually()
  }
}

async function createTablesIndividually() {
  console.log('Creating tables individually...')
  
  // Create profiles table
  const createProfilesTable = `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'reader' CHECK (role IN ('admin', 'editor', 'author', 'reader')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createProfilesTable })
    if (error) {
      console.error('Error creating profiles table:', error)
    } else {
      console.log('✅ Profiles table created')
    }
  } catch (e) {
    console.error('Error:', e.message)
  }
}

// Run setup
if (require.main === module) {
  setupDatabaseDirect()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupDatabase, setupDatabaseDirect }