import { NextRequest, NextResponse } from 'next/server'
import { filterService } from '@/lib/database'
import { supabase } from '@/lib/supabase'

// GET /api/filters - Get hierarchical filter structure with optional article counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCounts = searchParams.get('includeCounts') === 'true'
    const getStats = searchParams.get('stats') === 'true'
    
    if (getStats) {
      const stats = await filterService.getFilterStats()
      return NextResponse.json({ data: stats })
    }
    
    const filters = await filterService.getHierarchicalFilters(includeCounts)
    return NextResponse.json({ data: filters })
  } catch (error) {
    console.error('Error in GET /api/filters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    )
  }
}

// POST /api/filters - Create new filter (admin only)
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

    // Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const filterData = await request.json()

    // Validate required fields
    if (!filterData.name || !filterData.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const filter = await filterService.createFilter(filterData)
    return NextResponse.json({ data: filter }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/filters:', error)
    return NextResponse.json(
      { error: 'Failed to create filter' },
      { status: 500 }
    )
  }
}

// PUT /api/filters - Update filter (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Filter ID is required' },
        { status: 400 }
      )
    }

    const filter = await filterService.updateFilter(id, updates)
    return NextResponse.json({ data: filter })
  } catch (error) {
    console.error('Error in PUT /api/filters:', error)
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    )
  }
}

// DELETE /api/filters - Delete filter (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filterId = searchParams.get('id')

    if (!filterId) {
      return NextResponse.json(
        { error: 'Filter ID is required' },
        { status: 400 }
      )
    }

    await filterService.deleteFilter(filterId)
    return NextResponse.json({ message: 'Filter deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/filters:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete filter' },
      { status: 500 }
    )
  }
}