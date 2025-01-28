import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { Storage } from '@google-cloud/storage'

// Initialiser Google Cloud Storage med service account credentials
const storage = new Storage({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
  projectId: process.env.GOOGLE_CLOUD_PROJECT
})

const bucket = storage.bucket('innutio-hms')

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json({ error: "Mangler filsti" }, { status: 400 })
    }

    // Hent filen fra bucket
    const file = bucket.file(path)
    const [exists] = await file.exists()
    
    if (!exists) {
      return NextResponse.json({ error: "Fil ikke funnet" }, { status: 404 })
    }

    // Les filinnholdet
    const [fileContent] = await file.download()

    // Send filen tilbake til klienten
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=${path.split('/').pop()}`
      }
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente fil" },
      { status: 500 }
    )
  }
} 