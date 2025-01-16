import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
      return new NextResponse("Missing URL parameter", { status: 400 })
    }

    const filePath = url
      .replace('https://storage.cloud.google.com/', '')
      .replace('https://storage.googleapis.com/', '')
      .replace(`${process.env.GOOGLE_CLOUD_BUCKET_NAME}/`, '')

    const [signedUrl] = await storage
      .bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!)
      .file(filePath)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000
      })

    return NextResponse.json({ url: signedUrl })

  } catch (error) {
    console.error("Error generating signed URL:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 