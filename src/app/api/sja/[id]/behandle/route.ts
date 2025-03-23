import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { SJAStatus } from "@prisma/client"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { status, kommentar, redirect } = body

    if (!status || !Object.values(SJAStatus).includes(status)) {
      return NextResponse.json(
        { error: "Ugyldig status" },
        { status: 400 }
      )
    }

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

    const [godkjenning, oppdatertSja] = await prisma.$transaction([
      prisma.sJAGodkjenning.create({
        data: {
          sjaId: id,
          godkjentAvId: session.user.id,
          rolle: "HMS-ansvarlig", // Kan være dynamisk basert på brukerrolle
          status: status as SJAStatus,
          kommentar
        }
      }),
      prisma.sJA.update({
        where: { id },
        data: {
          status: status as SJAStatus
        }
      })
    ])

    // Hvis redirect parameter er spesifisert, omdiriger brukeren
    if (redirect) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hmsnova.com"
      return NextResponse.redirect(`${baseUrl}${redirect}`, { status: 303 })
    }

    return NextResponse.json({ 
      success: true,
      godkjenning, 
      sja: oppdatertSja 
    })

  } catch (error) {
    console.error("Error in behandle route:", error)
    return NextResponse.json(
      { error: "Kunne ikke behandle SJA" },
      { status: 500 }
    )
  }
} 