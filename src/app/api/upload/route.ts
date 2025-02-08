import { Storage } from '@google-cloud/storage'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string
    const type = formData.get('type') as string // f.eks. 'profile'
    
    console.log("Received upload request:", {
      fileType: file?.type,
      fileSize: file?.size,
      companyId,
      type
    })

    if (!file || !companyId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const path = `companies/${companyId}/${type}/${session.user.id}/image`
    const blob = bucket.file(path)

    await new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.type,
        },
      })
      
      blobStream.on('error', reject)
      blobStream.on('finish', resolve)
      blobStream.end(buffer)
    })

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`
    return NextResponse.json({ url: publicUrl })

  } catch (error) {
    console.error('Upload error:', error)
    return new NextResponse("Upload failed", { status: 500 })
  }
}

// Legg til config for å øke maks filstørrelse hvis nødvendig
export const config = {
  api: {
    bodyParser: false,
    maxDuration: 60, // 60 sekunder timeout
  },
} 