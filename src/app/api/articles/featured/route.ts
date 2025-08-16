import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/articles/featured - Get featured articles (latest published with featured images)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1')

    // Return empty data if tables don't exist yet
    return NextResponse.json({
      data: []
    })
  } catch (error) {
    console.error('Error in GET /api/articles/featured:', error)
    return NextResponse.json({
      data: []
    })
  }
}