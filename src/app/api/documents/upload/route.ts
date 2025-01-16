import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const metadata = JSON.parse(formData.get('metadata') as string)
    
    if (!file) {
      return NextResponse.json({ error: "Ingen fil lastet opp" }, { status: 400 })
    }

    // Her bør du implementere faktisk filopplasting til f.eks. S3 eller annen lagring
    // For nå bruker vi en midlertidig URL
    const tempUrl = `/uploads/${file.name}` // Dette bør erstattes med faktisk opplasting

    try {
      const document = await prisma.document.create({
        data: {
          name: file.name,
          type,
          url: tempUrl,
          metadata: metadata || {},
          userId: session.user.id,
          companyId: session.user.companyId || '',
        },
      })

      return NextResponse.json({ 
        url: document.url,
        id: document.id 
      })
    } catch (error) {
      console.error('Prisma error:', error)
      throw error
    }

  } catch (error) {
    console.error("Feil ved opplasting av dokument:", error)
    return NextResponse.json({
      error: "Kunne ikke laste opp dokument",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
} 