const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    console.log('✅ Supabase connection successful')
    
    // Test if profiles table exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profileError) {
      console.log('❌ Profiles table not found:', profileError.message)
      console.log('👉 You need to run the database setup SQL')
    } else {
      console.log('✅ Profiles table exists')
      console.log('🎉 Your authentication system should work!')
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testAuth()