import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return new NextResponse("Company ID is required", { status: 400 })
    }

    const versions = await prisma.hMSHandbook.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
        version: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        version: 'desc'
      }
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Error fetching handbook versions:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 