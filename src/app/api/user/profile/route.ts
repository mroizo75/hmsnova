import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, address, certifications } = body

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name,
        email,
        phone,
        address,
        certifications: {
          machineCards: certifications.machineCards,
          driverLicenses: certifications.driverLicenses
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        address: true,
        certifications: true,
        companyId: true,
        competencies: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Uautentisert", { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, address, image, certifications, competencies } = body

    // Oppdater brukerinformasjon
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        email,
        phone,
        address,
        image,
        certifications,
      },
      include: {
        competencies: true
      }
    })

    // Håndter kompetanse
    if (competencies) {
      // Slett eksisterende kompetanse
      await prisma.competency.deleteMany({
        where: {
          userId: session.user.id,
        },
      })

      // Opprett nye kompetanser
      await prisma.competency.createMany({
        data: competencies.map((comp: any) => ({
          name: comp.name,
          description: comp.description,
          expiryDate: comp.expiryDate ? new Date(comp.expiryDate) : null,
          certificateNumber: comp.certificateNumber,
          userId: session.user.id,
        })),
      })

      // Hent oppdatert bruker med kompetanse
      const userWithCompetencies = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          competencies: true
        }
      })

      return NextResponse.json(userWithCompetencies)
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[PROFILE_PATCH]", error)
    return new NextResponse("Intern feil", { status: 500 })
  }
} 