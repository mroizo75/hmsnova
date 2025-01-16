import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { uploadToStorage } from "@/lib/storage"
import prisma from "@/lib/db"

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    // Sjekk om brukeren er admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Kun administratorer kan laste opp vedlegg" },
        { status: 403 }
      )
    }

    const { id } = context.params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string

    if (!file) {
      return NextResponse.json({ error: "Ingen fil lastet opp" }, { status: 400 })
    }

    // Sjekk om SJA eksisterer og tilhører riktig bedrift
    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `sja-vedlegg/${sja.companyId}/${id}/${timestamp}-${safeFileName}`

    const url = await uploadToStorage(file, path)
    
    const vedlegg = await prisma.sJAVedlegg.create({
      data: {
        navn: caption || file.name,
        url,
        type: file.type,
        storrelse: file.size.toString(),
        sjaId: id,
        lastetOppAv: session.user.id
      }
    })

    return NextResponse.json(vedlegg)
  } catch (error) {
    console.error("Feil ved opplasting av vedlegg:", error)
    return NextResponse.json(
      { 
        error: "Kunne ikke laste opp vedlegg",
        details: error instanceof Error ? error.message : "Ukjent feil"
      },
      { status: 500 }
    )
  }
} 