import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, address, image, certifications } = body

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { metadata: true }
    })

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name,
        email,
        phone,
        image,
        address: address ? address : Prisma.JsonNull,
        certifications: {
          machineCards: certifications?.machineCards || [],
          driverLicenses: certifications?.driverLicenses || []
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 