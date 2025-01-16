import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { type, columns, dateFrom, dateTo, companyId } = await req.json()
    const db = await prisma

    const dateFilter = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) })
    }

    let data: any[] = []
    
    switch (type) {
      case 'deviations':
        data = await db.deviation.findMany({
          where: {
            companyId,
            ...(Object.keys(dateFilter).length > 0 && {
              createdAt: dateFilter
            })
          },
          select: columns.reduce((acc: any, col: string) => {
            acc[col] = true
            return acc
          }, {}),
          orderBy: {
            createdAt: 'desc'
          }
        })
        break

      case 'risks':
        data = await db.riskAssessment.findMany({
          where: {
            companyId,
            ...(Object.keys(dateFilter).length > 0 && {
              createdAt: dateFilter
            })
          },
          select: columns.reduce((acc: any, col: string) => {
            acc[col] = true
            return acc
          }, {}),
          orderBy: {
            createdAt: 'desc'
          }
        })
        break

      // Legg til flere case for andre rapporttyper
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating custom report:", error)
    return NextResponse.json(
      { message: "Kunne ikke generere rapport" },
      { status: 500 }
    )
  }
} 