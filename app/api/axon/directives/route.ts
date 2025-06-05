import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { logAction } from '@/lib/axon-core'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    const { data, error } = await supabase
      .from('axon_directives')
      .select('*')
      .order('priority', { ascending: false })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      success: true, 
      directives: data || [] 
    })
  } catch (error) {
    console.error('Error fetching directives:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch directives' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const directive = await request.json()
    
    if (!directive.name || !directive.description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    const { data, error } = await supabase
      .from('axon_directives')
      .insert({
        name: directive.name,
        description: directive.description,
        priority: directive.priority || 1,
        tags: directive.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Log the action
    await logAction(
      'system', 
      `Created new directive: ${directive.name}`, 
      ['system', 'directive', 'create']
    )
    
    return NextResponse.json({ 
      success: true, 
      directive: data 
    })
  } catch (error) {
    console.error('Error creating directive:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create directive' },
      { status: 500 }
    )
  }
}
