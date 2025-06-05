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
      .from('axon_symbolic_fragments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      success: true, 
      fragments: data || [] 
    })
  } catch (error) {
    console.error('Error fetching symbolic fragments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch symbolic fragments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const fragment = await request.json()
    
    if (!fragment.key || !fragment.value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
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
      .from('axon_symbolic_fragments')
      .insert({
        key: fragment.key,
        value: fragment.value,
        tags: fragment.tags || [],
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
      `Created new symbolic fragment: ${fragment.key}`, 
      ['system', 'symbolic', 'create']
    )
    
    return NextResponse.json({ 
      success: true, 
      fragment: data 
    })
  } catch (error) {
    console.error('Error creating symbolic fragment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create symbolic fragment' },
      { status: 500 }
    )
  }
}
