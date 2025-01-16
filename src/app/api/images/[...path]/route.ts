import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { getSignedUrl } from "@/lib/storage"
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { path } = await context.params
    const filePath = decodeURIComponent(path.join('/'))
    
    console.log('Raw file path:', filePath)

    // Fjern eventuell Google Storage URL-prefix
    const cleanPath = filePath.replace(/^https?:\/\/storage\.googleapis\.com\/[^/]+\//, '')
    console.log('Clean path:', cleanPath)

    // Sjekk at brukeren har tilgang til dette bildet
    const pathParts = cleanPath.split('/')
    const companyId = pathParts[0] === 'companies' ? pathParts[1] : null

    if (!companyId || companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Ikke tilgang til dette bildet" }, { status: 403 })
    }

    console.log('Requesting image:', cleanPath)
    const signedUrl = await getSignedUrl(cleanPath)
    
    return NextResponse.redirect(signedUrl)

  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente bilde" },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 