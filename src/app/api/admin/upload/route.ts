import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { uploadToStorage } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: "Ingen fil lastet opp" }, { status: 400 })
    }

    // Generer en unik filsti for avataren
    const timestamp = Date.now()
    const path = `avatars/${timestamp}-${file.name}`
    
    // Last opp filen
    const filePath = await uploadToStorage(file, path)

    return NextResponse.json({ path: filePath })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ 
      error: "Kunne ikke laste opp fil",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }, { status: 500 })
  }
} 