import { NextResponse } from 'next/server'
import { getAxonIdentity } from '@/lib/axon-core'

export async function GET() {
  try {
    const identity = await getAxonIdentity()
    
    return NextResponse.json({ 
      success: true, 
      message: identity 
    })
  } catch (error) {
    console.error('Error fetching Axon identity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Axon identity' },
      { status: 500 }
    )
  }
}
