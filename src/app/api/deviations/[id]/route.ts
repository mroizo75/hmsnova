import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"

const updateDeviationSchema = z.object({
  status: z.enum(["AAPEN", "PAAGAAR", "FULLFOERT", "LUKKET"]),
  comment: z.string().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  context: RouteParams
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

    const { id } = await context.params

    const deviation = await prisma.deviation.update({
      where: { id },
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
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const deviation = await prisma.deviation.findUnique({
      where: { id },
      include: {
        measures: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        images: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        hmsChanges: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!deviation) {
      return NextResponse.json({ error: "Avvik ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(deviation)
  } catch (error) {
    console.error('Error fetching deviation:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente avvik" },
      { status: 500 }
    )
  }
} 