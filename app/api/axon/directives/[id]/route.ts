import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { logAction } from '@/lib/axon-core'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const directive = await request.json()
    
    if (!directive.name || !directive.description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('axon_directives')
      .update({
        name: directive.name,
        description: directive.description,
        priority: directive.priority || 1,
        tags: directive.tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Log the action
    await logAction(
      'system', 
      `Updated directive: ${directive.name}`, 
      ['system', 'directive', 'update']
    )
    
    return NextResponse.json({ 
      success: true, 
      directive: data 
    })
  } catch (error) {
    console.error('Error updating directive:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update directive' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const supabase = getSupabaseClient()
    
    // Get the directive name before deleting
    const { data: directive, error: fetchError } = await supabase
      .from('axon_directives')
      .select('name')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    const { error } = await supabase
      .from('axon_directives')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Log the action
    await logAction(
      'system', 
      `Deleted directive: ${directive.name}`, 
      ['system', 'directive', 'delete']
    )
    
    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('Error deleting directive:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete directive' },
      { status: 500 }
    )
  }
}
