import { hash } from "bcryptjs"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Sjekk om det allerede finnes en ADMIN bruker
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Superadmin er allerede opprettet" },
        { status: 400 }
      )
    }

    const { email, password, name } = await req.json()

    // Hash passordet
    const hashedPassword = await hash(password, 12)

    // Opprett superadmin bruker
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        // Lag en dummy-bedrift for admin
        company: {
          create: {
            name: "System Admin",
            orgNumber: "000000000",
            organizationType: "SYSTEM",
            organizationCode: "SYSTEM"
          }
        }
      }
    })

    return NextResponse.json(
      { message: "Superadmin opprettet" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating superadmin:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette superadmin" },
      { status: 500 }
    )
  }
} 