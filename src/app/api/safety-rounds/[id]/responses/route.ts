import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { checklistItemId, response, comment } = await req.json()

    const updated = await prisma.safetyRoundChecklistItem.update({
      where: {
        id: checklistItemId,
      },
      data: {
        response,
        comment,
        completedAt: new Date(),
        completedBy: session.user.id
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 