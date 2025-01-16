import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("1. Starting GET section changes request")
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("2. No session found")
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id: sectionId } = params
    console.log("3. Section ID:", sectionId)

    const changes = await prisma.hMSChange.findMany({
      where: {
        companyId: session.user.companyId,
        OR: [
          {
            sectionId: sectionId
          },
          {
            status: "PLANNED",
            sectionId: null
          }
        ]
      },
      include: {
        measures: true,
        deviations: {
          include: {
            deviation: {
              select: {
                id: true,
                title: true,
                description: true,
                measures: {
                  select: {
                    id: true,
                    description: true,
                    type: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log("4. Found changes:", changes.length)
    console.log("5. Changes data:", JSON.stringify(changes, null, 2))

    return NextResponse.json(changes)
  } catch (error) {
    console.error("6. Error in GET section changes:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente endringer" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const sectionId = params.id
    const { changeIds } = await request.json()

    console.log("1. Assigning changes to section:", {
      sectionId,
      changeIds
    })

    await prisma.hMSChange.updateMany({
      where: {
        id: {
          in: changeIds
        },
        companyId: session.user.companyId,
        status: "PLANNED"
      },
      data: {
        sectionId,
        status: "IN_PROGRESS"
      }
    })

    console.log("2. Changes assigned successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("3. Error assigning changes:", error)
    return NextResponse.json(
      { error: "Kunne ikke tilordne endringer" },
      { status: 500 }
    )
  }
} 