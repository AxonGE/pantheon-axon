import { NextResponse } from 'next/server'
import { handleNexusSync, logAction } from '@/lib/axon-core'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.action || !data.payload) {
      return NextResponse.json(
        { success: false, error: 'Action and payload are required' },
        { status: 400 }
      )
    }
    
    // Log the incoming sync request
    await logAction(
      'nexus', 
      `Received sync request: ${data.action}`, 
      ['nexus', 'sync', data.action]
    )
    
    // Handle the sync request
    const result = await handleNexusSync(data)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error handling Nexus sync:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to handle Nexus sync' },
      { status: 500 }
    )
  }
}
