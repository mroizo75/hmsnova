import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const latestDeviations = await prisma.deviation.findMany({
      where: {
        companyId: session.user.companyId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        createdAt: true,
        reportedBy: true
      }
    })

    // Formater dataene for frontend
    const formattedDeviations = await Promise.all(latestDeviations.map(async dev => {
      const user = await prisma.user.findUnique({
        where: { id: dev.reportedBy },
        select: { name: true, email: true }
      })
      
      return {
        id: dev.id,
        title: dev.title,
        status: dev.status,
        severity: dev.severity,
        createdAt: dev.createdAt,
        reportedBy: {
          name: user?.name ?? 'Ukjent',
          email: user?.email ?? ''
        }
      }
    }))

    return NextResponse.json(formattedDeviations, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error fetching latest deviations:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente siste avvik" },
      { status: 500 }
    )
  }
} 