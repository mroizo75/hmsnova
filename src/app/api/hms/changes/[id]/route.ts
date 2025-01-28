import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const change = await prisma.hMSChange.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!change) {
      return NextResponse.json({ message: "Change not found" }, { status: 404 })
    }

    return NextResponse.json(change)
  } catch (error) {
    console.error("Error fetching change:", error)
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    )
  }
} 