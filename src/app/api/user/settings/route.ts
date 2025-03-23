import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse, NextRequest } from "next/server"
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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        error: "Uautentisert"
      }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      })
    }

    // Hent brukerens innstillinger
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id
      }
    })

    // Returner standardinnstillinger hvis ingen funnet
    const settings = userSettings || {
      colorMode: 'default',
      language: 'no',
      notifications: true
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("Feil ved henting av brukerinnstillinger:", error)
    return NextResponse.json({
      error: "Kunne ikke hente brukerinnstillinger"
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
  }
} 