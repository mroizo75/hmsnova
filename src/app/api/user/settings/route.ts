import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const data = await request.json()

    const settings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id,
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? true,
        dailyDigest: data.dailyDigest ?? false,
        weeklyDigest: data.weeklyDigest ?? true,
        colorMode: data.colorMode ?? "default"
      },
      update: {
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        dailyDigest: data.dailyDigest,
        weeklyDigest: data.weeklyDigest,
        colorMode: data.colorMode
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere innstillinger" },
      { status: 500 }
    )
  }
} 