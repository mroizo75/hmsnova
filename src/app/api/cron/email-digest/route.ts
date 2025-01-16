import { NextResponse } from 'next/server'
import { sendDailyDigest, sendWeeklyDigest } from '@/lib/services/email-digest-service'

export async function POST(req: Request) {
  try {
    const { type } = await req.json()
    
    if (type === 'daily') {
      await sendDailyDigest()
    } else if (type === 'weekly') {
      await sendWeeklyDigest()
    } else {
      throw new Error('Invalid digest type')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error running email digest:', error)
    return NextResponse.json(
      { error: 'Could not send email digest' },
      { status: 500 }
    )
  }
} 