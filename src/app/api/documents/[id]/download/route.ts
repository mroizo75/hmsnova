import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { getSignedUrl } from "@/lib/storage"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Hent dokument og siste versjon
    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      include: {
        versions: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      }
    })

    if (!document || !document.versions[0]) {
      return new NextResponse("Document not found", { status: 404 })
    }

    // Generer signert URL for nedlasting
    const signedUrl = await getSignedUrl(
      document.versions[0].fileUrl,
      60 * 5, // 5 minutter utløpstid
      true // force download
    )

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error('Error downloading document:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 