import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "Ingen fil lastet opp" }, { status: 400 })
    }

    // Generer en unik filsti i bucket
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `companies/${session.user.companyId}/datablader/${timestamp}-${safeFileName}`

    try {
      const url = await uploadToStorage(file, path, session.user.companyId)
      
      return NextResponse.json({ url })
    } catch (error) {
      console.error('Feil ved opplasting til Google Cloud Storage:', error)
      return NextResponse.json({ 
        error: "Kunne ikke laste opp fil til lagring",
        message: error instanceof Error ? error.message : 'Ukjent feil'
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Feil ved opplasting av fil:", error)
    return NextResponse.json({
      error: "Kunne ikke laste opp fil",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
} 