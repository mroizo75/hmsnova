import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { InputJsonValue } from "@prisma/client/runtime/library"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { fromVersion, companyId } = await request.json()
    console.log('API received:', { fromVersion, companyId })

    // Hent eksisterende håndbok
    const currentHandbook = await prisma.hMSHandbook.findFirst({
      where: {
        companyId,
        version: fromVersion  // Bruk versjonsnummeret direkte
      },
      include: {
        sections: {
          include: {
            subsections: true,
            changes: true
          }
        }
      }
    })

    if (!currentHandbook) {
      return new NextResponse(JSON.stringify({ error: "No handbook found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Opprett ny kladd
    const draft = await prisma.hMSHandbook.create({
      data: {
        title: currentHandbook.title,
        description: currentHandbook.description,
        company: {
          connect: { id: currentHandbook.companyId }
        },
        createdBy: {
          connect: { id: session.user.id }
        },
        status: 'DRAFT',
        version: fromVersion + 1,
        sections: {
          create: currentHandbook.sections.map(section => ({
            title: section.title,
            content: section.content as InputJsonValue,
            order: section.order,
            subsections: section.subsections.length > 0 ? {
              create: section.subsections.map(sub => ({
                title: sub.title,
                content: sub.content as InputJsonValue,
                handbookId: currentHandbook.id,
                order: sub.order
              }))
            } : undefined
          }))
        }
      }
    })

    return new NextResponse(JSON.stringify(draft), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("[CREATE_DRAFT]", error)
    return new NextResponse(JSON.stringify({ error: "Internal Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 