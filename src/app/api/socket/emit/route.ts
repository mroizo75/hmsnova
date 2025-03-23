import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { getIO } from "@/lib/socket/store"

export async function POST(req: NextRequest) {
  try {
    // Verifiser at brukeren har rettigheter (admin eller lignende)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        error: "Uautentisert"
      }, { status: 401 })
    }

    // Sjekk om brukeren er admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({
        error: "Ikke autorisert til å utløse socket-hendelser"
      }, { status: 403 })
    }

    const io = getIO()
    if (!io) {
      return NextResponse.json({
        error: "Socket.io-server er ikke tilgjengelig"
      }, { status: 500 })
    }

    // Hent data fra forespørselen
    const data = await req.json()
    const { event, payload, companyId } = data

    // Valider påkrevde felt
    if (!event) {
      return NextResponse.json({
        error: "Hendelsesnavn (event) er påkrevd"
      }, { status: 400 })
    }

    // Hvis companyId er angitt, send til spesifikk bedrift
    if (companyId) {
      io.to(`company-${companyId}`).emit(event, payload || {})
      return NextResponse.json({
        success: true,
        message: `Hendelse '${event}' sendt til bedrift ${companyId}`
      })
    }

    // Ellers send til alle
    io.emit(event, payload || {})
    return NextResponse.json({
      success: true,
      message: `Hendelse '${event}' kringkastet til alle klienter`
    })
  } catch (error) {
    console.error("Feil ved sending av socket-hendelse:", error)
    return NextResponse.json({
      error: "Kunne ikke sende socket-hendelse"
    }, { status: 500 })
  }
} 