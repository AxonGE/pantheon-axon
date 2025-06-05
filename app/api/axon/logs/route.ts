import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

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
      .from('axon_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100) // Limit to last 100 logs
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      success: true, 
      logs: data || [] 
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
