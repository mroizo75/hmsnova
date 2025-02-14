import { Storage } from '@google-cloud/storage'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { v4 as uuidv4 } from 'uuid'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("=== UPLOAD API START ===")
    console.log("Session:", {
      userId: session?.user?.id,
      email: session?.user?.email
    })
    
    if (!session?.user?.id) {
      console.log("No session found")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string
    const type = formData.get('type') as string

    console.log("Received upload request:", {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      companyId,
      type
    })

    if (!file || !companyId) {
      console.log("Missing required fields:", { file: !!file, companyId: !!companyId })
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const path = `companies/${companyId}/${type}/${session.user.id}/${fileName}`
    
    const blob = bucket.file(path)

    await blob.save(buffer, {
      contentType: file.type,
      metadata: {
        contentType: file.type,
      },
    })

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`
    console.log("Generated public URL:", publicUrl)
    
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Upload failed', 
        details: error,
        message: 'Kunne ikke laste opp bilde. Kontakt support hvis problemet vedvarer.' 
      }), 
      { status: 500 }
    )
  }
}

// Legg til config for å øke maks filstørrelse hvis nødvendig
export const config = {
  api: {
    bodyParser: false,
    maxDuration: 60, // 60 sekunder timeout
  },
} 