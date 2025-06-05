import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('axon_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      success: true, 
      logs: data 
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
