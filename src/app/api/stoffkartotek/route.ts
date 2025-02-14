import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const produkter = await prisma.stoffkartotek.findMany({
      where: {
        companyId: session.user.companyId
      },
      select: {
        id: true,
        produktnavn: true,
        produsent: true,
        databladUrl: true,
        beskrivelse: true,
        bruksomrade: true,
        fareSymboler: {
          select: {
            id: true,
            symbol: true
          }
        },
        ppeSymboler: {
          select: {
            id: true,
            symbol: true
          }
        }
      },
      orderBy: {
        produktnavn: 'asc'
      }
    })

    console.log("API sending data:", produkter) // Debug

    return NextResponse.json(produkter)
  } catch (error) {
    console.error("Error fetching stoffkartotek:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente stoffkartotek" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()

    // Sjekk at vi har companyId
    if (!session.user.companyId) {
      console.error("Missing companyId for user:", session.user.id)
      return new NextResponse("Missing company ID", { status: 400 })
    }

    const product = await prisma.stoffkartotek.create({
      data: {
        produktnavn: data.produktnavn,
        produsent: data.produsent,
        databladUrl: data.databladUrl,
        beskrivelse: data.beskrivelse,
        bruksomrade: data.bruksomrade,
        companyId: session.user.companyId,
        opprettetAvId: session.user.id,
        fareSymboler: {
          create: data.fareSymboler
        },
        ppeSymboler: {
          create: data.ppeSymboler
        }
      },
      include: {
        fareSymboler: true,
        ppeSymboler: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("API Error:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    )
  }
} 