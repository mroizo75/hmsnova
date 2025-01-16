import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { hashPassword, verifyPassword } from "@/lib/utils/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()
    const db = await prisma

    // Hent bruker med nåværende passord
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Bruker ikke funnet" },
        { status: 404 }
      )
    }

    // Verifiser nåværende passord
    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { message: "Feil nåværende passord" },
        { status: 400 }
      )
    }

    // Hash og oppdater nytt passord
    const hashedPassword = await hashPassword(newPassword)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json(
      { message: "Passord endret" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { message: "Kunne ikke endre passord" },
      { status: 500 }
    )
  }
} 