import { NextRequest, NextResponse } from 'next/server'
import { tagService } from '@/lib/database'
import { supabase } from '@/lib/supabase'

// GET /api/tags - Get all tags
export async function GET() {
  try {
    const tags = await tagService.getAllTags()
    return NextResponse.json({ data: tags })
  } catch (error) {
    console.error('Error in GET /api/tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create new tag (admin/editor/author)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'editor', 'author'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const tagData = await request.json()

    // Validate required fields
    if (!tagData.name || !tagData.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const tag = await tagService.createTag(tagData)
    return NextResponse.json({ data: tag }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tags:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}