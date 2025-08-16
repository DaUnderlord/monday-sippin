import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/articles/trending - Get trending articles based on view count and recent activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Return empty data if tables don't exist yet
    return NextResponse.json({
      data: []
    })
  } catch (error) {
    console.error('Error in GET /api/articles/trending:', error)
    return NextResponse.json({
      data: []
    })
  }
}