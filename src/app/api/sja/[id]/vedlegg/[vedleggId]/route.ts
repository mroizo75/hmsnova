import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { getSignedUrl } from "@/lib/storage"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; vedleggId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const vedlegg = await prisma.sJAVedlegg.findFirst({
      where: {
        id: params.vedleggId,
        sjaId: params.id,
        sja: {
          company: {
            users: {
              some: {
                id: session.user.id
              }
            }
          }
        }
      }
    })

    if (!vedlegg) {
      return new NextResponse("Not found", { status: 404 })
    }

    const signedUrl = await getSignedUrl(vedlegg.url)
    
    // Hent bildet fra Google Cloud Storage og videresend det
    const response = await fetch(signedUrl)
    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        'Content-Type': vedlegg.type || 'application/octet-stream',
        'Cache-Control': 'public, max-age=300'
      }
    })

  } catch (error) {
    console.error("Error fetching attachment:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 