import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { uploadToStorage } from "@/lib/storage"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await context.params
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    // Sjekk tilgang til SJA
    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return new NextResponse("SJA not found", { status: 404 })
    }

    // Last opp fil til storage
    const url = await uploadToStorage(file, `sja/${id}/vedlegg/${file.name}`)

    // Lagre vedlegg i database
    const vedlegg = await prisma.sJAVedlegg.create({
      data: {
        sjaId: id,
        type: file.type,
        url: url as string,
        navn: file.name,
        lastetOppDato: new Date(),
        lastetOppAvId: session.user.id
      }
    })

    // Logg opplastingen
    await prisma.auditLog.create({
      data: {
        action: "UPLOAD_SJA_VEDLEGG",
        entityType: "SJA_VEDLEGG",
        entityId: vedlegg.id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      }
    })

    return NextResponse.json(vedlegg)
  } catch (error) {
    console.error("Error uploading attachment:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 