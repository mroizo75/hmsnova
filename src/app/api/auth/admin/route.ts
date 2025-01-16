import { hash } from "bcryptjs"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json()

    // Sjekk om bruker allerede eksisterer
    const existingUser = await prisma.systemUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bruker eksisterer allerede" },
        { status: 400 }
      )
    }

    // Hash passordet
    const hashedPassword = await hash(password, 12)

    // Opprett ny systemadmin
    const user = await prisma.systemUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    })

    return NextResponse.json(
      { message: "Systemadministrator opprettet" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating system admin:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette systemadministrator" },
      { status: 500 }
    )
  }
} 