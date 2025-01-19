import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import sendEmail from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await params
    const { kundeNavn, kundeEpost } = await request.json()

    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    const kundeGodkjenning = await prisma.sJAKundeGodkjenning.create({
      data: {
        sjaId: id,
        kundeNavn,
        kundeEpost
      }
    })

    // Send epost til kunde
    await sendEmail({
      to: kundeEpost,
      subject: "SJA til godkjenning",
      html: `<p>Hei ${kundeNavn},</p><p>Vennligst gjennomgå og godkjenn SJA for prosjektet.</p><p>Med vennlig hilsen<br>${session.user.name}</p>`
    })

    return NextResponse.json(kundeGodkjenning)
  } catch (error) {
    console.error("Feil ved opprettelse av kundegodkjenning:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette kundegodkjenning" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { godkjent, kommentar } = await request.json()

    const kundeGodkjenning = await prisma.sJAKundeGodkjenning.update({
      where: { sjaId: id },
      data: {
        godkjentDato: godkjent ? new Date() : null,
        avvistDato: !godkjent ? new Date() : null,
        kommentar
      }
    })

    return NextResponse.json(kundeGodkjenning)
  } catch (error) {
    console.error("Feil ved oppdatering av kundegodkjenning:", error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere kundegodkjenning" },
      { status: 500 }
    )
  }
} 