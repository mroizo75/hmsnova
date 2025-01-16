import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const handbookId = params.id
    if (!handbookId) {
      return NextResponse.json(
        { message: "Ugyldig handbook ID" },
        { status: 400 }
      )
    }

    const db = await prisma

    // Først sjekk om brukeren har tilgang til håndboken
    const handbook = await db.hMSHandbook.findFirst({
      where: {
        id: handbookId,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    })

    if (!handbook) {
      return NextResponse.json(
        { message: "Ikke autorisert eller håndbok ikke funnet" },
        { status: 403 }
      )
    }
    
    // Hent releases hvis brukeren har tilgang
    const releases = await db.hMSRelease.findMany({
      where: {
        handbookId: handbookId,
      },
      orderBy: {
        version: 'desc'
      },
      select: {
        id: true,
        version: true,
        changes: true,
        reason: true,
        approvedBy: true,
        approvedAt: true,
        createdAt: true
      }
    })

    return NextResponse.json(releases)
  } catch (error) {
    console.error("Error fetching releases:", error)
    return NextResponse.json(
      { message: "Kunne ikke hente versjonshistorikk" },
      { status: 500 }
    )
  }
} 