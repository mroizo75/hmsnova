import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const data = await request.json()
    
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke oppdatere profil" },
      { status: 500 }
    )
  }
} 