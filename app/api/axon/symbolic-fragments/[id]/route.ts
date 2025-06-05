import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { logAction } from '@/lib/axon-core'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const fragment = await request.json()
    
    if (!fragment.key || !fragment.value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('axon_symbolic_fragments')
      .update({
        key: fragment.key,
        value: fragment.value,
        tags: fragment.tags || [],
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
      `Updated symbolic fragment: ${fragment.key}`, 
      ['system', 'symbolic', 'update']
    )
    
    return NextResponse.json({ 
      success: true, 
      fragment: data 
    })
  } catch (error) {
    console.error('Error updating symbolic fragment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update symbolic fragment' },
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
    
    // Get the fragment key before deleting
    const { data: fragment, error: fetchError } = await supabase
      .from('axon_symbolic_fragments')
      .select('key')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    const { error } = await supabase
      .from('axon_symbolic_fragments')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Log the action
    await logAction(
      'system', 
      `Deleted symbolic fragment: ${fragment.key}`, 
      ['system', 'symbolic', 'delete']
    )
    
    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('Error deleting symbolic fragment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete symbolic fragment' },
      { status: 500 }
    )
  }
}
