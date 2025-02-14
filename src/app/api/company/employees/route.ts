import { authOptions } from "@/lib/auth/auth-options"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: { 
        companyId: session.user.companyId 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        address: true,
        certifications: true,
        createdAt: true
      }
    })

    const formattedUsers = users.map(user => {
      // Parse certifications hvis det er en string
      let certData = user.certifications
      if (typeof certData === 'string') {
        try {
          certData = JSON.parse(certData)
        } catch (error) {
          console.error("Failed to parse certifications:", error)
          certData = { machineCards: [], driverLicenses: [] }
        }
      }

      return {
        ...user,
        certifications: certData || { machineCards: [], driverLicenses: [] }
      }
    })

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("API Error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 