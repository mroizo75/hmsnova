import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

// POST /api/hms-handbook/sections
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { handbookId, parentId, title, content } = body
    const db = await prisma

    // Sjekk om brukeren har tilgang til håndboken
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
        { message: "Ikke tilgang til denne håndboken" },
        { status: 403 }
      )
    }

    // Finn høyeste order-nummer for seksjoner på samme nivå
    const maxOrder = await db.hMSSection.findFirst({
      where: {
        handbookId,
        parentId: parentId || null
      },
      orderBy: {
        order: 'desc'
      },
      select: {
        order: true
      }
    })

    // Opprett ny seksjon
    const newSection = await db.hMSSection.create({
      data: {
        title,
        content,
        handbookId,
        parentId: parentId || null,
        order: (maxOrder?.order || 0) + 1
      }
    })

    // Oppdater versjonsnummer på håndboken
    await db.hMSHandbook.update({
      where: { id: handbookId },
      data: {
        version: {
          increment: 1
        }
      }
    })

    return NextResponse.json(newSection, { status: 201 })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json(
      { message: "Kunne ikke opprette seksjon" },
      { status: 500 }
    )
  }
} 