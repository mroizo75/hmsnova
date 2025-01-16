import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { sectionId } = await request.json()

    const updated = await prisma.hMSChange.update({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      data: {
        sectionId,
        status: "IN_PROGRESS"
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error assigning HMS change:", error)
    return NextResponse.json(
      { error: "Kunne ikke tilordne HMS-endring" },
      { status: 500 }
    )
  }
} 