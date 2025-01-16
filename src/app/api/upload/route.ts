import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { uploadToStorage } from "@/lib/storage"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "Ingen fil lastet opp" }, { status: 400 })
    }

    // Generer en unik filsti med bedrifts-ID for å isolere filer per bedrift
    const filePath = `${session.user.companyId}/sja/${nanoid()}-${file.name}`
    
    // Last opp til Google Cloud Storage
    const path = await uploadToStorage(file, filePath)

    // Konstruer full URL
    const url = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${path}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Kunne ikke laste opp fil" },
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