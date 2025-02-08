import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const releases = await prisma.hMSRelease.findMany({
      orderBy: {
        version: 'desc'
      }
    })

    return NextResponse.json(releases)
  } catch (error) {
    console.error("[GET_RELEASES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 