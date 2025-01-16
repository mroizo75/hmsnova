import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { deleteFromStorage } from "@/lib/storage"

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const data = await request.json()
    
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        avatar: true
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Administrator ikke funnet" }, { status: 404 })
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ 
          error: "Nåværende passord må oppgis" 
        }, { status: 400 })
      }

      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        existingUser.password
      )

      if (!isValidPassword) {
        return NextResponse.json({ 
          error: "Feil passord" 
        }, { status: 400 })
      }
    }

    if (data.avatar && data.avatar !== existingUser.avatar && existingUser.avatar) {
      try {
        await deleteFromStorage(existingUser.avatar)
      } catch (error) {
        console.error('Failed to delete old avatar:', error)
      }
    }

    const updateData: any = {
      name: data.name,
      phone: data.phone,
      avatar: data.avatar || null
    }

    if (data.newPassword) {
      updateData.password = await bcrypt.hash(data.newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json({ 
      error: "Kunne ikke oppdatere innstillinger",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }, { status: 500 })
  }
} 