import { NextResponse } from "next/server"
import { getSignedUrl } from "@/lib/storage"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    const signedUrl = await getSignedUrl(url)
    return NextResponse.json({ signedUrl })
  } catch (error) {
    console.error('Error getting signed URL:', error)
    return new NextResponse("Error getting signed URL", { status: 500 })
  }
} 