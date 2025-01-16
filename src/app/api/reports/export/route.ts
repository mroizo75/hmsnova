import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { type, format, dateRange } = await req.json()
    const db = await prisma

    // Beregn datointervall
    const now = new Date()
    const startDate = dateRange === '7d' ? new Date(now.setDate(now.getDate() - 7)) :
                     dateRange === '30d' ? new Date(now.setDate(now.getDate() - 30)) :
                     dateRange === '90d' ? new Date(now.setDate(now.getDate() - 90)) :
                     dateRange === '365d' ? new Date(now.setDate(now.getDate() - 365)) :
                     undefined

    // Hent data basert på type
    let data = []
    if (type === 'deviations' || type === 'all') {
      const deviations = await db.deviation.findMany({
        where: {
          companyId: session.user.companyId,
          createdAt: startDate ? { gte: startDate } : undefined
        },
        include: {
          measures: true
        }
      })
      data.push(...deviations.map(d => ({
        ...d,
        type: 'Avvik'
      })))
    }

    if (type === 'risks' || type === 'all') {
      const risks = await db.riskAssessment.findMany({
        where: {
          companyId: session.user.companyId,
          createdAt: startDate ? { gte: startDate } : undefined
        },
        include: {
          hazards: true
        }
      })
      data.push(...risks.map(r => ({
        ...r,
        type: 'Risikovurdering'
      })))
    }

    // Generer rapport basert på format
    if (format === 'excel') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="rapport-${format(new Date(), 'yyyy-MM-dd', { locale: nb })}.xlsx"`
        }
      })
    }

    // TODO: Implementer PDF og CSV format

    return NextResponse.json(
      { message: "Ugyldig eksportformat" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error exporting report:", error)
    return NextResponse.json(
      { message: "Kunne ikke eksportere rapport" },
      { status: 500 }
    )
  }
} 