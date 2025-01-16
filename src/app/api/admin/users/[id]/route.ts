import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: "Ikke autorisert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await request.json()
    const { id } = await params

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return new Response(JSON.stringify({ error: "Bruker ikke funnet" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return new Response(
      JSON.stringify({ 
        error: "Kunne ikke oppdatere bruker",
        details: error instanceof Error ? error.message : "Ukjent feil"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 