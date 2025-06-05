import { NextResponse } from 'next/server'
import { initializeAxonDatabase, logAction } from '@/lib/axon-core'

export async function GET() {
  try {
    // Initialize Axon database
    await initializeAxonDatabase()
    
    // Log initialization
    await logAction('system', 'Axon initialized', ['system', 'initialization'])
    
    return NextResponse.json({ success: true, message: 'Axon initialized successfully' })
  } catch (error) {
    console.error('Error initializing Axon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize Axon' },
      { status: 500 }
    )
  }
}
