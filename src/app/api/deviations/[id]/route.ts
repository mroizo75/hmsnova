import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"

const updateDeviationSchema = z.object({
  status: z.enum(["AAPEN", "PAAGAAR", "FULLFOERT", "LUKKET"]),
  comment: z.string().optional()
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Ikke autorisert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await request.json()
    const { status, comment } = data

    // Hent id fra params asynkront
    const { id } = await params

    const deviation = await prisma.deviation.update({
      where: { id },  // Bruker den asynkrone id-en her
      data: {
        status,
        ...(comment && { closeComment: comment }),
        ...(status === "LUKKET" && {
          closedAt: new Date(),
          closedBy: session.user.id
        })
      }
    })

    return new Response(JSON.stringify(deviation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Error in PATCH handler:", error)
    return new Response(JSON.stringify({
      error: "Kunne ikke oppdatere avvik",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const db = await prisma

    const deviation = await db.deviation.findUnique({
      where: {
        id: params.id,
        company: {
          users: {
            some: {
              id: session?.user.id
            }
          }
        }
      },
      include: {
        measures: true,
        images: true
      }
    })

    if (!deviation) {
      return NextResponse.json(
        { error: "Avvik ikke funnet" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: deviation })
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente avvik" },
      { status: 500 }
    )
  }
} 