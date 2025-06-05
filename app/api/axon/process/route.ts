import { NextResponse } from 'next/server'
import { processMessage } from '@/lib/axon-core'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const response = await processMessage(message)
    
    return NextResponse.json({ 
      success: true, 
      response 
    })
  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
