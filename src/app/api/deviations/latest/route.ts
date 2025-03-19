import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import logger from "@/lib/utils/logger"
import { withTimeout } from "@/lib/utils/api-timeout"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      logger.warn('Unauthorized access attempt for latest deviations', { 
        context: 'deviations-api'
      })
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }
    
    logger.info('Fetching latest deviations', {
      context: 'deviations-api',
      data: { companyId: session.user.companyId }
    })

    // Søk etter avvik med én enkelt spørring
    const latestDeviations = await withTimeout(
      prisma.deviation.findMany({
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
      }),
      5000,
      'Henting av siste avvik tok for lang tid'
    )

    // Hent brukerinformasjon i én samlet spørring (løser N+1-problemet)
    const userIds = [...new Set(latestDeviations.map(dev => dev.reportedBy))];
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Formater dataene med brukerdata fra samlet spørring
    const formattedDeviations = latestDeviations.map(dev => {
      const user = users.find(u => u.id === dev.reportedBy);
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
    })
    
    logger.info('Successfully fetched latest deviations', {
      context: 'deviations-api',
      data: { count: formattedDeviations.length }
    })

    return NextResponse.json(formattedDeviations, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Error fetching latest deviations', {
      context: 'deviations-api',
      error: error instanceof Error ? error : new Error(errorMessage)
    })
    
    return NextResponse.json(
      { error: "Kunne ikke hente siste avvik" },
      { status: 500 }
    )
  }
} 