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
    console.log("1. Starting SJA behandling...")
    
    const session = await getServerSession(authOptions)
    console.log("2. Session:", JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    console.log("3. Request body:", JSON.stringify(body, null, 2))
    const { status, kommentar } = body

    console.log("4. Validating status:", status)
    if (!status || !Object.values(SJAStatus).includes(status)) {
      console.log("Invalid status:", status)
      return NextResponse.json(
        { error: "Ugyldig status" },
        { status: 400 }
      )
    }

    console.log("5. Finding SJA with id:", id)
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
    console.log("6. Found SJA:", JSON.stringify(sja, null, 2))

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    console.log("7. Starting transaction...")
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

    console.log("8. Transaction completed successfully")
    console.log("Godkjenning:", JSON.stringify(godkjenning, null, 2))
    console.log("Oppdatert SJA:", JSON.stringify(oppdatertSja, null, 2))

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